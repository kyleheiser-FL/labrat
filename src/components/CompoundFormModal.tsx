import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Save, Sparkles, CheckCircle, History, ArrowLeftRight } from 'lucide-react';
import { Compound, LibraryItem } from '../types';
import { triggerHaptic } from '../lib/haptics';
import { PEPTIDE_LIBRARY } from '../data/peptides';
import ReconstitutionCalculator from './ReconstitutionCalculator';

const PRESET_COLORS = ['#06b6d4', '#10b981', '#6366f1', '#f59e0b', '#ec4899', '#f43f5e', '#a855f7', '#84cc16'];

interface CompoundFormModalProps {
  open: boolean;
  onClose: () => void;
  editingCompound: Compound | null;
  prefill?: Partial<Compound>;
  onAdd: (compound: Compound) => void;
  onUpdate: (compound: Compound) => void;
  activeFromLibrary?: LibraryItem | null;
  clearActiveFromLibrary?: () => void;
  onOpenRetroLog?: (compoundId: string) => void;
  onNavigateToTab?: (tab: 'dashboard' | 'planner' | 'blood' | 'library' | 'shop' | 'settings') => void;
}

const DEFAULT_FORM = {
  name: '', nameFromLibrary: false, nameError: '',
  type: 'peptide' as 'peptide' | 'compound' | 'supplement' | 'steroid',
  vialSizeMg: '', bacWaterMl: '',
  doseAmount: '1', doseUnit: 'mg' as 'mcg' | 'mg' | 'IU' | 'ml',
  frequency: 'daily' as 'daily' | 'eod' | 'twice_weekly' | 'weekly' | 'custom',
  customDays: '3', startDate: new Date().toISOString().split('T')[0],
  durationWeeks: 8, notes: '', color: PRESET_COLORS[0],
  steroidForm: 'oil' as 'oil' | 'pill', pillSizeMg: '10', oilConcMgMl: '250',
};

function buildFormFromCompound(comp: Compound) {
  return {
    name: comp.name, nameFromLibrary: true, nameError: '',
    type: comp.type,
    vialSizeMg: comp.vialSizeMg ? comp.vialSizeMg.toString() : '',
    bacWaterMl: comp.bacWaterMl ? comp.bacWaterMl.toString() : '',
    doseAmount: comp.doseAmount.toString(), doseUnit: comp.doseUnit,
    frequency: comp.frequency, customDays: comp.customDays ? comp.customDays.toString() : '3',
    startDate: comp.startDate, durationWeeks: comp.durationWeeks,
    notes: comp.notes || '', color: comp.color,
    steroidForm: comp.steroidForm || 'oil',
    pillSizeMg: comp.pillSizeMg ? comp.pillSizeMg.toString() : '10',
    oilConcMgMl: comp.oilConcMgMl ? comp.oilConcMgMl.toString() : '250',
  };
}

const ID_UNIT_MAP: Record<string, { dose: string; unit: 'mcg' | 'mg' | 'IU' | 'ml'; pillSize?: string; oilConc?: string }> = {
  'bpc-157': { dose: '250', unit: 'mcg' }, 'tb-500': { dose: '2.5', unit: 'mg' },
  'semaglutide': { dose: '0.25', unit: 'mg' }, 'tirzepatide': { dose: '2.5', unit: 'mg' },
  'retatrutide': { dose: '1', unit: 'mg' }, 'retatrutide-shred-peptide': { dose: '2', unit: 'mg' },
  'ipamorelin': { dose: '200', unit: 'mcg' }, 'cjc-1295-no-dac': { dose: '100', unit: 'mcg' },
  'ghk-cu': { dose: '2', unit: 'mg' }, 'human-growth-hormone': { dose: '2', unit: 'IU' },
  'igf-1-lr3': { dose: '50', unit: 'mcg' }, 'pt-141': { dose: '1.5', unit: 'mg' },
  'tesamorelin': { dose: '2', unit: 'mg' }, 'epitalon': { dose: '5', unit: 'mg' },
  'melanotan-ii': { dose: '250', unit: 'mcg' }, 'testosterone-cypionate': { dose: '250', unit: 'mg', oilConc: '250' },
  'testosterone-enanthate': { dose: '250', unit: 'mg', oilConc: '250' }, 'testosterone-propionate': { dose: '100', unit: 'mg', oilConc: '100' },
  'deca-durabolin': { dose: '200', unit: 'mg', oilConc: '250' }, 'trenbolone-acetate': { dose: '100', unit: 'mg', oilConc: '100' },
  'primobolan-enanthate': { dose: '100', unit: 'mg', oilConc: '100' }, 'masteron-propionate': { dose: '100', unit: 'mg', oilConc: '100' },
  'masteron-prop': { dose: '100', unit: 'mg', oilConc: '100' }, 'anavar-oxandrolone': { dose: '20', unit: 'mg', pillSize: '10' },
  'dianabol-methandrostenolone': { dose: '25', unit: 'mg', pillSize: '10' }, 'dianabol-muscle': { dose: '25', unit: 'mg', pillSize: '10' },
  'winstrol-stanozolol': { dose: '25', unit: 'mg', pillSize: '10' }, 'winstrol-dry': { dose: '50', unit: 'mg', pillSize: '50' },
  'clenbuterol-hydrochloride': { dose: '40', unit: 'mcg', pillSize: '40' }, 'tudca-liver-guard': { dose: '250', unit: 'mg', pillSize: '250' },
  'tudca-protect': { dose: '500', unit: 'mg', pillSize: '500' }, 'nac-antioxidant': { dose: '600', unit: 'mg', pillSize: '600' },
  'nac-ultimate-glutathione': { dose: '600', unit: 'mg', pillSize: '600' }, 'arimidex-anastrozole': { dose: '0.5', unit: 'mg', pillSize: '1' },
  'anastrozole-estrogen-control': { dose: '0.5', unit: 'mg', pillSize: '1' }, 'nolvadex-tamoxifen': { dose: '20', unit: 'mg', pillSize: '20' },
  'nolvadex-gyno-protection': { dose: '20', unit: 'mg', pillSize: '20' }, 'tesofensine-metabolic-pill': { dose: '500', unit: 'mcg', pillSize: '500' },
  'kisspeptin-10-hormone': { dose: '100', unit: 'mcg' }, 'thymosin-alpha-1-immune': { dose: '1.5', unit: 'mg' },
  'hcg-hormone': { dose: '250', unit: 'IU' }, 'l-carnitine': { dose: '1000', unit: 'mg', pillSize: '500' },
  'exemestane-suicide-aromasin': { dose: '12.5', unit: 'mg', pillSize: '25' }, 'clomid-pct-stimulator': { dose: '50', unit: 'mg', pillSize: '50' },
  'dsip-delta-sleep': { dose: '100', unit: 'mcg' }, 'thymulin-immune-node': { dose: '100', unit: 'mcg' },
  'sermorelin-growth-peptide': { dose: '250', unit: 'mcg' }, 'theanine-ashwagandha-synergy': { dose: '1', unit: 'mg', pillSize: '1' },
  'citrus-bergamot-lipids': { dose: '500', unit: 'mg', pillSize: '500' }, 'citrus-bergamot-lipids-supp': { dose: '500', unit: 'mg', pillSize: '500' },
  'ghk-cu-epitalon-glow-blend': { dose: '1.5', unit: 'mg' }, 'semaglutide-l-carnitine-shred-blend': { dose: '0.25', unit: 'mg' },
  'pt141-melanotan2-synergy-blend': { dose: '1.5', unit: 'mg' }, 'ta1-thymulin-immune-blend': { dose: '1.5', unit: 'mg' },
};

export default function CompoundFormModal({ open, onClose, editingCompound, prefill, onAdd, onUpdate, activeFromLibrary, clearActiveFromLibrary, onOpenRetroLog, onNavigateToTab }: CompoundFormModalProps) {
  const [name, setName] = useState(DEFAULT_FORM.name);
  const [nameFromLibrary, setNameFromLibrary] = useState(DEFAULT_FORM.nameFromLibrary);
  const [nameError, setNameError] = useState('');
  const [type, setType] = useState(DEFAULT_FORM.type);
  const [vialSizeMg, setVialSizeMg] = useState(DEFAULT_FORM.vialSizeMg);
  const [bacWaterMl, setBacWaterMl] = useState(DEFAULT_FORM.bacWaterMl);
  const [doseAmount, setDoseAmount] = useState(DEFAULT_FORM.doseAmount);
  const [doseUnit, setDoseUnit] = useState(DEFAULT_FORM.doseUnit);
  const [frequency, setFrequency] = useState(DEFAULT_FORM.frequency);
  const [customDays, setCustomDays] = useState(DEFAULT_FORM.customDays);
  const [startDate, setStartDate] = useState(DEFAULT_FORM.startDate);
  const [durationWeeks, setDurationWeeks] = useState(DEFAULT_FORM.durationWeeks);
  const [notes, setNotes] = useState(DEFAULT_FORM.notes);
  const [color, setColor] = useState(DEFAULT_FORM.color);
  const [steroidForm, setSteroidForm] = useState(DEFAULT_FORM.steroidForm);
  const [pillSizeMg, setPillSizeMg] = useState(DEFAULT_FORM.pillSizeMg);
  const [oilConcMgMl, setOilConcMgMl] = useState(DEFAULT_FORM.oilConcMgMl);
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(-1);
  const [showAddSuccessPrompt, setShowAddSuccessPrompt] = useState(false);
  const [addedCompoundId, setAddedCompoundId] = useState<string | null>(null);
  const [addedCompoundName, setAddedCompoundName] = useState<string | null>(null);

  useEffect(() => {
    if (!open) { setShowAddSuccessPrompt(false); setAddedCompoundName(null); }
  }, [open]);

  useEffect(() => {
    if (editingCompound) {
      const f = buildFormFromCompound(editingCompound);
      setName(f.name); setNameFromLibrary(f.nameFromLibrary); setNameError('');
      setType(f.type as any); setVialSizeMg(f.vialSizeMg); setBacWaterMl(f.bacWaterMl);
      setDoseAmount(f.doseAmount); setDoseUnit(f.doseUnit as any); setFrequency(f.frequency as any);
      setCustomDays(f.customDays); setStartDate(f.startDate); setDurationWeeks(f.durationWeeks);
      setNotes(f.notes); setColor(f.color); setSteroidForm(f.steroidForm as any);
      setPillSizeMg(f.pillSizeMg); setOilConcMgMl(f.oilConcMgMl);
    } else if (prefill && open) {
      setName(prefill.name ?? ''); setNameFromLibrary(true); setNameError('');
      setType((prefill.type ?? 'compound') as any);
      setVialSizeMg(prefill.vialSizeMg ? prefill.vialSizeMg.toString() : '');
      setBacWaterMl(prefill.bacWaterMl ? prefill.bacWaterMl.toString() : '');
      setDoseAmount(prefill.doseAmount ? prefill.doseAmount.toString() : '1');
      setDoseUnit((prefill.doseUnit ?? 'mg') as any);
      setFrequency((prefill.frequency ?? 'daily') as any);
      setCustomDays(prefill.customDays ? prefill.customDays.toString() : '3');
      setStartDate(prefill.startDate ?? new Date().toISOString().split('T')[0]);
      setDurationWeeks(prefill.durationWeeks ?? 8);
      setNotes(prefill.notes ?? ''); setColor(prefill.color ?? PRESET_COLORS[0]);
      setSteroidForm((prefill.steroidForm ?? 'oil') as any);
      setPillSizeMg(prefill.pillSizeMg ? prefill.pillSizeMg.toString() : '10');
      setOilConcMgMl(prefill.oilConcMgMl ? prefill.oilConcMgMl.toString() : '250');
    } else {
      setName(''); setNameFromLibrary(false); setNameError(''); setType('peptide');
      setVialSizeMg(''); setBacWaterMl(''); setDoseAmount('1'); setDoseUnit('mg');
      setFrequency('daily'); setCustomDays('3'); setStartDate(new Date().toISOString().split('T')[0]);
      setDurationWeeks(8); setNotes(''); setColor(PRESET_COLORS[0]);
      setSteroidForm('oil'); setPillSizeMg('10'); setOilConcMgMl('250');
    }
  }, [editingCompound, open]);

  useEffect(() => {
    if (activeFromLibrary) {
      applyLibraryItem(activeFromLibrary);
      clearActiveFromLibrary?.();
    }
  }, [activeFromLibrary]);

  const suggestions = name.trim()
    ? PEPTIDE_LIBRARY.filter(item => {
        const q = name.toLowerCase().trim();
        return (item.name || '').toLowerCase().includes(q) ||
          (item.chemicalName || '').toLowerCase().includes(q) ||
          (item.id || '').toLowerCase().includes(q) ||
          (item.category || '').toLowerCase().includes(q) ||
          (item.description || '').toLowerCase().includes(q) ||
          (item.benefits || []).some(b => (b || '').toLowerCase().includes(q));
      }).slice(0, 8)
    : [];

  function applyLibraryItem(item: LibraryItem) {
    setName(item.name); setNameFromLibrary(true); setNameError('');
    let t: 'peptide' | 'compound' | 'supplement' | 'steroid' = 'compound';
    let sf: 'oil' | 'pill' = 'oil';
    let ps = '10', oc = '250', da = '250', du: 'mcg' | 'mg' | 'IU' | 'ml' = 'mg';

    if (item.deliveryForm === 'peptide') { t = 'peptide'; du = 'mcg'; }
    else if (item.deliveryForm === 'oil') { t = 'steroid'; sf = 'oil'; }
    else if (item.deliveryForm === 'pill') {
      sf = 'pill';
      t = (item.id === 'tudca-liver-guard' || item.id === 'nac-antioxidant' || item.category === 'supplements') ? 'supplement'
        : item.category === 'muscle' ? 'steroid' : 'compound';
    }

    if (ID_UNIT_MAP[item.id]) {
      const bp = ID_UNIT_MAP[item.id];
      da = bp.dose; du = bp.unit;
      if (bp.pillSize) ps = bp.pillSize;
      if (bp.oilConc) oc = bp.oilConc;
    } else {
      const typ = item.typicalDosage.toLowerCase();
      du = typ.includes('mcg') ? 'mcg' : typ.includes('iu') ? 'IU' : typ.includes('ml') ? 'ml' : 'mg';
      const m = typ.match(/(\d+(?:\.\d+)?)/);
      if (m) da = m[1];
    }

    setType(t); setSteroidForm(sf); setDoseAmount(da); setDoseUnit(du);
    setPillSizeMg(ps); setOilConcMgMl(oc);

    const freq = item.frequencyText.toLowerCase();
    setFrequency(freq.includes('twice weekly') || freq.includes('2 times') || freq.includes('twice a week') ? 'twice_weekly'
      : freq.includes('weekly') ? 'weekly' : freq.includes('every other day') ? 'eod' : 'daily');

    if (item.reconstitutionText && t === 'peptide') {
      const vm = item.reconstitutionText.match(/(\d+)\s*mg/i);
      const wm = item.reconstitutionText.match(/(\d+(?:\.\d+)?)\s*ml/i);
      if (vm) setVialSizeMg(vm[1]); if (wm) setBacWaterMl(wm[1]);
    } else { setVialSizeMg(''); setBacWaterMl(''); }

    setNotes(`Autofilled from scientific library entry. Suggested: ${item.suggestedCycleWeeks}`);
  }

  const handleSelectSuggestion = (item: LibraryItem) => {
    applyLibraryItem(item); setShowSuggestions(false); setFocusedSuggestionIndex(-1);
  };

  const resetForm = () => {
    setName(''); setNameFromLibrary(false); setNameError(''); setType('peptide');
    setVialSizeMg(''); setBacWaterMl(''); setDoseAmount('1'); setDoseUnit('mg');
    setFrequency('daily'); setCustomDays('3'); setStartDate(new Date().toISOString().split('T')[0]);
    setDurationWeeks(8); setNotes(''); setColor(PRESET_COLORS[0]);
    setSteroidForm('oil'); setPillSizeMg('10'); setOilConcMgMl('250');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let finalName = name.trim();
    if (!editingCompound && !nameFromLibrary) {
      const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
      const typed = norm(finalName);
      const exact = PEPTIDE_LIBRARY.find(it => norm(it.name) === typed);
      if (exact) { finalName = exact.name; }
      else {
        const close = PEPTIDE_LIBRARY.find(it => { const n = norm(it.name); return n.includes(typed) || typed.includes(n); });
        if (close) { finalName = close.name; }
        else { setNameError('Please choose a compound from the list.'); setShowSuggestions(true); return; }
      }
    }
    setNameError('');

    const data: Compound = {
      id: editingCompound?.id || crypto.randomUUID(),
      name: finalName, type,
      vialSizeMg: type === 'peptide' && vialSizeMg ? parseFloat(vialSizeMg) : undefined,
      bacWaterMl: type === 'peptide' && bacWaterMl ? parseFloat(bacWaterMl) : undefined,
      doseAmount: parseFloat(doseAmount) || 0, doseUnit,
      frequency, customDays: frequency === 'custom' ? parseInt(customDays) || 3 : undefined,
      startDate, durationWeeks: parseInt(durationWeeks as any) || 8,
      notes: notes.trim(), color,
      isCompleted: editingCompound?.isCompleted ?? false,
      steroidForm: (type === 'steroid' || type === 'supplement' || type === 'compound') ? steroidForm : undefined,
      pillSizeMg: (type === 'steroid' || type === 'supplement' || type === 'compound') && steroidForm === 'pill' && pillSizeMg ? parseFloat(pillSizeMg) : undefined,
      oilConcMgMl: (type === 'steroid' || type === 'supplement' || type === 'compound') && steroidForm === 'oil' && oilConcMgMl ? parseFloat(oilConcMgMl) : undefined,
    };

    triggerHaptic('success');
    if (editingCompound) {
      onUpdate(data); resetForm(); onClose();
    } else {
      onAdd(data); setAddedCompoundId(data.id); setAddedCompoundName(data.name);
      setShowAddSuccessPrompt(true); resetForm();
    }
  };

  const handleApplyCalcConfig = (config: { vialSizeMg: number; bacWaterMl: number; doseUnit: string; doseAmount: number }) => {
    setVialSizeMg(config.vialSizeMg.toString()); setBacWaterMl(config.bacWaterMl.toString());
    setDoseAmount(config.doseAmount.toString()); setDoseUnit(config.doseUnit as any);
    setType('peptide'); setShowCalcModal(false); triggerHaptic('success');
  };

  if (!open || typeof window === 'undefined') return null;

  return (
    <>
      {createPortal(
        <div className="fixed inset-0 bg-[#020617]/75 backdrop-blur-sm flex items-start sm:items-center justify-center p-2.5 sm:p-4 z-50 overflow-y-auto" id="planner-form-overlay">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4 sm:p-6 w-full max-w-xl shadow-2xl relative space-y-5 my-4 sm:my-0" id="planner-form-card" onClick={(e) => e.stopPropagation()}>
            {showAddSuccessPrompt ? (
              <div className="space-y-6 py-4 text-center flex flex-col items-center justify-center" id="add-success-screen">
                <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center animate-bounce shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <CheckCircle className="w-8 h-8 font-extrabold" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-slate-100 uppercase tracking-wider font-mono">Compound Added!</h4>
                  <p className="text-sm text-slate-300 px-6 leading-relaxed">
                    <strong className="text-cyan-400 font-black">{addedCompoundName}</strong> has been successfully added to your active biological schedule.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
                  <button type="button" onClick={() => { triggerHaptic('medium'); onClose(); onNavigateToTab?.('dashboard'); }}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm tracking-wide transition shadow-[0_0_15px_rgba(34,211,238,0.15)] flex items-center justify-center gap-2 cursor-pointer"
                    id="success-go-to-cycle-btn">
                    <span>Go to My Cycle Checklist</span>
                    <ArrowLeftRight className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                  </button>
                  <button type="button" onClick={() => { triggerHaptic('light'); setShowAddSuccessPrompt(false); setAddedCompoundName(null); }}
                    className="flex-1 py-3 px-4 bg-[#1e293b]/85 border border-[#1e293b] hover:border-slate-700 text-slate-300 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                    id="success-add-another-btn">
                    <span>Add Another Compound</span>
                    <Plus className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                  </button>
                </div>
                <div className="bg-[#1e293b]/35 border border-[#1e293b] p-4.5 rounded-2xl text-left w-full space-y-2.5 mt-2" id="success-retro-sync-card">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    <History className="w-4 h-4 text-cyan-400" />
                    <span>Sync Historic Administrations?</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    Are you transferring record state from another logging system? You can retroactively fill past doses now to automatically balance and calibrate your cycle start date.
                  </p>
                  <button type="button"
                    onClick={() => { triggerHaptic('light'); onClose(); setShowAddSuccessPrompt(false); setAddedCompoundName(null); if (addedCompoundId) onOpenRetroLog?.(addedCompoundId); }}
                    className="w-full py-2.5 bg-cyan-700/20 hover:bg-cyan-600/30 text-cyan-300 hover:text-white border border-cyan-500/30 rounded-xl text-xs font-bold font-mono uppercase transition flex items-center justify-center gap-1.5 cursor-pointer"
                    id="success-retro-sync-btn">
                    <span>Configure Historical Dose Logs</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start pb-4 border-b border-[#1e293b]">
                  <div>
                    <h4 className="text-lg font-bold text-slate-100 flex items-center gap-1.5">
                      <Sparkles className="w-5 h-5 text-cyan-400" />
                      {editingCompound ? 'Refine Active Compound Specification' : 'Formulate New Enhancer Sequence'}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Define standard dosages, scheduling matrices, and chemical details.</p>
                  </div>
                  <button type="button" onClick={onClose}
                    className="p-1 px-2 border border-[#1e293b] hover:border-slate-700 bg-[#1e293b]/45 text-slate-400 hover:text-slate-200 text-xs font-semibold rounded-lg transition"
                    id="close-form-btn">Close</button>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2 relative">
                      <label className="text-xs font-semibold text-slate-300">Name of Compound (e.g., Semaglutide, BPC-157)</label>
                      <input type="text" required value={name}
                        onChange={(e) => { setName(e.target.value); setNameFromLibrary(false); setNameError(''); setShowSuggestions(true); setFocusedSuggestionIndex(-1); }}
                        onKeyDown={(e) => {
                          if (!showSuggestions || suggestions.length === 0) return;
                          if (e.key === 'ArrowDown') { e.preventDefault(); setFocusedSuggestionIndex(p => (p + 1) % suggestions.length); }
                          else if (e.key === 'ArrowUp') { e.preventDefault(); setFocusedSuggestionIndex(p => (p - 1 + suggestions.length) % suggestions.length); }
                          else if (e.key === 'Enter' && focusedSuggestionIndex >= 0) { e.preventDefault(); handleSelectSuggestion(suggestions[focusedSuggestionIndex]); }
                          else if (e.key === 'Escape') setShowSuggestions(false);
                        }}
                        onFocus={() => { setShowSuggestions(true); setFocusedSuggestionIndex(-1); }}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        placeholder="Enter chemical title or starting letters..."
                        className="w-full bg-[#1e293b]/45 border border-slate-700/60 rounded-xl py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/30 transition shadow-inner"
                        id="form-name-input" autoComplete="off" />
                      {nameError && <p className="text-[11px] text-red-400 mt-1 font-medium">{nameError}</p>}
                      {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute top-full left-0 w-full mt-1.5 bg-[#0f172a] border border-[#1e293b] rounded-xl shadow-2xl overflow-y-auto max-h-48 z-50 divide-y divide-slate-800/60 custom-scrollbar" id="name-autocomplete-dropdown">
                          <div className="px-3 py-1 bg-slate-900/45 text-[9px] font-mono text-slate-500 tracking-wider uppercase font-semibold">Matched Encyclopedia Suggestions</div>
                          {suggestions.map((item, idx) => (
                            <button key={item.id} type="button" onMouseDown={() => handleSelectSuggestion(item)} onMouseEnter={() => setFocusedSuggestionIndex(idx)}
                              className={`w-full text-left p-2.5 transition-colors flex items-center justify-between text-xs cursor-pointer group ${focusedSuggestionIndex === idx ? 'bg-cyan-500/10 text-cyan-200 border-l-2 border-cyan-500 pl-2' : 'hover:bg-cyan-500/10 hover:text-cyan-200'}`}>
                              <div>
                                <span className={`font-bold transition-colors block ${focusedSuggestionIndex === idx ? 'text-cyan-300' : 'text-slate-200 group-hover:text-cyan-300'}`}>{item.name}</span>
                                {item.chemicalName && <span className={`text-[10px] font-mono block mt-0.5 ${focusedSuggestionIndex === idx ? 'text-slate-300' : 'text-slate-400 group-hover:text-slate-300'}`}>{item.chemicalName}</span>}
                              </div>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-semibold border uppercase shrink-0 ${focusedSuggestionIndex === idx ? 'bg-cyan-500 text-slate-950 border-cyan-500' : 'bg-cyan-950/45 text-cyan-400 border-cyan-500/25 group-hover:bg-cyan-500 group-hover:text-slate-950'}`}>Auto-Fill</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Compound Family Category</label>
                      <select value={type} onChange={(e) => setType(e.target.value as any)}
                        className="w-full bg-[#1e293b] border border-slate-700/60 rounded-xl py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/80" id="form-type-select">
                        <option value="peptide">Peptide (Freeze-Dried Vial)</option>
                        <option value="steroid">Anabolic Steroid / TRT</option>
                        <option value="compound">Anabolic / SARM / Chemical</option>
                        <option value="supplement">Organic Supplement</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Color Code (Visualizer Identity)</label>
                      <div className="flex gap-1.5 items-center bg-[#1e293b]/45 border border-slate-700/60 rounded-xl py-1.5 px-2.5 h-10">
                        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-7 h-7 bg-transparent border-0 cursor-pointer overflow-hidden rounded shrink-0" id="form-color-picker" />
                        <div className="flex flex-wrap gap-1 max-w-[140px] items-center">
                          {PRESET_COLORS.map(c => (
                            <button key={c} type="button" onClick={() => setColor(c)} className="w-3.5 h-3.5 rounded-full border border-black/40 inline-block transition hover:scale-110 cursor-pointer" style={{ backgroundColor: c }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {type === 'peptide' && (
                    <div className="bg-cyan-500/5 border border-cyan-500/15 p-4 rounded-xl space-y-3.5">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 font-bold block">Optional Reconstitution Mapping</span>
                      <div className="grid grid-cols-2 gap-3.5">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-300">Vial Capacity (mg)</label>
                          <input type="number" step="0.1" value={vialSizeMg} onChange={(e) => setVialSizeMg(e.target.value)} placeholder="e.g. 5"
                            className="w-full bg-[#1e293b]/45 border border-slate-700/60 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/80" id="form-vial-mg-input" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-slate-300">Bacteriostatic Water Added (ml / cc)</label>
                          <input type="number" step="0.1" value={bacWaterMl} onChange={(e) => setBacWaterMl(e.target.value)} placeholder="e.g. 2"
                            className="w-full bg-[#1e293b]/45 border border-slate-700/60 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/80" id="form-water-ml-input" />
                        </div>
                      </div>
                      <span className="text-[9px] text-slate-500 leading-normal block">Entering these allows the system to auto-map mcg dosages into physical syringe tick marks, displaying plunger volumes inside active daily schedules.</span>
                    </div>
                  )}

                  {(type === 'steroid' || type === 'supplement' || type === 'compound') && (
                    <div className="bg-cyan-500/5 border border-cyan-500/15 p-4 rounded-xl space-y-3.5">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 font-bold block">Delivery Format & Configuration</span>
                      <div className="grid grid-cols-2 gap-3.5">
                        <div className="space-y-1 col-span-2">
                          <label className="text-[11px] font-semibold text-slate-300">Formulation Format</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button type="button" onClick={() => setSteroidForm('oil')}
                              className={`py-1.5 px-3 rounded-lg border text-xs font-semibold cursor-pointer transition ${steroidForm === 'oil' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40 font-bold' : 'bg-[#1e293b]/50 border-slate-700/50 text-slate-400 hover:text-slate-200'}`}
                              id="form-format-oil-btn">Liquid / Oil (Injectable)</button>
                            <button type="button" onClick={() => setSteroidForm('pill')}
                              className={`py-1.5 px-3 rounded-lg border text-xs font-semibold cursor-pointer transition ${steroidForm === 'pill' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40 font-bold' : 'bg-[#1e293b]/50 border-slate-700/50 text-slate-400 hover:text-slate-200'}`}
                              id="form-format-pill-btn">Oral Tablet / Pill</button>
                          </div>
                        </div>
                        {steroidForm === 'pill' ? (
                          <div className="space-y-1 col-span-2">
                            <label className="text-[11px] font-semibold text-slate-300">Tablet / Pill Size (mg per Tablet)</label>
                            <input type="number" step="any" value={pillSizeMg} onChange={(e) => setPillSizeMg(e.target.value)} placeholder="e.g. 10"
                              className="w-full bg-[#1e293b]/45 border border-slate-700/60 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/80" id="form-pill-size-input" />
                          </div>
                        ) : (
                          <div className="space-y-1 col-span-2">
                            <label className="text-[11px] font-semibold text-slate-300">Liquid Concentration (mg per 1 ml / cc)</label>
                            <input type="number" step="any" value={oilConcMgMl} onChange={(e) => setOilConcMgMl(e.target.value)} placeholder="e.g. 250"
                              className="w-full bg-[#1e293b]/45 border border-slate-700/60 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/80" id="form-oil-conc-input" />
                          </div>
                        )}
                      </div>
                      <span className="text-[9.5px] text-cyan-400 leading-normal block font-mono bg-cyan-950/20 border border-cyan-900/10 p-2 rounded-lg">
                        {steroidForm === 'pill'
                          ? <span>✓ Daily dosage of <strong className="text-cyan-300 font-extrabold">{doseAmount || '20'} {doseUnit}</strong> automatically corresponds to taking <strong className="text-cyan-300 font-extrabold">{(parseFloat(doseAmount) / (parseFloat(pillSizeMg) || 10)).toFixed(2)} pills</strong> (using {pillSizeMg || 10}mg tablets).</span>
                          : <span>✓ Each injection dose of <strong className="text-cyan-300 font-extrabold">{doseAmount || '250'} {doseUnit}</strong> automatically corresponds to drawing <strong className="text-cyan-300 font-extrabold">{(parseFloat(doseAmount) / (parseFloat(oilConcMgMl) || 250)).toFixed(2)} ml / cc</strong> on standard syringe scales (using {oilConcMgMl || 250}mg/ml susp).</span>
                        }
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 col-span-2 sm:col-span-1">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-semibold text-slate-300">Dose Quantity</label>
                        <button type="button" onClick={() => { triggerHaptic('light'); setShowCalcModal(true); }}
                          className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono bg-cyan-950/45 border border-cyan-500/25 hover:border-cyan-500/45 px-2 py-0.5 rounded transition-all cursor-pointer"
                          id="form-open-recalc-helper">
                          <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" /> Peptide Mix Helper
                        </button>
                      </div>
                      <div className={`relative transition-all duration-300 rounded-xl ${type === 'peptide' ? 'border border-dashed border-cyan-500/30 bg-cyan-500/5 hover:border-cyan-500/50 hover:bg-cyan-500/10 p-1' : ''}`}>
                        <div className="flex gap-1 bg-[#1e293b]/45 border border-slate-700/60 rounded-xl pr-2 items-center">
                          <input type="number" required step="any" value={doseAmount} onChange={(e) => setDoseAmount(e.target.value)} placeholder="e.g. 250"
                            className="w-full bg-transparent border-0 rounded-l-xl py-2 px-3 text-sm text-slate-200 focus:outline-none" id="form-dose-amount-input" />
                          <select value={doseUnit} onChange={(e) => setDoseUnit(e.target.value as any)}
                            className="bg-[#1e293b] border border-slate-700/60 rounded-lg text-xs py-1 px-2 my-1 text-slate-300 focus:outline-none" id="form-dose-unit-select">
                            <option value="mcg">mcg</option><option value="mg">mg</option><option value="IU">IU</option><option value="ml">ml</option>
                          </select>
                        </div>
                      </div>
                      {type === 'peptide' && (
                        <p className="text-[10px] text-cyan-400 flex items-center gap-1.5 leading-normal opacity-90 mt-1">
                          💡 Reconstitution active. Tap <span className="underline font-bold cursor-pointer hover:text-cyan-300" onClick={() => setShowCalcModal(true)}>Peptide Mix Helper</span> to calculate syringe tick marks.
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Administration Frequency</label>
                      <select value={frequency} onChange={(e) => setFrequency(e.target.value as any)}
                        className="w-full bg-[#1e293b] border border-slate-700/60 rounded-xl py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/80" id="form-frequency-select">
                        <option value="daily">Every Day (Daily)</option>
                        <option value="eod">Every Other Day (EOD)</option>
                        <option value="twice_weekly">Twice a Week (e.g. Mon/Thurs)</option>
                        <option value="weekly">Once a Week</option>
                        <option value="custom">Custom Days Cycle</option>
                      </select>
                    </div>

                    {frequency === 'custom' && (
                      <div className="space-y-1.5 col-span-2">
                        <label className="text-xs font-semibold text-slate-300">Custom Frequency Intermission (Days)</label>
                        <input type="number" min="1" max="30" value={customDays} onChange={(e) => setCustomDays(e.target.value)} placeholder="e.g. 3"
                          className="w-full bg-[#1e293b]/45 border border-slate-700/60 rounded-xl py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/80" id="form-custom-days-input" />
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Cycle Active Start Date</label>
                      <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-[#1e293b]/45 border border-slate-700/60 rounded-xl py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/80" id="form-start-date-input" />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Active Duration (Weeks)</label>
                      <input type="number" required min="1" max="52" value={durationWeeks} onChange={(e) => setDurationWeeks(parseInt(e.target.value))}
                        className="w-full bg-[#1e293b]/45 border border-slate-700/60 rounded-xl py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/80" id="form-duration-weeks-input" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Physiological Annotations & Laboratory Notes</label>
                    <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Insert injection guidance, site selection, titration plan..."
                      className="w-full h-18 bg-[#1e293b]/45 border border-slate-700/60 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80" id="form-notes-textarea" />
                  </div>

                  <div className="pt-4 border-t border-[#1e293b] flex gap-3.5 justify-end">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200" id="cancel-form">Cancel</button>
                    <button type="submit" className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition shadow-lg shadow-cyan-500/10" id="submit-form">
                      <Save className="w-4 h-4 text-slate-950" />
                      {editingCompound ? 'Refine Formulation' : 'Record Compound'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>,
        document.body
      )}

      {showCalcModal && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-[#020617]/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-[60]" id="calc-helper-overlay">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-3xl p-4 sm:p-6 w-full max-w-5xl shadow-2xl relative space-y-4 my-2 sm:my-0 flex flex-col max-h-[95vh] text-left" id="calc-helper-modal">
            <div className="flex justify-between items-center pb-3 border-b border-[#1e293b] shrink-0">
              <div>
                <h4 className="text-base sm:text-lg font-black text-slate-100 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                  <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" /> Peptide Mix Helper
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Configure peptide/compound titration, inspect visual syringe scale tick marks, and apply to formulation state instantly.</p>
              </div>
              <button type="button" onClick={() => { triggerHaptic('light'); setShowCalcModal(false); }}
                className="p-1.5 px-3 border border-[#1e293b] hover:border-slate-700 bg-[#1e293b]/45 text-slate-400 hover:text-slate-200 text-xs font-semibold rounded-lg transition shrink-0 cursor-pointer"
                id="close-calc-helper-btn">Close</button>
            </div>
            <div className="overflow-y-auto flex-grow pr-1 custom-scrollbar">
              <ReconstitutionCalculator
                onApplyConfig={handleApplyCalcConfig}
                initialVialMg={parseFloat(vialSizeMg) || 5}
                initialWaterMl={parseFloat(bacWaterMl) || 2}
                initialDoseMcg={doseUnit === 'mcg' ? (parseFloat(doseAmount) || 250) : (doseUnit === 'mg' ? (parseFloat(doseAmount) * 1000 || 250) : 250)}
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
