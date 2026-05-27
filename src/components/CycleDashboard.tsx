import React, { useState } from 'react';
import { Check, CheckCircle2, Circle, Calendar, Weight, Smile, Activity, HelpCircle, History, Trash2, CalendarDays, PlusCircle, AlertCircle, Syringe, CheckSquare, Smartphone, Bell, BellRing, Clock, ShieldAlert, Loader2, Timer, Gauge, Zap, Sparkles, Heart, Info } from 'lucide-react';
import { Compound, DoseLog, DailyMetric, formatTimeTo12Hour } from '../types';
import { triggerHaptic } from '../lib/haptics';
import { safeLocalStorage } from '../lib/storage';
import { motion, AnimatePresence } from 'motion/react';
import { PEPTIDE_LIBRARY } from '../data/peptides';

interface CycleDashboardProps {
  compounds: Compound[];
  logs: DoseLog[];
  metrics: DailyMetric[];
  onLogDose: (log: DoseLog) => void;
  onUndoDose: (id: string) => void;
  onSaveMetrics: (metric: DailyMetric) => void;
  onDeleteMetric?: (date: string) => void;
}

export default function CycleDashboard({
  compounds,
  logs,
  metrics,
  onLogDose,
  onUndoDose,
  onSaveMetrics,
  onDeleteMetric
}: CycleDashboardProps) {
  // Navigation for Daily Checklist Date (default is today)
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Selected timeline states
  const [selectedTimelineId, setSelectedTimelineId] = useState<string | null>(null);
  const [selectedTimelineWeek, setSelectedTimelineWeek] = useState<number | null>(null);

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

  // Helper: Get elapsed week position for compound
  const getElapsedWeek = (comp: Compound) => {
    const start = new Date(comp.startDate + 'T00:00:00');
    const today = new Date();
    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const diffTime = todayMidnight.getTime() - start.getTime();
    const elapsedDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (elapsedDays < 0) return 0; // Not started yet / Pending
    const week = Math.floor(elapsedDays / 7) + 1;
    return Math.min(comp.durationWeeks, week);
  };

  // Helper: Find matched PEPTIDE_LIBRARY record
  const getLibraryItem = (comp: Compound) => {
    return PEPTIDE_LIBRARY.find(
      item => item.id === comp.id || 
      item.name.toLowerCase() === comp.name.toLowerCase()
    );
  };

  // Helper: Generate transition points, expectations and body impacts
  const getPhaseInfo = (comp: Compound, week: number) => {
    const lib = getLibraryItem(comp);
    const totalWeeks = comp.durationWeeks;
    const ratio = week / totalWeeks;

    let title = '';
    let description = '';
    let results = '';
    let benefits: string[] = [];
    let warnings: string[] = [];
    let diet = '';

    // Fallbacks
    const fallbackGains = lib?.realisticGains || "Observational adjustments in wellness parameters, strength markers, and cellular efficiency.";
    const fallbackBenefits = lib?.benefits ? lib.benefits.map(b => b.replace(/Plus \(\+\):\s*/g, '')) : [
      "Optimized cellular signaling active",
      "Stable hydration of target tissues",
      "Baseline metabolic enzymatic support"
    ];
    const fallbackWarnings = lib?.sideEffects ? lib.sideEffects.map(b => b.replace(/Minus \(-\):\s*/g, '')) : [
      "Transient site irritability or injection flush",
      "Water dynamics fluctuation/minor tightness",
      "Pumping values elevation; monitor blood pressure"
    ];
    const fallbackDiet = lib?.dietaryInteraction || "Maintain standard balanced hydration and consistent macronutrient distribution.";

    if (ratio <= 0.25) {
      title = "Phase I: Saturation & Physiological Onset";
      description = `Initial exposure (Week ${week} of ${totalWeeks}). The active substance is gradually saturating plasma levels. Receptors are beginning to adapt to localized increases, prompting early metabolic, structural, or recovery triggers.`;
      results = `Biological onset initiated. ${fallbackGains.slice(0, 160)}... Expected changes are starting to emerge on a cellular level without overloading natural homeostasis.`;
      benefits = [
        "Uptake optimization beginning",
        fallbackBenefits[0] || "Enhanced recovery initiation",
        fallbackBenefits[1] || "Cellular hydration improvement"
      ];
      warnings = [
        "Monitor for localized administration site stinging",
        fallbackWarnings[0] || "Temporary minor headaches or flush",
        "Keep baseline sodium intake moderate and balanced"
      ];
      diet = `Induction optimization: ${fallbackDiet}`;
    } else if (ratio > 0.25 && ratio <= 0.70) {
      title = "Phase II: Steady-State Peak Bioactivity";
      description = `Therapeutic plateau (Week ${week} of ${totalWeeks}). Peak steady-state concentration is achieved in circulating circulation. Full systemic effects are active, driving accelerated tissue healing, lipolysis, endurance, or endocrine conversion depending on target profile.`;
      results = `${fallbackGains} Peak concentration allows for maximum biological translation. Keep daily verification checklist disciplined.`;
      benefits = fallbackBenefits.slice(0, 3);
      warnings = [
        "Watch for systemic adaptation thresholds",
        fallbackWarnings[0] || "Mild muscle tightness or hydration retention",
        fallbackWarnings[1] || "Observe nervous system saturation fatigue"
      ];
      diet = `Steady-state performance fuel: ${fallbackDiet}`;
    } else {
      title = "Phase III: Mature Adaptation & Gain Consolidation";
      description = `Maturity & consolidation phase (Week ${week} of ${totalWeeks}). The body has adapted to steady signaling. Gains in structural repair, cartilage remodeling, or fat oxidation are stabilized into long-term tissue memories.`;
      results = `Matured plateau. Systemic gains are consolidating. Maintain scheduling consistent — increasing dosages at this stage has proven to generate diminishing therapeutic results and elevated side impacts.`;
      benefits = [
        "Consolidation of structural tissue adapts",
        fallbackBenefits[fallbackBenefits.length - 1] || "Optimized baseline healing state",
        "Consistent tracking metric stability"
      ];
      warnings = [
        "Watch for cumulative adaptation exhaustion",
        fallbackWarnings[fallbackWarnings.length - 1] || "Mild lethargy or neural dampening",
        "Check overall biomarkers (lipids/metabolics)"
      ];
      diet = `Maturity consolidation support: Ensure clean nutrition coverages. ${fallbackDiet}`;
    }

    return { title, description, results, benefits, warnings, diet };
  };

  // Wellness Log State for selectedDate
  const currentMetric = metrics.find(m => m.date === selectedDate) || {
    date: selectedDate,
    weightLb: undefined,
    mood: 3,
    fatigue: 3,
    sideEffects: '',
    notes: ''
  };

  const [weight, setWeight] = useState<string>(currentMetric.weightLb ? currentMetric.weightLb.toString() : '');
  const [mood, setMood] = useState<number>(currentMetric.mood || 3);
  const [fatigue, setFatigue] = useState<number>(currentMetric.fatigue || 3);
  const [sideEffects, setSideEffects] = useState<string>(currentMetric.sideEffects || '');
  const [metricNotes, setMetricNotes] = useState<string>(currentMetric.notes || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Disclaimer dismissal state stored in localStorage
  const [disclaimerDismissed, setDisclaimerDismissed] = useState(() => {
    return safeLocalStorage.getItem('labrat_dashboard_disclaimer_dismissed') === 'true';
  });

  // Mobile Native & PWA notifications states
  const [notificationPermission, setNotificationPermission] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );
  const [reminderEnabled, setReminderEnabled] = useState(() => {
    return safeLocalStorage.getItem('labrat_reminder_enabled') === 'true';
  });
  const [reminderTime, setReminderTime] = useState(() => {
    return safeLocalStorage.getItem('labrat_reminder_time') || '09:00';
  });
  const [testStatus, setTestStatus] = useState<'idle' | 'countdown' | 'triggered' | 'denied' | 'unsupported'>('idle');
  const [countdown, setCountdown] = useState(5);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      setNotificationPermission('unsupported');
      return;
    }
    try {
      const status = await Notification.requestPermission();
      setNotificationPermission(status);
      if (status === 'granted') {
        setReminderEnabled(true);
        safeLocalStorage.setItem('labrat_reminder_enabled', 'true');
      }
    } catch (e) {
      console.error('Error requesting notification permission', e);
    }
  };

  const handleReminderToggle = (enabled: boolean) => {
    setReminderEnabled(enabled);
    safeLocalStorage.setItem('labrat_reminder_enabled', enabled ? 'true' : 'false');
    if (enabled && notificationPermission !== 'granted') {
      requestNotificationPermission();
    }
  };

  const handleReminderTimeChange = (time: string) => {
    setReminderTime(time);
    safeLocalStorage.setItem('labrat_reminder_time', time);
  };

  const triggerTestNotification = () => {
    triggerHaptic('medium');
    if (!('Notification' in window)) {
      setTestStatus('unsupported');
      return;
    }
    if (Notification.permission !== 'granted') {
      Notification.requestPermission().then(status => {
        setNotificationPermission(status);
        if (status === 'granted') {
          startTestCountdown();
        } else {
          setTestStatus('denied');
        }
      });
    } else {
      startTestCountdown();
    }
  };

  const startTestCountdown = () => {
    setTestStatus('countdown');
    setCountdown(5);
    
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          firePhysicalNotification();
          return 5;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const firePhysicalNotification = () => {
    setTestStatus('triggered');
    setTimeout(() => setTestStatus('idle'), 4000);

    const title = '🔬 LabRat Administrator Alert';
    const options = {
      body: 'Time to record today’s dosage checklist administrations. Live sync active!',
      icon: '/vitamins_icon.png',
      badge: '/vitamins_icon.png',
      vibrate: [200, 100, 200],
      tag: 'labrat-reminder-test',
      renotify: true
    };

    // If service worker is active, trigger standard background notification on mobile
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        reg.showNotification(title, options).catch(err => {
          console.warn('Service worker showNotification failed, fallback to Browser object', err);
          new Notification(title, options);
        });
      }).catch(() => {
        new Notification(title, options);
      });
    } else {
      new Notification(title, options);
    }
  };

  // Sync state if selectedDate changes
  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    const m = metrics.find(item => item.date === date);
    if (m) {
      setWeight(m.weightLb ? m.weightLb.toString() : '');
      setMood(m.mood || 3);
      setFatigue(m.fatigue || 3);
      setSideEffects(m.sideEffects || '');
      setMetricNotes(m.notes || '');
    } else {
      setWeight('');
      setMood(3);
      setFatigue(3);
      setSideEffects('');
      setMetricNotes('');
    }
  };

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

  const handleSaveWellness = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedMetric: DailyMetric = {
      date: selectedDate,
      weightLb: weight ? parseFloat(weight) : undefined,
      mood,
      fatigue,
      sideEffects: sideEffects.trim(),
      notes: metricNotes.trim()
    };

    onSaveMetrics(updatedMetric);
    triggerHaptic('success');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  // Timeline Active Selections Computed Row
  const activeCompound = compounds.find(c => c.id === selectedTimelineId) || compounds[0];
  const activeWeek = selectedTimelineWeek !== null ? selectedTimelineWeek : (activeCompound ? Math.max(1, getElapsedWeek(activeCompound)) : 1);
  const maxDurationWeeks = compounds.reduce((max, c) => Math.max(max, c.durationWeeks), 8);

  return (
    <div className="space-y-6 flex flex-col" id="dashboard-wrapper">
      <section className="labrat-command-hero" id="labrat-command-hero">
        <div className="labrat-command-hero-copy">
          <span className="labrat-command-eyebrow">Neon Lab Command Center</span>
          <h2>Daily Cockpit</h2>
          <p>Track today's active schedule, verify administrations, monitor cycle progress, and keep device reminders ready from one high-visibility command surface.</p>
          <div className="labrat-command-metrics">
            <div>
              <strong>{scheduledCompounds.length}</strong>
              <span>Scheduled Today</span>
            </div>
            <div>
              <strong>{logs.filter(l => l.date === selectedDate).length}</strong>
              <span>Logged Entries</span>
            </div>
            <div>
              <strong>{compounds.filter(c => !c.isCompleted).length}</strong>
              <span>Active Cycles</span>
            </div>
          </div>
        </div>
        <div className="labrat-command-hero-art" aria-hidden="true">
          <img src="/labrat_top_left_logo_transparent.png" alt="" />
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

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="dashboard-main-grid">
      
      {/* Left Columns (Checklist and Log Ledger) */}
      <div className="xl:col-span-7 flex flex-col gap-6">
        
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
                handleDateChange(prev.toISOString().split('T')[0]);
              }}
              className="py-1.5 px-3 bg-[#1e293b] hover:bg-slate-800 border border-slate-700/60 rounded-xl text-xs font-semibold text-slate-300 transition cursor-pointer"
              id="prev-day-btn"
            >
              ← Previous Day
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="bg-[#1e293b]/50 border border-slate-700/60 text-slate-200 text-xs py-1 px-3 rounded-xl focus:outline-none focus:border-cyan-500 font-mono"
              id="selected-date-picker"
            />
            <button
              onClick={() => {
                const next = new Date(selectedDate + 'T00:00:00');
                next.setDate(next.getDate() + 1);
                handleDateChange(next.toISOString().split('T')[0]);
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
                handleDateChange(todayStr);
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
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setShowManualLog(!showManualLog);
                }}
                className={`text-[10px] font-bold px-3 py-1 rounded-full border transition flex items-center gap-1 cursor-pointer ${
                  showManualLog 
                    ? 'bg-cyan-500/25 text-cyan-300 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.15)]' 
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-cyan-400 hover:border-cyan-500/20'
                }`}
                id="btn-toggle-manual-log"
              >
                <PlusCircle className="w-3.5 h-3.5" /> {showManualLog ? "Hide Custom Log" : "Log Manual/Past Dose"}
              </button>
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
                  <PlusCircle className="w-4 h-4 text-cyan-400" /> Log Custom/Unscheduled Dose
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
              <p className="text-xs text-slate-600 max-w-xs mx-auto">No substance administration is scheduled for this date. Click <strong className="text-cyan-400 font-semibold cursor-pointer" onClick={() => { triggerHaptic('light'); setShowManualLog(true); }}>Log Manual/Past Dose</strong> above to record an unscheduled dose or back-dated entry.</p>
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

        {/* Administration History Ledger Log */}
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
                  {logs.slice().reverse().slice(0, 10).map((log) => (
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
              <span className="text-[10px] text-slate-500 block text-center mt-3 pt-3 border-t border-slate-800/40">Showing up to the 10 most recent administrative logs</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Column (Wellness Logs and Progress Records) */}
      <div className="xl:col-span-5 flex flex-col gap-6" id="dashboard-wellness-panel">

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

        {/* Smartphone PWA Mobile Notifications Setup & Helpers */}
        <div className="bg-[#0f172a]/70 border border-[#1e293b]/80 rounded-2xl p-6 shadow-xl backdrop-blur-md" id="mobile-notifications-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-cyan-400" />
              <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider text-left">Device Push Reminders</h4>
            </div>
            <span className="text-[10px] bg-cyan-950/40 text-cyan-400 px-2.5 py-0.5 rounded-full border border-cyan-500/20 font-bold font-mono">
              Phone Support
            </span>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-slate-400 text-left leading-relaxed">
              When configured, LabRat can dispatch device notification alerts and chemical schedule counters directly to your iOS or Android notification center after home-screen installation.
            </p>

            {/* Quick Status Checks */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl text-left">
                <span className="text-[9px] text-slate-500 block uppercase font-bold">App Environment</span>
                <span className="text-[11px] text-slate-300 font-semibold mt-0.5 flex items-center gap-1.5">
                  {typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse"></span>
                      <span>PWA Standalone</span>
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24]"></span>
                      <span>Web Browser</span>
                    </>
                  )}
                </span>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-xl text-left">
                <span className="text-[9px] text-slate-500 block uppercase font-bold">Permission State</span>
                <span className="text-[11px] text-slate-300 font-semibold mt-0.5 flex items-center gap-1.5">
                  {notificationPermission === 'granted' ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]"></span>
                      <span className="text-emerald-400">Granted</span>
                    </>
                  ) : notificationPermission === 'denied' ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_6px_#f87171]"></span>
                      <span className="text-red-400 font-bold">Blocked</span>
                    </>
                  ) : (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                      <span>Ask Permission</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Request Permission or Toggle Switches */}
            {notificationPermission !== 'granted' ? (
              <button
                type="button"
                onClick={requestNotificationPermission}
                className="w-full py-2.5 px-4 bg-cyan-500/10 hover:bg-cyan-500/20 active:bg-cyan-500/30 text-cyan-400 hover:text-cyan-300 border border-cyan-500/25 hover:border-cyan-500/40 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                id="request-notifications-btn"
              >
                <BellRing className="w-4 h-4" />
                <span>Grant Phone Notification Permission</span>
              </button>
            ) : (
              <div className="bg-[#1e293b]/15 border border-[#1e293b]/45 p-3.5 rounded-xl space-y-3">
                {/* Switch indicator */}
                <div className="flex items-center justify-between">
                  <div className="text-left space-y-0.5">
                    <span className="text-xs font-bold text-slate-200">Daily Reminder Service</span>
                    <span className="text-[10px] text-slate-500 block font-mono">Dispatches active chemical counters</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleReminderToggle(!reminderEnabled)}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      reminderEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                    id="reminder-toggle-switch"
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-950 shadow ring-0 transition duration-200 ease-in-out ${
                        reminderEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Preferred time selector */}
                {reminderEnabled && (
                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/80">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-500" />
                      <span>Reminder Dispatch Time:</span>
                    </span>
                    <input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => handleReminderTimeChange(e.target.value)}
                      className="bg-[#0f172a] border border-slate-800 text-slate-200 text-xs py-1 px-2.5 rounded-lg focus:outline-none focus:border-cyan-500 text-right font-mono"
                      id="reminder-time-picker"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Test Simulation Module */}
            <div className="bg-slate-950/40 border border-[#1e293b]/50 p-3 rounded-xl space-y-2.5 text-left">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono block">Simulate Native Reminders</span>
              <p className="text-[10.5px] text-slate-500 leading-normal">
                Locks/backgrounds aren’t required to test! Request a delayed alert below, then put your device in your pocket or lock the screen to verify native behavior.
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={triggerTestNotification}
                  disabled={testStatus === 'countdown'}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition border cursor-pointer ${
                    testStatus === 'countdown'
                      ? 'bg-amber-500/15 border-amber-500/20 text-amber-400 font-mono text-[11px] font-black'
                      : 'bg-[#1e293b] border-slate-805 hover:border-slate-700 text-slate-300'
                  }`}
                  id="simulate-notification-btn"
                >
                  {testStatus === 'countdown' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                      <span>Dispatch in {countdown}s...</span>
                    </>
                  ) : testStatus === 'triggered' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400 font-bold" />
                      <span>Success! Check Notification Center</span>
                    </>
                  ) : (
                    <>
                      <Bell className="w-3.5 h-3.5 text-slate-400" />
                      <span>Send test alert (5s)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Helpful instructions block */}
              {typeof window !== 'undefined' && !(window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone) && (
                <div className="border border-dashed border-cyan-500/10 bg-cyan-950/5 p-2.5 rounded-lg text-[9.5px] leading-relaxed text-slate-500">
                  <div className="flex gap-1.5 items-start">
                    <ShieldAlert className="w-3.5 h-3.5 text-cyan-500 shrink-0 mt-0.5" />
                    <span>
                      <strong>iOS / Android Instructions:</strong> Standard phone push/local alerts require you to install this app to your Home Screen first! Tap the share/install icon on your phone’s browser navigation, click <strong>"Add to Home Screen"</strong>, then reopen the app to activate device reminders.
                    </span>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Wellness and Biomarker Daily Forms */}
        <div className="bg-[#0f172a]/70 border border-[#1e293b]/80 rounded-2xl p-6 shadow-xl backdrop-blur-md" id="wellness-form-card">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-indigo-400" />
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Wellness & Biomarkers</h4>
          </div>

          <form onSubmit={handleSaveWellness} className="space-y-5">
            {/* Weight entry */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Body Weight</span>
                <span className="text-[10px] font-mono text-slate-500">Lbs</span>
              </label>
              <div className="flex gap-2 items-center bg-[#1e293b]/45 border border-slate-700/60 rounded-xl pr-3">
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="e.g. 180"
                  className="w-full bg-transparent border-0 rounded-l-xl py-2.5 px-3.5 text-sm text-slate-200 focus:outline-none"
                  id="wellness-weight-input"
                />
                <Weight className="w-4 h-4 text-slate-500" />
              </div>
            </div>

            {/* Mood score */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Core Mood Indicator</span>
                <span className="text-[11px] text-indigo-400 font-bold font-mono">Score: {mood}/5</span>
              </label>
              <div className="grid grid-cols-5 gap-2" id="mood-scores-selector">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={`mood-${num}`}
                    type="button"
                    onClick={() => setMood(num)}
                    className={`py-2 px-1 text-center font-mono rounded-lg border text-sm transition-all cursor-pointer ${
                      mood === num
                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/50 scale-105'
                        : 'bg-[#1e293b]/25 border-slate-800 text-slate-400'
                    }`}
                    id={`mood-btn-${num}`}
                  >
                    {num === 1 ? '🙁 1' : num === 2 ? '😐 2' : num === 3 ? '🙂 3' : num === 4 ? '😊 4' : '🤩 5'}
                  </button>
                ))}
              </div>
            </div>

            {/* Fatigue score */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Physical Energy / Fatigue level</span>
                <span className="text-[11px] text-indigo-400 font-bold font-mono">Score: {fatigue}/5</span>
              </label>
              <div className="grid grid-cols-5 gap-2" id="fatigue-scores-selector">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={`fatigue-${num}`}
                    type="button"
                    onClick={() => setFatigue(num)}
                    className={`py-2 px-1 text-center font-mono rounded-lg border text-sm transition-all cursor-pointer ${
                      fatigue === num
                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/50 scale-105'
                        : 'bg-[#1e293b]/25 border-slate-800 text-slate-400'
                    }`}
                    id={`fatigue-btn-${num}`}
                  >
                    {num === 1 ? '😴 1' : num === 2 ? '🥱 2' : num === 3 ? '💪 3' : num === 4 ? '⚡ 4' : '🔥 5'}
                  </button>
                ))}
              </div>
            </div>

            {/* Side effects field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Transient Side Effects (Allergies, Nausea, Site Sting)</label>
              <input
                type="text"
                value={sideEffects}
                onChange={(e) => setSideEffects(e.target.value)}
                placeholder="List any reactions or symptoms..."
                className="w-full bg-[#1e293b]/45 border border-slate-700/60 rounded-xl py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/80"
                id="wellness-side-effects-input"
              />
            </div>

            {/* Text Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Journal notes</label>
              <textarea
                value={metricNotes}
                onChange={(e) => setMetricNotes(e.target.value)}
                placeholder="Insert focus points, sleep measurements, diet changes..."
                className="w-full h-18 bg-[#1e293b]/45 border border-slate-700/60 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80"
                id="wellness-notes-textarea"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#1e293b]/60">
              <span className="text-[10px] text-slate-500 font-mono">Date: {selectedDate}</span>
              {saveSuccess && <span className="text-emerald-400 text-[11px] font-semibold">✓ Metric Journal Recorded</span>}
              <button
                type="submit"
                className="py-2 px-4 bg-indigo-500 hover:bg-indigo-400 active:bg-indigo-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-500/10"
                id="submit-wellness-btn"
              >
                Save Journal Entry
              </button>
            </div>
          </form>
        </div>

        {/* Historic Wellness Logs Entries list */}
        <div className="bg-[#0f172a]/70 border border-[#1e293b]/80 rounded-2xl p-6 shadow-xl backdrop-blur-md flex-1" id="metrics-ledger-card">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-indigo-400" />
            <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">Historical Biomarker ledger</h4>
          </div>

          <div className="space-y-3" id="wellness-ledgers-list">
            {metrics.length === 0 ? (
              <p className="text-xs text-slate-600 text-center py-6">Your daily biometrics ledger is empty. Save some measurements above to list logs.</p>
            ) : (
              metrics.slice().reverse().slice(0, 5).map((m) => (
                <div key={`metric-row-${m.date}`} className="bg-[#1e293b]/20 border border-slate-800/80 p-3.5 rounded-xl text-xs space-y-1.5" id={`metric-row-${m.date}`}>
                  <div className="flex justify-between items-center font-mono font-bold text-slate-300">
                    <div className="flex items-center gap-2">
                      <span>{m.date}</span>
                      {onDeleteMetric && (
                        <button
                          type="button"
                          onClick={() => {
                            triggerHaptic('warning');
                            onDeleteMetric(m.date);
                          }}
                          className="p-1 text-slate-500 hover:text-rose-400 transition cursor-pointer rounded"
                          title="Delete entry"
                          id={`delete-metric-btn-${m.date}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    {m.weightLb && <span className="text-cyan-400">Weight: {m.weightLb} Lbs</span>}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-400 text-[11px] font-mono">
                    <span>Mood: {Array(m.mood).fill('⭐').join('') || '—'}</span>
                    <span>Energy: {Array(m.fatigue).fill('⚡').join('') || '—'}</span>
                  </div>
                  {m.sideEffects && (
                    <div className="text-[10px] text-rose-300 font-mono">
                      <strong>Reaction:</strong> {m.sideEffects}
                    </div>
                  )}
                  {m.notes && (
                    <p className="text-[11px] text-slate-400 italic">
                      &ldquo;{m.notes}&rdquo;
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>

    {/* SCIENTIFIC CYCLE TIMELINE & ADAPTIVE PHASE MAP */}
    <div className="bg-[#0f172a]/70 border border-[#1e293b]/80 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col gap-6" id="cycle-timeline-section">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 text-left">
            <span className="text-xs text-indigo-400 font-mono tracking-wider font-semibold uppercase flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-indigo-405 animate-pulse" /> SCIENTIFIC OBSERVATION TRANSITION TIMELINE
            </span>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
              <span>Bio-Timeline & Phase Diagnostic Mapper</span>
            </h3>
            <p className="text-xs text-slate-400">
              Interactive timeline mapping active substance saturations against current cycle weeks. Select any active week cell below to inspect its diagnostic phase transition landmarks, expected gains, and body impact safety warnings.
            </p>
          </div>
          {compounds.length > 0 && (
            <div className="flex flex-wrap gap-2 text-[10px] font-mono leading-none items-center self-start md:self-center">
              <span className="flex items-center gap-1.5 bg-[#141b2e] border border-cyan-500/25 px-2.5 py-1.5 rounded-xl text-cyan-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                <span>Current Observation Week</span>
              </span>
              <span className="flex items-center gap-1.5 bg-indigo-950/40 border border-indigo-500/20 px-2.5 py-1.5 rounded-xl text-indigo-300 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span>Selected Focus State</span>
              </span>
            </div>
          )}
        </div>

        {compounds.length === 0 ? (
          <div className="text-center py-10 text-slate-500 border border-dashed border-slate-800 rounded-2xl space-y-2">
            <span className="text-2xl block">🗺️</span>
            <p className="text-sm font-semibold text-slate-400">Empty Bio-Timeline</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No active compounds scheduled in your database. Configure your active biological map in the <strong>Cycle Architect</strong> to plot timeline transitions.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Timeline Swimlanes Scrollable Grid */}
            <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-800" id="timeline-scroll-grid">
              <div className="min-w-[800px] space-y-3.5">
                {/* Header Row (WK 1, WK 2, etc.) */}
                <div 
                  className="font-mono text-[10px] font-bold text-slate-500 border-b border-[#1e293b]/45 pb-2.5 cursor-default select-none"
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: `repeat(${maxDurationWeeks + 3}, minmax(0, 1fr))`, 
                    gap: '6px' 
                  }}
                >
                  <div className="col-span-3 text-left pl-2 text-slate-400 uppercase tracking-widest text-[9px] flex items-center">
                    Substance Schedules
                  </div>
                  {Array.from({ length: maxDurationWeeks }).map((_, i) => {
                    const weekNo = i + 1;
                    return (
                      <div key={`header-wk-${weekNo}`} className="col-span-1 flex flex-col justify-center items-center text-center">
                        <span>WK {weekNo}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Rows for each Compound */}
                <div className="space-y-3.5">
                  {compounds.map((comp) => {
                    const elapsedWeek = getElapsedWeek(comp);
                    const isSelectedComp = activeCompound?.id === comp.id;

                    return (
                      <div 
                        key={`timeline-row-${comp.id}`} 
                        className="items-center"
                        style={{ 
                          display: 'grid', 
                          gridTemplateColumns: `repeat(${maxDurationWeeks + 3}, minmax(0, 1fr))`, 
                          gap: '6px' 
                        }}
                      >
                        {/* Left compound meta */}
                        <div 
                          onClick={() => {
                            setSelectedTimelineId(comp.id);
                            setSelectedTimelineWeek(Math.max(1, Math.min(comp.durationWeeks, elapsedWeek || 1)));
                            triggerHaptic('light');
                          }}
                          className={`col-span-3 text-left pl-3.5 py-2 cursor-pointer transition rounded-xl border flex flex-col justify-center gap-0.5 ${
                            isSelectedComp 
                              ? 'bg-[#1e293b]/60 border-slate-700/80 shadow-md shadow-slate-900/40' 
                              : 'hover:bg-[#1e293b]/20 border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ backgroundColor: comp.color }}></span>
                            <span className="text-xs font-bold text-slate-200 truncate">{comp.name}</span>
                          </div>
                          <div className="text-[9.5px] text-slate-500 font-mono truncate uppercase">
                            {comp.doseAmount} {comp.doseUnit} • {comp.durationWeeks} Wks
                          </div>
                        </div>

                        {/* Columns of weeks */}
                        {Array.from({ length: maxDurationWeeks }).map((_, i) => {
                          const weekNo = i + 1;
                          const isWithinDuration = weekNo <= comp.durationWeeks;
                          const isCurrentWeek = weekNo === elapsedWeek;
                          const isSelectedWeek = isSelectedComp && activeWeek === weekNo;

                          // Dynamic theme border background classes
                          let trackBg = 'bg-[#1e293b]/5 text-slate-700 border-transparent';
                          if (isWithinDuration) {
                            if (isSelectedWeek) {
                              trackBg = 'border-slate-300 text-slate-100';
                            } else {
                              trackBg = 'hover:bg-slate-800/40 text-slate-400 border-transparent';
                            }
                          }

                          // Define relative phases
                          const isInitiation = weekNo <= 2;
                          const isPeak = weekNo > 2 && weekNo <= Math.round(comp.durationWeeks * 0.7);

                          return (
                            <button
                              key={`cell-${comp.id}-${weekNo}`}
                              disabled={!isWithinDuration}
                              onClick={() => {
                                setSelectedTimelineId(comp.id);
                                setSelectedTimelineWeek(weekNo);
                                triggerHaptic('light');
                              }}
                              className={`col-span-1 h-12 relative flex flex-col justify-between items-center rounded-xl border text-[10px] font-mono transition-all py-2 select-none ${trackBg} ${
                                isWithinDuration ? 'cursor-pointer hover:scale-[1.03]' : 'cursor-not-allowed opacity-15'
                              }`}
                              style={
                                isWithinDuration && isSelectedWeek ? {
                                  backgroundColor: `${comp.color}25`,
                                  borderColor: comp.color,
                                  color: '#f8fafc',
                                  boxShadow: `0 0 10px ${comp.color}20`
                                } : isWithinDuration ? {
                                  backgroundColor: `${comp.color}08`,
                                  borderColor: `${comp.color}25`
                                } : {}
                              }
                            >
                              {/* Small absolute marker for today's active position */}
                              {isWithinDuration && isCurrentWeek && (
                                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                                </span>
                              )}

                              <span className="text-[10px] font-semibold">
                                {isWithinDuration ? `${comp.doseAmount}` : '—'}
                              </span>

                              <div className="text-[8px] scale-90 tracking-tight text-slate-500 uppercase leading-none font-semibold">
                                {isWithinDuration ? (
                                  isInitiation ? 'Onset' : isPeak ? 'Peak' : 'Mature'
                                ) : 'Off'}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ADAPTIVE OBSERVATIONAL EXPLORER CARD */}
            {activeCompound && (
              <div 
                className="bg-[#101b2e]/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl font-sans text-left relative overflow-hidden transition-all duration-300"
                style={{
                  borderLeft: `4px solid ${activeCompound.color}`
                }}
              >
                <div 
                  className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full opacity-[0.03] pointer-events-none" 
                  style={{ backgroundColor: activeCompound.color }}
                ></div>
                
                {/* Identification block */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#1e293b]/70 pb-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[9px] font-mono font-bold bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded-full uppercase border border-indigo-500/10">
                        Week {activeWeek} Transitions Map
                      </span>
                      <span 
                        className="text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase" 
                        style={{ 
                          backgroundColor: `${activeCompound.color}15`, 
                          color: activeCompound.color, 
                          border: `1px solid ${activeCompound.color}25` 
                        }}
                      >
                        {activeCompound.type}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-slate-200 flex items-center gap-1.5 flex-wrap">
                      <span>{activeCompound.name}</span>
                      <span className="text-slate-500 font-mono text-xs font-normal">
                        ({activeCompound.doseAmount} {activeCompound.doseUnit} {activeCompound.frequency.replace('_', ' ')})
                      </span>
                    </h4>
                  </div>

                  <div className="flex gap-2 text-xs font-mono">
                    <div className="bg-slate-900/45 border border-slate-800 px-3 py-1.5 rounded-xl text-left min-w-[85px]">
                      <span className="text-[8px] text-slate-500 block uppercase font-bold">Half-life</span>
                      <span className="text-[10px] text-slate-300 font-semibold truncate block mt-0.5">
                        {getLibraryItem(activeCompound)?.halfLife || 'Variable/N/A'}
                      </span>
                    </div>
                    <div className="bg-slate-900/45 border border-slate-800 px-3 py-1.5 rounded-xl text-left min-w-[85px]">
                      <span className="text-[8px] text-slate-500 block uppercase font-bold">Delivery Form</span>
                      <span className="text-[10px] text-slate-300 font-semibold uppercase mt-0.5 block truncate">
                        {activeCompound.steroidForm || activeCompound.type || 'Pill'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Diagnostic Phase grids */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5">
                  {/* Left core description */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold font-mono tracking-wider" style={{ color: activeCompound.color }}>
                        Active Sub-Phase Description
                      </span>
                      <h5 className="text-sm font-bold text-slate-200">
                        {getPhaseInfo(activeCompound, activeWeek).title}
                      </h5>
                      <p className="text-xs text-slate-400 leading-relaxed mt-1">
                        {getPhaseInfo(activeCompound, activeWeek).description}
                      </p>
                    </div>

                    <div className="space-y-1.5 bg-[#0f172a]/30 border border-[#1e293b]/40 p-3.5 rounded-xl">
                      <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase tracking-wider block">
                        Observed Cumulative Outcomes
                      </span>
                      <p className="text-xs text-slate-305 leading-relaxed">
                        {getPhaseInfo(activeCompound, activeWeek).results}
                      </p>
                    </div>
                  </div>

                  {/* Right side benefits & warnings checklist */}
                  <div className="lg:col-span-5 space-y-4 text-xs font-mono">
                    <div className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-xl space-y-2.5">
                      <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider block">
                        ✓ PHASE TARGET RESULTS
                      </span>
                      <ul className="space-y-2 text-slate-300">
                        {getPhaseInfo(activeCompound, activeWeek).benefits.map((benefit, i) => (
                          <li key={`benefit-point-${i}`} className="flex items-start gap-2 leading-relaxed">
                            <span className="text-emerald-400 shrink-0 font-bold">•</span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-rose-950/20 border border-rose-500/20 p-4 rounded-xl space-y-2.5">
                      <span className="text-[9px] text-rose-450 font-bold uppercase tracking-wider block">
                        ⚠ SYSTEMIC ADAPTATION WARNINGS
                      </span>
                      <ul className="space-y-2 text-slate-300">
                        {getPhaseInfo(activeCompound, activeWeek).warnings.map((warn, i) => (
                          <li key={`warn-point-${i}`} className="flex items-start gap-2 leading-relaxed">
                            <span className="text-rose-400 shrink-0 font-bold">•</span>
                            <span>{warn}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Dietary helper banner */}
                {getPhaseInfo(activeCompound, activeWeek).diet && (
                  <div className="mt-4 pt-3 border-t border-[#1e293b]/60 flex items-start gap-2 text-xs md:items-center">
                    <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <span className="font-bold text-slate-400">Dietary & Absorption Co-Factors: </span>
                      <span className="text-slate-300">{getPhaseInfo(activeCompound, activeWeek).diet}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
