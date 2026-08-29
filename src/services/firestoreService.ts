import { collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, serverTimestamp, setDoc, where, writeBatch } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { DanceClass, DanceEvent, FooterContent, HomePageContent, MembershipTerms, NavigationItem, PhotoItem, RegistrationProcess, SiteSettings, VideoItem } from '../types';
import { DEFAULT_FOOTER, DEFAULT_HOME_PAGE, DEFAULT_MEMBERSHIP_TERMS, DEFAULT_NAVIGATION, DEFAULT_REGISTRATION_PROCESS, DEFAULT_SITE_SETTINGS, DEFAULT_VIDEOS, DANCE_CLASSES, DANCE_EVENTS, PHOTO_GALLERY } from '../data';

const sortByOrder = <T extends { order?: number }>(items: T[]) => [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
const withoutUndefined = <T extends object>(value: T) => Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined));
const subscribePublishedCollection = <T extends { order?: number }>(name: string, callback: (items: T[]) => void) => {
  let unsubscribeSnapshot = () => {};
  const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
    unsubscribeSnapshot();
    const isAdmin = user?.email === 'association.lamaloka@gmail.com' && user.emailVerified;
    const source = isAdmin ? collection(db, name) : query(collection(db, name), where('active', '==', true));
    unsubscribeSnapshot = onSnapshot(source, (snapshot) => callback(sortByOrder(snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as unknown as T)))), () => callback([]));
  });
  return () => { unsubscribeSnapshot(); unsubscribeAuth(); };
};

export const subscribeSiteSettings = (callback: (settings: SiteSettings) => void) =>
  onSnapshot(doc(db, 'site_settings', 'global'), (snapshot) => callback(snapshot.exists() ? { ...DEFAULT_SITE_SETTINGS, ...snapshot.data() } as SiteSettings : DEFAULT_SITE_SETTINGS), () => callback(DEFAULT_SITE_SETTINGS));
export const subscribeCourses = (callback: (items: DanceClass[]) => void) => subscribePublishedCollection<DanceClass>('courses', callback);
export const subscribeEvents = (callback: (items: DanceEvent[]) => void) => subscribePublishedCollection<DanceEvent>('events', callback);
export const subscribeGallery = (callback: (items: PhotoItem[]) => void) => subscribePublishedCollection<PhotoItem>('gallery', callback);
export const subscribeVideos = (callback: (items: VideoItem[]) => void) => subscribePublishedCollection<VideoItem>('videos', callback);
export const subscribeRegistrationProcess = (callback: (item: RegistrationProcess) => void) =>
  onSnapshot(doc(db, 'registration_process', 'global'), (snapshot) => callback(snapshot.exists() ? snapshot.data() as RegistrationProcess : DEFAULT_REGISTRATION_PROCESS), () => callback(DEFAULT_REGISTRATION_PROCESS));
export const subscribeMembershipTerms = (callback: (item: MembershipTerms) => void) =>
  onSnapshot(doc(db, 'membership_terms', 'global'), (snapshot) => callback(snapshot.exists() ? snapshot.data() as MembershipTerms : DEFAULT_MEMBERSHIP_TERMS), () => callback(DEFAULT_MEMBERSHIP_TERMS));
export const subscribeNavigation = (callback: (items: NavigationItem[]) => void) => onSnapshot(doc(db, 'navigation', 'main'), (snapshot) => callback(snapshot.exists() ? sortByOrder(snapshot.data().items as NavigationItem[]) : DEFAULT_NAVIGATION), () => callback(DEFAULT_NAVIGATION));
export const subscribeHomePage = (callback: (value: HomePageContent) => void) => onSnapshot(doc(db, 'pages', 'home'), (snapshot) => callback(snapshot.exists() ? { ...DEFAULT_HOME_PAGE, ...snapshot.data() } as HomePageContent : DEFAULT_HOME_PAGE), () => callback({ ...DEFAULT_HOME_PAGE, published: false }));
export const subscribeFooter = (callback: (value: FooterContent) => void) => onSnapshot(doc(db, 'pages', 'footer'), (snapshot) => callback(snapshot.exists() ? { ...DEFAULT_FOOTER, ...snapshot.data() } as FooterContent : DEFAULT_FOOTER), () => callback({ ...DEFAULT_FOOTER, published: false }));

export const saveSiteSettingsToCloud = (item: SiteSettings) => setDoc(doc(db, 'site_settings', 'global'), withoutUndefined({ associationName: item.associationName, tagline: item.tagline, logoUrl: item.logoUrl ?? '', heroHeadline: item.heroHeadline, heroSubheadline: item.heroSubheadline, heroImage: item.heroImage ?? '', contactEmail: item.contactEmail, contactPhone: item.contactPhone, facebookUrl: item.facebookUrl ?? '', instagramUrl: item.instagramUrl ?? '', youtubeUrl: item.youtubeUrl ?? '', locationFontenay: item.locationFontenay, locationLaQueue: item.locationLaQueue, season: item.season ?? '', footerLegalText: item.footerLegalText ?? '', copyrightText: item.copyrightText ?? '', coursesPageTitle: item.coursesPageTitle ?? 'Nos cours', coursesPageSubtitle: item.coursesPageSubtitle ?? '', agendaPageTitle: item.agendaPageTitle ?? 'Agenda', agendaPageSubtitle: item.agendaPageSubtitle ?? '', galleryPageTitle: item.galleryPageTitle ?? 'Photos & Vidéos', galleryPageSubtitle: item.galleryPageSubtitle ?? '', bannerText: item.bannerText ?? item.registrationInfo.bannerText, bannerVisible: item.bannerVisible ?? item.moduleToggles.showRegistrationBanner, heroPrimaryButtonText: item.heroPrimaryButtonText ?? 'Planning, tarifs & cours 2026-2027', heroSecondaryButtonText: item.heroSecondaryButtonText ?? 'Dates & Agenda', updatedAt: serverTimestamp() }));
export const saveNavigation = (items: NavigationItem[]) => setDoc(doc(db, 'navigation', 'main'), { items: sortByOrder(items) });
export const saveHomePage = (value: HomePageContent) => setDoc(doc(db, 'pages', 'home'), value);
export const saveFooter = (value: FooterContent) => setDoc(doc(db, 'pages', 'footer'), value);
export const saveCourse = (item: DanceClass) => setDoc(doc(db, 'courses', item.id), withoutUndefined({ id: item.id, name: item.name, description: item.description, category: item.category, level: item.level, instructor: item.instructor, schedule: item.schedule, location: item.location, image: item.image, season: item.season ?? '', priceMonthly: item.priceMonthly, annualPrice: item.annualPrice ?? 0, isFree: item.isFree ?? item.annualPrice === 0, helloAssoUrl: item.helloAssoUrl ?? '', registrationButtonText: item.registrationButtonText ?? 'S’inscrire', active: item.active !== false, order: item.order ?? 0 }));
export const deleteCourse = (id: string) => deleteDoc(doc(db, 'courses', id));
export const saveEvent = (item: DanceEvent) => setDoc(doc(db, 'events', item.id), { id: item.id, title: item.title, type: item.type, date: item.date, time: item.time, location: item.location, description: item.description, price: item.price, image: item.image, externalUrl: item.externalUrl ?? '', active: item.active !== false, order: item.order ?? 0 });
export const deleteEvent = (id: string) => deleteDoc(doc(db, 'events', id));
export const saveGalleryPhoto = (item: PhotoItem) => setDoc(doc(db, 'gallery', item.id), { id: item.id, title: item.title, url: item.url, driveFileId: item.driveFileId ?? '', category: item.category ?? '', description: item.description ?? '', date: item.date ?? '', active: item.active !== false, order: item.order ?? 0 });
export const deleteGalleryPhoto = (id: string) => deleteDoc(doc(db, 'gallery', id));
export const saveVideo = (item: VideoItem) => setDoc(doc(db, 'videos', item.id), { id: item.id, title: item.title, youtubeId: item.youtubeId, description: item.description ?? '', date: item.date ?? '', active: item.active !== false, order: item.order ?? 0 });
export const deleteVideo = (id: string) => deleteDoc(doc(db, 'videos', id));
export const saveRegistrationProcess = (item: RegistrationProcess) => setDoc(doc(db, 'registration_process', 'global'), item);
export const saveMembershipTerms = (item: MembershipTerms) => setDoc(doc(db, 'membership_terms', 'global'), item);

export async function initializeFirestoreContent() {
  const batch = writeBatch(db);
  const summary: string[] = [];
  const collections = [
    { name: 'courses', items: DANCE_CLASSES.map((item, order) => ({ id: item.id, name: item.name, description: item.description, category: item.category, level: item.level, instructor: item.instructor, schedule: item.schedule, location: item.location, image: item.image, season: item.season ?? '', priceMonthly: item.priceMonthly, annualPrice: item.annualPrice ?? 0, isFree: item.annualPrice === 0, helloAssoUrl: item.helloAssoUrl ?? '', registrationButtonText: item.registrationButtonText ?? 'S’inscrire', active: item.active !== false, order })) },
    { name: 'gallery', items: PHOTO_GALLERY.map((item, order) => ({ id: item.id, title: item.title, url: item.url, driveFileId: '', category: item.category, description: item.description, date: item.date ?? '', active: true, order })) },
    { name: 'videos', items: DEFAULT_VIDEOS.map((item, order) => ({ id: item.id, title: item.title, youtubeId: item.youtubeId, description: item.description, date: item.date, active: true, order })) },
    { name: 'events', items: DANCE_EVENTS.map((item, order) => ({ id: item.id, title: item.title, type: item.type, date: item.date, time: item.time, location: item.location, description: item.description, price: item.price, image: item.image, externalUrl: '', active: item.active !== false, order })) },
  ];
  for (const entry of collections) {
    const snapshot = await getDocs(collection(db, entry.name));
    if (snapshot.empty) {
      entry.items.forEach((item) => batch.set(doc(db, entry.name, item.id), withoutUndefined(item)));
      summary.push(`${entry.items.length} élément(s) dans ${entry.name}`);
    } else summary.push(`${entry.name} déjà initialisée (ignorée)`);
  }
  const documents = [
    { collectionName: 'site_settings', value: { associationName: DEFAULT_SITE_SETTINGS.associationName, tagline: DEFAULT_SITE_SETTINGS.tagline, logoUrl: '', heroHeadline: DEFAULT_SITE_SETTINGS.heroHeadline, heroSubheadline: DEFAULT_SITE_SETTINGS.heroSubheadline, heroImage: DEFAULT_SITE_SETTINGS.heroImage ?? '', contactEmail: DEFAULT_SITE_SETTINGS.contactEmail, contactPhone: DEFAULT_SITE_SETTINGS.contactPhone, facebookUrl: DEFAULT_SITE_SETTINGS.facebookUrl ?? '', instagramUrl: DEFAULT_SITE_SETTINGS.instagramUrl ?? '', youtubeUrl: DEFAULT_SITE_SETTINGS.youtubeUrl ?? '', locationFontenay: DEFAULT_SITE_SETTINGS.locationFontenay, locationLaQueue: DEFAULT_SITE_SETTINGS.locationLaQueue, season: 'Saison 2026 - 2027', footerLegalText: '', copyrightText: '© 2026 Association La Maloka. Salsa Cubaine & Cardio Latino dans les Yvelines.', coursesPageTitle: 'Nos cours', coursesPageSubtitle: "Découvrez les activités proposées par l'association.", agendaPageTitle: 'Agenda', agendaPageSubtitle: 'Les rendez-vous, stages et rencontres de La Maloka.', galleryPageTitle: 'Photos & Vidéos', galleryPageSubtitle: 'Quelques souvenirs de nos cours et événements.', bannerText: DEFAULT_SITE_SETTINGS.registrationInfo.bannerText, bannerVisible: DEFAULT_SITE_SETTINGS.moduleToggles.showRegistrationBanner, heroPrimaryButtonText: 'Planning, tarifs & cours 2026-2027', heroSecondaryButtonText: 'Dates & Agenda' } },
    { collectionName: 'registration_process', value: DEFAULT_REGISTRATION_PROCESS },
    { collectionName: 'membership_terms', value: DEFAULT_MEMBERSHIP_TERMS },
    { collectionName: 'navigation', value: { items: DEFAULT_NAVIGATION }, documentId: 'main' },
    { collectionName: 'pages', value: DEFAULT_HOME_PAGE, documentId: 'home' },
    { collectionName: 'pages', value: DEFAULT_FOOTER, documentId: 'footer' },
  ];
  for (const entry of documents) {
    const documentId = 'documentId' in entry ? entry.documentId : 'global';
    const exists = 'documentId' in entry ? (await getDoc(doc(db, entry.collectionName, documentId))).exists() : !(await getDocs(collection(db, entry.collectionName))).empty;
    if (!exists) {
      batch.set(doc(db, entry.collectionName, documentId), withoutUndefined(entry.value));
      summary.push(`${entry.collectionName} initialisée`);
    } else summary.push(`${entry.collectionName} déjà initialisée (ignorée)`);
  }
  await batch.commit();
  return summary;
}
