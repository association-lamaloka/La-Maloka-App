import { collection, doc, onSnapshot, query, serverTimestamp, setDoc, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { DanceClass, DanceEvent, FooterContent, HomePageContent, MembershipTerms, NavigationItem, PhotoItem, RegistrationProcess, SiteSettings, VideoItem } from '../types';
import { DEFAULT_FOOTER, DEFAULT_HOME_PAGE, DEFAULT_MEMBERSHIP_TERMS, DEFAULT_NAVIGATION, DEFAULT_REGISTRATION_PROCESS, DEFAULT_SITE_SETTINGS, DEFAULT_VIDEOS, DANCE_CLASSES, DANCE_EVENTS, PHOTO_GALLERY } from '../data';
import { normalizeCourses, normalizeEvents, normalizeFooter, normalizeHome, normalizeNavigation, normalizePhotos, normalizeRegistration, normalizeSiteSettings, normalizeTerms, normalizeVideos } from './contentNormalization';

const sortByOrder = <T extends { order?: number }>(items: T[]) => [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
const withoutUndefined = <T extends object>(value: T) => Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined));
const subscribePublishedCollection = <T extends { order?: number }>(name: string, callback: (items: T[]) => void, normalize: (value: unknown) => T[], onError?: (error: Error) => void) => {
  let unsubscribeSnapshot = () => {};
  const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    unsubscribeSnapshot();
    const isAdmin = user?.email === 'association.lamaloka@gmail.com' && user.emailVerified;
    const source = isAdmin ? collection(db, name) : query(collection(db, name), where('active', '==', true));
    unsubscribeSnapshot = onSnapshot(source, (snapshot) => callback(normalize(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))), (error) => { onError?.(error); });
  });
  return () => { unsubscribeSnapshot(); unsubscribeAuth(); };
};

type ContentError = (error: Error) => void;
const subscribeDocument = <T,>(path: string, id: string, callback: (item: T) => void, normalize: (value: unknown) => T, onError?: ContentError) =>
  onSnapshot(doc(db, path, id), snapshot => callback(normalize(snapshot.exists() ? snapshot.data() : undefined)), error => onError?.(error));
export const subscribeSiteSettings = (callback: (settings: SiteSettings) => void, onError?: ContentError) => subscribeDocument('site_settings', 'global', callback, normalizeSiteSettings, onError);
export const subscribeCourses = (callback: (items: DanceClass[]) => void, onError?: ContentError) => subscribePublishedCollection('courses', callback, normalizeCourses, onError);
export const subscribeEvents = (callback: (items: DanceEvent[]) => void, onError?: ContentError) => subscribePublishedCollection('events', callback, normalizeEvents, onError);
export const subscribeGallery = (callback: (items: PhotoItem[]) => void, onError?: ContentError) => subscribePublishedCollection('gallery', callback, normalizePhotos, onError);
export const subscribeVideos = (callback: (items: VideoItem[]) => void, onError?: ContentError) => subscribePublishedCollection('videos', callback, normalizeVideos, onError);
export const subscribeRegistrationProcess = (callback: (item: RegistrationProcess) => void, onError?: ContentError) => subscribeDocument('registration_process', 'global', callback, normalizeRegistration, onError);
export const subscribeMembershipTerms = (callback: (item: MembershipTerms) => void, onError?: ContentError) => subscribeDocument('membership_terms', 'global', callback, normalizeTerms, onError);
export const subscribeNavigation = (callback: (items: NavigationItem[]) => void, onError?: ContentError) => subscribeDocument('navigation', 'main', callback, normalizeNavigation, onError);
export const subscribeHomePage = (callback: (value: HomePageContent) => void, onError?: ContentError) => subscribeDocument('pages', 'home', callback, normalizeHome, onError);
export const subscribeFooter = (callback: (value: FooterContent) => void, onError?: ContentError) => subscribeDocument('pages', 'footer', callback, normalizeFooter, onError);

/** General settings only: never overwrite homepage cards, registration data or module toggles from this form. */
export const saveSiteSettingsToCloud = (item: SiteSettings) => setDoc(doc(db, 'site_settings', 'global'), withoutUndefined({ associationName: item.associationName, tagline: item.tagline, logoUrl: item.logoUrl ?? '', contactEmail: item.contactEmail, contactPhone: item.contactPhone, facebookUrl: item.facebookUrl ?? '', instagramUrl: item.instagramUrl ?? '', youtubeUrl: item.youtubeUrl ?? '', locationFontenay: item.locationFontenay, locationLaQueue: item.locationLaQueue, season: item.season ?? '', coursesPageTitle: item.coursesPageTitle ?? 'Nos cours', coursesPageSubtitle: item.coursesPageSubtitle ?? '', agendaPageTitle: item.agendaPageTitle ?? 'Agenda', agendaPageSubtitle: item.agendaPageSubtitle ?? '', galleryPageTitle: item.galleryPageTitle ?? 'Photos & Vidéos', galleryPageSubtitle: item.galleryPageSubtitle ?? '', contactPerson: item.contactPerson ?? '', contactHours: item.contactHours ?? '', postalAddress: item.postalAddress ?? '', contactWhatsApp: item.contactWhatsApp ?? '', updatedAt: serverTimestamp() }), { merge: true });
export const saveNavigation = (items: NavigationItem[]) => setDoc(doc(db, 'navigation', 'main'), { items: sortByOrder(items) }, { merge: true });
export const saveHomePage = (value: HomePageContent) => setDoc(doc(db, 'pages', 'home'), value, { merge: true });
export const saveFooter = (value: FooterContent) => setDoc(doc(db, 'pages', 'footer'), value, { merge: true });
export const saveCourse = (item: DanceClass) => setDoc(doc(db, 'courses', item.id), withoutUndefined({ id: item.id, name: item.name, description: item.description, category: item.category, level: item.level, instructor: item.instructor, schedule: item.schedule, location: item.location, image: item.image, season: item.season ?? '', priceMonthly: item.priceMonthly, annualPrice: item.annualPrice ?? 0, isFree: item.isFree ?? item.annualPrice === 0, helloAssoUrl: item.helloAssoUrl ?? '', registrationButtonText: item.registrationButtonText ?? 'S’inscrire', active: item.active !== false, order: item.order ?? 0 }), { merge: true });
export const archiveCourse = (id: string) => setDoc(doc(db, 'courses', id), { active: false }, { merge: true });
export const saveEvent = (item: DanceEvent) => setDoc(doc(db, 'events', item.id), { id: item.id, title: item.title, type: item.type, date: item.date, time: item.time, location: item.location, description: item.description, price: item.price, image: item.image, externalUrl: item.externalUrl ?? '', active: item.active !== false, order: item.order ?? 0 }, { merge: true });
export const archiveEvent = (id: string) => setDoc(doc(db, 'events', id), { active: false }, { merge: true });
export const saveGalleryPhoto = (item: PhotoItem) => setDoc(doc(db, 'gallery', item.id), { id: item.id, title: item.title, url: item.url, driveFileId: item.driveFileId ?? '', category: item.category ?? '', description: item.description ?? '', date: item.date ?? '', active: item.active !== false, order: item.order ?? 0 }, { merge: true });
export const archiveGalleryPhoto = (id: string) => setDoc(doc(db, 'gallery', id), { active: false }, { merge: true });
export const saveVideo = (item: VideoItem) => setDoc(doc(db, 'videos', item.id), { id: item.id, title: item.title, youtubeId: item.youtubeId, youtubeUrl: item.youtubeUrl ?? '', category: item.category ?? '', description: item.description ?? '', date: item.date ?? '', active: item.active !== false, order: item.order ?? 0 }, { merge: true });
export const archiveVideo = (id: string) => setDoc(doc(db, 'videos', id), { active: false }, { merge: true });
export const saveRegistrationProcess = (item: RegistrationProcess) => setDoc(doc(db, 'registration_process', 'global'), item, { merge: true });
export const saveMembershipTerms = (item: MembershipTerms) => setDoc(doc(db, 'membership_terms', 'global'), item, { merge: true });

/** Separate document keeps homepage cards editable without overwriting general settings. */
export const saveHomepageCards = (vignettes: SiteSettings['vignettes'], registrationInfo: SiteSettings['registrationInfo']) => setDoc(doc(db, 'site_settings', 'global'), { vignettes, registrationInfo, updatedAt: serverTimestamp() }, { merge: true });
