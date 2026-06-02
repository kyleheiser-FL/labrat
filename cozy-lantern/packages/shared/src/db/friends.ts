import {
  doc, collection, setDoc, updateDoc, deleteDoc, getDocs,
  query, where,
  onSnapshot, type Unsubscribe,
  type Firestore,
} from 'firebase/firestore';
import type { FriendConnection, FriendConnectionStatus } from '../types';
import { generateConnectionId } from '../lib/locationUtils';

export async function sendFriendRequest(
  db: Firestore,
  fromUid: string,
  toUid: string,
): Promise<FriendConnection> {
  const id = generateConnectionId(fromUid, toUid);
  const now = Date.now();
  const conn: FriendConnection = {
    id,
    userIds: [fromUid, toUid].sort() as [string, string],
    initiatedBy: fromUid,
    status: 'pending',
    locationSharingEnabled: false,
    createdAt: now,
    updatedAt: now,
  };
  await setDoc(doc(db, 'friendConnections', id), conn);
  return conn;
}

export async function updateFriendStatus(
  db: Firestore,
  connectionId: string,
  status: FriendConnectionStatus,
): Promise<void> {
  await updateDoc(doc(db, 'friendConnections', connectionId), {
    status,
    updatedAt: Date.now(),
  });
}

export async function toggleFriendLocationSharing(
  db: Firestore,
  connectionId: string,
  enabled: boolean,
): Promise<void> {
  await updateDoc(doc(db, 'friendConnections', connectionId), {
    locationSharingEnabled: enabled,
    updatedAt: Date.now(),
  });
}

export async function removeFriend(db: Firestore, connectionId: string): Promise<void> {
  await deleteDoc(doc(db, 'friendConnections', connectionId));
}

export function subscribeFriendConnections(
  db: Firestore,
  uid: string,
  onUpdate: (connections: FriendConnection[]) => void,
): Unsubscribe {
  const q = query(
    collection(db, 'friendConnections'),
    where('userIds', 'array-contains', uid),
  );
  return onSnapshot(q, snap => {
    onUpdate(snap.docs.map(d => d.data() as FriendConnection));
  });
}
