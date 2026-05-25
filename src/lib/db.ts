import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Compound, DoseLog, DailyMetric, AppNotification } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

/**
 * Handles Firestore errors by wrapping them into a descriptive JSON payload
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error Incident:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Compounds Collection Sync ---

export async function fetchUserCompounds(userId: string): Promise<Compound[]> {
  const path = `users/${userId}/compounds`;
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const items: Compound[] = [];
    querySnapshot.forEach((doc) => {
      items.push(doc.data() as Compound);
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveUserCompound(userId: string, compound: Compound): Promise<void> {
  const path = `users/${userId}/compounds`;
  try {
    await setDoc(doc(db, path, compound.id), compound);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${compound.id}`);
  }
}

export async function deleteUserCompound(userId: string, compoundId: string): Promise<void> {
  const path = `users/${userId}/compounds`;
  try {
    await deleteDoc(doc(db, path, compoundId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${compoundId}`);
  }
}

// --- Dose Logs Collection Sync ---

export async function fetchUserLogs(userId: string): Promise<DoseLog[]> {
  const path = `users/${userId}/doseLogs`;
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const items: DoseLog[] = [];
    querySnapshot.forEach((doc) => {
      items.push(doc.data() as DoseLog);
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveUserLog(userId: string, log: DoseLog): Promise<void> {
  const path = `users/${userId}/doseLogs`;
  try {
    await setDoc(doc(db, path, log.id), log);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${log.id}`);
  }
}

export async function deleteUserLog(userId: string, logId: string): Promise<void> {
  const path = `users/${userId}/doseLogs`;
  try {
    await deleteDoc(doc(db, path, logId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${logId}`);
  }
}

// --- Biometric Metrics Collection Sync ---

export async function fetchUserMetrics(userId: string): Promise<DailyMetric[]> {
  const path = `users/${userId}/metrics`;
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const items: DailyMetric[] = [];
    querySnapshot.forEach((doc) => {
      items.push(doc.data() as DailyMetric);
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveUserMetric(userId: string, metric: DailyMetric): Promise<void> {
  const path = `users/${userId}/metrics`;
  try {
    // Generate document ID based on metric date to overwrite/update cleanly
    await setDoc(doc(db, path, metric.date), metric);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${metric.date}`);
  }
}

export async function deleteUserMetric(userId: string, date: string): Promise<void> {
  const path = `users/${userId}/metrics`;
  try {
    await deleteDoc(doc(db, path, date));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${date}`);
  }
}

// --- Notifications Collection Sync ---

export async function fetchUserNotifications(userId: string): Promise<AppNotification[]> {
  const path = `users/${userId}/notifications`;
  try {
    const querySnapshot = await getDocs(collection(db, path));
    const items: AppNotification[] = [];
    querySnapshot.forEach((doc) => {
      items.push(doc.data() as AppNotification);
    });
    return items;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveUserNotification(userId: string, notification: AppNotification): Promise<void> {
  const path = `users/${userId}/notifications`;
  try {
    await setDoc(doc(db, path, notification.id), notification);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${path}/${notification.id}`);
  }
}

export async function deleteUserNotification(userId: string, notificationId: string): Promise<void> {
  const path = `users/${userId}/notifications`;
  try {
    await deleteDoc(doc(db, path, notificationId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${path}/${notificationId}`);
  }
}

/**
 * Bulk upload local records to Firebase (used during Google Login merge sync)
 */
export async function uploadLocalDataToCloud(
  userId: string, 
  compounds: Compound[], 
  logs: DoseLog[], 
  metrics: DailyMetric[],
  notifications: AppNotification[]
): Promise<void> {
  try {
    const batch = writeBatch(db);

    compounds.forEach((item) => {
      // Do not upload template seed compounds to real cloud profiles
      if (item.id !== 'seed-bpc-157' && item.id !== 'seed-ghk-cu') {
        const ref = doc(db, `users/${userId}/compounds`, item.id);
        batch.set(ref, item);
      }
    });

    logs.forEach((item) => {
      const ref = doc(db, `users/${userId}/doseLogs`, item.id);
      batch.set(ref, item);
    });

    metrics.forEach((item) => {
      const ref = doc(db, `users/${userId}/metrics`, item.date);
      batch.set(ref, item);
    });

    notifications.forEach((item) => {
      const ref = doc(db, `users/${userId}/notifications`, item.id);
      batch.set(ref, item);
    });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}`);
  }
}
