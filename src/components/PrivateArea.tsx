import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EXCLUSIVE_MATERIALS, GENERATED_MOTION_IMAGE } from '../data';
import { ExclusiveMaterial, AdherentMember } from '../types';
import { Lock, Unlock, Play, FileText, Music, Download, Filter, HelpCircle, ArrowRight, Eye, RefreshCw, Send } from 'lucide-react';
import { FloatingMonstera, FloatingHibiscus, HibiscusSVG } from './TropicalDecorations';

interface PrivateAreaProps {
  isLoggedIn: boolean;
  onLoginSuccess: () => void;
  adherentCode: string;
  addNotification: (title: string, description: string, type: 'evento' | 'clase' | 'pago' | 'alerta') => void;
}

export const PrivateArea: React.FC<PrivateAreaProps> = ({
  isLoggedIn,
  onLoginSuccess,
  adherentCode,
  addNotification,
}) => {
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<string>('Tous');
  
  // States for downloads
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadedItems, setDownloadedItems] = useState<Record<string, boolean>>({});

  // States for video streaming player
  const [streamingVideo, setStreamingVideo] = useState<ExclusiveMaterial | null>(null);

  // Teacher Question states
  const [teacherMsg, setTeacherMsg] = useState('');
  const [teacherSuccess, setTeacherSuccess] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = password.trim().toUpperCase();

    // 1. Get adherents from localStorage to check for expiration/annual renewal
    let localAdherents: AdherentMember[] = [];
    try {
      const saved = localStorage.getItem('maloka_adherents');
      if (saved) {
        localAdherents = JSON.parse(saved);
      }
    } catch (err) {
      console.error(err);
    }

    // 2. Check if it matches the general active adherentCode
    const isGeneralMatch = entered === adherentCode.toUpperCase() || entered === 'MALOKA2026';

    // 3. Check if it matches any individual adherent member code
    const matchingMembers = localAdherents.filter(
      (m) => m.code.toUpperCase() === entered || m.id.toUpperCase() === entered
    );

    if (isGeneralMatch) {
      // General code accepted
      onLoginSuccess();
      setErrorMsg('');
      setPassword('');
      addNotification(
        'Accès Autorisé ! 🗝️',
        'Bienvenue dans l\'Espace Privé de La Maloka. Profitez de votre matériel pédagogique exclusif !',
        'clase'
      );
    } else if (matchingMembers.length > 0) {
      // Check if they are active
      const hasActive = matchingMembers.some((m) => m.status === 'Actif');
      const hasExpired = matchingMembers.some((m) => m.status === 'Expiré');

      if (hasActive) {
        onLoginSuccess();
        setErrorMsg('');
        setPassword('');
        addNotification(
          'Accès Adhérent Validé ! 🔑',
          'Votre compte adhérent annuel est actif. Profitez de votre matériel exclusif.',
          'clase'
        );
      } else if (hasExpired) {
        setErrorMsg(
          'Votre adhésion a expiré ! Veuillez renouveler votre cotisation annuelle de 45€ auprès de l\'administration (Back Office) pour obtenir le nouveau code.'
        );
      } else {
        setErrorMsg('Code adhérent expiré ou inactif pour cette saison.');
      }
    } else {
      // Check if it matches a hardcoded backup fallback
      if (entered === 'ADHERENT-2026') {
        onLoginSuccess();
        setErrorMsg('');
        setPassword('');
        addNotification(
          'Accès Adhérent Validé ! 🔑',
          'Code d\'accès de la saison accepté.',
          'clase'
        );
      } else if (entered === 'ADHERENT-2025') {
        setErrorMsg('Ce code d\'accès a expiré (Saison 2024/2025). Veuillez renouveler votre adhésion.');
      } else {
        setErrorMsg(
          `Code d'accès incorrect ou expiré. Essayez avec le code actif de la saison : "${adherentCode}" ou réglez vos cotisations.`
        );
      }
    }
  };

  const handleDownload = (item: ExclusiveMaterial) => {
    if (downloadedItems[item.id]) return;
    setDownloadingId(item.id);
    setDownloadProgress(0);

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setDownloadingId(null);
          setDownloadedItems((prevItems) => ({ ...prevItems, [item.id]: true }));
          addNotification(
            'Téléchargement Réussi ! 📥',
            `Le document "${item.title}" a été enregistré sur votre appareil.`,
            'clase'
          );
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const handleAskTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherMsg.trim()) return;

    setTeacherSuccess(true);
    addNotification(
      'Message Envoyé ✉',
      'Votre question technique a bien été transmise à l\'équipe pédagogique. Vous recevrez une réponse sous 24h.',
      'clase'
    );
    setTimeout(() => {
      setTeacherMsg('');
      setTeacherSuccess(false);
    }, 4000);
  };

  // Materials list
  const filteredMaterials = EXCLUSIVE_MATERIALS.filter((item) => {
    // Map categories
    return selectedStyle === 'Tous' || item.category === selectedStyle;
  });

  const styles = ['Tous', 'Salsa', 'Bachata', 'Kizomba'];

  return (
    <div className="relative py-12 md:py-16 bg-white dark:bg-zinc-950 min-h-screen">
      
      {/* Background decorations */}
      <FloatingMonstera delay={0} size="w-40 h-40" className="absolute top-10 right-10 text-emerald-500/10 dark:text-emerald-500/5 rotate-45 pointer-events-none" />
      <FloatingHibiscus delay={3} size="w-32 h-32" className="absolute bottom-10 left-10 text-rose-500/10 dark:text-rose-500/5 rotate-90 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <AnimatePresence mode="wait">
          {!isLoggedIn ? (
            /* 1. Login Card protection screen */
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto bg-white dark:bg-zinc-900 rounded-3xl border border-rose-100 dark:border-zinc-800 p-6 md:p-8 shadow-xl text-center"
            >
              <div className="w-14 h-14 bg-gradient-to-tr from-orange-400 to-rose-500 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-md">
                <Lock size={26} />
              </div>

              <h2 className="text-2xl font-black text-zinc-900 dark:text-white">
                Espace Matériel Exclusif
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                Veuillez saisir le code d'accès de la saison (inscrit sur votre reçu d'adhésion) ou votre clé personnelle d'adhérent actif pour accéder aux ressources vidéos, musiques et guides théoriques.
              </p>

              {/* Secret code reminder banner */}
              <div className="my-5 p-3.5 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 rounded-2xl text-[11px] text-amber-800 dark:text-amber-400 text-left space-y-1">
                <p className="font-bold">🔑 Pour vos tests d'accès :</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Code Actif de la Saison : <span className="font-mono font-bold bg-amber-100 dark:bg-amber-900 px-1.5 py-0.2 rounded text-rose-600 dark:text-rose-400">{adherentCode}</span></li>
                  <li>Code Adhérent Expiré : <span className="font-mono font-bold bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.2 rounded">ADHERENT-2025</span> (Lucas Dupont)</li>
                </ul>
              </div>

              <form onSubmit={handleLogin} className="space-y-4 text-left mt-6">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Code d'Accès Adhérent :</label>
                  <input
                    id="private-code-input"
                    type="text"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ex: ADHERENT-2026"
                    className="w-full px-3.5 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-center tracking-widest font-mono text-base uppercase text-zinc-850 dark:text-zinc-150"
                  />
                </div>

                {errorMsg && (
                  <p className="text-xs text-rose-500 font-semibold text-center leading-relaxed">
                    ⚠️ {errorMsg}
                  </p>
                )}

                <button
                  id="submit-private-code-btn"
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md hover:scale-[1.01] transition-all cursor-pointer text-center"
                >
                  Débloquer l'Espace Privé
                </button>
              </form>
            </motion.div>
          ) : (
            /* 2. Main Private Section area */
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
              
              {/* Welcome banner incorporating generated dynamic image */}
              <div className="relative rounded-3xl overflow-hidden shadow-xl p-8 md:p-12 text-left bg-zinc-950 text-white">
                {/* Backdrop Generated image with filter */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={GENERATED_MOTION_IMAGE}
                    alt="Tropical dancers in motion abstract"
                    className="w-full h-full object-cover opacity-35"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
                </div>

                {/* Banner content */}
                <div className="relative z-10 max-w-xl space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-full text-[10px] font-extrabold uppercase tracking-widest">
                    <Unlock size={12} /> Espace Privé Adhérent
                  </div>

                  <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                    Académie Virtuelle La Maloka
                  </h2>
                  <p className="text-xs md:text-sm text-zinc-300 font-light leading-relaxed">
                    Bonjour cher danseur ! Retrouvez ici les vidéos récapitulatives de nos cours hebdomadaires pour réviser vos pas, les playlists exclusives sélectionnées par nos DJ et vos fiches techniques au format PDF.
                  </p>
                </div>
              </div>

              {/* Style selector for materials */}
              <div className="flex flex-col sm:flex-row gap-6 items-center justify-between border-b border-rose-100 dark:border-zinc-800 pb-6 text-left">
                <div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Révision des Cours</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Sélectionnez le rythme de votre cours pour filtrer les ressources pédagogiques.</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {styles.map((style) => (
                    <button
                      key={style}
                      id={`private-filter-${style}`}
                      onClick={() => setSelectedStyle(style)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        selectedStyle === style
                          ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm'
                          : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-rose-50'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* Materials grid cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredMaterials.map((item) => {
                  const isDownloading = downloadingId === item.id;
                  const isDownloaded = downloadedItems[item.id];
                  return (
                    <div
                      key={item.id}
                      id={`material-card-${item.id}`}
                      className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between h-full hover:shadow-md transition-shadow"
                    >
                      {/* Card Header visual */}
                      <div className="relative aspect-[16/10] bg-zinc-100 overflow-hidden shrink-0">
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {/* Type indicator overlay */}
                        <span className="absolute top-3 left-3 bg-zinc-900/85 backdrop-blur-md text-white rounded-lg p-2 flex items-center justify-center">
                          {item.type === 'video' ? (
                            <Play size={14} className="text-orange-400" />
                          ) : item.type === 'musica' ? (
                            <Music size={14} className="text-cyan-400" />
                          ) : (
                            <FileText size={14} className="text-emerald-400" />
                          )}
                        </span>
                        
                        <span className="absolute top-3 right-3 bg-emerald-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded uppercase">
                          {item.category}
                        </span>
                      </div>

                      {/* Card Content body */}
                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4 text-left">
                        <div className="space-y-1.5">
                          <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-semibold">Professeur : {item.author}</span>
                          <h4 className="text-base font-extrabold text-zinc-900 dark:text-white leading-snug">{item.title}</h4>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-light line-clamp-2">{item.description}</p>
                        </div>

                        {/* Card bottom actions */}
                        <div className="pt-3 border-t border-rose-50/50 dark:border-zinc-800/80 flex items-center justify-between">
                          <span className="text-xs text-zinc-400 font-mono font-medium">
                            {item.duration || 'Guide Complet'}
                          </span>

                          <div className="flex gap-1.5">
                            {item.type === 'video' && (
                              <button
                                id={`video-play-btn-${item.id}`}
                                onClick={() => setStreamingVideo(item)}
                                className="px-3.5 py-1.5 bg-orange-100 dark:bg-orange-950/40 hover:bg-orange-200 dark:hover:bg-orange-900 text-orange-700 dark:text-orange-400 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Eye size={12} /> Visionner
                              </button>
                            )}

                            <button
                              id={`material-download-btn-${item.id}`}
                              onClick={() => handleDownload(item)}
                              disabled={isDownloading || isDownloaded}
                              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                                isDownloaded
                                  ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 cursor-default'
                                  : isDownloading
                                  ? 'bg-zinc-100 text-zinc-400'
                                  : 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700'
                              }`}
                            >
                              {isDownloading ? (
                                <>
                                  <RefreshCw size={12} className="animate-spin" />
                                  <span>{downloadProgress}%</span>
                                </>
                              ) : isDownloaded ? (
                                <>
                                  <span>✓ Enregistré</span>
                                </>
                              ) : (
                                <>
                                  <Download size={12} />
                                  <span>{item.type === 'guia' ? 'PDF' : item.type === 'musica' ? 'Musique' : 'Télécharger'}</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Direct Q&A with instructor */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-rose-50/30 dark:bg-zinc-900/30 border border-rose-100/50 dark:border-zinc-800 rounded-3xl p-6 md:p-8 text-left">
                <div className="lg:col-span-5 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center">
                    <HelpCircle size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Des questions techniques sur les figures ?</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-light">
                    Envoyez une question à nos professeurs. Nous vous répondrons rapidement par e-mail ou avec un micro-clip vidéo explicatif si la figure est complexe !
                  </p>
                </div>

                <form onSubmit={handleAskTeacher} className="lg:col-span-7 w-full space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 block">Décrivez votre question ou le pas qui vous pose problème :</label>
                    <textarea
                      id="teacher-query-textarea"
                      required
                      value={teacherMsg}
                      onChange={(e) => setTeacherMsg(e.target.value)}
                      placeholder="Ex: Dans la passe 'Setenta' de Salsa Cubaine, j'ai du mal avec le guidage du bras droit sur le temps 5..."
                      rows={3}
                      className="w-full px-4 py-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm text-zinc-800 dark:text-zinc-200 resize-none"
                    />
                  </div>

                  {teacherSuccess && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                      ✔ Question transmise ! Votre professeur vous contactera par e-mail très bientôt.
                    </p>
                  )}

                  <button
                    id="submit-teacher-query-btn"
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider shadow-md flex items-center gap-2 cursor-pointer ml-auto"
                  >
                    Envoyer au Professeur <Send size={12} />
                  </button>
                </form>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

        {/* Video Tutorial Simulated Streaming Player Modal */}
        <AnimatePresence>
          {streamingVideo && (
            <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div
                id="streaming-player-container"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-zinc-950 rounded-3xl overflow-hidden border border-zinc-800 max-w-2xl w-full text-white"
              >
                {/* Simulated Player Screen with Play State */}
                <div className="relative aspect-[16/9] bg-zinc-900 flex flex-col justify-center items-center overflow-hidden">
                  <div className="absolute inset-0 bg-radial-gradient from-zinc-800/40 to-transparent pointer-events-none" />
                  
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full border border-white/10 text-xs">
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
                    <span className="font-mono text-zinc-300 font-semibold">DIRECT MEMBRE ACTIF</span>
                  </div>

                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
                    className="w-24 h-24 rounded-full border-4 border-dashed border-orange-500/25 flex items-center justify-center text-orange-500"
                  >
                    <Music size={32} />
                  </motion.div>

                  <p className="text-xs text-zinc-400 mt-4 uppercase tracking-widest font-mono">Lecture : {streamingVideo.title}</p>
                  <p className="text-sm font-semibold mt-1 font-sans text-amber-400">Chaîne : Cours de {streamingVideo.author}</p>

                  {/* Player progress slider simulation */}
                  <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/95 to-transparent flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                      <span>03:14</span>
                      <div className="flex-1 mx-3 h-1 bg-zinc-700 rounded-full relative overflow-hidden">
                        <div className="absolute top-0 left-0 bottom-0 w-[42%] bg-gradient-to-r from-orange-400 to-rose-500 rounded-full" />
                      </div>
                      <span>12:00</span>
                    </div>
                  </div>
                </div>

                {/* Info and action panel */}
                <div className="p-6 space-y-4 text-left">
                  <div>
                    <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest block">Professeur : {streamingVideo.author}</span>
                    <h3 className="text-lg font-bold mt-1">{streamingVideo.title}</h3>
                    <p className="text-xs text-zinc-400 mt-1 font-light leading-relaxed">{streamingVideo.description}</p>
                  </div>

                  <div className="pt-2 flex justify-end gap-3 border-t border-zinc-800">
                    <button
                      id="close-streaming-player"
                      onClick={() => setStreamingVideo(null)}
                      className="px-5 py-2.5 bg-zinc-800 hover:bg-rose-600 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-colors cursor-pointer"
                    >
                      Fermer le Lecteur
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
