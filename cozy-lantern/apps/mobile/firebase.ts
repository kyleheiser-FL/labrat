import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeFirestore } from 'firebase/firestore';
import firebaseConfig from './firebase-config.json';

// Guard against double-initialization in Expo fast refresh
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// React Native requires explicit AsyncStorage persistence — without this,
// auth state is lost on every app restart.
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

export const db = initializeFirestore(app, {
  // Prevents crashes when Firestore returns fields we haven't typed yet
  ignoreUndefinedProperties: true,
});

export { app };
