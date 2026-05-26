import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Use custom auth domain or full config overrides if configured in the environment (e.g. for Vercel production hosting)
const rawAuthDomain = (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || (import.meta as any).env.VITE_CUSTOM_AUTH_DOMAIN || firebaseConfig.authDomain;

// Convert default firebaseapp.com domains to firebaseauth.app to prevent local ISP/DNS lookup and filtering blocks (NXDOMAIN)
const resolvedAuthDomain = typeof rawAuthDomain === 'string' && rawAuthDomain.endsWith('.firebaseapp.com')
  ? rawAuthDomain.replace('.firebaseapp.com', '.firebaseauth.app')
  : rawAuthDomain;

const resolvedConfig = {
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey,
  authDomain: resolvedAuthDomain,
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId,
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket,
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId,
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID || firebaseConfig.appId,
  measurementId: (import.meta as any).env.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfig.measurementId,
  firestoreDatabaseId: (import.meta as any).env.VITE_FIREBASE_DATABASE_ID || firebaseConfig.firestoreDatabaseId
};

const app = initializeApp(resolvedConfig);
export const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true
}, resolvedConfig.firestoreDatabaseId || undefined);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup };
