import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Use custom auth domain or full config overrides if configured in the environment (e.g. for Vercel production hosting)
function sanitize(val: any): string {
  if (typeof val !== 'string') return val;
  let trimVal = val.trim();
  if (
    (trimVal.startsWith('"') && trimVal.endsWith('"')) ||
    (trimVal.startsWith("'") && trimVal.endsWith("'"))
  ) {
    trimVal = trimVal.slice(1, -1);
  }
  return trimVal.trim();
}

const rawAuthDomain = sanitize((import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || (import.meta as any).env.VITE_CUSTOM_AUTH_DOMAIN || firebaseConfig.authDomain);

// Convert default firebaseapp.com domains to web.app to prevent local ISP/DNS lookup and filtering blocks (NXDOMAIN)
// If VITE_USE_FIREBASEAPP_DOMAIN is not set to 'false', we retain the original firebaseapp.com authDomain.
const rawUseEnv = sanitize((import.meta as any).env.VITE_USE_FIREBASEAPP_DOMAIN);
const useFirebaseAppDomain = rawUseEnv !== 'false';
const resolvedAuthDomain = typeof rawAuthDomain === 'string' && rawAuthDomain.endsWith('.firebaseapp.com') && !useFirebaseAppDomain
  ? rawAuthDomain.replace('.firebaseapp.com', '.web.app')
  : rawAuthDomain;

export const resolvedConfig = {
  apiKey: sanitize((import.meta as any).env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey),
  authDomain: sanitize(resolvedAuthDomain),
  projectId: sanitize((import.meta as any).env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId),
  storageBucket: sanitize((import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket),
  messagingSenderId: sanitize((import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId),
  appId: sanitize((import.meta as any).env.VITE_FIREBASE_APP_ID || firebaseConfig.appId),
  measurementId: sanitize((import.meta as any).env.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfig.measurementId),
  firestoreDatabaseId: sanitize((import.meta as any).env.VITE_FIREBASE_DATABASE_ID || firebaseConfig.firestoreDatabaseId)
};

console.log("[Firebase Hub] Initializing with auth domain:", resolvedConfig.authDomain);

const app = initializeApp(resolvedConfig);
export const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true
}, resolvedConfig.firestoreDatabaseId || undefined);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup };
