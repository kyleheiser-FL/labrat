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
  referenceContext?: 'natty' | 'trt' | 'enhanced';
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
