import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DANCE_EVENTS } from '../data';
import { DanceEvent } from '../types';
import { Calendar, MapPin, Clock, UserCheck, Users, Ticket, Tag, Compass, ChevronRight } from 'lucide-react';
import { FloatingMonstera, FloatingHibiscus, HibiscusSVG } from './TropicalDecorations';

interface EventsCalendarProps {
  events?: DanceEvent[];
  onTriggerPayment: (concept: string, amount: number) => void;
  addNotification: (title: string, description: string, type: 'evento' | 'clase' | 'pago' | 'alerta') => void;
}

export const EventsCalendar: React.FC<EventsCalendarProps> = ({
  events = DANCE_EVENTS,
  onTriggerPayment,
  addNotification,
}) => {
  const [selectedType, setSelectedType] = useState<string>('Tous');
  const [activeEvent, setActiveEvent] = useState<DanceEvent | null>(null);
  const [bookings, setBookings] = useState<Record<string, boolean>>({}); // tracking booked events

  const eventTypes = ['Tous', 'Stage', 'Soirée', 'Festival'];

  const filteredEvents = events.filter((ev) => {
    // Map db types to display types
    let mappedType: string = ev.type;
    if (ev.type === 'Taller') mappedType = 'Stage';
    if (ev.type === 'Social') mappedType = 'Soirée';
    if (ev.type === 'Festival') mappedType = 'Festival';

    return selectedType === 'Tous' || mappedType === selectedType || ev.type === selectedType;
  });

  const handleBookEvent = (ev: DanceEvent) => {
    setActiveEvent(null);
    onTriggerPayment(`Entrée Événement : ${ev.title}`, ev.price);
    
    // Simulating booking on payment completion
    setTimeout(() => {
      setBookings((prev) => ({ ...prev, [ev.id]: true }));
      addNotification(
        'Réservation Enregistrée 🎫',
        `Entrée confirmée pour "${ev.title}". Votre place a été réservée avec succès. À vous de danser !`,
        'evento'
      );
    }, 1500); // after simulated checkout is complete
  };

  const getMonthName = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="relative py-12 md:py-16 bg-amber-50/20 dark:bg-zinc-950 min-h-screen">
      
      {/* Tropical leaf decorations */}
      <FloatingMonstera delay={2} size="w-44 h-44" className="absolute top-20 -right-16 text-emerald-500/10 rotate-12 pointer-events-none" />
      <FloatingHibiscus delay={4} size="w-32 h-32" className="absolute bottom-16 -left-12 text-rose-500/10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="flex justify-center text-orange-500">
            <Calendar className="w-10 h-10 animate-bounce" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Prochains Événements & Stages
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 font-light text-sm">
            Soirées de danse sociale le week-end, stages de perfectionnement technique et festivals d'été mémorables. Réservez à l'avance, les places sont strictement limitées !
          </p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap justify-center gap-2 mb-12 bg-white dark:bg-zinc-900 p-3.5 border border-rose-100/60 dark:border-zinc-800 rounded-3xl max-w-lg mx-auto shadow-sm">
          {eventTypes.map((type) => (
            <button
              key={type}
              id={`filter-event-${type}`}
              onClick={() => setSelectedType(type)}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                selectedType === type
                  ? 'bg-gradient-to-r from-orange-500 via-rose-500 to-rose-600 text-white shadow-md'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-rose-500 hover:bg-rose-50/50 dark:hover:bg-zinc-800/50'
              }`}
            >
              {type === 'Tous' ? 'Tous' : type === 'Stage' ? 'Stages' : type === 'Soirée' ? 'Soirées' : 'Festivals'}
            </button>
          ))}
        </div>

        {/* Calendar Grid List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {filteredEvents.map((ev) => {
            const isBooked = bookings[ev.id];
            
            let displayType: string = ev.type;
            if (ev.type === 'Taller') displayType = 'Stage';
            if (ev.type === 'Social') displayType = 'Soirée';
            if (ev.type === 'Festival') displayType = 'Festival';

            return (
              <motion.div
                key={ev.id}
                id={`event-card-${ev.id}`}
                layout
                whileHover={{ scale: 1.01 }}
                className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm flex flex-col sm:flex-row h-full transition-all hover:shadow-lg"
              >
                {/* Event visual thumbnail */}
                <div className="relative w-full sm:w-2/5 aspect-[4/3] sm:aspect-auto min-h-[180px] bg-zinc-100 overflow-hidden">
                  <img
                    src={ev.image}
                    alt={ev.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  {/* Category overlay */}
                  <span className={`absolute top-4 left-4 font-bold text-[10px] tracking-widest uppercase px-3 py-1 rounded-full shadow-md text-white ${
                    displayType === 'Stage'
                      ? 'bg-amber-500'
                      : displayType === 'Soirée'
                      ? 'bg-emerald-500'
                      : 'bg-rose-500'
                  }`}>
                    {displayType}
                  </span>
                </div>

                {/* Event info */}
                <div className="p-6 sm:w-3/5 flex flex-col justify-between text-left space-y-4">
                  <div className="space-y-2">
                    {/* Date/Time Header */}
                    <div className="flex items-center gap-3 text-xs font-semibold text-rose-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {getMonthName(ev.date)}
                      </span>
                      <span className="flex items-center gap-1 text-zinc-400">
                        <Clock size={14} />
                        {ev.time.split(' ')[0]}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-zinc-900 dark:text-white leading-snug">
                      {ev.title}
                    </h3>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {ev.description}
                    </p>
                  </div>

                  {/* Progress seats bar */}
                  <div className="space-y-1 pt-1.5">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      <span>Places Disponibles</span>
                      <span className="text-zinc-700 dark:text-zinc-200">{ev.spotsLeft} de {ev.totalSpots}</span>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-orange-400 to-rose-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${(ev.spotsLeft / ev.totalSpots) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer card metrics */}
                  <div className="flex items-center justify-between pt-3 border-t border-rose-50/50 dark:border-zinc-800/80">
                    <div>
                      <span className="text-[9px] text-zinc-400 uppercase tracking-wider block font-semibold">Tarif Unique</span>
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{ev.price === 0 ? 'Gratuit' : `${ev.price}€`}</span>
                    </div>

                    {isBooked ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-extrabold">
                        <UserCheck size={14} /> Réservé
                      </span>
                    ) : (
                      <button
                        id={`event-open-details-btn-${ev.id}`}
                        onClick={() => setActiveEvent(ev)}
                        className="inline-flex items-center gap-1 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Réserver
                        <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Detailed Event Modal Sheet */}
        <AnimatePresence>
          {activeEvent && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                id="event-detail-modal-container"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-rose-100 dark:border-zinc-800 max-w-xl w-full"
              >
                {/* Hero image for modal */}
                <div className="relative aspect-[16/9] bg-zinc-100">
                  <img
                    src={activeEvent.image}
                    alt={activeEvent.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  
                  {/* Close button */}
                  <button
                    id="close-event-modal-btn"
                    onClick={() => setActiveEvent(null)}
                    className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-rose-600 text-white rounded-full transition-colors cursor-pointer"
                  >
                    ✕
                  </button>

                  {/* Title overlay */}
                  <div className="absolute bottom-4 left-6 right-6 text-white text-left">
                    <span className="text-[10px] bg-orange-500 font-bold uppercase tracking-widest px-3 py-1 rounded-full text-white">
                      {activeEvent.type === 'Taller' ? 'Stage' : activeEvent.type === 'Social' ? 'Soirée' : activeEvent.type}
                    </span>
                    <h3 className="text-xl md:text-2xl font-black mt-2 leading-tight">
                      {activeEvent.title}
                    </h3>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 md:p-8 space-y-6 text-left">
                  
                  {/* Description paragraph */}
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 font-light leading-relaxed">
                    {activeEvent.description}
                  </p>

                  {/* Metadata key grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl">
                      <Calendar className="text-rose-500 shrink-0" size={20} />
                      <div>
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-semibold">Date de l'Événement</span>
                        <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{getMonthName(activeEvent.date)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl">
                      <Clock className="text-rose-500 shrink-0" size={20} />
                      <div>
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-semibold">Horaire</span>
                        <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{activeEvent.time}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl">
                      <MapPin className="text-rose-500 shrink-0" size={20} />
                      <div>
                        <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-semibold">Lieu / Adresse</span>
                        <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{activeEvent.location}</span>
                      </div>
                    </div>

                    {activeEvent.instructor && (
                      <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl">
                        <Users className="text-rose-500 shrink-0" size={20} />
                        <div>
                          <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-semibold">Professeur Principal</span>
                          <span className="text-sm font-bold text-zinc-800 dark:text-zinc-100">{activeEvent.instructor}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Details summary banner */}
                  <div className="p-4 bg-orange-50/50 dark:bg-zinc-800/50 border border-orange-100/50 dark:border-zinc-700/80 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Ticket size={24} className="text-orange-500" />
                      <div>
                        <span className="text-[10px] text-zinc-400 uppercase font-semibold">Tarif Unique</span>
                        <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{activeEvent.price} €</p>
                      </div>
                    </div>
                    
                    <span className="text-xs font-semibold px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl">
                      ⚠️ Plus que {activeEvent.spotsLeft} places !
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-4 pt-2">
                    <button
                      id="event-detail-back-btn"
                      type="button"
                      onClick={() => setActiveEvent(null)}
                      className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold rounded-2xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Retour
                    </button>
                    <button
                      id="event-detail-checkout-btn"
                      type="button"
                      onClick={() => handleBookEvent(activeEvent)}
                      className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-bold rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-rose-500/10 transition-all cursor-pointer"
                    >
                      Réserver & Régler
                    </button>
                  </div>

                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
