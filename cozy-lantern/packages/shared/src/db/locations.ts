import {
  doc, collection, setDoc, getDoc, getDocs,
  query, orderBy, where, limit,
  onSnapshot, type Unsubscribe,
  type Firestore,
} from 'firebase/firestore';
import type { LiveLocation, LocationHistoryPoint } from '../types';

export async function writeLocation(db: Firestore, location: LiveLocation): Promise<void> {
  const now = Date.now();
  await setDoc(doc(db, 'locations', location.userId), { ...location, updatedAt: now });
  // Every fix goes into history — document ID = timestamp for natural ordering
  await setDoc(
    doc(db, 'locations', location.userId, 'history', String(location.timestamp)),
    {
      lat: location.lat,
      lng: location.lng,
      accuracy: location.accuracy,
      altitude: location.altitude,
      heading: location.heading,
      speed: location.speed,
      address: location.address,
      timestamp: location.timestamp,
    } satisfies LocationHistoryPoint,
  );
}

export async function getLocation(
  db: Firestore,
  userId: string
): Promise<LiveLocation | null> {
  const snap = await getDoc(doc(db, 'locations', userId));
  return snap.exists() ? (snap.data() as LiveLocation) : null;
}

export function subscribeToLocations(
  db: Firestore,
  userIds: string[],
  onUpdate: (locations: LiveLocation[]) => void,
): Unsubscribe {
  const results = new Map<string, LiveLocation>();
  const unsubs: Unsubscribe[] = userIds.map(uid =>
    onSnapshot(doc(db, 'locations', uid), snap => {
      if (snap.exists()) {
        results.set(uid, snap.data() as LiveLocation);
      } else {
        results.delete(uid);
      }
      onUpdate(Array.from(results.values()));
    }),
  );
  return () => unsubs.forEach(u => u());
}

export async function getLocationHistory(
  db: Firestore,
  userId: string,
  startMs: number,
  endMs: number,
): Promise<LocationHistoryPoint[]> {
  const q = query(
    collection(db, 'locations', userId, 'history'),
    where('timestamp', '>=', startMs),
    where('timestamp', '<=', endMs),
    orderBy('timestamp', 'asc'),
    limit(2000),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => d.data() as LocationHistoryPoint);
}
