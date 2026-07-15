export interface Compound {
  id: string;
  name: string;
  type: 'peptide' | 'compound' | 'supplement' | 'steroid';
  vialSizeMg?: number;        // For peptides
  bacWaterMl?: number;        // For peptides
  doseAmount: number;         // e.g. 250 (mcg) or 5 (mg)
  doseUnit: 'mcg' | 'mg' | 'IU' | 'ml';
  frequency: 'daily' | 'eod' | 'twice_weekly' | 'weekly' | 'custom';
  customDays?: number;        // If frequency is 'custom', every X days
  startDate: string;          // YYYY-MM-DD
  durationWeeks: number;      // cycle duration
  notes?: string;
  color: string;              // For timeline calendar colors (e.g. Hex)
  scheduledDays?: string[];   // Optional, e.g. ["Mon", "Wed", "Fri"]
  isCompleted?: boolean;
  reminderTime?: string;    // HH:MM daily reminder for this compound

  // Steroid delivery structures
  steroidForm?: 'oil' | 'pill';
  pillSizeMg?: number;        // For oral, e.g. 10 (mg per pill)
  oilConcMgMl?: number;       // For liquids/oils, e.g. 250 (mg per ml)
  vialMl?: number;            // For oils: vial volume in ml (defaults to 10 if unset)
}

export interface DoseLog {
  id: string;
  compoundId: string;
  compoundName: string;
  date: string;               // YYYY-MM-DD
  time: string;               // HH:MM
  doseAmount: number;
  doseUnit: string;
  reconstitutedRatio?: {      // If reconstituted, store what the math was
    vialSizeMg: number;
    bacWaterMl: number;
    syringeUnits: number;
  };
  calculatedQtyText?: string; // Text representing automatically resolved physical quantities (e.g. "2 pills" or "0.5 ml")
  notes?: string;
  isSkipped?: boolean;        // Scheduled dose was intentionally skipped, not administered
}

export interface DailyMetric {
  date: string;               // YYYY-MM-DD
  weightLb?: number;          // Bodyweight
  mood?: number;              // 1-5
  fatigue?: number;           // 1-5
  sideEffects?: string;
  notes?: string;
}

export interface LibraryItem {
  id: string;
  name: string;
  chemicalName?: string;
  category: 'weight_loss' | 'healing' | 'longevity' | 'cognitive' | 'muscle' | 'lifestyle' | 'sexual_health' | 'hormones' | 'immune' | 'supplements';
  description: string;
  clinicalResearch: string;   // Clinical context or brief research bio
  typicalDosage: string;      // Recommended dosage ranges
  frequencyText: string;      // E.g. "Once daily before bed"
  reconstitutionText?: string; // Guidance on reconstitution volume
  reconstitutionSolvent?: 'bac_water' | 'acetic_acid' | 'sterile_water' | 'sterile_saline'; // Non-default solvent requirement
  halfLife: string;
  benefits: string[];
  sideEffects: string[];
  suggestedCycleWeeks: string;
  deliveryForm?: 'peptide' | 'oil' | 'pill'; // Physical format of the substance
  clinicalStudies?: { studyTitle: string; citation: string; keyFinding: string; }[]; // Scientific studies & trials
  dietaryInteraction?: string; // Guidance on meals, carbs, protein, fasting, etc.
  realisticGains?: string;     // What to realistically expect (muscle, fat, recovery, tissue)
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;          // ISO Date
  type: 'info' | 'success' | 'warning' | 'error' | 'reminder';
  isRead: boolean;
}

export interface SegmentVisibility {
  dashboard: { schedule: boolean; history: boolean; };
  planner: { pct: boolean; dataControls: boolean; };
  library: { filters: boolean; };
  blood: { dossier: boolean; upload: boolean; wellness: boolean; };
}

export const DEFAULT_SEGMENT_VISIBILITY: SegmentVisibility = {
  dashboard: { schedule: true, history: true },
  planner: { pct: true, dataControls: true },
  library: { filters: true },
  blood: { dossier: true, upload: true, wellness: true },
};

// Helper to format 24-hour style HH:MM to 12-hour AM/PM general time format
export function formatTimeTo12Hour(timeStr: string): string {
  if (!timeStr) return '';
  const clean = timeStr.trim();
  if (clean.toLowerCase().includes('am') || clean.toLowerCase().includes('pm')) {
    return clean;
  }
  const match = clean.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 becomes 12
    return `${hours}:${minutes} ${ampm}`;
  }
  try {
    const parts = clean.split(':');
    if (parts.length >= 2) {
      let hours = parseInt(parts[0], 10);
      let minutes = parseInt(parts[1], 10);
      if (!isNaN(hours) && !isNaN(minutes)) {
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12;
        const minutesStr = minutes.toString().padStart(2, '0');
        return `${hours}:${minutesStr} ${ampm}`;
      }
    }
  } catch (e) {
    // Ignore fallback
  }
  return clean;
}
