import {
  doc, getDoc, setDoc, updateDoc,
  type Firestore,
} from 'firebase/firestore';
import type { UserProfile, UserSettings } from '../types';

export async function getUser(db: Firestore, uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

export async function createUser(db: Firestore, profile: UserProfile): Promise<void> {
  await setDoc(doc(db, 'users', profile.uid), profile);
}

export async function updateUserSettings(
  db: Firestore,
  uid: string,
  settings: Partial<UserSettings>
): Promise<void> {
  const updates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(settings)) {
    updates[`settings.${key}`] = value;
  }
  updates['updatedAt'] = Date.now();
  await updateDoc(doc(db, 'users', uid), updates);
}

export async function updateUserFamilyId(
  db: Firestore,
  uid: string,
  familyId: string | null
): Promise<void> {
  await updateDoc(doc(db, 'users', uid), { familyId, updatedAt: Date.now() });
}
