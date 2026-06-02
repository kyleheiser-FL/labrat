import {
  doc, collection, addDoc, updateDoc, deleteDoc, getDocs,
  query, where, orderBy,
  onSnapshot, type Unsubscribe,
  type Firestore,
} from 'firebase/firestore';
import type { FamilyEvent } from '../types';

export function subscribeFamilyEvents(
  db: Firestore,
  familyId: string,
  onUpdate: (events: FamilyEvent[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'familyEvents'),
    where('familyId', '==', familyId),
    orderBy('startDate', 'asc'),
  );
  return onSnapshot(q, snap => {
    onUpdate(snap.docs.map(d => ({ id: d.id, ...d.data() }) as FamilyEvent));
  });
}

export async function createFamilyEvent(
  db: Firestore,
  event: Omit<FamilyEvent, 'id'>,
): Promise<string> {
  const ref = await addDoc(collection(db, 'familyEvents'), event);
  return ref.id;
}

export async function updateFamilyEvent(
  db: Firestore,
  eventId: string,
  updates: Partial<FamilyEvent>,
): Promise<void> {
  await updateDoc(doc(db, 'familyEvents', eventId), { ...updates, updatedAt: Date.now() });
}

export async function deleteFamilyEvent(db: Firestore, eventId: string): Promise<void> {
  await deleteDoc(doc(db, 'familyEvents', eventId));
}
