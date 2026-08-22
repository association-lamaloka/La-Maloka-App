import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building, MapPin, Users, Plus, Edit3, Trash2, CheckCircle2, 
  AlertTriangle, Clock, Sparkles, Check, ArrowRight, 
  ChevronDown, ChevronUp, UserCheck, ShieldAlert, Sliders, Search, Download
} from 'lucide-react';
import { DanceRoom, DanceClass, Inscription } from '../types';

interface RoomsManagementProps {
  rooms: DanceRoom[];
  classes: DanceClass[];
  inscriptions: Inscription[];
  onSaveRoom: (room: Partial<DanceRoom>, isEdit: boolean) => void;
  onDeleteRoom: (roomId: string, roomName: string) => void;
  onToggleRoomActive: (roomId: string) => void;
  onQuickAdjustCapacity: (classId: string, delta: number) => void;
  onPromoteWaitlist: (inscriptionId: string, className: string) => void;
  onUpdateClassRoom?: (classId: string, roomId: string, roomName: string, maxCapacity: number) => void;
}

export const RoomsManagement: React.FC<RoomsManagementProps> = ({
  rooms,
  classes,
  inscriptions,
  onSaveRoom,
  onDeleteRoom,
  onToggleRoomActive,
  onQuickAdjustCapacity,
  onPromoteWaitlist,
  onUpdateClassRoom
}) => {
  // Filters
  const [selectedLocation, setSelectedLocation] = useState<string>('Tous');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<DanceRoom | null>(null);
  const [formData, setFormData] = useState<Partial<DanceRoom>>({
    name: '',
    location: 'Fontenay-le-Fleury',
    address: '',
    maxCapacity: 30,
    surfaceAreaM2: 120,
    equipment: ['Parquet', 'Miroirs', 'Sonorisation'],
    notes: '',
    active: true
  });

  const availableEquipmentOptions = [
    'Parquet de danse',
    'Miroirs muraux',
    'Sonorisation haute fidélité',
    'Climatisation / Ventilation',
    'Vestiaires avec douches',
    'Parking gratuit sur place',
    'Accès PMR',
    'Barre de danse'
  ];

  const handleOpenCreate = () => {
    setEditingRoom(null);
    setFormData({
      name: '',
      location: selectedLocation !== 'Tous' ? selectedLocation : 'Fontenay-le-Fleury',
      address: 'Avenue Jean Lurçat, 78330 Fontenay-le-Fleury',
      maxCapacity: 30,
      surfaceAreaM2: 120,
      equipment: ['Parquet de danse', 'Miroirs muraux', 'Sonorisation haute fidélité'],
      notes: '',
      active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (room: DanceRoom) => {
    setEditingRoom(room);
    setFormData({ ...room });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.maxCapacity) return;
    onSaveRoom(formData, !!editingRoom);
    setIsModalOpen(false);
  };

  const toggleEquipment = (eq: string) => {
    const current = formData.equipment || [];
    if (current.includes(eq)) {
      setFormData({ ...formData, equipment: current.filter(i => i !== eq) });
    } else {
      setFormData({ ...formData, equipment: [...current, eq] });
    }
  };

  // Calculations for stats
  const totalCapacity = rooms.reduce((acc, r) => acc + (r.active ? r.maxCapacity : 0), 0);
  const totalSubscribers = classes.reduce((acc, c) => acc + (c.subscribersCount || 0), 0);
  const totalClassSpots = classes.reduce((acc, c) => acc + (c.maxSpots || 30), 0);
  const occupancyPercent = totalClassSpots > 0 ? Math.min(100, Math.round((totalSubscribers / totalClassSpots) * 100)) : 0;
  
  const waitlistedInscriptions = inscriptions.filter(i => i.status === "Liste d'attente");
  const totalWaitlist = waitlistedInscriptions.length;

  // Filtered rooms
  const filteredRooms = rooms.filter(room => {
    const matchLocation = selectedLocation === 'Tous' || room.location === selectedLocation;
    const matchSearch = !searchQuery || 
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      room.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchLocation && matchSearch;
  });

  return (
    <div className="space-y-8 text-left">
      {/* Header & Global Stats */}
      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-[10px] font-extrabold uppercase tracking-widest mb-2">
              <Building size={12} /> Gestion des Salles, Lieux & Aforo
            </div>
            <h3 className="text-2xl font-black text-white">
              Gestion des Salles & Forums d'Inscrits ({rooms.length} Salles)
            </h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
              Configurez la capacité maximale (jauge / aforo) de chaque salle et surveillez en temps réel le taux de remplissage et les listes d'attente par cours.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="add-new-room-btn"
              onClick={handleOpenCreate}
              className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 shadow-lg cursor-pointer transition-transform active:scale-95"
            >
              <Plus size={14} />
              <span>Créer une Nouvelle Salle</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="p-4 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl">
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Salles Actives</span>
              <Building size={15} className="text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {rooms.filter(r => r.active).length} <span className="text-xs font-normal text-zinc-500">/ {rooms.length}</span>
            </div>
            <span className="text-[10px] text-zinc-400 mt-1 block">Fontenay & La Queue-les-Yvelines</span>
          </div>

          <div className="p-4 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl">
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Jauge Totale Cumulée</span>
              <Users size={15} className="text-orange-400" />
            </div>
            <div className="text-2xl font-black text-amber-400">
              {totalCapacity} <span className="text-xs font-normal text-zinc-500">places</span>
            </div>
            <span className="text-[10px] text-zinc-400 mt-1 block">Capacité d'accueil globale</span>
          </div>

          <div className="p-4 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl">
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Remplissage Global</span>
              <Sliders size={15} className="text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">
              {occupancyPercent}%
            </div>
            <span className="text-[10px] text-zinc-400 mt-1 block">{totalSubscribers} inscrits / {totalClassSpots} places cours</span>
          </div>

          <div className={`p-4 rounded-2xl border ${totalWaitlist > 0 ? 'bg-rose-950/30 border-rose-800/60' : 'bg-zinc-950/80 border-zinc-800/80'}`}>
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider">Liste d'Attente</span>
              <ShieldAlert size={15} className={totalWaitlist > 0 ? 'text-rose-400 animate-pulse' : 'text-zinc-500'} />
            </div>
            <div className={`text-2xl font-black ${totalWaitlist > 0 ? 'text-rose-400' : 'text-zinc-400'}`}>
              {totalWaitlist} <span className="text-xs font-normal text-zinc-500">personnes</span>
            </div>
            <span className="text-[10px] text-zinc-400 mt-1 block">
              {totalWaitlist > 0 ? 'En attente de place libre' : 'Aucune file d\'attente'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-zinc-900/60 p-4 border border-zinc-800 rounded-2xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mr-1">Ville / Commune :</span>
          {['Tous', 'Fontenay-le-Fleury', 'La Queue-les-Yvelines'].map((loc) => (
            <button
              key={loc}
              onClick={() => setSelectedLocation(loc)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedLocation === loc
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {loc}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une salle ou adresse..."
            className="w-full sm:w-64 pl-9 pr-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Section 1: Room Catalog Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-extrabold text-white flex items-center gap-2">
            <Building size={16} className="text-amber-400" />
            <span>Catalogue des Salles & Limites d'Aforo ({filteredRooms.length})</span>
          </h4>
          <span className="text-xs text-zinc-400">
            Cliquez sur <strong>"Modifier"</strong> pour ajuster la jauge ou les équipements.
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredRooms.map((room) => {
            // Find classes assigned to this room
            const linkedClasses = classes.filter(c => c.roomId === room.id || (c.roomName && c.roomName.toLowerCase() === room.name.toLowerCase()));
            const totalRoomEnrolled = linkedClasses.reduce((acc, c) => acc + (c.subscribersCount || 0), 0);

            return (
              <div 
                key={room.id}
                className={`p-5 rounded-3xl border transition-all ${
                  room.active 
                    ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700' 
                    : 'bg-zinc-950/60 border-zinc-800/50 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        {room.location}
                      </span>
                      {room.surfaceAreaM2 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono text-zinc-400 bg-zinc-800">
                          {room.surfaceAreaM2} m²
                        </span>
                      )}
                      {!room.active && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold text-rose-400 bg-rose-500/10">
                          Fermée / Inactive
                        </span>
                      )}
                    </div>
                    <h5 className="text-lg font-black text-white">{room.name}</h5>
                    <p className="text-xs text-zinc-400 flex items-center gap-1">
                      <MapPin size={12} className="text-zinc-500 shrink-0" />
                      <span>{room.address}</span>
                    </p>
                  </div>

                  {/* Big Capacity Badge */}
                  <div className="text-right shrink-0">
                    <div className="px-3.5 py-2 bg-amber-500/20 border border-amber-500/40 rounded-2xl text-center">
                      <span className="block text-[9px] uppercase font-extrabold text-amber-300">Jauge Max / Aforo</span>
                      <span className="text-xl font-black text-white">{room.maxCapacity}</span>
                      <span className="text-[10px] text-amber-200 font-semibold block">places</span>
                    </div>
                  </div>
                </div>

                {/* Equipment chips */}
                {room.equipment && room.equipment.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-zinc-800/80">
                    <div className="text-[10px] font-bold uppercase text-zinc-500 mb-2">Équipements & Prestations :</div>
                    <div className="flex flex-wrap gap-1.5">
                      {room.equipment.map((eq, i) => (
                        <span key={i} className="px-2.5 py-1 bg-zinc-800 text-zinc-300 rounded-lg text-[11px] font-medium flex items-center gap-1">
                          <Sparkles size={10} className="text-amber-400" />
                          <span>{eq}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Linked courses in this room */}
                <div className="mt-4 pt-3 border-t border-zinc-800/80">
                  <div className="flex justify-between items-center text-[10px] font-bold uppercase text-zinc-500 mb-2">
                    <span>Cours dispensés dans cette salle ({linkedClasses.length}) :</span>
                    <span className="text-amber-400">{totalRoomEnrolled} inscrits cumulés</span>
                  </div>

                  {linkedClasses.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic">Aucun cours n'est actuellement assigné à cette salle.</p>
                  ) : (
                    <div className="space-y-2">
                      {linkedClasses.map(c => {
                        const enrolled = c.subscribersCount || 0;
                        const max = c.maxSpots || room.maxCapacity;
                        const pct = Math.min(100, Math.round((enrolled / max) * 100));

                        return (
                          <div key={c.id} className="p-2.5 bg-zinc-950/70 border border-zinc-800/70 rounded-xl flex items-center justify-between gap-3 text-xs">
                            <div className="min-w-0">
                              <span className="font-bold text-white block truncate">{c.name}</span>
                              <span className="text-[11px] text-zinc-400">{c.schedule} • {c.instructor}</span>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <div className="text-right">
                                <span className={`font-mono font-bold ${pct >= 100 ? 'text-rose-400' : pct >= 80 ? 'text-amber-400' : 'text-emerald-400'}`}>
                                  {enrolled}/{max}
                                </span>
                                <span className="text-[10px] text-zinc-500 block">{max - enrolled} disp.</span>
                              </div>

                              <div className="w-12 bg-zinc-800 h-2 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${pct >= 100 ? 'bg-rose-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {room.notes && (
                  <p className="mt-3 text-[11px] text-zinc-400 italic bg-zinc-950/50 p-2.5 rounded-xl border border-zinc-800/50">
                    💡 {room.notes}
                  </p>
                )}

                {/* Actions footer */}
                <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => onToggleRoomActive(room.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                      room.active 
                        ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700' 
                        : 'bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30'
                    }`}
                  >
                    <CheckCircle2 size={12} />
                    <span>{room.active ? 'Désactiver' : 'Activer'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(room)}
                      className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Edit3 size={12} />
                      <span>Modifier la Salle & Jauge</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteRoom(room.id, room.name)}
                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs cursor-pointer transition-colors"
                      title="Supprimer la salle"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section 2: Course Enrollment Forum & Limitation Oversight */}
      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-extrabold uppercase tracking-widest mb-2">
            <Users size={12} /> Forum d'Inscrits & Gestion des Listes par Cours
          </div>
          <h4 className="text-xl font-black text-white">
            Suivi des Inscrits, Jauges Directes & Validation Liste d'Attente
          </h4>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Ajustez rapidement les quotas de places autorisés par cours et confirmez les personnes en liste d'attente dès qu'une place se libère.
          </p>
        </div>

        <div className="space-y-4">
          {classes.map((cls) => {
            const courseInscriptions = inscriptions.filter(i => 
              i.courseName.toLowerCase().includes(cls.name.toLowerCase()) || 
              cls.name.toLowerCase().includes(i.courseName.toLowerCase())
            );
            const confirmedCount = courseInscriptions.filter(i => i.status !== "Liste d'attente").length;
            const waitlistedList = courseInscriptions.filter(i => i.status === "Liste d'attente");
            const maxSpots = cls.maxSpots || 30;
            const enrolled = cls.subscribersCount || confirmedCount;
            const pct = Math.min(100, Math.round((enrolled / maxSpots) * 100));
            const spotsRemaining = Math.max(0, maxSpots - enrolled);
            const isFull = enrolled >= maxSpots;
            const isExpanded = expandedCourseId === cls.id;

            return (
              <div 
                key={cls.id}
                className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-2xl overflow-hidden transition-all"
              >
                {/* Main Card Header */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/30">
                        {cls.category}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800">
                        {cls.level}
                      </span>
                      <span className="text-xs text-zinc-400">📍 {cls.location}</span>
                    </div>

                    <h5 className="text-base font-bold text-white flex items-center gap-2">
                      <span>{cls.name}</span>
                      {isFull && (
                        <span className="px-2 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded-full text-[10px] font-black uppercase">
                          Complet ({maxSpots}/{maxSpots})
                        </span>
                      )}
                    </h5>

                    <p className="text-xs text-zinc-400">
                      🕒 {cls.schedule} • Professeur: <strong className="text-zinc-300">{cls.instructor}</strong> • Salle: <strong className="text-amber-300">{cls.roomName || 'Salle Principale'}</strong>
                    </p>
                  </div>

                  {/* Right: Interactive Jauge & Quick Controls */}
                  <div className="flex flex-wrap items-center gap-4">
                    {/* Capacity Progress Bar */}
                    <div className="space-y-1.5 w-44">
                      <div className="flex justify-between text-xs">
                        <span className="text-zinc-400">Jauge cours :</span>
                        <span className={`font-mono font-bold ${isFull ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {enrolled} / {maxSpots}
                        </span>
                      </div>
                      <div className="w-full bg-zinc-800 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${isFull ? 'bg-rose-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-zinc-500 block text-right">
                        {isFull ? '0 place restante' : `${spotsRemaining} places restantes`}
                      </span>
                    </div>

                    {/* Quick +/- buttons */}
                    <div className="flex items-center gap-1 bg-zinc-900 p-1.5 rounded-xl border border-zinc-800">
                      <button
                        type="button"
                        onClick={() => onQuickAdjustCapacity(cls.id, -5)}
                        className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs font-bold cursor-pointer"
                        title="Réduire la jauge de 5 places"
                      >
                        -5
                      </button>
                      <button
                        type="button"
                        onClick={() => onQuickAdjustCapacity(cls.id, -1)}
                        className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs font-bold cursor-pointer"
                        title="Réduire de 1 place"
                      >
                        -1
                      </button>
                      <span className="px-1 text-[11px] font-mono text-zinc-400 font-bold">{maxSpots}p</span>
                      <button
                        type="button"
                        onClick={() => onQuickAdjustCapacity(cls.id, 1)}
                        className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-emerald-300 rounded text-xs font-bold cursor-pointer"
                        title="Ajouter 1 place"
                      >
                        +1
                      </button>
                      <button
                        type="button"
                        onClick={() => onQuickAdjustCapacity(cls.id, 5)}
                        className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-emerald-300 rounded text-xs font-bold cursor-pointer"
                        title="Ajouter 5 places"
                      >
                        +5
                      </button>
                    </div>

                    {/* Toggle Inscriptions Details button */}
                    <button
                      type="button"
                      onClick={() => setExpandedCourseId(isExpanded ? null : cls.id)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        waitlistedList.length > 0
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                      }`}
                    >
                      <Users size={13} />
                      <span>{courseInscriptions.length} Inscrits</span>
                      {waitlistedList.length > 0 && (
                        <span className="px-1.5 py-0.5 bg-rose-500 text-white rounded-full text-[9px] font-black">
                          {waitlistedList.length} en attente
                        </span>
                      )}
                      {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>
                  </div>
                </div>

                {/* Expanded Inscriptions Roster & Waitlist Action Panel */}
                {isExpanded && (
                  <div className="border-t border-zinc-800 bg-zinc-900/60 p-5 space-y-4">
                    {/* Waitlist Section */}
                    {waitlistedList.length > 0 && (
                      <div className="p-4 bg-rose-950/30 border border-rose-800/60 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-rose-300 font-bold text-xs uppercase tracking-wide">
                            <AlertTriangle size={14} className="text-rose-400" />
                            <span>Liste d'Attente ({waitlistedList.length} Personnes en attente)</span>
                          </div>
                          <span className="text-[11px] text-rose-300/80">
                            Cliquez sur "Promouvoir & Confirmer" pour accorder une place officielle.
                          </span>
                        </div>

                        <div className="space-y-2">
                          {waitlistedList.map((waitIns, idx) => (
                            <div 
                              key={waitIns.id}
                              className="p-3 bg-zinc-900 border border-rose-900/50 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                            >
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-rose-500 text-white font-mono font-bold text-[10px] flex items-center justify-center">
                                    #{idx + 1}
                                  </span>
                                  <strong className="text-white text-sm">{waitIns.userName}</strong>
                                  <span className="text-[10px] text-zinc-400 font-mono">({waitIns.date})</span>
                                </div>
                                <div className="text-zinc-400 text-[11px] mt-0.5">
                                  📧 {waitIns.userEmail} • 📞 {waitIns.userPhone}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => onPromoteWaitlist(waitIns.id, cls.name)}
                                className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer self-end sm:self-center"
                              >
                                <UserCheck size={13} />
                                <span>Promouvoir & Confirmer</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Confirmed Roster */}
                    <div>
                      <div className="flex items-center justify-between text-xs text-zinc-400 font-bold uppercase mb-2">
                        <span>Adhérents Confirmés ({courseInscriptions.filter(i => i.status !== "Liste d'attente").length}) :</span>
                        <span className="text-[11px] text-zinc-500">Inscrits via le site ou HelloAsso</span>
                      </div>

                      {courseInscriptions.filter(i => i.status !== "Liste d'attente").length === 0 ? (
                        <p className="text-xs text-zinc-500 italic py-2">
                          Aucun adhérent n'est encore enregistré pour ce cours précis.
                        </p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-zinc-800 text-zinc-400 pb-2 text-[11px]">
                                <th className="py-2">Date</th>
                                <th>Adhérent</th>
                                <th>Email</th>
                                <th>Téléphone</th>
                                <th>Tarif</th>
                                <th>Statut</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800/60">
                              {courseInscriptions.filter(i => i.status !== "Liste d'attente").map((ins) => (
                                <tr key={ins.id} className="hover:bg-zinc-800/30">
                                  <td className="py-2 font-mono text-zinc-500 text-[11px]">{ins.date}</td>
                                  <td className="font-semibold text-white">{ins.userName}</td>
                                  <td className="text-zinc-300 font-mono text-[11px]">{ins.userEmail}</td>
                                  <td className="text-zinc-300 font-mono text-[11px]">{ins.userPhone}</td>
                                  <td className="text-emerald-400 font-bold font-mono">{ins.price}€</td>
                                  <td>
                                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-[10px] font-bold">
                                      Confirmée
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CREATE / EDIT ROOM MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-zinc-700 rounded-3xl p-6 sm:p-8 max-w-2xl w-full my-8 text-left space-y-6 shadow-2xl relative"
            >
              <div className="flex justify-between items-start border-b border-zinc-800 pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                    {editingRoom ? 'Modification Salle' : 'Nouvelle Salle'}
                  </span>
                  <h3 className="text-xl font-black text-white mt-1">
                    {editingRoom ? 'Modifier la Salle & la Jauge Maximale' : 'Ajouter une Nouvelle Salle / Gymnase'}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Définissez la capacité limite (aforo), l'adresse et les équipements disponibles.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center cursor-pointer text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-300 uppercase">Nom de la Salle :</label>
                    <input
                      type="text"
                      required
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Gymnase du Levant - Grande Salle"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-300 uppercase">Commune / Ville :</label>
                    <select
                      value={formData.location || 'Fontenay-le-Fleury'}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="Fontenay-le-Fleury">Fontenay-le-Fleury</option>
                      <option value="La Queue-les-Yvelines">La Queue-les-Yvelines</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300 uppercase">Adresse Complète :</label>
                  <input
                    type="text"
                    required
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Ex: Avenue Jean Lurçat, 78330 Fontenay-le-Fleury"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-300 uppercase">Capacité Maximale / Aforo (Places) :</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={200}
                      value={formData.maxCapacity || 30}
                      onChange={(e) => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500"
                    />
                    <span className="text-[10px] text-zinc-500">Limite de sécurité et d'espace pour les cours.</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-zinc-300 uppercase">Surface de la Salle (m²) :</label>
                    <input
                      type="number"
                      min={10}
                      value={formData.surfaceAreaM2 || 100}
                      onChange={(e) => setFormData({ ...formData, surfaceAreaM2: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Equipment Checkboxes */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-zinc-300 uppercase">Équipements & Aménagements Disponibles :</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                    {availableEquipmentOptions.map((eq) => {
                      const isChecked = (formData.equipment || []).includes(eq);
                      return (
                        <label 
                          key={eq}
                          className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer hover:text-white"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleEquipment(eq)}
                            className="rounded border-zinc-700 text-amber-500 focus:ring-0"
                          />
                          <span>{eq}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300 uppercase">Notes & Consignes d'Accès :</label>
                  <textarea
                    rows={2}
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Ex: Chaussures de danse obligatoires, vestiaires au sous-sol..."
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-xs text-white resize-none focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active !== false}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="rounded border-zinc-700 text-amber-500 focus:ring-0"
                    />
                    <span>Salle active et disponible pour la saison</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md"
                  >
                    {editingRoom ? 'Enregistrer les Modifications' : 'Créer la Salle'}
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
