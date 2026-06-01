import React from 'react';
import { User, Heart } from 'lucide-react';
import { HealthProfile } from '../lib/bloodAnalyzerTypes';

export const SYMPTOM_OPTIONS = [
  { id: 'fatigue', label: 'Fatigue / Brain Fog' },
  { id: 'joint_aches', label: 'Joint & Tendon Aches' },
  { id: 'insomnia', label: 'Insomnia / Bad Sleep' },
  { id: 'water_retention', label: 'Water Retention' },
  { id: 'elevated_bp', label: 'Fluctuating BP' },
  { id: 'lethargy', label: 'Post-Workout Lethargy' },
  { id: 'low_libido', label: 'Suppressed Libido' },
  { id: 'acne_hairloss', label: 'Acne or Hair Shed' }
];

export const CLINICAL_DIAGNOSES = [
  { id: 'hypertension', label: 'Hypertension (High BP)', color: 'rose' },
  { id: 'diabetes', label: 'Insulin Resistance / T2D', color: 'cyan' },
  { id: 'fatty_liver', label: 'Fatty Liver (NAFLD)', color: 'amber' },
  { id: 'dyslipidemia', label: 'Dyslipidemia (High Lipids)', color: 'orange' },
  { id: 'kidney_strain', label: 'Kidney Strain / CKD', color: 'emerald' },
  { id: 'thyroid_hypo', label: 'Hypothyroidism', color: 'indigo' },
  { id: 'gout', label: 'Hyperuricemia / Gout', color: 'red' }
];

export const GOAL_OPTIONS = [
  { id: 'muscle_growth', label: 'Muscle Development' },
  { id: 'fat_loss', label: 'Fat Level Reductions' },
  { id: 'longevity', label: 'Cellular Longevity' },
  { id: 'injury_healing', label: 'Ligament & Joint Repair' },
  { id: 'cognitive_performance', label: 'ND Performance' },
  { id: 'general_health', label: 'Biomarker Optimization' }
];

interface HealthDossierFormProps {
  profile: HealthProfile;
  onUpdate: (updates: Partial<HealthProfile>) => void;
  onToggleSymptom: (id: string) => void;
  onToggleDiagnosis: (id: string) => void;
}

export default function HealthDossierForm({ profile, onUpdate, onToggleSymptom, onToggleDiagnosis }: HealthDossierFormProps) {
  return (
    <div className="bg-[#0f172a]/80 border border-[#1e293b]/85 rounded-3xl p-5 space-y-4 text-left">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <User className="w-4.5 h-4.5 text-cyan-400" />
        <span className="text-sm font-bold text-slate-200">My Health Dossier</span>
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed">
        Define your biometric parameters, resting vitals, and physical biomarkers. These settings persist locally and are processed with your blood markers to construct contextual advice.
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Age (Years)</label>
            <input
              type="number"
              value={profile.age}
              onChange={(e) => onUpdate({ age: parseInt(e.target.value) || 0 })}
              className="w-full bg-[#1e293b]/30 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/40"
              min="18" max="100"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Biological Sex</label>
            <select
              value={profile.sex}
              onChange={(e) => onUpdate({ sex: e.target.value as HealthProfile['sex'] })}
              className="w-full bg-[#1e293b]/30 border border-slate-800 rounded-xl py-2 px-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/40"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Weight (lbs)</label>
            <input
              type="number"
              value={profile.weightLb}
              onChange={(e) => onUpdate({ weightLb: parseFloat(e.target.value) || 0 })}
              className="w-full bg-[#1e293b]/30 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/40"
              min="50" max="500"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Daily Sleep (hrs)</label>
            <input
              type="number"
              step="0.5"
              value={profile.sleepHours}
              onChange={(e) => onUpdate({ sleepHours: parseFloat(e.target.value) || 0 })}
              className="w-full bg-[#1e293b]/30 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/40"
              min="2" max="14"
            />
          </div>
        </div>

        <div className="bg-slate-950/40 border border-slate-800/80 p-3 rounded-2xl space-y-2.5">
          <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-red-500" /> Cardiovascular Vitals
          </span>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-mono text-slate-400 block">BP (systolic/diastolic)</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={profile.systolicBP}
                  onChange={(e) => onUpdate({ systolicBP: parseInt(e.target.value) || 0 })}
                  placeholder="Sys"
                  className="w-full bg-[#1e293b]/20 border border-slate-800 rounded-lg py-1 px-1.5 text-xs text-slate-200 focus:outline-none text-center"
                  title="Systolic"
                />
                <span className="text-slate-600 text-xs">/</span>
                <input
                  type="number"
                  value={profile.diastolicBP}
                  onChange={(e) => onUpdate({ diastolicBP: parseInt(e.target.value) || 0 })}
                  placeholder="Dia"
                  className="w-full bg-[#1e293b]/20 border border-slate-800 rounded-lg py-1 px-1.5 text-xs text-slate-200 focus:outline-none text-center"
                  title="Diastolic"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-mono text-slate-400 block">Resting HR (bpm)</label>
              <input
                type="number"
                value={profile.restingHeartRate}
                onChange={(e) => onUpdate({ restingHeartRate: parseInt(e.target.value) || 0 })}
                className="w-full bg-[#1e293b]/20 border border-slate-800 rounded-lg py-1 px-1.5 text-xs text-slate-200 focus:outline-none text-center"
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Bio-Optimization Focus</label>
          <select
            value={profile.primaryGoal}
            onChange={(e) => onUpdate({ primaryGoal: e.target.value as HealthProfile['primaryGoal'] })}
            className="w-full bg-[#1e293b]/30 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/40"
          >
            {GOAL_OPTIONS.map(opt => (
              <option key={opt.id} value={opt.id}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Subjective Symptoms</label>
            {profile.symptoms.length > 0 && (
              <button onClick={() => onUpdate({ symptoms: [] })} className="text-[9px] uppercase font-mono font-bold text-slate-500 hover:text-slate-300">
                Clear All
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5" id="symptoms-badges-container">
            {SYMPTOM_OPTIONS.map(sym => {
              const isActive = profile.symptoms.includes(sym.id);
              return (
                <button
                  key={sym.id}
                  type="button"
                  onClick={() => onToggleSymptom(sym.id)}
                  className={`text-[10px] px-2 py-0.5 rounded-lg border font-medium transition cursor-pointer select-none ${
                    isActive
                      ? 'bg-amber-500/10 border-amber-500/45 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.1)]'
                      : 'bg-slate-950/30 border-slate-800/80 text-slate-450 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  {sym.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2 pt-3.5 border-t border-slate-800/70 mt-1">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Prior Clinical Diagnoses</label>
            {(profile.diagnoses || []).length > 0 && (
              <button onClick={() => onUpdate({ diagnoses: [] })} className="text-[9px] uppercase font-mono font-bold text-slate-500 hover:text-slate-300">
                Clear All
              </button>
            )}
          </div>
          <p className="text-[10.5px] text-slate-500 leading-normal">
            Toggle diagnosed chronic metabolic, cardiovascular, renal or hepatic conditions. The AI core crosses these to adjust cycle and ancillary advice.
          </p>
          <div className="flex flex-wrap gap-1.5" id="diagnoses-badges-container">
            {CLINICAL_DIAGNOSES.map(diag => {
              const isActive = (profile.diagnoses || []).includes(diag.id);
              let activeStyles = 'bg-red-500/10 border-red-500/45 text-red-300 shadow-[0_0_8px_rgba(239,68,68,0.1)]';
              if (diag.color === 'rose') activeStyles = 'bg-rose-500/10 border-rose-500/45 text-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.1)]';
              if (diag.color === 'cyan') activeStyles = 'bg-cyan-500/10 border-cyan-500/45 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.1)]';
              if (diag.color === 'amber') activeStyles = 'bg-amber-500/10 border-amber-500/45 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.1)]';
              if (diag.color === 'orange') activeStyles = 'bg-orange-500/10 border-orange-500/45 text-orange-300 shadow-[0_0_8px_rgba(249,115,22,0.1)]';
              if (diag.color === 'emerald') activeStyles = 'bg-emerald-500/10 border-emerald-500/45 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.1)]';
              if (diag.color === 'indigo') activeStyles = 'bg-indigo-500/10 border-indigo-500/45 text-indigo-300 shadow-[0_0_8px_rgba(99,102,241,0.1)]';
              return (
                <button
                  key={diag.id}
                  type="button"
                  onClick={() => onToggleDiagnosis(diag.id)}
                  className={`text-[10px] px-2 py-0.5 rounded-lg border font-medium transition cursor-pointer select-none ${
                    isActive ? activeStyles : 'bg-slate-950/30 border-slate-800/80 text-slate-450 hover:border-slate-700 hover:text-slate-300'
                  }`}
                >
                  {diag.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reference Range Context */}
      <div className="space-y-2">
        <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Reference Range Context</label>
        <p className="text-[10.5px] text-slate-500 leading-normal">Sets hormone reference ranges used for interpretation. TRT users have naturally higher testosterone targets.</p>
        <div className="grid grid-cols-3 gap-2">
          {([
            { key: 'natty', label: 'Natural / Natty', desc: 'Standard ranges' },
            { key: 'trt', label: 'TRT Protocol', desc: 'Testosterone therapy' },
            { key: 'enhanced', label: 'Enhanced', desc: 'Full blast ranges' },
          ] as const).map(opt => (
            <button
              key={opt.key}
              type="button"
              onClick={() => onUpdate({ referenceContext: opt.key })}
              className={`px-2 py-2 rounded-xl border text-center transition cursor-pointer ${
                profile.referenceContext === opt.key
                  ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-200'
                  : 'bg-slate-950/30 border-slate-800/80 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="text-[10px] font-bold">{opt.label}</div>
              <div className="text-[9px] text-slate-500 mt-0.5">{opt.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
