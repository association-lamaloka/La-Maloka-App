import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { getAuth, inMemoryPersistence, setPersistence } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Cloud Firestore database with the assigned ID
export const db = initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId || '(default)');
export const auth = getAuth(app);
// Keep the administrative session in memory only: no credentials or auth tokens
// are persisted in localStorage, sessionStorage or Firestore.
export const authPersistenceReady = setPersistence(auth, inMemoryPersistence);

export default app;
