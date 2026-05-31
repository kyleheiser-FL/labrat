import React, { useState } from 'react';
import { Check, CheckCircle2, Circle, Activity, History, CalendarDays, PlusCircle, AlertCircle, Syringe, CheckSquare, Info, RefreshCw } from 'lucide-react';
import { Compound, DoseLog, formatTimeTo12Hour } from '../types';
import { triggerHaptic } from '../lib/haptics';
import { safeLocalStorage } from '../lib/storage';

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
  // Navigation for Daily Checklist Date (default is today)
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [ledgerShowCount, setLedgerShowCount] = useState(5);

  // States for manual/unscheduled past dose logging
  const [showManualLog, setShowManualLog] = useState(false);
  const [manualCompoundId, setManualCompoundId] = useState('');
  const [manualDoseAmount, setManualDoseAmount] = useState('');
  const [manualTime, setManualTime] = useState('');

  const handleSelectManualCompound = (id: string) => {
    setManualCompoundId(id);
    const comp = compounds.find(c => c.id === id);
    if (comp) {
      setManualDoseAmount(comp.doseAmount.toString());
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      setManualTime(`${hh}:${mm}`);
    } else {
      setManualDoseAmount('');
      setManualTime('');
    }
  };

  const handleLogManualDoseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCompoundId) return;

    const comp = compounds.find(c => c.id === manualCompoundId);
    if (!comp) return;

    const parsedDose = parseFloat(manualDoseAmount) || comp.doseAmount;
    
    // Calculate physical text
    let calculatedQtyText = undefined;
    if (comp.type === 'peptide' && comp.vialSizeMg && comp.bacWaterMl) {
      const units = Math.round(((parsedDose) / ((comp.vialSizeMg * 1000) / (comp.bacWaterMl * 100))) * 10) / 10;
      calculatedQtyText = `${units} Units`;
    } else if (comp.type === 'steroid' || comp.type === 'supplement' || comp.type === 'compound') {
      if (comp.steroidForm === 'pill' && comp.pillSizeMg) {
        const pills = Math.round((parsedDose / comp.pillSizeMg) * 100) / 100;
        calculatedQtyText = `${pills} ${pills === 1 ? 'pill' : 'pills'} (${comp.pillSizeMg}mg each)`;
      } else if (comp.steroidForm === 'oil' && comp.oilConcMgMl) {
        const mlStr = (parsedDose / comp.oilConcMgMl).toFixed(2);
        calculatedQtyText = `${mlStr} ml / cc (${comp.oilConcMgMl}mg/ml)`;
      }
    }

    const targetTime = manualTime || new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    const newLog: DoseLog = {
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
        syringeUnits: Math.round(((parsedDose) / ((comp.vialSizeMg * 1000) / (comp.bacWaterMl * 100))) * 10) / 10
      } : undefined,
      calculatedQtyText
    };

    onLogDose(newLog);
    triggerHaptic('success');
    
    setManualCompoundId('');
    setManualDoseAmount('');
    setManualTime('');
    setShowManualLog(false);
  };

  // Disclaimer dismissal state stored in localStorage
  const [disclaimerDismissed, setDisclaimerDismissed] = useState(() => {
    return safeLocalStorage.getItem('labrat_dashboard_disclaimer_dismissed') === 'true';
  });

  // Check if a compound is due on selectedDate
  const getDoseScheduleForDate = (comp: Compound, dateStr: string) => {
    const start = new Date(comp.startDate + 'T00:00:00');
    const curr = new Date(dateStr + 'T00:00:00');
    
    // Day difference
    const diffTime = curr.getTime() - start.getTime();
    if (diffTime < 0) return { isDue: false, weekNo: 0, dayNo: 0 };
    
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const weekNo = Math.floor(diffDays / 7) + 1;
    
    if (weekNo > comp.durationWeeks) {
      return { isDue: false, weekNo, dayNo: diffDays }; // Cycle ended
    }

    let isDue = false;
    switch (comp.frequency) {
      case 'daily':
        isDue = true;
        break;
      case 'eod':
        isDue = diffDays % 2 === 0;
        break;
      case 'twice_weekly':
        // Due on Day 1 and Day 4 of the weekly intervals (e.g. Mon, Thu style)
        const weeklyOffset = diffDays % 7;
        isDue = weeklyOffset === 0 || weeklyOffset === 3;
        break;
      case 'weekly':
        isDue = diffDays % 7 === 0;
        break;
      case 'custom':
        const delay = comp.customDays || 3;
        isDue = diffDays % delay === 0;
        break;
    }

    return { isDue, weekNo, dayNo: diffDays };
  };

  // Compile active compounds scheduled for today the user can log
  const scheduledCompounds = compounds
    .map(comp => {
      const schedule = getDoseScheduleForDate(comp, selectedDate);
      return {
        compound: comp,
        ...schedule
      };
    })
    .filter(item => item.isDue);

  const handleAdministerDose = (comp: Compound) => {
    // Check if already logged for this date
    const alreadyLogged = logs.some(l => l.compoundId === comp.id && l.date === selectedDate);
    if (alreadyLogged) return;

    const timeStr = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    
    let calculatedQtyText = undefined;
    if (comp.type === 'peptide' && comp.vialSizeMg && comp.bacWaterMl) {
      const units = Math.round(((comp.doseAmount) / ((comp.vialSizeMg * 1000) / (comp.bacWaterMl * 100))) * 10) / 10;
      calculatedQtyText = `${units} Units`;
    } else if (comp.type === 'steroid' || comp.type === 'supplement' || comp.type === 'compound') {
      if (comp.steroidForm === 'pill' && comp.pillSizeMg) {
        const pills = Math.round((comp.doseAmount / comp.pillSizeMg) * 100) / 100;
        calculatedQtyText = `${pills} ${pills === 1 ? 'pill' : 'pills'} (${comp.pillSizeMg}mg each)`;
      } else if (comp.steroidForm === 'oil' && comp.oilConcMgMl) {
        const mlStr = (comp.doseAmount / comp.oilConcMgMl).toFixed(2);
        calculatedQtyText = `${mlStr} ml / cc (${comp.oilConcMgMl}mg/ml)`;
      }
    }

    const newLog: DoseLog = {
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
        syringeUnits: Math.round(((comp.doseAmount) / ((comp.vialSizeMg * 1000) / (comp.bacWaterMl * 100))) * 10) / 10
      } : undefined,
      calculatedQtyText
    };

    onLogDose(newLog);
    triggerHaptic('success');
  };

  return (
    <div className="space-y-6 flex flex-col" id="dashboard-wrapper">
      <section className="labrat-command-hero" id="labrat-command-hero">
        <div className="labrat-command-hero-copy">
          <span className="labrat-command-eyebrow">{labratTheme === 'clinical' ? 'Clinical Command Center' : 'Neon Lab Command Center'}</span>
          <h2>Daily Cockpit</h2>
          <p>Track today's active schedule, verify administrations, monitor cycle progress, and keep device reminders ready from one high-visibility command surface.</p>
          <div className="labrat-command-metrics">
            <div>
              <strong>{scheduledCompounds.length}</strong>
              <span>Scheduled</span>
            </div>
            <div>
              <strong>{logs.filter(l => l.date === selectedDate).length}</strong>
              <span>Logged</span>
            </div>
            <div>
              <strong>{compounds.filter(c => !c.isCompleted).length}</strong>
              <span>Active</span>
            </div>
          </div>
        </div>
        <div className="labrat-command-hero-art" aria-hidden="true">
          <img src={labratTheme === 'clinical' ? '/labrat_hero_rat_dark.png' : '/labrat_top_left_logo_transparent.png'} alt="" />
        </div>
      </section>

      {/* Conspicuous Educational & Harm Mitigation Legal Warning Box */}
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

            {/* Dismiss Checkbox Action Button */}
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
      
      {/* Left Columns (Checklist and Log Ledger) */}
      <div className="2xl:col-span-7 flex flex-col gap-6">
        
        {visibility.schedule && (<>
        {/* Date Navigator Header Card */}
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

        {/* Back-dating Quick Assist Widget */}
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
              onClick={() => {
                setSelectedDate(todayStr);
                triggerHaptic('light');
              }}
              className="w-full sm:w-auto shrink-0 py-1.5 px-3.5 bg-cyan-500/10 hover:bg-cyan-500/20 active:scale-95 text-cyan-400 border border-cyan-500/20 hover:border-cyan-500/40 font-semibold rounded-xl text-xs transition duration-150 cursor-pointer text-center"
              id="quick-today-btn"
            >
              Reset to Today
            </button>
          </div>
        )}

        {/* Today's Checklist */}
        <div className="bg-[#0f172a]/70 border border-[#1e293b]/80 rounded-2xl p-6 shadow-xl backdrop-blur-md flex-1" id="daily-checklist-card">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-cyan-400" /> Daily Intake & Administration Checklist
            </h4>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setShowManualLog(!showManualLog);
                  }}
                  className={`text-xs font-bold px-4 py-1.5 rounded-xl border transition flex items-center gap-1.5 cursor-pointer ${
                    showManualLog
                      ? 'bg-cyan-500/25 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                      : 'bg-slate-900/60 text-slate-400 border-slate-700 hover:text-cyan-400 hover:border-cyan-500/30'
                  }`}
                  id="btn-toggle-manual-log"
                >
                  <PlusCircle className="w-3.5 h-3.5" /> {showManualLog ? "Hide Manual Dose" : "Manual Dose"}
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

          {/* Manual Dose Form Component */}
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
                    {/* Compound Selector */}
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
                          <option key={comp.id} value={comp.id}>
                            {comp.name} ({comp.doseAmount} {comp.doseUnit})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Customized Dose amount */}
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 font-mono">
                        Dose Quantity ({manualCompoundId ? compounds.find(c => c.id === manualCompoundId)?.doseUnit : 'Amount'})
                      </label>
                      <input
                        type="number"
                        step="any"
                        required
                        disabled={!manualCompoundId}
                        placeholder={manualCompoundId ? `e.g. ${compounds.find(c => c.id === manualCompoundId)?.doseAmount}` : 'Amount'}
                        value={manualDoseAmount}
                        onChange={(e) => setManualDoseAmount(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
                        id="manual-log-dose-amount"
                      />
                    </div>

                    {/* Customized Time */}
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

                  {/* Preview physical drawings / Syringe units to take */}
                  {(() => {
                    if (!manualCompoundId) return null;
                    const comp = compounds.find(c => c.id === manualCompoundId);
                    if (!comp) return null;
                    const parsedDose = parseFloat(manualDoseAmount);
                    if (!parsedDose || isNaN(parsedDose)) return null;

                    let needleUnits: number | null = null;
                    if (comp.type === 'peptide' && comp.vialSizeMg && comp.bacWaterMl) {
                      const perUnit = (comp.vialSizeMg * 1000) / (comp.bacWaterMl * 100);
                      needleUnits = Math.round((parsedDose / perUnit) * 10) / 10;
                    }

                    let pillQty: number | null = null;
                    if ((comp.type === 'steroid' || comp.type === 'supplement' || comp.type === 'compound') && comp.steroidForm === 'pill' && comp.pillSizeMg) {
                      pillQty = Math.round((parsedDose / comp.pillSizeMg) * 100) / 100;
                    }

                    let oilMl: string | null = null;
                    if ((comp.type === 'steroid' || comp.type === 'supplement' || comp.type === 'compound') && comp.steroidForm === 'oil' && comp.oilConcMgMl) {
                      oilMl = (parsedDose / comp.oilConcMgMl).toFixed(2);
                    }

                    if (needleUnits === null && pillQty === null && oilMl === null) return null;

                    return (
                      <div className="bg-cyan-500/5 border border-cyan-500/10 p-2.5 rounded-lg flex items-center gap-2 text-[10px] text-cyan-400 font-mono animate-fade-in">
                        <Syringe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                        <div>
                          <span className="font-semibold text-slate-300">Calculated Delivery Equivalent:</span>{' '}
                          {needleUnits !== null && (
                            <span>Draw <strong className="font-extrabold text-cyan-300">{needleUnits}</strong> Syringe Units (at {comp.vialSizeMg}mg reconstituted with {comp.bacWaterMl}ml)</span>
                          )}
                          {pillQty !== null && (
                            <span>Take <strong className="font-extrabold text-cyan-300">{pillQty}</strong> {pillQty === 1 ? 'pill' : 'pills'} ({comp?.pillSizeMg}mg standard pill size)</span>
                          )}
                          {oilMl !== null && (
                            <span>Draw <strong className="font-extrabold text-cyan-300">{oilMl}</strong> ml / cc ({comp?.oilConcMgMl}mg/ml density)</span>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Update cycle dose banner — shown when manual dose differs from scheduled dose */}
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
                          Your manual dose ({parsed} {comp.doseUnit}) differs from the scheduled cycle dose ({comp.doseAmount} {comp.doseUnit}).
                          Update the cycle to use this dose going forward?
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('medium');
                            onUpdateCompoundDose(comp.id, parsed);
                          }}
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
                      onClick={() => {
                        triggerHaptic('light');
                        setShowManualLog(false);
                      }}
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
                
                // Calculate needle unit draws if applicable
                let needleDrawUnits: number | null = null;
                if (compound.vialSizeMg && compound.bacWaterMl) {
                  // doseAmount (mcg) / (vialSizeMg * 1000 / (bacWaterMl * 100))
                  const perUnit = (compound.vialSizeMg * 1000) / (compound.bacWaterMl * 100);
                  needleDrawUnits = Math.round((compound.doseAmount / perUnit) * 10) / 10;
                }

                return (
                  <div
                    key={`checklist-item-${compound.id}`}
                    className={`border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 ${
                      isLogged 
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-400' 
                        : 'bg-[#1e293b]/25 border-slate-800/80 hover:border-slate-700/80'
                    }`}
                    id={`checklist-item-${compound.id}`}
                  >
                    <div className="flex items-start gap-3.5">
                      <button
                        onClick={() => handleAdministerDose(compound)}
                        disabled={isLogged}
                        className={`mt-1.5 shrink-0 transition-transform active:scale-95 cursor-pointer`}
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
                          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: compound.color }}></span>
                          <span className={`text-sm font-bold ${isLogged ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{compound.name}</span>
                          <span className="text-[9px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded uppercase">{compound.type}</span>
                        </div>

                        {/* Schedule detail line */}
                        <div className="text-[11px] text-slate-500 font-mono">
                          Week {weekNo} of {compound.durationWeeks} • Target: {compound.doseAmount} {compound.doseUnit} ({compound.frequency.replace('_', ' ')})
                        </div>

                        {/* Physical Guidance inline */}
                        {!isLogged && (
                          <>
                            {needleDrawUnits !== null && (
                              <div className="flex items-center gap-1.5 text-[10px] text-cyan-400 bg-cyan-950/20 border border-cyan-900/10 py-1 px-2 rounded-md font-mono mt-2 w-fit">
                                <Syringe className="w-3.5 h-3.5" />
                                <span>Draw exactly <strong className="font-extrabold text-cyan-300">{needleDrawUnits}</strong> Syringe Units</span>
                              </div>
                            )}
                            {(compound.type === 'steroid' || compound.type === 'supplement' || compound.type === 'compound') && compound.steroidForm === 'pill' && compound.pillSizeMg && (
                              <div className="flex items-center gap-1.5 text-[10px] text-cyan-400 bg-cyan-950/20 border border-cyan-900/10 py-1 px-2 rounded-md font-mono mt-2 w-fit">
                                <CheckSquare className="w-3.5 h-3.5" />
                                <span>Take exactly <strong className="font-extrabold text-cyan-300">{Math.round((compound.doseAmount / compound.pillSizeMg) * 100) / 100}</strong> {Math.round((compound.doseAmount / compound.pillSizeMg) * 100) / 100 === 1 ? 'pill' : 'pills'} ({compound.pillSizeMg}mg each)</span>
                              </div>
                            )}
                            {(compound.type === 'steroid' || compound.type === 'supplement' || compound.type === 'compound') && compound.steroidForm === 'oil' && compound.oilConcMgMl && (
                              <div className="flex items-center gap-1.5 text-[10px] text-cyan-400 bg-cyan-950/20 border border-cyan-900/10 py-1 px-2 rounded-md font-mono mt-2 w-fit">
                                <Syringe className="w-3.5 h-3.5" />
                                <span>Draw exactly <strong className="font-extrabold text-cyan-300">{(compound.doseAmount / compound.oilConcMgMl).toFixed(2)}</strong> ml / cc ({compound.oilConcMgMl}mg/ml)</span>
                              </div>
                            )}
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
                        onClick={() => handleAdministerDose(compound)}
                        className="py-1.5 px-3 bg-[#1e293b] hover:bg-cyan-500 hover:text-slate-950 text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 border border-slate-700/60 transition"
                        id={`administer-btn-${compound.id}`}
                      >
                        Log Administration
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        </>)}

        {/* Administration History Ledger Log */}
        {visibility.history && (
        <div className="bg-[#0f172a]/70 border border-[#1e293b]/80 rounded-2xl p-6 shadow-xl backdrop-blur-md" id="administration-ledger-card">
          <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" /> Chronological Administration Logs
          </h4>

          {logs.length === 0 ? (
            <p className="text-center py-10 text-slate-600 text-xs">No administration logs recorded yet. Check off items in the daily list above to generate records.</p>
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
                  {logs.slice().reverse().slice(0, ledgerShowCount).map((log) => (
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
                  Showing {Math.min(ledgerShowCount, logs.length)} of {logs.length} log{logs.length !== 1 ? 's' : ''}
                </span>
                <div className="flex items-center gap-2">
                  {ledgerShowCount > 5 && (
                    <button
                      type="button"
                      onClick={() => setLedgerShowCount(5)}
                      className="text-[10px] font-bold text-slate-400 hover:text-slate-300 bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/40 px-3 py-1 rounded-lg transition cursor-pointer"
                    >
                      Show Less
                    </button>
                  )}
                  {logs.length > ledgerShowCount && (
                    <button
                      type="button"
                      onClick={() => setLedgerShowCount(prev => prev + 5)}
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
        )}
      </div>

      {/* Right Column (Cycle Progress) */}
      <div className="2xl:col-span-5 flex flex-col gap-6" id="dashboard-wellness-panel">

        {/* Active Cycle Progress Monitors */}
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
              compounds.map((comp) => {
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
                  <div key={`progress-card-${comp.id}`} className="bg-[#1e293b]/15 border border-[#1e293b]/45 rounded-xl p-3.5 space-y-2.5" id={`progress-card-${comp.id}`}>
                    <div className="flex justify-between items-start gap-2">
                      <div className="text-left">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: comp.color }}></span>
                          <span className="text-xs font-bold text-slate-200">{comp.name}</span>
                          {comp.isCompleted ? (
                            <span className="text-[8px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-1 py-0.2 rounded font-semibold font-mono">
                              FIN
                            </span>
                          ) : elapsedDays >= totalDays ? (
                            <span className="text-[8px] bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 px-1 py-0.2 rounded font-semibold font-mono">
                              ELAPSED
                            </span>
                          ) : elapsedDays < 0 ? (
                            <span className="text-[8px] bg-amber-500/10 text-amber-500 border border-amber-500/10 px-1 py-0.2 rounded font-semibold font-mono">
                              PENDING
                            </span>
                          ) : (
                            <span className="text-[8px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/10 px-1 py-0.2 rounded font-semibold font-mono">
                              RUNNING
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono block mt-0.5">Week {Math.min(comp.durationWeeks, Math.max(1, weeksCompleted + 1))} of {comp.durationWeeks} • Started {comp.startDate}</span>
                      </div>
                      
                      <div className="text-right font-mono text-[10px] sm:text-xs">
                        <span className="font-bold text-slate-300">{comp.isCompleted ? '100' : roundedPct}%</span>
                        <span className="text-slate-500 text-[10px] block font-normal">
                          {comp.isCompleted ? 'Completed' : daysRemaining === 0 ? 'Completed' : `${daysRemaining} days left`}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="w-full bg-[#0f172a] h-1.5 rounded-full overflow-hidden border border-[#1e293b]/40">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ 
                          width: `${comp.isCompleted ? 100 : roundedPct}%`,
                          backgroundColor: comp.isCompleted ? '#10b981' : comp.color
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>


      </div>

    </div>

  </div>
  );
}