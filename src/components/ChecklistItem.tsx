import React from 'react';
import { CheckCircle2, Circle, Syringe, CheckSquare } from 'lucide-react';
import { Compound, DoseLog, formatTimeTo12Hour } from '../types';
import SyringeVisual from './SyringeVisual';

interface ChecklistItemProps {
  compound: Compound;
  weekNo: number;
  isLogged: boolean;
  matchedLog: DoseLog | undefined;
  onAdminister: (compound: Compound) => void;
}

export default function ChecklistItem({ compound, weekNo, isLogged, matchedLog, onAdminister }: ChecklistItemProps) {
  let needleDrawUnits: number | null = null;
  if (compound.vialSizeMg && compound.bacWaterMl) {
    const perUnit = (compound.vialSizeMg * 1000) / (compound.bacWaterMl * 100);
    const doseInMcg = compound.doseUnit === 'mg' ? compound.doseAmount * 1000 : compound.doseAmount;
    needleDrawUnits = Math.round((doseInMcg / perUnit) * 10) / 10;
  }

  return (
    <div
      className={`border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 ${
        isLogged
          ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-400'
          : 'bg-[#1e293b]/25 border-slate-800/80 hover:border-slate-700/80'
      }`}
      id={`checklist-item-${compound.id}`}
    >
      <div className="flex items-start gap-3.5">
        <button
          onClick={() => onAdminister(compound)}
          disabled={isLogged}
          className="mt-1.5 shrink-0 transition-transform active:scale-95 cursor-pointer"
          id={`log-checkbox-${compound.id}`}
        >
          {isLogged ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <Circle className="w-5 h-5 text-slate-500 hover:text-cyan-400" />
          )}
        </button>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: compound.color }} />
            <span className={`text-sm font-bold ${isLogged ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{compound.name}</span>
            <span className="text-[9px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase">{compound.type}</span>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            Week {weekNo} of {compound.durationWeeks} • Target: {compound.doseAmount} {compound.doseUnit} ({compound.frequency.replace('_', ' ')})
          </div>

          {!isLogged && (
            <>
              {needleDrawUnits !== null && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[10px] text-cyan-400 bg-cyan-950/20 border border-cyan-900/10 py-1 px-2 rounded-md font-mono w-fit">
                    <Syringe className="w-3.5 h-3.5" />
                    <span>Draw <strong className="font-extrabold text-cyan-300">{needleDrawUnits}</strong> Syringe Units</span>
                  </div>
                  <div className="max-w-[220px]">
                    <SyringeVisual units={needleDrawUnits} maxUnits={100} unitLabel="units" />
                  </div>
                </div>
              )}
              {(compound.type === 'steroid' || compound.type === 'supplement' || compound.type === 'compound') && compound.steroidForm === 'pill' && compound.pillSizeMg && (
                <div className="flex items-center gap-1.5 text-[10px] text-cyan-400 bg-cyan-950/20 border border-cyan-900/10 py-1 px-2 rounded-md font-mono mt-2 w-fit">
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>
                    Take <strong className="font-extrabold text-cyan-300">{Math.round((compound.doseAmount / compound.pillSizeMg) * 100) / 100}</strong>{' '}
                    {Math.round((compound.doseAmount / compound.pillSizeMg) * 100) / 100 === 1 ? 'pill' : 'pills'} ({compound.pillSizeMg}mg each)
                  </span>
                </div>
              )}
              {(compound.type === 'steroid' || compound.type === 'supplement' || compound.type === 'compound') && compound.steroidForm === 'oil' && compound.oilConcMgMl && (() => {
                const ml = Math.round((compound.doseAmount / compound.oilConcMgMl) * 100) / 100;
                const maxMl = Math.max(1, Math.ceil(ml * 2));
                return (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] text-cyan-400 bg-cyan-950/20 border border-cyan-900/10 py-1 px-2 rounded-md font-mono w-fit">
                      <Syringe className="w-3.5 h-3.5" />
                      <span>Draw <strong className="font-extrabold text-cyan-300">{ml}</strong> ml / cc ({compound.oilConcMgMl}mg/ml)</span>
                    </div>
                    <div className="max-w-[220px]">
                      <SyringeVisual units={ml} maxUnits={maxMl} unitLabel="ml" />
                    </div>
                  </div>
                );
              })()}
            </>
          )}

          {isLogged && matchedLog && (
            <span className="text-[11px] text-emerald-400 font-medium block mt-1.5">
              ✓ Administered & Logged at {formatTimeTo12Hour(matchedLog.time)}
            </span>
          )}
        </div>
      </div>

      {!isLogged && (
        <button
          onClick={() => onAdminister(compound)}
          className="py-1.5 px-3 bg-[#1e293b] hover:bg-cyan-500 hover:text-slate-950 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 border border-slate-700/60 transition"
          id={`administer-btn-${compound.id}`}
        >
          Log Administration
        </button>
      )}
    </div>
  );
}
