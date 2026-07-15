# Stats Timeline Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the LabRat Stats tab as a timeline-first dashboard with compact active-compound rows and secondary administration history.

**Architecture:** Add pure view-model helpers for date/progress/draw calculations, then replace `StatsView` with a dashboard UI that consumes those helpers. Keep persistence unchanged and reuse `AdministrationLedger`.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Tailwind utility classes, lucide-react icons.

## Global Constraints

- Must remain readable in clinical dark and clinical light modes.
- Avoid dark-only chip backgrounds.
- Use responsive grids that do not clip long compound names.
- Keep cards compact enough that mobile users can see more than one compound row per screen when possible.
- No new charts library.
- No new persistent analytics tables.
- No medical interpretation or recommendations.
- Do not add edit/delete controls to the Stats tab.
- Keep existing administration ledger behavior.

---

## File Structure

- Create `src/lib/statsTimeline.ts`: pure helpers and view-model builders for Stats.
- Create `src/lib/statsTimeline.test.ts`: focused Vitest coverage for the helpers.
- Modify `src/components/StatsView.tsx`: replace duplicated `CompoundCard` grid with timeline dashboard UI.

---

### Task 1: Stats Timeline View Models

**Files:**
- Create: `src/lib/statsTimeline.ts`
- Create: `src/lib/statsTimeline.test.ts`

**Interfaces:**
- Consumes: `Compound`, `DoseLog` from `src/types.ts`.
- Produces:
  - `buildStatsTimelineViewModel(compounds: Compound[], logs: DoseLog[], todayISO?: string): StatsTimelineViewModel`
  - `getDrawLabel(compound: Compound): string | undefined`
  - `StatsTimelineViewModel` with `active`, `summary`, and `runway` fields.

- [ ] **Step 1: Write the failing helper tests**

Create `src/lib/statsTimeline.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { Compound, DoseLog } from '../types';
import { buildStatsTimelineViewModel, getDrawLabel } from './statsTimeline';

const baseCompound: Compound = {
  id: 'test-cyp',
  name: 'Testosterone Cypionate',
  type: 'steroid',
  steroidForm: 'oil',
  oilConcMgMl: 200,
  doseAmount: 40,
  doseUnit: 'mg',
  frequency: 'daily',
  startDate: '2026-07-01',
  durationWeeks: 4,
  color: '#10b981',
  isCompleted: false,
};

describe('stats timeline helpers', () => {
  it('calculates oil and peptide draw labels', () => {
    const peptide: Compound = {
      ...baseCompound,
      id: 'cjc',
      name: 'CJC-1295',
      type: 'peptide',
      steroidForm: undefined,
      oilConcMgMl: undefined,
      vialSizeMg: 5,
      bacWaterMl: 2,
      doseAmount: 200,
      doseUnit: 'mcg',
      color: '#06b6d4',
    };

    expect(getDrawLabel(baseCompound)).toBe('draw 20 units');
    expect(getDrawLabel(peptide)).toBe('draw 8 units');
  });

  it('builds cycle summary, runway, and compound rows', () => {
    const logs: DoseLog[] = [
      { id: 'l1', compoundId: 'test-cyp', compoundName: 'Testosterone Cypionate', date: '2026-07-13', time: '08:00', doseAmount: 40, doseUnit: 'mg' },
      { id: 'l2', compoundId: 'test-cyp', compoundName: 'Testosterone Cypionate', date: '2026-07-14', time: '08:00', doseAmount: 40, doseUnit: 'mg' },
    ];

    const vm = buildStatsTimelineViewModel([baseCompound], logs, '2026-07-15');

    expect(vm.summary.activeCount).toBe(1);
    expect(vm.summary.dosesLoggedThisWeek).toBe(2);
    expect(vm.summary.daysLeft).toBe(14);
    expect(vm.runway).toMatchObject({
      startISO: '2026-07-01',
      endISO: '2026-07-29',
      progressPct: 50,
      todayPct: 50,
    });
    expect(vm.active[0]).toMatchObject({
      id: 'test-cyp',
      name: 'Testosterone Cypionate',
      drawLabel: 'draw 20 units',
      progressPct: 50,
      daysLeft: 14,
      loggedCount: 2,
      lastLoggedLabel: 'Jul 14',
      status: 'Recently logged',
    });
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm test -- src/lib/statsTimeline.test.ts`

Expected: FAIL because `src/lib/statsTimeline.ts` does not exist.

- [ ] **Step 3: Implement timeline helpers**

Create `src/lib/statsTimeline.ts`:

```ts
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
  status: 'Ending soon' | 'No logs yet' | 'Recently logged' | 'On track';
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

function getStatus(logs: DoseLog[], daysLeft: number, todayISO: string): StatsCompoundRow['status'] {
  if (daysLeft > 0 && daysLeft <= 7) return 'Ending soon';
  if (logs.length === 0) return 'No logs yet';
  const latest = logs.map(log => log.date).sort().at(-1);
  if (latest && daysBetween(parseISODate(latest), parseISODate(todayISO)) <= 2) return 'Recently logged';
  return 'On track';
}

function buildRow(compound: Compound, logs: DoseLog[], todayISO: string): StatsCompoundRow {
  const startISO = compound.startDate;
  const endISO = getEndISO(compound);
  const compoundLogs = logs.filter(log => log.compoundId === compound.id).sort((a, b) => a.date.localeCompare(b.date));
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
    daysLeft,
    loggedCount: compoundLogs.length,
    lastLoggedLabel: latestLog ? formatShortDate(latestLog.date) : 'No logs yet',
    status: getStatus(compoundLogs, daysLeft, todayISO),
  };
}

export function buildStatsTimelineViewModel(compounds: Compound[], logs: DoseLog[], todayISO = new Date().toISOString().slice(0, 10)): StatsTimelineViewModel {
  const activeCompounds = compounds.filter(compound => !compound.isCompleted);
  const active = activeCompounds.map(compound => buildRow(compound, logs, todayISO));
  const dosesLoggedThisWeek = logs.filter(log => isCurrentWeek(log.date, todayISO)).length;

  if (active.length === 0) {
    return {
      active,
      summary: {
        activeCount: 0,
        overallProgressPct: 0,
        daysLeft: 0,
        dosesLoggedThisWeek,
        totalLogs: logs.length,
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
      totalLogs: logs.length,
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
```

- [ ] **Step 4: Run tests to verify pass**

Run: `npm test -- src/lib/statsTimeline.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/statsTimeline.ts src/lib/statsTimeline.test.ts
git commit -m "Add stats timeline view models"
```

---

### Task 2: Stats Timeline Dashboard UI

**Files:**
- Modify: `src/components/StatsView.tsx`

**Interfaces:**
- Consumes: `buildStatsTimelineViewModel()` and `StatsCompoundRow` from `src/lib/statsTimeline.ts`.
- Produces: redesigned Stats tab with dashboard header, runway, compact active rows, secondary ledger, and encyclopedia link.

- [ ] **Step 1: Replace the StatsView implementation**

Replace `src/components/StatsView.tsx` with:

```tsx
import React from 'react';
import { Activity, BarChart3, BookOpen, ChevronRight, History } from 'lucide-react';
import { Compound, DoseLog } from '../types';
import AdministrationLedger from './AdministrationLedger';
import { buildStatsTimelineViewModel, StatsCompoundRow } from '../lib/statsTimeline';

interface StatsViewProps {
  compounds: Compound[];
  logs: DoseLog[];
  onUndoDose: (id: string) => void;
  onUpdateCompound: (compound: Compound) => void;
  onOpenEncyclopedia: () => void;
}

const statusClasses: Record<StatsCompoundRow['status'], string> = {
  'Ending soon': 'border-amber-500/35 bg-amber-500/10 text-amber-300',
  'No logs yet': 'border-slate-500/35 bg-slate-500/10 text-slate-300',
  'Recently logged': 'border-emerald-500/35 bg-emerald-500/10 text-emerald-300',
  'On track': 'border-cyan-500/35 bg-cyan-500/10 text-cyan-300',
};

function MetricCard({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <div className="labrat-mini-surface p-3.5 min-w-0">
      <p className="text-2xl font-black tracking-tight tabular-nums text-slate-100">{value}</p>
      <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-slate-500 mt-1">{label}</p>
      <p className="text-[11px] text-slate-400 mt-1 truncate">{hint}</p>
    </div>
  );
}

function CompoundTimelineRow({ row }: { row: StatsCompoundRow }) {
  return (
    <article className="labrat-card p-4 sm:p-5 min-w-0">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-start gap-2.5">
            <span className="w-3 h-3 rounded-full shrink-0 mt-1.5 shadow-[0_0_16px_currentColor]" style={{ background: row.color, color: row.color }} />
            <div className="min-w-0">
              <h3 className="font-black text-lg leading-tight text-slate-100 break-words">{row.name}</h3>
              <div className="mt-2 flex flex-wrap gap-1.5 text-[12px] font-semibold">
                <span className="labrat-dose-chip px-2 py-1">{row.type}</span>
                <span className="labrat-dose-chip px-2 py-1">{row.doseLabel}</span>
                {row.drawLabel && <span className="labrat-dose-chip labrat-dose-chip-accent px-2 py-1">{row.drawLabel}</span>}
                <span className="labrat-dose-chip px-2 py-1">{row.frequencyLabel}</span>
              </div>
            </div>
          </div>
        </div>
        <span className={`shrink-0 rounded-lg border px-2 py-1 text-[10px] font-black uppercase tracking-wide ${statusClasses[row.status]}`}>
          {row.status}
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between gap-3 text-[12px] font-mono text-slate-400">
          <span>{row.startLabel}</span>
          <span>{row.progressPct}%</span>
          <span>{row.endLabel}</span>
        </div>
        <div className="labrat-progress-track h-2 mt-2 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400" style={{ width: `${row.progressPct}%` }} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="labrat-mini-surface p-2.5">
          <strong className="block text-base tabular-nums text-slate-100">{row.daysLeft}</strong>
          <span className="text-[10px] uppercase tracking-wide text-slate-500">days left</span>
        </div>
        <div className="labrat-mini-surface p-2.5">
          <strong className="block text-base tabular-nums text-slate-100">{row.loggedCount}</strong>
          <span className="text-[10px] uppercase tracking-wide text-slate-500">logged</span>
        </div>
        <div className="labrat-mini-surface p-2.5">
          <strong className="block text-base text-slate-100 truncate">{row.lastLoggedLabel}</strong>
          <span className="text-[10px] uppercase tracking-wide text-slate-500">last dose</span>
        </div>
      </div>
    </article>
  );
}

export default function StatsView({ compounds, logs, onUndoDose, onOpenEncyclopedia }: StatsViewProps) {
  const vm = buildStatsTimelineViewModel(compounds, logs);

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 pb-8" id="stats-view">
      <section className="labrat-card-strong p-4 sm:p-5 overflow-hidden">
        <div className="flex flex-col gap-4">
          <div>
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-cyan-400">Cycle Timeline</span>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-1">Cycle runway</h1>
            <p className="text-sm text-slate-400 mt-1.5">Overall timing, active compounds, and your administration record in one cockpit.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            <MetricCard label="Complete" value={`${vm.summary.overallProgressPct}%`} hint="overall active window" />
            <MetricCard label="Days left" value={vm.summary.daysLeft} hint="latest active end" />
            <MetricCard label="Active" value={vm.summary.activeCount} hint="compounds running" />
            <MetricCard label="This week" value={vm.summary.dosesLoggedThisWeek} hint="doses logged" />
          </div>

          {vm.runway ? (
            <div className="labrat-mini-surface p-4">
              <div className="flex items-center justify-between gap-3 text-[12px] font-mono text-slate-400">
                <span>{vm.runway.startLabel}</span>
                <span className="text-cyan-300">{vm.runway.progressPct}% complete</span>
                <span>{vm.runway.endLabel}</span>
              </div>
              <div className="relative labrat-progress-track h-3 mt-3 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400" style={{ width: `${vm.runway.progressPct}%` }} />
                <span className="absolute top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.6)]" style={{ left: `${vm.runway.todayPct}%` }} />
              </div>
            </div>
          ) : (
            <div className="labrat-mini-surface px-5 py-8 text-center">
              <BarChart3 className="mx-auto w-9 h-9 text-slate-500" />
              <h2 className="mt-3 text-base font-black text-slate-100">No active cycle yet</h2>
              <p className="mt-1 text-sm text-slate-400">Add compounds in the Cycle tab to populate the timeline dashboard.</p>
            </div>
          )}
        </div>
      </section>

      {vm.active.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">
            <Activity className="w-4 h-4 text-cyan-400" /> Active compounds
          </h2>
          <div className="grid gap-3 lg:grid-cols-2">
            {vm.active.map(row => <CompoundTimelineRow key={row.id} row={row} />)}
          </div>
        </section>
      )}

      <section>
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">
          <History className="w-4 h-4 text-cyan-400" /> Administration history
        </h2>
        <AdministrationLedger logs={logs} onUndoDose={onUndoDose} />
      </section>

      <button onClick={onOpenEncyclopedia}
        className="labrat-button-secondary w-full flex items-center justify-between gap-3 px-5 py-4 text-left cursor-pointer group">
        <span className="flex items-center gap-3 min-w-0">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/12 text-cyan-400"><BookOpen className="w-5 h-5" /></span>
          <span className="min-w-0">
            <span className="block text-sm font-bold text-slate-100">Compound Encyclopedia</span>
            <span className="block text-[12px] text-slate-400 truncate">Research, dosing ranges, half-lives, and reconstitution</span>
          </span>
        </span>
        <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition" />
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Remove unused imports if TypeScript reports any**

Run: `npm run lint`

Expected: PASS. If it fails for unused imports, remove those imports from `src/components/StatsView.tsx` and rerun.

- [ ] **Step 3: Run full verification**

Run:

```bash
npm test
npm run build
```

Expected: both PASS.

- [ ] **Step 4: Run rendered smoke checks**

Start the built app:

```bash
npm run start
```

Run theme smoke:

```bash
npm run smoke:themes
```

Use Puppeteer to seed at least one oil compound and one peptide compound, open the Stats tab, and save dark/light mobile screenshots.

- [ ] **Step 5: Commit**

```bash
git add src/components/StatsView.tsx
git commit -m "Revamp stats timeline dashboard"
```

---
