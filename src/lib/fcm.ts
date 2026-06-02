import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { doc, setDoc, arrayUnion } from 'firebase/firestore';
import { app, db } from '../firebase';

const VAPID_KEY = (import.meta as any).env.VITE_FCM_VAPID_KEY as string | undefined;

let _messaging: ReturnType<typeof getMessaging> | null = null;
function messaging() {
  if (!_messaging) _messaging = getMessaging(app);
  return _messaging;
}

/**
 * Request an FCM registration token and persist it to Firestore so the server
 * can fan-out push notifications even when the app is closed.
 */
export async function registerFCMToken(userId: string): Promise<string | null> {
  if (!VAPID_KEY) {
    console.warn('[FCM] VITE_FCM_VAPID_KEY not set — skip token registration');
    return null;
  }
  if (!('serviceWorker' in navigator) || !('Notification' in window)) return null;
  if (Notification.permission !== 'granted') return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    const token = await getToken(messaging(), {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    if (token) {
      await setDoc(
        doc(db, `pushProfiles/${userId}`),
        { fcmTokens: arrayUnion(token), updatedAt: Date.now() },
        { merge: true }
      );
    }
    return token || null;
  } catch (err) {
    console.warn('[FCM] Token registration failed:', err);
    return null;
  }
}

/**
 * Save the user's reminder preferences to the push profile so the server
 * knows when to deliver background notifications.
 */
export async function savePushProfile(userId: string, profile: {
  reminderEnabled: boolean;
  reminderTime: string;
  timezoneOffset: number;
  compounds?: { id: string; name: string; reminderTime: string }[];
}): Promise<void> {
  try {
    await setDoc(
      doc(db, `pushProfiles/${userId}`),
      { ...profile, updatedAt: Date.now() },
      { merge: true }
    );
  } catch (err) {
    console.warn('[FCM] savePushProfile failed:', err);
  }
}

/**
 * Listen for FCM messages while the app is in the foreground.
 * Returns an unsubscribe function.
 */
export function initForegroundMessaging(
  onNotification: (title: string, body: string, tag?: string) => void
): () => void {
  try {
    return onMessage(messaging(), (payload) => {
      const title = payload.notification?.title || 'LabRat';
      const body = payload.notification?.body || '';
      const tag = (payload.data as any)?.tag as string | undefined;
      onNotification(title, body, tag);
    });
  } catch {
    return () => {};
  }
}
