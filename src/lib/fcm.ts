import { doc, setDoc, arrayUnion } from 'firebase/firestore';
import { app, db } from '../firebase';

const VAPID_KEY = (import.meta as any).env.VITE_FCM_VAPID_KEY as string | undefined;

// firebase/messaging is loaded on demand so its bundle stays out of the boot
// chunk — it only downloads when we register a push token or start listening
// for foreground messages, neither of which is needed for first paint.
type MessagingMod = typeof import('firebase/messaging');
let _messagingMod: Promise<MessagingMod> | null = null;
function loadMessaging(): Promise<MessagingMod> {
  return (_messagingMod ||= import('firebase/messaging'));
}

let _messaging: ReturnType<MessagingMod['getMessaging']> | null = null;
async function getMessagingInstance() {
  const mod = await loadMessaging();
  if (!_messaging) _messaging = mod.getMessaging(app);
  return { messaging: _messaging, mod };
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
    const { messaging, mod } = await getMessagingInstance();
    const registration = await navigator.serviceWorker.ready;
    const token = await mod.getToken(messaging, {
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
 * knows when to deliver background notifications. (Firestore only — no
 * messaging dependency, so this never pulls in firebase/messaging.)
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
 * Returns a synchronous unsubscribe function; messaging is wired up
 * asynchronously in the background so the caller's effect contract is unchanged.
 */
export function initForegroundMessaging(
  onNotification: (title: string, body: string, tag?: string) => void
): () => void {
  let unsub = () => {};
  let cancelled = false;
  (async () => {
    try {
      const { messaging, mod } = await getMessagingInstance();
      if (cancelled) return;
      unsub = mod.onMessage(messaging, (payload) => {
        // Messages are now data-only; fall back to notification for older payloads.
        const d = (payload.data as any) || {};
        const title = d.title || payload.notification?.title || 'LabRat';
        const body = d.body || payload.notification?.body || '';
        const tag = d.tag as string | undefined;
        onNotification(title, body, tag);
      });
    } catch {
      /* messaging unsupported in this browser — ignore */
    }
  })();
  return () => { cancelled = true; unsub(); };
}
