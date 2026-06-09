import React, { useState, useMemo } from 'react';
import { Activity, CalendarDays, PlusCircle, AlertCircle, Syringe, CheckSquare, Info, RefreshCw, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Compound, DoseLog } from '../types';
import SyringeVisual from './SyringeVisual';
import ChecklistItem from './ChecklistItem';
import AdministrationLedger from './AdministrationLedger';
import CycleProgressCard from './CycleProgressCard';
import { triggerHaptic } from '../lib/haptics';
import { safeLocalStorage } from '../lib/storage';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface CycleDashboardProps {
  compounds: Compound[];
  logs: DoseLog[];
  onLogDose: (log: DoseLog) => void;
  onUndoDose: (id: string) => void;
  onUpdateCompoundDose?: (compoundId: string, newDose: number) => void;
  labratTheme?: 'neon' | 'clinical';
  visibility?: {
    schedule: boolean;
    history: boolean;
  };
}

export default function CycleDashboard({
  compounds,
  logs,
  onLogDose,
  onUndoDose,
  onUpdateCompoundDose,
  labratTheme = 'neon',
  visibility = { schedule: true, history: true }
}: CycleDashboardProps) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [showManualLog, setShowManualLog] = useState(false);
  const [manualCompoundId, setManualCompoundId] = useState('');
  const [manualDoseAmount, setManualDoseAmount] = useState('');
  const [manualUnits, setManualUnits] = useState('');
  const [manualTime, setManualTime] = useState('');

  const [disclaimerDismissed, setDisclaimerDismissed] = useState(() =>
    safeLocalStorage.getItem('labrat_dashboard_disclaimer_dismissed') === 'true'
  );
  const [missedPanelExpanded, setMissedPanelExpanded] = useState(true);
  const [dismissedMissedKeys, setDismissedMissedKeys] = useState<Set<string>>(() => {
    try {
      const stored = safeLocalStorage.getItem('labrat_dismissed_missed_doses');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });

  // On mount, merge Firestore-persisted dismissals so they survive localStorage clears and cross-device sessions.
  // Uses onAuthStateChanged instead of auth.currentUser to avoid a race condition where Firebase hasn't
  // finished restoring the auth session yet (auth.currentUser is null during async initialization).
  React.useEffect(() => {
    let done = false;
    const unsub = onAuthStateChanged(auth, (user) => {
      if (done || !user) return;
      done = true;
      unsub();
      getDoc(doc(db, 'users', user.uid)).then(snap => {
        if (!snap.exists()) return;
        const remote: string[] = snap.data().dismissedMissedDoses || [];
        if (remote.length === 0) return;
        setDismissedMissedKeys(prev => {
          const next = new Set([...prev, ...remote]);
          safeLocalStorage.setItem('labrat_dismissed_missed_doses', JSON.stringify([...next]));
          return next;
        });
      }).catch(() => {});
    });
    return () => { done = true; unsub(); };
  }, []);

  const dismissMissedKey = (key: string) => {
    setDismissedMissedKeys(prev => {
      const next = new Set([...prev, key]);
      const arr = [...next];
      safeLocalStorage.setItem('labrat_dismissed_missed_doses', JSON.stringify(arr));
      const user = auth.currentUser;
      if (user) {
        setDoc(doc(db, 'users', user.uid), { dismissedMissedDoses: arr }, { merge: true }).catch(() => {});
      }
      return next;
    });
  };

  const calcUnitsFromDose = (doseStr: string, comp: Compound): string => {
    const d = parseFloat(doseStr);
    if (isNaN(d)) return '';
    if (comp.type === 'peptide' && comp.vialSizeMg && comp.bacWaterMl) {
      const perUnit = (comp.vialSizeMg * 1000) / (comp.bacWaterMl * 100);
      const doseInMcg = comp.doseUnit === 'mg' ? d * 1000 : d;
      return String(Math.round((doseInMcg / perUnit) * 10) / 10);
    }
    if ((comp.type === 'steroid' || comp.type === 'supplement' || comp.type === 'compound') && comp.steroidForm === 'oil' && comp.oilConcMgMl) {
      return String(Math.round((d / comp.oilConcMgMl) * 100) / 100);
    }
    return '';
  };

  const calcDoseFromUnits = (unitsStr: string, comp: Compound): string => {
    const u = parseFloat(unitsStr);
    if (isNaN(u)) return '';
    if (comp.type === 'peptide' && comp.vialSizeMg && comp.bacWaterMl) {
      const perUnit = (comp.vialSizeMg * 1000) / (comp.bacWaterMl * 100);
      const rawMcg = u * perUnit;
      const dose = comp.doseUnit === 'mg' ? rawMcg / 1000 : rawMcg;
      return String(Math.round(dose * 10) / 10);
    }
    if ((comp.type === 'steroid' || comp.type === 'supplement' || comp.type === 'compound') && comp.steroidForm === 'oil' && comp.oilConcMgMl) {
      return String(Math.round(u * comp.oilConcMgMl * 10) / 10);
    }
    return '';
  };

  const handleSelectManualCompound = (id: string) => {
    setManualCompoundId(id);
    const comp = compounds.find(c => c.id === id);
    if (comp) {
      setManualDoseAmount(comp.doseAmount.toString());
      setManualUnits(calcUnitsFromDose(comp.doseAmount.toString(), comp));
      const now = new Date();
      setManualTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    } else {
      setManualDoseAmount('');
      setManualUnits('');
      setManualTime('');
    }
  };

  const handleManualDoseChange = (val: string) => {
    setManualDoseAmount(val);
    const comp = compounds.find(c => c.id === manualCompoundId);
    if (comp) setManualUnits(calcUnitsFromDose(val, comp));
  };

  const handleManualUnitsChange = (val: string) => {
    setManualUnits(val);
    const comp = compounds.find(c => c.id === manualCompoundId);
    if (comp) setManualDoseAmount(calcDoseFromUnits(val, comp));
  };

  const handleLogManualDoseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCompoundId) return;
    const comp = compounds.find(c => c.id === manualCompoundId);
    if (!comp) return;

    const parsedDose = parseFloat(manualDoseAmount) || comp.doseAmount;

    let calculatedQtyText: string | undefined;
    if (comp.type === 'peptide' && comp.vialSizeMg && comp.bacWaterMl) {
      const doseInMcg = comp.doseUnit === 'mg' ? parsedDose * 1000 : parsedDose;
      const units = Math.round((doseInMcg / ((comp.vialSizeMg * 1000) / (comp.bacWaterMl * 100))) * 10) / 10;
      calculatedQtyText = `${units} Units`;
    } else if (comp.type === 'steroid' || comp.type === 'supplement' || comp.type === 'compound') {
      if (comp.steroidForm === 'pill' && comp.pillSizeMg) {
        const pills = Math.round((parsedDose / comp.pillSizeMg) * 100) / 100;
        calculatedQtyText = `${pills} ${pills === 1 ? 'pill' : 'pills'} (${comp.pillSizeMg}mg each)`;
      } else if (comp.steroidForm === 'oil' && comp.oilConcMgMl) {
        calculatedQtyText = `${(parsedDose / comp.oilConcMgMl).toFixed(2)} ml / cc (${comp.oilConcMgMl}mg/ml)`;
      }
    }

    const targetTime = manualTime || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    onLogDose({
      id: crypto.randomUUID(),
      compoundId: comp.id,
      compoundName: comp.name,
      date: selectedDate,
      time: targetTime,
      doseAmount: parsedDose,
      doseUnit: comp.doseUnit,
      reconstitutedRatio: comp.vialSizeMg && comp.bacWaterMl ? {
        vialSizeMg: comp.vialSizeMg,
        bacWaterMl: comp.bacWaterMl,
        syringeUnits: Math.round(((comp.doseUnit === 'mg' ? parsedDose * 1000 : parsedDose) / ((comp.vialSizeMg * 1000) / (comp.bacWaterMl * 100))) * 10) / 10
      } : undefined,
      calculatedQtyText
    });

    triggerHaptic('success');
    setManualCompoundId('');
    setManualDoseAmount('');
    setManualTime('');
    setShowManualLog(false);
  };

  const getDoseScheduleForDate = (comp: Compound, dateStr: string) => {
    const start = new Date(comp.startDate + 'T00:00:00');
    const curr = new Date(dateStr + 'T00:00:00');
    const diffTime = curr.getTime() - start.getTime();
    if (diffTime < 0) return { isDue: false, weekNo: 0, dayNo: 0 };

    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const weekNo = Math.floor(diffDays / 7) + 1;
    if (weekNo > comp.durationWeeks) return { isDue: false, weekNo, dayNo: diffDays };

    let isDue = false;
    switch (comp.frequency) {
      case 'daily': isDue = true; break;
      case 'eod': isDue = diffDays % 2 === 0; break;
      case 'twice_weekly': { const o = diffDays % 7; isDue = o === 0 || o === 3; break; }
      case 'weekly': isDue = diffDays % 7 === 0; break;
      case 'custom': isDue = diffDays % (comp.customDays || 3) === 0; break;
    }
    return { isDue, weekNo, dayNo: diffDays };
  };

  const scheduledCompounds = compounds
    .map(comp => ({ compound: comp, ...getDoseScheduleForDate(comp, selectedDate) }))
    .filter(item => item.isDue);

  // Missed doses: past 7 days (excluding today), scheduled but not logged
  const missedDoses = useMemo(() => {
    const missed: { compound: Compound; date: string; weekNo: number }[] = [];
    for (let d = 1; d <= 7; d++) {
      const dt = new Date(todayStr + 'T00:00:00');
      dt.setDate(dt.getDate() - d);
      const dateStr = dt.toISOString().split('T')[0];
      compounds.filter(c => !c.isCompleted).forEach(comp => {
        const { isDue, weekNo } = getDoseScheduleForDate(comp, dateStr);
        if (isDue && !logs.some(l => l.compoundId === comp.id && l.date === dateStr)) {
          missed.push({ compound: comp, date: dateStr, weekNo });
        }
      });
    }
    return missed;
  }, [compounds, logs, todayStr]);

  const visibleMissedCount = missedDoses.filter(
    m => !dismissedMissedKeys.has(`${m.compound.id}-${m.date}`)
  ).length;

  const handleAdministerDose = (comp: Compound) => {
    if (logs.some(l => l.compoundId === comp.id && l.date === selectedDate)) return;

    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    let calculatedQtyText: string | undefined;
    if (comp.type === 'peptide' && comp.vialSizeMg && comp.bacWaterMl) {
      const doseInMcg = comp.doseUnit === 'mg' ? comp.doseAmount * 1000 : comp.doseAmount;
      const units = Math.round((doseInMcg / ((comp.vialSizeMg * 1000) / (comp.bacWaterMl * 100))) * 10) / 10;
      calculatedQtyText = `${units} Units`;
    } else if (comp.type === 'steroid' || comp.type === 'supplement' || comp.type === 'compound') {
      if (comp.steroidForm === 'pill' && comp.pillSizeMg) {
        const pills = Math.round((comp.doseAmount / comp.pillSizeMg) * 100) / 100;
        calculatedQtyText = `${pills} ${pills === 1 ? 'pill' : 'pills'} (${comp.pillSizeMg}mg each)`;
      } else if (comp.steroidForm === 'oil' && comp.oilConcMgMl) {
        calculatedQtyText = `${(comp.doseAmount / comp.oilConcMgMl).toFixed(2)} ml / cc (${comp.oilConcMgMl}mg/ml)`;
      }
    }

    onLogDose({
      id: crypto.randomUUID(),
      compoundId: comp.id,
      compoundName: comp.name,
      date: selectedDate,
      time: timeStr,
      doseAmount: comp.doseAmount,
      doseUnit: comp.doseUnit,
      reconstitutedRatio: comp.vialSizeMg && comp.bacWaterMl ? {
        vialSizeMg: comp.vialSizeMg,
        bacWaterMl: comp.bacWaterMl,
        syringeUnits: Math.round(((comp.doseUnit === 'mg' ? comp.doseAmount * 1000 : comp.doseAmount) / ((comp.vialSizeMg * 1000) / (comp.bacWaterMl * 100))) * 10) / 10
      } : undefined,
      calculatedQtyText
    });
    triggerHaptic('success');
  };

  return (
    <div className="space-y-6 flex flex-col" id="dashboard-wrapper">
      <section className="labrat-command-hero" id="labrat-command-hero">
        <div className="labrat-command-hero-copy">
          <span className="labrat-command-eyebrow">{labratTheme === 'neon' ? 'Neon Lab Command Center' : 'Clinical Command Center'}</span>
          <h2>Daily Cockpit</h2>
          <p>Track today's active schedule, verify administrations, monitor cycle progress, and keep device reminders ready from one high-visibility command surface.</p>
          <div className="labrat-command-metrics">
            <div><strong>{scheduledCompounds.length}</strong><span>Scheduled</span></div>
            <div><strong>{logs.filter(l => l.date === selectedDate).length}</strong><span>Logged</span></div>
            <div><strong>{compounds.filter(c => !c.isCompleted).length}</strong><span>Active</span></div>
            {visibleMissedCount > 0 && (
              <div className="missed-metric"><strong>{visibleMissedCount}</strong><span>Missed</span></div>
            )}
          </div>
        </div>
        <div className="labrat-command-hero-art" aria-hidden="true">
          <img src={labratTheme === 'neon' ? '/labrat_top_left_logo_transparent.png' : '/labrat_hero_rat_dark.png'} alt="" />
        </div>
      </section>

      {/* Missed Doses Alert Panel */}
      {missedDoses.length > 0 && (() => {
        const visibleMissed = missedDoses.filter(m => !dismissedMissedKeys.has(`${m.compound.id}-${m.date}`));
        if (visibleMissed.length === 0) return null;
        return (
          <div className="bg-rose-500/10 border border-rose-500/35 rounded-2xl shadow-lg overflow-hidden" id="missed-doses-alert">
            {/* Header row — always visible */}
            <button
              type="button"
              onClick={() => setMissedPanelExpanded(v => !v)}
              className="w-full flex items-center justify-between gap-2 px-4 py-3 cursor-pointer hover:bg-rose-500/5 transition"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 animate-pulse shrink-0" />
                <span className="text-sm font-bold text-rose-300">
                  {visibleMissed.length} Missed {visibleMissed.length === 1 ? 'Dose' : 'Doses'} — Last 7 Days
                </span>
              </div>
              {missedPanelExpanded
                ? <ChevronUp className="w-4 h-4 text-rose-400 shrink-0" />
                : <ChevronDown className="w-4 h-4 text-rose-400 shrink-0" />}
            </button>

            {/* Expandable list */}
            {missedPanelExpanded && (
              <div className="px-4 pb-4 space-y-1.5">
                {visibleMissed.map((m) => {
                  const key = `${m.compound.id}-${m.date}`;
                  const dt = new Date(m.date + 'T00:00:00');
                  const dayLabel = dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                  return (
                    <div key={key} className="flex items-center justify-between bg-rose-500/5 border border-rose-500/20 rounded-xl px-3 py-2 text-xs gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                        <span className="font-bold text-slate-200 truncate">{m.compound.name}</span>
                        <span className="text-slate-500 font-mono text-[10px] shrink-0">Wk {m.weekNo}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-rose-400 font-mono text-[10px]">{dayLabel}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedDate(m.date)}
                          className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-950/40 border border-cyan-500/25 hover:border-cyan-500/50 px-2 py-0.5 rounded-lg transition cursor-pointer"
                        >
                          Log It
                        </button>
                        <button
                          type="button"
                          onClick={() => dismissMissedKey(key)}
                          className="p-0.5 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                          aria-label="Dismiss"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {!disclaimerDismissed && (
        <div className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-4.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg backdrop-blur-sm" id="dashboard-legal-banner">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between w-full gap-4">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-amber-500/20 rounded-xl text-amber-400 shrink-0 mt-0.5 sm:mt-0">
                <AlertCircle className="w-5 h-5 text-amber-400" />
              </div>
              <div className="space-y-1">
                <h5 className="text-[11px] font-black text-amber-400 uppercase tracking-widest font-mono">
                  Educational & Legal Safe-Harbor Information
                </h5>
                <p className="text-[11.5px] text-slate-300 leading-relaxed max-w-5xl">
                  <strong>LabRat is purely a mathematical logging application for tracking self-directed biological observations.</strong> It does not design clinical regimens, disperse medical recommendations, or recommend substance abuse. Compounding, administering, or obtaining research chemicals carry extreme systemic toxicity and legal penalties. User assumes full liability of action.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pl-1 lg:pl-0 shrink-0 select-none w-full lg:w-auto">
              <label className="flex items-center justify-center gap-2.5 px-3.5 py-2 w-full lg:w-auto bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 hover:border-amber-500/35 rounded-xl text-xs text-amber-400 font-bold tracking-wide cursor-pointer transition">
                <input
                  type="checkbox"
                  className="accent-amber-500 rounded border-amber-500/30 text-slate-900 focus:ring-0 w-4 h-4 cursor-pointer"
                  checked={disclaimerDismissed}
                  onChange={(e) => {
                    if (e.target.checked) {
                      safeLocalStorage.setItem('labrat_dashboard_disclaimer_dismissed', 'true');
                      setDisclaimerDismissed(true);
                    }
                  }}
                />
                <span className="font-mono text-[10px] uppercase tracking-wider">Acknowledge & Dismiss</span>
              </label>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 2xl:grid-cols-12 gap-6" id="dashboard-main-grid">

        {/* Left Column */}
        <div className="2xl:col-span-7 flex flex-col gap-6">
          {visibility.schedule && (
            <>
              {/* Date Navigator */}
              <div className="bg-[#0f172a]/70 border border-[#1e293b]/80 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="dashboard-header-navigator">
                <div>
                  <span className="text-xs text-cyan-400 font-mono tracking-wider font-semibold uppercase">Daily Cockpit & Verification Log</span>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-1.5 mt-0.5">
                    <CalendarDays className="w-5 h-5 text-cyan-400" />
                    <span>Current Log Target Date</span>
                  </h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const prev = new Date(selectedDate + 'T00:00:00');
                      prev.setDate(prev.getDate() - 1);
                      setSelectedDate(prev.toISOString().split('T')[0]);
                    }}
                    className="py-1.5 px-3 bg-[#1e293b] hover:bg-slate-800 border border-slate-700/60 rounded-xl text-xs font-semibold text-slate-300 transition cursor-pointer"
                    id="prev-day-btn"
                  >
                    ← Previous Day
                  </button>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-[#1e293b]/50 border border-slate-700/60 text-slate-200 text-xs py-1 px-3 rounded-xl focus:outline-none focus:border-cyan-500 font-mono"
                    id="selected-date-picker"
                  />
                  <button
                    onClick={() => {
                      const next = new Date(selectedDate + 'T00:00:00');
                      next.setDate(next.getDate() + 1);
                      setSelectedDate(next.toISOString().split('T')[0]);
                    }}
                    className="py-1.5 px-3 bg-[#1e293b] hover:bg-slate-800 border border-slate-700/60 rounded-xl text-xs font-semibold text-slate-300 transition cursor-pointer"
                    id="next-day-btn"
                  >
                    Next Day →
                  </button>
                </div>
              </div>

              {/* Back-dating banner */}
              {selectedDate !== todayStr && (
                <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-300 shadow-lg" id="backdating-viewing-banner">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/10 rounded-xl text-cyan-400 shrink-0">
                      <CalendarDays className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-200">Viewing & Adding Past Records</p>
                      <p className="text-[11px] text-slate-400">You are writing data directly to <span className="font-mono text-cyan-400 font-bold">{selectedDate}</span>. Changes sync to database registers immediately.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSelectedDate(todayStr); triggerHaptic('light'); }}
                    className="w-full sm:w-auto shrink-0 py-1.5 px-3.5 bg-cyan-500/10 hover:bg-cyan-500/20 active:scale-95 text-cyan-400 border border-cyan-500/20 hover:border-cyan-500/40 font-semibold rounded-xl text-xs transition duration-150 cursor-pointer text-center"
                    id="quick-today-btn"
                  >
                    Reset to Today
                  </button>
                </div>
              )}

              {/* Daily Checklist */}
              <div className="bg-[#0f172a]/70 border border-[#1e293b]/80 rounded-2xl p-6 shadow-xl backdrop-blur-md flex-1" id="daily-checklist-card">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-cyan-400" /> Daily Intake & Administration Checklist
                  </h4>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => { triggerHaptic('light'); setShowManualLog(!showManualLog); }}
                        className={`text-xs font-bold px-4 py-1.5 rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
                          showManualLog
                            ? 'bg-cyan-500/25 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                            : 'bg-slate-900/60 text-slate-400 border-slate-700 hover:text-cyan-400 hover:border-cyan-500/30'
                        }`}
                        id="btn-toggle-manual-log"
                      >
                        <PlusCircle className="w-3.5 h-3.5" /> {showManualLog ? 'Hide Manual Dose' : 'Manual Dose'}
                      </button>
                      <div className="relative group">
                        <Info className="w-3.5 h-3.5 text-slate-500 hover:text-slate-300 cursor-help transition" />
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 bg-slate-900 border border-slate-700 rounded-xl p-3 text-[11px] text-slate-300 leading-relaxed shadow-xl hidden group-hover:block z-50 pointer-events-none">
                          Use this to log a dose that differs from your scheduled cycle amount, or to record a back-dated entry. If you're adjusting your ongoing dose, you can update the cycle going forward to match after entering the new amount.
                          <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-700" />
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] bg-cyan-950 text-cyan-400 px-2.5 py-0.5 rounded-full border border-cyan-500/10 font-bold font-mono">
                      {scheduledCompounds.length} Scheduled
                    </span>
                  </div>
                </div>

                {/* Manual Dose Form */}
                {showManualLog && (
                  <div className="mb-5 bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 text-left space-y-3.5 shadow-xl transition-all" id="manual-dose-logger-form">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#94a3b8] uppercase tracking-wider flex items-center gap-1.5 font-mono">
                        <PlusCircle className="w-4 h-4 text-cyan-400" /> Manual Dose Entry
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                        Target Date: <strong className="text-cyan-400">{selectedDate}</strong>
                      </span>
                    </div>

                    {compounds.length === 0 ? (
                      <div className="text-xs text-amber-300 bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">No Active Cycle Compounds</p>
                          <p className="text-slate-400 mt-0.5">Please add or design your active compounds inside the <strong className="text-cyan-400">Cycle Architect</strong> tab first prior to logging manual intake.</p>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleLogManualDoseSubmit} className="space-y-3.5">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Select Substance</label>
                            <select
                              required
                              value={manualCompoundId}
                              onChange={(e) => handleSelectManualCompound(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono cursor-pointer"
                              id="manual-log-substance"
                            >
                              <option value="">-- Choose compound --</option>
                              {compounds.map(comp => (
                                <option key={comp.id} value={comp.id}>{comp.name} ({comp.doseAmount} {comp.doseUnit})</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">
                              Dose ({manualCompoundId ? compounds.find(c => c.id === manualCompoundId)?.doseUnit : 'Amount'})
                            </label>
                            <input
                              type="number"
                              step="any"
                              required
                              disabled={!manualCompoundId}
                              placeholder={manualCompoundId ? `e.g. ${compounds.find(c => c.id === manualCompoundId)?.doseAmount}` : 'Amount'}
                              value={manualDoseAmount}
                              onChange={(e) => handleManualDoseChange(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                              id="manual-log-dose-amount"
                            />
                          </div>

                          {(() => {
                            const comp = compounds.find(c => c.id === manualCompoundId);
                            if (!comp) return null;
                            const isPeptide = comp.type === 'peptide' && comp.vialSizeMg && comp.bacWaterMl;
                            const isOil = (comp.type === 'steroid' || comp.type === 'supplement' || comp.type === 'compound') && comp.steroidForm === 'oil' && comp.oilConcMgMl;
                            if (!isPeptide && !isOil) return null;
                            return (
                              <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">
                                  {isPeptide ? 'Syringe Units (U-100)' : 'Volume (ml)'}
                                </label>
                                <input
                                  type="number"
                                  step="any"
                                  disabled={!manualCompoundId}
                                  placeholder={isPeptide ? 'e.g. 32' : 'e.g. 0.5'}
                                  value={manualUnits}
                                  onChange={(e) => handleManualUnitsChange(e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                                  id="manual-log-units"
                                />
                              </div>
                            );
                          })()}

                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">Time administered (HH:MM)</label>
                            <input
                              type="time"
                              required
                              value={manualTime}
                              onChange={(e) => setManualTime(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono cursor-pointer"
                              id="manual-log-time"
                            />
                          </div>
                        </div>

                        {/* Syringe delivery preview */}
                        {(() => {
                          if (!manualCompoundId) return null;
                          const comp = compounds.find(c => c.id === manualCompoundId);
                          if (!comp) return null;
                          const parsedDose = parseFloat(manualDoseAmount);
                          if (!parsedDose || isNaN(parsedDose)) return null;

                          const isPeptide = comp.type === 'peptide' && comp.vialSizeMg && comp.bacWaterMl;
                          const isOil = (comp.type === 'steroid' || comp.type === 'supplement' || comp.type === 'compound') && comp.steroidForm === 'oil' && comp.oilConcMgMl;
                          const isPill = (comp.type === 'steroid' || comp.type === 'supplement' || comp.type === 'compound') && comp.steroidForm === 'pill' && comp.pillSizeMg;

                          let syringeUnits = 0, syringeMax = 100;
                          let syringeLabel = 'units', summaryText = '';

                          if (isPeptide) {
                            const perUnit = (comp.vialSizeMg! * 1000) / (comp.bacWaterMl! * 100);
                            const doseInMcg = comp.doseUnit === 'mg' ? parsedDose * 1000 : parsedDose;
                            syringeUnits = Math.round((doseInMcg / perUnit) * 10) / 10;
                            summaryText = `${syringeUnits} syringe units — ${comp.vialSizeMg}mg vial / ${comp.bacWaterMl}ml BAC water`;
                          } else if (isOil) {
                            const ml = Math.round((parsedDose / comp.oilConcMgMl!) * 100) / 100;
                            syringeUnits = ml;
                            syringeMax = Math.max(1, Math.ceil(ml * 2));
                            syringeLabel = 'ml';
                            summaryText = `${ml} ml — ${comp.oilConcMgMl}mg/ml concentration`;
                          } else if (isPill) {
                            const qty = Math.round((parsedDose / comp.pillSizeMg!) * 100) / 100;
                            summaryText = `${qty} ${qty === 1 ? 'pill' : 'pills'} — ${comp.pillSizeMg}mg each`;
                          }

                          return (
                            <div className="bg-cyan-500/5 border border-cyan-500/10 rounded-xl p-3 space-y-2">
                              <div className="flex items-center gap-2 text-[10px] text-cyan-400 font-mono">
                                <Syringe className="w-3.5 h-3.5 shrink-0" />
                                <span className="font-semibold text-slate-300">Delivery:</span>{' '}
                                <span>{summaryText}</span>
                              </div>
                              {(isPeptide || isOil) && (
                                <div className="pt-1">
                                  <SyringeVisual units={syringeUnits} maxUnits={syringeMax} unitLabel={syringeLabel} />
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {/* Update cycle dose nudge */}
                        {(() => {
                          if (!manualCompoundId || !onUpdateCompoundDose) return null;
                          const comp = compounds.find(c => c.id === manualCompoundId);
                          if (!comp) return null;
                          const parsed = parseFloat(manualDoseAmount);
                          if (isNaN(parsed) || parsed === comp.doseAmount) return null;
                          return (
                            <div className="flex items-center gap-3 bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                              <RefreshCw className="w-4 h-4 text-amber-400 shrink-0" />
                              <div className="flex-1 text-[11px] text-amber-300 leading-snug">
                                Your manual dose ({parsed} {comp.doseUnit}) differs from the scheduled cycle dose ({comp.doseAmount} {comp.doseUnit}). Update the cycle to use this dose going forward?
                              </div>
                              <button
                                type="button"
                                onClick={() => { triggerHaptic('medium'); onUpdateCompoundDose(comp.id, parsed); }}
                                className="shrink-0 py-1.5 px-3 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 rounded-lg text-[11px] font-bold cursor-pointer transition"
                                id="update-cycle-dose-btn"
                              >
                                Update Cycle Dose
                              </button>
                            </div>
                          );
                        })()}

                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => { triggerHaptic('light'); setShowManualLog(false); }}
                            className="py-1 px-3.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer transition"
                            id="manual-log-cancel"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            disabled={!manualCompoundId}
                            className="py-1 px-3.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:hover:bg-cyan-500 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                            id="manual-log-submit"
                          >
                            Record Manual Dose (✓)
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {scheduledCompounds.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 border border-dashed border-slate-800 rounded-xl space-y-3">
                    <p className="text-sm font-semibold text-slate-400">Rest Day / Empty Slate</p>
                    <p className="text-xs text-slate-600 max-w-xs mx-auto">No substance administration is scheduled for this date. Click <strong className="text-cyan-400 font-semibold cursor-pointer" onClick={() => { triggerHaptic('light'); setShowManualLog(true); }}>Manual Dose</strong> above to record an unscheduled dose or back-dated entry.</p>
                  </div>
                ) : (
                  <div className="space-y-4" id="checklist-conglomerate">
                    {scheduledCompounds.map(({ compound, weekNo }) => {
                      const isLogged = logs.some(l => l.compoundId === compound.id && l.date === selectedDate);
                      const matchedLog = logs.find(l => l.compoundId === compound.id && l.date === selectedDate);
                      return (
                        <ChecklistItem
                          key={`checklist-item-${compound.id}`}
                          compound={compound}
                          weekNo={weekNo}
                          isLogged={isLogged}
                          matchedLog={matchedLog}
                          onAdminister={handleAdministerDose}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {visibility.history && (
            <AdministrationLedger logs={logs} onUndoDose={onUndoDose} />
          )}
        </div>

        {/* Right Column */}
        <div className="2xl:col-span-5 flex flex-col gap-6" id="dashboard-wellness-panel">
          <div className="bg-[#0f172a]/70 border border-[#1e293b]/80 rounded-2xl p-6 shadow-xl backdrop-blur-md" id="active-progress-monitors-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider text-left">Active Cycle Progress</h4>
              </div>
              <span className="text-[10px] bg-indigo-950 text-indigo-400 px-2.5 py-0.5 rounded-full border border-indigo-500/10 font-bold font-mono">
                {compounds.filter(c => !c.isCompleted).length} Running
              </span>
            </div>
            <div className="space-y-4">
              {compounds.length === 0 ? (
                <p className="text-xs text-slate-600 text-center py-6">No cycle compounds configured. Navigate to Cycle Architect to initiate a plan.</p>
              ) : (
                compounds.map(comp => (
                  <CycleProgressCard key={`progress-card-${comp.id}`} comp={comp} />
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
