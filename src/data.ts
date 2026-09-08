import { DanceClass, DanceEvent, FooterContent, HomePageContent, PhotoItem, VideoItem, SiteSettings, DanceRoom, PricingPlan, GeneralConditionsData, MembershipTerms, NavigationItem, RegistrationProcess } from './types';

export const GENERATED_HERO_IMAGE = 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=1200';
export const GENERATED_MOTION_IMAGE = 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=1200';

export const DEFAULT_ROOMS: DanceRoom[] = [
  {
    id: 'room-levant-polyvalente',
    name: 'Gymnase du Levant - Grande Salle Polyvalente',
    location: 'Fontenay-le-Fleury',
    address: '8 Rue René Descartes, 78330 Fontenay-le-Fleury',
    maxCapacity: 35,
    surfaceAreaM2: 160,
    equipment: ['Parquet massif', 'Miroirs muraux', 'Sono Bluetooth pro', 'Vestiaires'],
    notes: 'Idéal pour grands groupes, cours d\'essai, rueda de casino et cardio latino.',
    active: true
  },
  {
    id: 'room-levant-danse',
    name: 'Gymnase du Levant - Salle de Danse Annexe',
    location: 'Fontenay-le-Fleury',
    address: '8 Rue René Descartes, 78330 Fontenay-le-Fleury',
    maxCapacity: 28,
    surfaceAreaM2: 115,
    equipment: ['Miroirs intégraux', 'Barres de danse', 'Sono connectée', 'Climatisation'],
    notes: 'Parfait pour Salsa Intermédiaire / Avancé avec travail de posture et style.',
    active: true
  },
  {
    id: 'room-chenevieres-evolution',
    name: 'Gymnase des Chenevières - Salle d\'Évolution',
    location: 'Fontenay-le-Fleury',
    address: 'Rue César Franck, 78330 Fontenay-le-Fleury',
    maxCapacity: 30,
    surfaceAreaM2: 130,
    equipment: ['Revêtement souple amortissant', 'Sono stéréo', 'Éclairage d\'ambiance'],
    notes: 'Créneau Cardio Latino et sessions de renforcement rythmique.',
    active: true
  },
  {
    id: 'room-lqy-fetes',
    name: 'Salle Polyvalente & Fêtes de La Queue-lez-Yvelines',
    location: 'La Queue-les-Yvelines',
    address: 'Place de la Mairie, 78940 La Queue-les-Yvelines',
    maxCapacity: 30,
    surfaceAreaM2: 145,
    equipment: ['Parquet de bal', 'Espace scénique', 'Système audio amplifié', 'Parking facile'],
    notes: 'Salle principale pour les cours Cardio Latino et animations à La Queue-lez-Yvelines.',
    active: true
  },
  {
    id: 'room-flf-culture',
    name: 'Maison des Associations & de la Culture',
    location: 'Fontenay-le-Fleury',
    address: 'Place Jean Coutrot, 78330 Fontenay-le-Fleury',
    maxCapacity: 25,
    surfaceAreaM2: 95,
    equipment: ['Miroirs mobiles', 'Accès PMR', 'Système son nomade'],
    notes: 'Ateliers spécifiques, stages week-end et réunions du bureau.',
    active: true
  }
];

export const DANCE_CLASSES: DanceClass[] = [];

export const DANCE_EVENTS: DanceEvent[] = [];

export const PHOTO_GALLERY: PhotoItem[] = [];

export const DEFAULT_VIDEOS: VideoItem[] = [];

export const DEFAULT_PRICING_PLANS: PricingPlan[] = [
  {
    id: 'price-cardio-lqy-mardi-20h',
    day: 'Mardi',
    discipline: 'Cardio Latino',
    time: '20h',
    level: 'Tous niveaux',
    location: 'La Queue lez Yvelines',
    room: "Salle Jeanne d'Arc",
    duration: 'Durée : 1h',
    price: 210,
    period: 'par personne',
    notes: 'Cours complet de Cardio Latino, renforcement musculaire et ambiance festive.',
    badge: 'La Queue-lez-Yvelines',
    active: true,
    classId: 'c-cardio-lqy-20h-2026',
    helloAssoUrl: 'https://www.helloasso.com/associations/la-maloka/adhesions/cardio-latino-tous-niveaux-saison-2026-2027-cours-a-20h-la-queue-lez-yvelines'
  },
  {
    id: 'price-cardio-flf-jeudi-20h',
    day: 'Jeudi',
    discipline: 'Cardio Latino',
    time: '20h',
    level: 'Tous niveaux',
    location: 'Fontenay le Fleury',
    room: 'Salle "Le Studio" - Mairie',
    duration: 'Durée : 1h',
    price: 198,
    period: 'par personne',
    notes: 'Session dynamique cardio-danse latino à Fontenay-le-Fleury.',
    badge: 'Fontenay-le-Fleury',
    active: true,
    classId: 'c-cardio-flf-20h-2026',
    helloAssoUrl: 'https://www.helloasso.com/associations/la-maloka/adhesions/cardio-latino-cours-de-20h-tous-niveaux-saison-2026-2027-fontenay-le-fleury'
  },
  {
    id: 'price-cardio-flf-jeudi-21h',
    day: 'Jeudi',
    discipline: 'Cardio Latino',
    time: '21h',
    level: 'Tous niveaux',
    location: 'Fontenay le Fleury',
    room: 'Salle "Le Studio" - Mairie',
    duration: 'Durée : 1h',
    price: 198,
    period: 'par personne',
    notes: 'Deuxième créneau Cardio Latino pour s\'adapter à tous les emplois du temps.',
    badge: 'Fontenay-le-Fleury',
    active: true,
    classId: 'c-cardio-flf-21h-2026',
    helloAssoUrl: 'https://www.helloasso.com/associations/la-maloka/adhesions/cardio-latino-cours-de-21h-tous-niveaux-saison-2026-2027-fontenay-le-fleury'
  },
  {
    id: 'price-salsa-flf-vendredi-20h',
    day: 'Vendredi',
    discipline: 'Salsa Cubaine',
    time: '20h',
    level: 'Débutants',
    location: 'Fontenay le Fleury',
    room: 'Salle "Le Studio" - Mairie',
    duration: 'Durée : 1h',
    price: 198,
    period: 'par personne',
    notes: 'Apprentissage des bases du guidage cubain, pasitos, clave et rueda de casino.',
    badge: 'Idéal Débutants',
    active: true,
    classId: 'c-salsa-flf-20h-2026',
    helloAssoUrl: 'https://www.helloasso.com/associations/la-maloka/adhesions/salsa-cubaine-debutant-saison-2026-2027-cours-a-20h-fontenay-le-fleury'
  },
  {
    id: 'price-salsa-flf-vendredi-21h',
    day: 'Vendredi',
    discipline: 'Salsa Cubaine',
    time: '21h',
    level: 'Intermédiaires & Confirmés',
    location: 'Fontenay le Fleury',
    room: 'Salle "Le Studio" - Mairie',
    duration: 'Durée : 1h',
    price: 198,
    period: 'par personne',
    notes: 'Figures complexes, styling, musicalité, shines et ruedas avec Yasmilka Valdés.',
    badge: 'Perfectionnement',
    active: true,
    classId: 'c-salsa-flf-21h-2026',
    helloAssoUrl: 'https://www.helloasso.com/associations/la-maloka/adhesions/salsa-cubaine-inter-avance-saison-2026-2027-cours-a-21h-fontenay-le-fleury-2'
  }
];

export const DEFAULT_GENERAL_CONDITIONS: GeneralConditionsData = {
  title: "Conditions Générales d'Inscription & Règlement Intérieur",
  lastUpdated: 'Saison 2026 - 2027',
  subtitle: 'Association La Maloka (Loi 1901) - Fontenay-le-Fleury & La Queue-lez-Yvelines',
  sections: [
    {
      id: 'art-1-adhesion',
      title: "Article 1 : Adhésion & Inscription Annuelle",
      content: "L'inscription aux cours réguliers de La Maloka implique l'adhésion formelle à l'association (loi du 1er juillet 1901). La cotisation annuelle donne accès aux cours réguliers hebdomadaires choisis pour l'ensemble de la saison sportive (hors vacances scolaires et jours fériés). Toute inscription est nominative et incessible."
    },
    {
      id: 'art-2-tarifs-reglement',
      title: "Article 2 : Tarifs & Modalités de Paiement",
      content: "Les tarifs sont fixés annuellement par le bureau de l'association : 210 € par personne pour les cours de La Queue-lez-Yvelines et 198 € par personne pour les cours de Fontenay-le-Fleury. Le règlement peut être effectué en ligne via HelloAsso (CB sécurisée), par chèque (possibilité de paiement en 3 fois sans frais à l'inscription), par virement ou en espèces. L'inscription est définitive après validation du paiement."
    },
    {
      id: 'art-3-cours-essai',
      title: "Article 3 : Cours d'Essai Gratuit",
      content: "Un cours d'essai gratuit et sans engagement est proposé aux nouveaux arrivants en début de saison lors de la séance inaugurale de septembre. L'élève dispose d'un délai de 7 jours après son essai pour confirmer et finaliser son inscription."
    },
    {
      id: 'art-4-sante-certificat',
      title: "Article 4 : Aptitude Physique & Questionnaire de Santé",
      content: "L'adhérent atteste être apte à la pratique de la danse et des activités cardio-vasculaires. Un questionnaire de santé (QS-Sport) ou un certificat médical de non-contre-indication à la pratique de la danse sportive de moins de 3 ans doit être renseigné lors de l'inscription."
    },
    {
      id: 'art-5-salles-tenue',
      title: "Article 5 : Respect des Lieux & Chaussures de Danse",
      content: "Afin de protéger les parquets des salles municipales (Salle Jeanne d'Arc, Salle 'Le Studio' Mairie, Gymnases), le port de chaussures propres réservées strictement à l'usage intérieur est obligatoire (chaussures d'extérieur strictement interdites sur la piste de danse). Une tenue confortable et une gourde sont fortement recommandées."
    },
    {
      id: 'art-6-remboursement',
      title: "Article 6 : Rétractation & Remboursement",
      content: "L'engagement est annuel. Aucun remboursement de cotisation ne sera accordé en cours d'année, sauf cas de force majeure médicalement justifié (inaptitude totale et définitive certifiée par un médecin spécialiste empêchant la pratique sportive sur l'ensemble de la saison) ou déménagement professionnel à plus de 50 km, sous réserve de notification écrite au bureau."
    },
    {
      id: 'art-7-droit-image',
      title: "Article 7 : Droit à l'Image & Données Personnelles (RGPD)",
      content: "Des photos ou extraits vidéo peuvent être capturés lors des événements et démonstrations à des fins de promotion associative. Tout membre peut s'y opposer par simple demande écrite à association.lamaloka@gmail.com. Vos données personnelles restent strictement confidentielles."
    },
    {
      id: 'art-8-assurance',
      title: "Article 8 : Assurance Responsabilité Civile",
      content: "L'association a souscrit une police d'assurance responsabilité civile pour ses activités. Chaque adhérent est également encouragé à vérifier la couverture de son assurance responsabilité civile personnelle et garantie individuelle accident."
    }
  ]
};

export const DEFAULT_REGISTRATION_PROCESS: RegistrationProcess = { title: 'Inscription', steps: [], finalNote: '', visible: false };
export const DEFAULT_MEMBERSHIP_TERMS: MembershipTerms = { title: 'Conditions générales d’adhésion', subtitle: '', lastUpdated: '', sections: [], visible: false };

export const DEFAULT_NAVIGATION: NavigationItem[] = [
  { id: 'nav-home', label: 'Accueil', destination: 'accueil', order: 0, active: true },
  { id: 'nav-courses', label: 'Cours', destination: 'cours', order: 1, active: true },
  { id: 'nav-agenda', label: 'Agenda', destination: 'agenda', order: 2, active: true },
  { id: 'nav-gallery', label: 'Photos & Vidéos', destination: 'galerie', order: 3, active: true },
];

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  associationName: 'La Maloka', tagline: '', heroHeadline: 'La Maloka', heroSubheadline: '',
  heroImage: '', associationStory: '', contactEmail: 'association.lamaloka@gmail.com', contactPhone: '',
  locationFontenay: '', locationLaQueue: '', facebookUrl: '', instagramUrl: '', youtubeUrl: '',
  vignettes: [], pricingPlans: [],
  registrationInfo: { seasonTitle: '', bannerText: '', isRegistrationOpen: false, importantDates: [], guidelines: [], documentsRequired: [] },
  moduleToggles: { showRegistrationBanner: false, showPhotoGallery: true, showHealthForm: false, showEventsCalendar: true, allowOnlineRegistrations: false },
};

export const DEFAULT_HOME_PAGE: HomePageContent = {
  eyebrow: '',
  headline: 'La Maloka',
  highlight: '',
  description: DEFAULT_SITE_SETTINGS.heroSubheadline,
  heroImageUrl: DEFAULT_SITE_SETTINGS.heroImage ?? '',
  logoUrl: '',
  overlayTitle: '',
  overlayText: '',
  overlayImageUrl: DEFAULT_SITE_SETTINGS.heroImage ?? '',
  bannerText: DEFAULT_SITE_SETTINGS.registrationInfo.bannerText,
  bannerButtonText: 'Consulter les Dates',
  bannerButtonDestination: 'cours',
  primaryButtonText: 'Planning, tarifs & cours 2026-2027',
  primaryButtonDestination: 'cours',
  secondaryButtonText: 'Dates & Agenda',
  secondaryButtonDestination: 'agenda',
  locationBadgeOne: 'Fontenay-le-Fleury',
  locationBadgeTwo: 'La Queue-les-Yvelines',
  seasonBadge: '',
  sections: [
    { id: 'disciplines', title: 'Choisissez Votre Univers de Danse', subtitle: 'Nos Deux Disciplines', order: 0, visible: true },
  ],
  published: true,
};

export const DEFAULT_FOOTER: FooterContent = {
  description: 'Association de Danse Tropicale dédiée à la Salsa Cubaine & au Cardio Latino.',
  address: `${DEFAULT_SITE_SETTINGS.locationFontenay} · ${DEFAULT_SITE_SETTINGS.locationLaQueue}`,
  email: DEFAULT_SITE_SETTINGS.contactEmail,
  phone: DEFAULT_SITE_SETTINGS.contactPhone,
  facebookUrl: DEFAULT_SITE_SETTINGS.facebookUrl ?? '',
  instagramUrl: DEFAULT_SITE_SETTINGS.instagramUrl ?? '',
  youtubeUrl: DEFAULT_SITE_SETTINGS.youtubeUrl ?? '',
  links: [{ id: 'terms', label: 'Conditions générales d’adhésion', destination: 'conditions', order: 0, visible: true }],
  legalNotice: '',
  copyright: '© 2026 Association La Maloka. Salsa Cubaine & Cardio Latino dans les Yvelines.',
  blocks: [
    { id: 'brand', label: 'Association', order: 0, visible: true },
    { id: 'contact', label: 'Contact', order: 1, visible: true },
    { id: 'locations', label: 'Adresses', order: 2, visible: true },
    { id: 'links', label: 'Liens', order: 3, visible: true },
  ],
  published: true,
};
