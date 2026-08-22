import React from 'react';
import { Calendar, Sparkles, MapPin, ChevronRight, Clock, Flame } from 'lucide-react';
import { RegistrationInfo, DanceEvent } from '../types';

interface ScrollingTopBannerProps {
  registrationInfo?: RegistrationInfo;
  events?: DanceEvent[];
  onNavigateDate?: (tab: string) => void;
}

export const ScrollingTopBanner: React.FC<ScrollingTopBannerProps> = ({
  registrationInfo,
  events = [],
  onNavigateDate
}) => {
  // Build key dates list combining importantDates and upcoming events
  const defaultDates = [
    {
      date: 'Samedi 5 Septembre 2026',
      time: '10h00 - 18h00',
      title: 'Forum des Associations de Fontenay-le-Fleury',
      location: 'Gymnase du Levant',
      badge: 'Forum Rentrée',
      badgeColor: 'bg-orange-500',
      type: 'forum'
    },
    {
      date: 'Dimanche 6 Septembre 2026',
      time: '10h00 - 17h00',
      title: 'Forum des Associations de La Queue-les-Yvelines',
      location: 'Salle des Fêtes',
      badge: 'Forum Rentrée',
      badgeColor: 'bg-amber-500',
      type: 'forum'
    },
    {
      date: 'Vendredi 11 Septembre 2026',
      time: '20h00',
      title: 'Grand Cours d\'Essai Gratuit Salsa Cubaine',
      location: 'Gymnase du Levant (Fontenay)',
      badge: 'Portes Ouvertes',
      badgeColor: 'bg-rose-500',
      type: 'trial'
    },
    {
      date: 'Lundi 14 Septembre 2026',
      time: 'Dès 20h00',
      title: 'Reprise Officielle des Cours de Danse Saison 2026-2027',
      location: 'Fontenay & La Queue-les-Yvelines',
      badge: 'Rentrée Officielle',
      badgeColor: 'bg-emerald-600',
      type: 'classes'
    },
    {
      date: 'Samedi 10 Octobre 2026',
      time: '20h30',
      title: 'Soirée Tropicale & Stage de Rueda de Casino',
      location: 'Salle Polyvalente',
      badge: 'Événement',
      badgeColor: 'bg-purple-600',
      type: 'event'
    }
  ];

  // If custom importantDates are configured, format them
  const customDates = registrationInfo?.importantDates?.map((d, index) => ({
    date: d.date,
    time: 'Rentrée 2026',
    title: d.label,
    location: d.location,
    badge: index === 0 ? 'Date Clé' : 'Forum / Reprise',
    badgeColor: index % 2 === 0 ? 'bg-orange-500' : 'bg-rose-500',
    type: 'custom'
  })) || [];

  const keyDates = customDates.length > 0 ? customDates : defaultDates;

  // Duplicate items array to ensure seamless infinite scroll loop
  const duplicatedDates = [...keyDates, ...keyDates, ...keyDates];

  return (
    <div className="relative z-50 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white border-b border-zinc-800/80 overflow-hidden select-none py-2">
      {/* Subtle tropical accents */}
      <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-zinc-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-zinc-950 to-transparent z-10 pointer-events-none" />

      {/* Static Label Indicator on Left for Desktops */}
      <div className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-orange-500 to-rose-500 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-md">
        <Sparkles size={11} className="animate-spin text-amber-200" />
        <span>Dates Clés</span>
      </div>

      {/* Continuous Marquee Container */}
      <div 
        className="flex w-max items-center gap-8 group cursor-pointer"
        onClick={() => onNavigateDate && onNavigateDate('calendario')}
        title="Cliquez pour voir tout l'agenda et les dates détaillées"
      >
        <div className="flex shrink-0 items-center gap-8 animate-marquee group-hover:[animation-play-state:paused] md:pl-28">
          {duplicatedDates.map((item, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-3 text-xs text-zinc-300 hover:text-white transition-colors whitespace-nowrap bg-zinc-900/60 hover:bg-zinc-800/80 px-3.5 py-1 rounded-full border border-zinc-800/70"
            >
              {/* Badge */}
              <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider text-white ${item.badgeColor}`}>
                {item.badge}
              </span>

              {/* Date & Time */}
              <span className="font-bold text-amber-300 flex items-center gap-1">
                <Calendar size={12} className="text-orange-400 shrink-0" />
                {item.date}
              </span>

              <span className="text-zinc-500">•</span>

              {/* Title */}
              <span className="font-semibold text-white">
                {item.title}
              </span>

              {/* Location */}
              {item.location && (
                <span className="text-zinc-400 flex items-center gap-1 text-[11px]">
                  <MapPin size={11} className="text-emerald-400 shrink-0" />
                  {item.location}
                </span>
              )}

              <ChevronRight size={12} className="text-zinc-600 group-hover:text-rose-400 transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
