import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  query, where,
  type Firestore,
} from 'firebase/firestore';
import type { Family, FamilyMember, FamilyMemberRole } from '../types';
import { generateInviteCode } from '../lib/locationUtils';

export async function createFamily(
  db: Firestore,
  familyId: string,
  name: string,
  creatorUid: string,
  creatorDisplayName: string,
  creatorPhotoURL?: string,
): Promise<Family> {
  const now = Date.now();
  const family: Family = {
    id: familyId,
    name,
    inviteCode: generateInviteCode(),
    createdBy: creatorUid,
    createdAt: now,
    updatedAt: now,
  };
  const member: FamilyMember = {
    userId: creatorUid,
    displayName: creatorDisplayName,
    photoURL: creatorPhotoURL,
    role: 'owner',
    joinedAt: now,
  };
  await setDoc(doc(db, 'families', familyId), family);
  await setDoc(doc(db, 'families', familyId, 'members', creatorUid), member);
  return family;
}

export async function getFamilyByInviteCode(
  db: Firestore,
  code: string
): Promise<Family | null> {
  const q = query(collection(db, 'families'), where('inviteCode', '==', code.toUpperCase()));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as Family;
}

export async function joinFamily(
  db: Firestore,
  familyId: string,
  member: FamilyMember,
): Promise<void> {
  await setDoc(doc(db, 'families', familyId, 'members', member.userId), member);
}

export async function getFamilyMembers(
  db: Firestore,
  familyId: string
): Promise<FamilyMember[]> {
  const snap = await getDocs(collection(db, 'families', familyId, 'members'));
  return snap.docs.map(d => d.data() as FamilyMember);
}

export async function updateMemberRole(
  db: Firestore,
  familyId: string,
  userId: string,
  role: FamilyMemberRole,
): Promise<void> {
  await updateDoc(doc(db, 'families', familyId, 'members', userId), { role });
}

export async function removeFamilyMember(
  db: Firestore,
  familyId: string,
  userId: string,
): Promise<void> {
  await deleteDoc(doc(db, 'families', familyId, 'members', userId));
}

export async function regenerateInviteCode(
  db: Firestore,
  familyId: string,
): Promise<string> {
  const code = generateInviteCode();
  await updateDoc(doc(db, 'families', familyId), { inviteCode: code, updatedAt: Date.now() });
  return code;
}

export async function getFamily(db: Firestore, familyId: string): Promise<Family | null> {
  const snap = await getDoc(doc(db, 'families', familyId));
  return snap.exists() ? (snap.data() as Family) : null;
}
