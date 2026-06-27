import React, { useState } from 'react';
import { History } from 'lucide-react';
import { DoseLog, formatTimeTo12Hour } from '../types';
import { triggerHaptic } from '../lib/haptics';

interface AdministrationLedgerProps {
  logs: DoseLog[];
  onUndoDose: (id: string) => void;
}

export default function AdministrationLedger({ logs, onUndoDose }: AdministrationLedgerProps) {
  const [showCount, setShowCount] = useState(5);

  // Normalize a stored time to 24-hour "HH:MM" so sorting is reliable even
  // when some logs persist "22:37" and others persist "10:37 PM".
  const to24h = (t: string): string => {
    if (!t) return '00:00';
    const s = t.trim();
    const ampm = s.match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])$/);
    if (ampm) {
      let h = parseInt(ampm[1], 10) % 12;
      if (ampm[3].toLowerCase() === 'pm') h += 12;
      return `${h.toString().padStart(2, '0')}:${ampm[2]}`;
    }
    const m = s.match(/^(\d{1,2}):(\d{2})/);
    if (m) return `${m[1].padStart(2, '0')}:${m[2]}`;
    return '00:00';
  };
  const sortKey = (l: DoseLog) => `${l.date}T${to24h(l.time)}`;

  // Sort newest → oldest so the dose you just logged is at the top, then show
  // the head; "Load 5 Older" reveals progressively older entries beneath it.
  const sorted = logs.slice().sort((a, b) => sortKey(b).localeCompare(sortKey(a)));
  const visibleLogs = sorted.slice(0, showCount);
  const hasOlder = sorted.length > showCount;

  return (
    <div className="bg-[#0f172a]/70 border border-[#1e293b]/80 rounded-2xl p-6 shadow-xl backdrop-blur-md" id="administration-ledger-card">
      <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
        <History className="w-4 h-4 text-cyan-400" /> Chronological Administration Logs
      </h4>

      {logs.length === 0 ? (
        <div className="text-center py-10 flex flex-col items-center gap-3">
          <div className="p-4 bg-cyan-500/5 border border-cyan-500/15 rounded-full">
            <History className="w-8 h-8 text-cyan-500/50" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-300">No administrations logged yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
              Check off items in the daily list above — every dose you log builds your verified research record here.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto" id="ledger-scrolling-container">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] text-slate-500 font-mono">
              Showing {visibleLogs.length} of {sorted.length} log{sorted.length !== 1 ? 's' : ''} · newest → oldest
            </span>
            <div className="flex items-center gap-2">
              {showCount > 5 && (
                <button
                  type="button"
                  onClick={() => setShowCount(5)}
                  className="text-[10px] font-bold text-slate-400 hover:text-slate-300 bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/40 px-3 py-1 rounded-lg transition cursor-pointer"
                >
                  Collapse
                </button>
              )}
              {hasOlder && (
                <button
                  type="button"
                  onClick={() => setShowCount(prev => prev + 5)}
                  className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-lg transition cursor-pointer"
                >
                  Load 5 Older
                </button>
              )}
            </div>
          </div>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#1e293b]/80 text-[#475569] font-mono text-[10px] uppercase font-bold">
                <th className="py-2.5 px-2">Timestamp Date</th>
                <th className="py-2.5 px-2">Substance</th>
                <th className="py-2.5 px-2">Dosage</th>
                <th className="py-2.5 px-2">Physical Qty / Draw</th>
                <th className="py-2.5 px-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300 font-mono">
              {visibleLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/10">
                  <td className="py-2.5 px-2 text-slate-400">{log.date} at {formatTimeTo12Hour(log.time)}</td>
                  <td className="py-2.5 px-2 text-slate-200 font-semibold">{log.compoundName}</td>
                  <td className="py-2.5 px-2">{log.doseAmount} {log.doseUnit}</td>
                  <td className="py-2.5 px-2 text-cyan-400">
                    {log.calculatedQtyText ? log.calculatedQtyText : (log.reconstitutedRatio ? `${log.reconstitutedRatio.syringeUnits} Units` : 'Standard Draw')}
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <button
                      onClick={() => {
                        triggerHaptic('warning');
                        onUndoDose(log.id);
                      }}
                      className="p-1 px-2 rounded-md text-[10px] font-bold text-slate-500 hover:text-rose-400 transition"
                      title="Undo / Delete log"
                      id={`undo-log-${log.id}`}
                    >
                      Undo
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
