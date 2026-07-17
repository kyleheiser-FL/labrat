import React from 'react';
import { BarChart3, History } from 'lucide-react';
import { Compound, DoseLog } from '../types';
import AdministrationLedger from './AdministrationLedger';
import { buildStatsTimelineViewModel } from '../lib/statsTimeline';

interface StatsViewProps {
  compounds: Compound[];
  logs: DoseLog[];
  onUndoDose: (id: string) => void;
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

// Cycle insights — folded into the Cycle tab. Shows the overall runway summary
// and the administration history; per-compound cards live above in the planner.
export default function StatsView({ compounds, logs, onUndoDose }: StatsViewProps) {
  const vm = buildStatsTimelineViewModel(compounds, logs);

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6 pb-8" id="stats-view">
      <section className="labrat-card-strong p-4 sm:p-5 overflow-hidden">
        <div className="flex flex-col gap-4">
          <div>
            <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-cyan-400">Cycle Insights</span>
            <h2 className="labrat-title text-2xl font-black tracking-tight mt-1">Cycle runway</h2>
            <p className="labrat-body text-sm mt-1.5">Overall timing and your administration record.</p>
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
              <h3 className="labrat-title mt-3 text-base font-black">No active cycle yet</h3>
              <p className="labrat-body mt-1 text-sm">Add compounds above to populate the timeline.</p>
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="labrat-title flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-3">
          <History className="w-4 h-4 text-cyan-400" /> Administration history
        </h2>
        <AdministrationLedger logs={logs} onUndoDose={onUndoDose} />
      </section>
    </div>
  );
}
