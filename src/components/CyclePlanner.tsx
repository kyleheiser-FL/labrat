import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2, Calendar, FileDown, FileUp, AlertTriangle, CheckSquare, Sparkles, HelpCircle, ArrowLeftRight, Save, Info, Edit, Check, Heart, Shield, Apple, Sun, Activity } from 'lucide-react';
import { Compound, LibraryItem } from '../types';
import { PEPTIDE_LIBRARY } from '../data/peptides';

interface CyclePlannerProps {
  compounds: Compound[];
  onAddCompound: (compound: Compound) => void;
  onUpdateCompound: (compound: Compound) => void;
  onDeleteCompound: (id: string) => void;
  onImportData: (importDataString: string) => boolean;
  onResetData: () => void;
  activeFromLibrary?: LibraryItem | null;
  clearActiveFromLibrary?: () => void;
}

const PRESET_COLORS = [
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#6366f1', // Indigo
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#a855f7', // Purple
  '#84cc16', // Lime
];

export default function CyclePlanner({
  compounds,
  onAddCompound,
  onUpdateCompound,
  onDeleteCompound,
  onImportData,
  onResetData,
  activeFromLibrary,
  clearActiveFromLibrary
}: CyclePlannerProps) {
  // Form modal triggers
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields State
  const [name, setName] = useState('');
  const [type, setType] = useState<'peptide' | 'compound' | 'supplement' | 'steroid'>('peptide');
  const [vialSizeMg, setVialSizeMg] = useState('');
  const [bacWaterMl, setBacWaterMl] = useState('');
  const [doseAmount, setDoseAmount] = useState('250');
  const [doseUnit, setDoseUnit] = useState<'mcg' | 'mg' | 'IU' | 'ml'>('mcg');
  const [frequency, setFrequency] = useState<'daily' | 'eod' | 'twice_weekly' | 'weekly' | 'custom'>('daily');
  const [customDays, setCustomDays] = useState('3');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [durationWeeks, setDurationWeeks] = useState(8);
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);

  // Steroid delivery fields
  const [steroidForm, setSteroidForm] = useState<'oil' | 'pill'>('oil');
  const [pillSizeMg, setPillSizeMg] = useState('10');
  const [oilConcMgMl, setOilConcMgMl] = useState('250');

  // Import/Export section trigger
  const [showDataControls, setShowDataControls] = useState(false);
  const [importString, setImportString] = useState('');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState(false);
  const [copiedData, setCopiedData] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Suggestions list matched from PEPTIDE_LIBRARY
  const suggestions = name.trim()
    ? PEPTIDE_LIBRARY.filter(item =>
        item.name.toLowerCase().includes(name.toLowerCase()) ||
        item.chemicalName?.toLowerCase().includes(name.toLowerCase())
      )
    : [];

  const handleSelectSuggestion = (item: LibraryItem) => {
    triggerAutoFill(item);
    setShowSuggestions(false);
  };

  // Auto-fill form from library trigger
  const triggerAutoFill = (item: LibraryItem) => {
    setName(item.name);
    
    // Resolve precise dosage, unit, form, and size based on specific compounds
    let resolvedType: 'peptide' | 'compound' | 'supplement' | 'steroid' = 'compound';
    let resolvedForm: 'oil' | 'pill' = 'oil';
    let resolvedPillSize = '10';
    let resolvedOilConc = '250';
    let resolvedDose = '250';
    let resolvedUnit: 'mcg' | 'mg' | 'IU' | 'ml' = 'mg';

    // 1. Resolve Delivery Form
    if (item.deliveryForm === 'peptide') {
      resolvedType = 'peptide';
      resolvedUnit = 'mcg'; // default for peptides
    } else if (item.deliveryForm === 'oil') {
      resolvedType = 'steroid';
      resolvedForm = 'oil';
    } else if (item.deliveryForm === 'pill') {
      resolvedForm = 'pill';
      if (item.id === 'tudca-liver-guard' || item.id === 'nac-antioxidant') {
        resolvedType = 'supplement';
      } else if (item.category === 'muscle') {
        resolvedType = 'steroid';
      } else {
        resolvedType = 'compound';
      }
    }

    // 2. Exact Custom Chemical Blueprint Mapping (Fulfills exact professional specs)
    const idMap: Record<string, { dose: string; unit: 'mcg' | 'mg' | 'IU' | 'ml'; pillSize?: string; oilConc?: string }> = {
      'bpc-157': { dose: '250', unit: 'mcg' },
      'tb-500': { dose: '2.5', unit: 'mg' },
      'semaglutide': { dose: '0.25', unit: 'mg' },
      'tirzepatide': { dose: '2.5', unit: 'mg' },
      'retatrutide': { dose: '1', unit: 'mg' },
      'ipamorelin': { dose: '200', unit: 'mcg' },
      'cjc-1295-no-dac': { dose: '100', unit: 'mcg' },
      'ghk-cu': { dose: '2', unit: 'mg' },
      'human-growth-hormone': { dose: '2', unit: 'IU' },
      'igf-1-lr3': { dose: '50', unit: 'mcg' },
      'pt-141': { dose: '1', unit: 'mg' },
      'tesamorelin': { dose: '2', unit: 'mg' },
      'epitalon': { dose: '5', unit: 'mg' },
      'melanotan-ii': { dose: '250', unit: 'mcg' },
      'testosterone-cypionate': { dose: '250', unit: 'mg', oilConc: '250' },
      'testosterone-enanthate': { dose: '250', unit: 'mg', oilConc: '250' },
      'testosterone-propionate': { dose: '100', unit: 'mg', oilConc: '100' },
      'deca-durabolin': { dose: '200', unit: 'mg', oilConc: '250' },
      'trenbolone-acetate': { dose: '100', unit: 'mg', oilConc: '100' },
      'primobolan-enanthate': { dose: '100', unit: 'mg', oilConc: '100' },
      'masteron-propionate': { dose: '100', unit: 'mg', oilConc: '100' },
      'anavar-oxandrolone': { dose: '20', unit: 'mg', pillSize: '10' },
      'dianabol-methandrostenolone': { dose: '25', unit: 'mg', pillSize: '10' },
      'winstrol-stanozolol': { dose: '25', unit: 'mg', pillSize: '10' },
      'clenbuterol-hydrochloride': { dose: '40', unit: 'mcg', pillSize: '40' },
      'tudca-liver-guard': { dose: '250', unit: 'mg', pillSize: '250' },
      'nac-antioxidant': { dose: '600', unit: 'mg', pillSize: '600' },
      'arimidex-anastrozole': { dose: '0.5', unit: 'mg', pillSize: '1' },
      'nolvadex-tamoxifen': { dose: '20', unit: 'mg', pillSize: '20' },
    };

    if (idMap[item.id]) {
      const blueprint = idMap[item.id];
      resolvedDose = blueprint.dose;
      resolvedUnit = blueprint.unit;
      if (blueprint.pillSize) resolvedPillSize = blueprint.pillSize;
      if (blueprint.oilConc) resolvedOilConc = blueprint.oilConc;
    } else {
      // General safety parsing fallback
      const typical = item.typicalDosage.toLowerCase();
      if (typical.includes('mcg')) {
        resolvedUnit = 'mcg';
      } else if (typical.includes('iu')) {
        resolvedUnit = 'IU';
      } else if (typical.includes('ml')) {
        resolvedUnit = 'ml';
      } else {
        resolvedUnit = 'mg';
      }
      
      const digMatch = typical.match(/(\d+(?:\.\d+)?)/);
      if (digMatch) resolvedDose = digMatch[1];
    }

    setType(resolvedType);
    setSteroidForm(resolvedForm);
    setDoseAmount(resolvedDose);
    setDoseUnit(resolvedUnit);
    setPillSizeMg(resolvedPillSize);
    setOilConcMgMl(resolvedOilConc);

    // Set frequency matching library item description
    const freq = item.frequencyText.toLowerCase();
    if (freq.includes('twice weekly') || freq.includes('2 times') || freq.includes('twice a week')) {
      setFrequency('twice_weekly');
    } else if (freq.includes('weekly')) {
      setFrequency('weekly');
    } else if (freq.includes('every other day')) {
      setFrequency('eod');
    } else {
      setFrequency('daily');
    }

    // Try extracting reconstitution for peptides
    if (item.reconstitutionText && resolvedType === 'peptide') {
      const vMatch = item.reconstitutionText.match(/(\d+)\s*mg/i);
      const wMatch = item.reconstitutionText.match(/(\d+(?:\.\d+)?)\s*ml/i);
      if (vMatch) setVialSizeMg(vMatch[1]);
      if (wMatch) setBacWaterMl(wMatch[1]);
    } else {
      setVialSizeMg('');
      setBacWaterMl('');
    }

    setNotes(`Autofilled from scientific library entry. Suggested: ${item.suggestedCycleWeeks}`);
    setShowForm(true);
    setEditingId(null);
  };

  // Listen to incoming library additions passed down as activeFromLibrary props using a proper stable React.useEffect
  React.useEffect(() => {
    if (activeFromLibrary) {
      triggerAutoFill(activeFromLibrary);
      if (clearActiveFromLibrary) {
        clearActiveFromLibrary();
      }
    }
  }, [activeFromLibrary, clearActiveFromLibrary]);

  // Handle edit selection
  const handleStartEdit = (comp: Compound) => {
    setEditingId(comp.id);
    setName(comp.name);
    setType(comp.type);
    setVialSizeMg(comp.vialSizeMg ? comp.vialSizeMg.toString() : '');
    setBacWaterMl(comp.bacWaterMl ? comp.bacWaterMl.toString() : '');
    setDoseAmount(comp.doseAmount.toString());
    setDoseUnit(comp.doseUnit);
    setFrequency(comp.frequency);
    setCustomDays(comp.customDays ? comp.customDays.toString() : '3');
    setStartDate(comp.startDate);
    setDurationWeeks(comp.durationWeeks);
    setNotes(comp.notes || '');
    setColor(comp.color);
    setSteroidForm(comp.steroidForm || 'oil');
    setPillSizeMg(comp.pillSizeMg ? comp.pillSizeMg.toString() : '10');
    setOilConcMgMl(comp.oilConcMgMl ? comp.oilConcMgMl.toString() : '250');
    setShowForm(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const data: Compound = {
      id: editingId || crypto.randomUUID(),
      name: name.trim(),
      type,
      vialSizeMg: type === 'peptide' && vialSizeMg ? parseFloat(vialSizeMg) : undefined,
      bacWaterMl: type === 'peptide' && bacWaterMl ? parseFloat(bacWaterMl) : undefined,
      doseAmount: parseFloat(doseAmount) || 0,
      doseUnit,
      frequency,
      customDays: frequency === 'custom' ? parseInt(customDays) || 3 : undefined,
      startDate,
      durationWeeks: parseInt(durationWeeks as any) || 8,
      notes: notes.trim(),
      color,
      isCompleted: editingId ? compounds.find(c => c.id === editingId)?.isCompleted : false,
      steroidForm: (type === 'steroid' || type === 'supplement' || type === 'compound') ? steroidForm : undefined,
      pillSizeMg: (type === 'steroid' || type === 'supplement' || type === 'compound') && steroidForm === 'pill' && pillSizeMg ? parseFloat(pillSizeMg) : undefined,
      oilConcMgMl: (type === 'steroid' || type === 'supplement' || type === 'compound') && steroidForm === 'oil' && oilConcMgMl ? parseFloat(oilConcMgMl) : undefined
    };

    if (editingId) {
      onUpdateCompound(data);
    } else {
      onAddCompound(data);
    }

    // Reset Form Fields
    setName('');
    setType('peptide');
    setVialSizeMg('');
    setBacWaterMl('');
    setDoseAmount('250');
    setDoseUnit('mcg');
    setFrequency('daily');
    setCustomDays('3');
    setStartDate(new Date().toISOString().split('T')[0]);
    setDurationWeeks(8);
    setNotes('');
    setColor(PRESET_COLORS[0]);
    setSteroidForm('oil');
    setPillSizeMg('10');
    setOilConcMgMl('250');
    setShowForm(false);
    setEditingId(null);
  };

  const handleExportData = () => {
    const rawData = JSON.stringify(compounds, null, 2);
    navigator.clipboard.writeText(rawData);
    setCopiedData(true);
    setTimeout(() => setCopiedData(false), 2000);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setImportError('');
    setImportSuccess(false);

    try {
      const parsed = JSON.parse(importString);
      if (!Array.isArray(parsed)) {
        setImportError('Invalid JSON formatting: Data must be a compound list array.');
        return;
      }
      
      const success = onImportData(importString);
      if (success) {
        setImportSuccess(true);
        setImportString('');
        setTimeout(() => setImportSuccess(false), 3000);
      } else {
        setImportError('Could not process import array. Verification failed.');
      }
    } catch (err: any) {
      setImportError(`Failed parsing JSON: ${err?.message || 'Syntax error'}`);
    }
  };

  // Core Math - calculating cycle weeks timeline
  // Draw week blocks: Gantt-style
  const renderGanttTimeline = () => {
    if (compounds.length === 0) {
      return (
        <div className="text-center py-12 text-slate-500 text-xs">
          No compounds configured. Click "Formulate New Compound" above to map out a sequence.
        </div>
      );
    }

    // Determine the max week duration among active compounds
    const maxWeeks = Math.max(12, ...compounds.map(c => c.durationWeeks));
    const weeksHeader = Array.from({ length: maxWeeks }).map((_, i) => i + 1);

    return (
      <div className="overflow-x-auto w-full pt-2" id="gantt-chart-viewport">
        <div className="min-w-[700px] space-y-3.5">
          {/* Week Headers */}
          <div className="grid grid-cols-12 gap-1 text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold border-b border-[#1e293b] pb-2 text-center">
            <div className="col-span-3 text-left pl-2">Chemical / Peptide</div>
            <div className="col-span-9 grid grid-flow-col auto-cols-fr gap-1">
              {weeksHeader.map((w) => (
                <div key={`w-header-${w}`} className="border-r border-slate-800/40 last:border-0">W{w}</div>
              ))}
            </div>
          </div>

          {/* Compound Timelines */}
          {compounds.map((comp) => (
            <div key={`gantt-row-${comp.id}`} className="grid grid-cols-12 gap-1 items-center py-1 hover:bg-[#1e293b]/10 rounded" id={`gantt-row-${comp.id}`}>
              {/* Product Label */}
              <div className="col-span-3 text-xs font-semibold text-slate-200 pl-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full inline-block shrink-0" style={{ backgroundColor: comp.color }}></span>
                  <span className="truncate">{comp.name}</span>
                </div>
                <div className="text-[9px] font-mono text-slate-500 pl-4">
                  {comp.doseAmount}{comp.doseUnit} • {comp.frequency.replace('_', ' ')}
                </div>
              </div>

              {/* Weekly bar chart blocks */}
              <div className="col-span-9 grid grid-flow-col auto-cols-fr gap-1 h-7">
                {weeksHeader.map((w, idx) => {
                  const isActive = idx < comp.durationWeeks;
                  return (
                    <div 
                      key={`gantt-block-${comp.id}-${w}`} 
                      className={`relative rounded-md flex items-center justify-center transition-all ${
                        isActive 
                          ? 'border' 
                          : 'bg-slate-900/10 border border-slate-900/20'
                      }`}
                      style={{ 
                        backgroundColor: isActive ? `${comp.color}15` : 'transparent',
                        borderColor: isActive ? `${comp.color}55` : 'transparent'
                      }}
                    >
                      {isActive && (
                        <div 
                          className="absolute inset-y-0.5 left-0.5 right-0.5 rounded"
                          style={{ backgroundColor: `${comp.color}25` }}
                        ></div>
                      )}
                      
                      {/* Interactive hover tooltip representing dose count on that week */}
                      {isActive && idx === 0 && (
                        <span className="text-[8px] font-mono text-slate-300 font-bold z-10">Start</span>
                      )}
                      {isActive && idx === comp.durationWeeks - 1 && (
                        <span className="text-[8px] font-mono text-slate-300 font-bold z-10">End</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6" id="planner-main-container">
      {/* Top action bar buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
          <span>Cycle Administration Architecture</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-[#1e293b]/45 text-slate-400 border border-slate-800">
            {compounds.length} Compounds Actioned
          </span>
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowDataControls(!showDataControls)}
            className="p-2 bg-[#1e293b] hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-700/50 cursor-pointer"
            id="toggle-data-mgmt"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" /> Direct Data Sync
          </button>
          <button
            onClick={() => {
              setEditingId(null);
              setName('');
              setVialSizeMg('');
              setBacWaterMl('');
              setDoseAmount('250');
              setDoseUnit('mcg');
              setFrequency('daily');
              setStartDate(new Date().toISOString().split('T')[0]);
              setDurationWeeks(8);
              setNotes('');
              setShowForm(true);
            }}
            className="py-2 px-4 bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-500/10"
            id="new-formulate-btn"
          >
            <Plus className="w-4 h-4 text-slate-950" strokeWidth={3} /> Formulate Compound
          </button>
        </div>
      </div>

      {/* Data Import/Export Segment */}
      {showDataControls && (
        <div className="bg-[#0f172a]/70 border border-[#1e293b]/80 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4" id="data-controls-panel">
          <div className="flex items-center justify-between border-b border-[#1e293b]/60 pb-3">
            <h4 className="text-sm font-semibold text-slate-200">Local Cycle Syncing & Backup Data</h4>
            <button 
              onClick={onResetData}
              className="px-2.5 py-1 bg-red-950/20 hover:bg-red-950/60 text-red-400 border border-red-500/10 hover:border-red-500/20 text-[10px] font-mono rounded transition cursor-pointer"
              id="reset-cycle-btn"
            >
              Reset All Cycle Data
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FileDown className="w-4 h-4 text-cyan-400" /> Export Cycle Database (JSON)
              </span>
              <p className="text-[11px] text-slate-500">Copy your local database of chemicals to easily load them on another PC or web browser.</p>
              <button
                onClick={handleExportData}
                className="py-2 px-4 bg-[#1e293b] hover:bg-slate-800 text-slate-100 rounded-xl text-xs font-semibold border border-slate-700/60 transition flex items-center gap-1.5"
                id="export-db-btn"
              >
                {copiedData ? <span className="text-emerald-400 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Copied Json!</span> : 'Copy JSON Database to Clipboard'}
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FileUp className="w-4 h-4 text-indigo-400" /> Import Cycle Database (JSON)
              </span>
              <p className="text-[11px] text-slate-500">Paste your exported cycle database string below to restore compounds and schedule items.</p>
              <textarea
                value={importString}
                onChange={(e) => setImportString(e.target.value)}
                placeholder="Paste JSON array here..."
                className="w-full h-16 bg-[#1e293b]/45 border border-slate-700/60 rounded-xl p-2 text-[10px] font-mono text-slate-300 focus:outline-none focus:border-cyan-500/80"
                id="import-db-textarea"
              />
              <div className="flex justify-between items-center">
                {importError && <span className="text-[10px] text-rose-400 block font-semibold">{importError}</span>}
                {importSuccess && <span className="text-[10px] text-emerald-400 block font-semibold">Import parsed correctly! Cycle updated.</span>}
                <button
                  type="submit"
                  className="py-1.5 px-3 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-bold rounded-xl text-xs self-end ml-auto"
                  id="submit-import"
                >
                  Parse & Inject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gantt Chart Matrix Timeline */}
      <div className="bg-[#0f172a]/70 border border-[#1e293b]/80 rounded-2xl p-6 shadow-xl backdrop-blur-md" id="gantt-chart-card">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>Cycle Sequence Gantt Blueprint (Weeks 1 to 12+)</span>
          </h4>
        </div>
        <p className="text-slate-500 text-[11px] mb-5">Visualizing timelines and overlapping schedules for correct titration, loaded phases, and compound interaction spacing.</p>
        {renderGanttTimeline()}
      </div>

      {/* Post-Cycle Therapy (PCT) Intelligent Suggester Hub */}
      {(() => {
        const getEndDate = (start: string, weeks: number) => {
          const s = new Date(start);
          if (isNaN(s.getTime())) return null;
          s.setDate(s.getDate() + weeks * 7);
          return s;
        };

        const todayObj = new Date();
        const suppressiveCompounds = compounds.filter(c => c.type === 'steroid' || c.type === 'compound');
        
        // PCT is recommended when a suppressive cycle is completed OR the duration limit is reached
        const pctCandidates = suppressiveCompounds.filter(c => {
          const endDate = getEndDate(c.startDate, c.durationWeeks);
          const dateLimitReached = endDate ? todayObj >= endDate : false;
          return c.isCompleted || dateLimitReached;
        });

        if (suppressiveCompounds.length > 0) {
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
                  <p className="text-slate-400 text-xs leading-normal">
                    The following suppressive compounds have completed or elapsed their duration limits. Sustaining natural pituitary signals (LH / FSH) requires entering an endocrine restoration block to safeguard organic systems and preserve lean gains.
                  </p>
                  <div className="space-y-3">
                    {pctCandidates.map((comp) => {
                      const endDate = getEndDate(comp.startDate, comp.durationWeeks);
                      const endDateStr = endDate ? endDate.toISOString().split('T')[0] : comp.startDate;
                      
                      return (
                        <div key={`pct-sugg-${comp.id}`} className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 hover:border-indigo-500/30 transition-colors" id={`pct-row-container-${comp.id}`}>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: comp.color }}></span>
                              <h5 className="font-bold text-xs sm:text-sm text-slate-200">{comp.name}</h5>
                              <span className="text-[9px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono px-1.5 py-0.5 rounded uppercase font-bold">
                                {comp.isCompleted ? 'Manually Finished' : 'Duration Elapsed'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 leading-normal">
                              Active Phase: <span className="font-mono text-slate-300 font-semibold">{comp.startDate}</span> to <span className="font-mono text-slate-300 font-semibold">{endDateStr}</span> ({comp.durationWeeks} Weeks total).
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2 w-full lg:w-auto shrink-0">
                            {/* Nolvadex Protocol Auto Add */}
                            <button
                              onClick={() => {
                                const pctComp: Compound = {
                                  id: `pct-nolva-${Date.now()}`,
                                  name: `Nolvadex (Tamoxifen) • PCT for ${comp.name}`,
                                  type: 'compound',
                                  doseAmount: 20,
                                  doseUnit: 'mg',
                                  frequency: 'daily',
                                  startDate: endDateStr,
                                  durationWeeks: 4,
                                  color: '#ec4899',
                                  isCompleted: false,
                                  steroidForm: 'pill',
                                  pillSizeMg: 20,
                                  notes: `Post-Cycle Therapy recovery block auto-suggested following completion/termination of ${comp.name}. Focus on restoring standard HPTA axis function.`
                                };
                                onAddCompound(pctComp);
                              }}
                              className="flex-1 lg:flex-initial py-1.5 px-3 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/20 hover:border-pink-500/40 text-pink-300 hover:text-pink-200 font-bold rounded-xl text-[10px] md:text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                              title="Add Nolvadex PCT to schedule starting on finished date"
                              id={`add-pct-nolva-btn-${comp.id}`}
                            >
                              <Heart className="w-3.5 h-3.5 text-pink-400" />
                              <span>Nolvadex (20mg/day, 4wk)</span>
                            </button>

                            {/* Clomid Protocol Auto Add */}
                            <button
                              onClick={() => {
                                const pctComp: Compound = {
                                  id: `pct-clomid-${Date.now()}`,
                                  name: `Clomid (Clomiphene) • PCT for ${comp.name}`,
                                  type: 'compound',
                                  doseAmount: 50,
                                  doseUnit: 'mg',
                                  frequency: 'daily',
                                  startDate: endDateStr,
                                  durationWeeks: 4,
                                  color: '#a855f7',
                                  isCompleted: false,
                                  steroidForm: 'pill',
                                  pillSizeMg: 50,
                                  notes: `Gonadotropin stimulus Post-Cycle Therapy block scheduled post-${comp.name} cycle. Tamoxifen-alternative or supplement protocol.`
                                };
                                onAddCompound(pctComp);
                              }}
                              className="flex-1 lg:flex-initial py-1.5 px-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 hover:border-purple-500/40 text-purple-300 hover:text-purple-200 font-bold rounded-xl text-[10px] md:text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                              title="Add Clomid PCT to schedule starting on finished date"
                              id={`add-pct-clomid-btn-${comp.id}`}
                            >
                              <Shield className="w-3.5 h-3.5 text-purple-400" />
                              <span>Clomid (50mg/day, 4wk)</span>
                            </button>

                            {/* Quick Custom prefilled modal button */}
                            <button
                              onClick={() => {
                                setName('Nolvadex / Clomid Suite');
                                setType('compound');
                                setDoseAmount('20');
                                setDoseUnit('mg');
                                setFrequency('daily');
                                setStartDate(endDateStr);
                                setDurationWeeks(4);
                                setColor('#6366f1');
                                setSteroidForm('pill');
                                setPillSizeMg('20');
                                setNotes(`Custom post-cycle therapy suite designated for the ${comp.name} recovery phase.`);
                                setShowForm(true);
                              }}
                              className="flex-1 lg:flex-initial py-1.5 px-3 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-300 font-bold rounded-xl text-[10px] md:text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                              id={`add-pct-custom-btn-${comp.id}`}
                            >
                              <Plus className="w-3.5 h-3.5 text-slate-400" />
                              <span>Custom PCT</span>
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
        }
        return null;
      })()}

      {/* Active Compound Cards (Manage Section) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="compounds-list-grid">
        {compounds.map((comp) => (
          <div
            key={comp.id}
            className="bg-[#0f172a]/70 border border-[#1e293b]/80 rounded-2xl p-5 shadow-lg relative flex flex-col justify-between animate-fadeIn"
            id={`compound-card-${comp.id}`}
          >
            {/* Structural visual color anchor */}
            <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl" style={{ backgroundColor: comp.color }}></div>

            <div className="space-y-4">
              <div className="flex justify-between items-start pt-1">
                <div>
                  <h4 className="text-base font-bold text-slate-100 flex items-center gap-1.5 flex-wrap">
                    <span>{comp.name}</span>
                    {comp.isCompleted && (
                      <span className="text-[9px] bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-mono font-bold tracking-wider">
                        COMPLETED
                      </span>
                    )}
                  </h4>
                  <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-slate-500">{comp.type}</span>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => {
                      const updated = { ...comp, isCompleted: !comp.isCompleted };
                      onUpdateCompound(updated);
                    }}
                    className={`p-1.5 transition rounded-lg border cursor-pointer ${
                      comp.isCompleted 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                        : 'bg-[#1e293b]/30 border-transparent text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/5'
                    }`}
                    title={comp.isCompleted ? "Mark schedule as running and active" : "Mark schedule as successfully completed"}
                    id={`toggle-complete-comp-${comp.id}`}
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleStartEdit(comp)}
                    className="p-1.5 text-slate-400 hover:text-cyan-400 transition"
                    title="Edit compound features"
                    id={`edit-comp-${comp.id}`}
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteCompound(comp.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 transition"
                    title="Terminate compound"
                    id={`delete-comp-${comp.id}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Chemical properties stats */}
              <div className="grid grid-cols-2 gap-2 bg-[#1e293b]/20 p-2.5 rounded-xl border border-slate-800/80 text-[11px]">
                <div>
                  <span className="text-slate-500 block">Planned Dose</span>
                  <span className="font-mono font-semibold text-slate-300">{comp.doseAmount} {comp.doseUnit}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Administration</span>
                  <span className="font-semibold text-slate-300 capitalize">{comp.frequency.replace('_', ' ')}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Course Duration</span>
                  <span className="font-mono font-semibold text-slate-300">{comp.durationWeeks} Weeks</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Sequence Start</span>
                  <span className="font-mono font-semibold text-slate-300">{comp.startDate}</span>
                </div>
              </div>

              {/* Visual Duration Progress Bar */}
              {(() => {
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

                return (
                  <div className="space-y-1.5" id={`card-progress-bar-container-${comp.id}`}>
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-slate-500">Cycle Duration Progress</span>
                      <span className="font-bold text-slate-300">
                        {comp.isCompleted ? '100% (Completed)' : `${roundedPct}% completed`} 
                        {!comp.isCompleted && daysRemaining > 0 && ` (${daysRemaining}d left)`}
                      </span>
                    </div>
                    <div className="w-full bg-[#0f172a] h-1.5 rounded-full overflow-hidden border border-[#1e293b]/45">
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
              })()}

              {/* Reconstitution details reminder */}
              {comp.vialSizeMg && comp.bacWaterMl && (
                <div className="bg-cyan-500/5 border border-cyan-500/10 p-2.5 rounded-xl text-[10px] text-cyan-400 flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-[11px]">Formula Reconstituted Ratio</span>
                    Units required: <span className="font-bold underline">
                      {Math.round(((comp.doseAmount) / ((comp.vialSizeMg * 1000) / (comp.bacWaterMl * 100))) * 10) / 10} Units
                    </span> on standard syringe ({comp.vialSizeMg}mg in {comp.bacWaterMl}ml).
                  </div>
                </div>
              )}

              {/* Steroid/Supplement physical metrics details */}
              {(comp.type === 'steroid' || comp.type === 'supplement' || comp.type === 'compound') && comp.steroidForm && (
                <div className="bg-cyan-500/5 border border-cyan-500/10 p-2.5 rounded-xl text-[10px] text-cyan-400 flex items-start gap-1.5">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block text-[11px]">
                      {comp.steroidForm === 'pill' ? 'Oral Tablet Formula Mapping' : 'Liquid Suspension Formula Mapping'}
                    </span>
                    {comp.steroidForm === 'pill' && comp.pillSizeMg && (
                      <span>
                        Dose requires taking <span className="font-bold underline">
                          {Math.round((comp.doseAmount / comp.pillSizeMg) * 100) / 100} pills
                        </span> per administration ({comp.pillSizeMg}mg per pill).
                      </span>
                    )}
                    {comp.steroidForm === 'oil' && comp.oilConcMgMl && (
                      <span>
                        Dose requires drawing <span className="font-bold underline">
                          {(comp.doseAmount / comp.oilConcMgMl).toFixed(2)} ml / cc
                        </span> per administration ({comp.oilConcMgMl}mg/ml).
                      </span>
                    )}
                  </div>
                </div>
              )}

              {comp.notes && (
                <p className="text-[11px] text-slate-400 italic bg-[#1e293b]/20 p-2.5 rounded-xl border border-slate-800/80">
                  &ldquo;{comp.notes}&rdquo;
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dynamic Cycle Risk Mitigations & Science-Backed Support Recommendations */}
      <div className="bg-[#0f172a]/70 border border-[#1e293b]/80 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4" id="cycle-mitigations-panel">
        <div className="border-b border-[#1e293b]/60 pb-3">
          <span className="text-xs text-indigo-400 font-mono tracking-wider font-semibold uppercase">Auto-Mitigation Protocol Engine</span>
          <h4 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 mt-0.5">
            <Heart className="w-4 h-4 text-rose-400" />
            <span>Cycle Support & Side Effect Defenses</span>
          </h4>
        </div>

        {/* Recommended Supplement Presets with generated image icons */}
        <div className="bg-[#1e293b]/20 border border-[#1e293b]/45 rounded-2xl p-4.5 space-y-3.5" id="supplement-categories-presets">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h5 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Suggested Support Preset Suites</h5>
              <p className="text-[11px] text-slate-400 mt-0.5">Activate clinical supplement formulas to reduce organ load, blood pressure, and lift strain.</p>
            </div>
            <span className="text-[9px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded font-mono font-bold border border-cyan-500/10">PREMIUM PROTOCOLS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Liver Support Category */}
            <div className="bg-[#0f172a]/80 border border-slate-800 p-3 rounded-xl flex items-center gap-3.5 hover:border-cyan-500/30 transition-all duration-300" id="preset-card-liver-support">
              <img 
                src="/liver_support_icon.png" 
                alt="Liver Support Icon" 
                className="w-12 h-12 rounded-lg bg-black/40 border border-cyan-500/20 object-cover shrink-0" 
                referrerPolicy="no-referrer"
              />
              <div className="space-y-1 flex-1 text-left">
                <span className="text-[9px] font-mono text-cyan-400 font-bold tracking-wider uppercase block">Liver Support</span>
                <span className="text-xs font-extrabold text-slate-200 block">TUDCA & NAC</span>
                <button
                  type="button"
                  onClick={() => {
                    const preset: Compound = {
                      id: `supp-liver-${Date.now()}`,
                      name: "TUDCA + NAC Liver Protection",
                      type: "supplement",
                      doseAmount: 1100,
                      doseUnit: "mg",
                      frequency: "daily",
                      startDate: new Date().toISOString().split('T')[0],
                      durationWeeks: 8,
                      color: "#ec4899",
                      isCompleted: false,
                      steroidForm: "pill",
                      pillSizeMg: 500,
                      notes: "Hepatoprotective supplement formulation. Added to optimize safe AST/ALT liver enzyme ranges during suppressive actions."
                    };
                    onAddCompound(preset);
                  }}
                  className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-300 text-[10px] px-2.5 py-0.5 rounded-lg font-bold transition cursor-pointer inline-block"
                  id="add-preset-liver-btn"
                >
                  + Add Preset
                </button>
              </div>
            </div>

            {/* Vitamins Category */}
            <div className="bg-[#0f172a]/80 border border-slate-800 p-3 rounded-xl flex items-center gap-3.5 hover:border-purple-500/30 transition-all duration-300" id="preset-card-vitamins">
              <img 
                src="/vitamins_icon.png" 
                alt="Vitamins Icon" 
                className="w-12 h-12 rounded-lg bg-black/40 border border-purple-500/20 object-cover shrink-0" 
                referrerPolicy="no-referrer"
              />
              <div className="space-y-1 flex-1 text-left">
                <span className="text-[9px] font-mono text-purple-400 font-bold tracking-wider uppercase block">Vitamins</span>
                <span className="text-xs font-extrabold text-slate-200 block font-sans">CoQ10 + Omega-3</span>
                <button
                  type="button"
                  onClick={() => {
                    const preset: Compound = {
                      id: `supp-vit-${Date.now()}`,
                      name: "CoQ10 + Omega-3 Vital Complex",
                      type: "supplement",
                      doseAmount: 2000,
                      doseUnit: "mg",
                      frequency: "daily",
                      startDate: new Date().toISOString().split('T')[0],
                      durationWeeks: 12,
                      color: "#a855f7",
                      isCompleted: false,
                      notes: "Mitigates cardiovascular load, stabilizes vascular flexibility, and keeps blood-lipid indices optimized."
                    };
                    onAddCompound(preset);
                  }}
                  className="bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-300 text-[10px] px-2.5 py-0.5 rounded-lg font-bold transition cursor-pointer inline-block"
                  id="add-preset-vitamins-btn"
                >
                  + Add Preset
                </button>
              </div>
            </div>

            {/* Joint Health Category */}
            <div className="bg-[#0f172a]/80 border border-slate-800 p-3 rounded-xl flex items-center gap-3.5 hover:border-emerald-500/30 transition-all duration-300" id="preset-card-joint">
              <img 
                src="/joint_health_icon.png" 
                alt="Joint Health Icon" 
                className="w-12 h-12 rounded-lg bg-black/40 border border-emerald-500/20 object-cover shrink-0" 
                referrerPolicy="no-referrer"
              />
              <div className="space-y-1 flex-1 text-left">
                <span className="text-[9px] font-mono text-emerald-400 font-bold tracking-wider uppercase block">Joint Health</span>
                <span className="text-xs font-extrabold text-slate-200 block">Glucosamine Complex</span>
                <button
                  type="button"
                  onClick={() => {
                    const preset: Compound = {
                      id: `supp-joint-${Date.now()}`,
                      name: "Glucosamine + Joint MSM Cure",
                      type: "supplement",
                      doseAmount: 1500,
                      doseUnit: "mg",
                      frequency: "daily",
                      startDate: new Date().toISOString().split('T')[0],
                      durationWeeks: 12,
                      color: "#10b981",
                      isCompleted: false,
                      notes: "Formulated to guard articular connective tissue, safeguard joint fluid viscosity, and bolster general healing."
                    };
                    onAddCompound(preset);
                  }}
                  className="bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-300 text-[10px] px-2.5 py-0.5 rounded-lg font-bold transition cursor-pointer inline-block"
                  id="add-preset-joint-btn"
                >
                  + Add Preset
                </button>
              </div>
            </div>
          </div>
        </div>

        {(() => {
          const recs = [];
          const hasPillSteroid = compounds.some(c => 
            (c.type === 'steroid' || c.type === 'compound') && c.steroidForm === 'pill'
          );
          const hasOilSteroid = compounds.some(c => 
            (c.type === 'steroid' || c.type === 'compound') && c.steroidForm === 'oil'
          );
          const hasGLP1 = compounds.some(c => 
            c.name.toLowerCase().includes('sema') || 
            c.name.toLowerCase().includes('tira') || 
            c.name.toLowerCase().includes('glp') ||
            (c.type as string) === 'peptide' && (c.id === 'semaglutide' || c.id === 'tirzepatide')
          );
          const hasGH = compounds.some(c => 
            c.name.toLowerCase().includes('ipam') || 
            c.name.toLowerCase().includes('cjc') || 
            c.name.toLowerCase().includes('gh') ||
            (c.type as string) === 'peptide' && (c.id === 'ipamorelin' || c.id === 'cjc-1295-no-dac')
          );
          const hasTanning = compounds.some(c => 
            c.name.toLowerCase().includes('melan') || 
            (c.type as string) === 'peptide' && c.id === 'melanotan-ii'
          );

          if (hasPillSteroid) {
            recs.push({
              id: 'liver-support',
              concern: 'Oral Hepatotoxicity & Liver Load',
              negatives: '17-alpha-alkylated oral chemical compounds pass through the liver, stressing metabolic cellular walls and quickly elevating AST/ALT enzyme rates.',
              supplement: 'TUDCA + N-Acetyl Cysteine (NAC)',
              dosage: 'TUDCA: 250-500 mg, NAC: 600-1200 mg daily',
              protocol: 'Take daily split morning/evening with major caloric meals. Avoid regular alcohol use during this active cycle block.',
              icon: <Activity className="w-5 h-5 text-rose-400" />,
              badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            });
          }

          if (hasOilSteroid) {
            recs.push({
              id: 'cardio-lipid',
              concern: 'Lipid Ratios & Red Blood Cell Density',
              negatives: 'Injected anabolic oil suspensions elevate vascular friction, lower healthy HDL protectants, and trigger excess red cell production (hematocrit thickness).',
              supplement: 'Omega-3 Fish Oil + Ubiquinol CoQ10',
              dosage: 'Fish Oil: 2000-3000 mg, CoQ10: 100-200 mg daily',
              protocol: 'Supports healthy vascular elasticity and fluid dynamics. Ingest 3.5+ liters of clean structural water daily.',
              icon: <Shield className="w-5 h-5 text-amber-400" />,
              badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            });
          }

          if (hasGLP1) {
            recs.push({
              id: 'glp-gi',
              concern: 'Gastric Slowdown & Visceral Dehydration',
              negatives: 'Slowing stomach motility stops healthy water absorption, provokes dry bowel blockage, and can lead to immediate lean muscle tissue wasting.',
              supplement: 'Psyllium Husk Fiber + Active Electrolytes + Whey Protein',
              dosage: 'Fiber: 5-10 g, Whey: 1.5g per kg weight daily',
              protocol: 'Assures gastrointestinal motility, maintains muscular nitrogen balance, and keeps core hydration indexes topped up.',
              icon: <Apple className="w-5 h-5 text-emerald-400" />,
              badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            });
          }

          if (hasGH) {
            recs.push({
              id: 'gh-sensitivity',
              concern: 'Insulin Resistance & Water Edema',
              negatives: 'Synthetic growth hormones can block cell receptor sites, leading to blood glucose spikes and sodium-retentive hand/ankle puffiness.',
              supplement: 'Berberine or Alpha Lipoic Acid (ALA)',
              dosage: 'Berberine: 500 mg (before calorie-dense meals)',
              protocol: 'Optimizes glucose uptake directly, limiting insulin stress and stabilizing blood sugar baselines.',
              icon: <Activity className="w-5 h-5 text-indigo-400" />,
              badgeColor: 'bg-indigo-500/10 text-indigo-400 border-[#6366f1]/20'
            });
          }

          if (hasTanning) {
            recs.push({
              id: 'tanning-pigment',
              concern: 'Receptive Skin Spatting & Nervous Nausea',
              negatives: 'MC4 receptor signals provoke central nervous nausea flareups and trigger naevi freckles to undergo solar hyper-pigmentation.',
              supplement: 'Ginger Root Extract + Broad Spectrum SPF 50 Block',
              dosage: 'Ginger: 500-1000 mg (30-mins pre-injection)',
              protocol: 'Sip ginger infusion or tablets to block stomach vagus nerves. Strict SPF usage safeguards moles from irregular darkening.',
              icon: <Sun className="w-5 h-5 text-cyan-400" />,
              badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
            });
          }

          if (recs.length === 0) {
            return (
              <div className="text-center py-8 text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl max-w-lg mx-auto">
                <Info className="w-6 h-6 text-slate-600 mx-auto mb-2" />
                <p className="font-semibold text-slate-400">No Risk Warnings Detected</p>
                <p className="text-slate-600 mt-1">Formulate custom steroids, peptides or oral compounds. The helper engine will automatically compile required supplement offset support formulas here.</p>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="mitigations-cards-container">
              {recs.map((item) => (
                <div key={item.id} className="bg-[#1e293b]/25 border border-slate-800 p-4.5 rounded-2xl flex gap-3.5 hover:border-slate-700/60 transition-all duration-300">
                  <div className="p-2.5 bg-[#0f172a]/80 border border-slate-800 rounded-xl h-fit shadow-md">
                    {item.icon}
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <div className="flex justify-between items-start gap-2 flex-wrap sm:flex-nowrap">
                      <h5 className="text-xs font-bold text-slate-200">{item.concern}</h5>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold font-mono tracking-wider border uppercase scale-95 origin-right ${item.badgeColor}`}>
                        Side Effect Risk
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-normal">
                      <strong className="text-rose-400 font-normal">Negatives (Minuses):</strong> {item.negatives}
                    </p>

                    <div className="bg-[#0f172a]/60 border border-slate-800/60 p-2.5 rounded-xl space-y-1 mt-2 text-[11px]">
                      <div className="text-emerald-400 font-bold flex items-center gap-1 font-mono text-[10px] uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                        Supplement Mitigation (Pluses)
                      </div>
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

      {/* Formulation / Add-Edit Modal Overlay rendered via React Portal to escape container stacking context */}
      {showForm && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-[#020617]/75 backdrop-blur-sm flex items-start sm:items-center justify-center p-2.5 sm:p-4 z-50 overflow-y-auto" id="planner-form-overlay">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4 sm:p-6 w-full max-w-xl shadow-2xl relative space-y-5 my-4 sm:my-0" id="planner-form-card" onClick={(e) => e.stopPropagation()}>
            {/* Title / Description */}
            <div className="flex justify-between items-start pb-4 border-b border-[#1e293b]">
              <div>
                <h4 className="text-lg font-bold text-slate-100 flex items-center gap-1.5">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  {editingId ? 'Refine Active Compound Specification' : 'Formulate New Enhancer Sequence'}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Define standard dosages, scheduling matrices, and chemical details.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="p-1 px-2 border border-[#1e293b] hover:border-slate-700 bg-[#1e293b]/45 text-slate-400 hover:text-slate-200 text-xs font-semibold rounded-lg transition"
                id="close-form-btn"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 relative">
                  <label className="text-xs font-semibold text-slate-300">Name of Compound (e.g., Semaglutide, BPC-157)</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => {
                      // Slight delay to allow clicking suggestion item mouse events to fire successfully
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                    placeholder="Enter chemical title or starting letters..."
                    className="w-full bg-[#1e293b]/45 border border-slate-700/60 rounded-xl py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/80"
                    id="form-name-input"
                    autoComplete="off"
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 w-full mt-1.5 bg-[#0f172a] border border-[#1e293b] rounded-xl shadow-2xl overflow-y-auto max-h-48 z-50 divide-y divide-slate-800/60 custom-scrollbar" id="name-autocomplete-dropdown">
                      <div className="px-3 py-1 bg-slate-900/45 text-[9px] font-mono text-slate-500 tracking-wider uppercase font-semibold">Matched Encyclopedia Suggestions</div>
                      {suggestions.map((item) => (
                        <button
                          key={`autocomplete-${item.id}`}
                          type="button"
                          onMouseDown={() => handleSelectSuggestion(item)}
                          className="w-full text-left p-2.5 hover:bg-cyan-500/10 hover:text-cyan-200 transition-colors flex items-center justify-between text-xs cursor-pointer group"
                        >
                          <div>
                            <span className="font-bold text-slate-200 group-hover:text-cyan-300 block">{item.name}</span>
                            {item.chemicalName && (
                              <span className="text-[10px] text-slate-400 group-hover:text-slate-300 font-mono block mt-0.5">{item.chemicalName}</span>
                            )}
                          </div>
                          <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-cyan-950/45 text-cyan-400 border border-cyan-500/25 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors uppercase shrink-0">
                            Auto-Fill
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Compound Family Category</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-[#1e293b] border border-slate-700/60 rounded-xl py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/80"
                    id="form-type-select"
                  >
                    <option value="peptide">Peptide (Freeze-Dried Vial)</option>
                    <option value="steroid">Anabolic Steroid / TRT</option>
                    <option value="compound">Anabolic / SARM / Chemical</option>
                    <option value="supplement">Organic Supplement</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Color Code (Visualizer Identity)</label>
                  <div className="flex gap-1.5 items-center bg-[#1e293b]/45 border border-slate-700/60 rounded-xl py-1.5 px-2.5 h-10">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-7 h-7 bg-transparent border-0 cursor-pointer overflow-hidden rounded shrink-0"
                      id="form-color-picker"
                    />
                    <div className="flex flex-wrap gap-1 max-w-[140px] items-center">
                      {PRESET_COLORS.map(c => (
                        <button
                          key={`preset-col-${c}`}
                          type="button"
                          onClick={() => setColor(c)}
                          className="w-3.5 h-3.5 rounded-full border border-black/40 inline-block transition hover:scale-110 cursor-pointer"
                          style={{ backgroundColor: c }}
                        ></button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Peptide reconstitution ratio details */}
              {type === 'peptide' && (
                <div className="bg-cyan-500/5 border border-cyan-500/15 p-4 rounded-xl space-y-3.5">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 font-bold block">Optional Reconstitution Mapping</span>
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">Vial Capacity (mg)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={vialSizeMg}
                        onChange={(e) => setVialSizeMg(e.target.value)}
                        placeholder="e.g. 5"
                        className="w-full bg-[#1e293b]/45 border border-slate-700/60 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/80"
                        id="form-vial-mg-input"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">Bacteriostatic Water Added (ml / cc)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={bacWaterMl}
                        onChange={(e) => setBacWaterMl(e.target.value)}
                        placeholder="e.g. 2"
                        className="w-full bg-[#1e293b]/45 border border-slate-700/60 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/80"
                        id="form-water-ml-input"
                      />
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-500 leading-normal block">Entering these allows the system to auto-map mcg dosages into physical syringe tick marks, displaying plunger volumes inside active daily schedules.</span>
                </div>
              )}

              {/* Steroid/oral/liquid detail form */}
              {(type === 'steroid' || type === 'supplement' || type === 'compound') && (
                <div className="bg-cyan-500/5 border border-cyan-500/15 p-4 rounded-xl space-y-3.5">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-cyan-400 font-bold block">Delivery Format & Configuration</span>
                  
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1 col-span-2">
                      <label className="text-[11px] font-semibold text-slate-300">Formulation Format</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setSteroidForm('oil')}
                          className={`py-1.5 px-3 rounded-lg border text-xs font-semibold cursor-pointer transition ${
                            steroidForm === 'oil'
                              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40 font-bold'
                              : 'bg-[#1e293b]/50 border-slate-700/50 text-slate-400 hover:text-slate-200'
                          }`}
                          id="form-format-oil-btn"
                        >
                          Liquid / Oil (Injectable)
                        </button>
                        <button
                          type="button"
                          onClick={() => setSteroidForm('pill')}
                          className={`py-1.5 px-3 rounded-lg border text-xs font-semibold cursor-pointer transition ${
                            steroidForm === 'pill'
                              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40 font-bold'
                              : 'bg-[#1e293b]/50 border-slate-700/50 text-slate-400 hover:text-slate-200'
                          }`}
                          id="form-format-pill-btn"
                        >
                          Oral Tablet / Pill
                        </button>
                      </div>
                    </div>

                    {steroidForm === 'pill' ? (
                      <div className="space-y-1 col-span-2">
                        <label className="text-[11px] font-semibold text-slate-300">Tablet / Pill Size (mg per Tablet)</label>
                        <input
                          type="number"
                          step="any"
                          value={pillSizeMg}
                          onChange={(e) => setPillSizeMg(e.target.value)}
                          placeholder="e.g. 10"
                          className="w-full bg-[#1e293b]/45 border border-slate-700/60 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/80"
                          id="form-pill-size-input"
                        />
                      </div>
                    ) : (
                      <div className="space-y-1 col-span-2">
                        <label className="text-[11px] font-semibold text-slate-300">Liquid Concentration (mg per 1 ml / cc)</label>
                        <input
                          type="number"
                          step="any"
                          value={oilConcMgMl}
                          onChange={(e) => setOilConcMgMl(e.target.value)}
                          placeholder="e.g. 250"
                          className="w-full bg-[#1e293b]/45 border border-slate-700/60 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/80"
                          id="form-oil-conc-input"
                        />
                      </div>
                    )}
                  </div>

                  {/* Dynamic description in popup */}
                  <span className="text-[9.5px] text-cyan-400 leading-normal block font-mono bg-cyan-950/20 border border-cyan-900/10 p-2 rounded-lg">
                    {steroidForm === 'pill' ? (
                      <span>
                        ✓ Daily dosage of <strong className="text-cyan-300 font-extrabold">{doseAmount || '20'} {doseUnit}</strong> automatically corresponds to taking <strong className="text-cyan-300 font-extrabold">{(parseFloat(doseAmount) / (parseFloat(pillSizeMg) || 10)).toFixed(2)} pills</strong> (using {pillSizeMg || 10}mg tablets).
                      </span>
                    ) : (
                      <span>
                        ✓ Each injection dose of <strong className="text-cyan-300 font-extrabold">{doseAmount || '250'} {doseUnit}</strong> automatically corresponds to drawing <strong className="text-cyan-300 font-extrabold">{(parseFloat(doseAmount) / (parseFloat(oilConcMgMl) || 250)).toFixed(2)} ml / cc</strong> on standard syringe scales (using {oilConcMgMl || 250}mg/ml susp).
                      </span>
                    )}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Dose Quantity</label>
                  <div className="flex gap-1 bg-[#1e293b]/45 border border-slate-700/60 rounded-xl pr-2">
                    <input
                      type="number"
                      required
                      step="any"
                      value={doseAmount}
                      onChange={(e) => setDoseAmount(e.target.value)}
                      placeholder="e.g. 250"
                      className="w-full bg-transparent border-0 rounded-l-xl py-2 px-3 text-sm text-slate-200 focus:outline-none"
                      id="form-dose-amount-input"
                    />
                    <select
                      value={doseUnit}
                      onChange={(e) => setDoseUnit(e.target.value as any)}
                      className="bg-[#1e293b] border border-slate-700/60 rounded-lg text-xs py-1 px-2 my-1 text-slate-300 focus:outline-none"
                      id="form-dose-unit-select"
                    >
                      <option value="mcg">mcg</option>
                      <option value="mg">mg</option>
                      <option value="IU">IU</option>
                      <option value="ml">ml</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Inoculation Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full bg-[#1e293b] border border-slate-700/60 rounded-xl py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/80"
                    id="form-frequency-select"
                  >
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
                    <input
                      type="number"
                      min="1"
                      max="30"
                      value={customDays}
                      onChange={(e) => setCustomDays(e.target.value)}
                      placeholder="e.g. 3 (injects every 3 days)"
                      className="w-full bg-[#1e293b]/45 border border-slate-700/60 rounded-xl py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/80"
                      id="form-custom-days-input"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Cycle Active Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-[#1e293b]/45 border border-slate-700/60 rounded-xl py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/80"
                    id="form-start-date-input"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Active Duration (Weeks)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="52"
                    value={durationWeeks}
                    onChange={(e) => setDurationWeeks(parseInt(e.target.value))}
                    className="w-full bg-[#1e293b]/45 border border-slate-700/60 rounded-xl py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/80"
                    id="form-duration-weeks-input"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Physiological Annotations & Laboratory Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Insert injection guidance, site selection, titration plan..."
                  className="w-full h-18 bg-[#1e293b]/45 border border-slate-700/60 rounded-xl p-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80"
                  id="form-notes-textarea"
                />
              </div>

              <div className="pt-4 border-t border-[#1e293b] flex gap-3.5 justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200"
                  id="cancel-form"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer transition shadow-lg shadow-cyan-500/10"
                  id="submit-form"
                >
                  <Save className="w-4 h-4 text-slate-950" />
                  {editingId ? 'Refine Formulation' : 'Record Compound'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
