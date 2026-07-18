// Experience modes — choose which LabRat surface you land in.
//
// After each release everyone re-answers the experience prompt (gated by
// EXPERIENCE_PROMPT_VERSION). Bump the version to force the prompt again.
//
// Canonical modes:
//   'store'    → shop only, no tracking tabs
//   'tracking' → protocol tracking + store (Daily + Protocol + Shop)
//
// Research lives under Shop, not as its own experience mode.
// Legacy aliases still accepted from older installs:
//   'expert' | 'guided' | 'research' → tracking
import { localDateISO } from './date';
import { PEPTIDE_GOAL_PRESETS, STEROID_GOAL_PRESETS, GoalPreset } from '../data/goalPresets';
import { LibraryItem, Compound } from '../types';
import { safeLocalStorage } from './storage';

export type ExperienceMode = 'store' | 'tracking';
export type Intensity = 'slow' | 'recommended' | 'full';

// Bump when a release should force everyone back through the picker.
export const EXPERIENCE_PROMPT_VERSION = 3;

const MODE_KEY = 'labrat_experience_mode';
const VER_KEY = 'labrat_experience_prompt_v';

function normalizeExperienceMode(raw: string | null): ExperienceMode | null {
  if (raw === 'store') return 'store';
  if (raw === 'tracking') return 'tracking';
  // Map retired modes so old localStorage values still work after an update
  // that doesn't force the picker (or until the user re-answers).
  if (raw === 'expert' || raw === 'guided' || raw === 'research') return 'tracking';
  return null;
}

export function getStoredExperienceMode(): ExperienceMode | null {
  const m = safeLocalStorage.getItem(MODE_KEY);
  const v = parseInt(safeLocalStorage.getItem(VER_KEY) || '0', 10);
  if (v !== EXPERIENCE_PROMPT_VERSION) return null; // needs (re)prompt after update
  return normalizeExperienceMode(m);
}

export function setStoredExperienceMode(mode: ExperienceMode): void {
  safeLocalStorage.setItem(MODE_KEY, mode);
  safeLocalStorage.setItem(VER_KEY, String(EXPERIENCE_PROMPT_VERSION));
}

// ── Match a purchased product name to a library compound ────────────────────
// Product names look like "CJC-1295 (Without DAC) + Ipamorelin (10mg)" —
// score library items by how much of their name/id appears in the product.
export async function matchLibraryItemsToProductNames(productNames: string[]): Promise<LibraryItem[]> {
  // Load the (large) peptide dataset on demand so it stays out of the boot
  // bundle — this only runs in guided mode after the user is signed in.
  const { PEPTIDE_LIBRARY } = await import('../data/peptides');
  const found = new Map<string, LibraryItem>();
  for (const raw of productNames) {
    const name = (raw || '').toLowerCase();
    if (!name) continue;
    let best: { item: LibraryItem; score: number } | null = null;
    for (const item of PEPTIDE_LIBRARY) {
      const idTokens = item.id.split('-').filter(t => t.length > 2);
      const nameTokens = item.name.toLowerCase().replace(/[()]/g, ' ').split(/[\s/]+/).filter(t => t.length > 2);
      const tokens = Array.from(new Set([...idTokens, ...nameTokens]));
      if (tokens.length === 0) continue;
      const hits = tokens.filter(t => name.includes(t)).length;
      const score = hits / tokens.length;
      if (hits >= 1 && (!best || score > best.score)) best = { item, score };
    }
    // Require a reasonably confident match so "water" etc. doesn't false-fire.
    if (best && best.score >= 0.5) found.set(best.item.id, best.item);
  }
  return Array.from(found.values());
}

// ── Intensity-tiered protocol generation ────────────────────────────────────
export interface IntensityMeta {
  key: Intensity;
  label: string;
  blurb: string;
  doseMult: number;   // scales the baseline dose
  weekBias: number;   // added weeks (longer, gentler ramp = +; shorter = -)
}

export const INTENSITY_TIERS: IntensityMeta[] = [
  { key: 'slow',        label: 'Slow & Steady',     blurb: 'Start conservative and ease in. Gentlest sides, best for a first run.', doseMult: 0.6, weekBias: 2 },
  { key: 'recommended', label: 'labrat Recommended', blurb: 'Our balanced default — the dose most protocols settle on.',           doseMult: 1.0, weekBias: 0 },
  { key: 'full',        label: 'Full Send',          blurb: 'Aggressive dosing for experienced users chasing maximum effect.',      doseMult: 1.4, weekBias: 0 },
];

const PALETTE = ['#06b6d4', '#10b981', '#a855f7', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];

function baselinePreset(item: LibraryItem): GoalPreset | null {
  return PEPTIDE_GOAL_PRESETS[item.id]?.[0] || STEROID_GOAL_PRESETS[item.id]?.[0] || null;
}

// Round a dose to a clean value appropriate to its unit.
function tidyDose(n: number, unit: string): number {
  if (unit === 'mcg') return Math.max(25, Math.round(n / 25) * 25);
  if (unit === 'mg') return Math.round(n * 4) / 4;   // nearest 0.25 mg
  return Math.round(n * 10) / 10;
}

export interface GeneratedProtocol {
  libraryId: string;
  compound: Omit<Compound, 'id'>;
  hasPreset: boolean;
}

// Build a ready-to-add Compound for a library item at the chosen intensity.
export function deriveProtocol(item: LibraryItem, intensity: Intensity, index = 0): GeneratedProtocol {
  const tier = INTENSITY_TIERS.find(t => t.key === intensity) || INTENSITY_TIERS[1];
  const preset = baselinePreset(item);
  const today = localDateISO();
  const type: Compound['type'] = item.deliveryForm === 'oil' ? 'steroid' : item.deliveryForm === 'pill' ? 'supplement' : 'peptide';

  if (preset) {
    const baseDose = parseFloat(preset.doseAmount) || 0;
    const dose = tidyDose(baseDose * tier.doseMult, preset.doseUnit);
    return {
      libraryId: item.id,
      hasPreset: true,
      compound: {
        name: item.name,
        type,
        doseAmount: dose,
        doseUnit: preset.doseUnit,
        frequency: preset.frequency,
        startDate: today,
        durationWeeks: Math.max(2, preset.durationWeeks + tier.weekBias),
        color: PALETTE[index % PALETTE.length],
        vialSizeMg: preset.vialSizeMg ? parseFloat(preset.vialSizeMg) : undefined,
        bacWaterMl: preset.bacWaterMl ? parseFloat(preset.bacWaterMl) : undefined,
        isCompleted: false,
      },
    };
  }

  // No preset — sensible generic peptide default, scaled by intensity.
  const dose = tidyDose(250 * tier.doseMult, 'mcg');
  return {
    libraryId: item.id,
    hasPreset: false,
    compound: {
      name: item.name,
      type,
      doseAmount: dose,
      doseUnit: 'mcg',
      frequency: 'daily',
      startDate: today,
      durationWeeks: Math.max(2, 8 + tier.weekBias),
      color: PALETTE[index % PALETTE.length],
      vialSizeMg: 10,
      bacWaterMl: 2,
      isCompleted: false,
    },
  };
}
