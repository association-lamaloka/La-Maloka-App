import { DanceClass, DanceEvent, PhotoItem, VideoItem, SiteSettings, DanceRoom, PricingPlan, GeneralConditionsData } from './types';

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

export const DANCE_CLASSES: DanceClass[] = [
  {
    id: 'c-essai-salsa-2026',
    name: "Cours d'essai Salsa cubaine vendredi 11 septembre 2026 - 20 heures",
    instructor: 'Yasmilka "La Gozadera" Valdés',
    schedule: 'Vendredi 11 Septembre 2026 • 20:00 - 21:00',
    level: 'Débutant',
    description: 'Séance d\'initiation et d\'essai gratuite pour découvrir la Salsa Cubaine, l\'ambiance chaleureuse de La Maloka et valider votre inscription avant le démarrage de la saison.',
    priceMonthly: 0,
    annualPrice: 0,
    image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=600',
    category: 'Salsa Cubaine',
    location: 'Fontenay-le-Fleury',
    active: true,
    season: 'Saison 2026 - 2027',
    campaignType: "Cours d'essai",
    visibility: 'Public',
    subscribersCount: 6,
    collectedAmount: 0,
    daysRemaining: 25,
    trialDate: '2026-09-11',
    isTrialClass: true,
    roomId: 'room-levant-polyvalente',
    roomName: 'Gymnase du Levant - Grande Salle Polyvalente',
    maxSpots: 35,
    spotsRemaining: 29,
    waitlistCount: 0,
    helloAssoUrl: 'https://www.helloasso.com/associations/la-maloka/adhesions/cours-d-essai-salsa-cubaine-vendredi-11-septembre-2026-20-heures'
  },
  {
    id: 'c-cardio-lqy-20h-2026',
    name: 'CARDIO LATINO Tous Niveaux Saison 2026 - 2027 Cours à 20h La Queue lez Yvelines',
    instructor: 'Mariela Santos',
    schedule: 'Mardi 20:00 - 21:00',
    level: 'Tous Niveaux',
    description: 'Cours hebdomadaire complet de Cardio Latino à La Queue-lez-Yvelines. Musiques festives, travail cardio-vasculaire sans sauts traumatisants, renforcement et bonne humeur garantie.',
    priceMonthly: 30,
    annualPrice: 210,
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=600',
    category: 'Cardio Latino',
    location: 'La Queue-les-Yvelines',
    active: true,
    season: 'Saison 2026 - 2027',
    campaignType: 'Cours Annuel',
    visibility: 'Public',
    subscribersCount: 9,
    collectedAmount: 1260,
    daysRemaining: 320,
    roomId: 'room-lqy-fetes',
    roomName: 'Salle Polyvalente & Fêtes de La Queue-lez-Yvelines',
    maxSpots: 30,
    spotsRemaining: 21,
    waitlistCount: 0,
    helloAssoUrl: 'https://www.helloasso.com/associations/la-maloka/adhesions/cardio-latino-tous-niveaux-saison-2026-2027-cours-a-20h-la-queue-lez-yvelines'
  },
  {
    id: 'c-salsa-flf-21h-2026',
    name: 'SALSA CUBAINE Inter/Avancé Saison 2026 - 2027 Cours à 21h Fontenay le Fleury (2)',
    instructor: 'Yasmilka "La Gozadera" Valdés',
    schedule: 'Vendredi 21:00 - 22:00',
    level: 'Intermédiaire',
    description: 'Perfectionnement du style cubain (Casino), jeux de bras, musicalité afro-cubaine, son, timba et figures dynamiques en rueda de casino à Fontenay-le-Fleury.',
    priceMonthly: 35,
    annualPrice: 198,
    image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=600',
    category: 'Salsa Cubaine',
    location: 'Fontenay-le-Fleury',
    active: true,
    season: 'Saison 2026 - 2027',
    campaignType: 'Cours Annuel',
    visibility: 'Public',
    subscribersCount: 9,
    collectedAmount: 792,
    daysRemaining: 318,
    roomId: 'room-levant-danse',
    roomName: 'Gymnase du Levant - Salle de Danse Annexe',
    maxSpots: 28,
    spotsRemaining: 19,
    waitlistCount: 0,
    helloAssoUrl: 'https://www.helloasso.com/associations/la-maloka/adhesions/salsa-cubaine-inter-avance-saison-2026-2027-cours-a-21h-fontenay-le-fleury-2'
  },
  {
    id: 'c-salsa-flf-20h-2026',
    name: 'SALSA CUBAINE Débutant Saison 2026 - 2027 Cours à 20h Fontenay le Fleury',
    instructor: 'Yasmilka "La Gozadera" Valdés',
    schedule: 'Vendredi 20:00 - 21:00',
    level: 'Débutant',
    description: 'Apprenez les pas de base de la Salsa Cubaine, le guidage, l\'écoute rythmique (clave cubaine), les tours fondamentaux et les premières passes de Rueda.',
    priceMonthly: 35,
    annualPrice: 198,
    image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=600',
    category: 'Salsa Cubaine',
    location: 'Fontenay-le-Fleury',
    active: true,
    season: 'Saison 2026 - 2027',
    campaignType: 'Cours Annuel',
    visibility: 'Public',
    subscribersCount: 4,
    collectedAmount: 166,
    daysRemaining: 307,
    roomId: 'room-levant-polyvalente',
    roomName: 'Gymnase du Levant - Grande Salle Polyvalente',
    maxSpots: 30,
    spotsRemaining: 26,
    waitlistCount: 0,
    helloAssoUrl: 'https://www.helloasso.com/associations/la-maloka/adhesions/salsa-cubaine-debutant-saison-2026-2027-cours-a-20h-fontenay-le-fleury'
  },
  {
    id: 'c-cardio-flf-20h-2026',
    name: 'CARDIO LATINO Cours de 20h Tous Niveaux Saison 2026 -2027- Fontenay le Fleury',
    instructor: 'Mariela Santos',
    schedule: 'Jeudi 20:00 - 21:00',
    level: 'Tous Niveaux',
    description: 'Créneau Cardio Latino du jeudi à 20h à Fontenay-le-Fleury. Rythmes endiablés, ambiance positive, dépense énergétique et chorégraphies latines sans partenaire.',
    priceMonthly: 30,
    annualPrice: 198,
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=600',
    category: 'Cardio Latino',
    location: 'Fontenay-le-Fleury',
    active: true,
    season: 'Saison 2026 - 2027',
    campaignType: 'Cours Annuel',
    visibility: 'Public',
    subscribersCount: 26,
    collectedAmount: 3326,
    daysRemaining: 318,
    roomId: 'room-chenevieres-evolution',
    roomName: 'Gymnase des Chenevières - Salle d\'Évolution',
    maxSpots: 30,
    spotsRemaining: 4,
    waitlistCount: 0,
    helloAssoUrl: 'https://www.helloasso.com/associations/la-maloka/adhesions/cardio-latino-cours-de-20h-tous-niveaux-saison-2026-2027-fontenay-le-fleury'
  },
  {
    id: 'c-cardio-flf-21h-2026',
    name: 'CARDIO LATINO Cours de 21h Tous Niveaux Saison 2026 - 2027 - Fontenay le Fleury',
    instructor: 'Mariela Santos',
    schedule: 'Jeudi 21:00 - 22:00',
    level: 'Tous Niveaux',
    description: 'Créneau Cardio Latino du jeudi à 21h à Fontenay-le-Fleury. Séance nocturne dynamique pour décompresser en musique et tonifier le corps.',
    priceMonthly: 30,
    annualPrice: 198,
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=600',
    category: 'Cardio Latino',
    location: 'Fontenay-le-Fleury',
    active: true,
    season: 'Saison 2026 - 2027',
    campaignType: 'Cours Annuel',
    visibility: 'Public',
    subscribersCount: 9,
    collectedAmount: 862,
    daysRemaining: 318,
    roomId: 'room-chenevieres-evolution',
    roomName: 'Gymnase des Chenevières - Salle d\'Évolution',
    maxSpots: 30,
    spotsRemaining: 21,
    waitlistCount: 0,
    helloAssoUrl: 'https://www.helloasso.com/associations/la-maloka/adhesions/cardio-latino-cours-de-21h-tous-niveaux-saison-2026-2027-fontenay-le-fleury'
  }
];

export const DANCE_EVENTS: DanceEvent[] = [
  {
    id: 'e1',
    title: 'Grand Soirée Tropicale & Rueda Géante',
    type: 'Soirée',
    date: '2026-09-19',
    time: '20:30 - 01:00',
    location: 'Salle Polyvalente de Fontenay-le-Fleury',
    price: 10,
    description: 'Grande soirée d\'ouverture de saison avec initiation Salsa Cubaine, rueda géante animée par Yasmilka et animation Cardio Latino pour faire monter l\'ambiance !',
    spotsLeft: 60,
    totalSpots: 120,
    image: 'https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&q=80&w=600',
    active: true
  },
  {
    id: 'e2',
    title: 'Stage Intensif : Rueda de Casino & Style Cubain',
    type: 'Stage',
    date: '2026-09-26',
    time: '14:00 - 17:00',
    location: 'Studio de Danse Fontenay-le-Fleury',
    instructor: 'Yasmilka Valdés',
    price: 25,
    description: '3 heures d\'immersion dans l\'énergie de La Havane : pas de style, guidage fluide, connexions et passes de rueda inédites.',
    spotsLeft: 18,
    totalSpots: 30,
    image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=600',
    active: true
  },
  {
    id: 'e3',
    title: 'Masterclass Cardio Latino Plein Air',
    type: 'Atelier',
    date: '2026-09-12',
    time: '10:30 - 12:00',
    location: 'Parc des Fêtes de La Queue-les-Yvelines',
    instructor: 'Mariela Santos',
    price: 10,
    description: 'Une séance festive en plein air pour démarrer le week-end avec un plein d\'énergie solaire et de sourires.',
    spotsLeft: 35,
    totalSpots: 50,
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=600',
    active: true
  }
];

export const PHOTO_GALLERY: PhotoItem[] = [
  {
    id: 'g1',
    title: 'Rueda de Casino en fête',
    category: 'Salsa Cubaine',
    url: 'https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&q=80&w=800',
    description: 'Énergie partagée et sourires lors de nos cours collectifs en rueda à Fontenay.',
    date: '2026-06-15',
    likes: 42
  },
  {
    id: 'g2',
    title: 'Séance Cardio Latino dynamique',
    category: 'Cardio Latino',
    url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=800',
    description: 'Rythme soutenu, renforcement musculaire et joie de bouger au son des percussions caribéennes.',
    date: '2026-05-28',
    likes: 38
  },
  {
    id: 'g3',
    title: 'Technique et guidage en Salsa Cubaine',
    category: 'Salsa Cubaine',
    url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=800',
    description: 'Transmission de la musicalité cubaine, posture de couple et fluidité des passes.',
    date: '2026-04-12',
    likes: 29
  },
  {
    id: 'g4',
    title: 'Soirée dansante tropicale La Maloka',
    category: 'Soirées & Fêtes',
    url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800',
    description: 'Moment convivial et rassembleur entre tous les danseurs de l\'association.',
    date: '2026-03-20',
    likes: 54
  },
  {
    id: 'g5',
    title: 'Stage Rueda & Styling Caraïbes',
    category: 'Stages & Ateliers',
    url: 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?auto=format&fit=crop&q=80&w=800',
    description: 'Perfectionnement du jeu de jambes et du mouvement corporel en salsa cubaine.',
    date: '2026-02-18',
    likes: 31
  },
  {
    id: 'g6',
    title: 'Cardio Latino en plein air & été',
    category: 'Cardio Latino',
    url: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&q=80&w=800',
    description: 'Séance estivale sous le soleil, chorégraphies accessibles et ambiance festive.',
    date: '2026-06-30',
    likes: 47
  }
];

export const DEFAULT_VIDEOS: VideoItem[] = [
  {
    id: 'v1',
    title: 'Démonstration Rueda de Casino & Passes de Salsa Cubaine',
    category: 'Salsa Cubaine',
    youtubeUrl: 'https://www.youtube.com/watch?v=k2qgadSvNyU',
    youtubeId: 'k2qgadSvNyU',
    description: 'Découvrez la dynamique d\'une Rueda de Casino : énergie du groupe, guidage fluide et changements rythmés de partenaires.',
    duration: '04:15',
    thumbnail: 'https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&q=80&w=800',
    views: '2.4k vues',
    date: '2026-06-10',
    featured: true,
    likes: 68
  },
  {
    id: 'v2',
    title: 'Entraînement Cardio Latino : Rythmes & Brûle-Calories',
    category: 'Cardio Latino',
    youtubeUrl: 'https://www.youtube.com/watch?v=rqu8_7vJ2yQ',
    youtubeId: 'rqu8_7vJ2yQ',
    description: 'Un extrait électrisant d\'un cours de Cardio Latino alliant fitness, pas de mambo, reggaeton et renforcement.',
    duration: '05:30',
    thumbnail: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=800',
    views: '3.1k vues',
    date: '2026-05-18',
    likes: 52
  },
  {
    id: 'v3',
    title: 'Atelier Musicalité Salsa Cubaine : Clave, Son & Rythmes',
    category: 'Stages & Ateliers',
    youtubeUrl: 'https://www.youtube.com/watch?v=yY6mPzVdF7Y',
    youtubeId: 'yY6mPzVdF7Y',
    description: 'Conseils pratiques pour écouter la clave cubaine, synchroniser le pas de base et danser dans le temps musical.',
    duration: '03:45',
    thumbnail: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=800',
    views: '1.2k vues',
    date: '2026-04-05',
    likes: 41
  },
  {
    id: 'v4',
    title: 'Ambiance de la Soirée Tropicale & Show Adhérents',
    category: 'Soirées & Fêtes',
    youtubeUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    youtubeId: 'kJQP7kiw5Fk',
    description: 'Retour vidéo sur la grande soirée associative de fin de trimestre : démonstrations, rueda géante et convivialité.',
    duration: '06:20',
    thumbnail: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800',
    views: '4.8k vues',
    date: '2026-03-25',
    likes: 89
  }
];

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

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  associationName: 'La Maloka',
  tagline: 'Association de Danse Tropicale • Salsa Cubaine & Cardio Latino',
  heroHeadline: 'La Danse et le Rythme se Vivent à La Maloka',
  heroSubheadline: 'Bienvenue au cœur des rythmes ensoleillés des Caraïbes. Venez partager la joie de danser la Salsa Cubaine en couple et en Rueda, ou venez vibrer et vous dépenser dans nos cours de Cardio Latino.',
  heroImage: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=1000',
  associationStory: 'Fondée par des passionnés de culture caribéenne, l\'Association La Maloka a pour mission de faire rayonner la danse, la musique et le bien-être à Fontenay-le-Fleury et La Queue-les-Yvelines. Notre pédagogie est axée sur la convivialité, le plaisir du mouvement et l\'accessibilité à tous.',
  contactEmail: 'association.lamaloka@gmail.com',
  contactPhone: '06 12 34 56 78',
  contactWhatsApp: '06 12 34 56 78',
  contactPerson: 'Yasmilka Valdés & Bureau de l\'Association',
  contactHours: 'Du Lundi au Vendredi : 10h00 - 19h30 & Samedi : 10h00 - 13h00',
  locationFontenay: 'Gymnase du Levant & Salle Polyvalente, Avenue Jean Lurçat, 78330 Fontenay-le-Fleury',
  locationLaQueue: 'Salle des Fêtes & Espace Danse, 78940 La Queue-les-Yvelines',
  postalAddress: 'Association La Maloka, Mairie de Fontenay-le-Fleury, Place de la Mairie, 78330 Fontenay-le-Fleury',
  facebookUrl: 'https://facebook.com/lamaloka78',
  instagramUrl: 'https://instagram.com/association_la_maloka',
  youtubeUrl: 'https://youtube.com/@lamalokadanse',
  pricingPlans: DEFAULT_PRICING_PLANS,
  generalConditions: DEFAULT_GENERAL_CONDITIONS,
  vignettes: [
    {
      id: 'salsa-cubaine',
      title: 'Salsa Cubaine & Rueda de Casino',
      subtitle: 'Danse de couple, rythme afro-cubain & esprit collectif',
      badge: 'Danse de Couple & Cercle',
      description: 'Plongez dans l\'authenticité cubaine ! Apprenez le pas de base, les tours fluides, le guidage naturel et participez à la célèbre Rueda de Casino où l\'on échange les partenaires dans une ambiance survoltée.',
      image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=800',
      accentColor: 'orange',
      scheduleSummary: 'Lundi & Mercredi soirs (Fontenay-le-Fleury)',
      locationSummary: 'Fontenay-le-Fleury',
      keyPoints: [
        'Accessible débutants et intermédiaires',
        'Apprentissage de la Rueda de Casino (cercle festif)',
        'Technique de guidage, musicalité et style',
        'Partenaire non obligatoire pour l\'inscription'
      ],
      active: true
    },
    {
      id: 'cardio-latino',
      title: 'Cardio Latino',
      subtitle: 'Fitness chorégraphié, vitalité & musiques du soleil',
      badge: 'Danse Solo & Fitness Tropical',
      description: 'Dépensez-vous avec le sourire ! Un cours sans partenaire alliant mouvements de fitness et pas de danses latines (merengue, cumbia, salsa, reggaeton). Idéal pour tonifier le corps, développer le souffle et évacuer le stress.',
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=800',
      accentColor: 'emerald',
      scheduleSummary: 'Mardi (Fontenay) & Vendredi (La Queue-les-Yvelines)',
      locationSummary: 'Fontenay-le-Fleury & La Queue-les-Yvelines',
      keyPoints: [
        'Aucun prérequis en danse nécessaire',
        'Brûle des calories et tonifie la silhouette',
        'Rythmes latins ultra-dynamiques et entraînants',
        'Atmosphère bienveillante et festive'
      ],
      active: true
    }
  ],
  registrationInfo: {
    seasonTitle: 'Saison 2026 - 2027 • Informations & Plannings',
    bannerText: '✨ Planning et tarifs officiels 2026 - 2027 ! Retrouvez-nous aux Forums des Associations de Fontenay-le-Fleury et La Queue-les-Yvelines.',
    isRegistrationOpen: false,
    importantDates: [
      {
        date: 'Samedi 5 Septembre 2026',
        label: 'Forum des Associations de Fontenay-le-Fleury',
        location: 'Gymnase du Levant (10h - 18h)'
      },
      {
        date: 'Dimanche 6 Septembre 2026',
        label: 'Forum des Associations de La Queue-les-Yvelines',
        location: 'Salle des Fêtes (10h - 17h)'
      },
      {
        date: 'Lundi 14 Septembre 2026',
        label: 'Reprise officielle de tous les cours hebdomadaires',
        location: 'Fontenay-le-Fleury & La Queue-les-Yvelines'
      }
    ],
    guidelines: [
      'Site en mode informatif : consultez les plannings, salles et tarifs officiels.',
      'Possibilité d\'un cours d\'essai gratuit au début du mois de septembre.',
      'Contactez le bureau ou venez nous rencontrer lors des forums associatifs.'
    ],
    documentsRequired: [
      'Fiche de renseignements',
      'Certificat médical ou attestation QS-Sport'
    ]
  },
  urgentBanner: {
    enabled: false,
    type: 'urgent',
    badge: 'Annonce Urgente',
    title: 'Rentrée 2026-2027 & Forums',
    message: 'Découvrez la Salsa Cubaine et le Cardio Latino à Fontenay et La Queue-les-Yvelines !',
    linkText: 'Voir les cours',
    linkAction: 'cours',
    isDismissible: true
  },
  moduleToggles: {
    showRegistrationBanner: true,
    showPhotoGallery: true,
    showHealthForm: false,
    showEventsCalendar: true,
    allowOnlineRegistrations: false
  }
};
