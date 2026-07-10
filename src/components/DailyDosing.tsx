import React, { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Check, RotateCcw, Plus, X } from 'lucide-react';
import { Compound, DoseLog } from '../types';
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
const iso = (d: Date) => d.toISOString().split('T')[0];
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

  const active = compounds.filter(c => !c.isCompleted);
  const due = active.filter(c => getDoseScheduleForDate(c, date).isDue);
  const loggedFor = (c: Compound) => logs.find(l => l.compoundId === c.id && l.date === date);
  const remaining = due.filter(c => !loggedFor(c)).length;
  const isToday = date === iso(new Date());

  const shiftDay = (n: number) => {
    const d = new Date(date + 'T00:00:00'); d.setDate(d.getDate() + n); setDate(iso(d)); triggerHaptic('light');
  };

  const logDose = (c: Compound) => {
    triggerHaptic('success');
    const units = syringeUnits(c);
    const time = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    onLogDose({
      id: crypto.randomUUID(),
      compoundId: c.id,
      compoundName: c.name,
      date,
      time,
      doseAmount: c.doseAmount,
      doseUnit: c.doseUnit,
      reconstitutedRatio: c.vialSizeMg && c.bacWaterMl && units != null
        ? { vialSizeMg: c.vialSizeMg, bacWaterMl: c.bacWaterMl, syringeUnits: units } : undefined,
    });
  };
  const undo = (c: Compound) => { const l = loggedFor(c); if (l) { triggerHaptic('warning'); onUndoDose(l.id); } };

  const doseCard = (c: Compound) => {
    const logged = !!loggedFor(c);
    const units = syringeUnits(c);
    return (
      <div key={c.id} className="bg-[#0f172a]/70 border border-[#1e293b]/80 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-3 shadow-lg">
        <div className="min-w-0">
          <p className="font-bold text-base sm:text-lg text-slate-100 truncate flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ background: c.color }} />{c.name}
          </p>
          <p className="text-[13px] text-slate-400 mt-1 pl-[22px]">
            {c.doseAmount} {c.doseUnit}{units != null ? ` · draw ${units} units` : ''}
          </p>
        </div>
        {logged ? (
          <button onClick={() => undo(c)} title="Tap to undo"
            className="shrink-0 flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-black uppercase tracking-wide bg-emerald-500/15 text-emerald-400 hover:bg-rose-500/15 hover:text-rose-300 transition cursor-pointer group">
            <Check className="w-5 h-5 group-hover:hidden" /><RotateCcw className="w-5 h-5 hidden group-hover:inline" />
            <span className="group-hover:hidden">Done</span><span className="hidden group-hover:inline">Undo</span>
          </button>
        ) : (
          <button onClick={() => logDose(c)}
            className="shrink-0 flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-black uppercase tracking-wide bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 hover:brightness-110 shadow-[0_10px_24px_-12px_rgba(34,211,238,0.7)] transition cursor-pointer">
            Log dose
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="relative max-w-2xl mx-auto pb-8" id="daily-dosing">
      {/* labrat mascot watermark */}
      <img
        src="/labrat_hero_rat_dark.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none select-none absolute -top-6 -right-4 w-48 sm:w-64 opacity-[0.07] z-0"
        style={{ WebkitMaskImage: 'radial-gradient(circle at 70% 30%, #000 30%, transparent 72%)', maskImage: 'radial-gradient(circle at 70% 30%, #000 30%, transparent 72%)' }}
      />

      <div className="relative z-10 flex flex-col gap-5">
      {/* header + date nav */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-cyan-400">Daily Dosing</span>
          <h1 className="text-2xl font-black tracking-tight mt-1">
            {remaining === 0 ? (due.length ? "All done ✓" : 'Nothing due') : `${remaining} to log`}
          </h1>
        </div>
        <div className="flex items-center gap-1 bg-[#0f172a]/70 border border-[#1e293b]/80 rounded-xl p-1">
          <button onClick={() => shiftDay(-1)} className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-[#1e293b]/60 transition cursor-pointer" aria-label="Previous day"><ChevronLeft className="w-4 h-4" /></button>
          <span className="px-2 text-[13px] font-bold text-slate-200 min-w-[64px] text-center flex items-center gap-1.5 justify-center"><CalendarDays className="w-3.5 h-3.5 text-cyan-400" />{prettyDate(date)}</span>
          <button onClick={() => shiftDay(1)} disabled={isToday} className="p-2 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-[#1e293b]/60 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer" aria-label="Next day"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      {/* due doses */}
      {due.length > 0 ? (
        <div className="flex flex-col gap-3">{due.map(doseCard)}</div>
      ) : (
        <div className="bg-[#0f172a]/70 border border-[#1e293b]/80 rounded-2xl px-6 py-10 text-center text-sm text-slate-400">
          {active.length === 0 ? 'No active compounds. Add some in the Cycle tab.' : 'Nothing scheduled for this day.'}
        </div>
      )}

      {/* manual / unscheduled dose */}
      {active.length > 0 && (
        !showManual ? (
          <button onClick={() => { setShowManual(true); setManualId(active[0]?.id || ''); }}
            className="self-start inline-flex items-center gap-1.5 text-[13px] font-bold text-slate-400 hover:text-cyan-300 bg-[#0f172a]/50 hover:bg-[#0f172a]/80 border border-[#1e293b]/70 px-4 py-2.5 rounded-xl transition cursor-pointer">
            <Plus className="w-4 h-4" /> Log an unscheduled dose
          </button>
        ) : (
          <div className="bg-[#0f172a]/70 border border-[#1e293b]/80 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-slate-200">Log an unscheduled dose</span>
              <button onClick={() => setShowManual(false)} className="p-1 text-slate-500 hover:text-slate-200 cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <select value={manualId} onChange={e => setManualId(e.target.value)}
              className="bg-[#0b1222] border border-[#1e293b] rounded-xl px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-500/50">
              {active.map(c => <option key={c.id} value={c.id}>{c.name} — {c.doseAmount} {c.doseUnit}</option>)}
            </select>
            <button
              onClick={() => { const c = active.find(x => x.id === manualId); if (c) { logDose(c); setShowManual(false); } }}
              className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black uppercase tracking-wide bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 hover:brightness-110 transition cursor-pointer">
              Log dose
            </button>
          </div>
        )
      )}
      </div>
    </div>
  );
}
