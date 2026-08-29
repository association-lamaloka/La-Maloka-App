import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import { browserLocalPersistence, getAuth, setPersistence } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Cloud Firestore database with the assigned ID
export const db = initializeFirestore(app, {}, firebaseConfig.firestoreDatabaseId || '(default)');
export const auth = getAuth(app);
// Firebase manages the persisted session; the application never stores tokens
// or credentials itself.
export const authPersistenceReady = setPersistence(auth, browserLocalPersistence);

export default app;
