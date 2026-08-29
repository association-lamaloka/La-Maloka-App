export interface DanceRoom {
  id: string;
  name: string;
  location: 'Fontenay-le-Fleury' | 'La Queue-les-Yvelines' | string;
  address: string;
  maxCapacity: number; // Capacité maximale / aforo de la salle
  surfaceAreaM2?: number; // Surface en m²
  equipment?: string[]; // Miroirs, sono, climatisation, parquet...
  notes?: string;
  active: boolean;
}

export interface DanceClass {
  id: string;
  name: string;
  instructor: string;
  schedule: string;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Tous Niveaux' | string;
  description: string;
  priceMonthly: number;
  annualPrice?: number;
  isFree?: boolean;
  order?: number;
  image: string;
  category: 'Salsa Cubaine' | 'Cardio Latino' | string;
  location: 'Fontenay-le-Fleury' | 'La Queue-les-Yvelines' | string;
  active?: boolean;
  
  // Room & Aforo / Capacity fields
  roomId?: string; // Linked DanceRoom id
  roomName?: string; // Denormalized room name
  maxSpots?: number; // Capacité max du cours (hérité de la salle ou personnalisé)
  waitlistCount?: number; // Nombre d'inscrits en liste d'attente

  // HelloAsso & Inscription Campaign Management fields
  season?: string; // e.g. 'Saison 2026 - 2027'
  campaignType?: 'Cours Annuel' | "Cours d'essai" | 'Stage' | string;
  visibility?: 'Public' | 'Privé' | 'Archivé' | string;
  subscribersCount?: number; // Adhérents inscrits (HelloAsso)
  spotsRemaining?: number; // Plazas disponibles restantes (maxSpots - subscribersCount)
  collectedAmount?: number; // Montant collecté en €
  daysRemaining?: number; // Nombre de jours restants
  helloAssoUrl?: string; // Lien direct HelloAsso
  registrationButtonText?: string;
  lastHelloAssoSync?: string; // Horodatage de la dernière synchronisation
  trialDate?: string; // Pour les cours d'essai (ex: 11 septembre 2026)
  isTrialClass?: boolean;
}

export interface DanceEvent {
  id: string;
  title: string;
  type: 'Stage' | 'Soirée' | 'Festival' | 'Atelier' | string;
  date: string;
  time: string;
  location: string;
  instructor?: string;
  price: number;
  description: string;
  spotsLeft: number;
  totalSpots: number;
  image: string;
  active?: boolean;
  order?: number;
  externalUrl?: string;
}

export interface PhotoItem {
  id: string;
  title: string;
  category: string;
  url: string;
  description: string;
  date?: string;
  likes?: number;
  active?: boolean;
  order?: number;
  driveFileId?: string;
}

export interface VideoItem {
  id: string;
  title: string;
  category: string;
  youtubeUrl: string;
  youtubeId?: string;
  description: string;
  duration?: string;
  thumbnail?: string;
  views?: string;
  date?: string;
  featured?: boolean;
  likes?: number;
  active?: boolean;
  order?: number;
}

export interface RegistrationProcess {
  title: string;
  steps: Array<{ id: string; text: string; order: number }>;
  finalNote: string;
  visible: boolean;
}

export interface MembershipTerms {
  title: string;
  subtitle: string;
  lastUpdated: string;
  sections: Array<{ id: string; title: string; content: string; order: number }>;
  visible: boolean;
}

export interface NavigationItem {
  id: string;
  label: string;
  destination: 'accueil' | 'cours' | 'agenda' | 'galerie';
  order: number;
  active: boolean;
}

export interface HomePageContent {
  eyebrow: string;
  headline: string;
  highlight: string;
  description: string;
  heroImageUrl: string;
  logoUrl: string;
  overlayTitle: string;
  overlayText: string;
  overlayImageUrl: string;
  bannerText: string;
  bannerButtonText: string;
  bannerButtonDestination: 'cours' | 'agenda';
  primaryButtonText: string;
  primaryButtonDestination: 'cours' | 'agenda';
  secondaryButtonText: string;
  secondaryButtonDestination: 'cours' | 'agenda';
  locationBadgeOne: string;
  locationBadgeTwo: string;
  seasonBadge: string;
  sections: Array<{ id: string; title: string; subtitle: string; order: number; visible: boolean }>;
  published: boolean;
}

export interface FooterContent {
  description: string;
  address: string;
  email: string;
  phone: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  links: Array<{ id: string; label: string; destination: 'cours' | 'agenda' | 'galerie' | 'conditions'; order: number; visible: boolean }>;
  legalNotice: string;
  copyright: string;
  blocks: Array<{ id: string; label: string; order: number; visible: boolean }>;
  published: boolean;
}

export interface HomepageVignette {
  id: 'salsa-cubaine' | 'cardio-latino' | string;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  image: string;
  accentColor: 'orange' | 'rose' | 'emerald' | 'amber';
  scheduleSummary: string;
  locationSummary: string;
  keyPoints: string[];
  active: boolean;
}

export interface UrgentBanner {
  enabled: boolean;
  type: 'urgent' | 'info' | 'warning' | 'succes';
  badge: string;
  title: string;
  message: string;
  linkText?: string;
  linkAction?: string;
  isDismissible?: boolean;
}

export interface PricingPlan {
  id: string;
  day: string; // 'Mardi', 'Jeudi', 'Vendredi'
  discipline: 'Cardio Latino' | 'Salsa Cubaine' | string;
  time: string; // '20h', '21h'
  level: string; // 'Tous niveaux', 'Débutants', 'Intermédiaires & Confirmés'
  location: string; // 'La Queue lez Yvelines', 'Fontenay le Fleury'
  room: string; // 'Salle Jeanne d\'Arc', 'Salle "Le Studio" - Mairie'
  duration: string; // 'Durée : 1h'
  price: number; // 210, 198
  period: string; // 'par personne'
  instructor?: string;
  notes?: string;
  badge?: string;
  active?: boolean;
  classId?: string;
  helloAssoUrl?: string;
}

export interface GeneralConditionSection {
  id: string;
  title: string;
  content: string;
  icon?: string;
}

export interface GeneralConditionsData {
  title: string;
  lastUpdated: string;
  subtitle: string;
  sections: GeneralConditionSection[];
  pdfUrl?: string;
  pdfFileName?: string;
  pdfFileSize?: string;
  pdfUploadDate?: string;
}

export interface RegistrationInfo {
  seasonTitle: string;
  bannerText: string;
  isRegistrationOpen: boolean;
  importantDates: Array<{
    date: string;
    label: string;
    location: string;
  }>;
  guidelines: string[];
  documentsRequired: string[];
}

export interface SiteSettings {
  associationName: string;
  tagline: string;
  logoUrl?: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroImage?: string;
  associationStory: string;
  contactEmail: string;
  contactPhone: string;
  contactWhatsApp?: string;
  contactPerson?: string;
  contactHours?: string;
  locationFontenay: string;
  locationLaQueue: string;
  postalAddress?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  season?: string;
  footerLegalText?: string;
  copyrightText?: string;
  coursesPageTitle?: string;
  coursesPageSubtitle?: string;
  agendaPageTitle?: string;
  agendaPageSubtitle?: string;
  galleryPageTitle?: string;
  galleryPageSubtitle?: string;
  bannerText?: string;
  bannerVisible?: boolean;
  heroPrimaryButtonText?: string;
  heroSecondaryButtonText?: string;
  vignettes: HomepageVignette[];
  registrationInfo: RegistrationInfo;
  pricingPlans?: PricingPlan[];
  generalConditions?: GeneralConditionsData;
  urgentBanner?: UrgentBanner;
  moduleToggles: {
    showRegistrationBanner: boolean;
    showPhotoGallery: boolean;
    showHealthForm: boolean;
    showEventsCalendar: boolean;
    allowOnlineRegistrations: boolean;
  };
}
