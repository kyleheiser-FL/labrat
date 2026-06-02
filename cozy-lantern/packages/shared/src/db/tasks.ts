import {
  doc, collection, addDoc, updateDoc, deleteDoc,
  query, where, orderBy,
  onSnapshot, type Unsubscribe,
  type Firestore,
} from 'firebase/firestore';
import type { FamilyTask } from '../types';

export function subscribeFamilyTasks(
  db: Firestore,
  familyId: string,
  onUpdate: (tasks: FamilyTask[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'familyTasks'),
    where('familyId', '==', familyId),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(q, snap => {
    onUpdate(snap.docs.map(d => ({ id: d.id, ...d.data() }) as FamilyTask));
  });
}

export async function createFamilyTask(
  db: Firestore,
  task: Omit<FamilyTask, 'id'>,
): Promise<string> {
  const ref = await addDoc(collection(db, 'familyTasks'), task);
  return ref.id;
}

export async function completeTask(
  db: Firestore,
  taskId: string,
  completedBy: string,
): Promise<void> {
  await updateDoc(doc(db, 'familyTasks', taskId), {
    completed: true,
    completedAt: Date.now(),
    completedBy,
    updatedAt: Date.now(),
  });
}

export async function updateFamilyTask(
  db: Firestore,
  taskId: string,
  updates: Partial<FamilyTask>,
): Promise<void> {
  await updateDoc(doc(db, 'familyTasks', taskId), { ...updates, updatedAt: Date.now() });
}

export async function deleteFamilyTask(db: Firestore, taskId: string): Promise<void> {
  await deleteDoc(doc(db, 'familyTasks', taskId));
}
