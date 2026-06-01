import React, { useState, useRef, useEffect } from 'react';
import { Activity } from 'lucide-react';
import { safeLocalStorage } from '../lib/storage';
import { Compound, DailyMetric } from '../types';
import { triggerHaptic } from '../lib/haptics';
import { HealthProfile, AnalysisResult } from '../lib/bloodAnalyzerTypes';
import HealthDossierForm, { SYMPTOM_OPTIONS, CLINICAL_DIAGNOSES, GOAL_OPTIONS } from './HealthDossierForm';
import LabUploadSection from './LabUploadSection';
import AnalysisResultPanel from './AnalysisResultPanel';
import WellnessTracker from './WellnessTracker';

export type { HealthProfile, AnalyzedMarker, ActionableDirectives, AnalysisResult } from '../lib/bloodAnalyzerTypes';
export { SYMPTOM_OPTIONS, CLINICAL_DIAGNOSES, GOAL_OPTIONS };

interface BloodAnalyzerProps {
  compounds: Compound[];
  onAddCompound?: (compound: any) => void;
  hideShop?: boolean;
  onToggleHideShop?: (hide: boolean) => void;
  currentUserEmail?: string | null;
  onOpenAppearance?: () => void;
  metrics?: DailyMetric[];
  onSaveMetrics?: (metric: DailyMetric) => void;
  onDeleteMetric?: (date: string) => void;
  visibility?: { dossier: boolean; upload: boolean; wellness: boolean; };
}

const DEFAULT_PROFILE: HealthProfile = {
  age: 28, sex: 'Male', weightLb: 180, systolicBP: 120, diastolicBP: 80,
  restingHeartRate: 60, primaryGoal: 'muscle_growth', symptoms: [], sleepHours: 7.5, diagnoses: []
};

export default function BloodAnalyzer({
  compounds,
  metrics = [],
  onSaveMetrics,
  onDeleteMetric,
  visibility = { dossier: true, upload: true, wellness: true }
}: BloodAnalyzerProps) {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const [profile, setProfile] = useState<HealthProfile>(() => {
    try {
      const saved = safeLocalStorage.getItem('labrat_health_profile');
      if (saved) {
        const p = JSON.parse(saved);
        if (p.weightKg !== undefined && p.weightLb === undefined) p.weightLb = Math.round(p.weightKg * 2.20462);
        return {
          age: p.age ?? DEFAULT_PROFILE.age,
          sex: p.sex ?? DEFAULT_PROFILE.sex,
          weightLb: p.weightLb ?? DEFAULT_PROFILE.weightLb,
          systolicBP: p.systolicBP ?? DEFAULT_PROFILE.systolicBP,
          diastolicBP: p.diastolicBP ?? DEFAULT_PROFILE.diastolicBP,
          restingHeartRate: p.restingHeartRate ?? DEFAULT_PROFILE.restingHeartRate,
          primaryGoal: p.primaryGoal ?? DEFAULT_PROFILE.primaryGoal,
          symptoms: Array.isArray(p.symptoms) ? p.symptoms : [],
          sleepHours: p.sleepHours ?? DEFAULT_PROFILE.sleepHours,
          diagnoses: Array.isArray(p.diagnoses) ? p.diagnoses : []
        };
      }
    } catch (e) {
      console.error('Failed to parse local health profile', e);
    }
    return DEFAULT_PROFILE;
  });

  const updateProfile = (updates: Partial<HealthProfile>) => {
    setProfile(prev => {
      const next = { ...prev, ...updates };
      safeLocalStorage.setItem('labrat_health_profile', JSON.stringify(next));
      return next;
    });
  };

  const toggleSymptom = (id: string) => {
    triggerHaptic('light');
    setProfile(prev => {
      const symptoms = prev.symptoms.includes(id) ? prev.symptoms.filter(s => s !== id) : [...prev.symptoms, id];
      const next = { ...prev, symptoms };
      safeLocalStorage.setItem('labrat_health_profile', JSON.stringify(next));
      return next;
    });
  };

  const toggleDiagnosis = (id: string) => {
    triggerHaptic('light');
    setProfile(prev => {
      const current = prev.diagnoses || [];
      const diagnoses = current.includes(id) ? current.filter(d => d !== id) : [...current, id];
      const next = { ...prev, diagnoses };
      safeLocalStorage.setItem('labrat_health_profile', JSON.stringify(next));
      return next;
    });
  };

  useEffect(() => {
    if (!result) return;
    const timer = setTimeout(() => {
      const el = resultsRef.current || document.getElementById('blood-report-results-dashboard');
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      window.scrollTo({ top: rect.top + scrollTop - 40, behavior: 'smooth' });
      let parent = el.parentElement;
      while (parent) {
        const style = window.getComputedStyle(parent);
        if (parent.scrollHeight > parent.clientHeight && (style.overflowY === 'auto' || style.overflowY === 'scroll')) {
          const elOffset = rect.top - parent.getBoundingClientRect().top + parent.scrollTop;
          parent.scrollTo({ top: elOffset - 20, behavior: 'smooth' });
        }
        parent = parent.parentElement;
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [result]);

  return (
    <div className="space-y-6" id="blood-intelligence-section">
      <div className="bg-[#0f172a]/75 border border-[#1e293b]/70 p-5 rounded-3xl flex flex-col sm:flex-row items-center gap-4.5 text-center sm:text-left" id="analyzer-hero-card">
        <div className="p-3 bg-red-950/40 border border-red-500/25 rounded-2xl shrink-0">
          <Activity className="w-8 h-8 text-red-500" />
        </div>
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-red-400 bg-red-950/20 px-2.5 py-0.5 border border-red-500/15 rounded-lg inline-block mb-1.5 shadow-sm">
            Clinical Lab Auditor & Biomarker Engine
          </span>
          <h2 className="text-lg font-bold text-slate-100 font-sans tracking-tight">Clinical Lab Ingestion</h2>
          <p className="text-xs text-slate-400 leading-relaxed mt-1 max-w-3xl">
            Upload blood results or paste a transcript to run biological timeline evaluations. The AI Engine interprets hepatic transaminase loads, HPTA shutdown markers, lipids flex boundaries, and erythrocytosis signals to provide immediate advice on started support formulations, compound tapers, or early cycle stoppage.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {visibility.dossier && (
          <div className="col-span-1 lg:col-span-2 space-y-5" id="personal-dossier-panel">
            <HealthDossierForm
              profile={profile}
              onUpdate={updateProfile}
              onToggleSymptom={toggleSymptom}
              onToggleDiagnosis={toggleDiagnosis}
            />
          </div>
        )}
        {visibility.upload && (
          <LabUploadSection compounds={compounds} profile={profile} onResult={setResult} />
        )}
      </div>

      {result && <AnalysisResultPanel result={result} resultsRef={resultsRef as React.RefObject<HTMLDivElement>} />}

      {visibility.wellness && (
        <WellnessTracker metrics={metrics} onSaveMetrics={onSaveMetrics} onDeleteMetric={onDeleteMetric} />
      )}

      {/* Pre / Mid / Post Cycle Comparison */}
      {metrics.length >= 3 && compounds.length > 0 && (() => {
        const sorted = metrics.slice().sort((a, b) => a.date.localeCompare(b.date));
        const activeCycles = compounds.filter(c => !c.isCompleted && c.startDate);
        if (activeCycles.length === 0) return null;
        const earliestCycle = activeCycles.reduce((a, b) => a.startDate < b.startDate ? a : b);
        const cycleStart = new Date(earliestCycle.startDate + 'T00:00:00');
        const cycleEnd = new Date(cycleStart);
        cycleEnd.setDate(cycleStart.getDate() + earliestCycle.durationWeeks * 7);
        const cycleMid = new Date((cycleStart.getTime() + cycleEnd.getTime()) / 2);

        const pre = sorted.filter(m => new Date(m.date + 'T00:00:00') < cycleStart);
        const mid = sorted.filter(m => { const d = new Date(m.date + 'T00:00:00'); return d >= cycleStart && d < cycleMid; });
        const post = sorted.filter(m => new Date(m.date + 'T00:00:00') >= cycleMid);

        const avg = (arr: DailyMetric[], key: keyof DailyMetric): string => {
          const vals = arr.map(m => m[key]).filter((v): v is number => typeof v === 'number');
          if (vals.length === 0) return '—';
          return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
        };

        return (
          <div className="bg-[#0f172a]/70 border border-[#1e293b]/80 rounded-2xl p-5 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2 border-b border-[#1e293b]/60 pb-3 mb-4">
              <Activity className="w-4 h-4 text-red-400" />
              <h4 className="text-sm font-bold text-slate-200">Pre / Mid / Post Cycle Wellness Comparison</h4>
              <span className="ml-auto text-[10px] text-slate-500 font-mono">{earliestCycle.name.split(' ')[0]} cycle</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse min-w-[400px]">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="py-2 px-3 text-left text-[10px] font-mono text-slate-500 uppercase tracking-wider">Metric</th>
                    <th className="py-2 px-3 text-center text-[10px] font-mono text-slate-400 uppercase">Pre-Cycle ({pre.length} entries)</th>
                    <th className="py-2 px-3 text-center text-[10px] font-mono text-cyan-400 uppercase">Mid-Cycle ({mid.length} entries)</th>
                    <th className="py-2 px-3 text-center text-[10px] font-mono text-emerald-400 uppercase">Post-Cycle ({post.length} entries)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Weight (lbs)', key: 'weightLb' as const },
                    { label: 'Mood (1-5)', key: 'mood' as const },
                    { label: 'Energy (1-5)', key: 'fatigue' as const },
                  ].map(row => (
                    <tr key={row.key} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                      <td className="py-2 px-3 text-slate-300 font-semibold">{row.label}</td>
                      <td className="py-2 px-3 text-center text-slate-400 font-mono">{avg(pre, row.key)}</td>
                      <td className="py-2 px-3 text-center text-cyan-300 font-mono font-bold">{avg(mid, row.key)}</td>
                      <td className="py-2 px-3 text-center text-emerald-300 font-mono font-bold">{avg(post, row.key)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
