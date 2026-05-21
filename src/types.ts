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
  
  // Steroid delivery structures
  steroidForm?: 'oil' | 'pill';
  pillSizeMg?: number;        // For oral, e.g. 10 (mg per pill)
  oilConcMgMl?: number;       // For liquids/oils, e.g. 250 (mg per ml)
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
}

export interface DailyMetric {
  date: string;               // YYYY-MM-DD
  weightKg?: number;          // Bodyweight
  mood?: number;              // 1-5
  fatigue?: number;           // 1-5
  sideEffects?: string;
  notes?: string;
}

export interface LibraryItem {
  id: string;
  name: string;
  chemicalName?: string;
  category: 'weight_loss' | 'healing' | 'longevity' | 'cognitive' | 'muscle' | 'lifestyle';
  description: string;
  clinicalResearch: string;   // Clinical context or brief research bio
  typicalDosage: string;      // Recommended dosage ranges
  frequencyText: string;      // E.g. "Once daily before bed"
  reconstitutionText?: string; // Guidance on bacteriostatic water volume
  halfLife: string;
  benefits: string[];
  sideEffects: string[];
  suggestedCycleWeeks: string;
  deliveryForm?: 'peptide' | 'oil' | 'pill'; // Physical format of the substance
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;          // ISO Date
  type: 'info' | 'success' | 'warning' | 'reminder';
  isRead: boolean;
}

