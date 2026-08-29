import { collection, deleteDoc, doc, getDocs, onSnapshot, serverTimestamp, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { DanceClass, MembershipTerms, PhotoItem, RegistrationProcess, SiteSettings, VideoItem } from '../types';
import { DEFAULT_MEMBERSHIP_TERMS, DEFAULT_REGISTRATION_PROCESS, DEFAULT_SITE_SETTINGS, DEFAULT_VIDEOS, DANCE_CLASSES, PHOTO_GALLERY } from '../data';

const sortByOrder = <T extends { order?: number }>(items: T[]) => [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
const withoutUndefined = <T extends object>(value: T) => Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined));

export const subscribeSiteSettings = (callback: (settings: SiteSettings) => void) =>
  onSnapshot(doc(db, 'site_settings', 'global'), (snapshot) => callback(snapshot.exists() ? { ...DEFAULT_SITE_SETTINGS, ...snapshot.data() } as SiteSettings : DEFAULT_SITE_SETTINGS), () => callback(DEFAULT_SITE_SETTINGS));
export const subscribeCourses = (callback: (items: DanceClass[]) => void) =>
  onSnapshot(collection(db, 'courses'), (snapshot) => callback(snapshot.empty ? DANCE_CLASSES : sortByOrder(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as DanceClass)))), () => callback(DANCE_CLASSES));
export const subscribeGallery = (callback: (items: PhotoItem[]) => void) =>
  onSnapshot(collection(db, 'gallery'), (snapshot) => callback(snapshot.empty ? PHOTO_GALLERY : sortByOrder(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as PhotoItem)))), () => callback(PHOTO_GALLERY));
export const subscribeVideos = (callback: (items: VideoItem[]) => void) =>
  onSnapshot(collection(db, 'videos'), (snapshot) => callback(snapshot.empty ? DEFAULT_VIDEOS : sortByOrder(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as VideoItem)))), () => callback(DEFAULT_VIDEOS));
export const subscribeRegistrationProcess = (callback: (item: RegistrationProcess) => void) =>
  onSnapshot(doc(db, 'registration_process', 'global'), (snapshot) => callback(snapshot.exists() ? snapshot.data() as RegistrationProcess : DEFAULT_REGISTRATION_PROCESS), () => callback(DEFAULT_REGISTRATION_PROCESS));
export const subscribeMembershipTerms = (callback: (item: MembershipTerms) => void) =>
  onSnapshot(doc(db, 'membership_terms', 'global'), (snapshot) => callback(snapshot.exists() ? snapshot.data() as MembershipTerms : DEFAULT_MEMBERSHIP_TERMS), () => callback(DEFAULT_MEMBERSHIP_TERMS));

export const saveSiteSettingsToCloud = (item: SiteSettings) => setDoc(doc(db, 'site_settings', 'global'), { heroHeadline: item.heroHeadline, heroSubheadline: item.heroSubheadline, contactEmail: item.contactEmail, contactPhone: item.contactPhone, updatedAt: serverTimestamp() });
export const saveCourse = (item: DanceClass) => setDoc(doc(db, 'courses', item.id), withoutUndefined({ id: item.id, name: item.name, description: item.description, category: item.category, level: item.level, instructor: item.instructor, schedule: item.schedule, location: item.location, image: item.image, season: item.season ?? '', priceMonthly: item.priceMonthly, annualPrice: item.annualPrice ?? 0, isFree: item.isFree ?? item.annualPrice === 0, helloAssoUrl: item.helloAssoUrl ?? '', active: item.active !== false, order: item.order ?? 0 }));
export const deleteCourse = (id: string) => deleteDoc(doc(db, 'courses', id));
export const saveGalleryPhoto = (item: PhotoItem) => setDoc(doc(db, 'gallery', item.id), { id: item.id, title: item.title, url: item.url, description: item.description ?? '', date: item.date ?? '', active: item.active !== false, order: item.order ?? 0 });
export const deleteGalleryPhoto = (id: string) => deleteDoc(doc(db, 'gallery', id));
export const saveVideo = (item: VideoItem) => setDoc(doc(db, 'videos', item.id), { id: item.id, title: item.title, youtubeId: item.youtubeId, description: item.description ?? '', date: item.date ?? '', active: item.active !== false, order: item.order ?? 0 });
export const deleteVideo = (id: string) => deleteDoc(doc(db, 'videos', id));
export const saveRegistrationProcess = (item: RegistrationProcess) => setDoc(doc(db, 'registration_process', 'global'), item);
export const saveMembershipTerms = (item: MembershipTerms) => setDoc(doc(db, 'membership_terms', 'global'), item);

export async function initializeFirestoreContent() {
  const batch = writeBatch(db);
  const summary: string[] = [];
  const collections = [
    { name: 'courses', items: DANCE_CLASSES.map((item, order) => ({ id: item.id, name: item.name, description: item.description, category: item.category, level: item.level, instructor: item.instructor, schedule: item.schedule, location: item.location, image: item.image, season: item.season ?? '', priceMonthly: item.priceMonthly, annualPrice: item.annualPrice ?? 0, isFree: item.annualPrice === 0, helloAssoUrl: item.helloAssoUrl ?? '', active: item.active !== false, order })) },
    { name: 'gallery', items: PHOTO_GALLERY.map((item, order) => ({ id: item.id, title: item.title, url: item.url, description: item.description, date: item.date ?? '', active: true, order })) },
    { name: 'videos', items: DEFAULT_VIDEOS.map((item, order) => ({ id: item.id, title: item.title, youtubeId: item.youtubeId, description: item.description, date: item.date, active: true, order })) },
  ];
  for (const entry of collections) {
    const snapshot = await getDocs(collection(db, entry.name));
    if (snapshot.empty) {
      entry.items.forEach((item) => batch.set(doc(db, entry.name, item.id), withoutUndefined(item)));
      summary.push(`${entry.items.length} élément(s) dans ${entry.name}`);
    } else summary.push(`${entry.name} déjà initialisée (ignorée)`);
  }
  const documents = [
    { collectionName: 'site_settings', value: { heroHeadline: DEFAULT_SITE_SETTINGS.heroHeadline, heroSubheadline: DEFAULT_SITE_SETTINGS.heroSubheadline, contactEmail: DEFAULT_SITE_SETTINGS.contactEmail, contactPhone: DEFAULT_SITE_SETTINGS.contactPhone } },
    { collectionName: 'registration_process', value: DEFAULT_REGISTRATION_PROCESS },
    { collectionName: 'membership_terms', value: DEFAULT_MEMBERSHIP_TERMS },
  ];
  for (const entry of documents) {
    const snapshot = await getDocs(collection(db, entry.collectionName));
    if (snapshot.empty) {
      batch.set(doc(db, entry.collectionName, 'global'), withoutUndefined(entry.value));
      summary.push(`${entry.collectionName} initialisée`);
    } else summary.push(`${entry.collectionName} déjà initialisée (ignorée)`);
  }
  await batch.commit();
  return summary;
}
