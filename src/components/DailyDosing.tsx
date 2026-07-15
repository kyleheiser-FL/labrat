import React, { useState } from 'react';
import { localDateISO, localTimeHM } from '../lib/date';
import { CalendarDays, ChevronLeft, ChevronRight, Check, RotateCcw, Plus, X, History } from 'lucide-react';
import { Compound, DoseLog, formatTimeTo12Hour } from '../types';
import { getDoseScheduleForDate } from '../lib/schedule';
import { triggerHaptic } from '../lib/haptics';

interface DailyDosingProps {
  compounds: Compound[];
  logs: DoseLog[];
  onLogDose: (log: DoseLog) => void;
  onUndoDose: (id: string) => void;
}

const FREQ_LABEL: Record<string, string> = {
  daily: 'every day', eod: 'every other day', twice_weekly: 'twice a week', weekly: 'once a week', custom: 'custom schedule',
};

function syringeUnits(c: Compound): number | undefined {
  if (!c.vialSizeMg || !c.bacWaterMl) return undefined;
  const mcg = c.doseUnit === 'mg' ? c.doseAmount * 1000 : c.doseAmount;
  return Math.round((mcg / ((c.vialSizeMg * 1000) / (c.bacWaterMl * 100))) * 10) / 10;
}
const iso = (d: Date) => localDateISO(d);
const prettyDate = (s: string) => {
  const today = iso(new Date());
  if (s === today) return 'Today';
  const d = new Date(s + 'T00:00:00');
  const y = new Date(); y.setDate(y.getDate() - 1);
  if (s === iso(y)) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

// Clean, big-button daily dose recording. Deep stats live on the Stats tab.
export default function DailyDosing({ compounds, logs, onLogDose, onUndoDose }: DailyDosingProps) {
  const [date, setDate] = useState(iso(new Date()));
  const [showManual, setShowManual] = useState(false);
  const [manualId, setManualId] = useState('');
  const [manualDose, setManualDose] = useState('');
  const [manualUnit, setManualUnit] = useState<'mcg' | 'mg' | 'IU' | 'ml'>('mg');

  const active = compounds.filter(c => !c.isCompleted);
  const due = active.filter(c => getDoseScheduleForDate(c, date).isDue);
  const loggedFor = (c: Compound) => logs.find(l => l.compoundId === c.id && l.date === date);
  const remaining = due.filter(c => !loggedFor(c)).length;
  const loggedCount = Math.max(0, due.length - remaining);
  const completionPct = due.length ? Math.round((loggedCount / due.length) * 100) : 0;
  const isToday = date === iso(new Date());

  const shiftDay = (n: number) => {
    const d = new Date(date + 'T00:00:00'); d.setDate(d.getDate() + n); setDate(iso(d)); triggerHaptic('light');
  };

  const unitsFor = (dose: number, unit: string, vialMg?: number, bacMl?: number): number | undefined => {
    if (!vialMg || !bacMl) return undefined;
    const mcg = unit === 'mg' ? dose * 1000 : dose;
    return Math.round((mcg / ((vialMg * 1000) / (bacMl * 100))) * 10) / 10;
  };

  const logDose = (c: Compound, doseOverride?: number, unitOverride?: 'mcg' | 'mg' | 'IU' | 'ml') => {
    triggerHaptic('success');
    const doseAmount = doseOverride != null && !isNaN(doseOverride) ? doseOverride : c.doseAmount;
    const doseUnit = unitOverride || c.doseUnit;
    const units = unitsFor(doseAmount, doseUnit, c.vialSizeMg, c.bacWaterMl);
    const time = localTimeHM();
    onLogDose({
      id: crypto.randomUUID(),
      compoundId: c.id,
      compoundName: c.name,
      date,
      time,
      doseAmount,
      doseUnit,
      reconstitutedRatio: c.vialSizeMg && c.bacWaterMl && units != null
        ? { vialSizeMg: c.vialSizeMg, bacWaterMl: c.bacWaterMl, syringeUnits: units } : undefined,
    });
  };
  const undo = (c: Compound) => { const l = loggedFor(c); if (l) { triggerHaptic('warning'); onUndoDose(l.id); } };

  const doseCard = (c: Compound) => {
    const logged = !!loggedFor(c);
    const units = syringeUnits(c);
    return (
      <div key={c.id} className={`labrat-card p-4 sm:p-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:gap-4 ${logged ? 'border-emerald-500/25' : ''}`}>
        <div className="min-w-0">
          <p className="font-bold text-[15.5px] sm:text-lg leading-snug text-slate-100 flex items-start gap-2.5 break-words">
            <span className="w-3 h-3 rounded-full shrink-0 mt-1.5 shadow-[0_0_16px_currentColor]" style={{ background: c.color, color: c.color }} />
            <span className="min-w-0">{c.name}</span>
          </p>
          <div className="mt-2 pl-[22px] flex flex-wrap gap-1.5 text-[12px] font-semibold">
            <span className="labrat-dose-chip px-2 py-1">
              {c.doseAmount} {c.doseUnit}
            </span>
            {units != null && (
              <span className="labrat-dose-chip labrat-dose-chip-accent px-2 py-1">
                draw {units} units
              </span>
            )}
            <span className="labrat-dose-chip px-2 py-1">
              {FREQ_LABEL[c.frequency] || c.frequency}
            </span>
          </div>
        </div>
        {logged ? (
          <button onClick={() => undo(c)} title="Tap to undo"
            aria-label={`Undo dose for ${c.name}`}
            className="shrink-0 min-w-[92px] sm:min-w-[118px] h-12 sm:h-[52px] flex items-center justify-center gap-2 px-3 sm:px-5 rounded-xl text-[12px] sm:text-sm font-black uppercase tracking-wide bg-emerald-500/15 text-emerald-400 hover:bg-rose-500/15 hover:text-rose-300 transition cursor-pointer group">
            <Check className="w-4.5 h-4.5 group-hover:hidden" /><RotateCcw className="w-4.5 h-4.5 hidden group-hover:inline" />
            <span className="group-hover:hidden">Done</span><span className="hidden group-hover:inline">Undo</span>
          </button>
        ) : (
          <button onClick={() => logDose(c)}
            aria-label={`Log dose for ${c.name}`}
            className="shrink-0 min-w-[96px] sm:min-w-[128px] h-12 sm:h-[52px] flex items-center justify-center gap-2 px-3 sm:px-5 rounded-xl text-[12px] sm:text-sm font-black uppercase tracking-wide bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 hover:brightness-110 shadow-[0_10px_24px_-12px_rgba(34,211,238,0.7)] transition cursor-pointer">
            <span className="sm:hidden">Log</span><span className="hidden sm:inline">Log dose</span>
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="relative max-w-2xl mx-auto pb-8" id="daily-dosing">
      {/* labrat mascot — big, bold, behind the doses */}
      <img
        src="/labrat_hero_rat_dark.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none absolute -top-5 left-1/2 -translate-x-1/2 w-[130%] max-w-[520px] opacity-20 z-0"
        style={{ WebkitMaskImage: 'linear-gradient(to bottom, #000 35%, transparent 88%)', maskImage: 'linear-gradient(to bottom, #000 35%, transparent 88%)' }}
      />

      <div className="relative z-10 flex flex-col gap-5">
      {/* header + date nav */}
      <div className="labrat-card-strong p-4 sm:p-5 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0">
          <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-cyan-400">Daily Dosing</span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-1">
            {remaining === 0 ? (due.length ? 'All logged' : 'Nothing due') : `${remaining} to log`}
          </h1>
          <p className="mt-1 text-sm font-semibold text-slate-400">
            {due.length ? `${loggedCount} of ${due.length} scheduled doses complete` : active.length ? 'No scheduled doses on this date' : 'Add compounds in Cycle to start tracking'}
          </p>
        </div>
        <div className="labrat-mini-surface w-full sm:w-auto flex items-center justify-between sm:justify-start gap-1 rounded-xl p-1">
          <button onClick={() => shiftDay(-1)} className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-[#1e293b]/60 transition cursor-pointer" aria-label="Previous day"><ChevronLeft className="w-4 h-4" /></button>
          <span className="px-2 text-[13px] font-bold text-slate-200 min-w-[104px] text-center flex items-center gap-1.5 justify-center"><CalendarDays className="w-3.5 h-3.5 text-cyan-400" />{prettyDate(date)}</span>
          <button onClick={() => shiftDay(1)} disabled={isToday} className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-[#1e293b]/60 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer" aria-label="Next day"><ChevronRight className="w-4 h-4" /></button>
        </div>
        </div>
        {due.length > 0 && (
          <div className="mt-4">
            <div className="labrat-progress-track h-2 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-[width] duration-300"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* due doses */}
      {due.length > 0 ? (
        <div className="flex flex-col gap-3">{due.map(doseCard)}</div>
      ) : (
        <div className="labrat-card px-6 py-10 text-center">
          <h3 className="labrat-title text-base">{active.length === 0 ? 'No active compounds' : 'No doses scheduled'}</h3>
          <p className="labrat-body text-xs mt-1">
            {active.length === 0 ? 'Add compounds in the Cycle tab to begin tracking.' : 'Your current protocol has no administrations due for this date.'}
          </p>
        </div>
      )}

      {/* manual / unscheduled dose */}
      {active.length > 0 && (
        !showManual ? (
          <button onClick={() => { const c = active[0]; setShowManual(true); setManualId(c?.id || ''); setManualDose(c ? String(c.doseAmount) : ''); setManualUnit((c?.doseUnit as any) || 'mg'); }}
            className="labrat-button-secondary w-full sm:w-auto justify-center self-start inline-flex items-center gap-1.5 text-[13px] font-bold text-slate-400 hover:text-cyan-300 bg-[#0f172a]/50 hover:bg-[#0f172a]/80 border border-[#1e293b]/70 px-4 py-3 sm:py-2.5 rounded-xl transition cursor-pointer">
            <Plus className="w-4 h-4" /> Log an unscheduled dose
          </button>
        ) : (() => {
          const selected = active.find(x => x.id === manualId);
          const previewUnits = selected ? unitsFor(parseFloat(manualDose), manualUnit, selected.vialSizeMg, selected.bacWaterMl) : undefined;
          return (
          <div className="labrat-card p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-slate-200">Log an unscheduled dose</span>
              <button onClick={() => setShowManual(false)} className="p-1 text-slate-500 hover:text-slate-200 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <select value={manualId}
              onChange={e => { const c = active.find(x => x.id === e.target.value); setManualId(e.target.value); if (c) { setManualDose(String(c.doseAmount)); setManualUnit(c.doseUnit as any); } }}
              className="labrat-input px-3 py-2.5 text-sm">
              {active.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div className="flex gap-2">
              <input type="number" step="any" value={manualDose} onChange={e => setManualDose(e.target.value)} placeholder="Dose"
                className="labrat-input flex-1 min-w-0 px-3 py-2.5 text-sm" />
              <select value={manualUnit} onChange={e => setManualUnit(e.target.value as any)}
                className="labrat-input px-3 py-2.5 text-sm">
                <option value="mcg">mcg</option><option value="mg">mg</option><option value="IU">IU</option><option value="ml">ml</option>
              </select>
            </div>
            {previewUnits != null && (
              <p className="text-[12px] text-cyan-400 font-mono">≈ draw {previewUnits} units on the syringe</p>
            )}
            <button
              onClick={() => { if (selected) { logDose(selected, parseFloat(manualDose), manualUnit); setShowManual(false); } }}
              disabled={!manualDose || isNaN(parseFloat(manualDose))}
              className="labrat-button-primary flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black uppercase tracking-wide bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer">
              Log dose
            </button>
          </div>
          );
        })()
      )}

      {/* Logged today */}
      {(() => {
        const dayLogs = logs.filter(l => l.date === date).slice().sort((a, b) => b.time.localeCompare(a.time));
        if (dayLogs.length === 0) return null;
        return (
          <section className="mt-2">
            <h2 className="flex items-center gap-2 text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">
              <History className="w-4 h-4 text-cyan-400" /> Logged {isToday ? 'today' : prettyDate(date).toLowerCase()}
            </h2>
            <div className="flex flex-col gap-2">
              {dayLogs.map(l => (
                <div key={l.id} className="labrat-mini-surface px-4 py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[13.5px] font-semibold text-slate-200 truncate">{l.compoundName}</p>
                    <p className="text-[11.5px] text-slate-500 font-mono">{l.doseAmount} {l.doseUnit}{l.reconstitutedRatio ? ` · ${l.reconstitutedRatio.syringeUnits} units` : ''} · {formatTimeTo12Hour(l.time)}</p>
                  </div>
                  <button onClick={() => { triggerHaptic('warning'); onUndoDose(l.id); }}
                    className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-rose-400 px-2 py-1 rounded-lg hover:bg-rose-500/10 transition cursor-pointer">
                    <RotateCcw className="w-3.5 h-3.5" /> Undo
                  </button>
                </div>
              ))}
            </div>
          </section>
        );
      })()}
      </div>
    </div>
  );
}
