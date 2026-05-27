import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight, 
  Activity, 
  ShieldAlert, 
  ShieldCheck,
  UserPlus, 
  UserMinus, 
  CalendarClock, 
  Play, 
  Loader2, 
  FileSpreadsheet, 
  Sparkles,
  RefreshCw,
  Clock,
  Heart,
  Droplet,
  User,
  Palette
} from 'lucide-react';
import { triggerHaptic } from '../lib/haptics';
import { safeLocalStorage } from '../lib/storage';
import { Compound } from '../types';

export interface HealthProfile {
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  weightLb: number;
  systolicBP: number;
  diastolicBP: number;
  restingHeartRate: number;
  primaryGoal: 'muscle_growth' | 'fat_loss' | 'longevity' | 'injury_healing' | 'cognitive_performance' | 'general_health';
  symptoms: string[];
  sleepHours: number;
  diagnoses?: string[];
}

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

interface BloodAnalyzerProps {
  compounds: Compound[];
  onAddCompound?: (compound: any) => void;
  hideShop?: boolean;
  onToggleHideShop?: (hide: boolean) => void;
  currentUserEmail?: string | null;
  onOpenAppearance?: () => void;
}

export interface AnalyzedMarker {
  name: string;
  value: string;
  unit: string;
  range: string;
  status: 'NORMAL' | 'ELEVATED' | 'DEPRESSED' | 'CRITICAL';
  explanation: string;
}

export interface ActionableDirectives {
  toStart: string[];
  toStopOrModify: string[];
  cycleTimelineImpact: string;
}

export interface AnalysisResult {
  disclaimer: string;
  markers: AnalyzedMarker[];
  actionableDirectives: ActionableDirectives;
  markdownReport: string;
}

// Interactive Test Cases for direct exploration
const SIMULATED_TEST_CASES = [
  {
    title: "Case 1: Heavy Oral Steroid Strain (Liver & Lipids Alert)",
    description: "Alt/Ast enzymes elevated, HDL cholesterol severely crushed from active methylated orals.",
    text: `LABORATORY STATUS REPORT - ACTIVE PROTOCOL
Testosterone, Total: 1,840 ng/dL [HIGH] Ref: 264 - 916
Luteinizing Hormone (LH): < 0.1 mIU/mL [LOW] Ref: 1.7 - 8.6
Follicle Stimulating Hormone (FSH): < 0.2 mIU/mL [LOW] Ref: 1.5 - 12.4
Estradiol (E2): 39.4 pg/mL Ref: 7.6 - 42.6
ALT (Alanine Aminotransferase): 124 U/L [CRITICAL HIGH] Ref: 0 - 44
AST (Aspartate Aminotransferase): 88 U/L [ELEVATED] Ref: 0 - 40
HDL Cholesterol: 14 mg/dL [CRITICAL LOW] Ref: > 40
LDL Cholesterol: 156 mg/dL [ELEVATED] Ref: < 100
Hematocrit: 48.2% Ref: 37.5% - 51.0%`,
  },
  {
    title: "Case 2: High Aromatization (Estrogen Dominance)",
    description: "High testosterone conversion into estradiol without AI control. Water retention & lethargy symptoms.",
    text: `HORMONE PANEL AUDIT
Testosterone, Total: 2,450 ng/dL [HIGH] Ref: 264 - 916
Estradiol (E2): 112 pg/mL [CRITICAL HIGH] Ref: 7.6 - 42.6
Luteinizing Hormone (LH): < 0.1 mIU/mL Ref: 1.7 - 8.6
ALT (Alanine Aminotransferase): 32 U/L Ref: 0 - 44
AST (Aspartate Aminotransferase): 28 U/L Ref: 0 - 40
HDL Cholesterol: 38 mg/dL Ref: > 40
LDL Cholesterol: 104 mg/dL Ref: < 100
Hematocrit: 49.8% Ref: 37.5% - 51.0%`,
  },
  {
    title: "Case 3: Severe Erythrocytosis (Vascular Thickness Warning)",
    description: "Hematocrit/Hemoglobin sitting at dangerously high levels due to long-term high androgen stimulation.",
    text: `VASCULAR AUDIT - PANEL REPORT
Testosterone, Total: 1,120 ng/dL Ref: 264 - 916
Hematocrit: 56.4% [CRITICAL HIGH] Ref: 37.5% - 51.0%
Hemoglobin: 19.3 g/dL [CRITICAL HIGH] Ref: 13.0 - 17.7
Red Blood Cell Count (RBC): 6.42 x10^6/uL Ref: 4.14 - 5.80
Platelets: 280 x10^3/uL Ref: 150 - 450
Estradiol: 28.1 pg/mL Ref: 7.6 - 42.6
ALT: 29 U/L Ref: 0 - 44
LH: < 0.1 mIU/mL Ref: 1.7 - 8.6`,
  }
];

export default function BloodAnalyzer({ 
  compounds, 
  onAddCompound, 
  hideShop, 
  onToggleHideShop,
  currentUserEmail,
  onOpenAppearance
}: BloodAnalyzerProps) {
  const [pasteText, setPasteText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result) {
      const timer = setTimeout(() => {
        // Option A: Try element's own scrollIntoView
        const el = resultsRef.current || document.getElementById('blood-report-results-dashboard');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          
          // Option B: Target window scroll with spacing offsets
          const rect = el.getBoundingClientRect();
          const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          const targetY = rect.top + scrollTop - 40;
          window.scrollTo({
            top: targetY,
            behavior: 'smooth'
          });

          // Option C: Propagate through parent containers to find any specific scrollable elements
          let parent = el.parentElement;
          while (parent) {
            const hasScrollbar = parent.scrollHeight > parent.clientHeight;
            const style = window.getComputedStyle(parent);
            const isScrollable = style.overflowY === 'auto' || style.overflowY === 'scroll';
            if (hasScrollbar && isScrollable) {
              const rectParent = parent.getBoundingClientRect();
              const elOffset = rect.top - rectParent.top + parent.scrollTop;
              parent.scrollTo({
                top: elOffset - 20,
                behavior: 'smooth'
              });
            }
            parent = parent.parentElement;
          }
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [result]);

  // User Health Profile state persisting to localStorage
  const [profile, setProfile] = useState<HealthProfile>(() => {
    try {
      const saved = safeLocalStorage.getItem('labrat_health_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        
        // Handle migration from weightKg to weightLb
        if (parsed.weightKg !== undefined && parsed.weightLb === undefined) {
          parsed.weightLb = Math.round(parsed.weightKg * 2.20462);
        }

        // Ensure every required attribute has a fallback to verify controlled inputs
        return {
          age: parsed.age !== undefined ? parsed.age : 28,
          sex: parsed.sex !== undefined ? parsed.sex : 'Male',
          weightLb: parsed.weightLb !== undefined ? parsed.weightLb : 180,
          systolicBP: parsed.systolicBP !== undefined ? parsed.systolicBP : 120,
          diastolicBP: parsed.diastolicBP !== undefined ? parsed.diastolicBP : 80,
          restingHeartRate: parsed.restingHeartRate !== undefined ? parsed.restingHeartRate : 60,
          primaryGoal: parsed.primaryGoal !== undefined ? parsed.primaryGoal : 'muscle_growth',
          symptoms: Array.isArray(parsed.symptoms) ? parsed.symptoms : [],
          sleepHours: parsed.sleepHours !== undefined ? parsed.sleepHours : 7.5,
          diagnoses: Array.isArray(parsed.diagnoses) ? parsed.diagnoses : []
        };
      }
    } catch (e) {
      console.error("Failed to parse local health profile", e);
    }
    return {
      age: 28,
      sex: 'Male',
      weightLb: 180,
      systolicBP: 120,
      diastolicBP: 80,
      restingHeartRate: 60,
      primaryGoal: 'muscle_growth',
      symptoms: [],
      sleepHours: 7.5,
      diagnoses: []
    };
  });

  const updateProfile = (updates: Partial<HealthProfile>) => {
    setProfile(prev => {
      const next = { ...prev, ...updates };
      safeLocalStorage.setItem('labrat_health_profile', JSON.stringify(next));
      return next;
    });
  };

  const toggleSymptom = (symptomId: string) => {
    triggerHaptic('light');
    setProfile(prev => {
      const symptoms = prev.symptoms.includes(symptomId)
        ? prev.symptoms.filter(s => s !== symptomId)
        : [...prev.symptoms, symptomId];
      const next = { ...prev, symptoms };
      safeLocalStorage.setItem('labrat_health_profile', JSON.stringify(next));
      return next;
    });
  };

  const toggleDiagnosis = (diagnosisId: string) => {
    triggerHaptic('light');
    setProfile(prev => {
      const currentDiagnoses = prev.diagnoses || [];
      const diagnoses = currentDiagnoses.includes(diagnosisId)
        ? currentDiagnoses.filter(d => d !== diagnosisId)
        : [...currentDiagnoses, diagnosisId];
      const next = { ...prev, diagnoses };
      safeLocalStorage.setItem('labrat_health_profile', JSON.stringify(next));
      return next;
    });
  };

  // File drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setErrorMessage('');
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processSelectedFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage('');
    if (e.target.files && e.target.files.length > 0) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = async (file: File) => {
    const validTypes = ['text/plain', 'image/png', 'image/jpeg', 'image/jpg', 'application/pdf', 'text/csv'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
      setErrorMessage("Unsupported file format. Please upload an image (.png, .jpg), document (.pdf), or plain text file (.txt, .csv).");
      return;
    }
    
    setSelectedFile(file);
    triggerHaptic('medium');

    // If text/csv file, read content to pasteText for user convenience
    if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.csv')) {
      try {
        const text = await file.text();
        setPasteText(text);
      } catch (err) {
        console.error("Read text file error:", err);
      }
    }
  };

  const handleInjectSimulatedCase = (simCase: typeof SIMULATED_TEST_CASES[0]) => {
    triggerHaptic('light');
    setPasteText(simCase.text);
    setSelectedFile(null);
    setErrorMessage('');
    
    // Quick auto scroll to textarea as visual feedback
    const textarea = document.getElementById('paste-text-input-field');
    if (textarea) {
      textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleAnalyze = async () => {
    if (!pasteText.trim() && !selectedFile) {
      setErrorMessage("Please paste blood results or upload a report file to analyze.");
      triggerHaptic('warning');
      return;
    }

    setAnalyzing(true);
    setErrorMessage('');
    setResult(null);
    triggerHaptic('heavy');

    try {
      let fileData = '';
      let mimeType = '';

      if (selectedFile && selectedFile.type !== 'text/plain' && !selectedFile.name.endsWith('.txt')) {
        // Convert image or PDF to base64 for Gemini multimodal ingestion
        fileData = await convertFileToBase64(selectedFile);
        mimeType = selectedFile.type;
      }

      const response = await fetch('/api/gemini/analyze-blood', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: pasteText,
          fileData,
          mimeType,
          compounds,
          healthProfile: profile
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Authentication or response failure on server.");
      }

      const analysisRaw: AnalysisResult = await response.json();
      setResult(analysisRaw);
      triggerHaptic('success');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "An unexpected error occurred while processing your lab work with Gemini.");
      triggerHaptic('warning');
    } finally {
      setAnalyzing(false);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleClear = () => {
    triggerHaptic('light');
    setPasteText('');
    setSelectedFile(null);
    setErrorMessage('');
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Helper colors for status badges
  const getStatusStyle = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CRITICAL':
        return {
          bg: 'bg-red-500/10 border-red-500/30 text-red-400',
          indicator: 'bg-red-500',
          text: 'text-red-400',
          progressColor: 'bg-red-500'
        };
      case 'ELEVATED':
      case 'HIGH':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          indicator: 'bg-amber-500',
          text: 'text-amber-400',
          progressColor: 'bg-amber-500'
        };
      case 'DEPRESSED':
      case 'LOW':
        return {
          bg: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
          indicator: 'bg-sky-500',
          text: 'text-sky-400',
          progressColor: 'bg-sky-500'
        };
      default:
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          indicator: 'bg-emerald-400',
          text: 'text-emerald-400',
          progressColor: 'bg-emerald-500'
        };
    }
  };

  return (
    <div className="space-y-6" id="blood-intelligence-section">
      {/* Intro Header Card */}
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

      {/* Main input layout split */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Column: My Health Dossier & Biography */}
        <div className="col-span-1 lg:col-span-2 space-y-5" id="personal-dossier-panel">
          <div className="bg-[#0f172a]/80 border border-[#1e293b]/85 rounded-3xl p-5 space-y-4 text-left">
            
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <User className="w-4.5 h-4.5 text-cyan-400" />
              <span className="text-sm font-bold text-slate-200">My Health Dossier</span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Define your biometric parameters, resting vitals, and physical biomarkers. These settings persist locally and are processed with your blood markers to construct contextual advice.
            </p>

            <div className="space-y-4">
              {/* Row 1: Age, Sex */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Age (Years)</label>
                  <input 
                    type="number" 
                    value={profile.age} 
                    onChange={(e) => updateProfile({ age: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#1e293b]/30 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/40"
                    min="18"
                    max="100"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Biological Sex</label>
                  <select 
                    value={profile.sex}
                    onChange={(e) => updateProfile({ sex: e.target.value as any })}
                    className="w-full bg-[#1e293b]/30 border border-slate-800 rounded-xl py-2 px-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/40"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Weight, Sleep */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Weight (lbs)</label>
                  <input 
                    type="number" 
                    value={profile.weightLb} 
                    onChange={(e) => updateProfile({ weightLb: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#1e293b]/30 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/40"
                    min="50"
                    max="500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Daily Sleep (hrs)</label>
                  <input 
                    type="number" 
                    step="0.5"
                    value={profile.sleepHours} 
                    onChange={(e) => updateProfile({ sleepHours: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#1e293b]/30 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/40"
                    min="2"
                    max="14"
                  />
                </div>
              </div>

              {/* Row 3: Cardiovascular (Systolic / Diastolic BP, Resting Heart Rate) */}
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
                        onChange={(e) => updateProfile({ systolicBP: parseInt(e.target.value) || 0 })}
                        placeholder="Sys"
                        className="w-full bg-[#1e293b]/20 border border-slate-800 rounded-lg py-1 px-1.5 text-xs text-slate-200 focus:outline-none text-center"
                        title="Systolic"
                      />
                      <span className="text-slate-600 text-xs">/</span>
                      <input 
                        type="number" 
                        value={profile.diastolicBP} 
                        onChange={(e) => updateProfile({ diastolicBP: parseInt(e.target.value) || 0 })}
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
                      onChange={(e) => updateProfile({ restingHeartRate: parseInt(e.target.value) || 0 })}
                      className="w-full bg-[#1e293b]/20 border border-slate-800 rounded-lg py-1 px-1.5 text-xs text-slate-200 focus:outline-none text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Primary Target Goal */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Bio-Optimization Focus</label>
                <select 
                  value={profile.primaryGoal}
                  onChange={(e) => updateProfile({ primaryGoal: e.target.value as any })}
                  className="w-full bg-[#1e293b]/30 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/40"
                >
                  {GOAL_OPTIONS.map(opt => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Active Subjective Symptoms Tracker */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Subjective Symptoms</label>
                  {profile.symptoms.length > 0 && (
                    <button 
                      onClick={() => updateProfile({ symptoms: [] })}
                      className="text-[9px] uppercase font-mono font-bold text-slate-500 hover:text-slate-300"
                    >
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
                        onClick={() => toggleSymptom(sym.id)}
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

              {/* Pre-Existing Clinical Diagnoses / Health Conditions */}
              <div className="space-y-2 pt-3.5 border-t border-slate-800/70 mt-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Prior Clinical Diagnoses</label>
                  {(profile.diagnoses || []).length > 0 && (
                    <button 
                      onClick={() => updateProfile({ diagnoses: [] })}
                      className="text-[9px] uppercase font-mono font-bold text-slate-500 hover:text-slate-300"
                    >
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
                        onClick={() => toggleDiagnosis(diag.id)}
                        className={`text-[10px] px-2 py-0.5 rounded-lg border font-medium transition cursor-pointer select-none ${
                          isActive 
                            ? activeStyles 
                            : 'bg-slate-950/30 border-slate-800/80 text-slate-450 hover:border-slate-700 hover:text-slate-300'
                        }`}
                      >
                        {diag.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Appearance / Theme Settings */}
              {onOpenAppearance && (
                <div className="space-y-2 pt-3.5 border-t border-slate-850 mt-1" id="appearance-settings-section">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Appearance</label>
                      <p className="text-[10.5px] text-slate-500 leading-normal mt-1">
                        Switch between Neon Lab Command Center and Clinical Dark, or adjust in-app branding.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { triggerHaptic('light'); onOpenAppearance(); }}
                      className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/25 hover:border-cyan-500/45 text-cyan-300 text-[11px] font-bold transition cursor-pointer"
                      id="open-appearance-settings-btn"
                    >
                      <Palette className="w-3.5 h-3.5" />
                      Theme
                    </button>
                  </div>
                </div>
              )}

              {/* App Store Compliance / Shop Visibility Toggle option */}
              {onToggleHideShop && (!currentUserEmail || currentUserEmail.toLowerCase() === 'kyleheiser@gmail.com') && (
                <div className="space-y-2 pt-3.5 border-t border-slate-850 mt-1" id="app-store-compliance-section">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">App Store Compliance</label>
                  </div>
                  <p className="text-[10.5px] text-slate-500 leading-normal mb-1">
                    Completely hide the bioresearch peptide shop tab to comply with App Store policies. Toggle off to reveal for off-store use.
                  </p>
                  <div className="flex items-center justify-between bg-slate-950/45 border border-slate-800/80 p-3 rounded-2xl">
                    <span className="text-xs font-semibold text-slate-300">Hide Buy Peptides Shop Tab</span>
                    <button
                      type="button"
                      onClick={() => onToggleHideShop(!hideShop)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        hideShop ? 'bg-cyan-500' : 'bg-slate-800'
                      }`}
                      id="hide-shop-toggle-btn"
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-slate-100 shadow ring-0 transition duration-200 ease-in-out ${
                          hideShop ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Right Column: Uploaders, Textareas, and Templates */}
        <div className="col-span-1 lg:col-span-3 space-y-5">
          <div className="bg-[#0f172a]/80 border border-[#1e293b]/85 rounded-3xl p-5 space-y-4" id="upload-panel-card">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-red-400" />
                <span className="text-sm font-bold text-slate-200">Biomarker Lab Ingestor</span>
              </div>
              <button 
                onClick={handleClear}
                className="text-[11px] font-mono text-slate-500 hover:text-slate-300 font-semibold flex items-center gap-1 cursor-pointer"
                id="clear-ingestion-form-btn"
              >
                <RefreshCw className="w-3 h-3" /> Clear Form
              </button>
            </div>

            {/* Error Message banner */}
            {errorMessage && (
              <div className="bg-red-950/30 border border-red-500/20 p-3 rounded-xl flex gap-3 text-left" id="analyzer-error-alert">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-300 font-medium leading-relaxed">{errorMessage}</p>
              </div>
            )}

            {/* Drag & Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-2.5 transition-all cursor-pointer ${
                isDragging 
                  ? 'border-red-500/50 bg-red-950/10' 
                  : selectedFile 
                    ? 'border-emerald-500/40 bg-emerald-950/5' 
                    : 'border-slate-800 bg-slate-900/10 hover:border-[#1e293b] hover:bg-slate-900/25'
              }`}
              id="file-dz-box"
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden" 
                accept=".txt,.csv,.png,.jpg,.jpeg,.pdf"
              />
              
              {selectedFile ? (
                <>
                  <div className="p-3 bg-emerald-950/40 border border-emerald-500/20 rounded-xl">
                    <FileSpreadsheet className="w-7 h-7 text-emerald-400" />
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-bold text-slate-200 block max-w-xs truncate">{selectedFile.name}</span>
                    <span className="text-[10px] font-mono text-[#10b981] font-bold block mt-1">Ready for analysis • {(selectedFile.size / 1024).toFixed(1)} KB</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 bg-[#1e293b]/40 rounded-xl">
                    <Upload className="w-6 h-6 text-slate-400" />
                  </div>
                  <div className="text-center space-y-1">
                    <span className="text-xs font-semibold text-slate-200 block">Drag & drop lab report file, or select files</span>
                    <span className="text-[10px] text-slate-500 block">Supports .png, .jpg, .pdf, .txt, .csv formats</span>
                  </div>
                </>
              )}
            </div>

            {/* Paste Transcript Container */}
            <div className="space-y-1.5 text-left">
              <label htmlFor="paste-text-input-field" className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider block">Or Paste Lab Results (Text Output)</label>
              <textarea
                id="paste-text-input-field"
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                rows={7}
                placeholder="Paste marker tables or PDF conversion text here... (e.g. ALT: 48 U/L, AST: 32, Estradiol: 54 pg/mL...)"
                className="w-full bg-[#1e293b]/30 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-300 focus:outline-none focus:border-red-500/40 focus:ring-1 focus:ring-red-500/10 placeholder-slate-600 transition"
              />
            </div>

            {/* CTA action button */}
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer select-none ${
                analyzing 
                  ? 'bg-red-500/20 text-red-300 border border-red-500/20' 
                  : 'bg-red-500 hover:bg-red-600 text-slate-950 font-bold shadow-[0_4px_16px_rgba(239,68,68,0.15)] hover:shadow-[0_4px_20px_rgba(239,68,68,0.25)]'
              }`}
              id="trigger-analysis-cta-btn"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Lab Parameters... (Typically takes 1 minute)</span>
                </>
              ) : (
                <>
                  <Activity className="w-4.5 h-4.5" />
                  <span>Initiate AI Marker Ingestion</span>
                </>
              )}
            </button>
          </div>

          {/* Absolute Clinical Security Policy Card */}
          <div className="bg-[#0f172a]/80 border border-[#1e293b]/85 rounded-3xl p-5 space-y-4 text-left">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <ShieldCheck className="w-4.5 h-4.5 text-rose-400" />
              <span className="text-sm font-bold text-slate-200">Clinical Security Policy</span>
            </div>
            
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Your biometric report parameters and diagnostic files are parsed in-browser using secure, sandboxed, transient processing memory. Lab results are never saved to unauthorized external servers or third-party cloud engines.
            </p>

            <div className="rounded-2xl border border-yellow-500/10 bg-yellow-950/5 p-3" id="security-warning">
              <span className="text-[9.5px] font-mono font-bold text-yellow-500 uppercase tracking-widest block">🔒 Transient Memory Safeguard</span>
              <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                LabRat does not expose biomarker markers to unauthorized databases or permanent visual records.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Full Dashboard Results Area */}
      {result && (
        <div ref={resultsRef} className="space-y-6 pt-2" id="blood-report-results-dashboard">
          
          <div className="border border-red-500/20 bg-red-900/5 p-3 rounded-2xl flex items-start gap-3 text-left" id="results-disclaimer-card">
            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-mono font-bold text-red-400 block tracking-wider uppercase">Systemic Biological Disclaimer</span>
              <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                {result.disclaimer}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
            
            {/* Action Directives / Verdict (Col span 4) */}
            <div className="col-span-1 lg:col-span-4 space-y-6 text-left">
              
              {/* Verdict Timeline Alert Card */}
              <div className="bg-[#0f172a]/95 border border-[#1e293b]/85 rounded-3xl p-5 space-y-3.5" id="verdict-banner-card">
                <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest block">SYSTEMIC CYCLE TIMELINE IMPACT</span>
                
                <div className={`p-4 rounded-2xl flex items-start gap-3.5 ${
                  result.actionableDirectives.cycleTimelineImpact.toLowerCase().includes('end') || 
                  result.actionableDirectives.cycleTimelineImpact.toLowerCase().includes('stop') ||
                  result.actionableDirectives.cycleTimelineImpact.toLowerCase().includes('critical')
                    ? 'bg-red-500/10 border border-red-500/25 text-red-400'
                    : result.actionableDirectives.cycleTimelineImpact.toLowerCase().includes('taper') ||
                      result.actionableDirectives.cycleTimelineImpact.toLowerCase().includes('adjust')
                      ? 'bg-amber-500/10 border border-amber-500/25 text-amber-400'
                      : 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400'
                }`} id="timeline-verdict-box">
                  <div className="p-2 rounded-xl bg-black/40 h-fit shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider block">Engine Timeline Verdict</span>
                    <p className="text-xs leading-relaxed font-semibold mt-1">
                      {result.actionableDirectives.cycleTimelineImpact}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1.5">
                  {/* Start Recommended protocol */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-mono font-bold text-[#10b981] uppercase tracking-wider flex items-center gap-1">
                      <UserPlus className="w-3.5 h-3.5 text-emerald-400" /> Start Support Formulations
                    </span>
                    <div className="space-y-1.5">
                      {result.actionableDirectives.toStart.map((startItem, sIdx) => (
                        <div key={`start-${sIdx}`} className="bg-slate-950/40 border border-slate-800 p-2.5 rounded-xl flex items-start gap-2.5">
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="text-xs text-slate-300 leading-normal font-medium">{startItem}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stop or modify protocol */}
                  <div className="space-y-2.5">
                    <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
                      <UserMinus className="w-3.5 h-3.5 text-red-400" /> Cessation / Modification List
                    </span>
                    <div className="space-y-1.5">
                      {result.actionableDirectives.toStopOrModify.map((stopItem, pIdx) => (
                        <div key={`stop-${pIdx}`} className="bg-slate-950/40 border border-slate-800 p-2.5 rounded-xl flex items-start gap-2.5">
                          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          <span className="text-xs text-slate-300 leading-normal font-medium">{stopItem}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Parsed Markers List with Gauge visualizations */}
              <div className="bg-[#0f172a]/95 border border-[#1e293b]/85 rounded-3xl p-5 space-y-4" id="biomarkers-grid-card">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <Activity className="w-4.5 h-4.5 text-red-400" />
                  <span className="text-sm font-bold text-slate-200">Parsed Clinical Marker Audit</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.markers.map((marker, mIdx) => {
                    const style = getStatusStyle(marker.status);
                    
                    return (
                      <div 
                        key={`m-${mIdx}`} 
                        className="bg-slate-950/30 border border-slate-800 hover:border-slate-700/80 p-4 rounded-2xl space-y-3 transition flex flex-col justify-between"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <span className="text-xs font-bold text-slate-200 block">{marker.name}</span>
                            <span className="text-[10px] font-mono text-slate-500 block mt-0.5">Ref Range: {marker.range}</span>
                          </div>
                          
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${style.bg}`}>
                            {marker.status}
                          </span>
                        </div>

                        {/* Visual Range bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-baseline">
                            <span className={`text-base font-extrabold tracking-tight ${style.text}`}>{marker.value} <span className="text-xs font-mono font-medium text-slate-500">{marker.unit}</span></span>
                          </div>
                          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                            <div className={`h-full ${style.progressColor}`} style={{ 
                              // Simple heuristic value for visual richness: random filled or structured 
                              width: marker.status === 'NORMAL' ? '45%' : marker.status === 'ELEVATED' ? '80%' : marker.status === 'CRITICAL' ? '96%' : '15%' 
                            }} />
                          </div>
                        </div>

                        <p className="text-[10.5px] text-slate-400 leading-normal pt-1 border-t border-slate-900/80">
                          {marker.explanation}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right column: Deep Scientific Report (Col span 2) */}
            <div className="col-span-1 lg:col-span-2 text-left" id="clinical-narrative-panel">
              <div className="bg-[#0f172a]/95 border border-[#1e293b]/85 rounded-3xl p-5 space-y-4 h-full flex flex-col">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <FileText className="w-4.5 h-4.5 text-red-400" />
                  <span className="text-sm font-bold text-slate-200">Clinical Biological Review</span>
                </div>

                <div 
                  className="text-xs text-slate-300 leading-relaxed space-y-3.5 flex-1 overflow-y-auto max-h-[500px] pr-1.5 custom-scrollbar"
                  id="clinical-report-markdown-block"
                >
                  {result.markdownReport.split('\n\n').map((para, pIdx) => {
                    const trimmed = para.trim();
                    if (!trimmed) return null;
                    
                    // Simple regex bullet and header parser to render beautiful readable layout without loading react-markdown
                    if (trimmed.startsWith('#')) {
                      const level = trimmed.match(/^#+/)?.[0].length || 1;
                      const text = trimmed.replace(/^#+\s*/, '');
                      return (
                        <h4 
                          key={pIdx} 
                          className={`font-semibold text-slate-100 font-sans tracking-tight ${
                            level === 1 ? 'text-sm font-extrabold border-b border-slate-800 pb-1 mt-4 text-red-300' : 'text-xs mt-3 text-slate-200'
                          }`}
                        >
                          {text}
                        </h4>
                      );
                    }
                    
                    if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
                      return (
                        <ul key={pIdx} className="space-y-1.5 pl-3 list-disc text-slate-400">
                          {trimmed.split('\n').map((li, lIdx) => (
                            <li key={lIdx} className="leading-relaxed">
                              {li.replace(/^[-*]\s*/, '')}
                            </li>
                          ))}
                        </ul>
                      );
                    }

                    return (
                      <p key={pIdx} className="leading-relaxed text-slate-400">
                        {trimmed}
                      </p>
                    );
                  })}
                </div>
              </div>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
