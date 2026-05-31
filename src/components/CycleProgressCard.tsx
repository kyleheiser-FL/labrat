import React from 'react';
import { Compound } from '../types';

interface CycleProgressCardProps {
  comp: Compound;
}

export default function CycleProgressCard({ comp }: CycleProgressCardProps) {
  const start = new Date(comp.startDate + 'T00:00:00');
  const today = new Date();
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const totalDays = comp.durationWeeks * 7;
  const diffTime = todayMidnight.getTime() - start.getTime();
  const elapsedDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  let percentage = 0;
  if (elapsedDays > 0) {
    percentage = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100));
  }
  const roundedPct = Math.round(percentage);
  const daysRemaining = Math.max(0, totalDays - elapsedDays);
  const weeksCompleted = Math.max(0, Math.floor(elapsedDays / 7));

  return (
    <div className="bg-[#1e293b]/15 border border-[#1e293b]/45 rounded-xl p-3.5 space-y-2.5" id={`progress-card-${comp.id}`}>
      <div className="flex justify-between items-start gap-2">
        <div className="text-left">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: comp.color }}></span>
            <span className="text-xs font-bold text-slate-200">{comp.name}</span>
            {comp.isCompleted ? (
              <span className="text-[8px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-1 py-0.2 rounded font-semibold font-mono">FIN</span>
            ) : elapsedDays >= totalDays ? (
              <span className="text-[8px] bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 px-1 py-0.2 rounded font-semibold font-mono">ELAPSED</span>
            ) : elapsedDays < 0 ? (
              <span className="text-[8px] bg-amber-500/10 text-amber-500 border border-amber-500/10 px-1 py-0.2 rounded font-semibold font-mono">PENDING</span>
            ) : (
              <span className="text-[8px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/10 px-1 py-0.2 rounded font-semibold font-mono">RUNNING</span>
            )}
          </div>
          <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
            Week {Math.min(comp.durationWeeks, Math.max(1, weeksCompleted + 1))} of {comp.durationWeeks} • Started {comp.startDate}
          </span>
        </div>

        <div className="text-right font-mono text-[10px] sm:text-xs">
          <span className="font-bold text-slate-300">{comp.isCompleted ? '100' : roundedPct}%</span>
          <span className="text-slate-500 text-[10px] block font-normal">
            {comp.isCompleted ? 'Completed' : daysRemaining === 0 ? 'Completed' : `${daysRemaining} days left`}
          </span>
        </div>
      </div>

      <div className="w-full bg-[#0f172a] h-1.5 rounded-full overflow-hidden border border-[#1e293b]/40">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${comp.isCompleted ? 100 : roundedPct}%`,
            backgroundColor: comp.isCompleted ? '#10b981' : comp.color
          }}
        />
      </div>
    </div>
  );
}
