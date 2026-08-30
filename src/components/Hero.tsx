import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, Sparkles, MapPin, Music, Flame, CheckCircle, ArrowRight, Clock, Award, Info, HeartHandshake, Mail, Phone, MessageCircle, Instagram, QrCode, ShieldCheck } from 'lucide-react';
import { FloatingMonstera, FloatingHibiscus, FloatingParrot, LaMalokaOfficialLogoSVG, LaMalokaLogoBadge } from './TropicalDecorations';
import { HomePageContent, SiteSettings, HomepageVignette } from '../types';
import { InstagramQRModal } from './InstagramQRModal';
import qrImage from '../assets/images/instagram_qr_1786885774879.jpg';
import { StructuralImage } from './StructuralImage';

interface HeroProps {
  siteSettings: SiteSettings;
  onExploreClasses: (categoryFilter?: string) => void;
  onViewCalendar: () => void;
  onViewRegistrationDates: () => void;
  content: HomePageContent;
}

export const Hero: React.FC<HeroProps> = ({
  siteSettings,
  onExploreClasses,
  onViewCalendar,
  onViewRegistrationDates,
  content
}) => {
  const [showQRModal, setShowQRModal] = useState(false);
  const { vignettes, registrationInfo, moduleToggles } = siteSettings;
  const activeVignettes = vignettes.filter((v) => v.active);

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-amber-50/40 via-white to-rose-50/20 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 pb-16">
      
      {/* Absolute Tropical Background Floating Elements & Official Watermark */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] max-w-[85vw] opacity-[0.045] dark:opacity-[0.06] pointer-events-none select-none -z-10">
        <LaMalokaOfficialLogoSVG />
      </div>
      <FloatingMonstera delay={0} size="w-48 h-48" className="absolute top-10 -left-12 text-emerald-600/10 dark:text-emerald-500/5 rotate-12" />
      <FloatingMonstera delay={3} size="w-72 h-72" className="absolute bottom-10 -right-20 text-emerald-500/10 dark:text-emerald-500/5 rotate-45" />
      <FloatingHibiscus delay={1} size="w-32 h-32" className="absolute top-1/3 -right-8 text-rose-500/10 dark:text-rose-400/5" />
      <FloatingHibiscus delay={5} size="w-28 h-28" className="absolute bottom-1/4 left-10 text-orange-500/10 dark:text-orange-400/5 rotate-90" />
      <FloatingParrot delay={2} className="absolute top-16 right-1/4 text-rose-500/5 w-28 h-28 hidden md:block" />

      {/* Top Registration Notification Banner (if active) */}
      {content.published && content.bannerText && (
        <div className="bg-gradient-to-r from-orange-500 via-rose-500 to-emerald-600 text-white text-xs sm:text-sm font-medium py-3 px-4 shadow-sm relative z-20">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="shrink-0 animate-bounce" />
              <span>{content.bannerText}</span>
            </div>
            <button
              id="hero-banner-dates-btn"
              onClick={content.bannerButtonDestination === 'agenda' ? onViewCalendar : onViewRegistrationDates}
              className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-all duration-150 backdrop-blur-sm whitespace-nowrap cursor-pointer"
            >
              {content.bannerButtonText} ➔
            </button>
          </div>
        </div>
      )}

      {/* Hero Header Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 text-xs font-semibold uppercase tracking-wider"
            >
              <Sparkles size={14} className="animate-spin text-orange-500" />
              <span>{content.eyebrow || siteSettings.tagline || 'Salsa Cubaine & Cardio Latino'}</span>
            </motion.div>

            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-zinc-900 dark:text-white leading-tight"
              >
                {content.headline || siteSettings.heroHeadline || 'La Danse et le Rythme se Vivent à'}{' '}
                <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-rose-500 to-emerald-500">
                  {content.highlight || siteSettings.associationName || 'La Maloka'}
                  <svg className="absolute -bottom-2 left-0 w-full h-3 text-rose-400/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0,5 Q50,10 100,5" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" />
                  </svg>
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-base sm:text-lg md:text-xl text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto lg:mx-0 font-light leading-relaxed"
              >
                {content.description || siteSettings.heroSubheadline}
              </motion.p>
            </div>

            {/* Locations Badge Banner */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-xs"
            >
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 rounded-xl border border-rose-100 dark:border-rose-900/40">
                <MapPin size={13} className="text-rose-500" />
                <span className="font-semibold">{content.locationBadgeOne}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                <MapPin size={13} className="text-emerald-500" />
                <span className="font-semibold">{content.locationBadgeTwo}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300 rounded-xl border border-amber-100 dark:border-amber-900/40">
                <Award size={13} className="text-amber-500" />
                <span className="font-semibold">{content.seasonBadge}</span>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2"
            >
              <button
                id="hero-explore-classes-btn"
                onClick={content.primaryButtonDestination === 'agenda' ? onViewCalendar : () => onExploreClasses()}
                className="px-8 py-4 bg-gradient-to-r from-orange-500 via-rose-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/20 hover:shadow-rose-500/30 hover:scale-[1.02] active:scale-95 transition-all duration-200 cursor-pointer text-center flex items-center justify-center gap-2"
              >
                <span>
                  {content.primaryButtonText}
                </span>
                <ArrowRight size={18} />
              </button>
              <button
                id="hero-view-calendar-btn"
                onClick={content.secondaryButtonDestination === 'cours' ? () => onExploreClasses() : onViewCalendar}
                className="px-7 py-4 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-bold rounded-2xl hover:scale-[1.02] active:scale-95 transition-all duration-200 border border-emerald-200 dark:border-emerald-900/50 cursor-pointer text-center flex items-center justify-center gap-2"
              >
                <Calendar size={18} />
                <span>{content.secondaryButtonText}</span>
              </button>
            </motion.div>
          </div>

          {/* Right Side - Visual Collage Card with Official Logo */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="relative rounded-3xl overflow-hidden p-3 bg-gradient-to-tr from-orange-400 via-rose-500 to-emerald-500 shadow-2xl shadow-rose-500/25 max-w-md mx-auto lg:max-w-none"
            >
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-zinc-900">
                <StructuralImage
                  src={content.heroImageUrl || siteSettings.heroImage || "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=1000"}
                  alt="La Maloka Salsa Cubaine et Cardio Latino"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                
                {/* Image Overlay Label */}
                <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent text-white">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-[10px] font-black uppercase tracking-wider">Association</span>
                    <span className="text-xs font-semibold text-zinc-200">Fontenay & La Queue-les-Yvelines</span>
                  </div>
                  <h3 className="text-base font-bold mt-1.5 text-white">{content.overlayTitle}</h3>
                  <p className="text-xs text-zinc-300 font-light mt-0.5">{content.overlayText}</p>
                </div>
              </div>
            </motion.div>

            {/* Logo Floating Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 }}
              className="absolute -bottom-6 -left-4 sm:-bottom-7 sm:-left-6 z-20"
            >
              <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-2.5 rounded-2xl shadow-2xl border border-lime-300/80 dark:border-zinc-700 flex items-center gap-3">
                <div className="w-16 h-13 sm:w-20 sm:h-16 rounded-xl overflow-hidden shadow-md bg-[#95B208] p-0.5 shrink-0">
                  {content.logoUrl ? <StructuralImage src={content.logoUrl} alt="" className="h-full w-full object-contain" /> : <LaMalokaOfficialLogoSVG withBackground={true} className="w-full h-full object-contain" />}
                </div>
                <div className="text-left pr-2">
                  <h4 className="text-xs sm:text-sm font-black text-zinc-900 dark:text-white">La Maloka</h4>
                  <span className="text-[10px] text-zinc-500 block">Association Fondée en 2008</span>
                </div>
              </div>
            </motion.div>

            {/* Floating Registration Dates Badge */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              onClick={onViewRegistrationDates}
              className="absolute -top-4 -right-2 bg-white dark:bg-zinc-800 p-3.5 rounded-2xl shadow-xl border border-rose-100 dark:border-zinc-700 flex items-center gap-3 z-20 cursor-pointer hover:scale-105 transition-transform"
            >
              <div className="w-10 h-10 overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 flex items-center justify-center text-white text-lg">{content.overlayImageUrl ? <StructuralImage src={content.overlayImageUrl} alt="" className="h-full w-full object-cover" /> : "📅"}</div>
              <div className="text-left">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-white">Forums & Inscriptions</h4>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Septembre 2026</p>
              </div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* THE TWO DEDICATED VIGNETTES: SALSA CUBAINE & CARDIO LATINO */}
      {/* ========================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <span className="text-xs uppercase font-extrabold tracking-widest text-rose-500 dark:text-rose-400">{content.sections.find((section) => section.id === 'disciplines' && section.visible)?.subtitle || 'Nos Deux Disciplines'}</span>
          <h2 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white">{content.sections.find((section) => section.id === 'disciplines' && section.visible)?.title || 'Choisissez Votre Univers de Danse'}</h2>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base font-light">
            À La Maloka, nous concentrons toute notre énergie et notre pédagogie sur deux pratiques complémentaires et dynamiques.
          </p>
        </div>

        {/* 2 Big Vignettes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {activeVignettes.map((vignette) => {
            const isSalsa = vignette.id === 'salsa-cubaine';
            
            return (
              <motion.div
                key={vignette.id}
                id={`vignette-${vignette.id}`}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
                className={`rounded-3xl border overflow-hidden flex flex-col justify-between shadow-lg transition-all duration-300 ${
                  isSalsa
                    ? 'bg-gradient-to-b from-orange-50/50 via-white to-amber-50/30 dark:from-zinc-900 dark:via-zinc-900 dark:to-orange-950/10 border-orange-200/70 dark:border-zinc-800 hover:shadow-orange-500/10'
                    : 'bg-gradient-to-b from-emerald-50/50 via-white to-teal-50/30 dark:from-zinc-900 dark:via-zinc-900 dark:to-emerald-950/10 border-emerald-200/70 dark:border-zinc-800 hover:shadow-emerald-500/10'
                }`}
              >
                {/* Vignette Top Image */}
                <div className="relative h-64 sm:h-72 overflow-hidden bg-zinc-800">
                  <img
                    src={vignette.image}
                    alt={vignette.title}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Badge floating */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-white shadow-md ${
                      isSalsa ? 'bg-orange-500' : 'bg-emerald-600'
                    }`}>
                      {vignette.badge}
                    </span>
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
                    <h3 className="text-2xl sm:text-3xl font-black">{vignette.title}</h3>
                    <p className="text-xs sm:text-sm text-zinc-200 font-light mt-1">{vignette.subtitle}</p>
                  </div>
                </div>

                {/* Vignette Body Content */}
                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
                  
                  <div className="space-y-4 text-left">
                    <p className="text-sm text-zinc-600 dark:text-zinc-300 font-light leading-relaxed">
                      {vignette.description}
                    </p>

                    {/* Key Highlights */}
                    <div className="space-y-2 pt-2">
                      <span className="text-[11px] uppercase font-bold tracking-wider text-zinc-400 block">
                        Points Clés & Ambiance :
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {vignette.keyPoints.map((point, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                            <CheckCircle size={14} className={`shrink-0 mt-0.5 ${
                              isSalsa ? 'text-orange-500' : 'text-emerald-500'
                            }`} />
                            <span>{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Schedule & Location Pills */}
                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/50 dark:border-zinc-700 flex items-center gap-2.5">
                        <Clock size={16} className={isSalsa ? 'text-orange-500' : 'text-emerald-500'} />
                        <div>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase">Créneaux :</p>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200">{vignette.scheduleSummary}</p>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/50 dark:border-zinc-700 flex items-center gap-2.5">
                        <MapPin size={16} className={isSalsa ? 'text-orange-500' : 'text-emerald-500'} />
                        <div>
                          <p className="text-[10px] text-zinc-400 font-bold uppercase">Lieux :</p>
                          <p className="font-semibold text-zinc-800 dark:text-zinc-200">{vignette.locationSummary}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vignette CTA */}
                  <div className="pt-4">
                    <button
                      id={`vignette-btn-${vignette.id}`}
                      onClick={() => onExploreClasses(isSalsa ? 'Salsa Cubaine' : 'Cardio Latino')}
                      className={`w-full py-3.5 px-6 rounded-2xl font-bold text-white text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all duration-200 cursor-pointer ${
                        isSalsa
                          ? 'bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 shadow-orange-500/20'
                          : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-600/20'
                      }`}
                    >
                      <span>Voir les Cours de {isSalsa ? 'Salsa Cubaine' : 'Cardio Latino'}</span>
                      <ArrowRight size={16} />
                    </button>
                  </div>

                </div>
              </motion.div>
            );
          })}

        </div>

      </div>

      {/* ========================================================= */}
      {/* REGISTRATION DATES & PRACTICAL INFORMATION SECTION */}
      {/* ========================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 relative z-10">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-tr from-zinc-900 via-zinc-800 to-zinc-900 text-white shadow-2xl relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider">
                <Calendar size={14} />
                <span>{registrationInfo.seasonTitle || 'Saison 2026 - 2027'}</span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black">
                Dates clés & informations
              </h3>

              <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
                Retrouvez-nous lors des Forums des Associations au début du mois de septembre. Pour rejoindre un cours, contactez directement l'équipe de La Maloka.
              </p>

              {/* List of Important Dates */}
              <div className="space-y-3">
                {registrationInfo.importantDates.map((d, i) => (
                  <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 font-mono text-xs font-bold">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-amber-300">{d.date}</p>
                      <p className="text-sm font-semibold text-white">{d.label}</p>
                      <p className="text-xs text-zinc-400">{d.location}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  id="home-register-classes-btn"
                  onClick={() => onExploreClasses()}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg"
                >
                  Découvrir les cours
                </button>
                <button
                  id="home-dates-agenda-btn"
                  onClick={onViewCalendar}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all border border-white/20 cursor-pointer flex items-center gap-2"
                >
                  <Calendar size={15} className="text-amber-400" />
                  <span>Consulter l'Agenda & Dates</span>
                </button>
              </div>
            </div>

            {/* Quick Guidelines Card */}
            <div className="lg:col-span-5 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 text-left space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Info size={16} />
                <span>Modalités Pratiques</span>
              </div>
              <h4 className="text-lg font-bold text-white">Comment nous rejoindre ?</h4>
              <ul className="space-y-2.5 text-xs text-zinc-300 font-light">
                {registrationInfo.guidelines.filter(g => !g.toLowerCase().includes('santé') && !g.toLowerCase().includes('sante')).map((g, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
              
              <div className="pt-4 border-t border-white/10 text-xs text-zinc-400">
                <p className="font-semibold text-zinc-300 mb-1">Validation de l'adhésion :</p>
                <p>Fiche d'inscription en ligne ou sur place lors des forums + Règlement de la cotisation annuelle.</p>
              </div>
            </div>

          </div>

          {/* Background decorative flower */}
          <div className="absolute -bottom-10 -right-10 text-white/5 select-none pointer-events-none text-9xl">
            🌺
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* DIRECT CONTACT & LOCATION SUMMARY STRIP */}
      {/* ========================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 relative z-10">
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-orange-100 dark:border-zinc-800 shadow-xl shadow-orange-500/5 text-left">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                <Phone size={14} />
                <span>Une question ? Contactez notre équipe</span>
              </div>
              <h4 className="text-lg md:text-xl font-black text-zinc-900 dark:text-white">
                Nous sommes à votre disposition pour vous renseigner
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light">
                {siteSettings.contactPerson ? `Interlocuteur : ${siteSettings.contactPerson} • ` : ''}
                {siteSettings.contactHours || 'Permanence du Lundi au Samedi'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {siteSettings.contactPhone && (
                <a
                  href={`tel:${siteSettings.contactPhone.replace(/\s+/g, '')}`}
                  className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-bold rounded-xl text-xs flex items-center gap-2 border border-emerald-200 dark:border-emerald-900/50 transition-colors"
                >
                  <Phone size={14} className="text-emerald-500" />
                  <span>{siteSettings.contactPhone}</span>
                </a>
              )}

              {siteSettings.contactEmail && (
                <a
                  href={`mailto:${siteSettings.contactEmail}`}
                  className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 font-bold rounded-xl text-xs flex items-center gap-2 border border-rose-200 dark:border-rose-900/50 transition-colors"
                >
                  <Mail size={14} className="text-rose-500" />
                  <span>{siteSettings.contactEmail}</span>
                </a>
              )}

              {siteSettings.contactWhatsApp && (
                <a
                  href={`https://wa.me/${siteSettings.contactWhatsApp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 font-bold rounded-xl text-xs flex items-center gap-2 border border-teal-200 dark:border-teal-900/50 transition-colors"
                >
                  <MessageCircle size={14} className="text-teal-500" />
                  <span>WhatsApp</span>
                </a>
              )}

              {/* Instagram QR Code Trigger */}
              <button
                onClick={() => setShowQRModal(true)}
                className="px-4 py-2.5 bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-amber-500/10 hover:from-pink-500/20 hover:to-amber-500/20 text-pink-600 dark:text-pink-400 font-bold rounded-xl text-xs flex items-center gap-2 border border-pink-200 dark:border-pink-900/50 transition-all cursor-pointer shadow-sm shadow-pink-500/5"
              >
                <QrCode size={14} className="text-pink-500" />
                <span>Instagram QR</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Instagram QR Code Modal */}
      <InstagramQRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        instagramUrl={siteSettings.instagramUrl || 'https://instagram.com/association_la_maloka'}
        accountHandle="@association_la_maloka"
      />

    </div>
  );
};
