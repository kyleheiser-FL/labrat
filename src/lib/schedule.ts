import { Compound } from '../types';

export function getDoseScheduleForDate(comp: Compound, dateStr: string): { isDue: boolean; weekNo: number; dayNo: number } {
  const start = new Date(comp.startDate + 'T00:00:00');
  const curr  = new Date(dateStr        + 'T00:00:00');
  const diffTime = curr.getTime() - start.getTime();
  if (diffTime < 0) return { isDue: false, weekNo: 0, dayNo: 0 };

  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const weekNo   = Math.floor(diffDays / 7) + 1;
  if (weekNo > comp.durationWeeks) return { isDue: false, weekNo, dayNo: diffDays };

  let isDue = false;
  switch (comp.frequency) {
    case 'daily':        isDue = true; break;
    case 'eod':          isDue = diffDays % 2 === 0; break;
    case 'twice_weekly': { const o = diffDays % 7; isDue = o === 0 || o === 3; break; }
    case 'weekly':       isDue = diffDays % 7 === 0; break;
    case 'custom':       isDue = diffDays % (comp.customDays || 3) === 0; break;
  }
  return { isDue, weekNo, dayNo: diffDays };
}
