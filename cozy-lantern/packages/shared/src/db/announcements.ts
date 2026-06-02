import {
  doc, collection, addDoc, updateDoc, deleteDoc,
  query, where, orderBy,
  onSnapshot, arrayUnion, type Unsubscribe,
  type Firestore,
} from 'firebase/firestore';
import type { FamilyAnnouncement } from '../types';

export function subscribeFamilyAnnouncements(
  db: Firestore,
  familyId: string,
  onUpdate: (announcements: FamilyAnnouncement[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'familyAnnouncements'),
    where('familyId', '==', familyId),
    orderBy('createdAt', 'desc'),
  );
  return onSnapshot(q, snap => {
    onUpdate(snap.docs.map(d => ({ id: d.id, ...d.data() }) as FamilyAnnouncement));
  });
}

export async function createAnnouncement(
  db: Firestore,
  announcement: Omit<FamilyAnnouncement, 'id'>,
): Promise<string> {
  const ref = await addDoc(collection(db, 'familyAnnouncements'), announcement);
  return ref.id;
}

export async function markAnnouncementRead(
  db: Firestore,
  announcementId: string,
  uid: string,
): Promise<void> {
  await updateDoc(doc(db, 'familyAnnouncements', announcementId), {
    readBy: arrayUnion(uid),
  });
}

export async function pinAnnouncement(
  db: Firestore,
  announcementId: string,
  pinned: boolean,
): Promise<void> {
  await updateDoc(doc(db, 'familyAnnouncements', announcementId), { pinned, updatedAt: Date.now() });
}

export async function deleteAnnouncement(db: Firestore, announcementId: string): Promise<void> {
  await deleteDoc(doc(db, 'familyAnnouncements', announcementId));
}
