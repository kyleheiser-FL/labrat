import React from 'react';
import { Activity, BarChart3, BookOpen, ChevronRight, History } from 'lucide-react';
import { Compound, DoseLog } from '../types';
import AdministrationLedger from './AdministrationLedger';
import { buildStatsTimelineViewModel, getStatusTone, StatsCompoundRow } from '../lib/statsTimeline';

interface StatsViewProps {
  compounds: Compound[];
  logs: DoseLog[];
  onUndoDose: (id: string) => void;
  onUpdateCompound: (compound: Compound) => void;
  onOpenEncyclopedia: () => void;
}

function MetricCard({ label, value, hint }: { label: string; value: string | number; hint: string }) {
  return (
    <div className="labrat-mini-surface p-3.5 min-w-0">
      <p className="labrat-title text-2xl font-black tracking-tight tabular-nums">{value}</p>
      <p className="labrat-muted font-mono text-[10px] tracking-[0.14em] uppercase mt-1">{label}</p>
      <p className="labrat-body text-[11px] mt-1 truncate">{hint}</p>
    </div>
  );
}

function CompoundTimelineRow({ row }: { row: StatsCompoundRow }) {
  const tone = getStatusTone(row.status);

  return (
    <article className={`labrat-card p-4 sm:p-5 min-w-0 ${tone.accentClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-start gap-2.5">
            <span className="w-3 h-3 rounded-full shrink-0 mt-1.5 shadow-[0_0_16px_currentColor]" style={{ background: row.color, color: row.color }} />
            <div className="min-w-0">
              <h3 className="labrat-title font-black text-lg leading-tight break-words">{row.name}</h3>
              <div className="mt-2 flex flex-wrap gap-1.5 text-[12px] font-semibold">
                <span className="labrat-dose-chip px-2 py-1">{row.type}</span>
                <span className="labrat-dose-chip px-2 py-1">{row.doseLabel}</span>
                {row.drawLabel && <span className="labrat-dose-chip labrat-dose-chip-accent px-2 py-1">{row.drawLabel}</span>}
                <span className="labrat-dose-chip px-2 py-1">{row.frequencyLabel}</span>
              </div>
            </div>
          </div>
        </div>
        <span className={`shrink-0 rounded-lg border px-2 py-1 text-[10px] font-black uppercase tracking-wide ${tone.chipClass}`}>
          {tone.label}
        </span>
      </div>

      <div className="mt-4">
        <div className="labrat-muted flex items-center justify-between gap-3 text-[12px] font-mono">
          <span>{row.startLabel}</span>
          <span className={row.status === 'Ending soon' ? 'font-black text-amber-300' : 'font-black text-cyan-300'}>{row.progressPct}%</span>
          <span>{row.endLabel}</span>
        </div>
        <div className="labrat-progress-track h-2 mt-2 overflow-hidden">
          <div className={`h-full rounded-full ${tone.barClass}`} style={{ width: `${row.progressPct}%` }} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="labrat-mini-surface p-2.5">
          <strong className="labrat-title block text-base tabular-nums">{row.daysLeft}</strong>
          <span className="labrat-muted text-[10px] uppercase tracking-wide">days left</span>
        </div>
        <div className="labrat-mini-surface p-2.5">
          <strong className="labrat-title block text-base tabular-nums">{row.loggedCount}</strong>
          <span className="labrat-muted text-[10px] uppercase tracking-wide">logged</span>
        </div>
        <div className="labrat-mini-surface p-2.5">
          <strong className="labrat-title block text-base truncate">{row.lastLoggedLabel}</strong>
          <span className="labrat-muted text-[10px] uppercase tracking-wide">last dose</span>
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
            <h1 className="labrat-title text-3xl sm:text-4xl font-black tracking-tight mt-1">Cycle runway</h1>
            <p className="labrat-body text-sm mt-1.5">Overall timing, active compounds, and your administration record in one cockpit.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            <MetricCard label="Complete" value={`${vm.summary.overallProgressPct}%`} hint="overall active window" />
            <MetricCard label="Days left" value={vm.summary.daysLeft} hint="latest active end" />
            <MetricCard label="Active" value={vm.summary.activeCount} hint="compounds running" />
            <MetricCard label="This week" value={vm.summary.dosesLoggedThisWeek} hint="doses logged" />
          </div>

          {vm.runway ? (
            <div className="labrat-mini-surface p-4">
              <div className="labrat-muted flex items-center justify-between gap-3 text-[12px] font-mono">
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
              <h2 className="labrat-title mt-3 text-base font-black">No active cycle yet</h2>
              <p className="labrat-body mt-1 text-sm">Add compounds in the Cycle tab to populate the timeline dashboard.</p>
            </div>
          )}
        </div>
      </section>

      {vm.active.length > 0 && (
        <section>
          <h2 className="labrat-title flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-3">
            <Activity className="w-4 h-4 text-cyan-400" /> Active compounds
          </h2>
          <div className="grid gap-3 lg:grid-cols-2">
            {vm.active.map(row => <CompoundTimelineRow key={row.id} row={row} />)}
          </div>
        </section>
      )}

      <section>
        <h2 className="labrat-title flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-3">
          <History className="w-4 h-4 text-cyan-400" /> Administration history
        </h2>
        <AdministrationLedger logs={logs} onUndoDose={onUndoDose} />
      </section>

      <button onClick={onOpenEncyclopedia}
        className="labrat-button-secondary w-full flex items-center justify-between gap-3 px-5 py-4 text-left cursor-pointer group">
        <span className="flex items-center gap-3 min-w-0">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/12 text-cyan-400"><BookOpen className="w-5 h-5" /></span>
          <span className="min-w-0">
            <span className="labrat-title block text-sm font-bold">Compound Encyclopedia</span>
            <span className="labrat-body block text-[12px] truncate">Research, dosing ranges, half-lives, and reconstitution</span>
          </span>
        </span>
        <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition" />
      </button>
    </div>
  );
}
