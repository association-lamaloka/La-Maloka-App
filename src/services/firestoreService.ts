import { collection, deleteDoc, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { PhotoItem, SiteSettings } from '../types';
import { DEFAULT_SITE_SETTINGS, PHOTO_GALLERY } from '../data';

const publicSettings = (data: Partial<SiteSettings>): SiteSettings => {
  return { ...DEFAULT_SITE_SETTINGS, ...data } as SiteSettings;
};

export const subscribeSiteSettings = (callback: (settings: SiteSettings) => void) =>
  onSnapshot(doc(db, 'site_settings', 'global'), (snapshot) => {
    callback(snapshot.exists() ? publicSettings(snapshot.data()) : DEFAULT_SITE_SETTINGS);
  }, () => callback(DEFAULT_SITE_SETTINGS));

export const saveSiteSettingsToCloud = async (settings: SiteSettings) => {
  await setDoc(doc(db, 'site_settings', 'global'), { ...settings, updatedAt: serverTimestamp() }, { merge: true });
};

export const subscribeGallery = (callback: (photos: PhotoItem[]) => void) =>
  onSnapshot(collection(db, 'gallery'), (snapshot) => {
    callback(snapshot.empty ? PHOTO_GALLERY : snapshot.docs.map((item) => ({ id: item.id, ...item.data() } as PhotoItem)));
  }, () => callback(PHOTO_GALLERY));

export const saveGalleryPhoto = async (photo: PhotoItem) => {
  await setDoc(doc(db, 'gallery', photo.id), photo);
};

export const deleteGalleryPhoto = async (id: string) => {
  await deleteDoc(doc(db, 'gallery', id));
};
