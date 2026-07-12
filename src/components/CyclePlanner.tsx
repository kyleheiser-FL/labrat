import React, { useState, useMemo, useEffect } from 'react';
import { localDateISO } from '../lib/date';
import {
  Plus, Trash2, FileDown, FileUp, AlertTriangle, CheckCircle, Sparkles, ArrowLeftRight, Save,
  Info, Activity, Shield, Apple, Sun, Heart, CheckSquare, History, Clock,
  Layers, X, Wrench
} from 'lucide-react';
import { Compound, LibraryItem, DoseLog } from '../types';
import { triggerHaptic } from '../lib/haptics';
import { PEPTIDE_LIBRARY } from '../data/peptides';
import CompoundCard from './CompoundCard';
import CompoundFormModal from './CompoundFormModal';
import RetroactiveLogModal from './RetroactiveLogModal';

interface CyclePlannerProps {
  compounds: Compound[];
  logs?: DoseLog[];
  onLogDose?: (log: DoseLog) => void;
  onBatchLogDoses?: (newLogs: DoseLog[]) => void;
  onUndoDose?: (id: string) => void;
  onAddCompound: (compound: Compound) => void;
  onUpdateCompound: (compound: Compound) => void;
  onDeleteCompound: (id: string) => void;
  onImportData: (importDataString: string) => boolean;
  onResetData: () => void;
  activeFromLibrary?: LibraryItem | null;
  clearActiveFromLibrary?: () => void;
  onNavigateToTab?: (tab: 'dashboard' | 'planner' | 'blood' | 'library' | 'shop' | 'settings') => void;
  labratTheme?: 'neon' | 'clinical' | 'clinical-light';
  visibility?: { pct: boolean; dataControls: boolean; };
}

export default function CyclePlanner({
  compounds,
  logs = [],
  onLogDose,
  onBatchLogDoses,
  onUndoDose,
  onAddCompound,
  onUpdateCompound,
  onDeleteCompound,
  onImportData,
  onResetData,
  activeFromLibrary,
  clearActiveFromLibrary,
  onNavigateToTab,
  labratTheme = 'neon',
  visibility = { pct: true, dataControls: true }
}: CyclePlannerProps) {
  const protocolIcon = (name: string) => `/protocol-icons/${name}-${labratTheme === 'neon' ? 'neon' : 'clinical'}.svg`;

  const [showForm, setShowForm] = useState(false);
  const [editingCompound, setEditingCompound] = useState<Compound | null>(null);
  const [formPrefill, setFormPrefill] = useState<Partial<Compound> | null>(null);
  const [retroactiveCompId, setRetroactiveCompId] = useState<string | null>(null);

  const [confirmingReset, setConfirmingReset] = useState(false);
  const [showDataControls, setShowDataControls] = useState(false);
  const [importString, setImportString] = useState('');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);
  const [copiedData, setCopiedData] = useState(false);
  // The header button now reveals only the Import / Export data panel.
  const [showHelperTools, setShowHelperTools] = useState(false);
  // Legacy helper panels (templates, PCT, mitigation presets, cycle history)
  // are kept in the code but hidden to keep the Cycle tab simple.
  const showLegacyHelpers = false;

  // Cycle Templates
  const [showTemplates, setShowTemplates] = useState(false);
  const [templateSaveName, setTemplateSaveName] = useState('');
  const [savedTemplates, setSavedTemplates] = useState<{ name: string; compounds: Compound[] }[]>(() => {
    try { return JSON.parse(localStorage.getItem('labrat_cycle_templates') || '[]'); } catch { return []; }
  });

  const saveTemplate = () => {
    if (!templateSaveName.trim() || compounds.length === 0) return;
    const t = { name: templateSaveName.trim(), compounds: compounds.map(c => ({ ...c, id: c.id, startDate: c.startDate })) };
    const next = [...savedTemplates, t];
    setSavedTemplates(next);
    localStorage.setItem('labrat_cycle_templates', JSON.stringify(next));
    setTemplateSaveName('');
    triggerHaptic('success');
  };

  const applyTemplate = (t: { name: string; compounds: Compound[] }) => {
    const today = localDateISO();
    t.compounds.forEach(c => {
      onAddCompound({ ...c, id: `tmpl-${Date.now()}-${Math.random().toString(36).slice(2)}`, startDate: today, isCompleted: false });
    });
    setShowTemplates(false);
    triggerHaptic('success');
  };

  const deleteTemplate = (idx: number) => {
    const next = savedTemplates.filter((_, i) => i !== idx);
    setSavedTemplates(next);
    localStorage.setItem('labrat_cycle_templates', JSON.stringify(next));
  };

  const cycleTriggers = useMemo(() => {
    let hasOral = false, hasInjectable = false, hasAromatizing = false, hasJointStrain = false, hasSuppressive = false, hasStimulant = false;
    let liverSupportInCycle = false, vitaminsInCycle = false, jointHealthInCycle = false, estrogenControlInCycle = false, endocrineShieldInCycle = false, jitterRescueInCycle = false;
    for (const c of compounds) {
      const n = c.name.toLowerCase();
      if (!hasOral) hasOral = (c.type === 'steroid' && c.steroidForm === 'pill') || n.includes('dianabol') || n.includes('dbol') || n.includes('winstrol') || n.includes('stanozolol') || n.includes('anavar') || n.includes('oxandrolone') || n.includes('tesofensine') || n.includes('clenbuterol');
      if (!hasInjectable) hasInjectable = (c.type === 'steroid' && c.steroidForm === 'oil') || n.includes('testosterone') || n.includes('trenbolone') || n.includes('primobolan') || n.includes('masteron') || n.includes('deca') || n.includes('boldenone');
      if (!hasAromatizing) hasAromatizing = n.includes('testosterone') || n.includes('dianabol') || n.includes('dbol');
      if (!hasJointStrain) hasJointStrain = n.includes('winstrol') || n.includes('stanozolol') || n.includes('masteron') || n.includes('trenbolone') || n.includes('deca');
      if (!hasSuppressive) hasSuppressive = c.type === 'steroid' || n.includes('tren') || n.includes('test') || n.includes('deca') || n.includes('primo') || n.includes('mast') || n.includes('var') || n.includes('winstrol') || n.includes('dianabol') || n.includes('dbol');
      if (!hasStimulant) hasStimulant = n.includes('clenbuterol') || n.includes('tesofensine');
      if (!liverSupportInCycle) liverSupportInCycle = n.includes('tudca') || n.includes('liver protection') || n.includes('nac');
      if (!vitaminsInCycle) vitaminsInCycle = n.includes('coq10') || n.includes('omega-3') || n.includes('fish oil');
      if (!jointHealthInCycle) jointHealthInCycle = n.includes('glucosamine') || n.includes('joint');
      if (!estrogenControlInCycle) estrogenControlInCycle = n.includes('arimidex') || n.includes('anastrozole') || n.includes('aromasin') || n.includes('exemestane');
      if (!endocrineShieldInCycle) endocrineShieldInCycle = n.includes('hcg') || n.includes('gonadotropin');
      if (!jitterRescueInCycle) jitterRescueInCycle = n.includes('theanine') || n.includes('ashwagandha') || n.includes('calm-cycle');
    }
    return { hasOral, hasInjectable, hasAromatizing, hasJointStrain, hasSuppressive, hasStimulant, liverSupportInCycle, vitaminsInCycle, jointHealthInCycle, estrogenControlInCycle, endocrineShieldInCycle, jitterRescueInCycle };
  }, [compounds]);

  const handleExportData = () => {
    navigator.clipboard.writeText(JSON.stringify(compounds, null, 2));
    setCopiedData(true);
    setTimeout(() => setCopiedData(false), 2000);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setImportError(''); setImportSuccess(false);
    try {
      const parsed = JSON.parse(importString);
      if (!Array.isArray(parsed)) { setImportError('Invalid JSON formatting: Data must be a compound list array.'); return; }
      if (onImportData(importString)) {
        setImportSuccess(true); setImportString('');
        setTimeout(() => setImportSuccess(false), 3000);
      } else {
        setImportError('Could not process import array. Verification failed.');
      }
    } catch (err: any) {
      setImportError(`Failed parsing JSON: ${err?.message || 'Syntax error'}`);
    }
  };

  useEffect(() => {
    if (activeFromLibrary) {
      setEditingCompound(null);
      setFormPrefill(null);
      setShowForm(true);
    }
  }, [activeFromLibrary]);

  const openFormNew = () => {
    setEditingCompound(null); setFormPrefill(null); setShowForm(true);
  };

  const openFormEdit = (comp: Compound) => {
    setEditingCompound(comp); setFormPrefill(null); setShowForm(true);
  };

  const openFormWithPrefill = (prefill: Partial<Compound>) => {
    setEditingCompound(null); setFormPrefill(prefill); setShowForm(true);
  };

  const handleOpenRetroLog = (compoundId: string) => {
    setRetroactiveCompId(compoundId);
  };

  const getEndDate = (start: string, weeks: number) => {
    const s = new Date(start);
    if (isNaN(s.getTime())) return null;
    s.setDate(s.getDate() + weeks * 7);
    return s;
  };

  const todayObj = new Date();
  const suppressiveCompounds = compounds.filter(c => c.type === 'steroid' || c.type === 'compound');
  const pctCandidates = suppressiveCompounds.filter(c => {
    const endDate = getEndDate(c.startDate, c.durationWeeks);
    return c.isCompleted || (endDate ? todayObj >= endDate : false);
  });

  return (
    <div className="space-y-6" id="planner-main-container">
      {/* Top action bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h3 className="text-base font-semibold text-slate-100">Your Cycle</h3>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setShowHelperTools(v => !v)}
            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 border cursor-pointer transition-all ${showHelperTools ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30' : 'bg-[#1e293b] hover:bg-slate-800 text-slate-300 border-slate-700/50'}`}
            title="Back up or restore your cycle data">
            <ArrowLeftRight className="w-3.5 h-3.5" /> Import / Export
          </button>
          <button onClick={openFormNew}
            className="py-2.5 px-5 bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-slate-950 font-black rounded-xl text-sm flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-500/10"
            id="new-formulate-btn">
            <Plus className="w-4 h-4 text-slate-950" strokeWidth={3} /> Add Compound
          </button>
        </div>
      </div>

      {/* Cycle Templates Panel */}
      {showLegacyHelpers && (
        <div className="bg-[#0f172a]/70 border border-purple-500/20 rounded-2xl p-5 shadow-xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              <h4 className="text-sm font-bold text-slate-200">Cycle Templates</h4>
            </div>
            <button onClick={() => setShowHelperTools(false)} className="p-1 text-slate-500 hover:text-slate-300 cursor-pointer"><X className="w-4 h-4" /></button>
          </div>

          {compounds.length > 0 && (
            <div className="flex gap-2">
              <input
                type="text"
                value={templateSaveName}
                onChange={e => setTemplateSaveName(e.target.value)}
                placeholder="Template name (e.g. Healing Stack, Bulk Season...)"
                className="flex-1 bg-slate-950/60 border border-slate-700/60 rounded-xl py-2 px-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-purple-500/60"
              />
              <button
                onClick={saveTemplate}
                disabled={!templateSaveName.trim()}
                className="px-3 py-2 bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 font-bold text-xs rounded-xl transition cursor-pointer disabled:opacity-40 flex items-center gap-1.5 whitespace-nowrap"
              >
                <Save className="w-3.5 h-3.5" /> Save Current Stack
              </button>
            </div>
          )}

          {savedTemplates.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">No saved templates yet. Add compounds and save your stack as a reusable template.</p>
          ) : (
            <div className="space-y-2">
              {savedTemplates.map((t, i) => (
                <div key={i} className="flex items-center justify-between gap-3 bg-slate-950/40 border border-slate-800 rounded-xl px-3.5 py-2.5">
                  <div>
                    <div className="text-sm font-bold text-slate-200">{t.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{t.compounds.length} compounds · {t.compounds.map(c => c.name.split(' ')[0]).join(', ')}</div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => applyTemplate(t)}
                      className="px-2.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold text-[10px] rounded-lg transition cursor-pointer"
                    >Apply</button>
                    <button
                      onClick={() => deleteTemplate(i)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition cursor-pointer rounded-lg"
                    ><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Data Import/Export */}
      {visibility.dataControls && showHelperTools && (
        <div className="bg-[#0f172a]/70 border border-[#1e293b]/80 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4" id="data-controls-panel">
          <div className="flex items-center justify-between border-b border-[#1e293b]/60 pb-3">
            <h4 className="text-sm font-semibold text-slate-200">Local Cycle Syncing & Backup Data</h4>
            {confirmingReset ? (
              <div className="flex items-center gap-1.5 bg-red-950/20 border border-red-500/20 p-1 rounded-lg text-[10px]">
                <span className="text-red-400 font-bold font-mono uppercase tracking-wider text-[9px] shrink-0">Wipe all cycles?</span>
                <button type="button" onClick={() => { triggerHaptic('warning'); onResetData(); setConfirmingReset(false); }}
                  className="px-2 py-0.5 bg-red-600 hover:bg-red-700 active:scale-[0.95] text-white rounded text-[9px] font-bold uppercase transition">Yes</button>
                <button type="button" onClick={() => { triggerHaptic('light'); setConfirmingReset(false); }}
                  className="px-2 py-0.5 bg-[#1e293b] hover:bg-slate-800 text-slate-300 border border-slate-700/50 rounded text-[9px] font-bold uppercase transition">No</button>
              </div>
            ) : (
              <button type="button" onClick={() => { triggerHaptic('warning'); setConfirmingReset(true); }}
                className="text-[10px] font-mono text-slate-500 hover:text-rose-400 font-semibold cursor-pointer flex items-center gap-1 transition"
                id="reset-cycle-btn">
                <Trash2 className="w-3 h-3" /> Reset All Cycles
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleExportData}
              className="py-2 px-4 bg-[#1e293b] hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700/50 cursor-pointer"
              id="export-db-btn">
              <FileDown className="w-3.5 h-3.5" /> {copiedData ? 'Copied!' : 'Export JSON'}
            </button>
          </div>
          <form onSubmit={handleImportSubmit} className="space-y-2">
            <textarea value={importString} onChange={(e) => setImportString(e.target.value)}
              placeholder="Paste exported JSON cycle array here..."
              className="w-full h-20 bg-[#1e293b]/30 border border-slate-800 rounded-xl p-3 text-xs text-slate-300 focus:outline-none focus:border-cyan-500/40 placeholder-slate-600"
              id="import-db-textarea" />
            {importError && <p className="text-xs text-rose-400 font-medium">{importError}</p>}
            {importSuccess && <p className="text-xs text-emerald-400 font-medium">✓ Import successful — cycles loaded.</p>}
            <button type="submit" className="py-2 px-4 bg-[#1e293b] hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700/50 cursor-pointer" id="submit-import">
              <FileUp className="w-3.5 h-3.5" /> Import & Apply
            </button>
          </form>
        </div>
      )}

      {/* Compound Cards Grid */}
      {compounds.length === 0 ? (
        <div className="bg-[#0f172a]/70 border border-[#1e293b]/80 rounded-2xl px-6 py-12 text-center flex flex-col items-center gap-4">
          <span className="flex items-center justify-center w-14 h-14 rounded-2xl bg-cyan-500/12 text-cyan-400"><Plus className="w-7 h-7" /></span>
          <div>
            <h4 className="text-lg font-black tracking-tight text-slate-100">Build your cycle</h4>
            <p className="text-sm text-slate-400 mt-1.5 max-w-xs mx-auto">Add your first compound — just a name, dose and how often.</p>
          </div>
          <button onClick={openFormNew}
            className="flex items-center gap-2 font-black uppercase tracking-wider text-sm px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 hover:brightness-110 shadow-[0_14px_30px_-14px_rgba(34,211,238,0.7)] transition cursor-pointer">
            <Plus className="w-4 h-4" /> Add Compound
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="compounds-list-grid">
            {compounds.map((comp) => (
              <CompoundCard
                key={comp.id}
                compound={comp}
                logs={logs}
                onEdit={openFormEdit}
                onDelete={onDeleteCompound}
                onUpdateCompound={onUpdateCompound}
                onOpenRetroLog={handleOpenRetroLog}
                onNavigateToTab={onNavigateToTab}
                compact
              />
            ))}
          </div>
          <button onClick={openFormNew}
            className="w-full flex items-center justify-center gap-2 font-black uppercase tracking-wider text-sm py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 hover:brightness-110 shadow-[0_14px_30px_-14px_rgba(34,211,238,0.7)] transition cursor-pointer">
            <Plus className="w-5 h-5" /> Add Compound
          </button>
        </>
      )}

      {/* Cycle History Timeline */}
      {showLegacyHelpers && (() => {
        const completed = compounds.filter(c => c.isCompleted);
        if (completed.length === 0) return null;
        return (
          <div className="bg-[#0f172a]/70 border border-[#1e293b]/80 rounded-2xl p-5 shadow-xl backdrop-blur-md">
            <div className="flex items-center gap-2 border-b border-[#1e293b]/60 pb-3 mb-4">
              <History className="w-4 h-4 text-slate-400" />
              <h4 className="text-sm font-bold text-slate-200">Completed Cycle History</h4>
              <span className="ml-auto text-[10px] text-slate-500 font-mono">{completed.length} cycle{completed.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="relative pl-4">
              <div className="absolute left-1 top-0 bottom-0 w-0.5 bg-slate-800" />
              <div className="space-y-3">
                {completed.slice().sort((a, b) => b.startDate.localeCompare(a.startDate)).map(c => {
                  const start = new Date(c.startDate + 'T00:00:00');
                  const end = new Date(start);
                  end.setDate(end.getDate() + c.durationWeeks * 7);
                  return (
                    <div key={c.id} className="relative flex items-start gap-3">
                      <div className="absolute -left-[13px] w-3 h-3 rounded-full border-2 border-slate-900 mt-0.5" style={{ backgroundColor: c.color }} />
                      <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-xl px-3 py-2.5">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-xs font-bold text-slate-200">{c.name}</span>
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 px-1.5 py-0.5 rounded font-mono font-bold">COMPLETED</span>
                        </div>
                        <div className="flex gap-3 mt-1 text-[10px] font-mono text-slate-500">
                          <span>{c.startDate}</span>
                          <span>→</span>
                          <span>{localDateISO(end)}</span>
                          <span className="text-slate-600">·</span>
                          <span>{c.durationWeeks}wk · {c.doseAmount}{c.doseUnit} {c.frequency.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* PCT Section */}
      {showLegacyHelpers && visibility.pct && (() => {
        if (suppressiveCompounds.length === 0) return null;
        return (
          <div className="bg-gradient-to-br from-[#0f172a] to-[#1e1b4b]/30 border border-indigo-500/20 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4" id="pct-suggestion-dashboard">
            <div className="border-b border-indigo-500/10 pb-3 flex justify-between items-center flex-wrap gap-2">
              <div>
                <span className="text-[10px] text-cyan-400 font-mono tracking-wider font-semibold uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" /> Endocrine Restoration Advisor
                </span>
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 mt-0.5">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  <span>Post-Cycle Therapy (PCT) Auto-Scheduler</span>
                </h4>
              </div>
              <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold">
                {pctCandidates.length} Cycle{pctCandidates.length !== 1 ? 's' : ''} Ready for HPTA Recovery
              </span>
            </div>
            {pctCandidates.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs border border-dashed border-[#1e293b] rounded-xl max-w-xl mx-auto space-y-1">
                <Shield className="w-6 h-6 text-indigo-500/40 mx-auto mb-1" />
                <p className="font-semibold text-slate-400">Restoration Systems Standing By</p>
                <p className="text-slate-500 text-[11px]">Schedules are active. Once a suppressive cycle's duration limit is reached, or you click the checkmark on its card to complete it early, custom PCT suggestions will activate automatically here.</p>
              </div>
            ) : (
              <div className="space-y-4 pt-1">
                <p className="text-slate-400 text-xs leading-normal">The following suppressive compounds have completed or elapsed their duration limits. Sustaining natural pituitary signals (LH / FSH) requires entering an endocrine restoration block to safeguard organic systems and preserve lean gains.</p>
                <div className="space-y-3">
                  {pctCandidates.map((comp) => {
                    const endDate = getEndDate(comp.startDate, comp.durationWeeks);
                    const endDateStr = endDate ? localDateISO(endDate) : comp.startDate;
                    return (
                      <div key={`pct-sugg-${comp.id}`} className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 hover:border-indigo-500/30 transition-colors" id={`pct-row-container-${comp.id}`}>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: comp.color }} />
                            <h5 className="font-bold text-xs sm:text-sm text-slate-200">{comp.name}</h5>
                            <span className="text-[9px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono px-1.5 py-0.5 rounded uppercase font-bold">{comp.isCompleted ? 'Manually Finished' : 'Duration Elapsed'}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-normal">
                            Active Phase: <span className="font-mono text-slate-300 font-semibold">{comp.startDate}</span> to <span className="font-mono text-slate-300 font-semibold">{endDateStr}</span> ({comp.durationWeeks} Weeks total).
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 w-full lg:w-auto shrink-0">
                          <button onClick={() => onAddCompound({ id: `pct-nolva-${Date.now()}`, name: `Nolvadex (Tamoxifen) • PCT for ${comp.name}`, type: 'compound', doseAmount: 20, doseUnit: 'mg', frequency: 'daily', startDate: endDateStr, durationWeeks: 4, color: '#ec4899', isCompleted: false, steroidForm: 'pill', pillSizeMg: 20, notes: `Post-Cycle Therapy recovery block auto-suggested following completion/termination of ${comp.name}.` })}
                            className="flex-1 lg:flex-initial py-1.5 px-3 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 hover:border-pink-500/40 text-pink-300 hover:text-pink-200 font-bold rounded-xl text-[10px] md:text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                            id={`add-pct-nolva-btn-${comp.id}`}>
                            <Heart className="w-3.5 h-3.5 text-pink-400" /><span>Nolvadex (20mg/day, 4wk)</span>
                          </button>
                          <button onClick={() => onAddCompound({ id: `pct-clomid-${Date.now()}`, name: `Clomid (Clomiphene) • PCT for ${comp.name}`, type: 'compound', doseAmount: 50, doseUnit: 'mg', frequency: 'daily', startDate: endDateStr, durationWeeks: 4, color: '#a855f7', isCompleted: false, steroidForm: 'pill', pillSizeMg: 50, notes: `Gonadotropin stimulus Post-Cycle Therapy block scheduled post-${comp.name} cycle.` })}
                            className="flex-1 lg:flex-initial py-1.5 px-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 text-purple-300 hover:text-purple-200 font-bold rounded-xl text-[10px] md:text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                            id={`add-pct-clomid-btn-${comp.id}`}>
                            <Shield className="w-3.5 h-3.5 text-purple-400" /><span>Clomid (50mg/day, 4wk)</span>
                          </button>
                          <button onClick={() => openFormWithPrefill({ name: 'Nolvadex / Clomid Suite', type: 'compound', doseAmount: 20, doseUnit: 'mg', frequency: 'daily', startDate: endDateStr, durationWeeks: 4, color: '#6366f1', steroidForm: 'pill', pillSizeMg: 20, notes: `Custom post-cycle therapy suite designated for the ${comp.name} recovery phase.` })}
                            className="flex-1 lg:flex-initial py-1.5 px-3 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-300 font-bold rounded-xl text-[10px] md:text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                            id={`add-pct-custom-btn-${comp.id}`}>
                            <Plus className="w-3.5 h-3.5 text-slate-400" /><span>Custom PCT</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Mitigations & Supplement Presets */}
      {showLegacyHelpers && (
      <div className="bg-[#0f172a]/70 border border-[#1e293b]/80 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4" id="cycle-mitigations-panel">
        <div className="border-b border-[#1e293b]/60 pb-3">
          <span className="text-xs text-indigo-400 font-mono tracking-wider font-semibold uppercase">Auto-Mitigation Protocol Engine</span>
          <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 mt-0.5">
            <Heart className="w-4 h-4 text-rose-400" />
            <span>Cycle Support & Side Effect Defenses</span>
          </h4>
        </div>

        {/* Supplement preset suites */}
        <div className="bg-[#1e293b]/20 border border-[#1e293b]/45 rounded-2xl p-4.5 space-y-3.5" id="supplement-categories-presets">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Suggested Support Preset Suites</h5>
              <p className="text-[11px] text-slate-400 mt-0.5">Activate clinical supplement formulas to reduce organ load, blood pressure, and lift strain.</p>
            </div>
            <span className="text-[9px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded font-mono font-bold border border-cyan-500/10">PREMIUM PROTOCOLS</span>
          </div>

          {(() => {
            const { hasOral, hasInjectable, hasAromatizing, hasJointStrain, hasSuppressive, hasStimulant, liverSupportInCycle, vitaminsInCycle, jointHealthInCycle, estrogenControlInCycle, endocrineShieldInCycle, jitterRescueInCycle } = cycleTriggers;
            const isCycleEmpty = compounds.length === 0;
            const allSuites = [
              { id: 'liver-support', category: 'Liver Support', title: 'TUDCA & NAC', imgSrc: protocolIcon('liver'), themeColorText: 'text-cyan-400', themeColorBtn: 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/20 text-cyan-300', themeColorHoverBorder: 'hover:border-cyan-500/30', isTriggered: hasOral, isAlreadyInCycle: liverSupportInCycle, compoundPreset: { name: 'TUDCA + NAC Liver Protection', type: 'supplement', doseAmount: 1100, doseUnit: 'mg', frequency: 'daily', durationWeeks: 8, color: '#ec4899', isCompleted: false, steroidForm: 'pill', pillSizeMg: 500, notes: 'Oral hepatotoxicity guard.' } },
              { id: 'vitamins', category: 'Vitamins', title: 'CoQ10 + Omega-3', imgSrc: protocolIcon('coq10'), themeColorText: 'text-purple-400', themeColorBtn: 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20 text-purple-300', themeColorHoverBorder: 'hover:border-purple-500/30', isTriggered: hasInjectable || isCycleEmpty, isAlreadyInCycle: vitaminsInCycle, compoundPreset: { name: 'CoQ10 + Omega-3 Vital Complex', type: 'supplement', doseAmount: 2000, doseUnit: 'mg', frequency: 'daily', durationWeeks: 12, color: '#a855f7', isCompleted: false, notes: 'Supports healthy fluid pressure and optimizes lipid ratios during active cycles.' } },
              { id: 'joint-health', category: 'Joint Health', title: 'Glucosamine Complex', imgSrc: protocolIcon('joint'), themeColorText: 'text-emerald-400', themeColorBtn: 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-300', themeColorHoverBorder: 'hover:border-emerald-500/30', isTriggered: hasJointStrain, isAlreadyInCycle: jointHealthInCycle, compoundPreset: { name: 'Glucosamine + Joint MSM Cure', type: 'supplement', doseAmount: 1500, doseUnit: 'mg', frequency: 'daily', durationWeeks: 12, color: '#10b981', isCompleted: false, notes: 'Preserves joint synovial fluid and connective tissues.' } },
              { id: 'estrogen-control', category: 'Estrogen Control', title: 'Arimidex AI Shield', imgSrc: protocolIcon('estrogen'), themeColorText: 'text-amber-400', themeColorBtn: 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20 text-amber-300', themeColorHoverBorder: 'hover:border-amber-500/30', isTriggered: hasAromatizing, isAlreadyInCycle: estrogenControlInCycle, compoundPreset: { name: 'Arimidex (Anastrozole) Estrogen Control', type: 'supplement', doseAmount: 0.5, doseUnit: 'mg', frequency: 'eod', durationWeeks: 12, color: '#f59e0b', isCompleted: false, steroidForm: 'pill', pillSizeMg: 1, notes: 'Blocks conversion of excess androgens into Estradiol.' } },
              { id: 'endocrine-shield', category: 'Endocrine Support', title: 'HCG Endocrine Shield', imgSrc: protocolIcon('endocrine'), themeColorText: 'text-indigo-400', themeColorBtn: 'bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/20 text-indigo-300', themeColorHoverBorder: 'hover:border-indigo-500/30', isTriggered: hasSuppressive, isAlreadyInCycle: endocrineShieldInCycle, compoundPreset: { name: 'hCG Endocrine Shield', type: 'peptide', doseAmount: 250, doseUnit: 'IU', frequency: 'twice_weekly', durationWeeks: 12, color: '#6366f1', isCompleted: false, notes: 'Endogenous LH agonist. Prevents testicular cellular shutdown.' } },
              { id: 'jitter-rescue', category: 'CNS Calm Support', title: 'Theanine & Ashwagandha', imgSrc: protocolIcon('calm'), themeColorText: 'text-rose-400', themeColorBtn: 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 text-rose-300', themeColorHoverBorder: 'hover:border-rose-500/30', isTriggered: hasStimulant, isAlreadyInCycle: jitterRescueInCycle, compoundPreset: { name: 'Theanine & Ashwagandha Synergy', type: 'supplement', doseAmount: 1, doseUnit: 'mg', frequency: 'daily', durationWeeks: 8, color: '#f43f5e', isCompleted: false, steroidForm: 'pill', pillSizeMg: 1, notes: 'Soothes elevated cortisol and CNS jitters from thermogenic compounds.' } },
            ];
            const visibleSuites = allSuites.filter(s => !s.isAlreadyInCycle && (isCycleEmpty ? ['liver-support', 'vitamins', 'joint-health'].includes(s.id) : s.isTriggered));
            if (visibleSuites.length === 0) {
              return (
                <div className="bg-cyan-950/15 border border-cyan-500/25 p-4.5 rounded-2xl flex items-center gap-3.5 text-left max-w-2xl mx-auto" id="all-presets-added-card">
                  <div className="p-2.5 bg-cyan-950/60 border border-cyan-500/20 rounded-xl h-fit shrink-0"><CheckCircle className="w-5 h-5 text-cyan-400" /></div>
                  <div><span className="text-xs font-bold text-cyan-200 block">All Suggested Protectants Instantiated</span><p className="text-[11px] text-slate-400 leading-normal mt-0.5">Your current active cycle is fully safeguarded! All dynamic support suites matching your compounds have been added to your cycle.</p></div>
                </div>
              );
            }
            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {visibleSuites.map((suite) => (
                  <div key={suite.id} className={`bg-[#0f172a]/80 border border-slate-800 p-3 rounded-xl flex items-center gap-3.5 ${suite.themeColorHoverBorder} transition-all duration-300`} id={`preset-card-${suite.id}`}>
                    <img src={suite.imgSrc} alt={`${suite.category} Icon`} className="w-12 h-12 rounded-lg bg-black/40 border border-[#1e293b]/80 object-cover shrink-0" referrerPolicy="no-referrer" />
                    <div className="space-y-1 flex-1 text-left">
                      <span className={`text-[9px] font-mono font-bold tracking-wider uppercase block ${suite.themeColorText}`}>{suite.category}</span>
                      <span className="text-xs font-extrabold text-slate-200 block">{suite.title}</span>
                      <button type="button" onClick={() => onAddCompound({ id: `supp-${suite.id}-${Date.now()}`, ...suite.compoundPreset, startDate: localDateISO() } as any)}
                        className={`text-[10px] px-2.5 py-0.5 rounded-lg border font-bold transition cursor-pointer inline-block ${suite.themeColorBtn}`}
                        id={`add-preset-${suite.id}-btn`}>+ Add Preset</button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Risk mitigation cards */}
        {(() => {
          const recs: { id: string; concern: string; negatives: string; supplement: string; dosage: string; protocol: string; icon: React.ReactNode; badgeColor: string }[] = [];
          const hasPillSteroid = compounds.some(c => (c.type === 'steroid' || c.type === 'compound') && c.steroidForm === 'pill');
          const hasOilSteroid = compounds.some(c => (c.type === 'steroid' || c.type === 'compound') && c.steroidForm === 'oil');
          const hasGLP1 = compounds.some(c => c.name.toLowerCase().includes('sema') || c.name.toLowerCase().includes('tira') || c.name.toLowerCase().includes('glp'));
          const hasGH = compounds.some(c => c.name.toLowerCase().includes('ipam') || c.name.toLowerCase().includes('cjc') || c.name.toLowerCase().includes('gh'));
          const hasTanning = compounds.some(c => c.name.toLowerCase().includes('melan'));
          if (hasPillSteroid) recs.push({ id: 'liver-support', concern: 'Oral Hepatotoxicity & Liver Load', negatives: '17-alpha-alkylated oral chemical compounds pass through the liver, stressing metabolic cellular walls and quickly elevating AST/ALT enzyme rates.', supplement: 'TUDCA + N-Acetyl Cysteine (NAC)', dosage: 'TUDCA: 250-500 mg, NAC: 600-1200 mg daily', protocol: 'Take daily split morning/evening with major caloric meals. Avoid regular alcohol use during this active cycle block.', icon: <Activity className="w-5 h-5 text-rose-400" />, badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20' });
          if (hasOilSteroid) recs.push({ id: 'cardio-lipid', concern: 'Lipid Ratios & Red Blood Cell Density', negatives: 'Injected anabolic oil suspensions elevate vascular friction, lower healthy HDL protectants, and trigger excess red cell production (hematocrit thickness).', supplement: 'Omega-3 Fish Oil + Ubiquinol CoQ10', dosage: 'Fish Oil: 2000-3000 mg, CoQ10: 100-200 mg daily', protocol: 'Supports healthy vascular elasticity and fluid dynamics. Ingest 3.5+ liters of clean structural water daily.', icon: <Shield className="w-5 h-5 text-amber-400" />, badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20' });
          if (hasGLP1) recs.push({ id: 'glp-gi', concern: 'Gastric Slowdown & Visceral Dehydration', negatives: 'Slowing stomach motility stops healthy water absorption, provokes dry bowel blockage, and can lead to immediate lean muscle tissue wasting.', supplement: 'Psyllium Husk Fiber + Active Electrolytes + Whey Protein', dosage: 'Fiber: 5-10 g, Whey: 0.7g per lb weight daily', protocol: 'Assures gastrointestinal motility, maintains muscular nitrogen balance, and keeps core hydration indexes topped up.', icon: <Apple className="w-5 h-5 text-emerald-400" />, badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' });
          if (hasGH) recs.push({ id: 'gh-sensitivity', concern: 'Insulin Resistance & Water Edema', negatives: 'Synthetic growth hormones can block cell receptor sites, leading to blood glucose spikes and sodium-retentive hand/ankle puffiness.', supplement: 'Berberine or Alpha Lipoic Acid (ALA)', dosage: 'Berberine: 500 mg (before calorie-dense meals)', protocol: 'Optimizes glucose uptake directly, limiting insulin stress and stabilizing blood sugar baselines.', icon: <Activity className="w-5 h-5 text-indigo-400" />, badgeColor: 'bg-indigo-500/10 text-indigo-400 border-[#6366f1]/20' });
          if (hasTanning) recs.push({ id: 'tanning-pigment', concern: 'Receptive Skin Spatting & Nervous Nausea', negatives: 'MC4 receptor signals provoke central nervous nausea flareups and trigger naevi freckles to undergo solar hyper-pigmentation.', supplement: 'Ginger Root Extract + Broad Spectrum SPF 50 Block', dosage: 'Ginger: 500-1000 mg (30-mins pre-injection)', protocol: 'Sip ginger infusion or tablets to block stomach vagus nerves. Strict SPF usage safeguards moles from irregular darkening.', icon: <Sun className="w-5 h-5 text-cyan-400" />, badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' });
          if (recs.length === 0) return (
            <div className="text-center py-8 text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl max-w-lg mx-auto">
              <Info className="w-6 h-6 text-slate-600 mx-auto mb-2" />
              <p className="font-semibold text-slate-400">No Risk Warnings Detected</p>
              <p className="text-slate-600 mt-1">Formulate custom steroids, peptides or oral compounds. The helper engine will automatically compile required supplement offset support formulas here.</p>
            </div>
          );
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="mitigations-cards-container">
              {recs.map((item) => (
                <div key={item.id} className="bg-[#1e293b]/25 border border-slate-800 p-4.5 rounded-2xl flex gap-3.5 hover:border-slate-700/60 transition-all duration-300">
                  <div className="p-2.5 bg-[#0f172a]/80 border border-slate-800 rounded-xl h-fit shadow-md">{item.icon}</div>
                  <div className="space-y-1.5 flex-1">
                    <div className="flex justify-between items-start gap-2 flex-wrap sm:flex-nowrap">
                      <h5 className="text-xs font-bold text-slate-200">{item.concern}</h5>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono tracking-wider border uppercase scale-95 origin-right ${item.badgeColor}`}>Side Effect Risk</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal"><strong className="text-rose-400 font-normal">Negatives (Minuses):</strong> {item.negatives}</p>
                    <div className="bg-[#0f172a]/60 border border-slate-800/60 p-2.5 rounded-xl space-y-1 mt-2 text-[11px]">
                      <div className="text-emerald-400 font-bold flex items-center gap-1 font-mono text-[10px] uppercase"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />Supplement Mitigation (Pluses)</div>
                      <p className="text-slate-200 font-semibold">{item.supplement} • <span className="text-cyan-400 font-mono text-[10px]">{item.dosage}</span></p>
                      <p className="text-slate-500 font-sans text-[10px] italic leading-normal mt-0.5">Protocol: {item.protocol}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}
      </div>
      )}

      <CompoundFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        editingCompound={editingCompound}
        prefill={formPrefill ?? undefined}
        onAdd={onAddCompound}
        onUpdate={onUpdateCompound}
        activeFromLibrary={activeFromLibrary}
        clearActiveFromLibrary={clearActiveFromLibrary}
        onOpenRetroLog={handleOpenRetroLog}
        onNavigateToTab={onNavigateToTab}
      />

      <RetroactiveLogModal
        compound={retroactiveCompId ? (compounds.find(c => c.id === retroactiveCompId) ?? null) : null}
        logs={logs}
        onLogDose={onLogDose}
        onBatchLogDoses={onBatchLogDoses}
        onUndoDose={onUndoDose}
        onUpdateCompound={onUpdateCompound}
        onClose={() => setRetroactiveCompId(null)}
      />
    </div>
  );
}
