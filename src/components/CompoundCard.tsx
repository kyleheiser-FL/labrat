import React, { useState } from 'react';
import { AlertTriangle, Activity, CheckSquare, Edit, Trash2, Info, History, ChevronDown, ChevronUp } from 'lucide-react';
import { Compound, DoseLog } from '../types';
import { triggerHaptic } from '../lib/haptics';
import { findShopProductMatch } from '../lib/shopHelpers';
import { PEPTIDE_LIBRARY } from '../data/peptides';
import { ganttElapsedWeek, ganttLibraryItem, ganttPhaseInfo } from './GanttTimeline';

interface CompoundCardProps {
  compound: Compound;
  logs: DoseLog[];
  onEdit: (compound: Compound) => void;
  onDelete: (id: string) => void;
  onUpdateCompound: (compound: Compound) => void;
  onOpenRetroLog: (compoundId: string) => void;
  onNavigateToTab?: (tab: 'dashboard' | 'planner' | 'blood' | 'library' | 'stats' | 'shop' | 'settings') => void;
  compact?: boolean;
  hideActions?: boolean;
}

export default function CompoundCard({ compound: comp, logs, onEdit, onDelete, onUpdateCompound, onOpenRetroLog, onNavigateToTab, compact = false, hideActions = false }: CompoundCardProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [phaseExpanded, setPhaseExpanded] = useState(false);
  const loggedCount = logs.filter(l => l.compoundId === comp.id).length;
  const isLightTheme = typeof document !== 'undefined' && document.documentElement.getAttribute('data-labrat-theme') === 'clinical-light';

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
    if (!lastLog) return { level: null, timeLabel: null, hlHours, status: 'unlogged' as const, halfLife: lib.halfLife };
    const hoursSince = (Date.now() - new Date(`${lastLog.date}T${lastLog.time || '12:00'}`).getTime()) / (1000 * 60 * 60);
    const level = Math.max(0, Math.pow(0.5, hoursSince / hlHours) * 100);
    const timeLabel = hoursSince < 24 ? `${hoursSince.toFixed(0)}h ago` : `${(hoursSince / 24).toFixed(1)}d ago`;
    const status = level < 25 ? 'low' as const : level > 80 ? 'peak' as const : 'therapeutic' as const;
    return { level, timeLabel, hlHours, status, halfLife: lib.halfLife };
  })();

  return (
    <div className="labrat-card p-5 relative flex flex-col justify-between animate-fadeIn min-w-0 overflow-hidden" id={`compound-card-${comp.id}`}>
      <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl" style={{ backgroundColor: comp.color }} />

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 pt-1">
          <div className="min-w-0 w-full sm:w-auto">
            <h4 className="text-base font-bold text-slate-100 flex items-center gap-1.5 flex-wrap">
              <span>{comp.name}</span>
              {comp.isCompleted && (
                <span className="labrat-status-badge text-emerald-400 border-emerald-500/20 bg-emerald-500/15 px-1.5 py-0.2">COMPLETED</span>
              )}
            </h4>
            <span className="labrat-status-badge mt-1">{comp.type}</span>
          </div>
          {hideActions ? null : isConfirmingDelete ? (
            <div className="grid grid-cols-[1fr_auto_auto] sm:flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 p-1.5 rounded-xl text-[10px] select-none w-full sm:w-auto sm:shrink-0" id={`confirm-delete-actions-${comp.id}`}>
              <span className="text-rose-400 font-bold font-mono uppercase tracking-widest text-[9px]">Delete?</span>
              <button type="button" onClick={() => { triggerHaptic('warning'); onDelete(comp.id); setIsConfirmingDelete(false); }}
                className="px-2 py-1 bg-rose-600 hover:bg-rose-700 active:scale-[0.95] text-white rounded text-[9px] font-bold uppercase transition">Yes</button>
              <button type="button" onClick={() => { triggerHaptic('light'); setIsConfirmingDelete(false); }}
                className="px-2 py-1 bg-[#1e293b] hover:bg-slate-800 active:scale-[0.95] text-slate-300 border border-slate-700/50 rounded text-[9px] font-bold uppercase transition">No</button>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:flex items-center gap-1.5 w-full sm:w-auto sm:shrink-0">
              <button onClick={() => { triggerHaptic('light'); onUpdateCompound({ ...comp, isCompleted: !comp.isCompleted }); }}
                className={`min-w-0 px-2 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wide transition cursor-pointer whitespace-nowrap ${comp.isCompleted ? 'bg-emerald-500/12 border-emerald-500/30 text-emerald-400' : 'bg-[#1e293b]/40 border-slate-700/50 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30'}`}
                id={`toggle-complete-comp-${comp.id}`}>
                {comp.isCompleted ? 'Reopen' : 'Mark done'}
              </button>
              <button onClick={() => { triggerHaptic('light'); onEdit(comp); }}
                className="min-w-0 px-2 py-1.5 rounded-lg border border-slate-700/50 bg-[#1e293b]/40 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/30 text-[10px] font-bold uppercase tracking-wide transition cursor-pointer whitespace-nowrap" id={`edit-comp-${comp.id}`}>
                Edit
              </button>
              <button onClick={() => { triggerHaptic('warning'); setIsConfirmingDelete(true); }}
                className="min-w-0 px-2 py-1.5 rounded-lg border border-slate-700/50 bg-[#1e293b]/40 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 text-[10px] font-bold uppercase tracking-wide transition cursor-pointer whitespace-nowrap" id={`delete-comp-${comp.id}`}>
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="labrat-mini-surface grid grid-cols-2 gap-2 p-2.5 text-[11px]">
          <div><span className="text-slate-500 block">Planned Dose</span><span className="font-mono font-semibold text-slate-300">{comp.doseAmount} {comp.doseUnit}</span></div>
          <div><span className="text-slate-500 block">Course Duration</span><span className="font-mono font-semibold text-slate-300">{comp.durationWeeks} Weeks</span></div>
          <div><span className="text-slate-500 block">Sequence Start</span><span className="font-mono font-semibold text-slate-300">{comp.startDate}</span></div>
          <div><span className="text-slate-500 block">Doses Logged</span><span className="font-mono font-semibold text-emerald-400">{loggedCount} dose{loggedCount === 1 ? '' : 's'}</span></div>
          <div className="col-span-2 pt-2 mt-0.5 border-t border-slate-800/60">
            <span className="text-slate-500 block">Administration Frequency</span>
            <span className="font-semibold text-slate-200 capitalize text-[12px] leading-snug">
              {comp.frequency === 'daily' ? 'Every day'
                : comp.frequency === 'eod' ? 'Every other day'
                : comp.frequency === 'twice_weekly' ? 'Twice a week'
                : comp.frequency === 'weekly' ? 'Once a week'
                : `Every ${comp.customDays || 3} days`}
            </span>
          </div>
        </div>

        {!compact && (<>
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
          <div className="labrat-mini-surface p-2.5 text-[10px] text-cyan-400 flex items-start gap-1.5">
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

        {(comp.type === 'steroid' || comp.type === 'supplement' || comp.type === 'compound') && comp.steroidForm && (
          <div className="labrat-mini-surface p-2.5 text-[10px] text-cyan-400 flex items-start gap-1.5">
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

        {decayLevel && (
          <div className="labrat-mini-surface p-2.5 space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="font-semibold text-indigo-300 flex items-center gap-1">
                <Activity className="w-3 h-3" /> Active Level
              </span>
              <span className="font-mono text-slate-400">
                {decayLevel.status === 'unlogged'
                  ? 'No doses logged yet'
                  : `${decayLevel.level!.toFixed(0)}% · last dose ${decayLevel.timeLabel}`}
              </span>
            </div>
            {decayLevel.status !== 'unlogged' && (
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${decayLevel.level}%`,
                    backgroundColor: decayLevel.status === 'low' ? '#f87171' : decayLevel.status === 'peak' ? comp.color : '#f59e0b'
                  }}
                />
              </div>
            )}
            <div className="flex justify-between text-[9px] font-mono text-slate-600">
              <span>½-life: {decayLevel.halfLife}</span>
              {decayLevel.status !== 'unlogged' && (
                <span className={decayLevel.status === 'low' ? 'text-rose-400' : decayLevel.status === 'peak' ? 'text-emerald-400' : 'text-amber-400'}>
                  {decayLevel.status === 'low' ? '⚠ Low — consider redosing' : decayLevel.status === 'peak' ? '● Peak active range' : '● Therapeutic range'}
                </span>
              )}
            </div>
          </div>
        )}

        {comp.notes && (
          <p className="labrat-mini-surface text-[11px] text-slate-400 italic p-2.5">&ldquo;{comp.notes}&rdquo;</p>
        )}

        {/* Mini week timeline strip */}
        {!comp.isCompleted && (() => {
          const elapsedWk = ganttElapsedWeek(comp);
          const activeWk = selectedWeek ?? elapsedWk;
          const weeks = Array.from({ length: comp.durationWeeks }, (_, i) => i + 1);
          const phase = ganttPhaseInfo(comp, activeWk);
          const libItem = ganttLibraryItem(comp);
          return (
            <div className="space-y-2">
              <div className="overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin scrollbar-thumb-slate-800">
                <div className="flex gap-1.5 min-w-max">
                  {weeks.map(w => {
                    const isCurrent = w === elapsedWk;
                    const isSelected = w === activeWk;
                    const isInitiation = w <= 2;
                    const isPeak = w > 2 && w <= Math.round(comp.durationWeeks * 0.7);
                    const phaseLabel = isInitiation ? 'Onset' : isPeak ? 'Peak' : 'Late';
                    return (
                      <button
                        key={w}
                        type="button"
                        onClick={() => { setSelectedWeek(w); setPhaseExpanded(true); }}
                        className="relative flex flex-col items-center justify-between rounded-lg border text-[9px] font-mono py-1.5 px-2 min-w-[36px] transition-all cursor-pointer hover:scale-105 select-none"
                        style={
                          isSelected
                            ? { backgroundColor: isLightTheme ? `${comp.color}22` : `${comp.color}25`, borderColor: comp.color, color: isLightTheme ? '#0f172a' : '#f8fafc', boxShadow: isLightTheme ? `0 2px 8px ${comp.color}30` : `0 0 8px ${comp.color}30` }
                            : { backgroundColor: isLightTheme ? `${comp.color}14` : `${comp.color}08`, borderColor: isLightTheme ? `${comp.color}60` : `${comp.color}20`, color: isLightTheme ? '#334155' : '#94a3b8' }
                        }
                      >
                        {isCurrent && (
                          <span className="absolute -top-1 -right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
                          </span>
                        )}
                        <span className="font-bold text-[9px]">{w}</span>
                        <span className="text-[8px] opacity-70 mt-0.5">{phaseLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Phase detail — collapsible */}
              <button
                type="button"
                onClick={() => setPhaseExpanded(v => !v)}
                className="w-full flex items-center justify-between text-[10px] font-mono text-slate-500 hover:text-slate-300 transition px-0.5 cursor-pointer"
              >
                <span>Wk {activeWk} — {phase.title}</span>
                {phaseExpanded ? <ChevronUp className="w-3 h-3 shrink-0" /> : <ChevronDown className="w-3 h-3 shrink-0" />}
              </button>

              {phaseExpanded && (
                <div className="bg-[#101b2e]/60 border border-slate-800/60 rounded-xl p-3.5 space-y-3 text-xs">
                  <p className="text-slate-400 leading-relaxed">{phase.description}</p>
                  <div className="bg-[#0f172a]/40 border border-[#1e293b]/40 p-2.5 rounded-lg">
                    <span className="text-[9px] text-cyan-400 font-mono font-bold uppercase tracking-wider block mb-1">Expected Outcomes</span>
                    <p className="text-slate-300 leading-relaxed text-[11px]">{phase.results}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-emerald-950/20 border border-emerald-500/15 p-2.5 rounded-lg space-y-1">
                      <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider block">✓ Target Results</span>
                      <ul className="space-y-1">
                        {phase.benefits.map((b, i) => (
                          <li key={i} className="text-[10px] text-slate-300 flex gap-1.5"><span className="text-emerald-400 shrink-0">•</span>{b}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-rose-950/20 border border-rose-500/15 p-2.5 rounded-lg space-y-1">
                      <span className="text-[9px] text-rose-400 font-bold uppercase tracking-wider block">⚠ Warnings</span>
                      <ul className="space-y-1">
                        {phase.warnings.map((w, i) => (
                          <li key={i} className="text-[10px] text-slate-300 flex gap-1.5"><span className="text-rose-400 shrink-0">•</span>{w}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  {phase.diet && (
                    <div className="flex items-start gap-1.5 text-[10px] text-slate-400 pt-1 border-t border-slate-800/40">
                      <Info className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
                      <span><strong className="text-slate-300">Diet:</strong> {phase.diet}</span>
                    </div>
                  )}
                  {libItem?.halfLife && (
                    <div className="flex gap-3 text-[9px] font-mono text-slate-500 pt-1 border-t border-slate-800/40">
                      <span>½-life: {libItem.halfLife}</span>
                      <span>Form: {comp.steroidForm || comp.type}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {!hideActions && (
        <div className="pt-2.5 border-t border-slate-800/40 mt-1 flex justify-end">
          <button type="button" onClick={() => { triggerHaptic('light'); onOpenRetroLog(comp.id); }}
            className="w-full py-2 px-3 bg-[#1e293b]/55 hover:bg-[#1e293b]/90 text-slate-300 hover:text-cyan-400 border border-slate-800 hover:border-cyan-500/30 text-[10.5px] font-extrabold uppercase tracking-wide font-mono rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            id={`sync-past-doses-btn-${comp.id}`}>
            <History className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
            <span>Retroactive Dose Sync</span>
          </button>
        </div>
        )}
        </>)}
      </div>
    </div>
  );
}
