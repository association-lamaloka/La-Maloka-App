import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DANCE_CLASSES, DEFAULT_ROOMS, DEFAULT_PRICING_PLANS, DEFAULT_GENERAL_CONDITIONS } from '../data';
import { DanceClass, Inscription, SiteSettings, DanceRoom, PricingPlan, GeneralConditionsData } from '../types';
import { 
  Sparkles, Calendar, User, Phone, Mail, ChevronRight, Filter, AlertCircle, Trash2, 
  MapPin, CheckCircle, Clock, Building, Users, AlertTriangle, FileText, CreditCard, 
  HelpCircle, Info, ExternalLink, ShieldCheck, Check, Search, DollarSign, Layers, Printer, X, Download, Lock
} from 'lucide-react';
import { FloatingMonstera, FloatingHibiscus, HibiscusSVG } from './TropicalDecorations';
import { syncToGoogleSheets } from '../services/googleSheetsSync';
import { addInscriptionToCloud } from '../services/firestoreService';

interface ClassesAndInscriptionsProps {
  classes?: DanceClass[];
  inscriptions: Inscription[];
  setInscriptions: React.Dispatch<React.SetStateAction<Inscription[]>>;
  rooms?: DanceRoom[];
  addNotification: (title: string, description: string, type: 'evento' | 'clase' | 'pago' | 'alerta') => void;
  defaultClassId?: string;
  initialCategory?: string;
  siteSettings?: SiteSettings;
  onTriggerPayment?: (concept: string, amount: number) => void;
}

export const ClassesAndInscriptions: React.FC<ClassesAndInscriptionsProps> = ({
  classes = DANCE_CLASSES,
  inscriptions,
  setInscriptions,
  rooms = DEFAULT_ROOMS,
  addNotification,
  defaultClassId = '',
  initialCategory = 'Tous',
  siteSettings,
  onTriggerPayment
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'Tous');
  const [selectedLocation, setSelectedLocation] = useState<string>('Tous');
  const [selectedLevel, setSelectedLevel] = useState<string>('Tous');
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [selectedClass, setSelectedClass] = useState<DanceClass | null>(null);
  const [selectedInfoClass, setSelectedInfoClass] = useState<DanceClass | null>(null);
  const [activeViewMode, setActiveViewMode] = useState<'tarifs' | 'cards'>('tarifs');
  
  // General Conditions Modal State
  const [showConditionsModal, setShowConditionsModal] = useState<boolean>(false);
  const [conditionsSearch, setConditionsSearch] = useState<string>('');

  // Informative Mode Check (Engine ON/OFF)
  // Registration logic
  const globalRegistrationsEnabled = siteSettings?.moduleToggles?.allowOnlineRegistrations !== false;

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [studentLevel, setStudentLevel] = useState('Débutant');

  const pricingPlans: PricingPlan[] = siteSettings?.pricingPlans && siteSettings.pricingPlans.length > 0
    ? siteSettings.pricingPlans
    : DEFAULT_PRICING_PLANS;

  const generalConditions: GeneralConditionsData = siteSettings?.generalConditions || DEFAULT_GENERAL_CONDITIONS;

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  useEffect(() => {
    if (defaultClassId && classes) {
      const found = classes.find((c) => c.id === defaultClassId);
      if (found) {
        setSelectedInfoClass(found);
      }
    }
  }, [defaultClassId, classes]);

  const saveInscriptions = (newInscriptions: Inscription[]) => {
    setInscriptions(newInscriptions);
    localStorage.setItem('maloka_inscriptions', JSON.stringify(newInscriptions));
  };

  const handleOpenRegister = (danceClass: DanceClass) => {
    const liveClass = (classes || []).find(c => c.id === danceClass.id) || danceClass;
    setSelectedInfoClass(liveClass);
  };

  const handleRegisterFromTarif = (plan: PricingPlan) => {
    // Find corresponding class or create a matching dance class
    const matching: DanceClass = classes.find(c => c.id === plan.classId) ||
      classes.find(c => c.category?.toLowerCase() === plan.discipline.toLowerCase() && (c.schedule?.toLowerCase().includes(plan.time.toLowerCase().slice(0, 3)) || c.location?.toLowerCase().includes(plan.location.toLowerCase().slice(0, 5)))) ||
      classes.find(c => c.category?.toLowerCase() === plan.discipline.toLowerCase()) || {
        id: plan.id,
        name: `${plan.discipline} - ${plan.day} ${plan.time} (${plan.location})`,
        instructor: plan.instructor || 'Yasmilka Valdés & Équipe',
        schedule: `${plan.day} ${plan.time} • ${plan.duration}`,
        level: plan.level,
        description: plan.notes || '',
        priceMonthly: Math.round(plan.price / 9),
        annualPrice: plan.price,
        image: plan.discipline.toLowerCase().includes('salsa')
          ? 'https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=600'
          : 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=600',
        category: plan.discipline as any,
        location: plan.location as any,
        roomName: plan.room,
        maxSpots: 30,
        subscribersCount: 0,
        visibility: 'Public',
        active: true
      };

    setSelectedInfoClass(matching);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;

    // Calculate current occupancy and maximum capacity
    const registeredCount = selectedClass.subscribersCount !== undefined ? selectedClass.subscribersCount : inscriptions.filter(i => i.classId === selectedClass.id && i.status !== "Liste d'attente").length;
    const maxSpots = selectedClass.maxSpots || 30;
    const isFull = registeredCount >= maxSpots;

    const newInscription: Inscription = {
      id: 'ins-' + Date.now(),
      userName: fullName,
      userEmail: email,
      userPhone: phone,
      classId: selectedClass.id,
      className: selectedClass.name,
      level: studentLevel,
      status: isFull ? "Liste d'attente" : 'Confirmée',
      date: new Date().toLocaleDateString('fr-FR'),
    };

    const updated = [newInscription, ...inscriptions];
    saveInscriptions(updated);

    // Save to Cloud Firestore Database (Permanent Remote Storage)
    addInscriptionToCloud(newInscription).catch(err => console.error('Firestore save error:', err));

    // Real-time synchronization with Google Sheets Webhook
    syncToGoogleSheets({
      action: 'inscription',
      timestamp: new Date().toISOString(),
      data: {
        id: newInscription.id,
        userName: newInscription.userName,
        userEmail: newInscription.userEmail,
        userPhone: newInscription.userPhone,
        className: newInscription.className,
        classId: newInscription.classId,
        level: newInscription.level,
        status: newInscription.status,
        date: newInscription.date,
        location: selectedClass.location,
        roomName: selectedClass.roomName,
        instructor: selectedClass.instructor,
        annualPrice: selectedClass.annualPrice || selectedClass.priceMonthly * 9 || 198
      }
    }).catch(err => console.log('Real-time sync notice:', err));

    if (isFull) {
      addNotification(
        'Inscription en Liste d\'Attente 📋',
        `Le cours "${selectedClass.name}" a atteint sa jauge maximale (${maxSpots} places). Vous avez été placé(e) en liste d'attente prioritaire. Nous vous contacterons dès qu'une place se libère !`,
        'alerta'
      );
    } else {
      addNotification(
        'Pré-Inscription Enregistrée 🌺',
        `Félicitations ${fullName} ! Votre place pour le cours "${selectedClass.name}" a bien été réservée (${registeredCount + 1}/${maxSpots} places).`,
        'clase'
      );
    }

    // Reset Form
    setIsRegistering(false);
    setFullName('');
    setEmail('');
    setPhone('');
  };

  const handleCancelInscription = (id: string, className: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir annuler votre inscription pour ${className} ?`)) {
      const updated = inscriptions.filter((ins) => ins.id !== id);
      saveInscriptions(updated);
      addNotification(
        'Inscription Retirée',
        `Votre inscription au cours de ${className} a été annulée.`,
        'alerta'
      );
    }
  };

  // Only allowed active categories in Stage 1
  const categories = ['Tous', 'Salsa Cubaine', 'Cardio Latino'];
  const locations = ['Tous', 'Fontenay-le-Fleury', 'La Queue-les-Yvelines'];
  const levels = ['Tous', 'Débutant', 'Intermédiaire', 'Tous Niveaux'];

  // Filter only active classes
  const filteredClasses = classes.filter((c) => {
    if (c.active === false) return false;
    const categoryMatch = selectedCategory === 'Tous' || c.category === selectedCategory;
    const locationMatch = selectedLocation === 'Tous' || c.location === selectedLocation;
    const levelMatch = selectedLevel === 'Tous' || c.level === selectedLevel;
    return categoryMatch && locationMatch && levelMatch;
  });

  // Filtered conditions
  const filteredConditions = (generalConditions.sections || []).filter((sec) => {
    if (!conditionsSearch.trim()) return true;
    const q = conditionsSearch.toLowerCase();
    return sec.title.toLowerCase().includes(q) || sec.content.toLowerCase().includes(q);
  });

  return (
    <div className="relative py-12 md:py-16 bg-white dark:bg-zinc-950 min-h-screen">
      
      {/* Tropical leaf decorations */}
      <FloatingMonstera delay={1} size="w-36 h-36" className="absolute top-12 -left-10 text-emerald-500/10 dark:text-emerald-500/5 rotate-12" />
      <FloatingHibiscus delay={3} size="w-24 h-24" className="absolute bottom-1/3 -right-6 text-rose-500/10 dark:text-rose-500/5 rotate-45" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-10">
          <div className="flex justify-center text-orange-500">
            <HibiscusSVG className="w-10 h-10 animate-pulse" />
          </div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-rose-500">
            Saison 2026 - 2027
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">
            Cours, Tarifs & Inscriptions
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 font-light text-sm sm:text-base leading-relaxed">
            Consultez notre <strong>tableau officiel des tarifs</strong> pour la saison 2026 - 2027, le planning hebdomadaire de <strong>Salsa Cubaine</strong> et <strong>Cardio Latino</strong>, et inscrivez-vous en quelques clics.
          </p>
        </div>

        {/* Top Quick Actions Bar (Conditions Générales Link & Highlights) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-gradient-to-r from-orange-500/10 via-rose-500/10 to-amber-500/10 p-4 sm:p-5 rounded-2xl border border-orange-200/60 dark:border-zinc-800">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-md shrink-0">
              <FileText size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <span>Règlement & Adhésion</span>
                <span className="text-[10px] px-2 py-0.5 bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-extrabold rounded-full uppercase">Loi 1901</span>
              </h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Consultez les modalités d'adhésion, règlements échelonnés et conditions sanitaires.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              id="open-general-conditions-btn"
              onClick={() => setShowConditionsModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-zinc-800 hover:bg-rose-50 dark:hover:bg-zinc-700 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-zinc-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer hover:scale-105"
            >
              <FileText size={15} />
              <span>Conditions Générales</span>
              <ExternalLink size={13} />
            </button>
          </div>
        </div>

        {/* INFORMATIVE MODE BANNER (WHEN ALL INSCRIPTIONS ARE GLOBALLY DEACTIVATED) */}
        {siteSettings?.moduleToggles?.allowOnlineRegistrations === false && (
          <div className="mb-8 p-5 sm:p-6 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-2 border-amber-500/30 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left shadow-sm">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="p-3 bg-amber-500/20 text-amber-700 dark:text-amber-300 rounded-2xl shrink-0">
                <Info size={24} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-800 dark:text-amber-300 font-black text-[10px] uppercase tracking-wider rounded-full">
                    Site en Mode Informatif • Saison 2026 - 2027
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-black text-zinc-900 dark:text-white">
                  Planning hebdomadaire, salles et grille tarifaire officielle
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Le moteur d'inscriptions en ligne est actuellement désactivé. Retrouvez tous les horaires ci-dessous ou contactez le bureau de l'association pour toute question ou renseignement.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end shrink-0">
              <a
                href="mailto:association.lamaloka@gmail.com"
                className="w-full sm:w-auto px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-black font-extrabold rounded-xl text-xs uppercase tracking-wider transition-all inline-flex items-center justify-center gap-1.5 shadow-md"
              >
                <Mail size={14} />
                <span>Nous Contacter</span>
              </a>
            </div>
          </div>
        )}

        {/* View Switcher: Tableau des Tarifs vs Planning Cartes */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-inner">
            <button
              id="view-tab-tarifs-btn"
              onClick={() => setActiveViewMode('tarifs')}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                activeViewMode === 'tarifs'
                  ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <CreditCard size={15} />
              <span>Tableau des Tarifs & Horaires</span>
            </button>
            <button
              id="view-tab-cards-btn"
              onClick={() => setActiveViewMode('cards')}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
                activeViewMode === 'cards'
                  ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Layers size={15} />
              <span>Fiches Détaillées des Cours ({classes.filter(c => c.active !== false).length})</span>
            </button>
          </div>
        </div>

        {/* ======================================================= */}
        {/* VIEW 1: OFFICIAL PRICING TABLE (TABLEAU DES TARIFS)     */}
        {/* ======================================================= */}
        {activeViewMode === 'tarifs' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-8 mb-16"
          >
            {/* Desktop / Tablet Pricing Table */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-lg overflow-hidden">
              <div className="p-6 md:p-8 bg-gradient-to-r from-zinc-900 via-zinc-850 to-zinc-900 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-800">
                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-2 text-rose-400 text-xs uppercase font-extrabold tracking-widest">
                    <Sparkles size={15} />
                    <span>Tarifs Saison 2026 - 2027</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black tracking-tight text-white">
                    Planning & Grille Tarifaire Annuelle
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Tarifs forfaitaires annuels par personne. Possibilité de règlement échelonné en 3 fois sans frais.
                  </p>
                </div>

                <button
                  onClick={() => setShowConditionsModal(true)}
                  className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ShieldCheck size={14} />
                  <span>Conditions de paiement</span>
                </button>
              </div>

              {/* Desktop Responsive Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse" id="pricing-plans-table">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850/50 text-[11px] font-extrabold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      <th className="py-4 px-6">Jour & Horaire</th>
                      <th className="py-4 px-6">Cours / Discipline</th>
                      <th className="py-4 px-6">Niveau</th>
                      <th className="py-4 px-6">Commune & Salle</th>
                      <th className="py-4 px-6">Durée</th>
                      <th className="py-4 px-6 text-right">Tarif Annuel</th>
                      <th className="py-4 px-6 text-center">Inscription / Détails</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                    {pricingPlans.map((plan, index) => {
                      const isSalsa = plan.discipline.toLowerCase().includes('salsa');
                      const matching = classes.find(c => c.id === plan.classId) ||
                        classes.find(c => c.category?.toLowerCase() === plan.discipline.toLowerCase() && (c.schedule?.toLowerCase().includes(plan.time.toLowerCase().slice(0, 3)) || c.location?.toLowerCase().includes(plan.location.toLowerCase().slice(0, 5)))) ||
                        classes.find(c => c.category?.toLowerCase() === plan.discipline.toLowerCase());
                      const isPlanOpen = matching ? (matching.visibility !== 'Privé' && matching.active !== false) : true;

                      return (
                        <tr
                          key={plan.id || index}
                          id={`pricing-row-${plan.id}`}
                          className="hover:bg-rose-50/30 dark:hover:bg-zinc-800/40 transition-colors"
                        >
                          {/* Jour & Horaire */}
                          <td className="py-4 px-6 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-zinc-900 dark:text-white">
                                {plan.day}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[11px] font-bold flex items-center gap-1">
                                <Clock size={11} className="text-zinc-400" />
                                {plan.time}
                              </span>
                            </div>
                          </td>

                          {/* Discipline */}
                          <td className="py-4 px-6 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
                              isSalsa 
                                ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300' 
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                            }`}>
                              <span className={`w-2 h-2 rounded-full ${isSalsa ? 'bg-orange-500' : 'bg-emerald-500'}`} />
                              {plan.discipline}
                            </span>
                          </td>

                          {/* Level */}
                          <td className="py-4 px-6 whitespace-nowrap">
                            <span className="text-zinc-700 dark:text-zinc-300 font-semibold">
                              {plan.level}
                            </span>
                          </td>

                          {/* Commune & Salle */}
                          <td className="py-4 px-6">
                            <div>
                              <p className="font-bold text-zinc-900 dark:text-white flex items-center gap-1">
                                <MapPin size={13} className="text-rose-500 shrink-0" />
                                <span>{plan.location}</span>
                              </p>
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 pl-4">
                                {plan.room}
                              </p>
                            </div>
                          </td>

                          {/* Durée */}
                          <td className="py-4 px-6 whitespace-nowrap text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">
                            {plan.duration}
                          </td>

                          {/* Tarif */}
                          <td className="py-4 px-6 whitespace-nowrap text-right">
                            <div className="inline-block text-right">
                              <span className="text-lg font-black text-rose-600 dark:text-rose-400 tracking-tight">
                                {plan.price} €
                              </span>
                              <span className="block text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                                {plan.period || 'par personne'}
                              </span>
                            </div>
                          </td>

                          {/* Inscription CTA */}
                          <td className="py-4 px-6 whitespace-nowrap text-center">
                            <button
                              id={`register-plan-btn-${plan.id}`}
                              onClick={() => handleRegisterFromTarif(plan)}
                              className={`px-4 py-2 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer hover:scale-105 inline-flex items-center gap-1.5 ${
                                isPlanOpen
                                  ? 'bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white'
                                  : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
                              }`}
                            >
                              {isPlanOpen ? (
                                <>
                                  <span>S'inscrire</span>
                                  <ChevronRight size={14} />
                                </>
                              ) : (
                                <>
                                  <Lock size={12} className="text-amber-500" />
                                  <span>Fermé / Détails</span>
                                </>
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards for Pricing Plans */}
              <div className="block md:hidden divide-y divide-zinc-100 dark:divide-zinc-800 p-4 space-y-4">
                {pricingPlans.map((plan, index) => {
                  const isSalsa = plan.discipline.toLowerCase().includes('salsa');
                  const matching = classes.find(c => c.id === plan.classId) ||
                    classes.find(c => c.category?.toLowerCase() === plan.discipline.toLowerCase() && (c.schedule?.toLowerCase().includes(plan.time.toLowerCase().slice(0, 3)) || c.location?.toLowerCase().includes(plan.location.toLowerCase().slice(0, 5)))) ||
                    classes.find(c => c.category?.toLowerCase() === plan.discipline.toLowerCase());
                  const isPlanOpen = matching ? (matching.visibility !== 'Privé' && matching.active !== false) : true;

                  return (
                    <div
                      key={plan.id || index}
                      id={`pricing-card-mobile-${plan.id}`}
                      className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700/60 space-y-3 text-left"
                    >
                      <div className="flex justify-between items-start">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${
                          isSalsa 
                            ? 'bg-orange-100 text-orange-800 dark:bg-orange-950/40 dark:text-orange-300' 
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                        }`}>
                          {plan.discipline}
                        </span>

                        <div className="text-right">
                          <span className="text-lg font-black text-rose-600 dark:text-rose-400">
                            {plan.price} €
                          </span>
                          <span className="block text-[9px] text-zinc-500 uppercase font-bold">
                            {plan.period || 'par personne'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <strong className="text-zinc-900 dark:text-white text-sm">{plan.day} à {plan.time}</strong>
                          <span className="text-[11px] text-zinc-500 font-mono">({plan.duration})</span>
                        </div>

                        <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium">
                          Niveau : <span className="font-bold text-zinc-900 dark:text-white">{plan.level}</span>
                        </p>

                        <div className="text-xs text-zinc-600 dark:text-zinc-400 pt-1 border-t border-zinc-200/50 dark:border-zinc-700/50">
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                            <MapPin size={12} className="text-rose-500 shrink-0" />
                            <span>{plan.location}</span>
                          </p>
                          <p className="text-[11px] text-zinc-500 pl-4">{plan.room}</p>
                        </div>
                      </div>

                      <button
                        id={`register-plan-mobile-btn-${plan.id}`}
                        onClick={() => handleRegisterFromTarif(plan)}
                        className={`w-full py-2.5 font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isPlanOpen
                            ? 'bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white'
                            : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
                        }`}
                      >
                        {isPlanOpen ? (
                          <>
                            <span>S'inscrire à ce créneau</span>
                            <ChevronRight size={14} />
                          </>
                        ) : (
                          <>
                            <Lock size={13} className="text-amber-500" />
                            <span>Fermé • Consulter détails</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Tarifs Footer Highlights */}
              <div className="p-6 bg-amber-50/50 dark:bg-zinc-855/60 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CreditCard size={16} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-zinc-900 dark:text-white">Paiement échelonné</h5>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400">Possibilité de règlement en 3 fois sans frais par chèques ou carte bancaire.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-zinc-900 dark:text-white">Séance d'essai offerte</h5>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400">Cours d'essai gratuit et sans engagement lors de la rentrée de septembre.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                    <FileText size={16} />
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h5 className="text-xs font-bold text-zinc-900 dark:text-white">Conditions Générales</h5>
                      {generalConditions?.pdfUrl && (
                        <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[9px] font-black uppercase tracking-wider">
                          PDF inclus
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      <button
                        id="open-conditions-modal-btn"
                        onClick={() => setShowConditionsModal(true)}
                        className="text-[11px] text-rose-600 dark:text-rose-400 underline font-semibold hover:text-rose-700 cursor-pointer"
                      >
                        Consulter le règlement complet
                      </button>
                      {generalConditions?.pdfUrl && (
                        <>
                          <span className="text-zinc-300 dark:text-zinc-700 text-xs">•</span>
                          <a
                            id="download-reglement-pdf-direct-btn"
                            href={generalConditions.pdfUrl}
                            download={generalConditions.pdfFileName || "Reglement_Interieur_La_Maloka_2026_2027.pdf"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer transition-colors"
                            title="Télécharger le document PDF officiel"
                          >
                            <Download size={12} />
                            <span>Télécharger PDF {generalConditions.pdfFileSize ? `(${generalConditions.pdfFileSize})` : ''}</span>
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ======================================================= */}
        {/* VIEW 2: CARDS GRID OF CLASSES (WITH FILTERS)            */}
        {/* ======================================================= */}
        {activeViewMode === 'cards' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* Filters Panel */}
            <div className="bg-amber-50/50 dark:bg-zinc-900/40 border border-orange-100/50 dark:border-zinc-800 rounded-3xl p-6 mb-10 flex flex-col lg:flex-row gap-6 items-center justify-between shadow-sm">
              
              {/* Discipline Selector */}
              <div className="flex items-center gap-2 flex-wrap justify-center">
                <span className="text-xs uppercase font-extrabold tracking-wider text-zinc-700 dark:text-zinc-300 mr-2 flex items-center gap-1.5">
                  <Filter size={15} className="text-rose-500" />
                  Discipline :
                </span>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    id={`filter-cat-${cat.replace(/\s+/g, '-').toLowerCase()}`}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md'
                        : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-rose-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Location & Level Selectors */}
              <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto justify-center">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Lieu :</span>
                  <select
                    id="filter-location-select"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs font-semibold"
                  >
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Niveau :</span>
                  <select
                    id="filter-level-select"
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs font-semibold"
                  >
                    {levels.map((lvl) => (
                      <option key={lvl} value={lvl}>
                        {lvl}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Classes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              <AnimatePresence mode="popLayout">
                {filteredClasses.map((item) => {
                  const isSalsa = item.category === 'Salsa Cubaine';
                  
                  // Capacity & Room calculations
                  const maxSpots = item.maxSpots || 30;
                  const registeredCount = item.subscribersCount !== undefined ? item.subscribersCount : inscriptions.filter(i => i.classId === item.id && i.status !== "Liste d'attente").length;
                  const spotsLeft = Math.max(0, maxSpots - registeredCount);
                  const occupancyRate = Math.min(100, Math.round((registeredCount / maxSpots) * 100));
                  const isFull = spotsLeft <= 0;
                  const isNearlyFull = spotsLeft > 0 && spotsLeft <= 5;
                  const room = rooms.find(r => r.id === item.roomId) || {
                    name: item.roomName || 'Salle Municipale',
                    address: item.location === 'Fontenay-le-Fleury' ? '78330 Fontenay-le-Fleury' : '78940 La Queue-les-Yvelines'
                  };

                  return (
                    <motion.div
                      key={item.id}
                      id={`class-card-${item.id}`}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      className="group relative bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between"
                    >
                      {/* Class Image Section */}
                      <div className="relative aspect-[16/9] overflow-hidden bg-zinc-100 shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-white shadow-md ${
                            isSalsa ? 'bg-orange-500' : 'bg-emerald-600'
                          }`}>
                            {item.category}
                          </span>
                          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/20">
                            {item.location}
                          </span>
                        </div>

                        {/* Price Badge */}
                        <div className="absolute bottom-4 right-4 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-3.5 py-1.5 rounded-2xl shadow-lg border border-zinc-200/50 dark:border-zinc-700/50 text-right">
                          <span className="text-base font-black text-rose-500 tracking-tight">
                            {item.annualPrice ? `${item.annualPrice} €` : `${item.priceMonthly} €/m`}
                          </span>
                          <span className="block text-[9px] text-zinc-500 dark:text-zinc-400 font-bold uppercase">
                            {item.annualPrice ? 'par an' : 'par mois'}
                          </span>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4 text-left">
                        <div className="space-y-2.5">
                          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                            <Clock size={14} className="text-orange-500 shrink-0" />
                            <span>{item.schedule}</span>
                          </div>

                          <h3 className="text-lg font-bold text-zinc-900 dark:text-white leading-snug group-hover:text-rose-500 transition-colors">
                            {item.name}
                          </h3>

                          <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>

                          {/* Room and Location info */}
                          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
                            <span className="flex items-center gap-1 font-semibold text-zinc-700 dark:text-zinc-300">
                              <Building size={13} className="text-rose-500" />
                              {room.name}
                            </span>
                            <span className="text-[11px] font-mono">
                              Niveau: {item.level}
                            </span>
                          </div>

                          {/* Jauge / Occupancy Bar & Real-time HelloAsso capacity */}
                          <div className="space-y-1.5 pt-1.5 border-t border-zinc-100 dark:border-zinc-800/80">
                            <div className="flex justify-between items-center text-[11px] font-medium">
                              <span className="text-zinc-500 flex items-center gap-1">
                                <Users size={12} className="text-emerald-500 shrink-0" />
                                <span>Places restantes :</span>
                              </span>
                              <span className={`font-mono font-bold px-2 py-0.5 rounded-md text-[11px] ${
                                isFull 
                                  ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
                                  : isNearlyFull 
                                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' 
                                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              }`}>
                                {isFull ? 'COMPLET (0 place)' : `${spotsLeft} disponible${spotsLeft > 1 ? 's' : ''} / ${maxSpots}`}
                              </span>
                            </div>
                            <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden p-0.5">
                              <div
                                className={`h-full transition-all duration-500 rounded-full ${
                                  isFull ? 'bg-rose-500' : isNearlyFull ? 'bg-amber-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                                }`}
                                style={{ width: `${occupancyRate}%` }}
                              />
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-zinc-400">
                              <span className="flex items-center gap-1 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-zinc-600 dark:text-zinc-300 font-semibold">{registeredCount} inscrit{registeredCount > 1 ? 's' : ''} HelloAsso</span>
                              </span>
                              <span className="font-mono">Aforo : {maxSpots} max</span>
                            </div>
                          </div>
                        </div>

                        {/* Teacher & Register Button */}
                        {(() => {
                          const isClassOpen = item.visibility !== 'Privé' && item.active !== false;

                          return (
                            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                              <div className="flex items-center gap-2.5">
                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-black shadow-sm ${
                                  isSalsa ? 'bg-orange-500' : 'bg-emerald-600'
                                }`}>
                                  {item.instructor ? item.instructor[0] : 'L'}
                                </div>
                                <div className="text-left">
                                  <p className="text-[9px] text-zinc-400 uppercase tracking-wider font-semibold">Professeur</p>
                                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{item.instructor}</p>
                                </div>
                              </div>

                              <button
                                id={`class-register-btn-${item.id}`}
                                onClick={() => handleOpenRegister(item)}
                                className={`inline-flex items-center gap-1.5 px-4 py-2.5 font-bold rounded-xl text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer hover:scale-105 ${
                                  isClassOpen
                                    ? isFull
                                      ? 'bg-zinc-700 hover:bg-zinc-800 text-zinc-200'
                                      : isSalsa
                                      ? 'bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white'
                                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white'
                                    : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700'
                                }`}
                              >
                                {isClassOpen ? (
                                  <>
                                    <span>{isFull ? "Liste d'attente" : "S'inscrire"}</span>
                                    <ChevronRight size={14} />
                                  </>
                                ) : (
                                  <>
                                    <Lock size={12} className="text-amber-500" />
                                    <span>Fermé / Détails</span>
                                  </>
                                )}
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* User Current Inscriptions Board */}
        {inscriptions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="border border-rose-100 dark:border-zinc-800 bg-rose-50/30 dark:bg-zinc-900/30 rounded-3xl p-6 md:p-8 text-left mb-16"
          >
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <CheckCircle size={20} className="text-emerald-500" />
                  <span>Vos Demandes d'Inscription</span>
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                  Retrouvez ici vos pré-inscriptions et places en liste d'attente enregistrées.
                </p>
              </div>
              <span className="text-xs px-3 py-1.5 bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 rounded-full font-bold">
                {inscriptions.length} enregistrée(s)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inscriptions.map((ins) => {
                const isWaitlisted = ins.status === "Liste d'attente";
                return (
                  <div
                    key={ins.id}
                    id={`my-inscription-card-${ins.id}`}
                    className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between space-y-4 shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-zinc-900 dark:text-white">{ins.className}</h4>
                        <p className="text-xs text-zinc-500 font-mono mt-0.5">Pour : {ins.userName} ({ins.userEmail})</p>
                        <p className="text-[11px] text-zinc-400 font-mono">Date : {ins.date}</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isWaitlisted
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400'
                          : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                      }`}>
                        {ins.status || 'Confirmée'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                      <span className="text-xs text-zinc-500">Niveau : {ins.level}</span>
                      <button
                        id={`my-inscription-delete-btn-${ins.id}`}
                        onClick={() => handleCancelInscription(ins.id, ins.className)}
                        className="p-2 text-zinc-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer flex items-center gap-1 text-xs"
                        title="Annuler"
                      >
                        <Trash2 size={15} />
                        <span>Retirer</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ======================================================= */}
        {/* MODAL 1: CONDITIONS GÉNÉRALES D'INSCRIPTION & RÈGLEMENT */}
        {/* ======================================================= */}
        <AnimatePresence>
          {showConditionsModal && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                id="conditions-generales-modal"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="relative bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 max-w-3xl w-full p-6 md:p-8 max-h-[90vh] flex flex-col text-left"
              >
                {/* Modal Header */}
                <div className="flex justify-between items-start pb-5 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 bg-rose-500/10 text-rose-500 rounded-lg">
                        <FileText size={18} />
                      </span>
                      <span className="text-[10px] uppercase font-extrabold tracking-widest text-rose-500">
                        {generalConditions.lastUpdated || 'Saison 2026 - 2027'}
                      </span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white">
                      {generalConditions.title}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {generalConditions.subtitle}
                    </p>
                  </div>

                  <button
                    id="close-conditions-modal-btn"
                    onClick={() => setShowConditionsModal(false)}
                    className="p-2 bg-zinc-100 hover:bg-rose-100 text-zinc-500 hover:text-rose-600 rounded-full transition-colors cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Official PDF Download Banner if uploaded */}
                {generalConditions?.pdfUrl && (
                  <div className="p-4 my-3 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-rose-500/10 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0 shadow-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <FileText size={20} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-zinc-900 dark:text-white">
                            Document PDF Officiel du Règlement
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[9px] font-extrabold uppercase">
                            Certifié
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                          {generalConditions.pdfFileName || "Reglement_Interieur_La_Maloka.pdf"} {generalConditions.pdfFileSize ? `• ${generalConditions.pdfFileSize}` : ''}
                        </p>
                      </div>
                    </div>

                    <a
                      id="modal-download-official-pdf-btn"
                      href={generalConditions.pdfUrl}
                      download={generalConditions.pdfFileName || "Reglement_Interieur_La_Maloka_2026_2027.pdf"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-105 shrink-0 w-full sm:w-auto"
                    >
                      <Download size={14} />
                      <span>Télécharger le PDF</span>
                    </a>
                  </div>
                )}

                {/* Search Bar inside General Conditions */}
                <div className="pb-3 shrink-0">
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-3 text-zinc-400" />
                    <input
                      type="text"
                      value={conditionsSearch}
                      onChange={(e) => setConditionsSearch(e.target.value)}
                      placeholder="Rechercher dans le règlement (ex: paiement, remboursement, certificat, chaussures)..."
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500 text-zinc-800 dark:text-zinc-200"
                    />
                  </div>
                </div>

                {/* Modal Content - Scrollable Articles List */}
                <div className="overflow-y-auto space-y-4 pr-2 py-2 flex-1 no-scrollbar">
                  {filteredConditions.length === 0 ? (
                    <div className="text-center py-12 text-zinc-400">
                      <HelpCircle size={32} className="mx-auto mb-2 text-zinc-300" />
                      <p className="text-sm font-semibold">Aucun article ne correspond à votre recherche.</p>
                    </div>
                  ) : (
                    filteredConditions.map((section, idx) => (
                      <div
                        key={section.id || idx}
                        id={`condition-section-${section.id}`}
                        className="p-5 rounded-2xl bg-zinc-50/80 dark:bg-zinc-850/60 border border-zinc-200/80 dark:border-zinc-800 space-y-2 hover:border-rose-200 transition-colors"
                      >
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                          <span>{section.title}</span>
                        </h4>
                        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed pl-4">
                          {section.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Modal Footer */}
                <div className="pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
                  <div className="text-[11px] text-zinc-500">
                    Pour toute question : <a href="mailto:association.lamaloka@gmail.com" className="text-rose-500 font-bold underline">association.lamaloka@gmail.com</a>
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto flex-wrap">
                    {generalConditions?.pdfUrl && (
                      <a
                        id="footer-download-pdf-btn"
                        href={generalConditions.pdfUrl}
                        download={generalConditions.pdfFileName || "Reglement_Interieur_La_Maloka_2026_2027.pdf"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-emerald-500/20"
                      >
                        <Download size={13} />
                        <span>Télécharger PDF</span>
                      </a>
                    )}

                    <button
                      onClick={() => window.print()}
                      className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Printer size={14} />
                      <span>Imprimer</span>
                    </button>

                    <button
                      onClick={() => setShowConditionsModal(false)}
                      className="flex-1 sm:flex-initial px-6 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      J'ai compris
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* ======================================================= */}
        {/* MODAL 2: INFORMATIVE COURSE DETAILS MODAL (MODE INFO)   */}
        {/* ======================================================= */}
        <AnimatePresence>
          {selectedInfoClass && (() => {
            const liveClass = (classes || []).find(c => c.id === selectedInfoClass.id) || selectedInfoClass;
            const isClassRegistrationOpen = liveClass.visibility !== 'Privé' && liveClass.active !== false;

            const helloAssoLink = liveClass.helloAssoUrl && liveClass.helloAssoUrl !== 'https://www.helloasso.com/associations/la-maloka'
              ? liveClass.helloAssoUrl
              : liveClass.id === 'c-essai-salsa-2026' || liveClass.name.toLowerCase().includes('essai')
              ? 'https://www.helloasso.com/associations/la-maloka/adhesions/cours-d-essai-salsa-cubaine-vendredi-11-septembre-2026-20-heures'
              : liveClass.id === 'c-salsa-flf-20h-2026' || (liveClass.name.toLowerCase().includes('salsa') && liveClass.name.toLowerCase().includes('débutant'))
              ? 'https://www.helloasso.com/associations/la-maloka/adhesions/salsa-cubaine-debutant-saison-2026-2027-cours-a-20h-fontenay-le-fleury'
              : liveClass.id === 'c-salsa-flf-21h-2026' || (liveClass.name.toLowerCase().includes('salsa') && (liveClass.name.toLowerCase().includes('inter') || liveClass.name.toLowerCase().includes('21h')))
              ? 'https://www.helloasso.com/associations/la-maloka/adhesions/salsa-cubaine-inter-avance-saison-2026-2027-cours-a-21h-fontenay-le-fleury-2'
              : liveClass.id === 'c-cardio-lqy-20h-2026' || (liveClass.name.toLowerCase().includes('cardio') && (liveClass.name.toLowerCase().includes('queue') || liveClass.name.toLowerCase().includes('mardi')))
              ? 'https://www.helloasso.com/associations/la-maloka/adhesions/cardio-latino-tous-niveaux-saison-2026-2027-cours-a-20h-la-queue-lez-yvelines'
              : liveClass.id === 'c-cardio-flf-20h-2026' || (liveClass.name.toLowerCase().includes('cardio') && liveClass.name.toLowerCase().includes('20h'))
              ? 'https://www.helloasso.com/associations/la-maloka/adhesions/cardio-latino-cours-de-20h-tous-niveaux-saison-2026-2027-fontenay-le-fleury'
              : liveClass.id === 'c-cardio-flf-21h-2026' || (liveClass.name.toLowerCase().includes('cardio') && liveClass.name.toLowerCase().includes('21h'))
              ? 'https://www.helloasso.com/associations/la-maloka/adhesions/cardio-latino-cours-de-21h-tous-niveaux-saison-2026-2027-fontenay-le-fleury'
              : liveClass.helloAssoUrl || 'https://www.helloasso.com/associations/la-maloka';

            const isTrial = liveClass.isTrialClass || liveClass.id === 'c-essai-salsa-2026' || liveClass.name.toLowerCase().includes('essai');
            const liveMaxSpots = liveClass.maxSpots || 30;
            const liveRegistered = liveClass.subscribersCount || 0;
            const liveSpotsLeft = liveClass.spotsRemaining !== undefined ? liveClass.spotsRemaining : Math.max(0, liveMaxSpots - liveRegistered);
            const liveIsFull = liveSpotsLeft <= 0;

            return (
              <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
                <motion.div
                  id="info-class-modal-container"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="relative bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800 max-w-lg w-full p-6 md:p-8 text-left"
                >
                  <div className="flex justify-between items-start pb-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-800 dark:text-amber-300">
                          Fiche Information Cours • {liveClass.season || 'Saison 2026 - 2027'}
                        </span>
                        {!isClassRegistrationOpen && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700 flex items-center gap-1">
                            <Lock size={10} className="text-amber-500" />
                            Privé / Fermé
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-black text-zinc-900 dark:text-white">
                        {liveClass.name}
                      </h3>
                    </div>
                    <button
                      id="close-info-class-modal-btn"
                      onClick={() => setSelectedInfoClass(null)}
                      className="p-2 bg-zinc-100 hover:bg-rose-100 text-zinc-500 hover:text-rose-600 rounded-full transition-colors cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="py-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                    {/* Key Info Cards */}
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60">
                        <p className="text-[10px] text-zinc-500 uppercase font-bold">Discipline & Niveau</p>
                        <p className="text-xs font-black text-zinc-900 dark:text-white mt-0.5">{liveClass.category || 'Danse'}</p>
                        <p className="text-[11px] text-rose-500 font-semibold">{liveClass.level}</p>
                      </div>

                      <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60">
                        <p className="text-[10px] text-zinc-500 uppercase font-bold">Tarif Officiel</p>
                        <p className="text-sm font-black text-rose-600 dark:text-rose-400 mt-0.5">
                          {isTrial ? 'Gratuit (Séance d\'essai)' : liveClass.annualPrice ? `${liveClass.annualPrice} € / an` : `${liveClass.priceMonthly} € / m`}
                        </p>
                        <p className="text-[10px] text-zinc-500">{isTrial ? 'Sans engagement' : 'Paiement 3x possible'}</p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 space-y-2">
                      <div className="flex items-center gap-2 text-xs">
                        <Clock size={15} className="text-orange-500 shrink-0" />
                        <span className="font-bold text-zinc-900 dark:text-white">{liveClass.schedule}</span>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <MapPin size={15} className="text-rose-500 shrink-0" />
                        <div>
                          <span className="font-bold text-zinc-900 dark:text-white">{liveClass.location}</span>
                          <span className="text-zinc-500 block text-[11px]">{liveClass.roomName || 'Salle dédiée'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <Users size={15} className="text-emerald-500 shrink-0" />
                        <span className="text-zinc-700 dark:text-zinc-300">Professeur : <strong>{liveClass.instructor || 'Yasmilka Valdés & Équipe'}</strong></span>
                      </div>
                    </div>

                    {liveClass.description && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed bg-zinc-50/50 dark:bg-zinc-800/30 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                        {liveClass.description}
                      </p>
                    )}

                    {/* DEDICATED HELLOASSO ADHESION CARD (WHEN PUBLIC & ACTIVE) */}
                    {isClassRegistrationOpen && helloAssoLink ? (
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border-2 border-emerald-500/30 space-y-3.5 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                              ADHÉSION & INSCRIPTION EN DIRECT HELLOASSO
                            </h4>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-900 dark:text-emerald-200 font-bold border border-emerald-500/30">
                            HelloAsso Live
                          </span>
                        </div>

                        {/* Capacity / Aforo live status grid */}
                        <div className="grid grid-cols-3 gap-2 bg-emerald-950/20 dark:bg-zinc-950/40 p-2.5 rounded-xl border border-emerald-500/20 text-center">
                          <div>
                            <span className="text-[9px] uppercase font-bold text-zinc-500 dark:text-zinc-400 block">Capacité / Aforo</span>
                            <span className="text-sm font-extrabold text-zinc-900 dark:text-white font-mono">{liveMaxSpots} places</span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-zinc-500 dark:text-zinc-400 block">Inscrits HelloAsso</span>
                            <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{liveRegistered} adhérent{liveRegistered > 1 ? 's' : ''}</span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase font-bold text-zinc-500 dark:text-zinc-400 block">Places Restantes</span>
                            <span className={`text-sm font-extrabold font-mono ${liveIsFull ? 'text-rose-500' : 'text-emerald-500'}`}>
                              {liveIsFull ? '0 (Complet)' : `${liveSpotsLeft} place${liveSpotsLeft > 1 ? 's' : ''}`}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium leading-relaxed">
                          {isTrial 
                            ? "Réservez votre place gratuite pour le cours d'essai directement sur notre billetterie HelloAsso." 
                            : "Finalisez votre inscription et réglez votre adhésion en toute sécurité (paiement sécurisé en 1x ou 3x) sur la page HelloAsso officielle du cours."}
                        </p>

                        <a
                          id={`helloasso-direct-btn-${liveClass.id}`}
                          href={helloAssoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 group cursor-pointer hover:shadow-lg hover:shadow-emerald-500/25"
                        >
                          <span>👉 S'INSCRIRE / ADHÉRER SUR HELLOASSO</span>
                          <ExternalLink size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                        </a>

                        <div className="pt-1 text-[10px] text-zinc-500 dark:text-zinc-400 break-all font-mono bg-white/60 dark:bg-black/40 p-2 rounded-lg border border-emerald-500/20">
                          <span className="font-bold text-zinc-700 dark:text-zinc-300 block mb-0.5">Lien HelloAsso :</span>
                          <a href={helloAssoLink} target="_blank" rel="noopener noreferrer" className="text-emerald-700 dark:text-emerald-400 hover:underline">
                            {helloAssoLink}
                          </a>
                        </div>
                      </div>
                    ) : (
                      /* DEDICATED CLOSED / PRIVATE INSCRIPTION CARD (SAME SIZE & SHAPE) */
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-zinc-100 via-amber-50/30 to-zinc-100 dark:from-zinc-800/90 dark:via-zinc-850 dark:to-zinc-800/90 border-2 border-zinc-300/80 dark:border-zinc-700 space-y-3 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-200">
                              Les inscriptions sont actuellement fermées
                            </h4>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold border border-zinc-300 dark:border-zinc-700">
                            Fermé / Privé
                          </span>
                        </div>

                        <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                          Les inscriptions en ligne pour ce créneau sont temporairement suspendues ou complètes. Pour toute question, demande d'inscription ou pour rejoindre la liste d'attente, contactez directement l'association par email.
                        </p>

                        <div className="w-full py-3.5 px-4 bg-zinc-200/90 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 select-none border border-zinc-300/60 dark:border-zinc-700/60">
                          <Lock size={15} className="text-zinc-400" />
                          <span>Inscriptions en ligne fermées</span>
                        </div>

                        <div className="pt-1 text-[11px] text-zinc-600 dark:text-zinc-400 bg-white/70 dark:bg-black/40 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700/60 flex items-center justify-between gap-2">
                          <span className="truncate">Pour être averti d'une place :</span>
                          <a
                            id={`modal-contact-waitlist-btn-${liveClass.id}`}
                            href={`mailto:association.lamaloka@gmail.com?subject=Demande d'inscription / Liste d'attente - ${encodeURIComponent(liveClass.name)}`}
                            className="text-rose-600 dark:text-rose-400 font-bold hover:underline inline-flex items-center gap-1 shrink-0"
                          >
                            <Mail size={12} />
                            <span>Liste d'attente</span>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-2.5">
                    {isClassRegistrationOpen && helloAssoLink ? (
                      <a
                        id={`modal-footer-helloasso-btn-${liveClass.id}`}
                        href={helloAssoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-3 text-center bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md inline-flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ExternalLink size={14} />
                        <span>Ouvrir HelloAsso</span>
                      </a>
                    ) : (
                      <a
                        id={`modal-footer-contact-waitlist-btn-${liveClass.id}`}
                        href={`mailto:association.lamaloka@gmail.com?subject=Demande d'inscription - ${encodeURIComponent(liveClass.name)}`}
                        className="flex-1 py-3 text-center bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md inline-flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Mail size={14} />
                        <span>Contacter l'Association</span>
                      </a>
                    )}
                    <a
                      href="mailto:association.lamaloka@gmail.com"
                      className="py-3 px-4 text-center bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md inline-flex items-center justify-center gap-2"
                    >
                      <Mail size={14} />
                      <span>Email</span>
                    </a>
                    <button
                      onClick={() => setSelectedInfoClass(null)}
                      className="px-5 py-3 text-center bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold rounded-2xl text-xs transition-colors cursor-pointer"
                    >
                      Fermer
                    </button>
                  </div>
                </motion.div>
              </div>
            );
          })()}
        </AnimatePresence>

        {/* ======================================================= */}
        {/* MODAL 3: FORMULAIRE D'INSCRIPTION / LISTE D'ATTENTE     */}
        {/* ======================================================= */}
        <AnimatePresence>
          {isRegistering && selectedClass && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                id="inscription-modal-container"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-rose-100 dark:border-zinc-800 max-w-lg w-full p-6 md:p-8"
              >
                {(() => {
                  const maxSpots = selectedClass.maxSpots || 30;
                  const registeredCount = selectedClass.subscribersCount !== undefined ? selectedClass.subscribersCount : inscriptions.filter(i => i.classId === selectedClass.id && i.status !== "Liste d'attente").length;
                  const isFull = registeredCount >= maxSpots;

                  return (
                    <>
                      <div className="flex justify-between items-start mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                        <div className="text-left">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-orange-500">
                            {isFull ? "Liste d'Attente • Saison 2026 - 2027" : "Pré-Inscription • Saison 2026 - 2027"}
                          </span>
                          <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">{selectedClass.name}</h3>
                        </div>
                        <button
                          id="close-inscription-modal-btn"
                          onClick={() => setIsRegistering(false)}
                          className="p-1.5 bg-zinc-100 hover:bg-rose-100 text-zinc-500 hover:text-rose-600 rounded-full transition-colors cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-4 text-left">
                        {/* Class and Room Info Card */}
                        <div className="bg-orange-50/40 dark:bg-zinc-800/40 p-4 rounded-2xl space-y-2 mb-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-xs text-zinc-400 font-medium">Lieu & Salle :</span>
                              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                                {selectedClass.roomName || 'Salle Polyvalente'} • {selectedClass.location}
                              </p>
                            </div>
                            <span className="text-sm font-black text-rose-500">
                              {selectedClass.annualPrice ? `${selectedClass.annualPrice} €/an` : `${selectedClass.priceMonthly} €/mois`}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-zinc-200/50 dark:border-zinc-700/50">
                            <span className="text-zinc-500">Créneau : {selectedClass.schedule}</span>
                            <span className="font-mono text-zinc-600 dark:text-zinc-300 font-bold">
                              Jauge : {registeredCount}/{maxSpots} places
                            </span>
                          </div>
                        </div>

                        {/* Full capacity warning if full */}
                        {isFull && (
                          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                            <div>
                              <strong className="block font-bold">Jauge de salle atteinte ({maxSpots} places)</strong>
                              Votre demande sera enregistrée sur la <strong>Liste d'attente prioritaire</strong>. Dès qu'un désistement survient ou qu'une salle supplémentaire est ouverte, vous serez contacté(e) en priorité.
                            </div>
                          </div>
                        )}

                        {/* Name field */}
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block">Nom & Prénom :</label>
                          <div className="relative">
                            <User size={16} className="absolute left-3 top-3 text-zinc-400" />
                            <input
                              id="inscription-form-name"
                              type="text"
                              required
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              placeholder="Ex. Camille Dubois"
                              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white text-sm text-zinc-800 dark:text-zinc-200"
                            />
                          </div>
                        </div>

                        {/* Email field */}
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block">Adresse E-mail :</label>
                          <div className="relative">
                            <Mail size={16} className="absolute left-3 top-3 text-zinc-400" />
                            <input
                              id="inscription-form-email"
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="camille.dubois@email.fr"
                              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white text-sm text-zinc-800 dark:text-zinc-200"
                            />
                          </div>
                        </div>

                        {/* Phone field */}
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block">Téléphone Portable :</label>
                          <div className="relative">
                            <Phone size={16} className="absolute left-3 top-3 text-zinc-400" />
                            <input
                              id="inscription-form-phone"
                              type="tel"
                              required
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="06 12 34 56 78"
                              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white text-sm text-zinc-800 dark:text-zinc-200"
                            />
                          </div>
                        </div>

                        {/* Level select */}
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block">Votre niveau de pratique :</label>
                          <select
                            id="inscription-form-level"
                            value={studentLevel}
                            onChange={(e) => setStudentLevel(e.target.value)}
                            className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm text-zinc-800 dark:text-zinc-200"
                          >
                            <option value="Débutant">Débutant (Première année / Initiation)</option>
                            <option value="Intermédiaire">Intermédiaire (J'ai déjà les bases de la danse)</option>
                            <option value="Tous Niveaux">Tous Niveaux (Accessible à tous)</option>
                          </select>
                        </div>

                        {/* Link to conditions inside form */}
                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 pt-1">
                          <Info size={13} className="text-rose-500 shrink-0" />
                          <span>En vous inscrivant, vous acceptez les</span>
                          <button
                            type="button"
                            onClick={() => setShowConditionsModal(true)}
                            className="text-rose-500 font-bold underline hover:text-rose-600 cursor-pointer"
                          >
                            Conditions Générales
                          </button>
                        </div>

                        {/* Practical note */}
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/40 rounded-xl flex items-start gap-2 text-[11px] text-emerald-800 dark:text-emerald-300">
                          <CheckCircle size={15} className="shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Votre pré-inscription vous réserve une place prioritaire. Vous recevrez un récapitulatif par e-mail avec les modalités de la rentrée.</span>
                        </div>

                        <div className="pt-4 flex gap-3">
                          <button
                            id="cancel-inscription-modal"
                            type="button"
                            onClick={() => setIsRegistering(false)}
                            className="flex-1 py-3 text-center bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold rounded-2xl text-xs transition-colors cursor-pointer"
                          >
                            Annuler
                          </button>
                          <button
                            id="submit-inscription-modal"
                            type="submit"
                            className={`flex-1 py-3 text-center text-white font-bold rounded-2xl text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer ${
                              isFull
                                ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700'
                                : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
                            }`}
                          >
                            {isFull ? "Rejoindre la Liste d'Attente" : "Valider la Pré-Inscription"}
                          </button>
                        </div>
                      </form>
                    </>
                  );
                })()}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
