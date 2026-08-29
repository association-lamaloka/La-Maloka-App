import { useEffect, useState } from 'react';
import { FirebaseError } from 'firebase/app';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { Hero } from './components/Hero';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { SimpleAdmin } from './components/SimpleAdmin';
import { LandingContent } from './components/LandingContent';
import { TropicalPatternBG } from './components/TropicalDecorations';
import { DEFAULT_MEMBERSHIP_TERMS, DEFAULT_REGISTRATION_PROCESS, DEFAULT_SITE_SETTINGS, DEFAULT_VIDEOS, DANCE_CLASSES, DANCE_EVENTS, PHOTO_GALLERY } from './data';
import { DanceClass, MembershipTerms, PhotoItem, RegistrationProcess, SiteSettings, VideoItem } from './types';
import { subscribeCourses, subscribeGallery, subscribeMembershipTerms, subscribeRegistrationProcess, subscribeSiteSettings, subscribeVideos } from './services/firestoreService';
import { auth, authPersistenceReady } from './firebase';

type View = 'accueil' | 'cours' | 'agenda' | 'galerie' | 'conditions' | 'administration';
const ADMIN_EMAIL = 'association.lamaloka@gmail.com';
const firebaseErrorMessage = (caught: unknown) => `La connexion sécurisée avec Google a échoué. Code Firebase : ${caught instanceof FirebaseError ? caught.code : 'auth/unknown-error'}.`;

export default function App() {
  const [view, setView] = useState<View>('accueil');
  const [darkMode, setDarkMode] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [photos, setPhotos] = useState<PhotoItem[]>(PHOTO_GALLERY);
  const [courses, setCourses] = useState<DanceClass[]>(DANCE_CLASSES);
  const [videos, setVideos] = useState<VideoItem[]>(DEFAULT_VIDEOS);
  const [registration, setRegistration] = useState<RegistrationProcess>(DEFAULT_REGISTRATION_PROCESS);
  const [terms, setTerms] = useState<MembershipTerms>(DEFAULT_MEMBERSHIP_TERMS);
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    let unsubscribe = () => {};
    let active = true;
    const acceptUser = async (current: User | null) => {
      if (!active) return;
      if (current && (current.email !== ADMIN_EMAIL || !current.emailVerified)) {
        await signOut(auth);
        if (!active) return;
        setAdminUser(null);
        setAuthError('Ce compte Google n’est pas autorisé à administrer La Maloka.');
        setView('administration');
        return;
      }
      setAdminUser(current);
    };
    const initializeAuth = async () => {
      try {
        await authPersistenceReady;
        unsubscribe = onAuthStateChanged(auth, async (current) => {
          await acceptUser(current);
          if (active) setAuthLoading(false);
        });
      } catch (caught) {
        setAuthError(firebaseErrorMessage(caught));
        setView('administration');
        setAuthLoading(false);
      }
    };
    void initializeAuth();
    return () => { active = false; unsubscribe(); };
  }, []);

  useEffect(() => {
    // Remove legacy caches that may contain member data or shared credentials.
    [
      'maloka_inscriptions',
      'maloka_receipts',
      'maloka_adherents',
      'maloka_admin_password',
      'maloka_sheets_secret_token',
      'maloka_sheets_webhook_url',
      'maloka_site_settings',
    ].forEach((key) => localStorage.removeItem(key));

    const unsubscribeSettings = subscribeSiteSettings(setSettings);
    const unsubscribeGallery = subscribeGallery(setPhotos);
    const unsubscribeCourses = subscribeCourses(setCourses);
    const unsubscribeVideos = subscribeVideos(setVideos);
    const unsubscribeRegistration = subscribeRegistrationProcess(setRegistration);
    const unsubscribeTerms = subscribeMembershipTerms(setTerms);
    return () => {
      unsubscribeSettings();
      unsubscribeGallery();
      unsubscribeCourses();
      unsubscribeVideos();
      unsubscribeRegistration();
      unsubscribeTerms();
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const navigate = (next: string) => {
    setView(next as View);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <TropicalPatternBG />
      <Navigation
        currentTab={view}
        setCurrentTab={navigate}
        isDarkMode={darkMode}
        toggleDarkMode={() => setDarkMode((current) => !current)}
      />

      <main>
        {view === 'accueil' && (
          <Hero
            siteSettings={settings}
            onExploreClasses={() => navigate('cours')}
            onViewCalendar={() => navigate('agenda')}
            onViewRegistrationDates={() => navigate('cours')}
          />
        )}
        {view === 'cours' && <LandingContent section="cours" classes={courses} registration={registration} terms={terms} onShowTerms={() => navigate('conditions')} />}
        {view === 'agenda' && <LandingContent section="agenda" events={DANCE_EVENTS} />}
        {view === 'galerie' && <LandingContent section="galerie" photos={photos} videos={videos} />}
        {view === 'conditions' && <LandingContent section="conditions" terms={terms} onBack={() => navigate('cours')} />}
        {view === 'administration' && (
          <SimpleAdmin settings={settings} courses={courses} photos={photos} videos={videos} registration={registration} terms={terms} user={adminUser} authLoading={authLoading} authError={authError} onAuthorized={setAdminUser} />
        )}
      </main>

      <Footer setCurrentTab={navigate} siteSettings={settings} />
    </div>
  );
}
