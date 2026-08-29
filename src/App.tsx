import { useEffect, useState } from 'react';
import { Hero } from './components/Hero';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { SimpleAdmin } from './components/SimpleAdmin';
import { LandingContent } from './components/LandingContent';
import { TropicalPatternBG } from './components/TropicalDecorations';
import { DEFAULT_SITE_SETTINGS, DANCE_CLASSES, DANCE_EVENTS, PHOTO_GALLERY } from './data';
import { PhotoItem, SiteSettings } from './types';
import { subscribeGallery, subscribeSiteSettings } from './services/firestoreService';

type View = 'accueil' | 'cours' | 'agenda' | 'galerie' | 'administration';

export default function App() {
  const [view, setView] = useState<View>('accueil');
  const [darkMode, setDarkMode] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [photos, setPhotos] = useState<PhotoItem[]>(PHOTO_GALLERY);

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
    return () => {
      unsubscribeSettings();
      unsubscribeGallery();
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
        {view === 'cours' && <LandingContent section="cours" classes={DANCE_CLASSES} />}
        {view === 'agenda' && <LandingContent section="agenda" events={DANCE_EVENTS} />}
        {view === 'galerie' && <LandingContent section="galerie" photos={photos} />}
        {view === 'administration' && (
          <SimpleAdmin settings={settings} photos={photos} />
        )}
      </main>

      <Footer setCurrentTab={navigate} siteSettings={settings} />
    </div>
  );
}
