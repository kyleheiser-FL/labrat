import React, { useState } from 'react';
import { AlertTriangle, Activity, CheckSquare, Edit, Trash2, Info, History } from 'lucide-react';
import { Compound, DoseLog } from '../types';
import { triggerHaptic } from '../lib/haptics';
import { findShopProductMatch } from '../lib/shopHelpers';
import { PEPTIDE_LIBRARY } from '../data/peptides';

interface CompoundCardProps {
  compound: Compound;
  logs: DoseLog[];
  onEdit: (compound: Compound) => void;
  onDelete: (id: string) => void;
  onUpdateCompound: (compound: Compound) => void;
  onOpenRetroLog: (compoundId: string) => void;
  onNavigateToTab?: (tab: 'dashboard' | 'planner' | 'blood' | 'library' | 'shop' | 'settings') => void;
}

export default function CompoundCard({ compound: comp, logs, onEdit, onDelete, onUpdateCompound, onOpenRetroLog, onNavigateToTab }: CompoundCardProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const start = new Date(comp.startDate + 'T00:00:00');
  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const totalDays = comp.durationWeeks * 7;
  const diffTime = todayMidnight.getTime() - start.getTime();
  const elapsedDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const percentage = elapsedDays > 0 ? Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100)) : 0;
  const roundedPct = Math.round(percentage);
  const daysRemaining = Math.max(0, totalDays - elapsedDays);

  const compLogs = logs.filter(l => l.compoundId === comp.id);

  const peptideSupply = (() => {
    if (comp.type !== 'peptide' || !comp.vialSizeMg || comp.doseAmount <= 0) return null;
    const mgPerDose = comp.doseUnit === 'mcg' ? comp.doseAmount / 1000 : comp.doseAmount;
    if (mgPerDose <= 0) return null;
    const dosesPerVial = comp.vialSizeMg / mgPerDose;
    if (!isFinite(dosesPerVial) || dosesPerVial <= 0) return null;
    const dosesIntoCurrentVial = compLogs.length % Math.max(1, Math.floor(dosesPerVial) || 1);
    const usedMg = dosesIntoCurrentVial * mgPerDose;
    const remainingMg = Math.max(0, comp.vialSizeMg - usedMg);
    const dosesRemaining = Math.max(0, Math.floor(remainingMg / mgPerDose));
    const pctUsed = Math.min(100, (usedMg / comp.vialSizeMg) * 100);
    const lowSupply = dosesRemaining <= 3 || (100 - pctUsed) < 20;
    return { remainingMg, dosesRemaining, dosesPerVial, pctUsed, lowSupply };
  })();

  const oilSupply = (() => {
    if (comp.steroidForm !== 'oil' || !comp.oilConcMgMl || comp.doseAmount <= 0) return null;
    const vialMl = comp.vialMl ?? 10;
    const totalVialMg = comp.oilConcMgMl * vialMl;
    const mgPerDose = comp.doseAmount;
    if (mgPerDose <= 0 || totalVialMg <= 0) return null;
    const dosesPerVial = totalVialMg / mgPerDose;
    if (!isFinite(dosesPerVial) || dosesPerVial <= 0) return null;
    const dosesIntoCurrentVial = compLogs.length % Math.max(1, Math.floor(dosesPerVial) || 1);
    const usedMg = dosesIntoCurrentVial * mgPerDose;
    const remainingMg = Math.max(0, totalVialMg - usedMg);
    const dosesRemaining = Math.max(0, Math.floor(remainingMg / mgPerDose));
    const pctUsed = Math.min(100, (usedMg / totalVialMg) * 100);
    const lowSupply = dosesRemaining <= 3 || (100 - pctUsed) < 20;
    return { remainingMg, totalVialMg, dosesRemaining, dosesPerVial, vialMl, pctUsed, lowSupply };
  })();

  const decayLevel = (() => {
    if (comp.isCompleted) return null;
    const lib = PEPTIDE_LIBRARY.find(l =>
      l.name.toLowerCase().includes(comp.name.toLowerCase().split(' ')[0]) ||
      comp.name.toLowerCase().includes(l.name.toLowerCase().split(' ')[0])
    );
    if (!lib?.halfLife) return null;
    const hl = lib.halfLife;
    let hlHours: number | null = null;
    const hourMatch = hl.match(/(\d+(?:\.\d+)?)\s*(?:-\s*(\d+(?:\.\d+)?))?\s*h/i);
    if (hourMatch) { const lo = parseFloat(hourMatch[1]); const hi = hourMatch[2] ? parseFloat(hourMatch[2]) : lo; hlHours = (lo + hi) / 2; }
    if (!hlHours) {
      const dayMatch = hl.match(/(\d+(?:\.\d+)?)\s*(?:-\s*(\d+(?:\.\d+)?))?\s*days?/i);
      if (dayMatch) { const lo = parseFloat(dayMatch[1]); const hi = dayMatch[2] ? parseFloat(dayMatch[2]) : lo; hlHours = ((lo + hi) / 2) * 24; }
    }
    if (!hlHours) return null;
    const lastLog = [...compLogs].sort((a, b) =>
      new Date(`${b.date}T${b.time || '12:00'}`).getTime() - new Date(`${a.date}T${a.time || '12:00'}`).getTime()
    )[0];
    if (!lastLog) return null;
    const hoursSince = (Date.now() - new Date(`${lastLog.date}T${lastLog.time || '12:00'}`).getTime()) / (1000 * 60 * 60);
    const level = Math.max(0, Math.pow(0.5, hoursSince / hlHours) * 100);
    const timeLabel = hoursSince < 24 ? `${hoursSince.toFixed(0)}h ago` : `${(hoursSince / 24).toFixed(1)}d ago`;
    const status = level < 25 ? 'low' : level > 80 ? 'peak' : 'therapeutic';
    return { level, timeLabel, hlHours, status, halfLife: lib.halfLife };
  })();

  return (
    <div className="bg-[#0f172a]/70 border border-[#1e293b]/80 rounded-2xl p-5 shadow-lg relative flex flex-col justify-between animate-fadeIn" id={`compound-card-${comp.id}`}>
      <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl" style={{ backgroundColor: comp.color }} />

      <div className="space-y-4">
        <div className="flex justify-between items-start pt-1">
          <div>
            <h4 className="text-base font-bold text-slate-100 flex items-center gap-1.5 flex-wrap">
              <span>{comp.name}</span>
              {comp.isCompleted && (
                <span className="text-[9px] bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-mono font-bold tracking-wider">COMPLETED</span>
              )}
            </h4>
            <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-slate-500">{comp.type}</span>
          </div>
          {isConfirmingDelete ? (
            <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 p-1.5 rounded-xl text-[10px] select-none shrink-0" id={`confirm-delete-actions-${comp.id}`}>
              <span className="text-rose-400 font-bold font-mono uppercase tracking-widest text-[9px]">Delete?</span>
              <button type="button" onClick={() => { triggerHaptic('warning'); onDelete(comp.id); setIsConfirmingDelete(false); }}
                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 active:scale-[0.95] text-white rounded text-[9px] font-bold uppercase transition">Yes</button>
              <button type="button" onClick={() => { triggerHaptic('light'); setIsConfirmingDelete(false); }}
                className="px-2 py-1 bg-[#1e293b] hover:bg-slate-800 active:scale-[0.95] text-slate-300 border border-slate-700/50 rounded text-[9px] font-bold uppercase transition">No</button>
            </div>
          ) : (
            <div className="flex gap-1 shrink-0">
              <button onClick={() => { triggerHaptic('light'); onUpdateCompound({ ...comp, isCompleted: !comp.isCompleted }); }}
                className={`p-1.5 transition rounded-lg border cursor-pointer ${comp.isCompleted ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-[#1e293b]/30 border-transparent text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/5'}`}
                title={comp.isCompleted ? 'Mark schedule as running and active' : 'Mark schedule as successfully completed'}
                id={`toggle-complete-comp-${comp.id}`}>
                <CheckSquare className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => { triggerHaptic('light'); onEdit(comp); }}
                className="p-1.5 text-slate-400 hover:text-cyan-400 transition" title="Edit compound features" id={`edit-comp-${comp.id}`}>
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => { triggerHaptic('warning'); setIsConfirmingDelete(true); }}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 rounded transition" title="Terminate compound" id={`delete-comp-${comp.id}`}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 bg-[#1e293b]/20 p-2.5 rounded-xl border border-slate-800/80 text-[11px]">
          <div><span className="text-slate-500 block">Planned Dose</span><span className="font-mono font-semibold text-slate-300">{comp.doseAmount} {comp.doseUnit}</span></div>
          <div><span className="text-slate-500 block">Administration</span><span className="font-semibold text-slate-300 capitalize">{comp.frequency.replace('_', ' ')}</span></div>
          <div><span className="text-slate-500 block">Course Duration</span><span className="font-mono font-semibold text-slate-300">{comp.durationWeeks} Weeks</span></div>
          <div><span className="text-slate-500 block">Sequence Start</span><span className="font-mono font-semibold text-slate-300">{comp.startDate}</span></div>
        </div>

        <div className="space-y-1.5" id={`card-progress-bar-container-${comp.id}`}>
          <div className="flex justify-between items-center text-[10px] font-mono">
            <span className="text-slate-500">Cycle Duration Progress</span>
            <span className="font-bold text-slate-300">
              {comp.isCompleted ? '100% (Completed)' : `${roundedPct}% completed`}
              {!comp.isCompleted && daysRemaining > 0 && ` (${daysRemaining}d left)`}
            </span>
          </div>
          <div className="w-full bg-[#0f172a] h-1.5 rounded-full overflow-hidden border border-[#1e293b]/45">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${comp.isCompleted ? 100 : roundedPct}%`, backgroundColor: comp.isCompleted ? '#10b981' : comp.color }} />
          </div>
        </div>

        {comp.vialSizeMg && comp.bacWaterMl && (
          <div className="bg-cyan-500/5 border border-cyan-500/10 p-2.5 rounded-xl text-[10px] text-cyan-400 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-[11px]">Formula Reconstituted Ratio</span>
              Units required: <span className="font-bold underline">
                {(() => {
                  const doseInMcg = comp.doseUnit === 'mg' ? comp.doseAmount * 1000 : comp.doseAmount;
                  const mcgPerUnit = (comp.vialSizeMg * 1000) / (comp.bacWaterMl * 100);
                  return Math.round((doseInMcg / mcgPerUnit) * 10) / 10;
                })()} Units
              </span> on standard syringe ({comp.vialSizeMg}mg in {comp.bacWaterMl}ml).
            </div>
          </div>
        )}

        {peptideSupply && (
          <div className={`p-2.5 rounded-xl text-[10px] border flex flex-col gap-1.5 ${peptideSupply.lowSupply ? 'bg-red-500/5 border-red-500/20 text-red-300' : 'bg-cyan-500/5 border-cyan-500/10 text-cyan-400'}`}>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[11px] flex items-center gap-1">
                {peptideSupply.lowSupply ? <AlertTriangle className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5" />}
                Current Vial Supply
              </span>
              <span className="font-mono">{peptideSupply.remainingMg.toFixed(2)} / {comp.vialSizeMg} mg left</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-700/50 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${peptideSupply.pctUsed}%`, backgroundColor: peptideSupply.lowSupply ? '#f87171' : '#22d3ee' }} />
            </div>
            <span>{peptideSupply.dosesRemaining} dose{peptideSupply.dosesRemaining === 1 ? '' : 's'} remaining (~{peptideSupply.dosesPerVial.toFixed(1)} per vial){peptideSupply.lowSupply ? ' — running low, consider reordering' : ''}</span>
            {peptideSupply.lowSupply && onNavigateToTab && findShopProductMatch(comp.name, comp.vialSizeMg) && (
              <button type="button" onClick={() => { triggerHaptic('medium'); onNavigateToTab('shop'); }}
                className="mt-0.5 self-start bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-200 font-semibold rounded-lg px-2.5 py-1 text-[10px] transition-all cursor-pointer">
                Reorder in Shop →
              </button>
            )}
          </div>
        )}

        {(comp.type === 'steroid' || comp.type === 'supplement' || comp.type === 'compound') && comp.steroidForm && (
          <div className="bg-cyan-500/5 border border-cyan-500/10 p-2.5 rounded-xl text-[10px] text-cyan-400 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-[11px]">
                {comp.steroidForm === 'pill' ? 'Oral Tablet Formula Mapping' : 'Liquid Suspension Formula Mapping'}
              </span>
              {comp.steroidForm === 'pill' && comp.pillSizeMg && (
                <span>Dose requires taking <span className="font-bold underline">{Math.round((comp.doseAmount / comp.pillSizeMg) * 100) / 100} pills</span> per administration ({comp.pillSizeMg}mg per pill).</span>
              )}
              {comp.steroidForm === 'oil' && comp.oilConcMgMl && (
                <span>Dose requires drawing <span className="font-bold underline">{(comp.doseAmount / comp.oilConcMgMl).toFixed(2)} ml / cc</span> per administration ({comp.oilConcMgMl}mg/ml).</span>
              )}
            </div>
          </div>
        )}

        {oilSupply && (
          <div className={`p-2.5 rounded-xl text-[10px] border flex flex-col gap-1.5 ${oilSupply.lowSupply ? 'bg-red-500/5 border-red-500/20 text-red-300' : 'bg-cyan-500/5 border-cyan-500/10 text-cyan-400'}`}>
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[11px] flex items-center gap-1">
                {oilSupply.lowSupply ? <AlertTriangle className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5" />}
                Current Vial Supply
              </span>
              <span className="font-mono">{oilSupply.remainingMg.toFixed(0)} / {oilSupply.totalVialMg.toFixed(0)} mg left</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-700/50 overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${oilSupply.pctUsed}%`, backgroundColor: oilSupply.lowSupply ? '#f87171' : '#22d3ee' }} />
            </div>
            <span>{oilSupply.dosesRemaining} dose{oilSupply.dosesRemaining === 1 ? '' : 's'} remaining (~{oilSupply.dosesPerVial.toFixed(1)} per {oilSupply.vialMl}ml vial){oilSupply.lowSupply ? ' — running low, consider reordering' : ''}</span>
          </div>
        )}

        {decayLevel && (
          <div className="bg-indigo-950/20 border border-indigo-500/15 p-2.5 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-semibold text-indigo-300 flex items-center gap-1">
                <Activity className="w-3 h-3" /> Active Level
              </span>
              <span className="font-mono text-slate-400">
                {decayLevel.level.toFixed(0)}% · last dose {decayLevel.timeLabel}
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${decayLevel.level}%`,
                  backgroundColor: decayLevel.status === 'low' ? '#f87171' : decayLevel.status === 'peak' ? comp.color : '#f59e0b'
                }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-mono text-slate-600">
              <span>½-life: {decayLevel.halfLife}</span>
              <span className={decayLevel.status === 'low' ? 'text-rose-400' : decayLevel.status === 'peak' ? 'text-emerald-400' : 'text-amber-400'}>
                {decayLevel.status === 'low' ? '⚠ Low — consider redosing' : decayLevel.status === 'peak' ? '● Peak active range' : '● Therapeutic range'}
              </span>
            </div>
          </div>
        )}

        {comp.notes && (
          <p className="text-[11px] text-slate-400 italic bg-[#1e293b]/20 p-2.5 rounded-xl border border-slate-800/80">&ldquo;{comp.notes}&rdquo;</p>
        )}

        <div className="pt-2.5 border-t border-slate-800/40 mt-1 flex justify-end">
          <button type="button" onClick={() => { triggerHaptic('light'); onOpenRetroLog(comp.id); }}
            className="w-full py-2 px-3 bg-[#1e293b]/55 hover:bg-[#1e293b]/90 text-slate-300 hover:text-cyan-400 border border-slate-800 hover:border-cyan-500/30 text-[10.5px] font-extrabold uppercase tracking-wide font-mono rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            id={`sync-past-doses-btn-${comp.id}`}>
            <History className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
            <span>Retroactive Dose Sync</span>
          </button>
        </div>
      </div>
    </div>
  );
}
