import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Trash2, Calendar, FileDown, FileUp, AlertTriangle, CheckSquare, Sparkles, ArrowLeftRight, Save, Info, Edit, Check, Heart, Shield, Apple, Sun, Activity, CheckCircle, History, Clock } from 'lucide-react';
import { Compound, LibraryItem, DoseLog, formatTimeTo12Hour } from '../types';
import { triggerHaptic } from '../lib/haptics';
import { PEPTIDE_LIBRARY } from '../data/peptides';
import ReconstitutionCalculator from './ReconstitutionCalculator';
import { findShopProductMatch } from './MembersShop';

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
  labratTheme?: 'neon' | 'clinical';
  visibility?: { gantt: boolean; pct: boolean; dataControls: boolean; };
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

function ganttElapsedWeek(comp: Compound): number {
  const start = new Date(comp.startDate + 'T00:00:00');
  const today = new Date();
  const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const elapsed = Math.floor((todayMid.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  if (elapsed < 0) return 0;
  return Math.min(comp.durationWeeks, Math.floor(elapsed / 7) + 1);
}

function ganttLibraryItem(comp: Compound) {
  return PEPTIDE_LIBRARY.find(
    item => item.id === comp.id || item.name.toLowerCase() === comp.name.toLowerCase()
  );
}

function ganttPhaseInfo(comp: Compound, week: number) {
  const lib = ganttLibraryItem(comp);
  const ratio = week / comp.durationWeeks;
  const fallbackGains = lib?.realisticGains || 'Observational adjustments in wellness parameters, strength markers, and cellular efficiency.';
  const fallbackBenefits = lib?.benefits?.map(b => b.replace(/Plus \(\+\):\s*/g, '')) ?? [
    'Optimized cellular signaling active',
    'Stable hydration of target tissues',
    'Baseline metabolic enzymatic support',
  ];
  const fallbackWarnings = lib?.sideEffects?.map(b => b.replace(/Minus \(-\):\s*/g, '')) ?? [
    'Transient site irritability or injection flush',
    'Water dynamics fluctuation / minor tightness',
    'Monitor blood pressure values',
  ];
  const fallbackDiet = lib?.dietaryInteraction || 'Maintain standard balanced hydration and consistent macronutrient distribution.';

  if (ratio <= 0.25) {
    return {
      title: 'Phase I: Saturation & Physiological Onset',
      description: `Initial exposure (Week ${week} of ${comp.durationWeeks}). The active substance is gradually saturating plasma levels. Receptors are beginning to adapt, prompting early metabolic, structural, or recovery triggers.`,
      results: `Biological onset initiated. ${fallbackGains.slice(0, 160)}... Expected changes are starting to emerge on a cellular level.`,
      benefits: ['Uptake optimization beginning', fallbackBenefits[0] ?? 'Enhanced recovery initiation', fallbackBenefits[1] ?? 'Cellular hydration improvement'],
      warnings: ['Monitor for administration site stinging', fallbackWarnings[0] ?? 'Temporary minor headaches or flush', 'Keep baseline sodium intake moderate'],
      diet: `Induction optimization: ${fallbackDiet}`,
    };
  } else if (ratio <= 0.70) {
    return {
      title: 'Phase II: Steady-State Peak Bioactivity',
      description: `Therapeutic plateau (Week ${week} of ${comp.durationWeeks}). Peak steady-state concentration is achieved. Full systemic effects are active, driving accelerated tissue healing, lipolysis, endurance, or endocrine conversion.`,
      results: `${fallbackGains} Peak concentration allows maximum biological translation.`,
      benefits: fallbackBenefits.slice(0, 3),
      warnings: ['Watch for systemic adaptation thresholds', fallbackWarnings[0] ?? 'Mild muscle tightness or hydration retention', fallbackWarnings[1] ?? 'Nervous system saturation fatigue'],
      diet: `Steady-state performance fuel: ${fallbackDiet}`,
    };
  } else {
    return {
      title: 'Phase III: Mature Adaptation & Gain Consolidation',
      description: `Maturity & consolidation phase (Week ${week} of ${comp.durationWeeks}). The body has adapted to steady signaling. Gains in structural repair, cartilage remodeling, or fat oxidation are stabilizing into long-term tissue memory.`,
      results: 'Matured plateau. Systemic gains are consolidating. Maintain scheduling consistent — increasing dosages now generates diminishing returns.',
      benefits: ['Consolidation of structural tissue adapts', fallbackBenefits[fallbackBenefits.length - 1] ?? 'Optimized baseline healing state', 'Consistent tracking metric stability'],
      warnings: ['Watch for cumulative adaptation exhaustion', fallbackWarnings[fallbackWarnings.length - 1] ?? 'Mild lethargy or neural dampening', 'Check overall biomarkers (lipids/metabolics)'],
      diet: `Maturity consolidation: ${fallbackDiet}`,
    };
  }
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
  visibility = { gantt: true, pct: true, dataControls: true }
}: CyclePlannerProps) {
  const protocolIcon = (name: string) => `/protocol-icons/${name}-${labratTheme === 'clinical' ? 'clinical' : 'neon'}.svg`;
  // Form modal triggers
  const [showForm, setShowForm] = useState(false);
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Success Prompt overlay state
  const [showAddSuccessPrompt, setShowAddSuccessPrompt] = useState(false);
  const [addedCompoundId, setAddedCompoundId] = useState<string | null>(null);
  const [addedCompoundName, setAddedCompoundName] = useState<string | null>(null);

  // Retroactive Dose Sync states
  const [retroactiveCompId, setRetroactiveCompId] = useState<string | null>(null);
  const [retroTab, setRetroTab] = useState<'single' | 'batch'>('single');
  const [retroSingleDate, setRetroSingleDate] = useState(new Date().toISOString().split('T')[0]);
  const [retroSingleTime, setRetroSingleTime] = useState('08:00');
  const [retroSingleAmount, setRetroSingleAmount] = useState('');

  // Batch logging states
  const [retroBatchStart, setRetroBatchStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30); // 30 days ago
    return d.toISOString().split('T')[0];
  });
  const [retroBatchEnd, setRetroBatchEnd] = useState(new Date().toISOString().split('T')[0]);
  const [retroBatchFreq, setRetroBatchFreq] = useState<'daily' | 'eod' | 'twice_weekly' | 'weekly'>('daily');
  
  // Inline confirmation states (to avoid native browser alert blocks in iframe)
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [selectedGanttId, setSelectedGanttId] = useState<string | null>(null);
  const [selectedGanttWeek, setSelectedGanttWeek] = useState<number | null>(null);

  // Pre-calculate cycle triggers using useMemo to avoid repeated string matching on every render
  const cycleTriggers = useMemo(() => {
    let hasOral = false, hasInjectable = false, hasAromatizing = false, hasJointStrain = false, hasSuppressive = false, hasStimulant = false;
    let liverSupportInCycle = false, vitaminsInCycle = false, jointHealthInCycle = false, estrogenControlInCycle = false, endocrineShieldInCycle = false, jitterRescueInCycle = false;

    for (let j = 0; j < compounds.length; j++) {
      const c = compounds[j];
      const lowerName = c.name.toLowerCase();
      const type = c.type;
      const steroidForm = c.steroidForm;

      if (!hasOral) {
        hasOral = (type === 'steroid' && steroidForm === 'pill') ||
          lowerName.includes('dianabol') || lowerName.includes('dbol') || lowerName.includes('winstrol') ||
          lowerName.includes('stanozolol') || lowerName.includes('anavar') || lowerName.includes('oxandrolone') ||
          lowerName.includes('tesofensine') || lowerName.includes('clenbuterol');
      }
      if (!hasInjectable) {
        hasInjectable = (type === 'steroid' && steroidForm === 'oil') ||
          lowerName.includes('testosterone') || lowerName.includes('trenbolone') || lowerName.includes('primobolan') ||
          lowerName.includes('masteron') || lowerName.includes('deca') || lowerName.includes('boldenone');
      }
      if (!hasAromatizing) {
        hasAromatizing = lowerName.includes('testosterone') || lowerName.includes('dianabol') || lowerName.includes('dbol');
      }
      if (!hasJointStrain) {
        hasJointStrain = lowerName.includes('winstrol') || lowerName.includes('stanozolol') || lowerName.includes('masteron') ||
          lowerName.includes('trenbolone') || lowerName.includes('deca');
      }
      if (!hasSuppressive) {
        hasSuppressive = type === 'steroid' || lowerName.includes('tren') || lowerName.includes('test') || lowerName.includes('deca') ||
          lowerName.includes('primo') || lowerName.includes('mast') || lowerName.includes('var') || lowerName.includes('winstrol') ||
          lowerName.includes('dianabol') || lowerName.includes('dbol');
      }
      if (!hasStimulant) {
        hasStimulant = lowerName.includes('clenbuterol') || lowerName.includes('tesofensine');
      }
      if (!liverSupportInCycle) {
        liverSupportInCycle = lowerName.includes('tudca') || lowerName.includes('liver protection') || lowerName.includes('nac');
      }
      if (!vitaminsInCycle) {
        vitaminsInCycle = lowerName.includes('coq10') || lowerName.includes('omega-3') || lowerName.includes('fish oil');
      }
      if (!jointHealthInCycle) {
        jointHealthInCycle = lowerName.includes('glucosamine') || lowerName.includes('joint');
      }
      if (!estrogenControlInCycle) {
        estrogenControlInCycle = lowerName.includes('arimidex') || lowerName.includes('anastrozole') || lowerName.includes('aromasin') || lowerName.includes('exemestane');
      }
      if (!endocrineShieldInCycle) {
        endocrineShieldInCycle = lowerName.includes('hcg') || lowerName.includes('gonadotropin');
      }
      if (!jitterRescueInCycle) {
        jitterRescueInCycle = lowerName.includes('theanine') || lowerName.includes('ashwagandha') || lowerName.includes('calm-cycle');
      }
    }

    return { hasOral, hasInjectable, hasAromatizing, hasJointStrain, hasSuppressive, hasStimulant, liverSupportInCycle, vitaminsInCycle, jointHealthInCycle, estrogenControlInCycle, endocrineShieldInCycle, jitterRescueInCycle };
  }, [compounds]);

  // Form Fields State
  const [name, setName] = useState('');
  // Tracks whether the current name came from a real library selection (vs free typing).
  // Used to enforce selection-only on NEW typed entries while letting library picks,
  // edits of existing compounds, and app-set names (PCT suites) pass through.
  const [nameFromLibrary, setNameFromLibrary] = useState(false);
  const [nameError, setNameError] = useState('');
  const [type, setType] = useState<'peptide' | 'compound' | 'supplement' | 'steroid'>('peptide');
  const [vialSizeMg, setVialSizeMg] = useState('');
  const [bacWaterMl, setBacWaterMl] = useState('');
  const [doseAmount, setDoseAmount] = useState('1');
  const [doseUnit, setDoseUnit] = useState<'mcg' | 'mg' | 'IU' | 'ml'>('mg');
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
  const [focusedSuggestionIndex, setFocusedSuggestionIndex] = useState(-1);

  // Suggestions list matched from PEPTIDE_LIBRARY
  const suggestions = name.trim()
    ? PEPTIDE_LIBRARY.filter(item => {
        const query = name.toLowerCase().trim();
        const matchName = (item.name || '').toLowerCase().includes(query);
        const matchChemical = (item.chemicalName || '').toLowerCase().includes(query);
        const matchId = (item.id || '').toLowerCase().includes(query);
        const matchCategory = (item.category || '').toLowerCase().includes(query);
        const matchDesc = (item.description || '').toLowerCase().includes(query);
        const matchBenefits = (item.benefits || []).some(b => (b || '').toLowerCase().includes(query));
        return matchName || matchChemical || matchId || matchCategory || matchDesc || matchBenefits;
      }).slice(0, 8)
    : [];

  const handleSelectSuggestion = (item: LibraryItem) => {
    triggerAutoFill(item);
    setShowSuggestions(false);
    setFocusedSuggestionIndex(-1);
  };

  // Helper to dynamically update dose unit and form when name matches a compound
  const autoDetectDoseUnitAndFormFromName = (enteredName: string) => {
    if (!enteredName.trim()) return;
    const cleanName = enteredName.toLowerCase().trim();
    
    // Find absolute closest or exact match in library
    const matchedItem = PEPTIDE_LIBRARY.find(
      item => 
        item.name.toLowerCase() === cleanName ||
        item.id.toLowerCase() === cleanName ||
        item.chemicalName?.toLowerCase() === cleanName
    ) || PEPTIDE_LIBRARY.find(
      item => 
        item.name.toLowerCase().includes(cleanName) ||
        (item.chemicalName && item.chemicalName.toLowerCase().includes(cleanName))
    );

    if (matchedItem) {
      const typical = matchedItem.typicalDosage.toLowerCase();
      let detectedUnit: 'mcg' | 'mg' | 'IU' | 'ml' = 'mg';
      
      const idMap: Record<string, 'mcg' | 'mg' | 'IU' | 'ml'> = {
        'bpc-157': 'mcg',
        'tb-500': 'mg',
        'semaglutide': 'mg',
        'tirzepatide': 'mg',
        'retatrutide': 'mg',
        'retatrutide-shred-peptide': 'mg',
        'ipamorelin': 'mcg',
        'cjc-1295-no-dac': 'mcg',
        'ghk-cu': 'mg',
        'human-growth-hormone': 'IU',
        'igf-1-lr3': 'mcg',
        'pt-141': 'mg',
        'tesamorelin': 'mg',
        'epitalon': 'mg',
        'melanotan-ii': 'mcg',
        'testosterone-cypionate': 'mg',
        'testosterone-enanthate': 'mg',
        'testosterone-propionate': 'mg',
        'deca-durabolin': 'mg',
        'trenbolone-acetate': 'mg',
        'primobolan-enanthate': 'mg',
        'masteron-propionate': 'mg',
        'masteron-prop': 'mg',
        'anavar-oxandrolone': 'mg',
        'dianabol-methandrostenolone': 'mg',
        'dianabol-muscle': 'mg',
        'winstrol-stanozolol': 'mg',
        'winstrol-dry': 'mg',
        'clenbuterol-hydrochloride': 'mcg',
        'tudca-liver-guard': 'mg',
        'tudca-protect': 'mg',
        'nac-antioxidant': 'mg',
        'nac-ultimate-glutathione': 'mg',
        'arimidex-anastrozole': 'mg',
        'anastrozole-estrogen-control': 'mg',
        'nolvadex-tamoxifen': 'mg',
        'nolvadex-gyno-protection': 'mg',
        'tesofensine-metabolic-pill': 'mcg',
        'kisspeptin-10-hormone': 'mcg',
        'thymosin-alpha-1-immune': 'mg',
        'hcg-hormone': 'IU',
        'l-carnitine': 'mg',
        'exemestane-suicide-aromasin': 'mg',
        'clomid-pct-stimulator': 'mg',
        'dsip-delta-sleep': 'mcg',
        'thymulin-immune-node': 'mcg',
        'sermorelin-growth-peptide': 'mcg',
        'theanine-ashwagandha-synergy': 'mg',
        'citrus-bergamot-lipids': 'mg',
        'citrus-bergamot-lipids-supp': 'mg',
        'ghk-cu-epitalon-glow-blend': 'mg',
        'semaglutide-l-carnitine-shred-blend': 'mg',
        'pt141-melanotan2-synergy-blend': 'mg',
        'ta1-thymulin-immune-blend': 'mg',
      };

      if (idMap[matchedItem.id]) {
        detectedUnit = idMap[matchedItem.id];
      } else if (typical.includes('mcg')) {
        detectedUnit = 'mcg';
      } else if (typical.includes('iu')) {
        detectedUnit = 'IU';
      } else if (typical.includes('ml')) {
        detectedUnit = 'ml';
      } else {
        detectedUnit = 'mg';
      }

      setDoseUnit(detectedUnit);
      
      // Auto set type and delivery form helpers as well
      if (matchedItem.deliveryForm === 'peptide') {
        setType('peptide');
      } else if (matchedItem.deliveryForm === 'oil') {
        setType('steroid');
        setSteroidForm('oil');
      } else if (matchedItem.deliveryForm === 'pill') {
        setSteroidForm('pill');
        if (matchedItem.id === 'tudca-liver-guard' || matchedItem.id === 'nac-antioxidant' || matchedItem.category === 'supplements') {
          setType('supplement');
        } else if (matchedItem.category === 'muscle') {
          setType('steroid');
        } else {
          setType('compound');
        }
      }
    }
  };

  // Auto-fill form from library trigger
  const triggerAutoFill = (item: LibraryItem) => {
    setName(item.name);
    setNameFromLibrary(true);
    setNameError('');
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
      if (item.id === 'tudca-liver-guard' || item.id === 'nac-antioxidant' || item.category === 'supplements') {
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
      'retatrutide-shred-peptide': { dose: '2', unit: 'mg' },
      'ipamorelin': { dose: '200', unit: 'mcg' },
      'cjc-1295-no-dac': { dose: '100', unit: 'mcg' },
      'ghk-cu': { dose: '2', unit: 'mg' },
      'human-growth-hormone': { dose: '2', unit: 'IU' },
      'igf-1-lr3': { dose: '50', unit: 'mcg' },
      'pt-141': { dose: '1.5', unit: 'mg' },
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
      'masteron-prop': { dose: '100', unit: 'mg', oilConc: '100' },
      'anavar-oxandrolone': { dose: '20', unit: 'mg', pillSize: '10' },
      'dianabol-methandrostenolone': { dose: '25', unit: 'mg', pillSize: '10' },
      'dianabol-muscle': { dose: '25', unit: 'mg', pillSize: '10' },
      'winstrol-stanozolol': { dose: '25', unit: 'mg', pillSize: '10' },
      'winstrol-dry': { dose: '50', unit: 'mg', pillSize: '50' },
      'clenbuterol-hydrochloride': { dose: '40', unit: 'mcg', pillSize: '40' },
      'tudca-liver-guard': { dose: '250', unit: 'mg', pillSize: '250' },
      'tudca-protect': { dose: '500', unit: 'mg', pillSize: '500' },
      'nac-antioxidant': { dose: '600', unit: 'mg', pillSize: '600' },
      'nac-ultimate-glutathione': { dose: '600', unit: 'mg', pillSize: '600' },
      'arimidex-anastrozole': { dose: '0.5', unit: 'mg', pillSize: '1' },
      'anastrozole-estrogen-control': { dose: '0.5', unit: 'mg', pillSize: '1' },
      'nolvadex-tamoxifen': { dose: '20', unit: 'mg', pillSize: '20' },
      'nolvadex-gyno-protection': { dose: '20', unit: 'mg', pillSize: '20' },
      'tesofensine-metabolic-pill': { dose: '500', unit: 'mcg', pillSize: '500' },
      'kisspeptin-10-hormone': { dose: '100', unit: 'mcg' },
      'thymosin-alpha-1-immune': { dose: '1.5', unit: 'mg' },
      'hcg-hormone': { dose: '250', unit: 'IU' },
      'l-carnitine': { dose: '1000', unit: 'mg', pillSize: '500' },
      'exemestane-suicide-aromasin': { dose: '12.5', unit: 'mg', pillSize: '25' },
      'clomid-pct-stimulator': { dose: '50', unit: 'mg', pillSize: '50' },
      'dsip-delta-sleep': { dose: '100', unit: 'mcg' },
      'thymulin-immune-node': { dose: '100', unit: 'mcg' },
      'sermorelin-growth-peptide': { dose: '250', unit: 'mcg' },
      'theanine-ashwagandha-synergy': { dose: '1', unit: 'mg', pillSize: '1' },
      'citrus-bergamot-lipids': { dose: '500', unit: 'mg', pillSize: '500' },
      'citrus-bergamot-lipids-supp': { dose: '500', unit: 'mg', pillSize: '500' },
      'ghk-cu-epitalon-glow-blend': { dose: '1.5', unit: 'mg' },
      'semaglutide-l-carnitine-shred-blend': { dose: '0.25', unit: 'mg' },
      'pt141-melanotan2-synergy-blend': { dose: '1.5', unit: 'mg' },
      'ta1-thymulin-immune-blend': { dose: '1.5', unit: 'mg' },
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

  // Reset success state if modal is closed
  React.useEffect(() => {
    if (!showForm) {
      setShowAddSuccessPrompt(false);
      setAddedCompoundName(null);
    }
  }, [showForm]);

  // Handle Reconstitution math application from integrated calculator modal
  const handleApplyCalcConfig = (config: { vialSizeMg: number; bacWaterMl: number; doseUnit: string; doseAmount: number }) => {
    setVialSizeMg(config.vialSizeMg.toString());
    setBacWaterMl(config.bacWaterMl.toString());
    setDoseAmount(config.doseAmount.toString());
    setDoseUnit(config.doseUnit as any);
    setType('peptide'); // Automatically categorize as a peptide
    setShowCalcModal(false);
    triggerHaptic('success');
  };

  // Handle edit selection
  const handleStartEdit = (comp: Compound) => {
    setEditingId(comp.id);
    setName(comp.name);
    setNameFromLibrary(true);
    setNameError('');
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

    // Selection-only enforcement: only for NEW, user-typed entries.
    // Library picks, edits of existing compounds, and app-set names (nameFromLibrary=true) pass through.
    let finalName = name.trim();
    if (!editingId && !nameFromLibrary) {
      const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
      const typed = norm(finalName);
      // Exact (normalized) match → accept as-is.
      const exact = PEPTIDE_LIBRARY.find((it) => norm(it.name) === typed);
      if (exact) {
        finalName = exact.name;
      } else {
        // Closest match: a library item whose name contains, or is contained by, the typed text.
        const close = PEPTIDE_LIBRARY.find((it) => {
          const n = norm(it.name);
          return n.includes(typed) || typed.includes(n);
        });
        if (close) {
          finalName = close.name; // auto-snap to closest
        } else {
          // No match at all → block submit and prompt to pick from the list.
          setNameError('Please choose a compound from the list.');
          setShowSuggestions(true);
          return;
        }
      }
    }
    setNameError('');

    const data: Compound = {
      id: editingId || crypto.randomUUID(),
      name: finalName,
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

    const submittedName = data.name;

    if (editingId) {
      onUpdateCompound(data);
      // Reset Form Fields
      setName('');
      setType('peptide');
      setVialSizeMg('');
      setBacWaterMl('');
      setDoseAmount('1');
      setDoseUnit('mg');
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
    } else {
      onAddCompound(data);
      setAddedCompoundId(data.id);
      setAddedCompoundName(submittedName);
      setShowAddSuccessPrompt(true);

      // Reset Form Fields in background
      setName('');
      setType('peptide');
      setVialSizeMg('');
      setBacWaterMl('');
      setDoseAmount('1');
      setDoseUnit('mg');
      setFrequency('daily');
      setCustomDays('3');
      setStartDate(new Date().toISOString().split('T')[0]);
      setDurationWeeks(8);
      setNotes('');
      setColor(PRESET_COLORS[0]);
      setSteroidForm('oil');
      setPillSizeMg('10');
      setOilConcMgMl('250');
      setEditingId(null);
    }
    triggerHaptic('success');
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

  const renderGanttTimeline = () => {
    if (compounds.length === 0) {
      return (
        <div className="text-center py-12 text-slate-500 text-xs">
          No compounds configured. Click "Formulate New Compound" above to map out a sequence.
        </div>
      );
    }

    const maxWeeks = Math.max(12, ...compounds.map(c => c.durationWeeks));
    const weeksHeader = Array.from({ length: maxWeeks }).map((_, i) => i + 1);
    const activeComp = compounds.find(c => c.id === selectedGanttId) ?? compounds[0];
    const activeWk = selectedGanttWeek ?? Math.max(1, ganttElapsedWeek(activeComp));
    const phase = ganttPhaseInfo(activeComp, activeWk);
    const libItem = ganttLibraryItem(activeComp);

    return (
      <div className="space-y-5">
        {/* Legend */}
        <div className="flex flex-wrap gap-2 text-[10px] font-mono leading-none items-center">
          <span className="flex items-center gap-1.5 bg-[#141b2e] border border-cyan-500/25 px-2.5 py-1.5 rounded-xl text-cyan-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            Current Week
          </span>
          <span className="flex items-center gap-1.5 bg-indigo-950/40 border border-indigo-500/20 px-2.5 py-1.5 rounded-xl text-indigo-300 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            Selected
          </span>
        </div>

        {/* Swimlane grid */}
        <div className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-800" id="gantt-chart-viewport">
          <div className="min-w-[700px] space-y-3.5">
            <div
              className="font-mono text-[10px] font-bold text-slate-500 border-b border-[#1e293b]/45 pb-2.5 cursor-default select-none"
              style={{ display: 'grid', gridTemplateColumns: `repeat(${maxWeeks + 3}, minmax(0, 1fr))`, gap: '6px' }}
            >
              <div className="col-span-3 text-left pl-2 text-slate-400 uppercase tracking-widest text-[9px] flex items-center">
                Substance / Schedule
              </div>
              {weeksHeader.map(w => (
                <div key={`wk-hdr-${w}`} className="col-span-1 flex justify-center items-center text-center">WK {w}</div>
              ))}
            </div>

            {compounds.map(comp => {
              const elapsedWk = ganttElapsedWeek(comp);
              const isSelectedComp = activeComp?.id === comp.id;

              return (
                <div
                  key={`gantt-row-${comp.id}`}
                  style={{ display: 'grid', gridTemplateColumns: `repeat(${maxWeeks + 3}, minmax(0, 1fr))`, gap: '6px' }}
                  className="items-center"
                >
                  <div
                    onClick={() => {
                      setSelectedGanttId(comp.id);
                      setSelectedGanttWeek(Math.max(1, Math.min(comp.durationWeeks, elapsedWk || 1)));
                    }}
                    className={`col-span-3 text-left pl-3 py-2 cursor-pointer transition rounded-xl border flex flex-col justify-center gap-0.5 ${
                      isSelectedComp ? 'bg-[#1e293b]/60 border-slate-700/80' : 'hover:bg-[#1e293b]/20 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: comp.color }} />
                      <span className="text-xs font-bold text-slate-200 truncate">{comp.name}</span>
                    </div>
                    <div className="text-[9px] text-slate-500 font-mono truncate uppercase pl-3.5">
                      {comp.doseAmount}{comp.doseUnit} • {comp.frequency.replace('_', ' ')}
                    </div>
                  </div>

                  {weeksHeader.map((w, idx) => {
                    const isActive = idx < comp.durationWeeks;
                    const isCurrent = w === elapsedWk;
                    const isSelected = isSelectedComp && activeWk === w;
                    const isInitiation = w <= 2;
                    const isPeak = w > 2 && w <= Math.round(comp.durationWeeks * 0.7);

                    return (
                      <button
                        key={`cell-${comp.id}-${w}`}
                        disabled={!isActive}
                        onClick={() => { setSelectedGanttId(comp.id); setSelectedGanttWeek(w); }}
                        className={`col-span-1 h-12 relative flex flex-col justify-between items-center rounded-xl border text-[10px] font-mono transition-all py-2 select-none ${
                          isActive ? 'cursor-pointer hover:scale-[1.03]' : 'cursor-not-allowed opacity-15 bg-slate-900/10 border-slate-900/20'
                        }`}
                        style={
                          isActive && isSelected
                            ? { backgroundColor: `${comp.color}25`, borderColor: comp.color, color: '#f8fafc', boxShadow: `0 0 10px ${comp.color}20` }
                            : isActive
                            ? { backgroundColor: `${comp.color}08`, borderColor: `${comp.color}25` }
                            : {}
                        }
                      >
                        {isActive && isCurrent && (
                          <span className="absolute -top-1 -right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
                          </span>
                        )}
                        <span className="text-[10px] font-semibold">{isActive ? comp.doseAmount : '—'}</span>
                        <div className="text-[8px] scale-90 tracking-tight text-slate-500 uppercase leading-none font-semibold">
                          {isActive ? (isInitiation ? 'Onset' : isPeak ? 'Peak' : 'Mature') : 'Off'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Phase detail panel */}
        {activeComp && (
          <div
            className="bg-[#101b2e]/60 border border-slate-800/80 rounded-2xl p-5 shadow-xl text-left relative overflow-hidden transition-all duration-300"
            style={{ borderLeft: `4px solid ${activeComp.color}` }}
          >
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 rounded-full opacity-[0.03] pointer-events-none" style={{ backgroundColor: activeComp.color }} />

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#1e293b]/70 pb-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] font-mono font-bold bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded-full uppercase border border-indigo-500/10">
                    Week {activeWk} Phase Map
                  </span>
                  <span
                    className="text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase"
                    style={{ backgroundColor: `${activeComp.color}15`, color: activeComp.color, border: `1px solid ${activeComp.color}25` }}
                  >
                    {activeComp.type}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 flex-wrap">
                  <span>{activeComp.name}</span>
                  <span className="text-slate-500 font-mono text-xs font-normal">
                    ({activeComp.doseAmount} {activeComp.doseUnit} {activeComp.frequency.replace('_', ' ')})
                  </span>
                </h4>
              </div>
              <div className="flex gap-2 text-xs font-mono">
                <div className="bg-slate-900/45 border border-slate-800 px-3 py-1.5 rounded-xl text-left min-w-[85px]">
                  <span className="text-[8px] text-slate-500 block uppercase font-bold">Half-life</span>
                  <span className="text-[10px] text-slate-300 font-semibold truncate block mt-0.5">{libItem?.halfLife || 'Variable/N/A'}</span>
                </div>
                <div className="bg-slate-900/45 border border-slate-800 px-3 py-1.5 rounded-xl text-left min-w-[85px]">
                  <span className="text-[8px] text-slate-500 block uppercase font-bold">Form</span>
                  <span className="text-[10px] text-slate-300 font-semibold uppercase mt-0.5 block truncate">{activeComp.steroidForm || activeComp.type || 'Pill'}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5">
              <div className="lg:col-span-7 space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold font-mono tracking-wider" style={{ color: activeComp.color }}>Active Phase</span>
                  <h5 className="text-sm font-bold text-slate-200">{phase.title}</h5>
                  <p className="text-xs text-slate-400 leading-relaxed mt-1">{phase.description}</p>
                </div>
                <div className="space-y-1.5 bg-[#0f172a]/30 border border-[#1e293b]/40 p-3.5 rounded-xl">
                  <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase tracking-wider block">Expected Outcomes</span>
                  <p className="text-xs text-slate-300 leading-relaxed">{phase.results}</p>
                </div>
              </div>
              <div className="lg:col-span-5 space-y-4 text-xs font-mono">
                <div className="bg-emerald-950/20 border border-emerald-500/20 p-4 rounded-xl space-y-2.5">
                  <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider block">✓ Target Results</span>
                  <ul className="space-y-2 text-slate-300">
                    {phase.benefits.map((b, i) => (
                      <li key={i} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-emerald-400 shrink-0 font-bold">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-rose-950/20 border border-rose-500/20 p-4 rounded-xl space-y-2.5">
                  <span className="text-[9px] text-rose-400 font-bold uppercase tracking-wider block">⚠ Adaptation Warnings</span>
                  <ul className="space-y-2 text-slate-300">
                    {phase.warnings.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-rose-400 shrink-0 font-bold">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {phase.diet && (
              <div className="mt-4 pt-3 border-t border-[#1e293b]/60 flex items-start gap-2 text-xs md:items-center">
                <Info className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <span className="font-bold text-slate-400">Dietary Co-Factors: </span>
                  <span className="text-slate-300">{phase.diet}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6" id="planner-main-container">
      {/* Top action bar buttons */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <h3 className="text-base font-semibold text-slate-100">
          Cycle Administration Architecture
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-[#1e293b]/40 text-slate-400 border border-slate-700/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
            {compounds.length} Compounds Actioned
          </span>
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
              setDoseAmount('1');
              setDoseUnit('mg');
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
      {visibility.dataControls && showDataControls && (
        <div className="bg-[#0f172a]/70 border border-[#1e293b]/80 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-4" id="data-controls-panel">
          <div className="flex items-center justify-between border-b border-[#1e293b]/60 pb-3">
            <h4 className="text-sm font-semibold text-slate-200">Local Cycle Syncing & Backup Data</h4>
            {confirmingReset ? (
              <div className="flex items-center gap-1.5 bg-red-950/20 border border-red-500/20 p-1 rounded-lg text-[10px]">
                <span className="text-red-400 font-bold font-mono uppercase tracking-wider text-[9px] shrink-0">Wipe all cycles?</span>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('warning');
                    onResetData();
                    setConfirmingReset(false);
                  }}
                  className="px-2 py-0.5 bg-red-600 hover:bg-red-700 active:scale-[0.95] text-white rounded text-[9px] font-bold uppercase transition"
                >
                  Yes, Wipe
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setConfirmingReset(false);
                  }}
                  className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 active:scale-[0.95] text-slate-300 rounded text-[9px] font-bold uppercase transition"
                >
                  No
                </button>
              </div>
            ) : (
              <button 
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setConfirmingReset(true);
                }}
                className="px-2.5 py-1 bg-red-950/20 hover:bg-red-950/60 text-red-100 hover:text-red-400 border border-red-500/10 hover:border-red-500/20 text-[10px] font-mono rounded transition cursor-pointer"
                id="reset-cycle-btn"
              >
                Reset All Cycle Data
              </button>
            )}
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
      {visibility.gantt && (
      <div className="bg-[#0f172a]/70 border border-[#1e293b]/80 rounded-2xl p-6 shadow-xl backdrop-blur-md" id="gantt-chart-card">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-indigo-400" />
            <span>Bio-Timeline & Phase Sequence Map</span>
          </h4>
        </div>
        <p className="text-slate-500 text-[11px] mb-5">Interactive swimlane timeline mapping substance saturation across cycle weeks. Click any active week cell to inspect its phase transitions, expected gains, and adaptation warnings.</p>
        {renderGanttTimeline()}
      </div>
      )}

      {/* Post-Cycle Therapy (PCT) Intelligent Suggester Hub */}
      {visibility.pct && (() => {
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
                                setNameFromLibrary(true);
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
                {confirmingDeleteId === comp.id ? (
                  <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 p-1.5 rounded-xl text-[10px] select-none shrink-0" id={`confirm-delete-actions-${comp.id}`}>
                    <span className="text-rose-400 font-bold font-mono uppercase tracking-widest text-[9px]">Delete?</span>
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('warning');
                        onDeleteCompound(comp.id);
                        setConfirmingDeleteId(null);
                      }}
                      className="px-2 py-1 bg-rose-600 hover:bg-rose-700 active:scale-[0.95] text-white rounded text-[9px] font-bold uppercase transition"
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setConfirmingDeleteId(null);
                      }}
                      className="px-2 py-1 bg-[#1e293b] hover:bg-slate-800 active:scale-[0.95] text-slate-300 border border-slate-700/50 rounded text-[9px] font-bold uppercase transition"
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => {
                        triggerHaptic('light');
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
                      onClick={() => {
                        triggerHaptic('light');
                        handleStartEdit(comp);
                      }}
                      className="p-1.5 text-slate-400 hover:text-cyan-400 transition"
                      title="Edit compound features"
                      id={`edit-comp-${comp.id}`}
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        triggerHaptic('warning');
                        setConfirmingDeleteId(comp.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 rounded transition"
                      title="Terminate compound"
                      id={`delete-comp-${comp.id}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
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
                      {(() => {
                        const doseInMcg = comp.doseUnit === 'mg' ? comp.doseAmount * 1000 : comp.doseAmount;
                        const mcgPerUnit = (comp.vialSizeMg * 1000) / (comp.bacWaterMl * 100);
                        return Math.round((doseInMcg / mcgPerUnit) * 10) / 10;
                      })()} Units
                    </span> on standard syringe ({comp.vialSizeMg}mg in {comp.bacWaterMl}ml).
                  </div>
                </div>
              )}

              {/* Per-vial supply tracker (peptides with a known vial size) */}
              {comp.type === 'peptide' && comp.vialSizeMg && comp.doseAmount > 0 && (() => {
                // mg per single dose (convert mcg -> mg)
                const mgPerDose = comp.doseUnit === 'mcg' ? comp.doseAmount / 1000 : comp.doseAmount;
                if (mgPerDose <= 0) return null;
                const dosesPerVial = comp.vialSizeMg / mgPerDose;
                if (!isFinite(dosesPerVial) || dosesPerVial <= 0) return null;
                // Count logged doses for this compound
                const dosesLogged = logs.filter((l) => l.compoundId === comp.id).length;
                // Per-vial semantics: track usage within the CURRENT vial only.
                // Doses into the current vial = remainder after full vials are used up.
                const dosesIntoCurrentVial = dosesLogged % Math.max(1, Math.floor(dosesPerVial) || 1);
                const usedMgThisVial = dosesIntoCurrentVial * mgPerDose;
                const remainingMg = Math.max(0, comp.vialSizeMg - usedMgThisVial);
                const dosesRemaining = Math.max(0, Math.floor(remainingMg / mgPerDose));
                const pctUsed = Math.min(100, (usedMgThisVial / comp.vialSizeMg) * 100);
                const pctRemaining = 100 - pctUsed;
                const lowSupply = dosesRemaining <= 3 || pctRemaining < 20;
                const barColor = lowSupply ? '#f87171' : '#22d3ee';
                return (
                  <div className={`p-2.5 rounded-xl text-[10px] border flex flex-col gap-1.5 ${lowSupply ? 'bg-red-500/5 border-red-500/20 text-red-300' : 'bg-cyan-500/5 border-cyan-500/10 text-cyan-400'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[11px] flex items-center gap-1">
                        {lowSupply ? <AlertTriangle className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5" />}
                        Current Vial Supply
                      </span>
                      <span className="font-mono">{remainingMg.toFixed(2)} / {comp.vialSizeMg} mg left</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-700/50 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pctUsed}%`, backgroundColor: barColor }} />
                    </div>
                    <span>
                      {dosesRemaining} dose{dosesRemaining === 1 ? '' : 's'} remaining
                      {' '}(~{dosesPerVial.toFixed(1)} per vial){lowSupply ? ' — running low, consider reordering' : ''}
                    </span>
                    {lowSupply && onNavigateToTab && findShopProductMatch(comp.name, comp.vialSizeMg) && (
                      <button
                        type="button"
                        onClick={() => { triggerHaptic('medium'); onNavigateToTab('shop'); }}
                        className="mt-0.5 self-start bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-cyan-200 font-semibold rounded-lg px-2.5 py-1 text-[10px] transition-all cursor-pointer"
                      >
                        Reorder in Shop →
                      </button>
                    )}
                  </div>
                );
              })()}

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

              {/* Per-vial supply tracker for oils (premixed mg/ml in a vial; default 10ml) */}
              {comp.steroidForm === 'oil' && comp.oilConcMgMl && comp.doseAmount > 0 && (() => {
                const vialMl = comp.vialMl ?? 10; // all oil vials assumed 10ml unless specified
                const totalVialMg = comp.oilConcMgMl * vialMl;
                const mgPerDose = comp.doseAmount; // oil doses are entered in mg
                if (mgPerDose <= 0 || totalVialMg <= 0) return null;
                const dosesPerVial = totalVialMg / mgPerDose;
                if (!isFinite(dosesPerVial) || dosesPerVial <= 0) return null;
                const dosesLogged = logs.filter((l) => l.compoundId === comp.id).length;
                const dosesIntoCurrentVial = dosesLogged % Math.max(1, Math.floor(dosesPerVial) || 1);
                const usedMgThisVial = dosesIntoCurrentVial * mgPerDose;
                const remainingMg = Math.max(0, totalVialMg - usedMgThisVial);
                const dosesRemaining = Math.max(0, Math.floor(remainingMg / mgPerDose));
                const pctUsed = Math.min(100, (usedMgThisVial / totalVialMg) * 100);
                const pctRemaining = 100 - pctUsed;
                const lowSupply = dosesRemaining <= 3 || pctRemaining < 20;
                const barColor = lowSupply ? '#f87171' : '#22d3ee';
                return (
                  <div className={`p-2.5 rounded-xl text-[10px] border flex flex-col gap-1.5 ${lowSupply ? 'bg-red-500/5 border-red-500/20 text-red-300' : 'bg-cyan-500/5 border-cyan-500/10 text-cyan-400'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[11px] flex items-center gap-1">
                        {lowSupply ? <AlertTriangle className="w-3.5 h-3.5" /> : <Activity className="w-3.5 h-3.5" />}
                        Current Vial Supply
                      </span>
                      <span className="font-mono">{remainingMg.toFixed(0)} / {totalVialMg.toFixed(0)} mg left</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-700/50 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pctUsed}%`, backgroundColor: barColor }} />
                    </div>
                    <span>
                      {dosesRemaining} dose{dosesRemaining === 1 ? '' : 's'} remaining
                      {' '}(~{dosesPerVial.toFixed(1)} per {vialMl}ml vial){lowSupply ? ' — running low, consider reordering' : ''}
                    </span>
                  </div>
                );
              })()}

              {comp.notes && (
                <p className="text-[11px] text-slate-400 italic bg-[#1e293b]/20 p-2.5 rounded-xl border border-slate-800/80">
                  &ldquo;{comp.notes}&rdquo;
                </p>
              )}

              {/* Retroactive logger button */}
              <div className="pt-2.5 border-t border-slate-800/40 mt-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setRetroactiveCompId(comp.id);
                    setRetroSingleAmount(comp.doseAmount.toString());
                    setRetroBatchFreq(comp.frequency === 'custom' ? 'daily' : comp.frequency);
                  }}
                  className="w-full py-2 px-3 bg-[#1e293b]/55 hover:bg-[#1e293b]/90 text-slate-300 hover:text-cyan-400 border border-slate-800 hover:border-cyan-500/30 text-[10.5px] font-extrabold uppercase tracking-wide font-mono rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                  id={`sync-past-doses-btn-${comp.id}`}
                >
                  <History className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
                  <span>Retroactive Dose Sync</span>
                </button>
              </div>
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

          {(() => {
            const {
              hasOral, hasInjectable, hasAromatizing, hasJointStrain, hasSuppressive, hasStimulant,
              liverSupportInCycle, vitaminsInCycle, jointHealthInCycle, estrogenControlInCycle, endocrineShieldInCycle, jitterRescueInCycle
            } = cycleTriggers;

            const isCycleEmpty = compounds.length === 0;

            const allSuites = [
              {
                id: 'liver-support',
                category: 'Liver Support',
                title: 'TUDCA & NAC',
                imgSrc: protocolIcon('liver'),
                themeColorText: 'text-cyan-400',
                themeColorBtn: 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/20 text-cyan-300',
                themeColorHoverBorder: 'hover:border-cyan-500/30',
                badgeText: 'ORGAN PROTECTION',
                isTriggered: hasOral,
                isAlreadyInCycle: liverSupportInCycle,
                compoundPreset: {
                  name: "TUDCA + NAC Liver Protection",
                  type: "supplement",
                  doseAmount: 1100,
                  doseUnit: "mg",
                  frequency: "daily",
                  durationWeeks: 8,
                  color: "#ec4899",
                  isCompleted: false,
                  steroidForm: "pill",
                  pillSizeMg: 500,
                  notes: "Oral hepatotoxicity guard. Added to keep AST/ALT liver enzyme markers in clinical ranges during active cycles."
                }
              },
              {
                id: 'vitamins',
                category: 'Vitamins',
                title: 'CoQ10 + Omega-3',
                imgSrc: protocolIcon('coq10'),
                themeColorText: 'text-purple-400',
                themeColorBtn: 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/20 text-purple-300',
                themeColorHoverBorder: 'hover:border-purple-500/30',
                badgeText: 'CARDIO DEFENSE',
                isTriggered: hasInjectable || isCycleEmpty,
                isAlreadyInCycle: vitaminsInCycle,
                compoundPreset: {
                  name: "CoQ10 + Omega-3 Vital Complex",
                  type: "supplement",
                  doseAmount: 2000,
                  doseUnit: "mg",
                  frequency: "daily",
                  durationWeeks: 12,
                  color: "#a855f7",
                  isCompleted: false,
                  notes: "Supports healthy fluid pressure and optimizes lipid ratios (HDL/LDL) during active cycles."
                }
              },
              {
                id: 'joint-health',
                category: 'Joint Health',
                title: 'Glucosamine Complex',
                imgSrc: protocolIcon('joint'),
                themeColorText: 'text-emerald-400',
                themeColorBtn: 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-300',
                themeColorHoverBorder: 'hover:border-emerald-500/30',
                badgeText: 'ARTICULAR CARE',
                isTriggered: hasJointStrain,
                isAlreadyInCycle: jointHealthInCycle,
                compoundPreset: {
                  name: "Glucosamine + Joint MSM Cure",
                  type: "supplement",
                  doseAmount: 1500,
                  doseUnit: "mg",
                  frequency: "daily",
                  durationWeeks: 12,
                  color: "#10b981",
                  isCompleted: false,
                  notes: "Preserves joint synovial fluid and connective tissues against high structural load/dryness side effects."
                }
              },
              {
                id: 'estrogen-control',
                category: 'Estrogen Control',
                title: 'Arimidex AI Shield',
                imgSrc: protocolIcon('estrogen'),
                themeColorText: 'text-amber-400',
                themeColorBtn: 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20 text-amber-300',
                themeColorHoverBorder: 'hover:border-amber-500/30',
                badgeText: 'ESTROGEN DEFENSE',
                isTriggered: hasAromatizing,
                isAlreadyInCycle: estrogenControlInCycle,
                compoundPreset: {
                  name: "Arimidex (Anastrozole) Estrogen Control",
                  type: "supplement",
                  doseAmount: 0.5,
                  doseUnit: "mg",
                  frequency: "eod",
                  durationWeeks: 12,
                  color: "#f59e0b",
                  isCompleted: false,
                  steroidForm: "pill",
                  pillSizeMg: 1,
                  notes: "Blocks conversion of excess circulating androgens into Estradiol. Prevents water retention and gynecomastia."
                }
              },
              {
                id: 'endocrine-shield',
                category: 'Endocrine Support',
                title: 'HCG Endocrine Shield',
                imgSrc: protocolIcon('endocrine'),
                themeColorText: 'text-indigo-400',
                themeColorBtn: 'bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/20 text-indigo-300',
                themeColorHoverBorder: 'hover:border-indigo-500/30',
                badgeText: 'HPTA RECOVERY',
                isTriggered: hasSuppressive,
                isAlreadyInCycle: endocrineShieldInCycle,
                compoundPreset: {
                  name: "hCG Endocrine Shield",
                  type: "peptide",
                  doseAmount: 250,
                  doseUnit: "IU",
                  frequency: "twice_weekly",
                  durationWeeks: 12,
                  color: "#6366f1",
                  isCompleted: false,
                  notes: "Endogenous LH agonist. Prevents testicular cellular shutdown and ensures smooth high-success PCT recovery."
                }
              },
              {
                id: 'jitter-rescue',
                category: 'CNS Calm Support',
                title: 'Theanine & Ashwagandha',
                imgSrc: protocolIcon('calm'),
                themeColorText: 'text-rose-400',
                themeColorBtn: 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 text-rose-300',
                themeColorHoverBorder: 'hover:border-rose-500/30',
                badgeText: 'STIMULANT MITIGATION',
                isTriggered: hasStimulant,
                isAlreadyInCycle: jitterRescueInCycle,
                compoundPreset: {
                  name: "Theanine & Ashwagandha Synergy",
                  type: "supplement",
                  doseAmount: 1,
                  doseUnit: "mg",
                  frequency: "daily",
                  durationWeeks: 8,
                  color: "#f43f5e",
                  isCompleted: false,
                  steroidForm: "pill",
                  pillSizeMg: 1,
                  notes: "Soothes elevated cortisol, balances core pulse, and alleviates central nervous jitters from thermogenic compounds."
                }
              }
            ];

            const visibleSuites = allSuites.filter(suite => {
              if (suite.isAlreadyInCycle) return false;
              if (isCycleEmpty) {
                return ['liver-support', 'vitamins', 'joint-health'].includes(suite.id);
              }
              return suite.isTriggered;
            });

            if (visibleSuites.length === 0) {
              return (
                <div className="bg-cyan-950/15 border border-cyan-500/25 p-4.5 rounded-2xl flex items-center gap-3.5 text-left max-w-2xl mx-auto" id="all-presets-added-card">
                  <div className="p-2.5 bg-cyan-950/60 border border-cyan-500/20 rounded-xl h-fit shrink-0">
                    <CheckCircle className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-cyan-200 block">All Suggested Protectants Instantiated</span>
                    <p className="text-[11px] text-slate-400 leading-normal mt-0.5">
                      Your current active cycle is fully safeguarded! All dynamic support suites matching your compounds have been added to your cycle.
                    </p>
                  </div>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {visibleSuites.map((suite) => (
                  <div 
                    key={suite.id}
                    className={`bg-[#0f172a]/80 border border-slate-800 p-3 rounded-xl flex items-center gap-3.5 ${suite.themeColorHoverBorder} transition-all duration-300`} 
                    id={`preset-card-${suite.id}`}
                  >
                    <img 
                      src={suite.imgSrc} 
                      alt={`${suite.category} Icon`} 
                      className="w-12 h-12 rounded-lg bg-black/40 border border-[#1e293b]/80 object-cover shrink-0" 
                      referrerPolicy="no-referrer"
                    />
                    <div className="space-y-1 flex-1 text-left">
                      <span className={`text-[9px] font-mono font-bold tracking-wider uppercase block ${suite.themeColorText}`}>
                        {suite.category}
                      </span>
                      <span className="text-xs font-extrabold text-slate-200 block">
                        {suite.title}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const preset: Compound = {
                            id: `supp-${suite.id}-${Date.now()}`,
                            ...suite.compoundPreset,
                            startDate: new Date().toISOString().split('T')[0],
                          } as any;
                          onAddCompound(preset);
                        }}
                        className={`text-[10px] px-2.5 py-0.5 rounded-lg border font-bold transition cursor-pointer inline-block ${suite.themeColorBtn}`}
                        id={`add-preset-${suite.id}-btn`}
                      >
                        + Add Preset
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
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
              dosage: 'Fiber: 5-10 g, Whey: 0.7g per lb weight daily',
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
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('medium');
                      setShowForm(false);
                      if (onNavigateToTab) {
                        onNavigateToTab('dashboard');
                      }
                    }}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm tracking-wide transition shadow-[0_0_15px_rgba(34,211,238,0.15)] flex items-center justify-center gap-2 cursor-pointer"
                    id="success-go-to-cycle-btn"
                  >
                    <span>Go to My Cycle Checklist</span>
                    <ArrowLeftRight className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setShowAddSuccessPrompt(false);
                      setAddedCompoundName(null);
                    }}
                    className="flex-1 py-3 px-4 bg-[#1e293b]/85 border border-[#1e293b] hover:border-slate-700 text-slate-300 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer"
                    id="success-add-another-btn"
                  >
                    <span>Add Another Compound</span>
                    <Plus className="w-4 h-4 shrink-0" strokeWidth={2.5} />
                  </button>
                </div>

                {/* Highly discoverable, professional retro-sync option */}
                <div className="bg-[#1e293b]/35 border border-[#1e293b] p-4.5 rounded-2xl text-left w-full space-y-2.5 mt-2" id="success-retro-sync-card">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                    <History className="w-4 h-4 text-cyan-400" />
                    <span>Sync Historic Administrations?</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    Are you transferring record state from another logging system? You can retroactively fill past doses now to automatically balance and calibrate your cycle start date.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setShowForm(false);
                      setShowAddSuccessPrompt(false);
                      setAddedCompoundName(null);
                      if (addedCompoundId) {
                        setRetroactiveCompId(addedCompoundId);
                      }
                    }}
                    className="w-full py-2.5 bg-cyan-700/20 hover:bg-cyan-600/30 text-cyan-300 hover:text-white border border-cyan-500/30 rounded-xl text-xs font-bold font-mono uppercase transition flex items-center justify-center gap-1.5 cursor-pointer"
                    id="success-retro-sync-btn"
                  >
                    <span>Configure Historical Dose Logs</span>
                  </button>
                </div>
              </div>
            ) : (
              <>
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
                      setNameFromLibrary(false);
                      setNameError('');
                      setShowSuggestions(true);
                      setFocusedSuggestionIndex(-1);
                      if (!editingId) {
                        autoDetectDoseUnitAndFormFromName(e.target.value);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (!showSuggestions || suggestions.length === 0) return;
                      if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        setFocusedSuggestionIndex(prev => (prev + 1) % suggestions.length);
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        setFocusedSuggestionIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
                      } else if (e.key === 'Enter') {
                        if (focusedSuggestionIndex >= 0 && focusedSuggestionIndex < suggestions.length) {
                          e.preventDefault();
                          handleSelectSuggestion(suggestions[focusedSuggestionIndex]);
                        }
                      } else if (e.key === 'Escape') {
                        setShowSuggestions(false);
                      }
                    }}
                    onFocus={() => {
                      setShowSuggestions(true);
                      setFocusedSuggestionIndex(-1);
                    }}
                    onBlur={() => {
                      // Slight delay to allow clicking suggestion item mouse events to fire successfully
                      setTimeout(() => setShowSuggestions(false), 200);
                    }}
                    placeholder="Enter chemical title or starting letters..."
                    className="w-full bg-[#1e293b]/45 border border-slate-700/60 rounded-xl py-2 px-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/30 transition shadow-inner"
                    id="form-name-input"
                    autoComplete="off"
                  />
                  {nameError && (
                    <p className="text-[11px] text-red-400 mt-1 font-medium">{nameError}</p>
                  )}
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 w-full mt-1.5 bg-[#0f172a] border border-[#1e293b] rounded-xl shadow-2xl overflow-y-auto max-h-48 z-50 divide-y divide-slate-800/60 custom-scrollbar" id="name-autocomplete-dropdown">
                      <div className="px-3 py-1 bg-slate-900/45 text-[9px] font-mono text-slate-500 tracking-wider uppercase font-semibold">Matched Encyclopedia Suggestions</div>
                      {suggestions.map((item, idx) => (
                        <button
                          key={`autocomplete-${item.id}`}
                          type="button"
                          onMouseDown={() => handleSelectSuggestion(item)}
                          onMouseEnter={() => setFocusedSuggestionIndex(idx)}
                          className={`w-full text-left p-2.5 transition-colors flex items-center justify-between text-xs cursor-pointer group ${
                            focusedSuggestionIndex === idx 
                              ? 'bg-cyan-500/10 text-cyan-200 border-l-2 border-cyan-500 pl-2' 
                              : 'hover:bg-cyan-500/10 hover:text-cyan-200'
                          }`}
                        >
                          <div>
                            <span className={`font-bold transition-colors block ${focusedSuggestionIndex === idx ? 'text-cyan-300' : 'text-slate-200 group-hover:text-cyan-300'}`}>{item.name}</span>
                            {item.chemicalName && (
                              <span className={`text-[10px] font-mono block mt-0.5 transition-colors ${focusedSuggestionIndex === idx ? 'text-slate-300' : 'text-slate-400 group-hover:text-slate-300'}`}>{item.chemicalName}</span>
                            )}
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-semibold border transition-colors uppercase shrink-0 ${
                            focusedSuggestionIndex === idx
                              ? 'bg-cyan-500 text-slate-950 border-cyan-500'
                              : 'bg-cyan-950/45 text-cyan-400 border-cyan-500/25 group-hover:bg-cyan-500 group-hover:text-slate-950'
                          }`}>
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
                <div className="space-y-1.5 col-span-2 sm:col-span-1">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-300">Dose Quantity</label>
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setShowCalcModal(true);
                      }}
                      className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono bg-cyan-950/45 border border-cyan-500/25 hover:border-cyan-500/45 px-2 py-0.5 rounded transition-all cursor-pointer"
                      id="form-open-recalc-helper"
                      title="Open integrated Peptide Mix Helper and auto-populate results"
                    >
                      <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
                      Peptide Mix Helper
                    </button>
                  </div>
                  <div 
                    className={`relative group transition-all duration-300 rounded-xl ${
                      type === 'peptide' 
                        ? 'border border-dashed border-cyan-500/30 bg-cyan-500/5 hover:border-cyan-500/50 hover:bg-cyan-500/10 p-1' 
                        : ''
                    }`}
                  >
                    <div className="flex gap-1 bg-[#1e293b]/45 border border-slate-700/60 rounded-xl pr-2 items-center">
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
                  {type === 'peptide' && (
                    <p className="text-[10px] text-cyan-400 flex items-center gap-1.5 leading-normal opacity-90 mt-1">
                      <span>💡 Reconstitution active. Tap <span className="underline font-bold cursor-pointer hover:text-cyan-300" onClick={() => setShowCalcModal(true)}>Peptide Mix Helper</span> to calculate syringe tick marks.</span>
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Administration Frequency</label>
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
          </>
        )}
          </div>
        </div>,
        document.body
      )}

      {/* Reconstitution Calculator integration popup helper */}
      {showCalcModal && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 bg-[#020617]/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-[60]" id="calc-helper-overlay">
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-3xl p-4 sm:p-6 w-full max-w-5xl shadow-2xl relative space-y-4 my-2 sm:my-0 flex flex-col max-h-[95vh] text-left" id="calc-helper-modal">
            {/* Header */}
            <div className="flex justify-between items-center pb-3 border-b border-[#1e293b] shrink-0">
              <div>
                <h4 className="text-base sm:text-lg font-black text-slate-100 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                  <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                  Peptide Mix Helper
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Configure peptide/compound titration, inspect visual syringe scale tick marks, and apply to formulation state instantly.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('light');
                  setShowCalcModal(false);
                }}
                className="p-1.5 px-3 border border-[#1e293b] hover:border-slate-700 bg-[#1e293b]/45 text-slate-400 hover:text-slate-200 text-xs font-semibold rounded-lg transition shrink-0 cursor-pointer"
                id="close-calc-helper-btn"
              >
                Close
              </button>
            </div>

            {/* Scrollable container with the active calculator */}
            <div className="overflow-y-auto flex-grow pr-1 custom-scrollbar">
              <ReconstitutionCalculator
                onApplyConfig={handleApplyCalcConfig}
                initialVialMg={parseFloat(vialSizeMg) || 5}
                initialWaterMl={parseFloat(bacWaterMl) || 2}
                initialDoseMcg={
                  doseUnit === 'mcg'
                    ? (parseFloat(doseAmount) || 250)
                    : (doseUnit === 'mg' ? (parseFloat(doseAmount) * 1000 || 250) : 250)
                }
              />
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Retroactive Dose Sync Modal integration portal */}
      {retroactiveCompId && (() => {
        const retroComp = compounds.find(c => c.id === retroactiveCompId);
        if (!retroComp) return null;

        const retroLogs = logs.filter(l => l.compoundId === retroactiveCompId);
        const sortedRetroLogs = [...retroLogs].sort((a, b) => {
          const dDiff = b.date.localeCompare(a.date);
          if (dDiff !== 0) return dDiff;
          return b.time.localeCompare(a.time);
        });

        const getDatesRangeForFrequency = (start: string, end: string, freq: 'daily' | 'eod' | 'twice_weekly' | 'weekly') => {
          const dates: string[] = [];
          const curr = new Date(start + 'T00:00:00');
          const last = new Date(end + 'T00:00:00');
          if (curr > last) return [];

          let count = 0;
          while (curr <= last && count < 200) {
            dates.push(curr.toISOString().split('T')[0]);
            count++;
            if (freq === 'daily') {
              curr.setDate(curr.getDate() + 1);
            } else if (freq === 'eod') {
              curr.setDate(curr.getDate() + 2);
            } else if (freq === 'twice_weekly') {
              curr.setDate(curr.getDate() + 3);
            } else if (freq === 'weekly') {
              curr.setDate(curr.getDate() + 7);
            }
          }
          return dates;
        };

        const batchDates = getDatesRangeForFrequency(retroBatchStart, retroBatchEnd, retroBatchFreq);

        const handleAddSingle = (e: React.FormEvent) => {
          e.preventDefault();
          if (!onLogDose) return;

          const calculatedQtyText = (() => {
            if (retroComp.vialSizeMg && retroComp.bacWaterMl) {
              const units = Math.round(((retroComp.doseAmount) / ((retroComp.vialSizeMg * 1000) / (retroComp.bacWaterMl * 100))) * 10) / 10;
              return `${units} Units`;
            } else if (retroComp.type === 'steroid' || retroComp.type === 'supplement' || retroComp.type === 'compound') {
              if (retroComp.steroidForm === 'pill' && retroComp.pillSizeMg) {
                const pills = Math.round((retroComp.doseAmount / retroComp.pillSizeMg) * 100) / 100;
                return `${pills} ${pills === 1 ? 'pill' : 'pills'} (${retroComp.pillSizeMg}mg each)`;
              } else if (retroComp.steroidForm === 'oil' && retroComp.oilConcMgMl) {
                const mlStr = (retroComp.doseAmount / retroComp.oilConcMgMl).toFixed(2);
                return `${mlStr} ml / cc (${retroComp.oilConcMgMl}mg/ml)`;
              }
            }
            return undefined;
          })();

          const newLog: DoseLog = {
            id: crypto.randomUUID(),
            compoundId: retroComp.id,
            compoundName: retroComp.name,
            date: retroSingleDate,
            time: retroSingleTime,
            doseAmount: parseFloat(retroSingleAmount) || retroComp.doseAmount,
            doseUnit: retroComp.doseUnit,
            reconstitutedRatio: retroComp.vialSizeMg && retroComp.bacWaterMl ? {
              vialSizeMg: retroComp.vialSizeMg,
              bacWaterMl: retroComp.bacWaterMl,
              syringeUnits: Math.round(((retroComp.doseAmount) / ((retroComp.vialSizeMg * 1000) / (retroComp.bacWaterMl * 100))) * 10) / 10
            } : undefined,
            calculatedQtyText
          };

          triggerHaptic('success');
          onLogDose(newLog);
          triggerHaptic('light');
        };

        const handleAddBatch = () => {
          if (batchDates.length === 0 || !onBatchLogDoses) return;

          const calculatedQtyText = (() => {
            if (retroComp.vialSizeMg && retroComp.bacWaterMl) {
              const units = Math.round(((retroComp.doseAmount) / ((retroComp.vialSizeMg * 1000) / (retroComp.bacWaterMl * 100))) * 10) / 10;
              return `${units} Units`;
            } else if (retroComp.type === 'steroid' || retroComp.type === 'supplement' || retroComp.type === 'compound') {
              if (retroComp.steroidForm === 'pill' && retroComp.pillSizeMg) {
                const pills = Math.round((retroComp.doseAmount / retroComp.pillSizeMg) * 100) / 100;
                return `${pills} ${pills === 1 ? 'pill' : 'pills'} (${retroComp.pillSizeMg}mg each)`;
              } else if (retroComp.steroidForm === 'oil' && retroComp.oilConcMgMl) {
                const mlStr = (retroComp.doseAmount / retroComp.oilConcMgMl).toFixed(2);
                return `${mlStr} ml / cc (${retroComp.oilConcMgMl}mg/ml)`;
              }
            }
            return undefined;
          })();

          const newLogs: DoseLog[] = batchDates.map(dStr => ({
            id: crypto.randomUUID(),
            compoundId: retroComp.id,
            compoundName: retroComp.name,
            date: dStr,
            time: '08:00',
            doseAmount: parseFloat(retroSingleAmount) || retroComp.doseAmount,
            doseUnit: retroComp.doseUnit,
            reconstitutedRatio: retroComp.vialSizeMg && retroComp.bacWaterMl ? {
              vialSizeMg: retroComp.vialSizeMg,
              bacWaterMl: retroComp.bacWaterMl,
              syringeUnits: Math.round(((retroComp.doseAmount) / ((retroComp.vialSizeMg * 1000) / (retroComp.bacWaterMl * 100))) * 10) / 10
            } : undefined,
            calculatedQtyText
          }));

          triggerHaptic('success');
          onBatchLogDoses(newLogs);
          triggerHaptic('light');
        };

        return createPortal(
          <div className="fixed inset-0 bg-[#020617]/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 z-[60]" id="retroactive-sync-overlay">
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-3xl p-4 sm:p-6 w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[92vh] text-left" id="retroactive-sync-modal" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="flex justify-between items-start pb-4 border-b border-[#1e293b] shrink-0">
                <div>
                  <h4 className="text-base sm:text-lg font-black text-slate-100 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                    <History className="w-5 h-5 text-cyan-400" />
                    <span>Retroactive Sync</span>
                  </h4>
                  <p className="text-[10.5px] text-cyan-400 font-bold font-mono mt-0.5 uppercase tracking-wide">
                    {retroComp.name} ({retroComp.type})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setRetroactiveCompId(null);
                  }}
                  className="p-1 px-3 border border-slate-800 hover:border-slate-700 bg-[#1e293b]/40 hover:bg-[#1e293b] text-slate-400 hover:text-slate-200 text-xs font-bold rounded-lg transition"
                  id="close-retro-sync-btn"
                >
                  Close
                </button>
              </div>

              {/* Informational Hero Card */}
              <div className="bg-slate-900/50 p-3.5 rounded-2xl border border-slate-800/80 text-[11px] text-slate-400 mt-3 leading-relaxed flex items-start gap-2.5 shrink-0">
                <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <p>
                    Your cycle schedule automatically centers on your <strong>first documented dosing log</strong>. Log past data below to backdate your cycle safely without losing historical synchronization.
                  </p>
                  {sortedRetroLogs.length > 0 && (
                    <div className="mt-1 text-cyan-300 font-mono font-bold">
                      Earliest Dose Detected: {sortedRetroLogs[sortedRetroLogs.length - 1].date} &rarr; Cycle has automatically shifted its start parameters to match.
                    </div>
                  )}
                </div>
              </div>

              {/* Tab Toggles */}
              <div className="flex bg-[#0f172a] border border-[#1e293b] rounded-xl p-1 mt-4 shrink-0">
                <button
                  type="button"
                  onClick={() => { triggerHaptic('light'); setRetroTab('single'); }}
                  className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                    retroTab === 'single'
                      ? 'bg-[#1e293b] text-slate-100 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Single past dose
                </button>
                <button
                  type="button"
                  onClick={() => { triggerHaptic('light'); setRetroTab('batch'); }}
                  className={`flex-1 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                    retroTab === 'batch'
                      ? 'bg-[#1e293b] text-slate-100 shadow'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Batch Generate Range
                </button>
              </div>

              {/* Form Content - Scrollable */}
              <div className="overflow-y-auto flex-grow my-4 pr-1 custom-scrollbar space-y-4 font-sans">
                {retroTab === 'single' ? (
                  <form onSubmit={handleAddSingle} className="bg-slate-900/20 p-4 border border-slate-800/60 rounded-2xl space-y-4">
                    <h5 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">Input Single Past Dose Log</h5>
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Date</label>
                        <input
                          type="date"
                          required
                          value={retroSingleDate}
                          onChange={(e) => setRetroSingleDate(e.target.value)}
                          className="w-full bg-[#1e293b]/45 border border-slate-700/60 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/80 transition"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Time</label>
                        <input
                          type="time"
                          required
                          value={retroSingleTime}
                          onChange={(e) => setRetroSingleTime(e.target.value)}
                          className="w-full bg-[#1e293b]/45 border border-slate-700/60 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/80 transition"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Dose Amount ({retroComp.doseUnit})</label>
                        <input
                          type="number"
                          step="any"
                          required
                          value={retroSingleAmount}
                          onChange={(e) => setRetroSingleAmount(e.target.value)}
                          className="w-full bg-[#1e293b]/45 border border-slate-700/60 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/80 transition"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          type="submit"
                          className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider font-mono rounded-xl transition cursor-pointer"
                        >
                          Append Log
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="bg-slate-900/20 p-4 border border-slate-800/60 rounded-2xl space-y-4">
                    <h5 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono font-medium">Historical Sequence Generator</h5>
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Start Date</label>
                        <input
                          type="date"
                          required
                          value={retroBatchStart}
                          onChange={(e) => setRetroBatchStart(e.target.value)}
                          className="w-full bg-[#1e293b]/45 border border-slate-700/60 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/80 transition"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">End Date</label>
                        <input
                          type="date"
                          required
                          value={retroBatchEnd}
                          onChange={(e) => setRetroBatchEnd(e.target.value)}
                          className="w-full bg-[#1e293b]/45 border border-slate-700/60 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/80 transition"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Administration Frequency</label>
                        <select
                          value={retroBatchFreq}
                          onChange={(e: any) => setRetroBatchFreq(e.target.value)}
                          className="w-full bg-[#1e293b] border border-slate-700/60 rounded-xl py-1.5 px-3 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/80"
                        >
                          <option value="daily">Daily</option>
                          <option value="eod">Every Other Day (EOD)</option>
                          <option value="twice_weekly">Twice Weekly (Every 3 Days)</option>
                          <option value="weekly">Weekly</option>
                        </select>
                      </div>
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-bold text-slate-400 uppercase font-mono block mb-1">Dose per Entry ({retroComp.doseUnit})</label>
                        <span className="text-xs font-bold text-slate-300 block pt-1.5">{retroSingleAmount || retroComp.doseAmount} {retroComp.doseUnit}</span>
                      </div>
                    </div>

                    {/* Generation preview panel */}
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 flex justify-between items-center text-[11px] font-mono">
                      <div>
                        <span className="text-slate-500">Scheduled Logs To Fill:</span>{' '}
                        <span className="font-bold text-cyan-400 text-xs">{batchDates.length} entries</span>
                      </div>
                      <button
                        type="button"
                        disabled={batchDates.length === 0}
                        onClick={handleAddBatch}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wide rounded-xl transition font-mono cursor-pointer ${
                          batchDates.length === 0
                            ? 'bg-slate-800 text-slate-600 border border-slate-700 pointer-events-none'
                            : 'bg-[#22d3ee] hover:bg-[#06b6d4] text-slate-950 font-black'
                        }`}
                      >
                        Populate Chronology
                      </button>
                    </div>
                  </div>
                )}

                {/* Already logged doses for this compound */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Documented Logs Sync ({sortedRetroLogs.length})</span>
                    </h5>
                  </div>

                  {sortedRetroLogs.length === 0 ? (
                    <div className="text-center py-6 border border-dashed border-slate-800 rounded-2xl text-xs text-slate-500 font-mono">
                      No matching historical logs found in device registers.
                    </div>
                  ) : (
                    <div className="border border-slate-800/80 rounded-xl overflow-hidden divide-y divide-slate-800/60 max-h-48 overflow-y-auto custom-scrollbar">
                      {sortedRetroLogs.map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-2.5 bg-slate-900/10 hover:bg-slate-900/30 text-xs font-mono">
                          <div className="flex items-center gap-2.5">
                            <span className="text-slate-300 font-bold">{log.date}</span>
                            <span className="text-slate-500 text-[10px]">{formatTimeTo12Hour(log.time)}</span>
                            <span className="text-cyan-400 text-[11px] font-bold">
                              {log.doseAmount} {log.doseUnit}
                            </span>
                            {log.calculatedQtyText && (
                              <span className="text-slate-500 text-[9px] font-bold">({log.calculatedQtyText})</span>
                            )}
                          </div>
                          {onUndoDose && (
                            <button
                              type="button"
                              onClick={() => {
                                triggerHaptic('warning');
                                onUndoDose(log.id);
                              }}
                              className="p-1 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-all cursor-pointer"
                              title="Delete dose record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body
        );
      })()}
    </div>
  );
}
