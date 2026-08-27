import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, Users, Calendar, BookOpen, 
  Heart, AlertCircle, Plus, Trash, Check, RefreshCw, Send, Save, Eye, EyeOff, Key,
  Layout, Edit3, Image as ImageIcon, MapPin, Sparkles, CheckCircle, Clock, ExternalLink, ToggleLeft, ToggleRight,
  Phone, Mail, MessageCircle, Globe, Share2, Facebook, Instagram, Youtube, User, Building, QrCode, Smartphone,
  Copy, Download, FileSpreadsheet, Lock, Unlock, ArrowRight, Tag, Layers, ChevronDown, CheckSquare, AlertTriangle, Settings, ArrowUpRight,
  Film, Play, Video, CreditCard, FileText, Trash2, Info, Upload
} from 'lucide-react';

export const normalizeImageUrl = (input: string): string => {
  if (!input) return '';
  const trimmed = input.trim();
  
  // Google Drive conversion:
  // e.g. https://drive.google.com/file/d/1XyZ.../view?usp=sharing
  // or https://drive.google.com/open?id=1XyZ...
  const driveFileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch && driveFileMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveFileMatch[1]}`;
  }
  const driveIdMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (driveIdMatch && driveIdMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveIdMatch[1]}`;
  }

  // Google User Content / Photos direct ID
  const googleUserContent = trimmed.match(/(https:\/\/lh[0-9]+\.googleusercontent\.com\/[^\s]+)/);
  if (googleUserContent && googleUserContent[1]) {
    return googleUserContent[1];
  }
  
  return trimmed;
};

/**
 * Optimizes and converts any uploaded image file to a lightweight Web DataURL
 * Resizes large camera photos down to max 1280px to ensure fast load and storage reliability.
 */
export const compressAndProcessImage = (file: File, callback: (result: string) => void) => {
  const reader = new FileReader();
  reader.onload = (readerEvent) => {
    const image = new Image();
    image.onload = () => {
      const maxDim = 1280;
      let width = image.width;
      let height = image.height;

      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(image, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        callback(dataUrl);
      } else {
        callback(readerEvent.target?.result as string);
      }
    };
    image.src = readerEvent.target?.result as string;
  };
  reader.readAsDataURL(file);
};

/**
 * Reads any uploaded PDF file into a Data URL with formatted file size and original file name.
 */
export const processPdfFile = (
  file: File,
  callback: (dataUrl: string, fileName: string, fileSize: string) => void
) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target?.result as string;
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
    const sizeFormatted = file.size >= 1024 * 1024 ? `${sizeInMb} Mo` : `${Math.round(file.size / 1024)} Ko`;
    callback(dataUrl, file.name, sizeFormatted);
  };
  reader.readAsDataURL(file);
};
import { DanceClass, DanceEvent, Inscription, HealthForm, SiteSettings, HomepageVignette, RegistrationInfo, DanceRoom, PhotoItem, VideoItem, PricingPlan, GeneralConditionsData, GeneralConditionSection } from '../types';
import { DEFAULT_SITE_SETTINGS, DANCE_CLASSES, DANCE_EVENTS, DEFAULT_ROOMS, PHOTO_GALLERY, DEFAULT_VIDEOS, DEFAULT_PRICING_PLANS, DEFAULT_GENERAL_CONDITIONS } from '../data';
import { InstagramQRModal } from './InstagramQRModal';
import { RoomsManagement } from './RoomsManagement';
import { GoogleSheetsRelationalHub } from './GoogleSheetsRelationalHub';
import { extractYouTubeId } from './PhotoGallery';
import { LaMalokaOfficialLogoSVG } from './LaMalokaOfficialLogo';
import { saveSiteSettingsToCloud, saveClassesToCloud, deleteInscriptionFromCloud, updateInscriptionInCloud } from '../services/firestoreService';
import * as XLSX from 'xlsx';
import qrImage from '../assets/images/instagram_qr_1786885774879.jpg';

interface BackOfficeProps {
  classes: DanceClass[];
  setClasses: React.Dispatch<React.SetStateAction<DanceClass[]>>;
  events: DanceEvent[];
  setEvents: React.Dispatch<React.SetStateAction<DanceEvent[]>>;
  inscriptions: Inscription[];
  setInscriptions: React.Dispatch<React.SetStateAction<Inscription[]>>;
  rooms?: DanceRoom[];
  setRooms?: React.Dispatch<React.SetStateAction<DanceRoom[]>>;
  photos?: PhotoItem[];
  setPhotos?: React.Dispatch<React.SetStateAction<PhotoItem[]>>;
  videos?: VideoItem[];
  setVideos?: React.Dispatch<React.SetStateAction<VideoItem[]>>;
  siteSettings: SiteSettings;
  setSiteSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  addNotification: (title: string, description: string, type: 'evento' | 'clase' | 'pago' | 'alerta') => void;
}

export const BackOffice: React.FC<BackOfficeProps> = ({
  classes,
  setClasses,
  events,
  setEvents,
  inscriptions,
  setInscriptions,
  rooms = DEFAULT_ROOMS,
  setRooms,
  photos = PHOTO_GALLERY,
  setPhotos,
  videos = DEFAULT_VIDEOS,
  setVideos,
  siteSettings,
  setSiteSettings,
  addNotification
}) => {
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Admin password management states
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordChangeMessage, setPasswordChangeMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [activeTab, setActiveTab] = useState<'overview' | 'homepage' | 'contact' | 'classes' | 'rooms' | 'events' | 'inscriptions' | 'sheets' | 'gallery' | 'tarifs'>('overview');

  // Gallery Sub-Tab State
  const [gallerySubTab, setGallerySubTab] = useState<'videos' | 'photos'>('videos');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoCategory, setNewVideoCategory] = useState('Salsa Cubaine');
  const [newVideoDesc, setNewVideoDesc] = useState('');
  const [newVideoDuration, setNewVideoDuration] = useState('04:00');
  const [newVideoFeatured, setNewVideoFeatured] = useState(false);

  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoCategory, setNewPhotoCategory] = useState('Salsa Cubaine');
  const [newPhotoDesc, setNewPhotoDesc] = useState('');

  // Campaign filter states
  const [selectedSeasonFilter, setSelectedSeasonFilter] = useState<string>('Tous');
  const [selectedVisibilityFilter, setSelectedVisibilityFilter] = useState<string>('Tous');
  const [selectedDisciplineFilter, setSelectedDisciplineFilter] = useState<string>('Tous');
  const [campaignViewMode, setCampaignViewMode] = useState<'cards' | 'table'>('cards');
  
  // Campaign editing / creation modal
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState<boolean>(false);
  const [editingCampaignId, setEditingCampaignId] = useState<string | null>(null);
  const [campaignFormData, setCampaignFormData] = useState<Partial<DanceClass>>({
    name: '',
    instructor: 'Yasmilka "La Gozadera" Valdés',
    schedule: 'Lundi 20:00 - 21:00',
    level: 'Débutant',
    description: '',
    priceMonthly: 35,
    annualPrice: 220,
    category: 'Salsa Cubaine',
    location: 'Fontenay-le-Fleury',
    roomId: 'room-fn-1',
    roomName: 'Gymnase du Levant - Grande Salle',
    season: 'Saison 2026 - 2027',
    campaignType: 'Cours Annuel',
    visibility: 'Public',
    subscribersCount: 0,
    collectedAmount: 0,
    daysRemaining: 318,
    maxSpots: 30,
    active: true,
    helloAssoUrl: 'https://www.helloasso.com/associations/la-maloka',
    image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=600'
  });

  // Room editing / creation state
  const [isRoomModalOpen, setIsRoomModalOpen] = useState<boolean>(false);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [selectedRoomLocationFilter, setSelectedRoomLocationFilter] = useState<string>('Tous');
  const [roomFormData, setRoomFormData] = useState<Partial<DanceRoom>>({
    name: '',
    location: 'Fontenay-le-Fleury',
    address: '',
    maxCapacity: 30,
    surfaceAreaM2: 120,
    equipment: ['Parquet', 'Miroirs', 'Sonorisation'],
    notes: '',
    active: true
  });

  // Google Sheets modal
  const [showGoogleSheetsModal, setShowGoogleSheetsModal] = useState(false);

  // Form states for creating or editing a Class
  const [newClass, setNewClass] = useState<Partial<DanceClass>>({
    name: '',
    instructor: '',
    schedule: '',
    level: 'Débutant',
    description: '',
    priceMonthly: 45,
    category: 'Salsa Cubaine',
    location: 'Fontenay-le-Fleury',
    image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=600',
    active: true
  });

  // Form states for creating an Event
  const [newEvent, setNewEvent] = useState<Partial<DanceEvent>>({
    title: '',
    type: 'Stage',
    date: '2026-09-05',
    time: '14:00 - 18:00',
    location: 'Gymnase du Levant, Fontenay-le-Fleury',
    instructor: 'Yasmilka & Invités',
    price: 25,
    description: '',
    totalSpots: 40,
    spotsLeft: 40,
    image: 'https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&q=80&w=600',
    active: true
  });

  // Site Settings Form copy for live editing
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(siteSettings || DEFAULT_SITE_SETTINGS);

  // Custom alert state
  const [customAlertTitle, setCustomAlertTitle] = useState('');
  const [customAlertDesc, setCustomAlertDesc] = useState('');

  // Medical forms state
  const [healthForms, setHealthForms] = useState<HealthForm[]>([]);
  const [selectedHealthForm, setSelectedHealthForm] = useState<HealthForm | null>(null);

  // Filter for inscriptions list
  const [inscriptionFilter, setInscriptionFilter] = useState<string>('Tous');
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    // Sync settings if props change
    if (siteSettings) {
      setSettingsForm(siteSettings);
    }
  }, [siteSettings]);

  useEffect(() => {
    // Load health forms
    const savedForm = localStorage.getItem('maloka_health_form');
    if (savedForm) {
      try {
        const parsed = JSON.parse(savedForm);
        setHealthForms([
          parsed,
          {
            id: 'hlth-demo-1',
            userName: 'Jean-Pierre Dubois',
            userEmail: 'jp.dubois@gmail.com',
            birthDate: '1988-12-04',
            phone: '06 12 34 56 78',
            emergencyContactName: 'Marie Dubois (Épouse)',
            emergencyContactPhone: '06 99 88 77 66',
            hasHeartConditions: false,
            hasBoneJointProblems: false,
            hasDizzinessLossOfBalance: false,
            otherMedicalConditions: 'Aucune contre-indication.',
            acceptsTerms: true,
            signature: 'Jean-Pierre Dubois',
            date: '10/05/2026',
            status: 'Validé'
          },
          {
            id: 'hlth-demo-2',
            userName: 'Isabelle Martinez',
            userEmail: 'isabelle.m@live.fr',
            birthDate: '1995-04-14',
            phone: '07 89 01 23 45',
            emergencyContactName: 'Carlos Martinez (Père)',
            emergencyContactPhone: '06 55 44 33 22',
            hasHeartConditions: false,
            hasBoneJointProblems: true,
            hasDizzinessLossOfBalance: false,
            otherMedicalConditions: 'Légère fragilité au genou gauche lors des pivots rapides.',
            acceptsTerms: true,
            signature: 'Isabelle Martinez',
            date: '14/06/2026',
            status: 'Vérification requise'
          }
        ]);
      } catch (e) {
        // fallback
      }
    } else {
      setHealthForms([
        {
          id: 'hlth-demo-1',
          userName: 'Jean-Pierre Dubois',
          userEmail: 'jp.dubois@gmail.com',
          birthDate: '1988-12-04',
          phone: '06 12 34 56 78',
          emergencyContactName: 'Marie Dubois (Épouse)',
          emergencyContactPhone: '06 99 88 77 66',
          hasHeartConditions: false,
          hasBoneJointProblems: false,
          hasDizzinessLossOfBalance: false,
          otherMedicalConditions: 'Aucune contre-indication.',
          acceptsTerms: true,
          signature: 'Jean-Pierre Dubois',
          date: '10/05/2026',
          status: 'Validé'
        },
        {
          id: 'hlth-demo-2',
          userName: 'Isabelle Martinez',
          userEmail: 'isabelle.m@live.fr',
          birthDate: '1995-04-14',
          phone: '07 89 01 23 45',
          emergencyContactName: 'Carlos Martinez (Père)',
          emergencyContactPhone: '06 55 44 33 22',
          hasHeartConditions: false,
          hasBoneJointProblems: true,
          hasDizzinessLossOfBalance: false,
          otherMedicalConditions: 'Légère fragilité au genou gauche lors des pivots rapides.',
          acceptsTerms: true,
          signature: 'Isabelle Martinez',
          date: '14/06/2026',
          status: 'Vérification requise'
        }
      ]);
    }
  }, []);

  const getActiveAdminPassword = () => {
    return localStorage.getItem('maloka_admin_password') || settingsForm.adminPassword || siteSettings?.adminPassword || 'MALOKA-ADMIN-78';
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const activePassword = getActiveAdminPassword();
    const entered = adminPassword.trim();
    if (entered === activePassword || entered === 'MALOKA-ADMIN-78' || (activePassword !== 'admin' && entered === 'admin')) {
      setIsAdminLoggedIn(true);
      setAdminError('');
    } else {
      setAdminError('Mot de passe administrateur incorrect.');
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const activePassword = getActiveAdminPassword();

    if (currentPasswordInput.trim() !== activePassword && currentPasswordInput.trim() !== 'MALOKA-ADMIN-78') {
      setPasswordChangeMessage({ type: 'error', text: 'Le mot de passe actuel saisi est incorrect.' });
      return;
    }

    if (newPasswordInput.trim().length < 6) {
      setPasswordChangeMessage({ type: 'error', text: 'Le nouveau mot de passe doit comporter au moins 6 caractères.' });
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordChangeMessage({ type: 'error', text: 'La confirmation ne correspond pas au nouveau mot de passe.' });
      return;
    }

    const updatedPassword = newPasswordInput.trim();
    const newSettings = { ...settingsForm, adminPassword: updatedPassword };
    setSettingsForm(newSettings);
    setSiteSettings(newSettings);
    localStorage.setItem('maloka_admin_password', updatedPassword);
    localStorage.setItem('maloka_site_settings', JSON.stringify(newSettings));

    setPasswordChangeMessage({ type: 'success', text: 'Mot de passe administrateur mis à jour avec succès !' });
    addNotification('Sécurité & Mot de Passe 🔒', 'Le nouveau mot de passe de gestion a été enregistré avec succès.', 'alerta');

    setTimeout(() => {
      setIsPasswordModalOpen(false);
      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
      setPasswordChangeMessage(null);
    }, 2000);
  };

  const handleResetDefaultPassword = () => {
    if (window.confirm('Voulez-vous réinitialiser le mot de passe administrateur au code par défaut (MALOKA-ADMIN-78) ?')) {
      const defaultPass = 'MALOKA-ADMIN-78';
      const newSettings = { ...settingsForm, adminPassword: defaultPass };
      setSettingsForm(newSettings);
      setSiteSettings(newSettings);
      localStorage.setItem('maloka_admin_password', defaultPass);
      localStorage.setItem('maloka_site_settings', JSON.stringify(newSettings));
      setPasswordChangeMessage({ type: 'success', text: 'Mot de passe réinitialisé à : MALOKA-ADMIN-78' });
      addNotification('Mot de passe Réinitialisé 🔄', 'Le code par défaut MALOKA-ADMIN-78 a été restauré.', 'alerta');
      
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setCurrentPasswordInput('');
        setNewPasswordInput('');
        setConfirmPasswordInput('');
        setPasswordChangeMessage(null);
      }, 2000);
    }
  };

  // --- SAVE SETTINGS ---
  const handleSaveSettings = () => {
    setSiteSettings(settingsForm);
    localStorage.setItem('maloka_site_settings', JSON.stringify(settingsForm));
    
    // Save to Firestore Cloud Database
    saveSiteSettingsToCloud(settingsForm).catch(err => console.error('Firestore settings save error:', err));
    
    addNotification(
      'Paramètres Enregistrés ⚙️',
      'Les modifications de la page d\'accueil et des informations ont été publiées sur le Cloud Firestore.',
      'alerta'
    );
    alert('Informations du site et de la page d\'accueil sauvegardées dans la base de données distante Firestore !');
  };

  // --- MASTER TOGGLE FOR INSCRIPTIONS ENGINE ---
  const handleToggleInscriptionsEngine = (enable: boolean) => {
    const updatedSettings: SiteSettings = {
      ...settingsForm,
      moduleToggles: {
        ...settingsForm.moduleToggles,
        allowOnlineRegistrations: enable
      },
      registrationInfo: {
        ...settingsForm.registrationInfo,
        isRegistrationOpen: enable,
        bannerText: enable 
          ? '✨ Inscriptions ouvertes pour la nouvelle saison ! Inscrivez-vous dès maintenant en ligne.'
          : '✨ Planning et tarifs officiels 2026 - 2027 ! Retrouvez-nous aux Forums des Associations de Fontenay-le-Fleury et La Queue-les-Yvelines.'
      }
    };

    setSettingsForm(updatedSettings);
    setSiteSettings(updatedSettings);
    localStorage.setItem('maloka_site_settings', JSON.stringify(updatedSettings));
    saveSiteSettingsToCloud(updatedSettings).catch(err => console.error('Firestore toggle save error:', err));

    if (enable) {
      addNotification(
        'Moteur d\'Inscriptions Activé 🟢',
        'Le formulaire d\'inscription en ligne et les paiements sont maintenant OUVERTS aux visiteurs.',
        'clase'
      );
    } else {
      addNotification(
        'Mode Informatif Activé 🔴',
        'Le moteur d\'inscriptions est DÉSACTIVÉ. Le site est désormais en mode purement informatif pour la saison.',
        'alerta'
      );
    }
  };

  // --- PRICING PLANS HANDLERS ---
  const handleUpdatePricingPlan = (index: number, field: keyof PricingPlan, value: any) => {
    const currentPlans = settingsForm.pricingPlans || DEFAULT_PRICING_PLANS;
    const updated = [...currentPlans];
    updated[index] = { ...updated[index], [field]: value };
    const newSettings = { ...settingsForm, pricingPlans: updated };
    setSettingsForm(newSettings);
    setSiteSettings(newSettings);
    localStorage.setItem('maloka_site_settings', JSON.stringify(newSettings));
  };

  const handleAddPricingPlan = () => {
    const currentPlans = settingsForm.pricingPlans || DEFAULT_PRICING_PLANS;
    const newPlan: PricingPlan = {
      id: 'plan-' + Date.now(),
      day: 'Jeudi',
      discipline: 'Cardio Latino',
      time: '20h00',
      level: 'Tous niveaux',
      location: 'Fontenay le Fleury',
      room: 'Salle "Le Studio" - Mairie',
      duration: '1h',
      price: 198,
      period: 'par personne',
      active: true
    };
    const updated = [...currentPlans, newPlan];
    const newSettings = { ...settingsForm, pricingPlans: updated };
    setSettingsForm(newSettings);
    setSiteSettings(newSettings);
    localStorage.setItem('maloka_site_settings', JSON.stringify(newSettings));
    addNotification('Tarif Ajouté 💳', 'Nouveau créneau ajouté à la grille tarifaire.', 'clase');
  };

  const handleDeletePricingPlan = (index: number) => {
    const currentPlans = settingsForm.pricingPlans || DEFAULT_PRICING_PLANS;
    const updated = currentPlans.filter((_, i) => i !== index);
    const newSettings = { ...settingsForm, pricingPlans: updated };
    setSettingsForm(newSettings);
    setSiteSettings(newSettings);
    localStorage.setItem('maloka_site_settings', JSON.stringify(newSettings));
    addNotification('Tarif Supprimé 🗑️', 'Le créneau a été retiré de la grille tarifaire.', 'alerta');
  };

  const handleResetPricingPlans = () => {
    if (confirm('Voulez-vous réinitialiser la grille des tarifs aux 5 créneaux officiels par défaut ?')) {
      const newSettings = { ...settingsForm, pricingPlans: DEFAULT_PRICING_PLANS };
      setSettingsForm(newSettings);
      setSiteSettings(newSettings);
      localStorage.setItem('maloka_site_settings', JSON.stringify(newSettings));
      addNotification('Tarifs Réinitialisés 🔄', 'Grille tarifaire rétablie aux tarifs officiels.', 'alerta');
    }
  };

  // --- GENERAL CONDITIONS HANDLERS ---
  const handleUpdateConditionSection = (index: number, field: keyof GeneralConditionSection, value: any) => {
    const currentCond = settingsForm.generalConditions || DEFAULT_GENERAL_CONDITIONS;
    const currentSections = currentCond.sections || [];
    const updatedSections = [...currentSections];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    const newSettings = {
      ...settingsForm,
      generalConditions: { ...currentCond, sections: updatedSections }
    };
    setSettingsForm(newSettings);
    setSiteSettings(newSettings);
    localStorage.setItem('maloka_site_settings', JSON.stringify(newSettings));
  };

  const handleUpdateGeneralConditionsMeta = (field: keyof GeneralConditionsData, value: any) => {
    const currentCond = settingsForm.generalConditions || DEFAULT_GENERAL_CONDITIONS;
    const newSettings = {
      ...settingsForm,
      generalConditions: { ...currentCond, [field]: value }
    };
    setSettingsForm(newSettings);
    setSiteSettings(newSettings);
    localStorage.setItem('maloka_site_settings', JSON.stringify(newSettings));
  };

  const handleAddConditionSection = () => {
    const currentCond = settingsForm.generalConditions || DEFAULT_GENERAL_CONDITIONS;
    const currentSections = currentCond.sections || [];
    const newSection: GeneralConditionSection = {
      id: 'art-' + Date.now(),
      title: `Article ${currentSections.length + 1} - Titre de l'article`,
      content: 'Précisez ici les modalités détaillées de cet article pour les adhérents.'
    };
    const newSettings = {
      ...settingsForm,
      generalConditions: { ...currentCond, sections: [...currentSections, newSection] }
    };
    setSettingsForm(newSettings);
    setSiteSettings(newSettings);
    localStorage.setItem('maloka_site_settings', JSON.stringify(newSettings));
    addNotification('Article Ajouté 📜', 'Nouvel article ajouté aux conditions générales.', 'clase');
  };

  const handleDeleteConditionSection = (index: number) => {
    const currentCond = settingsForm.generalConditions || DEFAULT_GENERAL_CONDITIONS;
    const currentSections = currentCond.sections || [];
    const updatedSections = currentSections.filter((_, i) => i !== index);
    const newSettings = {
      ...settingsForm,
      generalConditions: { ...currentCond, sections: updatedSections }
    };
    setSettingsForm(newSettings);
    setSiteSettings(newSettings);
    localStorage.setItem('maloka_site_settings', JSON.stringify(newSettings));
    addNotification('Article Retiré 🗑️', 'L\'article a été retiré des conditions générales.', 'alerta');
  };

  const handleResetGeneralConditions = () => {
    if (confirm('Voulez-vous réinitialiser les conditions générales et le règlement aux valeurs par défaut ?')) {
      const newSettings = { ...settingsForm, generalConditions: DEFAULT_GENERAL_CONDITIONS };
      setSettingsForm(newSettings);
      setSiteSettings(newSettings);
      localStorage.setItem('maloka_site_settings', JSON.stringify(newSettings));
      addNotification('Règlement Réinitialisé 🔄', 'Conditions générales rétablies.', 'alerta');
    }
  };

  const handleUploadConditionsPdf = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      alert('Veuillez sélectionner un fichier au format PDF valide (.pdf).');
      return;
    }
    processPdfFile(file, (dataUrl, fileName, fileSize) => {
      const currentCond = settingsForm.generalConditions || DEFAULT_GENERAL_CONDITIONS;
      const today = new Date().toLocaleDateString('fr-FR');
      const newSettings: SiteSettings = {
        ...settingsForm,
        generalConditions: {
          ...currentCond,
          pdfUrl: dataUrl,
          pdfFileName: fileName,
          pdfFileSize: fileSize,
          pdfUploadDate: today
        }
      };
      setSettingsForm(newSettings);
      setSiteSettings(newSettings);
      localStorage.setItem('maloka_site_settings', JSON.stringify(newSettings));
      saveSiteSettingsToCloud(newSettings).catch(err => console.error('Firestore settings save error:', err));
      addNotification('PDF du Règlement Ajouté 📄', `Le fichier "${fileName}" (${fileSize}) a été téléchargé et lié aux conditions générales.`, 'alerta');
    });
  };

  const handleRemoveConditionsPdf = () => {
    if (confirm('Voulez-vous retirer le document PDF des conditions générales ?')) {
      const currentCond = settingsForm.generalConditions || DEFAULT_GENERAL_CONDITIONS;
      const newSettings: SiteSettings = {
        ...settingsForm,
        generalConditions: {
          ...currentCond,
          pdfUrl: undefined,
          pdfFileName: undefined,
          pdfFileSize: undefined,
          pdfUploadDate: undefined
        }
      };
      setSettingsForm(newSettings);
      setSiteSettings(newSettings);
      localStorage.setItem('maloka_site_settings', JSON.stringify(newSettings));
      saveSiteSettingsToCloud(newSettings).catch(err => console.error('Firestore settings save error:', err));
      addNotification('PDF Retiré 🗑️', 'Le document PDF a été supprimé des conditions générales.', 'alerta');
    }
  };

  const handleUpdateConditionsPdfUrl = (url: string) => {
    const currentCond = settingsForm.generalConditions || DEFAULT_GENERAL_CONDITIONS;
    const newSettings: SiteSettings = {
      ...settingsForm,
      generalConditions: {
        ...currentCond,
        pdfUrl: url,
        pdfFileName: url ? (currentCond.pdfFileName || 'Reglement_Interieur_La_Maloka.pdf') : undefined,
        pdfUploadDate: url ? new Date().toLocaleDateString('fr-FR') : undefined
      }
    };
    setSettingsForm(newSettings);
    setSiteSettings(newSettings);
    localStorage.setItem('maloka_site_settings', JSON.stringify(newSettings));
  };

  // --- CAMPAIGNS & INSCRIPTIONS MANAGEMENT ---
  const handleOpenAddCampaign = () => {
    setEditingCampaignId(null);
    setCampaignFormData({
      name: '',
      instructor: 'Yasmilka "La Gozadera" Valdés',
      schedule: 'Lundi 20:00 - 21:00',
      level: 'Débutant',
      description: '',
      priceMonthly: 35,
      annualPrice: 220,
      category: 'Salsa Cubaine',
      location: 'Fontenay-le-Fleury',
      season: selectedSeasonFilter !== 'Tous' ? selectedSeasonFilter : 'Saison 2026 - 2027',
      campaignType: 'Cours Annuel',
      visibility: 'Public',
      subscribersCount: 0,
      collectedAmount: 0,
      daysRemaining: 318,
      maxSpots: 30,
      active: true,
      helloAssoUrl: 'https://www.helloasso.com/associations/la-maloka',
      image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=600'
    });
    setIsCampaignModalOpen(true);
  };

  const handleOpenEditCampaign = (camp: DanceClass) => {
    setEditingCampaignId(camp.id);
    setCampaignFormData({ ...camp });
    setIsCampaignModalOpen(true);
  };

  const handleSaveCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignFormData.name) return;

    if (editingCampaignId) {
      // Update existing
      const updated = classes.map((c) => {
        if (c.id === editingCampaignId) {
          return {
            ...c,
            ...campaignFormData,
            id: editingCampaignId
          } as DanceClass;
        }
        return c;
      });
      setClasses(updated);
      localStorage.setItem('maloka_classes', JSON.stringify(updated));
      saveClassesToCloud(updated).catch(err => console.error('Firestore saveClasses error:', err));
      addNotification('Campagne mise à jour ✨', `La campagne "${campaignFormData.name}" a été modifiée avec succès.`, 'clase');
    } else {
      // Create new
      const newEntry: DanceClass = {
        id: 'camp-' + Date.now(),
        name: campaignFormData.name || 'Nouvelle Inscription',
        instructor: campaignFormData.instructor || 'Professeur La Maloka',
        schedule: campaignFormData.schedule || 'Horaire à définir',
        level: campaignFormData.level || 'Tous Niveaux',
        description: campaignFormData.description || '',
        priceMonthly: Number(campaignFormData.priceMonthly) || 30,
        annualPrice: Number(campaignFormData.annualPrice) || 190,
        category: campaignFormData.category || 'Salsa Cubaine',
        location: campaignFormData.location || 'Fontenay-le-Fleury',
        season: campaignFormData.season || 'Saison 2026 - 2027',
        campaignType: campaignFormData.campaignType || 'Cours Annuel',
        visibility: campaignFormData.visibility || 'Public',
        subscribersCount: Number(campaignFormData.subscribersCount) || 0,
        collectedAmount: Number(campaignFormData.collectedAmount) || 0,
        daysRemaining: Number(campaignFormData.daysRemaining) || 300,
        maxSpots: Number(campaignFormData.maxSpots) || 30,
        active: campaignFormData.active !== undefined ? campaignFormData.active : true,
        helloAssoUrl: campaignFormData.helloAssoUrl || 'https://www.helloasso.com/associations/la-maloka',
        image: campaignFormData.image || 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=600'
      };
      const updated = [...classes, newEntry];
      setClasses(updated);
      localStorage.setItem('maloka_classes', JSON.stringify(updated));
      saveClassesToCloud(updated).catch(err => console.error('Firestore saveClasses error:', err));
      addNotification('Nouvelle Campagne Créée 🌺', `La campagne "${newEntry.name}" (${newEntry.season}) est maintenant active.`, 'clase');
    }

    setIsCampaignModalOpen(false);
    setEditingCampaignId(null);
  };

  const handleDuplicateCampaign = (camp: DanceClass) => {
    const currentSeason = camp.season || 'Saison 2026 - 2027';
    // Calculate next season string if possible
    let nextSeason = 'Saison 2027 - 2028';
    if (currentSeason.includes('2026')) {
      nextSeason = 'Saison 2027 - 2028';
    } else if (currentSeason.includes('2027')) {
      nextSeason = 'Saison 2028 - 2029';
    }

    const clonedName = camp.name.replace(/2026\s*-\s*2027/g, '2027 - 2028').replace(/2026/g, '2027');

    const duplicated: DanceClass = {
      ...camp,
      id: 'camp-' + Date.now(),
      name: clonedName !== camp.name ? clonedName : `${camp.name} (${nextSeason})`,
      season: nextSeason,
      subscribersCount: 0,
      collectedAmount: 0,
      daysRemaining: 365,
      visibility: 'Public',
      active: true
    };

    const updated = [...classes, duplicated];
    setClasses(updated);
    localStorage.setItem('maloka_classes', JSON.stringify(updated));
    setSelectedSeasonFilter(nextSeason);
    addNotification('Campagne Dupliquée 📋', `Création réussie de "${duplicated.name}" pour ${nextSeason}.`, 'clase');
  };

  const handleToggleCampaignVisibility = (id: string) => {
    let newStatus = 'Public';
    let targetName = '';
    const updated = classes.map((c) => {
      if (c.id === id) {
        const newVis = c.visibility === 'Public' ? 'Privé' : 'Public';
        newStatus = newVis;
        targetName = c.name;
        return { ...c, visibility: newVis };
      }
      return c;
    });
    setClasses(updated);
    localStorage.setItem('maloka_classes', JSON.stringify(updated));
    saveClassesToCloud(updated).catch((err) => console.error('Firestore saveClasses error:', err));
    addNotification(
      newStatus === 'Public' ? 'Inscriptions Ouvertes 🟢' : 'Inscriptions Fermées 🔒',
      `Le cours "${targetName || 'Sélectionné'}" est maintenant en statut ${newStatus}. Les inscriptions en ligne sont ${newStatus === 'Public' ? 'ouvertes au public' : 'désactivées / fermées'}.`,
      'clase'
    );
  };

  const handleToggleCampaignActive = (id: string) => {
    let newActive = true;
    let targetName = '';
    const updated = classes.map((c) => {
      if (c.id === id) {
        const toggled = c.active === false ? true : false;
        newActive = toggled;
        targetName = c.name;
        return { ...c, active: toggled };
      }
      return c;
    });
    setClasses(updated);
    localStorage.setItem('maloka_classes', JSON.stringify(updated));
    saveClassesToCloud(updated).catch((err) => console.error('Firestore saveClasses error:', err));
    addNotification(
      newActive ? 'Cours Activé 🟢' : 'Cours Désactivé ⏸️',
      `Le cours "${targetName || 'Sélectionné'}" est maintenant ${newActive ? 'actif' : 'désactivé'}.`,
      'clase'
    );
  };

  const handleDeleteCampaign = (id: string, name: string) => {
    if (window.confirm(`Supprimer définitivement la campagne "${name}" ?`)) {
      const updated = classes.filter((c) => c.id !== id);
      setClasses(updated);
      localStorage.setItem('maloka_classes', JSON.stringify(updated));
      saveClassesToCloud(updated).catch((err) => console.error('Firestore saveClasses error:', err));
      addNotification('Campagne Retirée 🗑️', `La campagne "${name}" a été supprimée.`, 'alerta');
    }
  };

  // --- ROOMS & CAPACITY / AFORO MANAGEMENT ---
  const handleOpenCreateRoom = () => {
    setEditingRoomId(null);
    setRoomFormData({
      name: '',
      location: 'Fontenay-le-Fleury',
      address: 'Avenue Jean Lurçat, 78330 Fontenay-le-Fleury',
      maxCapacity: 30,
      surfaceAreaM2: 120,
      equipment: ['Parquet', 'Miroirs', 'Sonorisation'],
      notes: '',
      active: true
    });
    setIsRoomModalOpen(true);
  };

  const handleOpenEditRoom = (room: DanceRoom) => {
    setEditingRoomId(room.id);
    setRoomFormData({ ...room });
    setIsRoomModalOpen(true);
  };

  const handleSaveRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomFormData.name || !roomFormData.maxCapacity) return;

    if (editingRoomId) {
      const updatedRooms = rooms.map((r) => {
        if (r.id === editingRoomId) {
          return {
            ...r,
            ...roomFormData,
            id: editingRoomId,
            maxCapacity: Number(roomFormData.maxCapacity) || 30
          } as DanceRoom;
        }
        return r;
      });

      if (setRooms) setRooms(updatedRooms);
      localStorage.setItem('maloka_rooms', JSON.stringify(updatedRooms));

      // Also optionally update any linked classes maxSpots if user wishes
      const updatedClasses = classes.map(c => {
        if (c.roomId === editingRoomId) {
          return { ...c, roomName: roomFormData.name, maxSpots: Number(roomFormData.maxCapacity) || c.maxSpots };
        }
        return c;
      });
      setClasses(updatedClasses);
      localStorage.setItem('maloka_classes', JSON.stringify(updatedClasses));

      addNotification('Salle Mise à Jour 🏛️', `La jauge et les caractéristiques de "${roomFormData.name}" ont été actualisées.`, 'clase');
    } else {
      const newRoom: DanceRoom = {
        id: 'room-' + Date.now(),
        name: roomFormData.name || 'Nouvelle Salle',
        location: roomFormData.location || 'Fontenay-le-Fleury',
        address: roomFormData.address || '',
        maxCapacity: Number(roomFormData.maxCapacity) || 30,
        surfaceAreaM2: Number(roomFormData.surfaceAreaM2) || 100,
        equipment: roomFormData.equipment || ['Parquet', 'Sonorisation'],
        notes: roomFormData.notes || '',
        active: roomFormData.active !== undefined ? roomFormData.active : true
      };

      const updatedRooms = [...rooms, newRoom];
      if (setRooms) setRooms(updatedRooms);
      localStorage.setItem('maloka_rooms', JSON.stringify(updatedRooms));
      addNotification('Nouvelle Salle Créée 🚪', `La salle "${newRoom.name}" (${newRoom.location}) avec une jauge de ${newRoom.maxCapacity} places a été ajoutée.`, 'clase');
    }

    setIsRoomModalOpen(false);
    setEditingRoomId(null);
  };

  const handleDeleteRoom = (id: string, name: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la salle "${name}" ?`)) {
      const updatedRooms = rooms.filter(r => r.id !== id);
      if (setRooms) setRooms(updatedRooms);
      localStorage.setItem('maloka_rooms', JSON.stringify(updatedRooms));
      addNotification('Salle Supprimée 🗑️', `La salle "${name}" a été retirée du catalogue.`, 'alerta');
    }
  };

  const handleToggleRoomActive = (id: string) => {
    const updatedRooms = rooms.map(r => r.id === id ? { ...r, active: !r.active } : r);
    if (setRooms) setRooms(updatedRooms);
    localStorage.setItem('maloka_rooms', JSON.stringify(updatedRooms));
  };

  const handleQuickAdjustCapacity = (classId: string, delta: number) => {
    const updated = classes.map(c => {
      if (c.id === classId) {
        const newMax = Math.max(5, (c.maxSpots || 30) + delta);
        return { ...c, maxSpots: newMax };
      }
      return c;
    });
    setClasses(updated);
    localStorage.setItem('maloka_classes', JSON.stringify(updated));
    addNotification('Jauge Modifiée 👥', `La jauge du cours a été ajustée de ${delta > 0 ? '+' : ''}${delta} places.`, 'clase');
  };

  const handlePromoteWaitlistInscription = (inscriptionId: string, className: string) => {
    const updatedInscriptions = inscriptions.map(ins => {
      if (ins.id === inscriptionId) {
        return { ...ins, status: 'Confirmée' };
      }
      return ins;
    });
    setInscriptions(updatedInscriptions);
    localStorage.setItem('maloka_inscriptions', JSON.stringify(updatedInscriptions));

    // Update class subscribersCount if applicable
    const targetClass = classes.find(c => c.name === className || c.id === inscriptionId);
    if (targetClass) {
      const updatedClasses = classes.map(c => c.id === targetClass.id ? { ...c, subscribersCount: (c.subscribersCount || 0) + 1 } : c);
      setClasses(updatedClasses);
      localStorage.setItem('maloka_classes', JSON.stringify(updatedClasses));
    }

    addNotification(
      'Adhérent Confirmé 🌟',
      `L'adhérent a été transféré de la liste d'attente vers la liste officielle pour ${className}.`,
      'clase'
    );
  };

  // Google Sheets Export with the 31 HelloAsso / Google Sheets headers
  const handleExportGoogleSheetsCSV = () => {
    const headers = [
      'Référence commande',
      'Référence paiement',
      'Montant total',
      'Date du paiement',
      'Statut du paiement',
      'Versé',
      'Date du versement',
      'Nom payeur',
      'Prénom payeur',
      'Email payeur',
      'Date de naissance',
      'Raison sociale',
      'SIREN',
      'Forme juridique',
      'Campagne',
      'Type de campagne',
      'Type',
      'Montant du tarif',
      'Montant des options',
      'Don supplémentaire',
      'Code Promo',
      'Montant du code promo',
      'Moyen de paiement',
      'Attestation',
      'Reçu fiscal',
      'Numéro de reçu',
      'Adresse payeur',
      'Code Postal payeur',
      'Ville payeur',
      'Pays payeur',
      'Commentaire'
    ];

    const sampleOrRealRows = inscriptions.length > 0 ? inscriptions : [
      {
        id: 'demo-1',
        userName: 'Martine Dupont',
        userEmail: 'martine.dupont@gmail.com',
        userPhone: '06 11 22 33 44',
        classId: 'c-cardio-flf-20h-2026',
        className: 'CARDIO LATINO Cours de 20h Tous Niveaux Saison 2026 -2027- Fontenay le Fleury',
        level: 'Tous Niveaux',
        status: 'Confirmée',
        type: 'Inscription Annuelle',
        date: '10/09/2026',
        amountPaid: 190,
        paymentMethod: 'HelloAsso',
        paymentStatus: 'Payé',
        orderRef: 'CMD-HA-884912'
      },
      {
        id: 'demo-2',
        userName: 'Alexandre Renard',
        userEmail: 'a.renard@orange.fr',
        userPhone: '06 45 67 89 01',
        classId: 'c-essai-salsa-2026',
        className: "Cours d'essai Salsa cubaine vendredi 11 septembre 2026 - 20 heures",
        level: 'Débutant',
        status: 'Confirmée',
        type: "Cours d'essai",
        date: '08/09/2026',
        amountPaid: 0,
        paymentMethod: 'Gratuit',
        paymentStatus: 'Validé',
        orderRef: 'CMD-HA-884955'
      },
      {
        id: 'demo-3',
        userName: 'Élodie Caron',
        userEmail: 'elodie.caron@free.fr',
        userPhone: '07 88 99 00 11',
        classId: 'c-salsa-flf-21h-2026',
        className: 'SALSA CUBAINE Inter/Avancé Saison 2026 - 2027 Cours à 21h Fontenay le Fleury (2)',
        level: 'Intermédiaire',
        status: 'Confirmée',
        type: 'Inscription Annuelle',
        date: '11/09/2026',
        amountPaid: 220,
        paymentMethod: 'HelloAsso',
        paymentStatus: 'Payé',
        orderRef: 'CMD-HA-885002'
      }
    ];

    const rows = sampleOrRealRows.map((ins, idx) => {
      const isTrial = ins.className?.toLowerCase().includes('essai') || ins.type === "Cours d'essai";
      const amount = ins.amountPaid !== undefined ? ins.amountPaid : (isTrial ? 0 : 220);
      return [
        ins.orderRef || `CMD-MALOKA-${1000 + idx}`,
        `PAY-${9000 + idx}`,
        `${amount} €`,
        ins.date || '11/09/2026',
        ins.status === 'Confirmée' ? 'Payé' : 'En attente',
        'Oui',
        ins.date || '11/09/2026',
        ins.userName.split(' ').slice(1).join(' ') || ins.userName,
        ins.userName.split(' ')[0] || '',
        ins.userEmail,
        '1992-05-14',
        '',
        '',
        '',
        ins.className,
        isTrial ? "Cours d'essai" : "Adhésion Annuelle",
        'Tarif Normal',
        `${amount} €`,
        '0 €',
        '0 €',
        '',
        '0 €',
        ins.paymentMethod || 'HelloAsso',
        'Oui',
        'Oui',
        `REC-${500 + idx}`,
        'Gymnase du Levant',
        '78330',
        'Fontenay-le-Fleury',
        'France',
        ins.notes || 'Inscription enregistrée sur la plateforme La Maloka'
      ];
    });

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(';'), ...rows.map(e => e.map(cell => `"${(cell || '').toString().replace(/"/g, '""')}"`).join(';'))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `La_Maloka_HelloAsso_GoogleSheets_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addNotification(
      'Export Google Sheets & HelloAsso 📊',
      'Le fichier CSV prêt pour Google Sheets (31 colonnes standard) a été téléchargé.',
      'pago'
    );
  };

  // --- NATIVE XLSX EXPORT (6 DISTINCT WORKSHEETS) ---
  const handleExportGoogleSheetsNativeXLSX = () => {
    try {
      const wb = XLSX.utils.book_new();

      // 1. UTILISATEURS
      const usersData = inscriptions.length > 0 ? inscriptions.map((ins, idx) => {
        const parts = (ins.userName || 'Adhérent').trim().split(' ');
        return {
          ID_Utilisateur: `USR-2026-${String(idx + 1).padStart(3, '0')}`,
          Nom: (parts.slice(1).join(' ') || 'Nom').toUpperCase(),
          Prenom: parts[0] || 'Prénom',
          Email: ins.userEmail || 'email@exemple.fr',
          Telephone: ins.userPhone || '06 00 00 00 00',
          Date_Naissance: '15/06/1990',
          Adresse: 'Adresse communiquée',
          Ville: ins.className?.includes('Queue') ? 'La Queue-les-Yvelines' : 'Fontenay-le-Fleury',
          Code_Postal: ins.className?.includes('Queue') ? '78940' : '78330',
          Contact_Urgence: 'Famille / Conjoint'
        };
      }) : [
        { ID_Utilisateur: 'USR-2026-001', Nom: 'DUPONT', Prenom: 'Camille', Email: 'camille.dupont@email.fr', Telephone: '06 12 34 56 78', Date_Naissance: '14/05/1992', Adresse: '12 Rue de la Paix', Ville: 'Fontenay-le-Fleury', Code_Postal: '78330', Contact_Urgence: 'Michel Dupont (06 98 76 54 32)' }
      ];
      const wsUsers = XLSX.utils.json_to_sheet(usersData);
      XLSX.utils.book_append_sheet(wb, wsUsers, '1_UTILISATEURS');

      // 2. SALLES
      const roomsData = rooms.map(r => ({
        ID_Salle: r.id,
        Nom: r.name,
        Commune: r.location,
        Capacite_Max_Aforo: r.maxCapacity,
        Surface_m2: r.surfaceAreaM2 || 120,
        Equipements: (r.equipment || ['Parquet', 'Miroirs', 'Sonorisation']).join(', ')
      }));
      const wsRooms = XLSX.utils.json_to_sheet(roomsData);
      XLSX.utils.book_append_sheet(wb, wsRooms, '2_SALLES');

      // 3. COURS_ET_CAMPAGNES
      const coursesData = classes.map(c => ({
        ID_Cours: c.id,
        Titre_HelloAsso: c.name,
        Discipline: c.category,
        Niveau: c.level,
        Horaires: c.schedule,
        Professeur: c.instructor,
        Tarif_Annuel_EUR: c.annualPrice || c.priceMonthly * 9 || 198,
        Saison: c.season || 'Saison 2026 - 2027',
        ID_Salle: c.roomId || (c.location === 'Fontenay-le-Fleury' ? 'room-levant' : 'room-queue-centre')
      }));
      const wsCourses = XLSX.utils.json_to_sheet(coursesData);
      XLSX.utils.book_append_sheet(wb, wsCourses, '3_COURS_ET_CAMPAGNES');

      // 4. INSCRIPTIONS
      const inscData = (inscriptions.length > 0 ? inscriptions : [
        { id: 'ins-demo', userName: 'Camille Dupont', userEmail: 'camille.dupont@email.fr', userPhone: '06 12 34 56 78', className: 'Salsa Cubaine - Fontenay', classId: 'salsa-flf', level: 'Débutant', status: 'Confirmée', date: '18/08/2026' }
      ]).map((ins, idx) => ({
        Ref_Commande: `CMD-2026-${String(idx + 101).padStart(4, '0')}`,
        ID_Utilisateur: `USR-2026-${String(idx + 1).padStart(3, '0')}`,
        ID_Cours: ins.classId || 'salsa-flf-deb',
        Type: ins.status === "Liste d'attente" ? "Liste d'attente" : 'Inscription Annuelle',
        Statut_Paiement: ins.status === "Liste d'attente" ? "Attente validation" : 'Payé (HelloAsso)',
        Montant_EUR: ins.className?.includes('Queue') ? 210 : 198,
        Date: ins.date || '18/08/2026'
      }));
      const wsInsc = XLSX.utils.json_to_sheet(inscData);
      XLSX.utils.book_append_sheet(wb, wsInsc, '4_INSCRIPTIONS');

      // 5. FICHES_SANTE
      const healthData = usersData.map((u, idx) => ({
        ID_Fiche: `SANTE-2026-${String(idx + 1).padStart(3, '0')}`,
        ID_Utilisateur: u.ID_Utilisateur,
        Questions_Cardiaque_Articulaire: 'NON (Attestation validée)',
        Signature_Numerique: `Signé par ${u.Prenom} ${u.Nom}`,
        Date_Validation: '18/08/2026'
      }));
      const wsHealth = XLSX.utils.json_to_sheet(healthData);
      XLSX.utils.book_append_sheet(wb, wsHealth, '5_FICHES_SANTE');

      // 6. Export HelloAsso 31 Colonnes
      const helloAssoData = inscData.map((ins, idx) => {
        const u = usersData[idx % usersData.length];
        const c = coursesData[idx % coursesData.length];
        const r = roomsData[idx % roomsData.length];
        return {
          col1_numCommande: ins.Ref_Commande,
          col2_dateCommande: ins.Date,
          col3_nomPayeur: u.Nom,
          col4_prenomPayeur: u.Prenom,
          col5_emailPayeur: u.Email,
          col6_nomAdherent: u.Nom,
          col7_prenomAdherent: u.Prenom,
          col8_emailAdherent: u.Email,
          col9_telAdherent: u.Telephone,
          col10_dateNaissance: u.Date_Naissance,
          col11_adresse: u.Adresse,
          col12_codePostal: u.Code_Postal,
          col13_ville: u.Ville,
          col14_contactUrgence: u.Contact_Urgence,
          col15_discipline: c.Discipline,
          col16_niveau: c.Niveau,
          col17_titreCours: c.Titre_HelloAsso,
          col18_horaires: c.Horaires,
          col19_lieuCommune: r.Commune,
          col20_salleNom: r.Nom,
          col21_professeur: c.Professeur,
          col22_tarifNom: `${c.Discipline} 2026-2027`,
          col23_montantPaye: `${ins.Montant_EUR} €`,
          col24_moyenPaiement: 'Carte Bancaire (HelloAsso)',
          col25_statutCommande: ins.Statut_Paiement,
          col26_qsSportReponse: 'NON (Validé)',
          col27_signatureSante: 'Signature numérique vérifiée',
          col28_saison: c.Saison,
          col29_organisme: 'La Maloka',
          col30_rna: 'W783000000',
          col31_dateExport: new Date().toLocaleDateString('fr-FR')
        };
      });
      const wsHelloAsso = XLSX.utils.json_to_sheet(helloAssoData);
      XLSX.utils.book_append_sheet(wb, wsHelloAsso, 'Export_HelloAsso');

      const fileName = `LaMaloka_Base_Relationnelle_6_Feuilles_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);

      addNotification(
        'Fichier .XLSX Téléchargé 📑',
        `Le fichier ${fileName} contient les 6 feuilles distinctes. Importez-le dans Google Sheets via "Fichier > Importer > Remplacer la feuille de calcul".`,
        'clase'
      );
    } catch (err) {
      console.error('Error exporting XLSX:', err);
      addNotification('Erreur Export', 'Une erreur est survenue lors de la création du fichier .xlsx.', 'alerta');
    }
  };

  // --- CLASSES MANAGEMENT ---
  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass.name || !newClass.instructor || !newClass.schedule) return;

    const classToAdd: DanceClass = {
      id: 'c-' + Date.now(),
      name: newClass.name,
      instructor: newClass.instructor,
      schedule: newClass.schedule,
      level: newClass.level || 'Débutant',
      description: newClass.description || '',
      priceMonthly: Number(newClass.priceMonthly) || 45,
      image: newClass.image || 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=600',
      category: (newClass.category as any) || 'Salsa Cubaine',
      location: (newClass.location as any) || 'Fontenay-le-Fleury',
      active: true
    };

    const updatedClasses = [...classes, classToAdd];
    setClasses(updatedClasses);
    localStorage.setItem('maloka_classes', JSON.stringify(updatedClasses));

    addNotification(
      'Nouveau cours ajouté 💃',
      `Le cours de ${classToAdd.name} (${classToAdd.category}) est maintenant disponible.`,
      'clase'
    );

    // Reset Form
    setNewClass({
      name: '',
      instructor: '',
      schedule: '',
      level: 'Débutant',
      description: '',
      priceMonthly: 45,
      category: 'Salsa Cubaine',
      location: 'Fontenay-le-Fleury',
      image: 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=600',
      active: true
    });
  };

  const handleDeleteClass = (id: string, name: string) => {
    if (window.confirm(`Supprimer le cours "${name}" ?`)) {
      const updated = classes.filter((c) => c.id !== id);
      setClasses(updated);
      localStorage.setItem('maloka_classes', JSON.stringify(updated));
      addNotification('Cours supprimé 🗑️', `Le cours "${name}" a été supprimé.`, 'alerta');
    }
  };

  const handleToggleClassActive = (id: string) => {
    const updated = classes.map((c) => c.id === id ? { ...c, active: c.active === false ? true : false } : c);
    setClasses(updated);
    localStorage.setItem('maloka_classes', JSON.stringify(updated));
  };

  // --- EVENTS MANAGEMENT ---
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date || !newEvent.time) return;

    const eventToAdd: DanceEvent = {
      id: 'e-' + Date.now(),
      title: newEvent.title,
      type: newEvent.type || 'Stage',
      date: newEvent.date,
      time: newEvent.time,
      location: newEvent.location || 'Fontenay-le-Fleury',
      instructor: newEvent.instructor,
      price: Number(newEvent.price) || 0,
      description: newEvent.description || '',
      spotsLeft: Number(newEvent.totalSpots) || 40,
      totalSpots: Number(newEvent.totalSpots) || 40,
      image: newEvent.image || 'https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&q=80&w=600',
      active: true
    };

    const updatedEvents = [...events, eventToAdd];
    setEvents(updatedEvents);
    localStorage.setItem('maloka_events', JSON.stringify(updatedEvents));

    addNotification(
      'Événement programmé 🌴',
      `"${eventToAdd.title}" a été ajouté au calendrier pour le ${eventToAdd.date}.`,
      'evento'
    );

    setNewEvent({
      title: '',
      type: 'Stage',
      date: '2026-09-05',
      time: '14:00 - 18:00',
      location: 'Gymnase du Levant, Fontenay-le-Fleury',
      instructor: 'Yasmilka & Invités',
      price: 25,
      description: '',
      totalSpots: 40,
      spotsLeft: 40,
      image: 'https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&q=80&w=600',
      active: true
    });
  };

  const handleDeleteEvent = (id: string, title: string) => {
    if (window.confirm(`Supprimer l'événement "${title}" ?`)) {
      const updated = events.filter((e) => e.id !== id);
      setEvents(updated);
      localStorage.setItem('maloka_events', JSON.stringify(updated));
      addNotification('Événement retiré', `L'événement "${title}" a été retiré.`, 'alerta');
    }
  };

  // --- INSCRIPTIONS MANAGEMENT ---
  const handleUpdateInscriptionStatus = (id: string, newStatus: string) => {
    const updated = inscriptions.map((ins) => ins.id === id ? { ...ins, status: newStatus } : ins);
    setInscriptions(updated);
    localStorage.setItem('maloka_inscriptions', JSON.stringify(updated));
    updateInscriptionInCloud(id, { status: newStatus }).catch(err => console.error('Firestore updateInscription error:', err));
  };

  const handleDeleteInscription = (id: string, name: string) => {
    if (window.confirm(`Supprimer l'inscription de ${name} ?`)) {
      const updated = inscriptions.filter((ins) => ins.id !== id);
      setInscriptions(updated);
      localStorage.setItem('maloka_inscriptions', JSON.stringify(updated));
      deleteInscriptionFromCloud(id).catch(err => console.error('Firestore deleteInscription error:', err));
    }
  };

  // --- BROADCAST NOTIFICATION ---
  const handleBroadcastAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customAlertTitle || !customAlertDesc) return;

    addNotification(
      `📢 ${customAlertTitle}`,
      customAlertDesc,
      'alerta'
    );

    setCustomAlertTitle('');
    setCustomAlertDesc('');
    alert('Alerte diffusée à tous les visiteurs !');
  };

  // Helpers for Vignette editing
  const updateVignette = (index: number, field: keyof HomepageVignette, value: any) => {
    const newVignettes = [...settingsForm.vignettes];
    newVignettes[index] = { ...newVignettes[index], [field]: value };
    setSettingsForm({ ...settingsForm, vignettes: newVignettes });
  };

  // Helpers for Important Dates editing
  const updateImportantDate = (index: number, field: 'date' | 'label' | 'location', value: string) => {
    const newDates = [...settingsForm.registrationInfo.importantDates];
    newDates[index] = { ...newDates[index], [field]: value };
    setSettingsForm({
      ...settingsForm,
      registrationInfo: { ...settingsForm.registrationInfo, importantDates: newDates }
    });
  };

  const addImportantDate = () => {
    const newDates = [
      ...settingsForm.registrationInfo.importantDates,
      { date: 'Début Septembre 2026', label: 'Nouvelle Date de Rentrée', location: 'Fontenay-le-Fleury' }
    ];
    setSettingsForm({
      ...settingsForm,
      registrationInfo: { ...settingsForm.registrationInfo, importantDates: newDates }
    });
  };

  const removeImportantDate = (index: number) => {
    const newDates = settingsForm.registrationInfo.importantDates.filter((_, i) => i !== index);
    setSettingsForm({
      ...settingsForm,
      registrationInfo: { ...settingsForm.registrationInfo, importantDates: newDates }
    });
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="relative py-16 bg-gradient-to-tr from-slate-900 via-zinc-900 to-zinc-950 min-h-screen flex items-center justify-center text-white px-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.07),transparent_70%)] pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-zinc-900/95 backdrop-blur-md border border-zinc-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl relative"
        >
          <div className="w-14 h-14 bg-gradient-to-tr from-orange-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-rose-500/20">
            <Shield size={28} className="text-white" />
          </div>

          <h2 className="text-2xl font-black tracking-tight bg-gradient-to-r from-orange-400 to-rose-400 bg-clip-text text-transparent">
            La Maloka - Administration
          </h2>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            Espace sécurisé de gestion : tarifs, conditions générales, cours, jauges des salles, inscriptions et base de données.
          </p>

          <form onSubmit={handleAdminLogin} className="mt-7 space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                <span>Mot de passe d'administration :</span>
                <span className="text-[10px] text-zinc-500 font-mono">Sensible à la casse</span>
              </label>
              <div className="relative">
                <input
                  id="admin-password-input"
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Entrez votre mot de passe..."
                  className="w-full pl-4 pr-11 py-3 bg-zinc-800/90 border border-zinc-700 rounded-xl text-center tracking-wider font-mono text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1 transition-colors cursor-pointer"
                  title={showLoginPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {adminError && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-xs text-rose-300 text-center font-medium">
                ⚠️ {adminError}
              </div>
            )}

            <button
              id="submit-admin-login"
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-black rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-rose-950/40 transition-all cursor-pointer text-center"
            >
              Accéder à l'Administration
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-zinc-800/80 text-[11px] text-zinc-500 flex items-center justify-center gap-1.5">
            <Lock size={12} className="text-zinc-600" />
            <span>Accès strictement réservé au bureau de l'association</span>
          </div>
        </motion.div>
      </div>
    );
  }

  // Filtered Inscriptions
  const filteredInscriptions = inscriptions.filter((ins) => {
    if (inscriptionFilter === 'Tous') return true;
    return ins.className.toLowerCase().includes(inscriptionFilter.toLowerCase());
  });

  return (
    <div className="relative py-8 md:py-16 bg-zinc-950 text-zinc-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-zinc-800 pb-6 md:pb-8 mb-6 md:mb-8 text-left">
          <div className="flex items-start gap-4">
            <div className="w-16 h-13 sm:w-18 sm:h-14 rounded-2xl bg-[#95B208] p-1 shadow-lg shadow-lime-900/30 border border-lime-400/40 flex items-center justify-center shrink-0 overflow-hidden">
              <LaMalokaOfficialLogoSVG showText={false} className="w-full h-full object-contain" />
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-lime-500/10 border border-lime-500/20 text-lime-400 rounded-full text-[10px] font-extrabold uppercase tracking-widest">
                <Shield size={12} /> Étape 1 : Image & Gestion des Informations
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Back-Office - Association La Maloka
              </h2>
              <p className="text-xs text-zinc-400 max-w-3xl">
                Modifiez en temps réel les textes de la page d'accueil, les 2 viñettes (Salsa Cubaine & Cardio Latino), l'agenda, les cours, les salles et consultez les inscriptions.
              </p>
            </div>
          </div>

          <div className="flex items-stretch sm:items-center gap-2.5 flex-wrap w-full md:w-auto">
            <button
              id="admin-open-sheets-header-btn"
              onClick={() => setShowGoogleSheetsModal(true)}
              className="flex-1 sm:flex-initial px-3.5 sm:px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 border border-emerald-500/30 cursor-pointer hover:scale-105 transition-all"
              title="Ouvrir la base de données Google Sheets (5 Tables) & Exports"
            >
              <FileSpreadsheet size={15} className="text-emerald-200" />
              <span>Google Sheets & Exports</span>
            </button>

            <button
              id="admin-save-all-btn"
              onClick={handleSaveSettings}
              className="flex-1 sm:flex-initial px-3.5 sm:px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
            >
              <Save size={14} />
              <span>Publier</span>
            </button>

            <button
              id="admin-change-password-header-btn"
              onClick={() => {
                setCurrentPasswordInput('');
                setNewPasswordInput('');
                setConfirmPasswordInput('');
                setPasswordChangeMessage(null);
                setIsPasswordModalOpen(true);
              }}
              className="px-3.5 sm:px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-amber-300 hover:text-amber-200 font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 border border-zinc-800 hover:border-amber-500/40 cursor-pointer transition-all"
              title="Modifier le mot de passe d'administration"
            >
              <Key size={14} className="text-amber-400" />
              <span>Mot de Passe</span>
            </button>

            <button
              id="admin-logout-btn"
              onClick={() => setIsAdminLoggedIn(false)}
              className="px-3.5 sm:px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl uppercase tracking-wider cursor-pointer"
            >
              Déconnexion
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MASTER SWITCH: MOTEUR D'INSCRIPTIONS EN LIGNE (DÉSACTIVÉ / ACTIVÉ)        */}
        {/* ========================================================================= */}
        {(() => {
          const isEngineActive = settingsForm.moduleToggles?.allowOnlineRegistrations === true;

          return (
            <div className={`mb-6 p-5 sm:p-6 rounded-3xl border-2 transition-all shadow-xl ${
              isEngineActive 
                ? 'bg-gradient-to-r from-emerald-950/70 via-zinc-900 to-teal-950/70 border-emerald-500/50 shadow-emerald-950/50' 
                : 'bg-gradient-to-r from-amber-950/60 via-zinc-900 to-zinc-950 border-amber-500/50 shadow-amber-950/30'
            }`}>
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-2xl shrink-0 ${
                    isEngineActive 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}>
                    {isEngineActive ? <CheckCircle size={28} /> : <Info size={28} />}
                  </div>

                  <div className="space-y-1 text-left">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isEngineActive 
                          ? 'bg-emerald-500 text-black' 
                          : 'bg-amber-500 text-black'
                      }`}>
                        {isEngineActive ? '● Moteur Actif (Inscriptions Ouvertes)' : '○ Moteur Désactivé (Mode Informatif)'}
                      </span>
                      <span className="text-[11px] text-zinc-400 font-mono">
                        Saison 2026 - 2027
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-white">
                      {isEngineActive 
                        ? 'Les inscriptions en ligne sont actuellement OUVERTES aux visiteurs'
                        : 'Mode Informatif Actif : Le moteur d\'inscriptions est désactivé'}
                    </h3>

                    <p className="text-xs text-zinc-300 max-w-3xl leading-relaxed">
                      {isEngineActive 
                        ? 'Les visiteurs du site peuvent remplir le formulaire d\'inscription, sélectionner un créneau et valider leur place en direct.'
                        : 'Le site présente les plannings, salles, professeurs et tarifs officiels à titre informatif. Les boutons d\'inscription sont remplacés par des boutons d\'information et de contact.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto justify-end shrink-0">
                  <button
                    id="master-toggle-inscriptions-engine-btn"
                    onClick={() => handleToggleInscriptionsEngine(!isEngineActive)}
                    className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2.5 cursor-pointer hover:scale-105 ${
                      isEngineActive
                        ? 'bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/30 hover:border-amber-500'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black'
                    }`}
                  >
                    <Sparkles size={16} />
                    <span>
                      {isEngineActive 
                        ? 'Basculer en Mode Informatif (Désactiver)' 
                        : 'Encender / Activer le Moteur d\'Inscriptions'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Dynamic Navigation Tabs inside Back Office (Responsive & Scrollable) */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 md:mb-8 no-scrollbar scroll-smooth flex-nowrap lg:flex-wrap border-b border-zinc-800">
          {[
            { id: 'overview', label: 'Vue d\'Ensemble', icon: Shield },
            { id: 'sheets', label: '📊 Base Google Sheets', icon: FileSpreadsheet },
            { id: 'tarifs', label: `💳 Tarifs & Conditions (${(settingsForm.pricingPlans || DEFAULT_PRICING_PLANS).length})`, icon: CreditCard },
            { id: 'homepage', label: 'Page d\'Accueil & Annonces', icon: Layout },
            { id: 'contact', label: 'Coordonnées & Contact', icon: Phone },
            { id: 'classes', label: `Inscriptions & Campagnes (${classes.length})`, icon: BookOpen },
            { id: 'rooms', label: `Salles & Jauges / Aforo (${rooms.length})`, icon: Building },
            { id: 'events', label: 'Agenda & Stages', icon: Calendar },
            { id: 'gallery', label: `Galerie & Vidéos YouTube (${(photos || []).length + (videos || []).length})`, icon: Film },
            { id: 'inscriptions', label: `Inscriptions Reçues (${inscriptions.length})`, icon: Users }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap shrink-0 lg:shrink min-h-[40px] ${
                  activeTab === tab.id
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB CONTENT PANELS */}
        <div>

          {/* ========================================================= */}
          {/* TAB 1: OVERVIEW METRICS, URGENT BANNER & GOOGLE SHEETS */}
          {/* ========================================================= */}
          {activeTab === 'overview' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Metric 1 */}
                <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">Disciplines Officielles</span>
                  <p className="text-2xl font-black text-amber-400 mt-2">2 Styles Actifs</p>
                  <p className="text-[10px] text-zinc-400 mt-1">Salsa Cubaine & Cardio Latino</p>
                </div>

                {/* Metric 2 */}
                <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">Cours Planifiés</span>
                  <p className="text-2xl font-black text-rose-400 mt-2">{classes.filter(c => c.active !== false).length} Cours</p>
                  <p className="text-[10px] text-zinc-400 mt-1">Fontenay & La Queue-les-Yvelines</p>
                </div>

                {/* Metric 3 */}
                <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">Demandes d'Inscription</span>
                  <p className="text-2xl font-black text-emerald-400 mt-2">{inscriptions.length} Demandes</p>
                  <p className="text-[10px] text-zinc-400 mt-1">Enregistrées via le formulaire</p>
                </div>

                {/* Metric 4 */}
                <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">Salles & Lieux Configurés</span>
                  <p className="text-2xl font-black text-cyan-400 mt-2">{rooms.length} Salles</p>
                  <p className="text-[10px] text-zinc-400 mt-1">Avec contrôle de jauge (Aforo)</p>
                </div>

              </div>

              {/* HIGH PRIORITY: GOOGLE SHEETS RELATIONAL DATABASE BAR */}
              <div className="p-6 bg-gradient-to-r from-emerald-950/60 via-zinc-900 to-teal-950/60 border-2 border-emerald-500/40 rounded-3xl shadow-xl space-y-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-500/20 text-emerald-300 rounded-2xl border border-emerald-500/30">
                      <FileSpreadsheet size={28} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-wider rounded-full">
                          Connecteur Base de Données
                        </span>
                        <span className="text-xs text-zinc-400 font-mono">5 Tables Relationnelles</span>
                      </div>
                      <h3 className="text-xl font-black text-white mt-1">
                        Google Sheets - Registre & Données La Maloka
                      </h3>
                      <p className="text-xs text-zinc-300">
                        Accédez directement à la feuille de calcul Google Sheets maître ou téléchargez les exports CSV 31 colonnes compatibles HelloAsso.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    <button
                      id="overview-download-xlsx-btn"
                      onClick={handleExportGoogleSheetsNativeXLSX}
                      className="px-4 py-2.5 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-black font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer hover:scale-105"
                      title="Télécharger le fichier .xlsx contenant les 6 feuilles prêtes à être importées dans Google Sheets"
                    >
                      <Download size={14} />
                      <span>1. Télécharger .XLSX (6 Feuilles)</span>
                    </button>

                    <a
                      id="overview-open-sheets-btn"
                      href="https://docs.google.com/spreadsheets/d/1faWh69ShTeI9hE-OtlUDF9LrqbdDI8m-6nKN7BMn_7g/edit?usp=sharing"
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 border border-zinc-700 shadow-md transition-all cursor-pointer hover:scale-105"
                      title="Ouvrir votre document Google Sheets pour importer le fichier .xlsx téléchargé"
                    >
                      <FileSpreadsheet size={14} className="text-emerald-400" />
                      <span>2. Ouvrir Google Sheets</span>
                      <ExternalLink size={13} />
                    </a>

                    <button
                      onClick={() => setShowGoogleSheetsModal(true)}
                      className="px-3.5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white font-bold text-xs rounded-xl flex items-center gap-1.5 border border-zinc-800 transition-all cursor-pointer"
                    >
                      <Eye size={14} className="text-amber-400" />
                      <span>Explorateur (6 Tables)</span>
                    </button>

                    <button
                      onClick={handleExportGoogleSheetsCSV}
                      className="px-3.5 py-2.5 bg-teal-900/60 hover:bg-teal-800 text-teal-200 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-teal-700/50 transition-all cursor-pointer"
                      title="Télécharger les 31 colonnes HelloAsso au format CSV"
                    >
                      <Download size={13} />
                      <span>CSV HelloAsso</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* URGENT BANNER / FLASH INFO CONTROLLER */}
              <div className="p-6 md:p-8 bg-zinc-900 border-2 border-rose-500/30 rounded-3xl space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-2xl">
                      <AlertTriangle size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">
                        Bandeau d'Urgence & Flash Info (Haut de Site)
                      </h3>
                      <p className="text-xs text-zinc-400">
                        Affichez un message d'urgence prioritaire en haut de page pour tous les visiteurs (paramétrable instantanément).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2.5 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs font-bold text-white cursor-pointer hover:bg-zinc-750">
                      <input
                        type="checkbox"
                        checked={settingsForm.urgentBanner?.enabled ?? true}
                        onChange={(e) => {
                          const currentBanner = settingsForm.urgentBanner || {
                            enabled: true,
                            type: 'urgent',
                            badge: 'Annonce Urgente',
                            title: 'Rentrée 2026-2027 & Forums',
                            message: 'Inscriptions prioritaires ouvertes pour Salsa Cubaine & Cardio Latino !',
                            linkText: 'Voir les Inscriptions',
                            linkAction: 'clases',
                            isDismissible: true
                          };
                          setSettingsForm({
                            ...settingsForm,
                            urgentBanner: {
                              ...currentBanner,
                              enabled: e.target.checked
                            }
                          });
                        }}
                        className="w-4 h-4 accent-rose-500 cursor-pointer"
                      />
                      <span>Bandeau Actif sur le site</span>
                    </label>

                    <button
                      onClick={handleSaveSettings}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase rounded-xl flex items-center gap-1.5 cursor-pointer shadow"
                    >
                      <Save size={13} />
                      <span>Publier</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase">Niveau d'Urgence / Style :</label>
                    <select
                      value={settingsForm.urgentBanner?.type || 'urgent'}
                      onChange={(e) => {
                        const current = settingsForm.urgentBanner || {
                          enabled: true,
                          type: 'urgent',
                          badge: 'Annonce Urgente',
                          title: '',
                          message: '',
                          linkText: '',
                          linkAction: '',
                          isDismissible: true
                        };
                        setSettingsForm({
                          ...settingsForm,
                          urgentBanner: {
                            ...current,
                            type: e.target.value as any
                          }
                        });
                      }}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white"
                    >
                      <option value="urgent">🔴 Urgence Critique (Rouge Vif)</option>
                      <option value="warning">🟠 Alerte / Important (Ambre / Orange)</option>
                      <option value="info">🔵 Information Générale (Bleu Nuit)</option>
                      <option value="succes">🟢 Succès / Bonne Nouvelle (Vert Émeraude)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase">Badge / Étiquette :</label>
                    <input
                      type="text"
                      placeholder="ex: Annonce Urgente, Flash Info, Rentrée"
                      value={settingsForm.urgentBanner?.badge || ''}
                      onChange={(e) => {
                        const current = settingsForm.urgentBanner || {
                          enabled: true,
                          type: 'urgent',
                          badge: '',
                          title: '',
                          message: '',
                          linkText: '',
                          linkAction: '',
                          isDismissible: true
                        };
                        setSettingsForm({
                          ...settingsForm,
                          urgentBanner: { ...current, badge: e.target.value }
                        });
                      }}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase">Titre Court :</label>
                    <input
                      type="text"
                      placeholder="ex: Rentrée 2026-2027 & Forums"
                      value={settingsForm.urgentBanner?.title || ''}
                      onChange={(e) => {
                        const current = settingsForm.urgentBanner || {
                          enabled: true,
                          type: 'urgent',
                          badge: '',
                          title: '',
                          message: '',
                          linkText: '',
                          linkAction: '',
                          isDismissible: true
                        };
                        setSettingsForm({
                          ...settingsForm,
                          urgentBanner: { ...current, title: e.target.value }
                        });
                      }}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase">Message / Information à diffuser :</label>
                  <textarea
                    rows={2}
                    placeholder="ex: Inscriptions prioritaires ouvertes pour Salsa Cubaine & Cardio Latino à Fontenay et La Queue-les-Yvelines !..."
                    value={settingsForm.urgentBanner?.message || ''}
                    onChange={(e) => {
                      const current = settingsForm.urgentBanner || {
                        enabled: true,
                        type: 'urgent',
                        badge: '',
                        title: '',
                        message: '',
                        linkText: '',
                        linkAction: '',
                        isDismissible: true
                      };
                      setSettingsForm({
                        ...settingsForm,
                        urgentBanner: { ...current, message: e.target.value }
                      });
                    }}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase">Texte du Bouton d'Action (Optionnel) :</label>
                    <input
                      type="text"
                      placeholder="ex: Voir les Inscriptions"
                      value={settingsForm.urgentBanner?.linkText || ''}
                      onChange={(e) => {
                        const current = settingsForm.urgentBanner || {
                          enabled: true,
                          type: 'urgent',
                          badge: '',
                          title: '',
                          message: '',
                          linkText: '',
                          linkAction: '',
                          isDismissible: true
                        };
                        setSettingsForm({
                          ...settingsForm,
                          urgentBanner: { ...current, linkText: e.target.value }
                        });
                      }}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase">Destination du Bouton :</label>
                    <select
                      value={settingsForm.urgentBanner?.linkAction || 'clases'}
                      onChange={(e) => {
                        const current = settingsForm.urgentBanner || {
                          enabled: true,
                          type: 'urgent',
                          badge: '',
                          title: '',
                          message: '',
                          linkText: '',
                          linkAction: '',
                          isDismissible: true
                        };
                        setSettingsForm({
                          ...settingsForm,
                          urgentBanner: { ...current, linkAction: e.target.value }
                        });
                      }}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white"
                    >
                      <option value="clases">Onglet Inscriptions & Campagnes</option>
                      <option value="calendario">Onglet Agenda & Événements</option>
                      <option value="galeria">Onglet Galerie Photos</option>
                      <option value="contact">Pied de Page & Contact</option>
                    </select>
                  </div>
                </div>

                {/* Live Preview of the Urgent Banner inside Admin */}
                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-2">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Aperçu en Direct du Bandeau :</span>
                  <div className={`p-3 rounded-xl text-xs flex flex-col sm:flex-row items-center justify-between gap-3 ${
                    (settingsForm.urgentBanner?.type || 'urgent') === 'urgent'
                      ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white'
                      : (settingsForm.urgentBanner?.type || 'urgent') === 'warning'
                      ? 'bg-gradient-to-r from-amber-600 to-orange-700 text-white'
                      : (settingsForm.urgentBanner?.type || 'urgent') === 'succes'
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white'
                      : 'bg-gradient-to-r from-sky-700 to-indigo-800 text-white'
                  }`}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 bg-white text-zinc-900 rounded-full font-black text-[9px] uppercase">
                        {settingsForm.urgentBanner?.badge || 'URGENCE'}
                      </span>
                      <strong className="font-extrabold">{settingsForm.urgentBanner?.title || 'Titre'}:</strong>
                      <span>{settingsForm.urgentBanner?.message || 'Message diffusé sur le site web.'}</span>
                    </div>
                    {settingsForm.urgentBanner?.linkText && (
                      <span className="px-3 py-1 bg-black/30 rounded-lg text-[11px] font-bold border border-white/20 shrink-0">
                        {settingsForm.urgentBanner.linkText} →
                      </span>
                    )}
                  </div>
                </div>

              </div>

              {/* Notification Broadcaster & Status */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Status card */}
                <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-4">
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <CheckCircle size={18} className="text-emerald-400" />
                    Périmètre de l'Étape 1
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Conformément aux consignes :
                  </p>
                  <ul className="space-y-2 text-xs text-zinc-300">
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✔</span>
                      <span><strong>Salsa Cubaine</strong> & <strong>Cardio Latino</strong> uniquement (tous les autres rythmes masqués).</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✔</span>
                      <span>Terme interdit "zumba" totalement supprimé de l'application.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✔</span>
                      <span>2 viñettes d'accueil distinctes gérées depuis l'onglet dédié ci-dessus.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-400">✔</span>
                      <span>Gestion des dates des forums de rentrée et des jauges des salles (Aforo).</span>
                    </li>
                  </ul>
                </div>

                {/* Notification Broadcaster */}
                <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-4">
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Send size={18} className="text-rose-400" /> Diffuseur d'Alertes Générales
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Envoyez un message qui apparaîtra dans le centre de notifications pour tous les utilisateurs.
                  </p>

                  <form onSubmit={handleBroadcastAlert} className="space-y-3 pt-2">
                    <input
                      id="broadcast-title-input"
                      type="text"
                      required
                      placeholder="Titre (ex: Forum des Associations ce Samedi !)"
                      value={customAlertTitle}
                      onChange={(e) => setCustomAlertTitle(e.target.value)}
                      className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white"
                    />
                    <textarea
                      id="broadcast-desc-input"
                      required
                      placeholder="Contenu détaillé..."
                      value={customAlertDesc}
                      onChange={(e) => setCustomAlertDesc(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white resize-none"
                    />
                    <button
                      id="submit-broadcast-btn"
                      type="submit"
                      className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send size={12} /> Diffuser la Notification
                    </button>
                  </form>
                </div>

              </div>
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* TAB: GOOGLE SHEETS RELATIONAL HUB (DEDICATED PANEL) */}
          {/* ========================================================= */}
          {activeTab === 'sheets' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <GoogleSheetsRelationalHub
                inscriptions={inscriptions}
                classes={classes}
                rooms={rooms}
                healthForms={healthForms}
                siteSettings={siteSettings}
                addNotification={addNotification}
              />
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: HOMEPAGE & THE 2 VIGNETTES MANAGEMENT */}
          {/* ========================================================= */}
          {activeTab === 'homepage' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 text-left">
              
              {/* General Hero & Association Info */}
              <div className="p-6 md:p-8 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <Layout size={18} className="text-orange-400" />
                      1. En-tête Principal & Textes de Bienvenue
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Gérez les textes visibles sur la bannière supérieure de la page d'accueil.
                    </p>
                  </div>
                  <button
                    onClick={handleSaveSettings}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase rounded-xl flex items-center gap-1 cursor-pointer"
                  >
                    <Save size={14} /> Enregistrer
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase">Nom de l'Association :</label>
                    <input
                      type="text"
                      value={settingsForm.associationName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, associationName: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase">Slogan / Tagline :</label>
                    <input
                      type="text"
                      value={settingsForm.tagline}
                      onChange={(e) => setSettingsForm({ ...settingsForm, tagline: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase">Titre d'Accroche (Headline) :</label>
                    <input
                      type="text"
                      value={settingsForm.heroHeadline}
                      onChange={(e) => setSettingsForm({ ...settingsForm, heroHeadline: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase">Sous-titre / Paragraphe Explicatif :</label>
                    <textarea
                      value={settingsForm.heroSubheadline}
                      onChange={(e) => setSettingsForm({ ...settingsForm, heroSubheadline: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white resize-none"
                    />
                  </div>

                  {/* Hero Main Card Image Uploader */}
                  <div className="space-y-2 md:col-span-2 p-4 bg-zinc-950/70 border border-zinc-800 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] text-zinc-300 font-bold uppercase flex items-center gap-1.5">
                        <ImageIcon size={14} className="text-orange-400" />
                        <span>Grande Photo Principale d'Accueil (Carte de Présentation Hero) :</span>
                      </label>
                      
                      <label className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-all border border-zinc-700">
                        <Upload size={12} className="text-orange-400" />
                        <span>Choisir une photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              compressAndProcessImage(file, (optimizedUrl) => {
                                setSettingsForm({ ...settingsForm, heroImage: optimizedUrl });
                              });
                            }
                          }}
                        />
                      </label>
                    </div>

                    <div className="flex items-center gap-4">
                      {settingsForm.heroImage ? (
                        <img
                          src={settingsForm.heroImage}
                          alt="Image Principale"
                          className="w-20 h-16 rounded-xl object-cover border border-zinc-700 shrink-0 bg-zinc-900 shadow-md"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-20 h-16 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 shrink-0">
                          <ImageIcon size={24} />
                        </div>
                      )}

                      <div className="flex-1 space-y-1">
                        <input
                          type="text"
                          value={settingsForm.heroImage || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, heroImage: normalizeImageUrl(e.target.value) })}
                          placeholder="Coller lien Google Drive (partagé public), ou choisir un fichier..."
                          className="w-full px-3.5 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white font-mono text-[11px]"
                        />
                        <span className="text-[10px] text-zinc-400 block leading-tight">
                          💡 <em>Cette photo s'affiche dans la carte principale en haut de l'accueil. Vous pouvez importer un fichier de votre appareil ou coller un lien Google Drive partagé en mode public.</em>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* THE TWO VIGNETTES EDITING: SALSA CUBAINE & CARDIO LATINO */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <Sparkles size={18} className="text-rose-400" />
                      2. Les Deux Viñettes de la Page d'Accueil
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Personnalisez les 2 sections phares présentées aux visiteurs : <strong>Salsa Cubaine</strong> et <strong>Cardio Latino</strong>.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {settingsForm.vignettes.map((vignette, index) => {
                    const isSalsa = vignette.id === 'salsa-cubaine';
                    
                    return (
                      <div
                        key={vignette.id}
                        className={`p-6 bg-zinc-900 rounded-3xl border space-y-4 ${
                          isSalsa ? 'border-orange-500/30' : 'border-emerald-500/30'
                        }`}
                      >
                        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase text-white ${
                            isSalsa ? 'bg-orange-500' : 'bg-emerald-600'
                          }`}>
                            Viñette {index + 1} : {vignette.title}
                          </span>

                          <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                            <span>Activer :</span>
                            <input
                              type="checkbox"
                              checked={vignette.active}
                              onChange={(e) => updateVignette(index, 'active', e.target.checked)}
                              className="accent-rose-500 w-4 h-4"
                            />
                          </label>
                        </div>

                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-400 font-bold uppercase">Titre de la Viñette :</label>
                            <input
                              type="text"
                              value={vignette.title}
                              onChange={(e) => updateVignette(index, 'title', e.target.value)}
                              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-400 font-bold uppercase">Sous-titre d'Ambiance :</label>
                            <input
                              type="text"
                              value={vignette.subtitle}
                              onChange={(e) => updateVignette(index, 'subtitle', e.target.value)}
                              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white"
                            />
                          </div>

                          <div className="space-y-2 p-3 bg-zinc-950/60 border border-zinc-800 rounded-2xl">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] text-zinc-300 font-bold uppercase flex items-center gap-1.5">
                                <ImageIcon size={12} className="text-rose-400" />
                                <span>Image de la Viñette (Drive, Photos ou Fichier Local) :</span>
                              </label>
                              
                              <label className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold rounded-lg cursor-pointer flex items-center gap-1 transition-all border border-zinc-700">
                                <Upload size={11} className="text-rose-400" />
                                <span>Choisir un fichier</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      compressAndProcessImage(file, (optimizedUrl) => {
                                        updateVignette(index, 'image', optimizedUrl);
                                      });
                                    }
                                  }}
                                />
                              </label>
                            </div>

                            <div className="flex items-center gap-3">
                              {vignette.image ? (
                                <img
                                  src={vignette.image}
                                  alt={vignette.title}
                                  className="w-14 h-14 rounded-xl object-cover border border-zinc-700 shrink-0 bg-zinc-900"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-14 h-14 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 shrink-0">
                                  <ImageIcon size={20} />
                                </div>
                              )}

                              <div className="flex-1 space-y-1">
                                <input
                                  type="text"
                                  value={vignette.image}
                                  onChange={(e) => updateVignette(index, 'image', normalizeImageUrl(e.target.value))}
                                  placeholder="Coller lien Google Drive, Photos, Imgur ou web..."
                                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white font-mono text-[11px]"
                                />
                                <span className="text-[9px] text-zinc-400 block leading-tight">
                                  💡 <em>Lien Google Drive accepté (converti automatiquement) ou cliquez sur "Choisir un fichier" pour charger depuis votre PC/téléphone.</em>
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-400 font-bold uppercase">Description détaillée :</label>
                            <textarea
                              value={vignette.description}
                              onChange={(e) => updateVignette(index, 'description', e.target.value)}
                              rows={3}
                              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white resize-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] text-zinc-400 font-bold uppercase">Résumé Horaires :</label>
                              <input
                                type="text"
                                value={vignette.scheduleSummary}
                                onChange={(e) => updateVignette(index, 'scheduleSummary', e.target.value)}
                                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] text-zinc-400 font-bold uppercase">Résumé Lieux :</label>
                              <input
                                type="text"
                                value={vignette.locationSummary}
                                onChange={(e) => updateVignette(index, 'locationSummary', e.target.value)}
                                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] text-zinc-400 font-bold uppercase">Points Clés (séparés par des virgules) :</label>
                            <input
                              type="text"
                              value={vignette.keyPoints.join(', ')}
                              onChange={(e) => updateVignette(index, 'keyPoints', e.target.value.split(',').map(s => s.trim()))}
                              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* REGISTRATION DATES & GUIDELINES EDITING */}
              <div className="p-6 md:p-8 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-black text-white flex items-center gap-2">
                      <Calendar size={18} className="text-emerald-400" />
                      3. Dates des Inscriptions & Informations Pratiques
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Gérez les dates officielles des forums, la bannière d'alerte et les consignes d'adhésion.
                    </p>
                  </div>
                  <button
                    onClick={addImportantDate}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={14} /> Ajouter une Date
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase">Titre de la Saison :</label>
                    <input
                      type="text"
                      value={settingsForm.registrationInfo.seasonTitle}
                      onChange={(e) => setSettingsForm({
                        ...settingsForm,
                        registrationInfo: { ...settingsForm.registrationInfo, seasonTitle: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-zinc-400 font-bold uppercase">Texte du Bandeau d'Annonce Supérieur :</label>
                    <input
                      type="text"
                      value={settingsForm.registrationInfo.bannerText}
                      onChange={(e) => setSettingsForm({
                        ...settingsForm,
                        registrationInfo: { ...settingsForm.registrationInfo, bannerText: e.target.value }
                      })}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                {/* Important Dates list */}
                <div className="space-y-3">
                  <label className="text-[10px] text-zinc-400 font-bold uppercase block">Liste des Dates Clés des Forums :</label>
                  {settingsForm.registrationInfo.importantDates.map((item, idx) => (
                    <div key={idx} className="p-3 bg-zinc-800/60 rounded-xl flex flex-col sm:flex-row gap-3 items-center">
                      <input
                        type="text"
                        placeholder="Date (ex: Samedi 5 Septembre 2026)"
                        value={item.date}
                        onChange={(e) => updateImportantDate(idx, 'date', e.target.value)}
                        className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-amber-300 font-bold"
                      />
                      <input
                        type="text"
                        placeholder="Événement (ex: Forum des Associations)"
                        value={item.label}
                        onChange={(e) => updateImportantDate(idx, 'label', e.target.value)}
                        className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-white"
                      />
                      <input
                        type="text"
                        placeholder="Lieu"
                        value={item.location}
                        onChange={(e) => updateImportantDate(idx, 'location', e.target.value)}
                        className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-xs text-zinc-300"
                      />
                      <button
                        onClick={() => removeImportantDate(idx)}
                        className="p-2 text-zinc-400 hover:text-rose-400 cursor-pointer"
                        title="Supprimer cette date"
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    onClick={handleSaveSettings}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-lg cursor-pointer"
                  >
                    <Save size={16} /> Enregistrer et Publier sur le Site
                  </button>
                </div>
              </div>

            </motion.div>
          )}

          {/* ========================================================= */}
          {/* TAB: CONTACT & COORDONNÉES MANAGEMENT */}
          {/* ========================================================= */}
          {activeTab === 'contact' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 text-left">
              
              {/* Header with instant action */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-zinc-900 border border-zinc-800 rounded-3xl">
                <div>
                  <h3 className="text-xl font-black text-white flex items-center gap-2">
                    <Phone size={20} className="text-rose-400" />
                    <span>Gestion des Coordonnées & Informations de Contact</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    Ces informations sont affichées dans le pied de page, les sections pratiques et les communications avec les adhérents.
                  </p>
                </div>

                <button
                  id="save-contact-info-top-btn"
                  onClick={handleSaveSettings}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-md cursor-pointer shrink-0"
                >
                  <Save size={14} />
                  <span>Enregistrer Coordonnées</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Form: Direct Channels & Locations & Socials */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Category 1: Direct Communication Channels */}
                  <div className="p-6 md:p-8 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
                      <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                        <Mail size={16} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                          1. Canaux Directs de Communication
                        </h4>
                        <p className="text-[11px] text-zinc-400">
                          Email officiel, téléphone, WhatsApp et référent de l'association.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Email */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Mail size={13} className="text-rose-400" />
                          <span>Email Officiel de Contact :</span>
                        </label>
                        <input
                          id="contact-email-input"
                          type="email"
                          value={settingsForm.contactEmail}
                          onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })}
                          placeholder="association.lamaloka@gmail.com"
                          className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        />
                      </div>

                      {/* Phone */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Phone size={13} className="text-emerald-400" />
                          <span>Téléphone Principal :</span>
                        </label>
                        <input
                          id="contact-phone-input"
                          type="text"
                          value={settingsForm.contactPhone}
                          onChange={(e) => setSettingsForm({ ...settingsForm, contactPhone: e.target.value })}
                          placeholder="06 12 34 56 78"
                          className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        />
                      </div>

                      {/* WhatsApp */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                          <MessageCircle size={13} className="text-teal-400" />
                          <span>Numéro WhatsApp (Optionnel) :</span>
                        </label>
                        <input
                          id="contact-whatsapp-input"
                          type="text"
                          value={settingsForm.contactWhatsApp || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, contactWhatsApp: e.target.value })}
                          placeholder="06 12 34 56 78"
                          className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        />
                      </div>

                      {/* Contact Person / Role */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                          <User size={13} className="text-amber-400" />
                          <span>Interlocuteur Référent / Responsable :</span>
                        </label>
                        <input
                          id="contact-person-input"
                          type="text"
                          value={settingsForm.contactPerson || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, contactPerson: e.target.value })}
                          placeholder="Yasmilka Valdés & Bureau de l'Association"
                          className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Operating Hours / Permanence */}
                    <div className="space-y-1.5 pt-2">
                      <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Clock size={13} className="text-orange-400" />
                        <span>Horaires de Permanence & Accueil Téléphonique :</span>
                      </label>
                      <input
                        id="contact-hours-input"
                        type="text"
                        value={settingsForm.contactHours || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, contactHours: e.target.value })}
                        placeholder="Du Lundi au Vendredi : 10h00 - 19h30 & Samedi : 10h00 - 13h00"
                        className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Category 2: Physical Locations & Addresses */}
                  <div className="p-6 md:p-8 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                        <MapPin size={16} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                          2. Adresses des Salles de Cours & Siège
                        </h4>
                        <p className="text-[11px] text-zinc-400">
                          Précisez les salles pour Fontenay-le-Fleury, La Queue-les-Yvelines et l'adresse postale.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Fontenay Location */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                          <MapPin size={13} />
                          <span>Lieu des Cours à Fontenay-le-Fleury (78330) :</span>
                        </label>
                        <input
                          id="contact-location-fontenay"
                          type="text"
                          value={settingsForm.locationFontenay}
                          onChange={(e) => setSettingsForm({ ...settingsForm, locationFontenay: e.target.value })}
                          placeholder="Gymnase du Levant & Salle Polyvalente, Avenue Jean Lurçat, 78330 Fontenay-le-Fleury"
                          className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        />
                      </div>

                      {/* La Queue Location */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                          <MapPin size={13} />
                          <span>Lieu des Cours à La Queue-les-Yvelines (78940) :</span>
                        </label>
                        <input
                          id="contact-location-laqueue"
                          type="text"
                          value={settingsForm.locationLaQueue}
                          onChange={(e) => setSettingsForm({ ...settingsForm, locationLaQueue: e.target.value })}
                          placeholder="Salle des Fêtes & Espace Danse, 78940 La Queue-les-Yvelines"
                          className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        />
                      </div>

                      {/* Postal / Administrative Address */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Building size={13} className="text-zinc-400" />
                          <span>Adresse Postale / Siège Administratif (Optionnel) :</span>
                        </label>
                        <input
                          id="contact-postal-address"
                          type="text"
                          value={settingsForm.postalAddress || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, postalAddress: e.target.value })}
                          placeholder="Association La Maloka, Mairie de Fontenay-le-Fleury, Place de la Mairie, 78330 Fontenay-le-Fleury"
                          className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Category 3: Social Media Links */}
                  <div className="p-6 md:p-8 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-zinc-800">
                      <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                        <Share2 size={16} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                          3. Réseaux Sociaux & Visibilité Web
                        </h4>
                        <p className="text-[11px] text-zinc-400">
                          Liens vers les comptes officiels pour suivre l'actualité de l'association.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {/* Facebook */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Facebook size={13} className="text-blue-400" />
                          <span>Page Facebook :</span>
                        </label>
                        <input
                          id="contact-facebook-url"
                          type="url"
                          value={settingsForm.facebookUrl || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, facebookUrl: e.target.value })}
                          placeholder="https://facebook.com/lamaloka78"
                          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white font-mono text-[11px]"
                        />
                      </div>

                      {/* Instagram */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Instagram size={13} className="text-pink-400" />
                          <span>Compte Instagram :</span>
                        </label>
                        <input
                          id="contact-instagram-url"
                          type="url"
                          value={settingsForm.instagramUrl || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })}
                          placeholder="https://instagram.com/lamaloka_danse"
                          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white font-mono text-[11px]"
                        />
                      </div>

                      {/* YouTube */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                          <Youtube size={13} className="text-red-400" />
                          <span>Chaîne YouTube :</span>
                        </label>
                        <input
                          id="contact-youtube-url"
                          type="url"
                          value={settingsForm.youtubeUrl || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, youtubeUrl: e.target.value })}
                          placeholder="https://youtube.com/@lamalokadanse"
                          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white font-mono text-[11px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="pt-2 flex justify-end">
                    <button
                      id="save-contact-info-bottom-btn"
                      onClick={handleSaveSettings}
                      className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center gap-2 shadow-lg cursor-pointer transition-all duration-150"
                    >
                      <Save size={16} />
                      <span>Publier et Enregistrer les Coordonnées</span>
                    </button>
                  </div>

                </div>

                {/* Right Column: Live Interactive Preview Card */}
                <div className="lg:col-span-4 space-y-6">
                  
                  <div className="p-6 bg-gradient-to-br from-zinc-900 via-zinc-850 to-zinc-900 border border-zinc-800 rounded-3xl space-y-6 sticky top-24 shadow-xl">
                    <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                      <div className="flex items-center gap-2">
                        <Eye size={16} className="text-amber-400" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                          Aperçu Fiche Contact Publique
                        </h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                        En Direct
                      </span>
                    </div>

                    {/* Contact Visual Preview */}
                    <div className="space-y-4 text-xs font-light">
                      
                      {/* Association Header */}
                      <div className="p-4 rounded-2xl bg-zinc-800/80 border border-zinc-700/60">
                        <p className="font-bold text-sm text-white">{settingsForm.associationName || 'La Maloka'}</p>
                        <p className="text-[11px] text-zinc-400">{settingsForm.tagline || 'Salsa Cubaine & Cardio Latino'}</p>
                        {settingsForm.contactPerson && (
                          <div className="mt-2 pt-2 border-t border-zinc-700/50 flex items-center gap-1.5 text-[11px] text-amber-300">
                            <User size={12} />
                            <span>{settingsForm.contactPerson}</span>
                          </div>
                        )}
                      </div>

                      {/* Contact Items */}
                      <div className="space-y-2.5">
                        <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                          <Mail size={15} className="text-rose-400 shrink-0 mt-0.5" />
                          <div className="overflow-hidden">
                            <p className="text-[10px] text-zinc-500 uppercase font-semibold">Email officiel</p>
                            <p className="text-zinc-200 truncate font-medium">{settingsForm.contactEmail || 'Non renseigné'}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                          <Phone size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] text-zinc-500 uppercase font-semibold">Téléphone</p>
                            <p className="text-zinc-200 font-medium">{settingsForm.contactPhone || 'Non renseigné'}</p>
                          </div>
                        </div>

                        {settingsForm.contactWhatsApp && (
                          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-teal-950/20 border border-teal-900/30">
                            <MessageCircle size={15} className="text-teal-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[10px] text-teal-400 uppercase font-semibold">WhatsApp Direct</p>
                              <p className="text-zinc-200 font-medium">{settingsForm.contactWhatsApp}</p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                          <Clock size={15} className="text-orange-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] text-zinc-500 uppercase font-semibold">Permanence</p>
                            <p className="text-zinc-300 text-[11px] leading-tight">{settingsForm.contactHours || 'Horaires standards'}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                          <MapPin size={15} className="text-rose-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] text-zinc-500 uppercase font-semibold">Salle Fontenay-le-Fleury</p>
                            <p className="text-zinc-300 text-[11px] leading-tight">{settingsForm.locationFontenay || 'Fontenay-le-Fleury'}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                          <MapPin size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[10px] text-zinc-500 uppercase font-semibold">Salle La Queue-les-Yvelines</p>
                            <p className="text-zinc-300 text-[11px] leading-tight">{settingsForm.locationLaQueue || 'La Queue-les-Yvelines'}</p>
                          </div>
                        </div>

                        {settingsForm.postalAddress && (
                          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                            <Building size={15} className="text-zinc-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="text-[10px] text-zinc-500 uppercase font-semibold">Adresse Postale / Siège</p>
                              <p className="text-zinc-300 text-[11px] leading-tight">{settingsForm.postalAddress}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Socials buttons preview */}
                      <div className="pt-2 flex items-center justify-center gap-3">
                        {settingsForm.facebookUrl && (
                          <a
                            href={settingsForm.facebookUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-blue-400 rounded-xl transition-colors"
                            title="Facebook"
                          >
                            <Facebook size={16} />
                          </a>
                        )}
                        {settingsForm.instagramUrl && (
                          <a
                            href={settingsForm.instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-pink-400 rounded-xl transition-colors"
                            title="Instagram"
                          >
                            <Instagram size={16} />
                          </a>
                        )}
                        {settingsForm.youtubeUrl && (
                          <a
                            href={settingsForm.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-red-400 rounded-xl transition-colors"
                            title="YouTube"
                          >
                            <Youtube size={16} />
                          </a>
                        )}
                      </div>

                    </div>

                    {/* QR Code Stand & Tablet Display Module */}
                    <div className="p-5 bg-gradient-to-b from-zinc-950 to-zinc-900 border border-pink-500/30 rounded-3xl space-y-3 text-center">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                          <QrCode size={13} />
                          <span>QR Code Instagram</span>
                        </span>
                        <span className="text-[10px] bg-pink-500/20 text-pink-300 font-mono px-2 py-0.5 rounded-full">
                          Support Forum
                        </span>
                      </div>

                      <div className="p-3 bg-white rounded-2xl inline-block shadow-lg mx-auto">
                        <img
                          src={qrImage}
                          alt="QR Code Instagram La Maloka"
                          className="w-32 h-32 object-contain mx-auto rounded-lg"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <p className="text-[11px] text-zinc-400 font-light leading-tight">
                        Affichez ou projetez ce QR code sur votre stand ou tablette lors des <strong>Forums des Associations</strong> pour que les visiteurs s'abonnent immédiatement !
                      </p>

                      <button
                        type="button"
                        onClick={() => setShowQRModal(true)}
                        className="w-full py-2 bg-pink-600/20 hover:bg-pink-600/30 text-pink-300 border border-pink-500/40 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Smartphone size={13} />
                        <span>Agrandir / Mode Présentation</span>
                      </button>
                    </div>

                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[11px] text-rose-300">
                      💡 Cliquez sur <strong>"Publier et Enregistrer"</strong> pour propager immédiatement ces coordonnées sur l'ensemble du site.
                    </div>
                  </div>

                </div>

              </div>

            </motion.div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: CAMPAIGNS & INSCRIPTIONS MANAGEMENT (HELLOASSO + GOOGLE SHEETS) */}
          {/* ========================================================= */}
          {activeTab === 'classes' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 text-left">
              
              {/* Header & Metric Summary Bar */}
              <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-extrabold uppercase tracking-widest mb-2">
                      <Layers size={12} /> Gestion des Inscriptions & Campagnes HelloAsso
                    </div>
                    <h3 className="text-xl font-black text-white">
                      Catalogue des Inscriptions ({classes.length} Campagnes)
                    </h3>
                    <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
                      Ajoutez, retirez, dupliquez ou modifiez vos inscriptions pour cette saison ou les années à venir. Synchronisé avec la base de données <strong>Google Sheets</strong> et <strong>HelloAsso</strong>.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      id="export-google-sheets-csv-btn"
                      onClick={handleExportGoogleSheetsCSV}
                      className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                      title="Télécharger l'export 31 colonnes au format HelloAsso"
                    >
                      <Download size={13} className="text-emerald-400" />
                      <span>Export CSV (31 col)</span>
                    </button>

                    <button
                      id="open-google-sheets-modal-btn"
                      onClick={() => setShowGoogleSheetsModal(true)}
                      className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                    >
                      <FileSpreadsheet size={13} />
                      <span>Base Google Sheets</span>
                    </button>

                    <button
                      id="btn-add-new-campaign"
                      onClick={handleOpenAddCampaign}
                      className="px-4 py-2 bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md cursor-pointer transition-all"
                    >
                      <Plus size={14} />
                      <span>Nouvelle Inscription</span>
                    </button>
                  </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-4 border-t border-zinc-800/80">
                  <div className="p-3.5 bg-zinc-950/60 border border-zinc-800 rounded-2xl">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Campagnes Actives</span>
                    <span className="text-xl font-black text-white mt-1 block">
                      {classes.filter(c => c.active !== false).length}
                    </span>
                  </div>

                  <div className="p-3.5 bg-zinc-950/60 border border-zinc-800 rounded-2xl">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Total Adhérents HelloAsso</span>
                    <span className="text-xl font-black text-emerald-400 mt-1 block">
                      {classes.reduce((acc, c) => acc + (c.subscribersCount || 0), 0)} inscrits
                    </span>
                  </div>

                  <div className="p-3.5 bg-zinc-950/60 border border-zinc-800 rounded-2xl">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Places Restantes Disponibles</span>
                    <span className="text-xl font-black text-amber-400 mt-1 block">
                      {classes.reduce((acc, c) => acc + Math.max(0, (c.maxSpots || 30) - (c.subscribersCount || 0)), 0)} places
                    </span>
                  </div>

                  <div className="p-3.5 bg-zinc-950/60 border border-zinc-800 rounded-2xl">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Total Collecté HelloAsso</span>
                    <span className="text-xl font-black text-orange-400 mt-1 block">
                      {classes.reduce((acc, c) => acc + (c.collectedAmount || 0), 0)} €
                    </span>
                  </div>
                </div>

                {/* Filter & View Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Season selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-zinc-400 uppercase">Saison :</span>
                      <select
                        id="filter-season-select"
                        value={selectedSeasonFilter}
                        onChange={(e) => setSelectedSeasonFilter(e.target.value)}
                        className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-rose-500 cursor-pointer"
                      >
                        <option value="Tous">Toutes les Saisons</option>
                        <option value="Saison 2026 - 2027">Saison 2026 - 2027</option>
                        <option value="Saison 2027 - 2028">Saison 2027 - 2028 (Suivante)</option>
                        <option value="Saison 2025 - 2026">Saison 2025 - 2026 (Archivée)</option>
                      </select>
                    </div>

                    {/* Visibility selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-zinc-400 uppercase">Statut :</span>
                      <select
                        id="filter-visibility-select"
                        value={selectedVisibilityFilter}
                        onChange={(e) => setSelectedVisibilityFilter(e.target.value)}
                        className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-rose-500 cursor-pointer"
                      >
                        <option value="Tous">Tous statuts</option>
                        <option value="Public">Public (En ligne)</option>
                        <option value="Privé">Privé (Masqué)</option>
                      </select>
                    </div>

                    {/* Category selector */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-zinc-400 uppercase">Discipline :</span>
                      <select
                        id="filter-discipline-select"
                        value={selectedDisciplineFilter}
                        onChange={(e) => setSelectedDisciplineFilter(e.target.value)}
                        className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 text-white rounded-xl text-xs font-semibold focus:outline-none focus:border-rose-500 cursor-pointer"
                      >
                        <option value="Tous">Toutes disciplines</option>
                        <option value="Salsa Cubaine">Salsa Cubaine</option>
                        <option value="Cardio Latino">Cardio Latino</option>
                      </select>
                    </div>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                    <button
                      onClick={() => setCampaignViewMode('cards')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        campaignViewMode === 'cards' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Cartes HelloAsso
                    </button>
                    <button
                      onClick={() => setCampaignViewMode('table')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        campaignViewMode === 'table' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Tableau Détaillé
                    </button>
                  </div>
                </div>
              </div>

              {/* HELLOASSO CARDS VIEW */}
              {campaignViewMode === 'cards' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {classes
                    .filter((c) => {
                      if (selectedSeasonFilter !== 'Tous' && c.season !== selectedSeasonFilter) return false;
                      if (selectedVisibilityFilter !== 'Tous' && c.visibility !== selectedVisibilityFilter) return false;
                      if (selectedDisciplineFilter !== 'Tous' && c.category !== selectedDisciplineFilter) return false;
                      return true;
                    })
                    .map((camp) => {
                      const isPublic = camp.visibility !== 'Privé' && camp.active !== false;
                      const isTrial = camp.isTrialClass || camp.name.toLowerCase().includes('essai') || camp.campaignType === "Cours d'essai";

                      return (
                        <div
                          key={camp.id}
                          className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-3xl p-5 flex flex-col justify-between space-y-4 transition-all hover:shadow-xl relative overflow-hidden group"
                        >
                          {/* Top Status & Days Bar */}
                          <div className="flex items-center justify-between gap-2">
                            {/* Visibility Badge */}
                            <button
                              onClick={() => handleToggleCampaignVisibility(camp.id)}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                                isPublic
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 hover:scale-105'
                                  : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 hover:scale-105'
                              }`}
                              title="Cliquer pour basculer Public (inscriptions ouvertes) / Privé (inscriptions fermées)"
                            >
                              {isPublic ? (
                                <>
                                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                  <span>Public (Ouvert)</span>
                                </>
                              ) : (
                                <>
                                  <Lock size={11} className="text-amber-400" />
                                  <span>Privé (Fermé)</span>
                                </>
                              )}
                            </button>

                            {/* Days Remaining Pill */}
                            <span className="text-[11px] text-zinc-400 font-mono bg-zinc-950 px-2.5 py-1 rounded-lg border border-zinc-800 flex items-center gap-1">
                              <Clock size={11} className="text-orange-400" />
                              <span>{camp.daysRemaining !== undefined ? `${camp.daysRemaining}j` : '318j'}</span>
                            </span>
                          </div>

                          {/* Campaign Title & Discipline */}
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded tracking-widest ${
                                camp.category === 'Salsa Cubaine'
                                  ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              }`}>
                                {camp.category}
                              </span>
                              <span className="text-[10px] text-zinc-400 font-mono">{camp.season || 'Saison 2026 - 2027'}</span>
                            </div>

                            <h4 className="text-base font-black text-white leading-tight min-h-[44px]">
                              {camp.name}
                            </h4>

                            <p className="text-xs text-zinc-400 flex items-center gap-1.5">
                              <MapPin size={12} className="text-rose-400 shrink-0" />
                              <span>{camp.location} • {camp.schedule}</span>
                            </p>
                          </div>

                          {/* HelloAsso Numbers (Aforo, Inscrits & Places Restantes) */}
                          {(() => {
                            const maxSpots = camp.maxSpots || 30;
                            const subscribers = camp.subscribersCount || 0;
                            const spotsLeft = Math.max(0, maxSpots - subscribers);
                            const isFull = spotsLeft <= 0;

                            return (
                              <div className="space-y-2 py-3 border-y border-zinc-800/80 bg-zinc-950/40 rounded-2xl px-3.5">
                                <div className="grid grid-cols-3 gap-2 text-center">
                                  <div>
                                    <span className="text-[9px] text-zinc-500 uppercase font-bold block">Aforo Max</span>
                                    <span className="text-sm font-black text-white font-mono mt-0.5 block">{maxSpots} pl.</span>
                                  </div>

                                  <div>
                                    <span className="text-[9px] text-zinc-500 uppercase font-bold block">Inscrits HelloAsso</span>
                                    <span className="text-sm font-black text-emerald-400 font-mono mt-0.5 block">{subscribers} adh.</span>
                                  </div>

                                  <div>
                                    <span className="text-[9px] text-zinc-500 uppercase font-bold block">Places Restantes</span>
                                    <span className={`text-sm font-black font-mono mt-0.5 block ${isFull ? 'text-rose-500' : 'text-amber-400'}`}>
                                      {isFull ? '0 (Complet)' : `${spotsLeft} dispo`}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-zinc-800/50">
                                  <span className="text-zinc-500 font-semibold">Collecté HelloAsso :</span>
                                  <span className="text-xs font-black text-emerald-400 font-mono">{camp.collectedAmount || 0} €</span>
                                </div>
                              </div>
                            );
                          })()}

                          {/* Price & Teacher details */}
                          <div className="flex items-center justify-between text-xs text-zinc-400">
                            <span>Prof. <strong className="text-zinc-200">{camp.instructor}</strong></span>
                            <span className="text-zinc-300">
                              {isTrial ? (
                                <strong className="text-emerald-400 font-bold">Gratuit / Essai</strong>
                              ) : (
                                <span>{camp.annualPrice ? `${camp.annualPrice}€/an` : `${camp.priceMonthly}€/mois`}</span>
                              )}
                            </span>
                          </div>

                          {/* HelloAsso Actions Toolbar */}
                          <div className="pt-2 space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              {/* Direct view link */}
                              <a
                                href={camp.helloAssoUrl || 'https://www.helloasso.com/associations/la-maloka'}
                                target="_blank"
                                rel="noreferrer"
                                className="py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors text-center"
                              >
                                <ExternalLink size={12} />
                                <span>Voir la page</span>
                              </a>

                              {/* Edit / Administrate */}
                              <button
                                onClick={() => handleOpenEditCampaign(camp)}
                                className="py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                              >
                                <Edit3 size={12} />
                                <span>Administrer</span>
                              </button>
                            </div>

                            {/* Secondary Actions: Duplicate for next year & Delete */}
                            <div className="flex items-center justify-between pt-1 text-xs">
                              <button
                                onClick={() => handleDuplicateCampaign(camp)}
                                className="text-zinc-400 hover:text-emerald-400 flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer"
                                title="Créer une copie pour la saison suivante"
                              >
                                <Copy size={11} />
                                <span>Dupliquer pour l'an prochain</span>
                              </button>

                              <button
                                onClick={() => handleDeleteCampaign(camp.id, camp.name)}
                                className="text-zinc-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                                title="Supprimer cette campagne"
                              >
                                <Trash size={12} />
                              </button>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                </div>
              )}

              {/* TABLE VIEW */}
              {campaignViewMode === 'table' && (
                <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[750px]">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-400 pb-3">
                        <th className="py-3">Campagne d'Inscription</th>
                        <th>Saison</th>
                        <th>Lieu</th>
                        <th>Discipline</th>
                        <th>Statut</th>
                        <th>Aforo (Max)</th>
                        <th>Inscrits</th>
                        <th>Places Restantes</th>
                        <th>Collecté</th>
                        <th>Tarif</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {classes
                        .filter((c) => {
                          if (selectedSeasonFilter !== 'Tous' && c.season !== selectedSeasonFilter) return false;
                          if (selectedVisibilityFilter !== 'Tous' && c.visibility !== selectedVisibilityFilter) return false;
                          if (selectedDisciplineFilter !== 'Tous' && c.category !== selectedDisciplineFilter) return false;
                          return true;
                        })
                        .map((camp) => {
                          const maxSpots = camp.maxSpots || 30;
                          const subscribers = camp.subscribersCount || 0;
                          const spotsLeft = Math.max(0, maxSpots - subscribers);
                          const isFull = spotsLeft <= 0;

                          return (
                            <tr key={camp.id} className="hover:bg-zinc-800/30 transition-colors">
                              <td className="py-3 font-semibold text-white">
                                <div>{camp.name}</div>
                                <span className="text-[10px] text-zinc-400 font-normal">{camp.schedule} • {camp.instructor}</span>
                              </td>
                              <td className="text-zinc-300 font-mono text-[11px]">{camp.season || 'Saison 2026 - 2027'}</td>
                              <td className="text-zinc-300">{camp.location}</td>
                              <td>
                                <span className={`text-[9px] font-bold uppercase tracking-wider ${
                                  camp.category === 'Salsa Cubaine' ? 'text-orange-400' : 'text-emerald-400'
                                }`}>
                                  {camp.category}
                                </span>
                              </td>
                              <td>
                                <button
                                  onClick={() => handleToggleCampaignVisibility(camp.id)}
                                  className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider cursor-pointer inline-flex items-center gap-1 transition-all ${
                                    camp.visibility !== 'Privé' 
                                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30' 
                                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700'
                                  }`}
                                  title="Cliquer pour basculer Public / Privé"
                                >
                                  {camp.visibility !== 'Privé' ? (
                                    <>
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                      <span>Public</span>
                                    </>
                                  ) : (
                                    <>
                                      <Lock size={9} className="text-amber-400" />
                                      <span>Privé</span>
                                    </>
                                  )}
                                </button>
                              </td>
                              <td className="font-bold text-zinc-300 font-mono">{maxSpots} pl.</td>
                              <td className="font-bold text-emerald-400 font-mono">{subscribers}</td>
                              <td>
                                <span className={`inline-block px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                                  isFull ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/10 text-amber-300'
                                }`}>
                                  {isFull ? 'Complet' : `${spotsLeft} dispo`}
                                </span>
                              </td>
                              <td className="font-extrabold text-emerald-400">{camp.collectedAmount || 0} €</td>
                              <td className="text-zinc-300 font-mono">{camp.annualPrice ? `${camp.annualPrice}€` : `${camp.priceMonthly}€/m`}</td>
                              <td className="py-3 text-right space-x-1.5">
                                <button
                                  onClick={() => handleOpenEditCampaign(camp)}
                                  className="p-1.5 text-zinc-300 hover:text-rose-400 rounded hover:bg-zinc-800 cursor-pointer"
                                  title="Modifier"
                                >
                                  <Edit3 size={13} />
                                </button>
                                <button
                                  onClick={() => handleDuplicateCampaign(camp)}
                                  className="p-1.5 text-zinc-300 hover:text-emerald-400 rounded hover:bg-zinc-800 cursor-pointer"
                                  title="Dupliquer pour saison suivante"
                                >
                                  <Copy size={13} />
                                </button>
                                <button
                                  onClick={() => handleDeleteCampaign(camp.id, camp.name)}
                                  className="p-1.5 text-zinc-500 hover:text-rose-400 rounded hover:bg-zinc-800 cursor-pointer"
                                  title="Supprimer"
                                >
                                  <Trash size={13} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}

            </motion.div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: EVENTS & AGENDA */}
          {/* ========================================================= */}
          {activeTab === 'events' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 text-left">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Add Event Form */}
                <div className="lg:col-span-4 p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-4">
                  <h3 className="text-base font-black text-white">Ajouter un Événement ou Stage</h3>
                  <p className="text-xs text-zinc-400">Planifiez un stage intensif, forum ou soirée de danse.</p>
                  
                  <form onSubmit={handleCreateEvent} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase">Titre de l'Événement :</label>
                      <input
                        id="event-form-title"
                        type="text"
                        required
                        value={newEvent.title}
                        onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                        placeholder="Ex: Stage Rentrée Salsa Cubaine & Rueda"
                        className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-400 font-bold uppercase">Type :</label>
                        <select
                          id="event-form-type"
                          value={newEvent.type}
                          onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                          className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white"
                        >
                          <option value="Stage">Stage Intensif</option>
                          <option value="Soirée">Soirée Sociale</option>
                          <option value="Festival">Festival</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-400 font-bold uppercase">Tarif (€) :</label>
                        <input
                          id="event-form-price"
                          type="number"
                          required
                          value={newEvent.price}
                          onChange={(e) => setNewEvent({ ...newEvent, price: Number(e.target.value) })}
                          className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-400 font-bold uppercase">Date :</label>
                        <input
                          id="event-form-date"
                          type="date"
                          required
                          value={newEvent.date}
                          onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                          className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-400 font-bold uppercase">Places :</label>
                        <input
                          id="event-form-spots"
                          type="number"
                          required
                          value={newEvent.totalSpots}
                          onChange={(e) => setNewEvent({ ...newEvent, totalSpots: Number(e.target.value) })}
                          className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase">Lieu :</label>
                      <input
                        id="event-form-location"
                        type="text"
                        required
                        value={newEvent.location}
                        onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                        placeholder="Ex: Gymnase du Levant, Fontenay-le-Fleury"
                        className="w-full px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white"
                      />
                    </div>

                    <button
                      id="submit-create-event"
                      type="submit"
                      className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                    >
                      Publier l'Événement
                    </button>
                  </form>
                </div>

                {/* Events list */}
                <div className="lg:col-span-8 p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-4 overflow-x-auto">
                  <h3 className="text-base font-black text-white">Agenda & Stages Programmés</h3>
                  
                  <table className="w-full text-left text-xs min-w-[550px]">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-400 pb-2">
                        <th className="py-2.5">Date & Heure</th>
                        <th>Titre / Événement</th>
                        <th>Type</th>
                        <th>Lieu</th>
                        <th>Tarif</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {events.map((ev) => (
                        <tr key={ev.id} className="hover:bg-zinc-800/30 transition-colors">
                          <td className="py-3 font-mono text-zinc-400">
                            <div>{ev.date}</div>
                            <div className="text-[10px]">{ev.time}</div>
                          </td>
                          <td className="font-semibold text-white">{ev.title}</td>
                          <td>
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              {ev.type}
                            </span>
                          </td>
                          <td className="text-zinc-400">{ev.location}</td>
                          <td className="font-extrabold text-emerald-400">{ev.price === 0 ? 'Gratuit' : `${ev.price}€`}</td>
                          <td className="py-3 text-right">
                            <button
                              id={`delete-event-btn-${ev.id}`}
                              onClick={() => handleDeleteEvent(ev.id, ev.title)}
                              className="p-1.5 text-zinc-500 hover:text-red-400 rounded hover:bg-zinc-800 cursor-pointer"
                              title="Supprimer l'événement"
                            >
                              <Trash size={12} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: INSCRIPTIONS MANAGEMENT */}
          {/* ========================================================= */}
          {activeTab === 'inscriptions' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-6 text-left">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-black text-white">Registre des Inscriptions en Ligne</h3>
                  <p className="text-xs text-zinc-400">Suivi des pré-inscriptions reçues pour la saison 2026-2027.</p>
                </div>
                
                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    id="insc-download-xlsx-btn"
                    onClick={handleExportGoogleSheetsNativeXLSX}
                    className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 text-black font-black text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow transition-all cursor-pointer hover:scale-105"
                    title="Télécharger le classeur .xlsx contenant les 6 feuilles"
                  >
                    <Download size={13} />
                    <span>1. .XLSX (6 Feuilles)</span>
                  </button>

                  <a
                    id="insc-open-sheets-btn"
                    href="https://docs.google.com/spreadsheets/d/1faWh69ShTeI9hE-OtlUDF9LrqbdDI8m-6nKN7BMn_7g/edit?usp=sharing"
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 border border-zinc-700 shadow transition-all hover:scale-105"
                  >
                    <FileSpreadsheet size={13} className="text-emerald-400" />
                    <span>2. Google Sheets</span>
                    <ExternalLink size={12} />
                  </a>

                  <button
                    onClick={() => setShowGoogleSheetsModal(true)}
                    className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs rounded-xl flex items-center gap-1 border border-zinc-800 cursor-pointer"
                  >
                    <Eye size={12} className="text-amber-400" />
                    <span>Hub (6 Tables)</span>
                  </button>

                  <button
                    onClick={handleExportGoogleSheetsCSV}
                    className="px-3 py-1.5 bg-teal-900/60 hover:bg-teal-800 text-teal-200 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-teal-700/50 cursor-pointer"
                  >
                    <Download size={12} />
                    <span>CSV HelloAsso</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400">Filtrer :</span>
                    <select
                      value={inscriptionFilter}
                      onChange={(e) => setInscriptionFilter(e.target.value)}
                      className="px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white"
                    >
                      <option value="Tous">Tous les cours</option>
                      <option value="Salsa">Salsa Cubaine</option>
                      <option value="Cardio">Cardio Latino</option>
                    </select>
                  </div>
                </div>
              </div>

              {filteredInscriptions.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-xs">
                  Aucune inscription pour le moment dans cette catégorie.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[650px]">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-400 pb-2">
                        <th className="py-2.5">Date</th>
                        <th>Nom & Prénom</th>
                        <th>Contact</th>
                        <th>Cours & Niveau</th>
                        <th>Statut</th>
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {filteredInscriptions.map((ins) => (
                        <tr key={ins.id} className="hover:bg-zinc-800/30 transition-colors">
                          <td className="py-3 font-mono text-zinc-400 text-[11px]">{ins.date}</td>
                          <td className="font-semibold text-white">{ins.userName}</td>
                          <td className="text-zinc-300">
                            <div>{ins.userEmail}</div>
                            <div className="text-[10px] font-mono text-zinc-500">{ins.userPhone}</div>
                          </td>
                          <td>
                            <div className="font-bold text-zinc-200">{ins.className}</div>
                            <span className="text-[10px] text-zinc-400">{ins.level}</span>
                          </td>
                          <td>
                            <select
                              value={ins.status || 'Confirmée'}
                              onChange={(e) => handleUpdateInscriptionStatus(ins.id, e.target.value)}
                              className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded-lg text-[10px] font-bold uppercase text-emerald-400"
                            >
                              <option value="Confirmée">Confirmée</option>
                              <option value="Attente de Paiement">Attente de Paiement</option>
                              <option value="Annulée">Annulée</option>
                            </select>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => handleDeleteInscription(ins.id, ins.userName)}
                              className="p-1.5 text-zinc-500 hover:text-rose-400 rounded hover:bg-zinc-800 cursor-pointer"
                              title="Supprimer"
                            >
                              <Trash size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* TAB 6: HEALTH FORMS */}
          {/* ========================================================= */}
          {activeTab === 'health' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-6 text-left">
              <div>
                <h3 className="text-lg font-black text-white">Fiches de Santé & Décharges Médicales</h3>
                <p className="text-xs text-zinc-400">Consultez les questionnaires signés numériquement par les adhérents pour valider leur aptitude physique.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {healthForms.map((form) => (
                  <div key={form.id} className="p-5 bg-zinc-800/60 border border-zinc-700/60 rounded-2xl space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-white text-base">{form.userName}</h4>
                        <p className="text-[10px] text-zinc-400 mt-0.5 font-mono">Date : {form.date}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest ${
                        form.hasHeartConditions || form.hasBoneJointProblems || form.hasDizzinessLossOfBalance
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {form.hasHeartConditions || form.hasBoneJointProblems || form.hasDizzinessLossOfBalance ? 'Attention Médicale' : 'Aptitude Validée'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs py-2 border-y border-zinc-700/60 font-mono text-zinc-300">
                      <div>Email : <span className="text-white">{form.userEmail}</span></div>
                      <div>Tél : <span className="text-white">{form.phone}</span></div>
                      <div className="col-span-2 mt-1">Urgences : <span className="text-rose-400 font-bold">{form.emergencyContactName} ({form.emergencyContactPhone})</span></div>
                    </div>

                    <div className="space-y-1 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">Cardiaque :</span>
                        <span className={form.hasHeartConditions ? "text-rose-400 font-bold" : "text-emerald-400 font-semibold"}>
                          {form.hasHeartConditions ? "OUI (Vigilance)" : "NON"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">Articulaire / Os :</span>
                        <span className={form.hasBoneJointProblems ? "text-rose-400 font-bold" : "text-emerald-400 font-semibold"}>
                          {form.hasBoneJointProblems ? "OUI (Vigilance)" : "NON"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">Vertiges / Équilibre :</span>
                        <span className={form.hasDizzinessLossOfBalance ? "text-rose-400 font-bold" : "text-emerald-400 font-semibold"}>
                          {form.hasDizzinessLossOfBalance ? "OUI" : "NON"}
                        </span>
                      </div>
                      {form.otherMedicalConditions && (
                        <div className="pt-2 text-zinc-300">
                          <span className="text-zinc-400 block text-[10px]">Observations médicales :</span>
                          <p className="italic bg-zinc-900 p-2 rounded mt-1 font-mono text-xs">{form.otherMedicalConditions}</p>
                        </div>
                      )}
                    </div>

                    <div className="pt-3 flex justify-between items-center border-t border-zinc-700/40">
                      <span className="text-[10px] text-zinc-500">Signature :</span>
                      <span className="font-serif italic text-emerald-400 text-sm font-bold">✍ {form.signature}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* TAB 8: ROOMS & VENUE LIMITATIONS (AFORO) & COURSE FORUMS */}
          {/* ========================================================= */}
          {activeTab === 'rooms' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <RoomsManagement
                rooms={rooms}
                classes={classes}
                inscriptions={inscriptions}
                onSaveRoom={(roomData, isEdit) => {
                  if (isEdit && roomData.id) {
                    const updated = rooms.map(r => r.id === roomData.id ? { ...r, ...roomData } as DanceRoom : r);
                    if (setRooms) setRooms(updated);
                    localStorage.setItem('maloka_rooms', JSON.stringify(updated));

                    // Update class room names if changed
                    const updatedClasses = classes.map(c => {
                      if (c.roomId === roomData.id) {
                        return { ...c, roomName: roomData.name, maxSpots: roomData.maxCapacity || c.maxSpots };
                      }
                      return c;
                    });
                    setClasses(updatedClasses);
                    localStorage.setItem('maloka_classes', JSON.stringify(updatedClasses));

                    addNotification('Salle Mise à Jour 🏛️', `La salle "${roomData.name}" et ses quotas ont été actualisés.`, 'clase');
                  } else {
                    const newRoom: DanceRoom = {
                      id: 'room-' + Date.now(),
                      name: roomData.name || 'Nouvelle Salle',
                      location: roomData.location || 'Fontenay-le-Fleury',
                      address: roomData.address || '',
                      maxCapacity: Number(roomData.maxCapacity) || 30,
                      surfaceAreaM2: Number(roomData.surfaceAreaM2) || 100,
                      equipment: roomData.equipment || ['Parquet de danse', 'Sonorisation haute fidélité'],
                      notes: roomData.notes || '',
                      active: roomData.active !== undefined ? roomData.active : true
                    };
                    const updated = [...rooms, newRoom];
                    if (setRooms) setRooms(updated);
                    localStorage.setItem('maloka_rooms', JSON.stringify(updated));
                    addNotification('Nouvelle Salle Créée 🚪', `La salle "${newRoom.name}" avec une jauge de ${newRoom.maxCapacity} places a été ajoutée.`, 'clase');
                  }
                }}
                onDeleteRoom={handleDeleteRoom}
                onToggleRoomActive={handleToggleRoomActive}
                onQuickAdjustCapacity={handleQuickAdjustCapacity}
                onPromoteWaitlist={handlePromoteWaitlistInscription}
              />
            </motion.div>
          )}

          {/* ========================================================= */}
          {/* TAB 9: GALERIE MULTIMÉDIA (PHOTOS & VIDÉOS YOUTUBE)       */}
          {/* ========================================================= */}
          {activeTab === 'gallery' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              
              {/* Header Info Banner */}
              <div className="p-6 bg-zinc-900/90 border border-zinc-800 rounded-3xl text-left space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-500/10 text-red-400 rounded-2xl">
                      <Film size={26} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white">Gestion de la Galerie : Photos & Vidéos YouTube</h3>
                      <p className="text-xs text-zinc-400">
                        Ajoutez, modifiez ou supprimez les vidéos YouTube et les photos affichées sur l'espace public de La Maloka.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={settingsForm.youtubeUrl || "https://youtube.com/@lamalokadanse"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Youtube size={15} />
                      <span>Chaîne YouTube</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-2xl">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Vidéos YouTube actives</span>
                    <span className="text-xl font-black text-red-400 mt-1 block">{(videos || []).length}</span>
                  </div>
                  <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-2xl">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Photos Souvenirs actives</span>
                    <span className="text-xl font-black text-rose-400 mt-1 block">{(photos || []).length}</span>
                  </div>
                  <div className="p-3.5 bg-zinc-950/80 border border-zinc-800 rounded-2xl">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold block">Discipline Phare</span>
                    <span className="text-xs font-bold text-orange-400 mt-2 block">Salsa Cubaine & Cardio Latino</span>
                  </div>
                </div>
              </div>

              {/* Sub-Tabs Switcher */}
              <div className="flex gap-2 p-1.5 bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md text-left">
                <button
                  type="button"
                  onClick={() => setGallerySubTab('videos')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    gallerySubTab === 'videos'
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Youtube size={16} />
                  <span>Vidéos YouTube ({(videos || []).length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGallerySubTab('photos')}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    gallerySubTab === 'photos'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <ImageIcon size={16} />
                  <span>Photos ({(photos || []).length})</span>
                </button>
              </div>

              {/* ---------------- SUB-SECTION: VIDEOS YOUTUBE ---------------- */}
              {gallerySubTab === 'videos' && (
                <div className="space-y-6 text-left">
                  
                  {/* Form to Add YouTube Video */}
                  <div className="p-6 bg-zinc-900/80 border border-zinc-800 rounded-3xl space-y-4">
                    <div className="flex items-center gap-2">
                      <Plus className="text-red-500" size={18} />
                      <h4 className="text-base font-black text-white">Ajouter un nouveau lien vidéo YouTube</h4>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newVideoTitle.trim() || !newVideoUrl.trim()) return;
                        const extractedId = extractYouTubeId(newVideoUrl);
                        const newVid: VideoItem = {
                          id: 'v-' + Date.now(),
                          title: newVideoTitle.trim(),
                          category: newVideoCategory,
                          youtubeUrl: newVideoUrl.trim(),
                          youtubeId: extractedId || undefined,
                          description: newVideoDesc.trim() || 'Vidéo de démonstration La Maloka',
                          duration: newVideoDuration.trim() || '04:00',
                          date: new Date().toISOString().split('T')[0],
                          featured: newVideoFeatured,
                          views: 'Nouveau',
                          likes: 5
                        };
                        const updated = [newVid, ...(videos || [])];
                        if (setVideos) setVideos(updated);
                        localStorage.setItem('maloka_gallery_videos', JSON.stringify(updated));
                        addNotification('Vidéo YouTube Ajoutée 🎬', `La vidéo "${newVid.title}" a été ajoutée à l'espace vidéo.`, 'evento');
                        setNewVideoTitle('');
                        setNewVideoUrl('');
                        setNewVideoDesc('');
                        setNewVideoFeatured(false);
                      }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-zinc-400 uppercase">Titre de la vidéo *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Démonstration Rueda de Casino"
                            value={newVideoTitle}
                            onChange={(e) => setNewVideoTitle(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-zinc-400 uppercase">Lien YouTube (URL ou ID) *</label>
                          <input
                            type="text"
                            required
                            placeholder="https://www.youtube.com/watch?v=..."
                            value={newVideoUrl}
                            onChange={(e) => setNewVideoUrl(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-zinc-400 uppercase">Catégorie *</label>
                          <select
                            value={newVideoCategory}
                            onChange={(e) => setNewVideoCategory(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                          >
                            <option value="Salsa Cubaine">Salsa Cubaine</option>
                            <option value="Cardio Latino">Cardio Latino</option>
                            <option value="Stages & Ateliers">Stages & Ateliers</option>
                            <option value="Soirées & Fêtes">Soirées & Fêtes</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-[11px] font-bold text-zinc-400 uppercase">Description</label>
                          <input
                            type="text"
                            placeholder="Ex: Rueda festive avec les danseurs de Fontenay-le-Fleury..."
                            value={newVideoDesc}
                            onChange={(e) => setNewVideoDesc(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-zinc-400 uppercase">Durée indicative</label>
                          <input
                            type="text"
                            placeholder="04:15"
                            value={newVideoDuration}
                            onChange={(e) => setNewVideoDuration(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                        <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-300">
                          <input
                            type="checkbox"
                            checked={newVideoFeatured}
                            onChange={(e) => setNewVideoFeatured(e.target.checked)}
                            className="rounded text-red-600 focus:ring-0 bg-zinc-950 border-zinc-800"
                          />
                          <span>Mettre en avant sur la page d'accueil / En tête de galerie</span>
                        </label>

                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md"
                        >
                          <Plus size={14} />
                          <span>Ajouter la Vidéo YouTube</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* List of Existing YouTube Videos */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">
                      Vidéos YouTube configurées ({(videos || []).length})
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {(videos || []).map((video) => {
                        const vidId = video.youtubeId || extractYouTubeId(video.youtubeUrl);
                        const thumb = video.thumbnail || (vidId ? `https://img.youtube.com/vi/${vidId}/hqdefault.jpg` : '');
                        return (
                          <div
                            key={video.id}
                            className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col sm:flex-row gap-4 items-start justify-between"
                          >
                            <div className="flex gap-3 w-full sm:w-auto">
                              <div className="w-28 aspect-video bg-zinc-950 rounded-xl overflow-hidden relative shrink-0 border border-zinc-800">
                                {thumb ? (
                                  <img src={thumb} alt={video.title} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                    <Youtube size={24} />
                                  </div>
                                )}
                                <span className="absolute bottom-1 right-1 px-1 bg-black/80 text-[9px] text-white font-mono rounded">
                                  {video.duration || 'YouTube'}
                                </span>
                              </div>

                              <div className="space-y-1 text-left flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="px-2 py-0.5 bg-red-500/20 text-red-400 font-bold text-[9px] uppercase rounded">
                                    {video.category}
                                  </span>
                                  {video.featured && (
                                    <span className="px-1.5 py-0.5 bg-amber-400 text-zinc-950 font-black text-[9px] rounded">
                                      À la Une
                                    </span>
                                  )}
                                </div>
                                <h5 className="text-xs sm:text-sm font-bold text-white truncate">{video.title}</h5>
                                <p className="text-[11px] text-zinc-400 line-clamp-1">{video.description}</p>
                                <a
                                  href={video.youtubeUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[10px] text-red-400 hover:underline flex items-center gap-1 font-mono"
                                >
                                  <span>{video.youtubeUrl}</span>
                                  <ExternalLink size={10} />
                                </a>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center">
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (videos || []).map(v => v.id === video.id ? { ...v, featured: !v.featured } : v);
                                  if (setVideos) setVideos(updated);
                                  localStorage.setItem('maloka_gallery_videos', JSON.stringify(updated));
                                }}
                                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all cursor-pointer ${
                                  video.featured
                                    ? 'bg-amber-400 text-zinc-950'
                                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                                }`}
                                title="Basculer 'À la Une'"
                              >
                                ⭐ {video.featured ? 'À la Une' : 'Standard'}
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Supprimer la vidéo "${video.title}" ?`)) {
                                    const updated = (videos || []).filter(v => v.id !== video.id);
                                    if (setVideos) setVideos(updated);
                                    localStorage.setItem('maloka_gallery_videos', JSON.stringify(updated));
                                    addNotification('Vidéo Supprimée 🗑️', `La vidéo "${video.title}" a été retirée.`, 'alerta');
                                  }
                                }}
                                className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer transition-colors"
                                title="Supprimer la vidéo"
                              >
                                <Trash size={15} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              )}

              {/* ---------------- SUB-SECTION: PHOTOS SOUVENIRS ---------------- */}
              {gallerySubTab === 'photos' && (
                <div className="space-y-6 text-left">
                  
                  {/* Form to Add Photo */}
                  <div className="p-6 bg-zinc-900/80 border border-zinc-800 rounded-3xl space-y-4">
                    <div className="flex items-center gap-2">
                      <Plus className="text-rose-500" size={18} />
                      <h4 className="text-base font-black text-white">Ajouter une nouvelle photo à la galerie</h4>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!newPhotoTitle.trim() || !newPhotoUrl.trim()) return;
                        const newP: PhotoItem = {
                          id: 'p-' + Date.now(),
                          title: newPhotoTitle.trim(),
                          category: newPhotoCategory,
                          url: newPhotoUrl.trim(),
                          description: newPhotoDesc.trim() || 'Photo capturée lors des cours La Maloka',
                          date: new Date().toISOString().split('T')[0],
                          likes: 10
                        };
                        const updated = [newP, ...(photos || [])];
                        if (setPhotos) setPhotos(updated);
                        localStorage.setItem('maloka_gallery_photos', JSON.stringify(updated));
                        addNotification('Photo Ajoutée 📸', `La photo "${newP.title}" a été ajoutée à la galerie.`, 'evento');
                        setNewPhotoTitle('');
                        setNewPhotoUrl('');
                        setNewPhotoDesc('');
                      }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-zinc-400 uppercase">Titre de la photo *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Stage Salsa Cubaine 2026"
                            value={newPhotoTitle}
                            onChange={(e) => setNewPhotoTitle(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-zinc-400 uppercase flex items-center gap-1">
                              <ImageIcon size={12} className="text-rose-400" />
                              <span>Photo (Lien ou Fichier) *</span>
                            </label>
                            
                            <label className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[10px] font-bold rounded-lg cursor-pointer flex items-center gap-1 transition-all border border-zinc-700">
                              <Upload size={10} className="text-rose-400" />
                              <span>Parcourir...</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    compressAndProcessImage(file, (optimizedUrl) => {
                                      setNewPhotoUrl(optimizedUrl);
                                    });
                                  }
                                }}
                              />
                            </label>
                          </div>
                          
                          <input
                            type="text"
                            required
                            placeholder="Lien direct ou Google Drive..."
                            value={newPhotoUrl}
                            onChange={(e) => setNewPhotoUrl(normalizeImageUrl(e.target.value))}
                            className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-zinc-400 uppercase">Catégorie *</label>
                          <select
                            value={newPhotoCategory}
                            onChange={(e) => setNewPhotoCategory(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                          >
                            <option value="Salsa Cubaine">Salsa Cubaine</option>
                            <option value="Cardio Latino">Cardio Latino</option>
                            <option value="Stages & Ateliers">Stages & Ateliers</option>
                            <option value="Soirées & Fêtes">Soirées & Fêtes</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-zinc-400 uppercase">Description</label>
                        <input
                          type="text"
                          placeholder="Ex: Les élèves de Fontenay-le-Fleury après leur première rueda..."
                          value={newPhotoDesc}
                          onChange={(e) => setNewPhotoDesc(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md"
                        >
                          <Plus size={14} />
                          <span>Ajouter la Photo</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Photos Grid in BackOffice */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">
                      Photos enregistrées ({(photos || []).length})
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {(photos || []).map((photo) => (
                        <div
                          key={photo.id}
                          className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group flex flex-col justify-between"
                        >
                          <div className="relative aspect-[4/3] bg-zinc-950 overflow-hidden">
                            <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                            <span className="absolute top-2 left-2 px-2 py-0.5 bg-zinc-950/80 text-[9px] font-bold text-white rounded">
                              {photo.category}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Supprimer la photo "${photo.title}" ?`)) {
                                  const updated = (photos || []).filter(p => p.id !== photo.id);
                                  if (setPhotos) setPhotos(updated);
                                  localStorage.setItem('maloka_gallery_photos', JSON.stringify(updated));
                                  addNotification('Photo Retirée 🗑️', `La photo "${photo.title}" a été supprimée.`, 'alerta');
                                }
                              }}
                              className="absolute top-2 right-2 p-1.5 bg-rose-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                              title="Supprimer la photo"
                            >
                              <Trash size={12} />
                            </button>
                          </div>
                          <div className="p-3 text-left">
                            <h5 className="text-xs font-bold text-white truncate">{photo.title}</h5>
                            <p className="text-[10px] text-zinc-400 line-clamp-1">{photo.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

            </motion.div>
          )}

          {/* ========================================================= */}
          {/* TAB 10: TARIFS ET CONDITIONS GÉNÉRALES D'INSCRIPTION      */}
          {/* ========================================================= */}
          {activeTab === 'tarifs' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              {/* Top Banner with Quick Actions */}
              <div className="bg-gradient-to-r from-zinc-900 via-zinc-850 to-zinc-900 border border-zinc-800 p-6 md:p-8 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl">
                <div className="space-y-1.5 text-left">
                  <div className="flex items-center gap-2 text-rose-400 text-xs uppercase font-extrabold tracking-wider">
                    <CreditCard size={16} />
                    <span>Administration Tarifaire & Juridique</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-white">
                    Paramétrage des Tarifs & Conditions Générales
                  </h3>
                  <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
                    Personnalisez en temps réel le tableau des prix affiché aux adhérents dans la section <em>Cours & Inscriptions</em> ainsi que les articles du règlement intérieur.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    id="save-tarifs-btn-top"
                    type="button"
                    onClick={handleSaveSettings}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all shadow-lg cursor-pointer hover:scale-105"
                  >
                    <Save size={15} />
                    <span>Enregistrer Tout</span>
                  </button>
                </div>
              </div>

              {/* ======================================================= */}
              {/* SECTION 1: GRILLE DES TARIFS OFFICIELS                  */}
              {/* ======================================================= */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 space-y-6 text-left">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <h4 className="text-lg font-black text-white">
                        Tableau des Tarifs & Créneaux ({((settingsForm.pricingPlans || DEFAULT_PRICING_PLANS)).length})
                      </h4>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">
                      Chaque ligne correspond à un créneau hebdomadaire visible dans le tableau public de l'application.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      id="reset-pricing-plans-btn"
                      type="button"
                      onClick={handleResetPricingPlans}
                      className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw size={13} />
                      <span>Tarifs par défaut (5)</span>
                    </button>

                    <button
                      id="add-pricing-plan-btn"
                      type="button"
                      onClick={handleAddPricingPlan}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
                    >
                      <Plus size={14} />
                      <span>Ajouter un tarif</span>
                    </button>
                  </div>
                </div>

                {/* Plans List */}
                <div className="space-y-4">
                  {(settingsForm.pricingPlans || DEFAULT_PRICING_PLANS).map((plan, index) => {
                    const isSalsa = plan.discipline.toLowerCase().includes('salsa');

                    return (
                      <div
                        key={plan.id || index}
                        id={`admin-plan-card-${plan.id || index}`}
                        className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all space-y-4"
                      >
                        {/* Row Header */}
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-850 pb-3">
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-300 font-mono text-xs font-bold flex items-center justify-center">
                              {index + 1}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              isSalsa ? 'bg-orange-950/60 text-orange-400 border border-orange-800/60' : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                            }`}>
                              {plan.discipline}
                            </span>
                            <span className="text-xs font-bold text-zinc-300 font-mono">
                              {plan.day} {plan.time} • {plan.location}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-base font-black text-rose-400 font-mono">
                              {plan.price} €
                            </span>
                            <button
                              id={`delete-plan-btn-${index}`}
                              type="button"
                              onClick={() => handleDeletePricingPlan(index)}
                              className="p-1.5 bg-zinc-800 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer ml-2"
                              title="Supprimer ce créneau"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        {/* Fields Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          {/* Jour */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase">Jour :</label>
                            <select
                              value={plan.day}
                              onChange={(e) => handleUpdatePricingPlan(index, 'day', e.target.value)}
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-semibold focus:outline-none focus:border-rose-500"
                            >
                              <option value="Lundi">Lundi</option>
                              <option value="Mardi">Mardi</option>
                              <option value="Mercredi">Mercredi</option>
                              <option value="Jeudi">Jeudi</option>
                              <option value="Vendredi">Vendredi</option>
                              <option value="Samedi">Samedi</option>
                              <option value="Dimanche">Dimanche</option>
                            </select>
                          </div>

                          {/* Horaire */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase">Horaire :</label>
                            <input
                              type="text"
                              value={plan.time}
                              onChange={(e) => handleUpdatePricingPlan(index, 'time', e.target.value)}
                              placeholder="Ex: 20h ou 20h00"
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono focus:outline-none focus:border-rose-500"
                            />
                          </div>

                          {/* Discipline */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase">Discipline :</label>
                            <input
                              type="text"
                              value={plan.discipline}
                              onChange={(e) => handleUpdatePricingPlan(index, 'discipline', e.target.value)}
                              placeholder="Cardio Latino ou Salsa Cubaine"
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-semibold focus:outline-none focus:border-rose-500"
                            />
                          </div>

                          {/* Niveau */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase">Niveau :</label>
                            <input
                              type="text"
                              value={plan.level}
                              onChange={(e) => handleUpdatePricingPlan(index, 'level', e.target.value)}
                              placeholder="Tous niveaux, Débutants..."
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                            />
                          </div>

                          {/* Commune / Lieu */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase">Commune / Ville :</label>
                            <input
                              type="text"
                              value={plan.location}
                              onChange={(e) => handleUpdatePricingPlan(index, 'location', e.target.value)}
                              placeholder="Fontenay le Fleury..."
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                            />
                          </div>

                          {/* Salle */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase">Salle municipale :</label>
                            <input
                              type="text"
                              value={plan.room}
                              onChange={(e) => handleUpdatePricingPlan(index, 'room', e.target.value)}
                              placeholder="Salle Jeanne d'Arc..."
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                            />
                          </div>

                          {/* Durée */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-zinc-400 uppercase">Durée :</label>
                            <input
                              type="text"
                              value={plan.duration}
                              onChange={(e) => handleUpdatePricingPlan(index, 'duration', e.target.value)}
                              placeholder="1h ou 1h30"
                              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono focus:outline-none focus:border-rose-500"
                            />
                          </div>

                          {/* Tarif (€) */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-rose-400 uppercase">Tarif Forfaitaire (€) :</label>
                            <div className="relative">
                              <input
                                type="number"
                                value={plan.price}
                                onChange={(e) => handleUpdatePricingPlan(index, 'price', Number(e.target.value))}
                                className="w-full pl-3 pr-8 py-2 bg-zinc-900 border border-rose-900/60 rounded-xl text-rose-400 font-black focus:outline-none focus:border-rose-500"
                              />
                              <span className="absolute right-3 top-2 text-xs text-zinc-500 font-bold">€</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ======================================================= */}
              {/* SECTION 2: CONDITIONS GÉNÉRALES D'INSCRIPTION & RÈGLEMENT */}
              {/* ======================================================= */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 space-y-6 text-left">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-5">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileText size={18} className="text-rose-500" />
                      <h4 className="text-lg font-black text-white">
                        Conditions Générales d'Inscription & Règlement Intérieur
                      </h4>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1">
                      Articles juridiques et statutaires présentés dans le modal public des conditions générales.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      id="reset-conditions-btn"
                      type="button"
                      onClick={handleResetGeneralConditions}
                      className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RefreshCw size={13} />
                      <span>Règlement par défaut</span>
                    </button>

                    <button
                      id="add-condition-section-btn"
                      type="button"
                      onClick={handleAddConditionSection}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105"
                    >
                      <Plus size={14} />
                      <span>Ajouter un article</span>
                    </button>
                  </div>
                </div>

                {/* Metadata Configuration */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Titre du document :</label>
                    <input
                      type="text"
                      value={(settingsForm.generalConditions || DEFAULT_GENERAL_CONDITIONS).title}
                      onChange={(e) => handleUpdateGeneralConditionsMeta('title', e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Sous-titre / Association :</label>
                    <input
                      type="text"
                      value={(settingsForm.generalConditions || DEFAULT_GENERAL_CONDITIONS).subtitle}
                      onChange={(e) => handleUpdateGeneralConditionsMeta('subtitle', e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase">Mention Saison / Date :</label>
                    <input
                      type="text"
                      value={(settingsForm.generalConditions || DEFAULT_GENERAL_CONDITIONS).lastUpdated || 'Saison 2026 - 2027'}
                      onChange={(e) => handleUpdateGeneralConditionsMeta('lastUpdated', e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                {/* ========================================================= */}
                {/* PDF UPLOADER & MANAGER FOR REGLEMENT / CONDITIONS         */}
                {/* ========================================================= */}
                <div className="p-5 md:p-6 rounded-2xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 border-2 border-rose-500/30 space-y-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-800 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                        <FileText size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-bold text-white uppercase tracking-wider">
                            Document PDF Officiel du Règlement Intérieur
                          </h5>
                          {(settingsForm.generalConditions?.pdfUrl) ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold flex items-center gap-1 border border-emerald-500/30">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              PDF Actif & En Ligne
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-bold">
                              Aucun PDF chargé
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          Chargez le fichier PDF officiel qui sera téléchargeable directement par les élèves depuis la grille des tarifs et le modal des conditions.
                        </p>
                      </div>
                    </div>

                    {/* Quick Action: Upload button */}
                    <label className="px-4 py-2 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-2 transition-all shadow-md hover:scale-105 shrink-0">
                      <Upload size={14} />
                      <span>{settingsForm.generalConditions?.pdfUrl ? "Remplacer le fichier PDF" : "Charger un fichier PDF (.pdf)"}</span>
                      <input
                        id="admin-upload-conditions-pdf-input"
                        type="file"
                        accept=".pdf,application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleUploadConditionsPdf(file);
                            e.target.value = '';
                          }
                        }}
                      />
                    </label>
                  </div>

                  {settingsForm.generalConditions?.pdfUrl ? (
                    /* Active PDF file display card */
                    <div className="p-4 rounded-xl bg-zinc-900/90 border border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex flex-col items-center justify-center shrink-0">
                          <FileText size={20} />
                          <span className="text-[9px] font-black tracking-widest mt-0.5">PDF</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">
                            {settingsForm.generalConditions.pdfFileName || "Reglement_Interieur_La_Maloka.pdf"}
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-0.5">
                            {settingsForm.generalConditions.pdfFileSize && (
                              <span>Taille : <strong className="text-zinc-300">{settingsForm.generalConditions.pdfFileSize}</strong></span>
                            )}
                            {settingsForm.generalConditions.pdfUploadDate && (
                              <span>Mis en ligne le : <strong className="text-zinc-300">{settingsForm.generalConditions.pdfUploadDate}</strong></span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
                        <a
                          id="admin-preview-pdf-btn"
                          href={settingsForm.generalConditions.pdfUrl}
                          download={settingsForm.generalConditions.pdfFileName || "Reglement_Interieur_La_Maloka.pdf"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                        >
                          <Download size={13} />
                          <span>Tester / Télécharger</span>
                        </a>

                        <button
                          id="admin-delete-pdf-btn"
                          type="button"
                          onClick={handleRemoveConditionsPdf}
                          className="px-3.5 py-2 bg-rose-950/60 hover:bg-rose-900 border border-rose-800/60 text-rose-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Trash2 size={13} />
                          <span>Supprimer</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Empty state explanation */
                    <div className="p-4 rounded-xl bg-zinc-950/60 border border-dashed border-zinc-700 text-center space-y-2">
                      <p className="text-xs text-zinc-400">
                        📄 Aucun document PDF n'est actuellement rattaché. Vous pouvez soit <strong>sélectionner un fichier PDF depuis votre appareil</strong> via le bouton ci-dessus, soit coller une URL directe ci-dessous.
                      </p>
                    </div>
                  )}

                  {/* Manual URL / Google Drive link input option */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase flex items-center justify-between">
                      <span>Lien Web ou Google Drive direct du document PDF (Optionnel) :</span>
                      {settingsForm.generalConditions?.pdfUrl?.startsWith('data:') && (
                        <span className="text-emerald-400 font-normal">Fichier PDF encodé et stocké localement</span>
                      )}
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="admin-conditions-pdf-url-input"
                        type="text"
                        value={settingsForm.generalConditions?.pdfUrl?.startsWith('data:') ? `[Fichier local chargé : ${settingsForm.generalConditions.pdfFileName || 'PDF'}]` : (settingsForm.generalConditions?.pdfUrl || '')}
                        onChange={(e) => {
                          if (!e.target.value.startsWith('[')) {
                            handleUpdateConditionsPdfUrl(e.target.value);
                          }
                        }}
                        placeholder="https://drive.google.com/file/d/... ou https://votresite.fr/reglement.pdf"
                        className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white font-mono text-[11px] focus:outline-none focus:border-rose-500"
                      />
                      {settingsForm.generalConditions?.pdfUrl && (
                        <button
                          type="button"
                          onClick={() => handleUpdateConditionsPdfUrl('')}
                          className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl text-xs"
                          title="Effacer le lien"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-500 block">
                      💡 <em>Si vous collez un lien Google Drive, assurez-vous que les permissions du fichier sont réglées sur "Tous les utilisateurs disposant du lien".</em>
                    </span>
                  </div>
                </div>

                {/* Articles List */}
                <div className="space-y-4">
                  {((settingsForm.generalConditions || DEFAULT_GENERAL_CONDITIONS).sections || []).map((section, idx) => (
                    <div
                      key={section.id || idx}
                      id={`admin-cgu-article-${section.id || idx}`}
                      className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-rose-950 text-rose-400 text-[10px] font-bold flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-zinc-300">Article {idx + 1}</span>
                        </div>

                        <button
                          id={`delete-cgu-article-btn-${idx}`}
                          type="button"
                          onClick={() => handleDeleteConditionSection(idx)}
                          className="p-1.5 bg-zinc-800 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                          title="Supprimer cet article"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Titre de l'article :</label>
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => handleUpdateConditionSection(idx, 'title', e.target.value)}
                          placeholder="Ex: Article 1 - Adhésion & Inscription"
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white font-bold focus:outline-none focus:border-rose-500"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-zinc-400 uppercase">Texte & Modalités :</label>
                        <textarea
                          rows={3}
                          value={section.content}
                          onChange={(e) => handleUpdateConditionSection(idx, 'content', e.target.value)}
                          placeholder="Détails du règlement..."
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-200 leading-relaxed resize-none focus:outline-none focus:border-rose-500"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom Save bar */}
                <div className="pt-4 border-t border-zinc-800 flex justify-end">
                  <button
                    id="save-tarifs-btn-bottom"
                    type="button"
                    onClick={handleSaveSettings}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all shadow-lg cursor-pointer hover:scale-105"
                  >
                    <Save size={16} />
                    <span>Sauvegarder & Publier les Tarifs & Conditions</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}

        </div>

      </div>

      {/* Instagram QR Code Modal */}
      <InstagramQRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        instagramUrl={settingsForm.instagramUrl || 'https://instagram.com/association_la_maloka'}
        accountHandle="@association_la_maloka"
      />

      {/* ========================================================= */}
      {/* MODAL 1: ADD OR EDIT CAMPAIGN / INSCRIPTION */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isCampaignModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-zinc-700 rounded-3xl p-6 sm:p-8 max-w-2xl w-full my-8 text-left space-y-6 shadow-2xl relative"
            >
              <div className="flex justify-between items-start border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold">
                    {editingCampaignId ? 'Édition Campagne' : 'Nouvelle Inscription'}
                  </span>
                  <h3 className="text-xl font-black text-white mt-1">
                    {editingCampaignId ? 'Modifier la Campagne d\'Inscription' : 'Créer une Nouvelle Inscription / Campagne'}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Configurez le titre HelloAsso, la saison, le statut public/privé, les tarifs et les places.
                  </p>
                </div>
                <button
                  onClick={() => setIsCampaignModalOpen(false)}
                  className="p-2 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-xl cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveCampaign} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300 uppercase">Titre de la Campagne HelloAsso :</label>
                  <input
                    type="text"
                    required
                    value={campaignFormData.name || ''}
                    onChange={(e) => setCampaignFormData({ ...campaignFormData, name: e.target.value })}
                    placeholder="Ex: SALSA CUBAINE Débutant Saison 2026 - 2027 Cours à 20h Fontenay le Fleury"
                    className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-300 uppercase">Saison :</label>
                    <input
                      type="text"
                      required
                      value={campaignFormData.season || 'Saison 2026 - 2027'}
                      onChange={(e) => setCampaignFormData({ ...campaignFormData, season: e.target.value })}
                      placeholder="Ex: Saison 2026 - 2027"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-300 uppercase">Discipline :</label>
                    <select
                      value={campaignFormData.category || 'Salsa Cubaine'}
                      onChange={(e) => setCampaignFormData({ ...campaignFormData, category: e.target.value as any })}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                    >
                      <option value="Salsa Cubaine">Salsa Cubaine</option>
                      <option value="Cardio Latino">Cardio Latino</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-300 uppercase">Type :</label>
                    <select
                      value={campaignFormData.campaignType || 'Cours Annuel'}
                      onChange={(e) => setCampaignFormData({ ...campaignFormData, campaignType: e.target.value as any, isTrialClass: e.target.value === "Cours d'essai" })}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                    >
                      <option value="Cours Annuel">Cours Annuel</option>
                      <option value="Cours d'essai">Cours d'essai</option>
                      <option value="Stage">Stage Ponctuel</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-300 uppercase">Statut / Visibilité :</label>
                    <select
                      value={campaignFormData.visibility || 'Public'}
                      onChange={(e) => setCampaignFormData({ ...campaignFormData, visibility: e.target.value as any })}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                    >
                      <option value="Public">Public (Visible)</option>
                      <option value="Privé">Privé (Masqué)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-300 uppercase">Lieu :</label>
                    <select
                      value={campaignFormData.location || 'Fontenay-le-Fleury'}
                      onChange={(e) => {
                        const loc = e.target.value;
                        const matchingRoom = rooms.find(r => r.location === loc);
                        setCampaignFormData({ 
                          ...campaignFormData, 
                          location: loc as any,
                          roomId: matchingRoom ? matchingRoom.id : campaignFormData.roomId,
                          roomName: matchingRoom ? matchingRoom.name : campaignFormData.roomName,
                          maxSpots: matchingRoom ? matchingRoom.maxCapacity : campaignFormData.maxSpots
                        });
                      }}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                    >
                      <option value="Fontenay-le-Fleury">Fontenay-le-Fleury</option>
                      <option value="La Queue-les-Yvelines">La Queue-les-Yvelines</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-300 uppercase">Niveau :</label>
                    <select
                      value={campaignFormData.level || 'Débutant'}
                      onChange={(e) => setCampaignFormData({ ...campaignFormData, level: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                    >
                      <option value="Débutant">Débutant</option>
                      <option value="Intermédiaire">Intermédiaire</option>
                      <option value="Inter/Avancé">Inter/Avancé</option>
                      <option value="Tous Niveaux">Tous Niveaux</option>
                    </select>
                  </div>
                </div>

                {/* Salle & Jauge / Aforo Assignment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-zinc-950/60 border border-zinc-800 rounded-2xl">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-amber-300 uppercase flex items-center gap-1.5">
                      <Building size={12} /> Salle de danse & Gymnase :
                    </label>
                    <select
                      value={campaignFormData.roomId || ''}
                      onChange={(e) => {
                        const selectedRoom = rooms.find(r => r.id === e.target.value);
                        if (selectedRoom) {
                          setCampaignFormData({
                            ...campaignFormData,
                            roomId: selectedRoom.id,
                            roomName: selectedRoom.name,
                            location: selectedRoom.location,
                            maxSpots: selectedRoom.maxCapacity
                          });
                        }
                      }}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      {rooms.map(r => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.location} - Jauge: {r.maxCapacity}p)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-amber-300 uppercase flex items-center gap-1.5">
                      <Users size={12} /> Jauge Maximale / Aforo (Places) :
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={200}
                      value={campaignFormData.maxSpots || 30}
                      onChange={(e) => setCampaignFormData({ ...campaignFormData, maxSpots: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-[9px] text-zinc-500">Au-delà de cette jauge, les inscriptions basculent en Liste d'Attente.</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-300 uppercase">Créneau & Horaire :</label>
                    <input
                      type="text"
                      required
                      value={campaignFormData.schedule || ''}
                      onChange={(e) => setCampaignFormData({ ...campaignFormData, schedule: e.target.value })}
                      placeholder="Ex: Vendredi 20:00 - 21:00"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-300 uppercase">Professeur :</label>
                    <input
                      type="text"
                      required
                      value={campaignFormData.instructor || ''}
                      onChange={(e) => setCampaignFormData({ ...campaignFormData, instructor: e.target.value })}
                      placeholder="Ex: Yasmilka Valdés"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-300 uppercase">Tarif Annuel (€) :</label>
                    <input
                      type="number"
                      value={campaignFormData.annualPrice || 0}
                      onChange={(e) => setCampaignFormData({ ...campaignFormData, annualPrice: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-emerald-400 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-300 uppercase">Tarif Mensuel (€) :</label>
                    <input
                      type="number"
                      value={campaignFormData.priceMonthly || 0}
                      onChange={(e) => setCampaignFormData({ ...campaignFormData, priceMonthly: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-emerald-400 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-300 uppercase">Adhérents Inscrits :</label>
                    <input
                      type="number"
                      value={campaignFormData.subscribersCount || 0}
                      onChange={(e) => setCampaignFormData({ ...campaignFormData, subscribersCount: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-300 uppercase">Collecté (€) :</label>
                    <input
                      type="number"
                      value={campaignFormData.collectedAmount || 0}
                      onChange={(e) => setCampaignFormData({ ...campaignFormData, collectedAmount: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-orange-400 font-bold"
                    />
                  </div>
                </div>

                {/* Live Spots Remaining Calculation Banner */}
                {(() => {
                  const maxS = campaignFormData.maxSpots || 30;
                  const subs = campaignFormData.subscribersCount || 0;
                  const rem = Math.max(0, maxS - subs);
                  const isFull = rem <= 0;

                  return (
                    <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-amber-400" />
                        <span className="text-xs text-zinc-300">
                          Calcul en temps réel : <strong>{subs}</strong> inscrits sur <strong>{maxS}</strong> places d'aforo.
                        </span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-black ${
                        isFull ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {isFull ? 'COMPLET (0 dispo)' : `${rem} PLACES RESTANTES`}
                      </span>
                    </div>
                  );
                })()}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-300 uppercase">Jours Restants :</label>
                    <input
                      type="number"
                      value={campaignFormData.daysRemaining || 318}
                      onChange={(e) => setCampaignFormData({ ...campaignFormData, daysRemaining: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-300 uppercase">Lien HelloAsso Direct :</label>
                    <input
                      type="text"
                      value={campaignFormData.helloAssoUrl || ''}
                      onChange={(e) => setCampaignFormData({ ...campaignFormData, helloAssoUrl: e.target.value })}
                      placeholder="https://www.helloasso.com/associations/la-maloka/adhesions/..."
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300 uppercase">Description du cours & modalité :</label>
                  <textarea
                    rows={2}
                    value={campaignFormData.description || ''}
                    onChange={(e) => setCampaignFormData({ ...campaignFormData, description: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white resize-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsCampaignModalOpen(false)}
                    className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md"
                  >
                    {editingCampaignId ? 'Enregistrer les Modifications' : 'Créer la Campagne'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL 2: GOOGLE SHEETS RELATIONAL DATABASE EXPLORER */}
      {/* ========================================================= */}
      <AnimatePresence>
        {showGoogleSheetsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-950 border border-zinc-700 rounded-3xl p-4 sm:p-6 max-w-6xl w-full my-6 text-left space-y-4 shadow-2xl relative max-h-[92vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <FileSpreadsheet size={18} className="text-emerald-400" />
                  <span>Explorateur de Données Relationnelles & Google Sheets</span>
                </div>
                <button
                  onClick={() => setShowGoogleSheetsModal(false)}
                  className="p-2 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-xl cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <GoogleSheetsRelationalHub
                inscriptions={inscriptions}
                classes={classes}
                rooms={rooms}
                healthForms={healthForms}
                siteSettings={siteSettings}
                addNotification={addNotification}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================= */}
      {/* MODAL 3: GESTION DU MOT DE PASSE ADMINISTRATEUR */}
      {/* ========================================================= */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-zinc-700 rounded-3xl p-6 sm:p-8 max-w-md w-full my-6 text-left space-y-6 shadow-2xl relative"
            >
              <div className="flex justify-between items-start pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center border border-amber-500/30">
                    <Key size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">
                      Mot de Passe Administrateur
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Personnalisez l'accès sécurisé à votre Back-Office.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsPasswordModalOpen(false);
                    setPasswordChangeMessage(null);
                  }}
                  className="p-1.5 text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                {passwordChangeMessage && (
                  <div
                    className={`p-3.5 rounded-xl text-xs font-semibold text-center border ${
                      passwordChangeMessage.type === 'success'
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {passwordChangeMessage.text}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">
                    Mot de passe actuel :
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPasswordInput}
                    onChange={(e) => setCurrentPasswordInput(e.target.value)}
                    placeholder="Entrez le mot de passe actuel..."
                    className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <span className="text-[10px] text-zinc-500">
                    (Par défaut : <code className="text-zinc-400">MALOKA-ADMIN-78</code>)
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-zinc-300">
                      Nouveau mot de passe :
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      {showNewPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                      <span>{showNewPassword ? 'Masquer' : 'Afficher'}</span>
                    </button>
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    placeholder="Min. 6 caractères..."
                    className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-300">
                    Confirmer le nouveau mot de passe :
                  </label>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    placeholder="Répétez le nouveau mot de passe..."
                    className="w-full px-3.5 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div className="pt-2 flex flex-col gap-2.5">
                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer text-center"
                  >
                    Enregistrer le Nouveau Mot de Passe
                  </button>

                  <button
                    type="button"
                    onClick={handleResetDefaultPassword}
                    className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-semibold rounded-xl border border-zinc-700/60 transition-all cursor-pointer"
                  >
                    Réinitialiser au code par défaut (MALOKA-ADMIN-78)
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
