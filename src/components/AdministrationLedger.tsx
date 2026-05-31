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

  return (
    <div className="bg-[#0f172a]/70 border border-[#1e293b]/80 rounded-2xl p-6 shadow-xl backdrop-blur-md" id="administration-ledger-card">
      <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
        <History className="w-4 h-4 text-cyan-400" /> Chronological Administration Logs
      </h4>

      {logs.length === 0 ? (
        <p className="text-center py-10 text-slate-600 text-xs">
          No administration logs recorded yet. Check off items in the daily list above to generate records.
        </p>
      ) : (
        <div className="overflow-x-auto" id="ledger-scrolling-container">
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
              {logs.slice().reverse().slice(0, showCount).map((log) => (
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
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/40">
            <span className="text-[10px] text-slate-500 font-mono">
              Showing {Math.min(showCount, logs.length)} of {logs.length} log{logs.length !== 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-2">
              {showCount > 5 && (
                <button
                  type="button"
                  onClick={() => setShowCount(5)}
                  className="text-[10px] font-bold text-slate-400 hover:text-slate-300 bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/40 px-3 py-1 rounded-lg transition cursor-pointer"
                >
                  Show Less
                </button>
              )}
              {logs.length > showCount && (
                <button
                  type="button"
                  onClick={() => setShowCount(prev => prev + 5)}
                  className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-lg transition cursor-pointer"
                >
                  Show 5 More
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
