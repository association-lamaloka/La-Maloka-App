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
}

export interface PhotoItem {
  id: string;
  title: string;
  category: string;
  url: string;
  description: string;
  date?: string;
  likes?: number;
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
  vignettes: HomepageVignette[];
  registrationInfo: RegistrationInfo;
  pricingPlans?: PricingPlan[];
  generalConditions?: GeneralConditionsData;
  urgentBanner?: UrgentBanner;
  adminPassword?: string;
  moduleToggles: {
    showRegistrationBanner: boolean;
    showPhotoGallery: boolean;
    showHealthForm: boolean;
    showEventsCalendar: boolean;
    allowOnlineRegistrations: boolean;
  };
}

export interface Inscription {
  id: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  classId: string;
  className: string;
  level: string;
  status: 'Attente de Confirmation' | 'Confirmée' | 'Liste d\'attente' | 'Annulée' | string;
  type?: 'Inscription Annuelle' | "Cours d'essai" | 'Liste d\'attente' | string;
  season?: string;
  date: string;
  amountPaid?: number;
  paymentMethod?: 'HelloAsso' | 'Chèque' | 'Espèces' | 'Virement' | 'Gratuit' | string;
  paymentStatus?: 'Payé' | 'En attente' | 'Non requis' | string;
  orderRef?: string;
  notes?: string;
}

export interface HealthForm {
  id: string;
  userName: string;
  userEmail: string;
  birthDate: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  hasHeartConditions: boolean;
  hasBoneJointProblems: boolean;
  hasDizzinessLossOfBalance: boolean;
  otherMedicalConditions: string;
  acceptsTerms: boolean;
  signature: string;
  date: string;
  status?: 'Validé' | 'En attente' | 'Vérification requise';
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'evento' | 'clase' | 'pago' | 'alerta';
  read: boolean;
}

export interface ExclusiveMaterial {
  id: string;
  title: string;
  type: 'video' | 'musica' | 'guia';
  category: 'Salsa Cubaine' | 'Cardio Latino' | 'Étirements';
  description: string;
  downloadUrl: string;
  duration?: string;
  author: string;
  thumbnail: string;
}

export interface PaymentReceipt {
  id: string;
  concept: string;
  amount: number;
  date: string;
  status: 'Complété' | 'En attente' | string;
  paymentMethod: string;
  userName: string;
}

export interface AdherentMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  code: string;
  status: 'Actif' | 'Expiré';
  renewalDate: string;
  lastPaymentDate?: string;
}


