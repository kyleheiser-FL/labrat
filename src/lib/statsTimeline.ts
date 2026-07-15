import { Compound, DoseLog } from '../types';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export interface StatsCompoundRow {
  id: string;
  name: string;
  type: Compound['type'];
  color: string;
  doseLabel: string;
  frequencyLabel: string;
  drawLabel?: string;
  startISO: string;
  endISO: string;
  startLabel: string;
  endLabel: string;
  progressPct: number;
  daysLeft: number;
  loggedCount: number;
  lastLoggedLabel: string;
  status: 'Ending soon' | 'No logs yet' | 'Recently logged' | 'On track' | 'Completed';
}

export interface StatsTimelineRunway {
  startISO: string;
  endISO: string;
  startLabel: string;
  endLabel: string;
  progressPct: number;
  todayPct: number;
}

export interface StatsTimelineSummary {
  activeCount: number;
  overallProgressPct: number;
  daysLeft: number;
  dosesLoggedThisWeek: number;
  totalLogs: number;
}

export interface StatsTimelineViewModel {
  active: StatsCompoundRow[];
  summary: StatsTimelineSummary;
  runway?: StatsTimelineRunway;
}

export interface StatusTone {
  label: StatsCompoundRow['status'];
  chipClass: string;
  barClass: string;
  accentClass: string;
}

const STATUS_TONES: Record<StatsCompoundRow['status'], StatusTone> = {
  'Ending soon': {
    label: 'Ending soon',
    chipClass: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    barClass: 'bg-gradient-to-r from-amber-300 to-orange-400',
    accentClass: 'border-amber-500/30',
  },
  'No logs yet': {
    label: 'No logs yet',
    chipClass: 'border-slate-500/35 bg-slate-500/10 text-slate-300',
    barClass: 'bg-gradient-to-r from-slate-400 to-slate-500',
    accentClass: 'border-slate-500/25',
  },
  'Recently logged': {
    label: 'Recently logged',
    chipClass: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-300',
    barClass: 'bg-gradient-to-r from-cyan-400 to-emerald-400',
    accentClass: 'border-emerald-500/25',
  },
  'On track': {
    label: 'On track',
    chipClass: 'border-cyan-500/35 bg-cyan-500/10 text-cyan-300',
    barClass: 'bg-gradient-to-r from-cyan-400 to-blue-500',
    accentClass: 'border-cyan-500/25',
  },
  Completed: {
    label: 'Completed',
    chipClass: 'border-slate-500/35 bg-slate-500/10 text-slate-300',
    barClass: 'bg-gradient-to-r from-slate-400 to-slate-500',
    accentClass: 'border-slate-500/25',
  },
};

export function getStatusTone(status: StatsCompoundRow['status']): StatusTone {
  return STATUS_TONES[status];
}

const FREQ_LABEL: Record<Compound['frequency'], string> = {
  daily: 'Daily',
  eod: 'Every other day',
  twice_weekly: 'Twice weekly',
  weekly: 'Weekly',
  custom: 'Custom',
};

function parseISODate(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function clampPct(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function daysBetween(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / MS_PER_DAY);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatShortDate(iso: string): string {
  return parseISODate(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDrawNumber(n: number): string {
  return Number.isInteger(n) ? String(n) : String(n);
}

function getEndISO(compound: Compound): string {
  return toISODate(addDays(parseISODate(compound.startDate), compound.durationWeeks * 7));
}

function getProgressPct(startISO: string, endISO: string, todayISO: string): number {
  const start = parseISODate(startISO);
  const end = parseISODate(endISO);
  const today = parseISODate(todayISO);
  const totalDays = Math.max(1, daysBetween(start, end));
  return clampPct((daysBetween(start, today) / totalDays) * 100);
}

function getDaysLeft(endISO: string, todayISO: string): number {
  return Math.max(0, daysBetween(parseISODate(todayISO), parseISODate(endISO)));
}

function isCurrentWeek(dateISO: string, todayISO: string): boolean {
  const today = parseISODate(todayISO);
  const day = today.getDay();
  const start = addDays(today, -day);
  const end = addDays(start, 7);
  const date = parseISODate(dateISO);
  return date >= start && date < end;
}

export function getDrawLabel(compound: Compound): string | undefined {
  if (compound.vialSizeMg && compound.bacWaterMl) {
    const doseMcg = compound.doseUnit === 'mg' ? compound.doseAmount * 1000 : compound.doseAmount;
    const units = Math.round((doseMcg / ((compound.vialSizeMg * 1000) / (compound.bacWaterMl * 100))) * 10) / 10;
    return `draw ${formatDrawNumber(units)} units`;
  }

  if (compound.steroidForm === 'oil' && compound.oilConcMgMl && compound.doseUnit === 'mg') {
    const units = Math.round((compound.doseAmount / compound.oilConcMgMl) * 1000) / 10;
    return `draw ${formatDrawNumber(units)} units`;
  }

  if (compound.steroidForm === 'pill' && compound.pillSizeMg && compound.doseUnit === 'mg') {
    const pills = Math.round((compound.doseAmount / compound.pillSizeMg) * 100) / 100;
    return `${formatDrawNumber(pills)} ${pills === 1 ? 'pill' : 'pills'}`;
  }

  return undefined;
}

function getStatus(compound: Compound, logs: DoseLog[], daysLeft: number, todayISO: string): StatsCompoundRow['status'] {
  if (compound.isCompleted) return 'Completed';
  if (daysLeft > 0 && daysLeft <= 7) return 'Ending soon';
  if (logs.length === 0) return 'No logs yet';
  const latest = logs.map(log => log.date).sort().at(-1);
  if (latest && daysBetween(parseISODate(latest), parseISODate(todayISO)) <= 2) return 'Recently logged';
  return 'On track';
}

function buildRow(compound: Compound, logs: DoseLog[], todayISO: string): StatsCompoundRow {
  const startISO = compound.startDate;
  const endISO = getEndISO(compound);
  const compoundLogs = logs.filter(log => log.compoundId === compound.id && !log.isSkipped).sort((a, b) => a.date.localeCompare(b.date));
  const latestLog = compoundLogs.at(-1);
  const daysLeft = getDaysLeft(endISO, todayISO);

  return {
    id: compound.id,
    name: compound.name,
    type: compound.type,
    color: compound.color,
    doseLabel: `${compound.doseAmount} ${compound.doseUnit}`,
    frequencyLabel: FREQ_LABEL[compound.frequency] || compound.frequency,
    drawLabel: getDrawLabel(compound),
    startISO,
    endISO,
    startLabel: formatShortDate(startISO),
    endLabel: formatShortDate(endISO),
    progressPct: getProgressPct(startISO, endISO, todayISO),
    daysLeft: compound.isCompleted ? 0 : daysLeft,
    loggedCount: compoundLogs.length,
    lastLoggedLabel: latestLog ? formatShortDate(latestLog.date) : 'No logs yet',
    status: getStatus(compound, compoundLogs, daysLeft, todayISO),
  };
}

export function buildProtocolRows(compounds: Compound[], logs: DoseLog[], todayISO = new Date().toISOString().slice(0, 10)): StatsCompoundRow[] {
  return compounds.map(compound => buildRow(compound, logs, todayISO));
}

export function buildStatsTimelineViewModel(compounds: Compound[], logs: DoseLog[], todayISO = new Date().toISOString().slice(0, 10)): StatsTimelineViewModel {
  const activeCompounds = compounds.filter(compound => !compound.isCompleted);
  const administeredLogs = logs.filter(log => !log.isSkipped);
  const active = activeCompounds.map(compound => buildRow(compound, administeredLogs, todayISO));
  const dosesLoggedThisWeek = administeredLogs.filter(log => isCurrentWeek(log.date, todayISO)).length;

  if (active.length === 0) {
    return {
      active,
      summary: {
        activeCount: 0,
        overallProgressPct: 0,
        daysLeft: 0,
        dosesLoggedThisWeek,
        totalLogs: administeredLogs.length,
      },
    };
  }

  const startISO = active.map(row => row.startISO).sort()[0];
  const endISO = active.map(row => row.endISO).sort().at(-1)!;
  const runwayProgress = getProgressPct(startISO, endISO, todayISO);
  const daysLeft = getDaysLeft(endISO, todayISO);

  return {
    active,
    summary: {
      activeCount: active.length,
      overallProgressPct: runwayProgress,
      daysLeft,
      dosesLoggedThisWeek,
      totalLogs: administeredLogs.length,
    },
    runway: {
      startISO,
      endISO,
      startLabel: formatShortDate(startISO),
      endLabel: formatShortDate(endISO),
      progressPct: runwayProgress,
      todayPct: runwayProgress,
    },
  };
}
