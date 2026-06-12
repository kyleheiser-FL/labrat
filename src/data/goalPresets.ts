export type GoalPresetUnit = 'mcg' | 'mg' | 'IU' | 'ml';
export type GoalPresetFrequency = 'daily' | 'eod' | 'twice_weekly' | 'weekly' | 'custom';
export type GoalPresetColor = 'blue' | 'cyan' | 'amber' | 'rose' | 'green' | 'violet';

export interface GoalPreset {
  id: string;
  label: string;
  tagline: string;
  goalTag: string;
  goalColor: GoalPresetColor;
  doseAmount: string;
  doseUnit: GoalPresetUnit;
  frequency: GoalPresetFrequency;
  durationWeeks: number;
  vialSizeMg?: string;
  bacWaterMl?: string;
}

export const STEROID_GOAL_PRESETS: Record<string, GoalPreset[]> = {
  'testosterone-cypionate': [
    { id: 'trt', label: 'TRT / HRT', tagline: 'Stable clinical hormone maintenance — matches standard medical dosing', goalTag: 'Hormone Health', goalColor: 'blue', doseAmount: '100', doseUnit: 'mg', frequency: 'twice_weekly', durationWeeks: 12 },
    { id: 'lean', label: 'Lean Recomp', tagline: 'Quality muscle gains with minimal estrogenic water retention', goalTag: 'Recomp', goalColor: 'cyan', doseAmount: '175', doseUnit: 'mg', frequency: 'twice_weekly', durationWeeks: 14 },
    { id: 'bulk', label: 'Mass Build', tagline: 'Classic 500mg/week hypertrophy cycle — maximum anabolic output', goalTag: 'Bulking', goalColor: 'amber', doseAmount: '250', doseUnit: 'mg', frequency: 'twice_weekly', durationWeeks: 16 },
    { id: 'cut', label: 'Cutting', tagline: 'Preserve contractile muscle fibers during aggressive caloric deficit', goalTag: 'Fat Loss', goalColor: 'rose', doseAmount: '100', doseUnit: 'mg', frequency: 'twice_weekly', durationWeeks: 10 },
  ],
  'testosterone-enanthate': [
    { id: 'trt', label: 'TRT / HRT', tagline: 'Stable clinical hormone maintenance — long-ester ease of use', goalTag: 'Hormone Health', goalColor: 'blue', doseAmount: '100', doseUnit: 'mg', frequency: 'twice_weekly', durationWeeks: 12 },
    { id: 'lean', label: 'Lean Recomp', tagline: 'Quality muscle gains — 350mg/week sweet spot', goalTag: 'Recomp', goalColor: 'cyan', doseAmount: '175', doseUnit: 'mg', frequency: 'twice_weekly', durationWeeks: 14 },
    { id: 'bulk', label: 'Mass Build', tagline: 'Classic 500mg/week hypertrophy cycle', goalTag: 'Bulking', goalColor: 'amber', doseAmount: '250', doseUnit: 'mg', frequency: 'twice_weekly', durationWeeks: 16 },
    { id: 'cut', label: 'Cutting', tagline: 'Low-dose muscle preservation in caloric deficit', goalTag: 'Fat Loss', goalColor: 'rose', doseAmount: '100', doseUnit: 'mg', frequency: 'twice_weekly', durationWeeks: 10 },
  ],
  'testosterone-propionate': [
    { id: 'trt', label: 'TRT / HRT', tagline: 'Fast-ester TRT for precise level control — 100mg/week', goalTag: 'Hormone Health', goalColor: 'blue', doseAmount: '25', doseUnit: 'mg', frequency: 'eod', durationWeeks: 12 },
    { id: 'lean', label: 'Lean Bulk', tagline: 'Dry, quality muscle with prop ester — minimal water', goalTag: 'Recomp', goalColor: 'cyan', doseAmount: '75', doseUnit: 'mg', frequency: 'eod', durationWeeks: 12 },
    { id: 'cut', label: 'Cutting / Shred', tagline: 'Preserve muscle while cutting — hardening effect', goalTag: 'Fat Loss', goalColor: 'rose', doseAmount: '100', doseUnit: 'mg', frequency: 'eod', durationWeeks: 10 },
  ],
  'deca-durabolin': [
    { id: 'joints', label: 'Joint Recovery', tagline: '100–200mg/week — collagen synthesis & synovial fluid support', goalTag: 'Recovery', goalColor: 'green', doseAmount: '150', doseUnit: 'mg', frequency: 'weekly', durationWeeks: 12 },
    { id: 'lean', label: 'Lean Bulk', tagline: '300mg/week stacked with test base — classic combo', goalTag: 'Recomp', goalColor: 'cyan', doseAmount: '300', doseUnit: 'mg', frequency: 'weekly', durationWeeks: 14 },
    { id: 'bulk', label: 'Mass Accumulation', tagline: '400mg/week — serious muscle and fullness protocol', goalTag: 'Bulking', goalColor: 'amber', doseAmount: '400', doseUnit: 'mg', frequency: 'weekly', durationWeeks: 16 },
  ],
  'trenbolone-acetate': [
    { id: 'cut', label: 'Cutting / Shred', tagline: 'Aggressive fat oxidation + hardening — 150mg/week EOD', goalTag: 'Fat Loss', goalColor: 'rose', doseAmount: '50', doseUnit: 'mg', frequency: 'eod', durationWeeks: 8 },
    { id: 'recomp', label: 'Body Recomp', tagline: 'Simultaneous fat loss and muscle gain — 225mg/week', goalTag: 'Recomp', goalColor: 'cyan', doseAmount: '75', doseUnit: 'mg', frequency: 'eod', durationWeeks: 10 },
    { id: 'lean', label: 'Lean Mass', tagline: 'Dense, dry muscle hypertrophy — 300mg/week', goalTag: 'Bulking', goalColor: 'amber', doseAmount: '100', doseUnit: 'mg', frequency: 'eod', durationWeeks: 8 },
  ],
  'primobolan-enanthate': [
    { id: 'lean', label: 'Lean & Hard', tagline: '400mg/week — clean aesthetics, zero water retention', goalTag: 'Recomp', goalColor: 'cyan', doseAmount: '200', doseUnit: 'mg', frequency: 'twice_weekly', durationWeeks: 12 },
    { id: 'cut', label: 'Contest Prep', tagline: '600mg/week — premium pre-contest compound', goalTag: 'Fat Loss', goalColor: 'rose', doseAmount: '300', doseUnit: 'mg', frequency: 'twice_weekly', durationWeeks: 12 },
  ],
  'masteron-propionate': [
    { id: 'cut', label: 'Cutting / Contest', tagline: 'Hardening agent — anti-estrogen, dry physique', goalTag: 'Fat Loss', goalColor: 'rose', doseAmount: '100', doseUnit: 'mg', frequency: 'eod', durationWeeks: 10 },
    { id: 'recomp', label: 'Aesthetics Recomp', tagline: 'Strength + anti-estrogen + muscle hardness', goalTag: 'Recomp', goalColor: 'cyan', doseAmount: '100', doseUnit: 'mg', frequency: 'eod', durationWeeks: 12 },
  ],
  'masteron-prop': [
    { id: 'cut', label: 'Cutting / Contest', tagline: 'Hardening agent — anti-estrogen, dry physique', goalTag: 'Fat Loss', goalColor: 'rose', doseAmount: '100', doseUnit: 'mg', frequency: 'eod', durationWeeks: 10 },
    { id: 'recomp', label: 'Aesthetics Recomp', tagline: 'Strength + anti-estrogen + muscle hardness', goalTag: 'Recomp', goalColor: 'cyan', doseAmount: '100', doseUnit: 'mg', frequency: 'eod', durationWeeks: 12 },
  ],
};

export const STEROID_CATEGORY_PRESETS: GoalPreset[] = [
  { id: 'trt', label: 'TRT / HRT', tagline: 'Conservative clinical hormone maintenance dose', goalTag: 'Hormone Health', goalColor: 'blue', doseAmount: '100', doseUnit: 'mg', frequency: 'twice_weekly', durationWeeks: 12 },
  { id: 'lean', label: 'Lean Muscle', tagline: 'Moderate cycle — quality gains with manageable sides', goalTag: 'Recomp', goalColor: 'cyan', doseAmount: '150', doseUnit: 'mg', frequency: 'twice_weekly', durationWeeks: 14 },
  { id: 'bulk', label: 'Mass Build', tagline: 'Higher dose for maximum hypertrophy accumulation', goalTag: 'Bulking', goalColor: 'amber', doseAmount: '200', doseUnit: 'mg', frequency: 'twice_weekly', durationWeeks: 16 },
  { id: 'cut', label: 'Cutting', tagline: 'Low dose to retain muscle during caloric deficit', goalTag: 'Fat Loss', goalColor: 'rose', doseAmount: '75', doseUnit: 'mg', frequency: 'twice_weekly', durationWeeks: 10 },
];

export const PEPTIDE_GOAL_PRESETS: Record<string, GoalPreset[]> = {
  'bpc-157': [
    { id: 'healing', label: 'Injury Recovery', tagline: 'Standard sub-Q protocol for active ligament/tendon healing', goalTag: 'Healing', goalColor: 'green', doseAmount: '250', doseUnit: 'mcg', frequency: 'daily', durationWeeks: 8, vialSizeMg: '5', bacWaterMl: '2' },
    { id: 'acute', label: 'Acute Repair', tagline: 'High-dose loading for severe injury — doubled concentration', goalTag: 'Healing', goalColor: 'amber', doseAmount: '500', doseUnit: 'mcg', frequency: 'daily', durationWeeks: 4, vialSizeMg: '5', bacWaterMl: '1' },
    { id: 'gut', label: 'Gut & Systemic Wellness', tagline: 'Lower-dose EOD protocol for gut lining and anti-inflammation', goalTag: 'General Health', goalColor: 'blue', doseAmount: '250', doseUnit: 'mcg', frequency: 'eod', durationWeeks: 12, vialSizeMg: '5', bacWaterMl: '2' },
  ],
  'tb-500': [
    { id: 'load', label: 'Loading Phase', tagline: 'Saturate systemic receptors — 5mg/week for 4 weeks', goalTag: 'Healing', goalColor: 'green', doseAmount: '2.5', doseUnit: 'mg', frequency: 'twice_weekly', durationWeeks: 4, vialSizeMg: '10', bacWaterMl: '2' },
    { id: 'maint', label: 'Maintenance', tagline: 'Continued tissue remodeling — 2.5mg/week ongoing', goalTag: 'Recovery', goalColor: 'cyan', doseAmount: '2.5', doseUnit: 'mg', frequency: 'weekly', durationWeeks: 8, vialSizeMg: '10', bacWaterMl: '2' },
  ],
  'semaglutide': [
    { id: 'start', label: 'Titration Start', tagline: '0.25mg/week — tolerance phase (weeks 1–4)', goalTag: 'Weight Loss', goalColor: 'rose', doseAmount: '0.25', doseUnit: 'mg', frequency: 'weekly', durationWeeks: 4, vialSizeMg: '5', bacWaterMl: '2' },
    { id: 'standard', label: 'Standard Protocol', tagline: '0.5mg/week — effective proven fat loss dose', goalTag: 'Weight Loss', goalColor: 'rose', doseAmount: '0.5', doseUnit: 'mg', frequency: 'weekly', durationWeeks: 12, vialSizeMg: '5', bacWaterMl: '2' },
    { id: 'full', label: 'Full Research Dose', tagline: '1mg/week — maximum clinically studied dose', goalTag: 'Aggressive Cut', goalColor: 'amber', doseAmount: '1', doseUnit: 'mg', frequency: 'weekly', durationWeeks: 12, vialSizeMg: '5', bacWaterMl: '2' },
  ],
  'tirzepatide': [
    { id: 'start', label: 'Titration Start', tagline: '2.5mg/week — GIP/GLP-1 dual agonist tolerance phase', goalTag: 'Weight Loss', goalColor: 'rose', doseAmount: '2.5', doseUnit: 'mg', frequency: 'weekly', durationWeeks: 4, vialSizeMg: '10', bacWaterMl: '2' },
    { id: 'standard', label: 'Standard Protocol', tagline: '5mg/week — proven fat loss dose from SURMOUNT trials', goalTag: 'Weight Loss', goalColor: 'rose', doseAmount: '5', doseUnit: 'mg', frequency: 'weekly', durationWeeks: 12, vialSizeMg: '10', bacWaterMl: '2' },
    { id: 'max', label: 'Max Protocol', tagline: '10mg/week — peak metabolic intervention', goalTag: 'Aggressive Cut', goalColor: 'amber', doseAmount: '10', doseUnit: 'mg', frequency: 'weekly', durationWeeks: 12, vialSizeMg: '15', bacWaterMl: '2' },
  ],
  'retatrutide': [
    { id: 'start', label: 'Titration Start', tagline: '1mg/week — triple agonist tolerance phase (GLP-1/GIP/Glucagon)', goalTag: 'Weight Loss', goalColor: 'rose', doseAmount: '1', doseUnit: 'mg', frequency: 'weekly', durationWeeks: 4, vialSizeMg: '10', bacWaterMl: '2' },
    { id: 'standard', label: 'Standard Protocol', tagline: '4mg/week — effective triple-action fat loss dose', goalTag: 'Weight Loss', goalColor: 'rose', doseAmount: '4', doseUnit: 'mg', frequency: 'weekly', durationWeeks: 12, vialSizeMg: '10', bacWaterMl: '2' },
    { id: 'max', label: 'Max Protocol', tagline: '8mg/week — maximum research dose for aggressive fat loss', goalTag: 'Aggressive Cut', goalColor: 'amber', doseAmount: '8', doseUnit: 'mg', frequency: 'weekly', durationWeeks: 12, vialSizeMg: '10', bacWaterMl: '2' },
  ],
  'ipamorelin': [
    { id: 'gh', label: 'GH Enhancement', tagline: 'Daily 200mcg pulsatile GH secretion — stacked with CJC-1295', goalTag: 'Performance', goalColor: 'violet', doseAmount: '200', doseUnit: 'mcg', frequency: 'daily', durationWeeks: 12, vialSizeMg: '5', bacWaterMl: '2' },
    { id: 'antiaging', label: 'Anti-Aging', tagline: '300mcg nightly — longevity, sleep quality, body composition', goalTag: 'Anti-Aging', goalColor: 'blue', doseAmount: '300', doseUnit: 'mcg', frequency: 'daily', durationWeeks: 16, vialSizeMg: '5', bacWaterMl: '2' },
  ],
  'cjc-1295-no-dac': [
    { id: 'stack', label: 'GH Pulse Stack', tagline: 'Stack with Ipamorelin for synergistic GH release', goalTag: 'Performance', goalColor: 'violet', doseAmount: '100', doseUnit: 'mcg', frequency: 'daily', durationWeeks: 12, vialSizeMg: '5', bacWaterMl: '2' },
    { id: 'antiaging', label: 'Anti-Aging / Recomp', tagline: '200mcg nightly — peak GH response, fat loss', goalTag: 'Anti-Aging', goalColor: 'blue', doseAmount: '200', doseUnit: 'mcg', frequency: 'daily', durationWeeks: 16, vialSizeMg: '5', bacWaterMl: '2' },
  ],
  'ghk-cu': [
    { id: 'skin', label: 'Skin & Collagen', tagline: 'Sub-Q daily for dermal regeneration and wrinkle reduction', goalTag: 'Anti-Aging', goalColor: 'blue', doseAmount: '2', doseUnit: 'mg', frequency: 'daily', durationWeeks: 8, vialSizeMg: '5', bacWaterMl: '2' },
    { id: 'repair', label: 'Tissue Repair', tagline: 'Wound healing, angiogenesis and anti-inflammatory support', goalTag: 'Healing', goalColor: 'green', doseAmount: '1', doseUnit: 'mg', frequency: 'daily', durationWeeks: 12, vialSizeMg: '5', bacWaterMl: '2' },
  ],
  'human-growth-hormone': [
    { id: 'antiaging', label: 'Anti-Aging', tagline: '1–2 IU/day — cellular regeneration, skin, joint health', goalTag: 'Anti-Aging', goalColor: 'blue', doseAmount: '1', doseUnit: 'IU', frequency: 'daily', durationWeeks: 16 },
    { id: 'bodycomp', label: 'Body Composition', tagline: '2–4 IU/day — visceral fat loss and lean mass gains', goalTag: 'Recomp', goalColor: 'cyan', doseAmount: '2', doseUnit: 'IU', frequency: 'daily', durationWeeks: 16 },
    { id: 'performance', label: 'Athletic Performance', tagline: '4+ IU/day — recovery, muscle fullness, IGF-1 elevation', goalTag: 'Performance', goalColor: 'violet', doseAmount: '4', doseUnit: 'IU', frequency: 'daily', durationWeeks: 12 },
  ],
  'igf-1-lr3': [
    { id: 'lean', label: 'Lean Muscle Signal', tagline: 'Post-workout 50mcg — anabolic IGF-1 receptor activation', goalTag: 'Performance', goalColor: 'violet', doseAmount: '50', doseUnit: 'mcg', frequency: 'daily', durationWeeks: 4, vialSizeMg: '1', bacWaterMl: '1' },
    { id: 'mass', label: 'Mass Accelerator', tagline: '100mcg daily — maximum IGF-1 anabolic signaling (4-week max)', goalTag: 'Bulking', goalColor: 'amber', doseAmount: '100', doseUnit: 'mcg', frequency: 'daily', durationWeeks: 4, vialSizeMg: '1', bacWaterMl: '1' },
  ],
  'pt-141': [
    { id: 'standard', label: 'Libido Enhancement', tagline: '1mg 45–60 min before — melanocortin sexual response', goalTag: 'Libido', goalColor: 'rose', doseAmount: '1', doseUnit: 'mg', frequency: 'custom', durationWeeks: 8, vialSizeMg: '10', bacWaterMl: '2' },
    { id: 'enhanced', label: 'Enhanced Protocol', tagline: '1.75mg — stronger sexual arousal response', goalTag: 'Libido', goalColor: 'rose', doseAmount: '1.75', doseUnit: 'mg', frequency: 'custom', durationWeeks: 8, vialSizeMg: '10', bacWaterMl: '2' },
  ],
  'melanotan-ii': [
    { id: 'tan', label: 'Tanning Protocol', tagline: '250mcg/day — gradual melanin buildup phase', goalTag: 'Cosmetic', goalColor: 'amber', doseAmount: '250', doseUnit: 'mcg', frequency: 'daily', durationWeeks: 4, vialSizeMg: '10', bacWaterMl: '2' },
    { id: 'libido', label: 'Libido + Tan', tagline: '500mcg as-needed — dual tanning and sexual response', goalTag: 'Libido', goalColor: 'rose', doseAmount: '500', doseUnit: 'mcg', frequency: 'custom', durationWeeks: 8, vialSizeMg: '10', bacWaterMl: '2' },
  ],
  'tesamorelin': [
    { id: 'fatloss', label: 'Visceral Fat Loss', tagline: '2mg/day — FDA-studied dose for trunk fat reduction', goalTag: 'Fat Loss', goalColor: 'rose', doseAmount: '2', doseUnit: 'mg', frequency: 'daily', durationWeeks: 12, vialSizeMg: '5', bacWaterMl: '2' },
    { id: 'antiaging', label: 'Anti-Aging / GH Boost', tagline: '1mg nightly — body composition and IGF-1 optimization', goalTag: 'Anti-Aging', goalColor: 'blue', doseAmount: '1', doseUnit: 'mg', frequency: 'daily', durationWeeks: 16, vialSizeMg: '5', bacWaterMl: '2' },
  ],
  'epitalon': [
    { id: 'standard', label: 'Longevity Course', tagline: '5mg/day × 10 days — telomere elongation cycle', goalTag: 'Anti-Aging', goalColor: 'blue', doseAmount: '5', doseUnit: 'mg', frequency: 'daily', durationWeeks: 2, vialSizeMg: '10', bacWaterMl: '2' },
    { id: 'extended', label: 'Extended Protocol', tagline: '10mg/day × 10 days — deeper epigenetic reset', goalTag: 'Longevity', goalColor: 'violet', doseAmount: '10', doseUnit: 'mg', frequency: 'daily', durationWeeks: 2, vialSizeMg: '20', bacWaterMl: '2' },
  ],
  'sermorelin-growth-peptide': [
    { id: 'antiaging', label: 'Anti-Aging / Sleep', tagline: 'Pre-sleep 250mcg — pulsatile GH secretion at night', goalTag: 'Anti-Aging', goalColor: 'blue', doseAmount: '250', doseUnit: 'mcg', frequency: 'daily', durationWeeks: 12, vialSizeMg: '5', bacWaterMl: '2' },
    { id: 'bodycomp', label: 'Body Composition', tagline: '500mcg nightly — fat loss and lean mass improvement', goalTag: 'Recomp', goalColor: 'cyan', doseAmount: '500', doseUnit: 'mcg', frequency: 'daily', durationWeeks: 12, vialSizeMg: '5', bacWaterMl: '2' },
  ],
  'thymosin-alpha-1-immune': [
    { id: 'immune', label: 'Immune Modulation', tagline: '1.5mg twice weekly — T-cell and NK cell enhancement', goalTag: 'Immune Health', goalColor: 'green', doseAmount: '1.5', doseUnit: 'mg', frequency: 'twice_weekly', durationWeeks: 8, vialSizeMg: '5', bacWaterMl: '2' },
  ],
  'hcg-hormone': [
    { id: 'pct', label: 'Post-Cycle Therapy', tagline: '250–500 IU EOD — restart LH and natural testosterone', goalTag: 'PCT', goalColor: 'violet', doseAmount: '250', doseUnit: 'IU', frequency: 'eod', durationWeeks: 4 },
    { id: 'trt_preserve', label: 'TRT Preservation', tagline: '250 IU 2×/week — maintain fertility while on TRT', goalTag: 'Hormone Health', goalColor: 'blue', doseAmount: '250', doseUnit: 'IU', frequency: 'twice_weekly', durationWeeks: 12 },
  ],
  'kisspeptin-10-hormone': [
    { id: 'lh', label: 'LH Pulse Protocol', tagline: '100mcg pre-sleep — stimulate LH/FSH axis', goalTag: 'Hormone Health', goalColor: 'blue', doseAmount: '100', doseUnit: 'mcg', frequency: 'daily', durationWeeks: 8, vialSizeMg: '5', bacWaterMl: '2' },
  ],
  'dsip-delta-sleep': [
    { id: 'sleep', label: 'Sleep Enhancement', tagline: '100mcg pre-sleep — delta wave SWS improvement', goalTag: 'Sleep', goalColor: 'violet', doseAmount: '100', doseUnit: 'mcg', frequency: 'daily', durationWeeks: 8, vialSizeMg: '5', bacWaterMl: '2' },
  ],
};

export const PEPTIDE_CATEGORY_PRESETS: Record<string, GoalPreset[]> = {
  healing: [
    { id: 'standard', label: 'Healing Protocol', tagline: 'Standard sub-Q injection for tissue repair', goalTag: 'Healing', goalColor: 'green', doseAmount: '250', doseUnit: 'mcg', frequency: 'daily', durationWeeks: 8, vialSizeMg: '5', bacWaterMl: '2' },
  ],
  weight_loss: [
    { id: 'standard', label: 'Weight Loss', tagline: 'Weekly sub-Q injection for metabolic fat reduction', goalTag: 'Weight Loss', goalColor: 'rose', doseAmount: '0.5', doseUnit: 'mg', frequency: 'weekly', durationWeeks: 12, vialSizeMg: '5', bacWaterMl: '2' },
  ],
  muscle: [
    { id: 'performance', label: 'Performance', tagline: 'Daily sub-Q injection for GH axis stimulation', goalTag: 'Performance', goalColor: 'violet', doseAmount: '200', doseUnit: 'mcg', frequency: 'daily', durationWeeks: 12, vialSizeMg: '5', bacWaterMl: '2' },
  ],
  longevity: [
    { id: 'antiaging', label: 'Longevity Protocol', tagline: 'Targeted dosing for cellular anti-aging benefit', goalTag: 'Anti-Aging', goalColor: 'blue', doseAmount: '5', doseUnit: 'mg', frequency: 'daily', durationWeeks: 8, vialSizeMg: '5', bacWaterMl: '2' },
  ],
};
