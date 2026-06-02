import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export const LOCATION_TASK_NAME = 'cozy-lantern-background-location';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error('[LocationTask]', error.message);
    return;
  }
  if (!data) return;

  const { locations } = data as { locations: Location.LocationObject[] };
  const latest = locations[locations.length - 1];
  const user = auth.currentUser;
  if (!user || !latest) return;

  const now = Date.now();
  const historyId = String(latest.timestamp);

  const point = {
    lat: latest.coords.latitude,
    lng: latest.coords.longitude,
    accuracy: latest.coords.accuracy ?? 0,
    altitude: latest.coords.altitude ?? undefined,
    heading: latest.coords.heading ?? undefined,
    speed: latest.coords.speed ?? undefined,
    timestamp: latest.timestamp,
  };

  try {
    // Update live location
    await setDoc(
      doc(db, 'locations', user.uid),
      {
        userId: user.uid,
        ...point,
        batteryLevel: -1,
        updatedAt: now,
      },
      { merge: true },
    );

    // Write history point — doc ID is the timestamp string for time-ordered queries
    await setDoc(
      doc(db, 'locations', user.uid, 'history', historyId),
      point,
    );
  } catch (err) {
    console.warn('[LocationTask] Firestore write failed:', err);
  }
});
