import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  onSnapshot,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase';
import { DanceClass, Inscription, HealthForm, SiteSettings } from '../types';
import { DANCE_CLASSES, DEFAULT_SITE_SETTINGS } from '../data';

const CLASSES_COLLECTION = 'classes';
const INSCRIPTIONS_COLLECTION = 'inscriptions';
const HEALTH_FORMS_COLLECTION = 'health_forms';
const SETTINGS_COLLECTION = 'site_settings';
const SETTINGS_DOC = 'global';

// ----------------------------------------------------
// 1. SITE SETTINGS & CONTENT
// ----------------------------------------------------
export const subscribeSiteSettings = (callback: (settings: SiteSettings) => void) => {
  const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC);
  return onSnapshot(docRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data() as SiteSettings);
    } else {
      // If not yet created in Firestore, initialize with defaults
      setDoc(docRef, DEFAULT_SITE_SETTINGS).catch(console.error);
      callback(DEFAULT_SITE_SETTINGS);
    }
  }, (err) => {
    console.warn('Firestore Settings snapshot error, falling back to local:', err);
  });
};

export const saveSiteSettingsToCloud = async (settings: SiteSettings): Promise<void> => {
  const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC);
  await setDoc(docRef, { ...settings, updatedAt: new Date().toISOString() }, { merge: true });
};

// ----------------------------------------------------
// 2. DANCE CLASSES
// ----------------------------------------------------
export const subscribeClasses = (callback: (classes: DanceClass[]) => void) => {
  const colRef = collection(db, CLASSES_COLLECTION);
  return onSnapshot(colRef, (snapshot) => {
    if (!snapshot.empty) {
      const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as DanceClass));
      callback(items);
    } else {
      // Seed default classes on first launch
      seedInitialClasses().catch(console.error);
      callback(DANCE_CLASSES);
    }
  }, (err) => {
    console.warn('Firestore Classes snapshot error:', err);
  });
};

export const seedInitialClasses = async () => {
  for (const c of DANCE_CLASSES) {
    const docRef = doc(db, CLASSES_COLLECTION, c.id);
    await setDoc(docRef, c, { merge: true });
  }
};

export const saveClassesToCloud = async (classes: DanceClass[]): Promise<void> => {
  for (const c of classes) {
    const docRef = doc(db, CLASSES_COLLECTION, c.id);
    await setDoc(docRef, c, { merge: true });
  }
};

export const updateClassInCloud = async (classItem: DanceClass): Promise<void> => {
  const docRef = doc(db, CLASSES_COLLECTION, classItem.id);
  await setDoc(docRef, classItem, { merge: true });
};

// ----------------------------------------------------
// 3. INSCRIPTIONS
// ----------------------------------------------------
export const subscribeInscriptions = (callback: (inscriptions: Inscription[]) => void) => {
  const colRef = collection(db, INSCRIPTIONS_COLLECTION);
  return onSnapshot(colRef, (snapshot) => {
    const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Inscription));
    callback(items);
  }, (err) => {
    console.warn('Firestore Inscriptions snapshot error:', err);
  });
};

export const addInscriptionToCloud = async (inscription: Inscription): Promise<void> => {
  const docRef = doc(db, INSCRIPTIONS_COLLECTION, inscription.id);
  await setDoc(docRef, { ...inscription, createdAt: new Date().toISOString() });
};

export const deleteInscriptionFromCloud = async (id: string): Promise<void> => {
  const docRef = doc(db, INSCRIPTIONS_COLLECTION, id);
  await deleteDoc(docRef);
};

export const updateInscriptionInCloud = async (id: string, updates: Partial<Inscription>): Promise<void> => {
  const docRef = doc(db, INSCRIPTIONS_COLLECTION, id);
  await updateDoc(docRef, updates);
};

// ----------------------------------------------------
// 4. HEALTH FORMS (QS-SPORT & SIGNATURES)
// ----------------------------------------------------
export const subscribeHealthForms = (callback: (forms: HealthForm[]) => void) => {
  const colRef = collection(db, HEALTH_FORMS_COLLECTION);
  return onSnapshot(colRef, (snapshot) => {
    const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as HealthForm));
    callback(items);
  }, (err) => {
    console.warn('Firestore HealthForms snapshot error:', err);
  });
};

export const addHealthFormToCloud = async (form: HealthForm): Promise<void> => {
  const docId = `HF-${Date.now()}`;
  const docRef = doc(db, HEALTH_FORMS_COLLECTION, docId);
  await setDoc(docRef, { ...form, id: docId, createdAt: new Date().toISOString() });
};
