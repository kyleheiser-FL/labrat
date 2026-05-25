import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Use custom auth domain if configured in the environment (e.g. labrat.app or auth.labrat.app)
const resolvedConfig = {
  ...firebaseConfig,
  authDomain: (import.meta as any).env.VITE_CUSTOM_AUTH_DOMAIN || firebaseConfig.authDomain
};

const app = initializeApp(resolvedConfig);
export const db = initializeFirestore(app, {
  ignoreUndefinedProperties: true
}, firebaseConfig.firestoreDatabaseId || undefined);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup };
