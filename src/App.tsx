/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Navigation } from './components/Navigation';
import { ScrollingTopBanner } from './components/ScrollingTopBanner';
import { Hero } from './components/Hero';
import { ClassesAndInscriptions } from './components/ClassesAndInscriptions';
import { EventsCalendar } from './components/EventsCalendar';
import { PhotoGallery } from './components/PhotoGallery';
import { PaymentSystem } from './components/PaymentSystem';
import { NotificationsCenter } from './components/NotificationsCenter';
import { BackOffice } from './components/BackOffice';
import { Footer } from './components/Footer';
import { TropicalPatternBG } from './components/TropicalDecorations';
import { NotificationItem, DanceClass, DanceEvent, Inscription, PaymentReceipt, SiteSettings, DanceRoom, PhotoItem, VideoItem } from './types';
import { DANCE_CLASSES, DANCE_EVENTS, DEFAULT_SITE_SETTINGS, DEFAULT_ROOMS, PHOTO_GALLERY, DEFAULT_VIDEOS, DEFAULT_PRICING_PLANS, DEFAULT_GENERAL_CONDITIONS } from './data';
import { Heart, Sparkles, Award, MapPin } from 'lucide-react';
import { 
  subscribeSiteSettings, 
  subscribeClasses, 
  subscribeInscriptions,
  saveSiteSettingsToCloud,
  saveClassesToCloud
} from './services/firestoreService';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('inicio');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // --- Centralized States for BackOffice and Persistency ---

  // Rooms & Venues (with capacity / aforo limitations)
  const [rooms, setRooms] = useState<DanceRoom[]>(() => {
    try {
      const saved = localStorage.getItem('maloka_rooms');
      return saved ? JSON.parse(saved) : DEFAULT_ROOMS;
    } catch (e) {
      return DEFAULT_ROOMS;
    }
  });

  // Gallery Photos
  const [photos, setPhotos] = useState<PhotoItem[]>(() => {
    try {
      const saved = localStorage.getItem('maloka_gallery_photos');
      return saved ? JSON.parse(saved) : PHOTO_GALLERY;
    } catch (e) {
      return PHOTO_GALLERY;
    }
  });

  // Gallery YouTube Videos
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    try {
      const saved = localStorage.getItem('maloka_gallery_videos');
      return saved ? JSON.parse(saved) : DEFAULT_VIDEOS;
    } catch (e) {
      return DEFAULT_VIDEOS;
    }
  });

  // Save gallery media to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('maloka_gallery_photos', JSON.stringify(photos));
    } catch (e) {}
  }, [photos]);

  useEffect(() => {
    try {
      localStorage.setItem('maloka_gallery_videos', JSON.stringify(videos));
    } catch (e) {}
  }, [videos]);

  // Site Settings (Welcome page, Hero texts, the 2 Vignettes: Salsa Cubaine & Cardio Latino, Registration info, Tarifs, CGU)
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    try {
      const saved = localStorage.getItem('maloka_site_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SITE_SETTINGS,
          ...parsed,
          pricingPlans: parsed.pricingPlans && parsed.pricingPlans.length > 0 ? parsed.pricingPlans : DEFAULT_PRICING_PLANS,
          generalConditions: parsed.generalConditions || DEFAULT_GENERAL_CONDITIONS
        };
      }
      return DEFAULT_SITE_SETTINGS;
    } catch (e) {
      return DEFAULT_SITE_SETTINGS;
    }
  });

  // Classes (Strictly Salsa Cubaine & Cardio Latino)
  const [classes, setClasses] = useState<DanceClass[]>(() => {
    try {
      const saved = localStorage.getItem('maloka_classes');
      return saved ? JSON.parse(saved) : DANCE_CLASSES;
    } catch (e) {
      return DANCE_CLASSES;
    }
  });

  // Events & Stages
  const [events, setEvents] = useState<DanceEvent[]>(() => {
    try {
      const saved = localStorage.getItem('maloka_events');
      return saved ? JSON.parse(saved) : DANCE_EVENTS;
    } catch (e) {
      return DANCE_EVENTS;
    }
  });

  // Inscriptions
  const [inscriptions, setInscriptions] = useState<Inscription[]>(() => {
    try {
      const saved = localStorage.getItem('maloka_inscriptions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // ----------------------------------------------------------------
  // Real-time Cloud Synchronization with Firebase Firestore
  // ----------------------------------------------------------------
  useEffect(() => {
    // 1. Subscribe to Cloud Site Settings
    const unsubSettings = subscribeSiteSettings((cloudSettings) => {
      if (cloudSettings) {
        setSiteSettings(prev => ({
          ...prev,
          ...cloudSettings,
          pricingPlans: cloudSettings.pricingPlans && cloudSettings.pricingPlans.length > 0 ? cloudSettings.pricingPlans : prev.pricingPlans,
          generalConditions: cloudSettings.generalConditions || prev.generalConditions
        }));
        try {
          localStorage.setItem('maloka_site_settings', JSON.stringify(cloudSettings));
        } catch (e) {}
      }
    });

    // 2. Subscribe to Cloud Classes
    const unsubClasses = subscribeClasses((cloudClasses) => {
      if (cloudClasses && cloudClasses.length > 0) {
        setClasses(cloudClasses);
        try {
          localStorage.setItem('maloka_classes', JSON.stringify(cloudClasses));
        } catch (e) {}
      }
    });

    // 3. Subscribe to Cloud Inscriptions
    const unsubInscriptions = subscribeInscriptions((cloudInscriptions) => {
      if (cloudInscriptions) {
        setInscriptions(cloudInscriptions);
        try {
          localStorage.setItem('maloka_inscriptions', JSON.stringify(cloudInscriptions));
        } catch (e) {}
      }
    });

    return () => {
      unsubSettings();
      unsubClasses();
      unsubInscriptions();
    };
  }, []);

  // Receipts
  const [receipts, setReceipts] = useState<PaymentReceipt[]>(() => {
    try {
      const saved = localStorage.getItem('maloka_receipts');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Notifications state in French
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      title: 'Bienvenue à La Maloka ! 🌺',
      description: 'Découvrez notre programme officiel pour la saison 2026-2027 : Salsa Cubaine & Cardio Latino à Fontenay et La Queue-les-Yvelines.',
      date: 'Aujourd\'hui',
      type: 'alerta',
      read: false,
    },
    {
      id: 'n2',
      title: 'Forums des Associations en Septembre 📅',
      description: 'Venez nous rencontrer à Fontenay-le-Fleury et La Queue-les-Yvelines pour les inscriptions et démonstrations !',
      date: 'Rentrée 2026',
      type: 'evento',
      read: false,
    }
  ]);

  // Dynamic payment redirection parameters
  const [paymentConcept, setPaymentConcept] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  // Pre-opened class form
  const [targetClassId, setTargetClassId] = useState<string>('');

  // Handle Dark Mode toggle
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Handle addition of a notification
  const addNotification = (
    title: string,
    description: string,
    type: 'evento' | 'clase' | 'pago' | 'alerta'
  ) => {
    const newNotif: NotificationItem = {
      id: 'n-' + Date.now(),
      title,
      description,
      date: 'À l\'instant',
      type,
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleTriggerTestAlert = () => {
    addNotification(
      'Information Rentrée 2026-2027 💃',
      'Les pré-inscriptions en ligne pour la Salsa Cubaine et le Cardio Latino sont ouvertes !',
      'alerta'
    );
    alert('Notification envoyée !');
  };

  const handleTriggerPayment = (concept: string, amount: number) => {
    setPaymentConcept(concept);
    setPaymentAmount(amount);
    setCurrentTab('pago');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentComplete = () => {
    setPaymentConcept('');
    setPaymentAmount(0);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className={`min-h-screen flex flex-col justify-between font-sans transition-colors duration-300 ${
      isDarkMode ? 'bg-zinc-950 text-zinc-100' : 'bg-white text-zinc-900'
    }`}>
      
      {/* Tropical floating background elements */}
      <TropicalPatternBG />

      {/* Scrolling Top Banner with Upcoming Key Dates */}
      <ScrollingTopBanner
        registrationInfo={siteSettings.registrationInfo}
        events={events}
        onNavigateDate={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Persistent Navigation */}
      <Navigation
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          if (tab !== 'clases') setTargetClassId('');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        notificationCount={unreadCount}
        setShowNotifications={setShowNotifications}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />

      {/* Floating Notifications drawer center */}
      <NotificationsCenter
        show={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllRead}
        onClearAll={handleClearAll}
        onMarkRead={handleMarkRead}
        onTriggerTestAlert={handleTriggerTestAlert}
      />

      {/* Main Container tabs routing */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
          >
            {currentTab === 'inicio' && (
              <Hero
                siteSettings={siteSettings}
                onExploreClasses={(categoryFilter?: string) => {
                  setCurrentTab('clases');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onViewCalendar={() => {
                  setCurrentTab('calendario');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onViewRegistrationDates={() => {
                  setCurrentTab('clases');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {currentTab === 'clases' && (
              <ClassesAndInscriptions
                classes={classes}
                inscriptions={inscriptions}
                setInscriptions={setInscriptions}
                rooms={rooms}
                siteSettings={siteSettings}
                onTriggerPayment={handleTriggerPayment}
                addNotification={addNotification}
                defaultClassId={targetClassId}
              />
            )}

            {currentTab === 'calendario' && (
              <EventsCalendar
                events={events}
                onTriggerPayment={handleTriggerPayment}
                addNotification={addNotification}
              />
            )}

            {currentTab === 'galeria' && (
              <PhotoGallery
                photos={photos}
                setPhotos={setPhotos}
                videos={videos}
                setVideos={setVideos}
                siteSettings={siteSettings}
              />
            )}

            {currentTab === 'pago' && (
              <PaymentSystem
                initialConcept={paymentConcept}
                initialAmount={paymentAmount}
                receipts={receipts}
                setReceipts={setReceipts}
                addNotification={addNotification}
                onPaymentComplete={handlePaymentComplete}
              />
            )}

            {currentTab === 'backoffice' && (
              <BackOffice
                classes={classes}
                setClasses={setClasses}
                events={events}
                setEvents={setEvents}
                inscriptions={inscriptions}
                setInscriptions={setInscriptions}
                rooms={rooms}
                setRooms={setRooms}
                photos={photos}
                setPhotos={setPhotos}
                videos={videos}
                setVideos={setVideos}
                siteSettings={siteSettings}
                setSiteSettings={setSiteSettings}
                addNotification={addNotification}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Persistent Footer with links navigation trigger */}
      <Footer setCurrentTab={setCurrentTab} siteSettings={siteSettings} />

    </div>
  );
}
