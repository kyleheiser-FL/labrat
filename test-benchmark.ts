import { performance } from 'perf_hooks';
import { uploadLocalDataToCloud } from './src/lib/db';
import { Compound, DoseLog, DailyMetric, AppNotification } from './src/types';

// Mock dependencies if needed, but db.ts imports firebase/firestore
