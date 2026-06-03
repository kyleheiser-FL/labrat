import React, { useState, useEffect, useRef } from 'react';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Compound } from '../types';
import { PEPTIDE_LIBRARY } from '../data/peptides';

interface GanttTimelineProps {
  compounds: Compound[];
}

function ganttElapsedWeek(comp: Compound): number {
  const start = new Date(comp.startDate + 'T00:00:00');
  const today = new Date();
  const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const elapsed = Math.floor((todayMid.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (elapsed < 0) return 0;
  return Math.min(comp.durationWeeks, Math.floor(elapsed / 7) + 1);
}

function ganttLibraryItem(comp: Compound) {
  return PEPTIDE_LIBRARY.find(
    item => item.id === comp.id || item.name.toLowerCase() === comp.name.toLowerCase()
  );
}

function ganttPhaseInfo(comp: Compound, week: number) {
  const lib = ganttLibraryItem(comp);
  const ratio = week / comp.durationWeeks;
  const fallbackGains = lib?.realisticGains || 'Observational adjustments in wellness parameters, strength markers, and cellular efficiency.';
  const fallbackBenefits = lib?.benefits?.map(b => b.replace(/Plus \(\+\):\s*/g, '')) ?? [
    'Optimized cellular signaling active',
    'Stable hydration of target tissues',
    'Baseline metabolic enzymatic support',
  ];
  const fallbackWarnings = lib?.sideEffects?.map(b => b.replace(/Minus \(-\):\s*/g, '')) ?? [
    'Transient site irritability or injection flush',
    'Water dynamics fluctuation / minor tightness',
    'Monitor blood pressure values',
  ];
  const fallbackDiet = lib?.dietaryInteraction || 'Maintain standard balanced hydration and consistent macronutrient distribution.';

  if (ratio <= 0.25) {
    return {
      title: 'Phase I: Saturation & Physiological Onset',
      description: `Initial exposure (Week ${week} of ${comp.durationWeeks}). The active substance is gradually saturating plasma levels. Receptors are beginning to adapt, prompting early metabolic, structural, or recovery triggers.`,
      results: `Biological onset initiated. ${fallbackGains.slice(0, 160)}... Expected changes are starting to emerge on a cellular level.`,
      benefits: ['Uptake optimization beginning', fallbackBenefits[0] ?? 'Enhanced recovery initiation', fallbackBenefits[1] ?? 'Cellular hydration improvement'],
      warnings: ['Monitor for administration site stinging', fallbackWarnings[0] ?? 'Temporary minor headaches or flush', 'Keep baseline sodium intake moderate'],
      diet: `Induction optimization: ${fallbackDiet}`,
    };
  } else if (ratio <= 0.70) {
    return {
      title: 'Phase II: Steady-State Peak Bioactivity',
      description: `Therapeutic plateau (Week ${week} of ${comp.durationWeeks}). Peak steady-state concentration is achieved. Full systemic effects are active, driving accelerated tissue healing, lipolysis, endurance, or endocrine conversion.`,
      results: `${fallbackGains} Peak concentration allows maximum biological translation.`,
      benefits: fallbackBenefits.slice(0, 3),
      warnings: ['Watch for systemic adaptation thresholds', fallbackWarnings[0] ?? 'Mild muscle tightness or hydration retention', fallbackWarnings[1] ?? 'Nervous system saturation fatigue'],
      diet: `Steady-state performance fuel: ${fallbackDiet}`,
    };
  } else {
    return {
      title: 'Phase III: Mature Adaptation & Gain Consolidation',
      description: `Maturity & consolidation phase (Week ${week} of ${comp.durationWeeks}). The body has adapted to steady signaling. Gains in structural repair, cartilage remodeling, or fat oxidation are stabilizing into long-term tissue memory.`,
      results: 'Matured plateau. Systemic gains are consolidating. Maintain scheduling consistent — increasing dosages now generates diminishing returns.',
      benefits: ['Consolidation of structural tissue adapts', fallbackBenefits[fallbackBenefits.length - 1] ?? 'Optimized baseline healing state', 'Consistent tracking metric stability'],
      warnings: ['Watch for cumulative adaptation exhaustion', fallbackWarnings[fallbackWarnings.length - 1] ?? 'Mild lethargy or neural dampening', 'Check overall biomarkers (lipids/metabolics)'],
      diet: `Maturity consolidation: ${fallbackDiet}`,
    };
  }
}

export default function GanttTimeline({ compounds }: GanttTimelineProps) {
  const [selectedGanttId, setSelectedGanttId] = useState<string | null>(null);
  const [selectedGanttWeek, setSelectedGanttWeek] = useState<number | null>(null);
  const [phaseCardExpanded, setPhaseCardExpanded] = useState(false);
  const phaseDetailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ((selectedGanttId || selectedGanttWeek) && phaseDetailRef.current) {
      phaseDetailRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedGanttId, selectedGanttWeek]);

  if (compounds.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 text-xs">
        No compounds configured. Click "Formulate New Compound" above to map out a sequence.
      </div>
    );
  }

  const maxWeeks = Math.max(12, ...compounds.map(c => c.durationWeeks));
  const weeksHeader = Array.from({ length: maxWeeks }).map((_, i) => i + 1);
  const activeComp = compounds.find(c => c.id === selectedGanttId) ?? compounds[0];
  const activeWk = selectedGanttWeek ?? Math.max(1, ganttElapsedWeek(activeComp));
  const phase = ganttPhaseInfo(activeComp, activeWk);
  const libItem = ganttLibraryItem(activeComp);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2 text-[10px] font-mono leading-none items-center">
        <span className="flex items-center gap-1.5 bg-[#141b2e] border border-cyan-500/25 px-2.5 py-1.5 rounded-xl text-cyan-400 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
          Current Week
        </span>
        <span className="flex items-center gap-1.5 bg-indigo-950/40 border border-indigo-500/20 px-2.5 py-1.5 rounded-xl text-indigo-300 font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          Selected
        </span>
      </div>

      <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-800" id="gantt-chart-viewport">
        <div className="min-w-[700px] space-y-3.5">
          <div
            className="font-mono text-[10px] font-bold text-slate-500 border-b border-[#1e293b]/45 pb-2.5 cursor-default select-none"
            style={{ display: 'grid', gridTemplateColumns: `repeat(${maxWeeks + 3}, minmax(0, 1fr))`, gap: '6px' }}
          >
            <div className="col-span-3 text-left pl-2 text-slate-400 uppercase tracking-widest text-[9px] flex items-center">
              Substance / Schedule
            </div>
            {weeksHeader.map(w => (
              <div key={`wk-hdr-${w}`} className="col-span-1 flex justify-center items-center text-center">WK {w}</div>
            ))}
          </div>

          {compounds.map(comp => {
            const elapsedWk = ganttElapsedWeek(comp);
            const isSelectedComp = activeComp?.id === comp.id;
            return (
              <div
                key={`gantt-row-${comp.id}`}
                style={{ display: 'grid', gridTemplateColumns: `repeat(${maxWeeks + 3}, minmax(0, 1fr))`, gap: '6px' }}
                className="items-center"
              >
                <div
                  onClick={() => {
                    setSelectedGanttId(comp.id);
                    setSelectedGanttWeek(Math.max(1, Math.min(comp.durationWeeks, elapsedWk || 1)));
                  }}
                  className={`col-span-3 text-left pl-3 py-2 cursor-pointer transition rounded-xl border flex flex-col justify-center gap-0.5 ${isSelectedComp ? 'bg-[#1e293b]/60 border-slate-700/80' : 'hover:bg-[#1e293b]/20 border-transparent'}`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: comp.color }} />
                    <span className="text-xs font-bold text-slate-200 truncate">{comp.name}</span>
                  </div>
                  <div className="text-[9px] text-slate-500 font-mono truncate uppercase pl-3.5">
                    {comp.doseAmount}{comp.doseUnit} • {comp.frequency.replace('_', ' ')}
                  </div>
                </div>

                {weeksHeader.map((w, idx) => {
                  const isActive = idx < comp.durationWeeks;
                  const isCurrent = w === elapsedWk;
                  const isSelected = isSelectedComp && activeWk === w;
                  const isInitiation = w <= 2;
                  const isPeak = w > 2 && w <= Math.round(comp.durationWeeks * 0.7);
                  return (
                    <button
                      key={`cell-${comp.id}-${w}`}
                      disabled={!isActive}
                      onClick={() => { setSelectedGanttId(comp.id); setSelectedGanttWeek(w); }}
                      className={`col-span-1 h-12 relative flex flex-col justify-between items-center rounded-xl border text-[10px] font-mono transition-all py-2 select-none ${isActive ? 'cursor-pointer hover:scale-[1.03]' : 'cursor-not-allowed opacity-15 bg-slate-900/10 border-slate-900/20'}`}
                      style={
                        isActive && isSelected
                          ? { backgroundColor: `${comp.color}25`, borderColor: comp.color, color: '#f8fafc', boxShadow: `0 0 10px ${comp.color}20` }
                          : isActive
                          ? { backgroundColor: `${comp.color}08`, borderColor: `${comp.color}25` }
                          : {}
                      }
                    >
                      {isActive && isCurrent && (
                        <span className="absolute -top-1 -right-1 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
                        </span>
                      )}
                      <span className="text-[10px] font-semibold">{isActive ? comp.doseAmount : '—'}</span>
                      <div className="text-[8px] scale-90 tracking-tight text-slate-500 uppercase leading-none font-semibold">
                        {isActive ? (isInitiation ? 'Onset' : isPeak ? 'Peak' : 'Mature') : 'Off'}
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {activeComp && (
        <div
          ref={phaseDetailRef}
          className="bg-[#101b2e]/60 border border-slate-800/80 rounded-2xl shadow-xl text-left relative overflow-hidden transition-all duration-300"
          style={{ borderLeft: `4px solid ${activeComp.color}` }}
        >
          <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full opacity-[0.03] pointer-events-none" style={{ backgroundColor: activeComp.color }} />

          {/* Always-visible header — tap to expand/collapse */}
          <button
            type="button"
            onClick={() => setPhaseCardExpanded(v => !v)}
            className="w-full flex items-center justify-between gap-3 px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition text-left"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="text-[9px] font-mono font-bold bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded-full uppercase border border-indigo-500/10 shrink-0">
                Wk {activeWk} Phase Map
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase shrink-0" style={{ backgroundColor: `${activeComp.color}15`, color: activeComp.color, border: `1px solid ${activeComp.color}25` }}>
                {activeComp.type}
              </span>
              <span className="text-sm font-bold text-slate-200 truncate">{activeComp.name}</span>
              <span className="text-slate-500 font-mono text-[10px] font-normal hidden sm:inline shrink-0">({activeComp.doseAmount} {activeComp.doseUnit})</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-bold text-cyan-400 font-mono hidden sm:inline">{phaseCardExpanded ? 'Collapse' : 'Phase Details'}</span>
              {phaseCardExpanded
                ? <ChevronUp className="w-4 h-4 text-slate-400" />
                : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>
          </button>

          {/* Expandable body */}
          {phaseCardExpanded && (
            <div className="px-5 pb-5 border-t border-[#1e293b]/60">
              <div className="flex gap-2 text-xs font-mono pt-4 pb-4">
                <div className="bg-slate-900/45 border border-slate-800 px-3 py-1.5 rounded-xl text-left min-w-[85px]">
                  <span className="text-[8px] text-slate-500 block uppercase font-bold">Half-life</span>
                  <span className="text-[10px] text-slate-300 font-semibold truncate block mt-0.5">{libItem?.halfLife || 'Variable/N/A'}</span>
                </div>
                <div className="bg-slate-900/45 border border-slate-800 px-3 py-1.5 rounded-xl text-left min-w-[85px]">
                  <span className="text-[8px] text-slate-500 block uppercase font-bold">Form</span>
                  <span className="text-[10px] text-slate-300 font-semibold uppercase mt-0.5 block truncate">{activeComp.steroidForm || activeComp.type || 'Pill'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                <div className="lg:col-span-7 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold font-mono tracking-wider" style={{ color: activeComp.color }}>Active Phase</span>
                    <h5 className="text-sm font-bold text-slate-200">{phase.title}</h5>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1">{phase.description}</p>
                  </div>
                  <div className="space-y-1.5 bg-[#0f172a]/30 border border-[#1e293b]/40 p-3.5 rounded-xl">
                    <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase tracking-wider block">Expected Outcomes</span>
                    <p className="text-xs text-slate-300 leading-relaxed">{phase.results}</p>
                  </div>
                </div>
                <div className="lg:col-span-5 space-y-4 text-xs font-mono">
                  <div className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-xl space-y-2.5">
                    <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider block">✓ Target Results</span>
                    <ul className="space-y-2 text-slate-300">
                      {phase.benefits.map((b, i) => (
                        <li key={i} className="flex items-start gap-2 leading-relaxed">
                          <span className="text-emerald-400 shrink-0 font-bold">•</span>
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-rose-950/20 border border-rose-500/20 p-4 rounded-xl space-y-2.5">
                    <span className="text-[9px] text-rose-400 font-bold uppercase tracking-wider block">⚠ Adaptation Warnings</span>
                    <ul className="space-y-2 text-slate-300">
                      {phase.warnings.map((w, i) => (
                        <li key={i} className="flex items-start gap-2 leading-relaxed">
                          <span className="text-rose-400 shrink-0 font-bold">•</span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {phase.diet && (
                <div className="mt-4 pt-3 border-t border-[#1e293b]/60 flex items-start gap-2 text-xs md:items-center">
                  <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-400">Dietary Co-Factors: </span>
                    <span className="text-slate-300">{phase.diet}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
