import React from 'react';
import { BarChart3, Activity, History, BookOpen, ChevronRight } from 'lucide-react';
import { Compound, DoseLog } from '../types';
import CompoundCard from './CompoundCard';
import AdministrationLedger from './AdministrationLedger';

interface StatsViewProps {
  compounds: Compound[];
  logs: DoseLog[];
  onUndoDose: (id: string) => void;
  onUpdateCompound: (compound: Compound) => void;
  onOpenEncyclopedia: () => void;
}

// The "drill down" tab — everything moved out of Daily & Cycle: active-level
// curves, cycle progress, vial supply (per CycleProgressCard) and full history.
export default function StatsView({ compounds, logs, onUndoDose, onUpdateCompound, onOpenEncyclopedia }: StatsViewProps) {
  const active = compounds.filter(c => !c.isCompleted);
  const totalLogged = logs.length;

  const stat = (label: string, value: number) => (
    <div className="bg-[#0f172a]/70 border border-[#1e293b]/80 rounded-2xl px-3 py-4 flex flex-col items-center justify-center text-center min-w-0">
      <p className="text-3xl font-black tracking-tight text-cyan-300 tabular-nums leading-none">{value}</p>
      <p className="font-mono text-[9px] tracking-[0.14em] uppercase text-slate-500 mt-2 leading-tight">{label}</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-8" id="stats-view">
      <div>
        <span className="font-mono text-[11px] tracking-[0.22em] uppercase text-cyan-400">Statistics</span>
        <h1 className="text-2xl font-black tracking-tight mt-1">Cycle analytics &amp; history</h1>
        <p className="text-sm text-slate-400 mt-1.5">Active levels, cycle progress, supply, and your full administration record.</p>
      </div>

      {/* quick stats */}
      <div className="grid grid-cols-3 gap-3">
        {stat('Active', active.length)}
        {stat('Doses logged', totalLogged)}
        {stat('Peptides', active.filter(c => c.type === 'peptide').length)}
      </div>

      {/* per-compound progress / levels / supply */}
      <section>
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">
          <Activity className="w-4 h-4 text-cyan-400" /> Active cycle progress
        </h2>
        {active.length === 0 ? (
          <div className="bg-[#0f172a]/70 border border-[#1e293b]/80 rounded-2xl px-6 py-10 text-center text-sm text-slate-400 flex flex-col items-center gap-2">
            <BarChart3 className="w-8 h-8 text-slate-600" />
            No active compounds yet — add some in the Cycle tab to see levels and progress here.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {active.map(c => (
              <CompoundCard
                key={`stat-${c.id}`}
                compound={c}
                logs={logs}
                onEdit={() => {}}
                onDelete={() => {}}
                onUpdateCompound={onUpdateCompound}
                onOpenRetroLog={() => {}}
                hideActions
              />
            ))}
          </div>
        )}
      </section>

      {/* full history */}
      <section>
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">
          <History className="w-4 h-4 text-cyan-400" /> Administration history
        </h2>
        <AdministrationLedger logs={logs} onUndoDose={onUndoDose} />
      </section>

      {/* encyclopedia entry point */}
      <button onClick={onOpenEncyclopedia}
        className="w-full flex items-center justify-between gap-3 bg-[#0f172a]/70 border border-[#1e293b]/80 rounded-2xl px-5 py-4 text-left hover:border-cyan-500/40 transition cursor-pointer group">
        <span className="flex items-center gap-3">
          <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/12 text-cyan-400"><BookOpen className="w-5 h-5" /></span>
          <span>
            <span className="block text-sm font-bold text-slate-100">Compound Encyclopedia</span>
            <span className="block text-[12px] text-slate-400">Research, dosing ranges, half-lives &amp; reconstitution</span>
          </span>
        </span>
        <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition" />
      </button>
    </div>
  );
}
