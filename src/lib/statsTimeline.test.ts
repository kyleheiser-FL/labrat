import { describe, expect, it } from 'vitest';
import { Compound, DoseLog } from '../types';
import { buildProtocolRows, buildStatsTimelineViewModel, getDrawLabel, getStatusTone } from './statsTimeline';

const baseCompound: Compound = {
  id: 'test-cyp',
  name: 'Testosterone Cypionate',
  type: 'steroid',
  steroidForm: 'oil',
  oilConcMgMl: 200,
  doseAmount: 40,
  doseUnit: 'mg',
  frequency: 'daily',
  startDate: '2026-07-01',
  durationWeeks: 4,
  color: '#10b981',
  isCompleted: false,
};

describe('stats timeline helpers', () => {
  it('calculates oil and peptide draw labels', () => {
    const peptide: Compound = {
      ...baseCompound,
      id: 'cjc',
      name: 'CJC-1295',
      type: 'peptide',
      steroidForm: undefined,
      oilConcMgMl: undefined,
      vialSizeMg: 5,
      bacWaterMl: 2,
      doseAmount: 200,
      doseUnit: 'mcg',
      color: '#06b6d4',
    };

    expect(getDrawLabel(baseCompound)).toBe('draw 20 units');
    expect(getDrawLabel(peptide)).toBe('draw 8 units');
  });

  it('builds cycle summary, runway, and compound rows', () => {
    const logs: DoseLog[] = [
      { id: 'l1', compoundId: 'test-cyp', compoundName: 'Testosterone Cypionate', date: '2026-07-13', time: '08:00', doseAmount: 40, doseUnit: 'mg' },
      { id: 'l2', compoundId: 'test-cyp', compoundName: 'Testosterone Cypionate', date: '2026-07-14', time: '08:00', doseAmount: 40, doseUnit: 'mg' },
    ];

    const vm = buildStatsTimelineViewModel([baseCompound], logs, '2026-07-15');

    expect(vm.summary.activeCount).toBe(1);
    expect(vm.summary.dosesLoggedThisWeek).toBe(2);
    expect(vm.summary.daysLeft).toBe(14);
    expect(vm.runway).toMatchObject({
      startISO: '2026-07-01',
      endISO: '2026-07-29',
      progressPct: 50,
      todayPct: 50,
    });
    expect(vm.active[0]).toMatchObject({
      id: 'test-cyp',
      name: 'Testosterone Cypionate',
      drawLabel: 'draw 20 units',
      progressPct: 50,
      daysLeft: 14,
      loggedCount: 2,
      lastLoggedLabel: 'Jul 14',
      status: 'Recently logged',
    });
  });

  it('includes completed rows for protocol management and marks ending soon', () => {
    const endingSoon: Compound = {
      ...baseCompound,
      id: 'ending',
      name: 'Ending Compound',
      startDate: '2026-07-01',
      durationWeeks: 3,
      isCompleted: false,
    };
    const completed: Compound = {
      ...baseCompound,
      id: 'completed',
      name: 'Completed Compound',
      isCompleted: true,
    };

    const rows = buildProtocolRows([endingSoon, completed], [], '2026-07-20');

    expect(rows).toHaveLength(2);
    expect(rows.find(row => row.id === 'ending')).toMatchObject({
      status: 'Ending soon',
      daysLeft: 2,
    });
    expect(rows.find(row => row.id === 'completed')).toMatchObject({
      status: 'Completed',
      daysLeft: 0,
    });
  });

  it('returns status tone classes for existing progress bars', () => {
    expect(getStatusTone('Ending soon')).toMatchObject({
      label: 'Ending soon',
      barClass: 'bg-gradient-to-r from-amber-300 to-orange-400',
    });
    expect(getStatusTone('Completed')).toMatchObject({
      label: 'Completed',
      barClass: 'bg-gradient-to-r from-slate-400 to-slate-500',
    });
  });
});
