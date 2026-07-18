import React, { useState, useEffect } from 'react';
import { localDateISO } from '../lib/date';
import { createPortal } from 'react-dom';
import { History, Info, Clock, Trash2 } from 'lucide-react';
import { Compound, DoseLog, formatTimeTo12Hour } from '../types';
import { triggerHaptic } from '../lib/haptics';
import SyringeVisual from './SyringeVisual';

interface RetroactiveLogModalProps {
  compound: Compound | null;
  logs: DoseLog[];
  onLogDose?: (log: DoseLog) => void;
  onBatchLogDoses?: (logs: DoseLog[]) => void;
  onUndoDose?: (id: string) => void;
  onUpdateCompound: (compound: Compound) => void;
  onClose: () => void;
}

function getDatesForFrequency(start: string, end: string, freq: 'daily' | 'eod' | 'twice_weekly' | 'weekly'): string[] {
  const dates: string[] = [];
  const curr = new Date(start + 'T00:00:00');
  const last = new Date(end + 'T00:00:00');
  if (curr > last) return [];
  let count = 0;
  while (curr <= last && count < 200) {
    dates.push(localDateISO(curr));
    count++;
    if (freq === 'daily') curr.setDate(curr.getDate() + 1);
    else if (freq === 'eod') curr.setDate(curr.getDate() + 2);
    else if (freq === 'twice_weekly') curr.setDate(curr.getDate() + 3);
    else curr.setDate(curr.getDate() + 7);
  }
  return dates;
}

function calcQtyText(comp: Compound): string | undefined {
  if (comp.vialSizeMg && comp.bacWaterMl) {
    const doseInMcg = comp.doseUnit === 'mg' ? comp.doseAmount * 1000 : comp.doseAmount;
    const units = Math.round((doseInMcg / ((comp.vialSizeMg * 1000) / (comp.bacWaterMl * 100))) * 10) / 10;
    return `${units} Units`;
  }
  if ((comp.type === 'steroid' || comp.type === 'supplement' || comp.type === 'compound') && comp.steroidForm === 'pill' && comp.pillSizeMg) {
    const pills = Math.round((comp.doseAmount / comp.pillSizeMg) * 100) / 100;
    return `${pills} ${pills === 1 ? 'pill' : 'pills'} (${comp.pillSizeMg}mg each)`;
  }
  if ((comp.type === 'steroid' || comp.type === 'supplement' || comp.type === 'compound') && comp.steroidForm === 'oil' && comp.oilConcMgMl) {
    return `${(comp.doseAmount / comp.oilConcMgMl).toFixed(2)} ml / cc (${comp.oilConcMgMl}mg/ml)`;
  }
  return undefined;
}

export default function RetroactiveLogModal({ compound, logs, onLogDose, onBatchLogDoses, onUndoDose, onUpdateCompound, onClose }: RetroactiveLogModalProps) {
  const [retroTab, setRetroTab] = useState<'single' | 'batch'>('single');
  const [retroSingleDate, setRetroSingleDate] = useState(localDateISO());
  const [retroSingleTime, setRetroSingleTime] = useState('08:00');
  const [retroSingleAmount, setRetroSingleAmount] = useState('');
  const [retroSingleUnits, setRetroSingleUnits] = useState('');
  const [retroBatchStart, setRetroBatchStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return localDateISO(d);
  });
  const [retroBatchEnd, setRetroBatchEnd] = useState(localDateISO());
  const [retroBatchFreq, setRetroBatchFreq] = useState<'daily' | 'eod' | 'twice_weekly' | 'weekly'>('daily');
  const [confirmDeleteLogId, setConfirmDeleteLogId] = useState<string | null>(null);

  useEffect(() => {
    if (!compound) return;
    setRetroSingleAmount(compound.doseAmount.toString());
    setRetroBatchFreq(compound.frequency === 'custom' ? 'daily' : (compound.frequency as any));
    if (compound.type === 'peptide' && compound.vialSizeMg && compound.bacWaterMl) {
      const perUnit = (compound.vialSizeMg * 1000) / (compound.bacWaterMl * 100);
      const doseInMcg = compound.doseUnit === 'mg' ? compound.doseAmount * 1000 : compound.doseAmount;
      setRetroSingleUnits(String(Math.round((doseInMcg / perUnit) * 10) / 10));
    } else if (compound.steroidForm === 'oil' && compound.oilConcMgMl) {
      setRetroSingleUnits(String(Math.round((compound.doseAmount / compound.oilConcMgMl) * 100) / 100));
    } else {
      setRetroSingleUnits('');
    }
  }, [compound]);

  if (!compound || typeof window === 'undefined') return null;

  const retroLogs = logs.filter(l => l.compoundId === compound.id);
  const sortedRetroLogs = [...retroLogs].sort((a, b) => {
    const d = b.date.localeCompare(a.date);
    return d !== 0 ? d : b.time.localeCompare(a.time);
  });
  const batchDates = getDatesForFrequency(retroBatchStart, retroBatchEnd, retroBatchFreq);

  const handleAddSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onLogDose) return;
    const reconstitutedRatio = compound.vialSizeMg && compound.bacWaterMl ? {
      vialSizeMg: compound.vialSizeMg,
      bacWaterMl: compound.bacWaterMl,
      syringeUnits: Math.round(((compound.doseUnit === 'mg' ? compound.doseAmount * 1000 : compound.doseAmount) / ((compound.vialSizeMg * 1000) / (compound.bacWaterMl * 100))) * 10) / 10
    } : undefined;
    onLogDose({
      id: crypto.randomUUID(),
      compoundId: compound.id,
      compoundName: compound.name,
      date: retroSingleDate,
      time: retroSingleTime,
      doseAmount: parseFloat(retroSingleAmount) || compound.doseAmount,
      doseUnit: compound.doseUnit,
      reconstitutedRatio,
      calculatedQtyText: calcQtyText(compound)
    });
    triggerHaptic('success');
  };

  const handleAddBatch = () => {
    if (batchDates.length === 0 || !onBatchLogDoses) return;
    const reconstitutedRatio = compound.vialSizeMg && compound.bacWaterMl ? {
      vialSizeMg: compound.vialSizeMg,
      bacWaterMl: compound.bacWaterMl,
      syringeUnits: Math.round(((compound.doseUnit === 'mg' ? compound.doseAmount * 1000 : compound.doseAmount) / ((compound.vialSizeMg * 1000) / (compound.bacWaterMl * 100))) * 10) / 10
    } : undefined;
    onBatchLogDoses(batchDates.map(dStr => ({
      id: crypto.randomUUID(),
      compoundId: compound.id,
      compoundName: compound.name,
      date: dStr,
      time: '08:00',
      doseAmount: parseFloat(retroSingleAmount) || compound.doseAmount,
      doseUnit: compound.doseUnit,
      reconstitutedRatio,
      calculatedQtyText: calcQtyText(compound)
    })));
    triggerHaptic('success');
  };

  const isPeptideRecon = compound.type === 'peptide' && !!compound.vialSizeMg && !!compound.bacWaterMl;
  const isOilRecon = compound.steroidForm === 'oil' && !!compound.oilConcMgMl;
  const hasUnitField = isPeptideRecon || isOilRecon;

  const syringeUnits = parseFloat(retroSingleUnits);

  return createPortal(
    <div className="fixed inset-0 bg-[#020617]/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-[60]" id="retroactive-sync-overlay">
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-3xl p-4 sm:p-6 w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[92vh] text-left" id="retroactive-sync-modal" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start pb-4 border-b border-[#1e293b] shrink-0">
          <div>
            <h4 className="text-base sm:text-lg font-black text-slate-100 flex items-center gap-1.5 uppercase tracking-wider font-mono">
              <History className="w-5 h-5 text-cyan-400" />
              <span>Retroactive Sync</span>
            </h4>
            <p className="text-[10.5px] text-cyan-400 font-bold font-mono mt-0.5 uppercase tracking-wide">{compound.name} ({compound.type})</p>
          </div>
          <button type="button" onClick={() => { triggerHaptic('light'); onClose(); }}
            className="p-1 px-3 border border-slate-800 hover:border-slate-700 bg-[#1e293b]/40 hover:bg-[#1e293b] text-slate-400 hover:text-slate-200 text-xs font-bold rounded-lg transition"
            id="close-retro-sync-btn">Close</button>
        </div>

        <div className="bg-slate-900/50 p-3.5 rounded-2xl border border-slate-800/80 text-[11px] text-slate-400 mt-3 leading-relaxed flex items-start gap-2.5 shrink-0">
          <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <p>Your protocol schedule automatically centers on your <strong>first documented dosing log</strong>. Log past data below to backdate your protocol safely without losing historical synchronization.</p>
            {sortedRetroLogs.length > 0 && (
              <div className="mt-1 text-cyan-300 font-mono font-bold">
                Earliest Dose Detected: {sortedRetroLogs[sortedRetroLogs.length - 1].date} &rarr; Protocol has automatically shifted its start parameters to match.
              </div>
            )}
          </div>
        </div>

        <div className="flex bg-[#0f172a] border border-[#1e293b] rounded-xl p-1 mt-4 shrink-0">
          {(['single', 'batch'] as const).map(tab => (
            <button key={tab} type="button" onClick={() => { triggerHaptic('light'); setRetroTab(tab); }}
              className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${retroTab === tab ? 'bg-[#1e293b] text-slate-100 shadow' : 'text-slate-400 hover:text-slate-200'}`}>
              {tab === 'single' ? 'Single past dose' : 'Batch Generate Range'}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto flex-grow my-4 pr-1 custom-scrollbar space-y-4 font-sans">
          {retroTab === 'single' ? (
            <form onSubmit={handleAddSingle} className="bg-slate-900/20 p-4 border border-slate-800/60 rounded-2xl space-y-4">
              <h5 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">Input Single Past Dose Log</h5>
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Date</label>
                  <input type="date" required value={retroSingleDate} onChange={(e) => setRetroSingleDate(e.target.value)}
                    className="w-full bg-[#1e293b]/45 border border-slate-700/60 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/80 transition" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Time</label>
                  <input type="time" required value={retroSingleTime} onChange={(e) => setRetroSingleTime(e.target.value)}
                    className="w-full bg-[#1e293b]/45 border border-slate-700/60 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/80 transition" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Dose ({compound.doseUnit})</label>
                  <input type="number" step="any" required value={retroSingleAmount}
                    onChange={(e) => {
                      const val = e.target.value;
                      setRetroSingleAmount(val);
                      const d = parseFloat(val);
                      if (!isNaN(d)) {
                        if (isPeptideRecon) {
                          const perUnit = (compound.vialSizeMg! * 1000) / (compound.bacWaterMl! * 100);
                          const doseInMcg = compound.doseUnit === 'mg' ? d * 1000 : d;
                          setRetroSingleUnits(String(Math.round((doseInMcg / perUnit) * 10) / 10));
                        } else if (isOilRecon) {
                          setRetroSingleUnits(String(Math.round((d / compound.oilConcMgMl!) * 100) / 100));
                        }
                      }
                    }}
                    className="w-full bg-[#1e293b]/45 border border-slate-700/60 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/80 transition" />
                </div>
                {hasUnitField ? (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">{isPeptideRecon ? 'Syringe Units' : 'Volume (ml)'}</label>
                    <input type="number" step="any" value={retroSingleUnits}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRetroSingleUnits(val);
                        const u = parseFloat(val);
                        if (!isNaN(u)) {
                          if (isPeptideRecon) {
                            const perUnit = (compound.vialSizeMg! * 1000) / (compound.bacWaterMl! * 100);
                            const rawMcg = u * perUnit;
                            const dose = compound.doseUnit === 'mg' ? rawMcg / 1000 : rawMcg;
                            setRetroSingleAmount(String(Math.round(dose * 10) / 10));
                          } else if (isOilRecon) {
                            setRetroSingleAmount(String(Math.round(u * compound.oilConcMgMl! * 10) / 10));
                          }
                        }
                      }}
                      className="w-full bg-[#1e293b]/45 border border-slate-700/60 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/80 transition" />
                  </div>
                ) : (
                  <div className="flex items-end">
                    <button type="submit" className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider font-mono rounded-xl transition cursor-pointer">Append Log</button>
                  </div>
                )}
              </div>

              {hasUnitField && !isNaN(syringeUnits) && syringeUnits > 0 && (
                <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-3">
                  <SyringeVisual units={syringeUnits} maxUnits={isPeptideRecon ? 100 : Math.max(1, Math.ceil(syringeUnits * 2))} unitLabel={isPeptideRecon ? 'units' : 'ml'} />
                </div>
              )}

              {(() => {
                const parsed = parseFloat(retroSingleAmount);
                if (isNaN(parsed) || parsed === compound.doseAmount) return null;
                return (
                  <div className="flex items-center gap-3 bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                    <div className="flex-1 text-[11px] text-amber-300 leading-snug">
                      This dose ({parsed} {compound.doseUnit}) differs from the scheduled dose ({compound.doseAmount} {compound.doseUnit}). Update the protocol going forward?
                    </div>
                    <button type="button" onClick={() => { triggerHaptic('medium'); onUpdateCompound({ ...compound, doseAmount: parsed }); }}
                      className="shrink-0 py-1.5 px-3 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 rounded-lg text-[11px] font-bold cursor-pointer transition">
                      Update Protocol Dose
                    </button>
                  </div>
                );
              })()}

              {hasUnitField && (
                <button type="submit" className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider font-mono rounded-xl transition cursor-pointer">Append Log</button>
              )}
            </form>
          ) : (
            <div className="bg-slate-900/20 p-4 border border-slate-800/60 rounded-2xl space-y-4">
              <h5 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">Historical Sequence Generator</h5>
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Start Date</label>
                  <input type="date" required value={retroBatchStart} onChange={(e) => setRetroBatchStart(e.target.value)}
                    className="w-full bg-[#1e293b]/45 border border-slate-700/60 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/80 transition" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">End Date</label>
                  <input type="date" required value={retroBatchEnd} onChange={(e) => setRetroBatchEnd(e.target.value)}
                    className="w-full bg-[#1e293b]/45 border border-slate-700/60 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/80 transition" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Administration Frequency</label>
                  <select value={retroBatchFreq} onChange={(e: any) => setRetroBatchFreq(e.target.value)}
                    className="w-full bg-[#1e293b] border border-slate-700/60 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/80">
                    <option value="daily">Daily</option>
                    <option value="eod">Every Other Day (EOD)</option>
                    <option value="twice_weekly">Twice Weekly (Every 3 Days)</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono block mb-1">Dose per Entry ({compound.doseUnit})</label>
                  <span className="text-xs font-bold text-slate-300 block pt-1.5">{retroSingleAmount || compound.doseAmount} {compound.doseUnit}</span>
                </div>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-[11px] font-mono">
                <div><span className="text-slate-500">Scheduled Logs To Fill:</span> <span className="font-bold text-cyan-400 text-xs">{batchDates.length} entries</span></div>
                <button type="button" disabled={batchDates.length === 0} onClick={handleAddBatch}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wide rounded-xl transition font-mono cursor-pointer ${batchDates.length === 0 ? 'bg-slate-800 text-slate-600 border border-slate-700 pointer-events-none' : 'bg-[#22d3ee] hover:bg-[#06b6d4] text-slate-950 font-black'}`}>
                  Populate Chronology
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2.5">
            <h5 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Documented Logs Sync ({sortedRetroLogs.length})</span>
            </h5>
            {sortedRetroLogs.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-800 rounded-2xl text-xs text-slate-500 font-mono">No matching historical logs found in device registers.</div>
            ) : (
              <div className="border border-slate-800/80 rounded-xl overflow-hidden divide-y divide-slate-800/60 max-h-48 overflow-y-auto custom-scrollbar">
                {sortedRetroLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-2.5 bg-slate-900/10 hover:bg-slate-900/30 text-xs font-mono">
                    <div className="flex items-center gap-2.5">
                      <span className="text-slate-300 font-bold">{log.date}</span>
                      <span className="text-slate-500 text-[10px]">{formatTimeTo12Hour(log.time)}</span>
                      <span className="text-cyan-400 text-[11px] font-bold">{log.doseAmount} {log.doseUnit}</span>
                      {log.calculatedQtyText && <span className="text-slate-500 text-[9px] font-bold">({log.calculatedQtyText})</span>}
                    </div>
                    {onUndoDose && (
                      confirmDeleteLogId === log.id ? (
                        <div className="flex items-center gap-1 bg-rose-500/10 border border-rose-500/25 rounded-lg p-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              triggerHaptic('warning');
                              onUndoDose(log.id);
                              setConfirmDeleteLogId(null);
                            }}
                            className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[9px] font-bold uppercase cursor-pointer"
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              triggerHaptic('light');
                              setConfirmDeleteLogId(null);
                            }}
                            className="px-1.5 py-0.5 rounded text-slate-300 text-[9px] font-bold uppercase cursor-pointer"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('warning');
                            setConfirmDeleteLogId(log.id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-all cursor-pointer"
                          title="Delete dose record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
