import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PHOTO_GALLERY, DEFAULT_VIDEOS } from '../data';
import { PhotoItem, VideoItem, SiteSettings } from '../types';
import { 
  Camera, 
  Video, 
  Play, 
  Eye, 
  Download, 
  Heart, 
  Share2, 
  ExternalLink, 
  Sparkles, 
  PlusCircle, 
  Film, 
  Image as ImageIcon,
  CheckCircle,
  X,
  Youtube,
  Layers
} from 'lucide-react';
import { FloatingMonstera, FloatingHibiscus, HibiscusSVG } from './TropicalDecorations';

// Helper function to extract YouTube video ID from any YouTube URL format
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/;
  const match = trimmed.match(regExp);
  return match ? match[1] : null;
}

interface PhotoGalleryProps {
  photos?: PhotoItem[];
  setPhotos?: React.Dispatch<React.SetStateAction<PhotoItem[]>>;
  videos?: VideoItem[];
  setVideos?: React.Dispatch<React.SetStateAction<VideoItem[]>>;
  siteSettings?: SiteSettings;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos: propPhotos,
  setPhotos: propSetPhotos,
  videos: propVideos,
  setVideos: propSetVideos,
  siteSettings,
}) => {
  // Local fallback states if not controlled from parent
  const [localPhotos, setLocalPhotos] = useState<PhotoItem[]>(PHOTO_GALLERY);
  const [localVideos, setLocalVideos] = useState<VideoItem[]>(DEFAULT_VIDEOS);

  const photos = propPhotos || localPhotos;
  const setPhotos = propSetPhotos || setLocalPhotos;
  const videos = propVideos || localVideos;
  const setVideos = propSetVideos || setLocalVideos;

  // Navigation mode: 'all' | 'photos' | 'videos'
  const [mediaSpace, setMediaSpace] = useState<'photos' | 'videos' | 'all'>('photos');
  const [selectedCategory, setSelectedCategory] = useState<string>('Toutes');
  
  // Lightboxes and modals
  const [photoLightboxIndex, setPhotoLightboxIndex] = useState<number | null>(null);
  const [activeVideoPlayer, setActiveVideoPlayer] = useState<VideoItem | null>(null);
  const [showAddMediaModal, setShowAddMediaModal] = useState<boolean>(false);
  const [addMediaType, setAddMediaType] = useState<'video' | 'photo'>('video');
  const [copiedVideoId, setCopiedVideoId] = useState<string | null>(null);

  // Likes state
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  // New Media Form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Salsa Cubaine');
  const [newUrl, setNewUrl] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const categories = ['Toutes', 'Salsa Cubaine', 'Cardio Latino', 'Stages & Ateliers', 'Soirées & Fêtes'];

  // Filtered lists
  const filteredPhotos = photos.filter((photo) => {
    return selectedCategory === 'Toutes' || photo.category === selectedCategory;
  });

  const filteredVideos = videos.filter((video) => {
    return selectedCategory === 'Toutes' || video.category === selectedCategory;
  });

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const alreadyLiked = liked[id];
    setLiked((prev) => ({ ...prev, [id]: !alreadyLiked }));
    setLikes((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + (alreadyLiked ? -1 : 1),
    }));
  };

  const handleShareVideo = (video: VideoItem, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(video.youtubeUrl || `https://youtube.com/watch?v=${video.youtubeId}`);
    setCopiedVideoId(video.id);
    setTimeout(() => setCopiedVideoId(null), 2500);
  };

  const handleAddMediaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    if (addMediaType === 'video') {
      const extractedId = extractYouTubeId(newUrl);
      const newVideoItem: VideoItem = {
        id: 'v-' + Date.now(),
        title: newTitle.trim(),
        category: newCategory,
        youtubeUrl: newUrl.trim(),
        youtubeId: extractedId || undefined,
        description: newDescription.trim() || 'Vidéo partagée par la communauté La Maloka',
        duration: 'YouTube HD',
        date: new Date().toISOString().split('T')[0],
        views: 'Nouvelle vidéo',
        likes: 1,
      };
      setVideos((prev) => [newVideoItem, ...prev]);
    } else {
      const newPhotoItem: PhotoItem = {
        id: 'p-' + Date.now(),
        title: newTitle.trim(),
        category: newCategory,
        url: newUrl.trim(),
        description: newDescription.trim() || 'Photo capturée lors des cours La Maloka',
        date: new Date().toISOString().split('T')[0],
        likes: 1,
      };
      setPhotos((prev) => [newPhotoItem, ...prev]);
    }

    setFormSuccess(true);
    setTimeout(() => {
      setFormSuccess(false);
      setShowAddMediaModal(false);
      setNewTitle('');
      setNewUrl('');
      setNewDescription('');
    }, 1200);
  };

  const currentPhoto = photoLightboxIndex !== null ? filteredPhotos[photoLightboxIndex] : null;
  const featuredVideo = videos.find((v) => v.featured) || videos[0];

  return (
    <div className="relative py-10 md:py-16 bg-white dark:bg-zinc-950 min-h-screen">
      
      {/* Background decorations */}
      <FloatingMonstera delay={1} size="w-36 h-36" className="absolute top-10 -left-12 text-emerald-500/10 rotate-45 pointer-events-none" />
      <FloatingHibiscus delay={3} size="w-28 h-28" className="absolute bottom-10 -right-12 text-rose-500/10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-8 sm:mb-12">
          <div className="flex justify-center gap-2 text-rose-500">
            <Camera className="w-9 h-9 animate-pulse" />
            <Film className="w-9 h-9 text-orange-500 animate-pulse" />
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Galerie Multimédia : Photos & Vidéos
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 font-light text-sm sm:text-base">
            Plongez dans l'ambiance tropicale de La Maloka ! Retrouvez nos espaces dédiés aux <strong className="text-rose-500 dark:text-rose-400 font-semibold">photos souvenirs</strong> et aux <strong className="text-orange-500 dark:text-orange-400 font-semibold">vidéos de démonstrations YouTube</strong> (Salsa Cubaine, Rueda de Casino & Cardio Latino).
          </p>
        </div>

        {/* Dual Space Navigation Switcher */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-zinc-50 dark:bg-zinc-900/60 p-2.5 sm:p-3 rounded-2xl sm:rounded-3xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          
          {/* Main Space Segmented Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-zinc-950 rounded-xl sm:rounded-2xl border border-zinc-200 dark:border-zinc-800 w-full sm:w-auto">
            <button
              id="gallery-space-photos-btn"
              onClick={() => setMediaSpace('photos')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                mediaSpace === 'photos'
                  ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              <ImageIcon size={16} />
              <span>Espace Photos</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${mediaSpace === 'photos' ? 'bg-white/20 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'}`}>
                {photos.length}
              </span>
            </button>

            <button
              id="gallery-space-videos-btn"
              onClick={() => setMediaSpace('videos')}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                mediaSpace === 'videos'
                  ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-md'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900'
              }`}
            >
              <Youtube size={17} className="text-white" />
              <span>Espace Vidéos</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${mediaSpace === 'videos' ? 'bg-white/20 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'}`}>
                {videos.length}
              </span>
            </button>

            <button
              id="gallery-space-all-btn"
              onClick={() => setMediaSpace('all')}
              className={`hidden md:flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                mediaSpace === 'all'
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-md'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Layers size={15} />
              <span>Tout ({photos.length + videos.length})</span>
            </button>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              id="gallery-add-youtube-btn"
              onClick={() => {
                setAddMediaType('video');
                setShowAddMediaModal(true);
              }}
              className="flex-1 sm:flex-initial px-3.5 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all hover:scale-105"
            >
              <PlusCircle size={14} />
              <span>+ Proposer Vidéo YouTube</span>
            </button>

            <a
              href={siteSettings?.youtubeUrl || "https://youtube.com/@lamalokadanse"}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-700 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Chaîne YouTube Officielle"
            >
              <Youtube size={15} className="text-red-600" />
              <span className="hidden sm:inline">Chaîne</span>
              <ExternalLink size={12} />
            </a>
          </div>

        </div>

        {/* Category Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar scroll-smooth flex-nowrap sm:flex-wrap justify-start sm:justify-center">
          {categories.map((cat) => (
            <button
              key={cat}
              id={`gallery-cat-tab-${cat}`}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer uppercase tracking-wider whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-rose-500 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ========================================================
            SECTION 1: ESPACE VIDÉOS YOUTUBE (When 'videos' or 'all')
           ======================================================== */}
        {(mediaSpace === 'videos' || mediaSpace === 'all') && (
          <div className="mb-16">
            
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3 text-left">
                <div className="p-2.5 bg-red-500/10 text-red-500 rounded-2xl dark:bg-red-950/40">
                  <Youtube size={24} />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                    Espace Vidéos & Liens YouTube
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Démonstrations de danse, chorégraphies, ruedas et cours animés par nos professeurs.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  {filteredVideos.length} vidéo{filteredVideos.length > 1 ? 's' : ''} disponible{filteredVideos.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Video Cards Grid */}
            {filteredVideos.length === 0 ? (
              <div className="p-12 text-center bg-zinc-50 dark:bg-zinc-900/40 rounded-3xl border border-zinc-200 dark:border-zinc-800">
                <Film className="w-12 h-12 text-zinc-400 mx-auto mb-3 opacity-60" />
                <h4 className="text-base font-bold text-zinc-700 dark:text-zinc-300">Aucune vidéo dans cette catégorie</h4>
                <p className="text-xs text-zinc-500 mt-1">Sélectionnez une autre catégorie ou proposez un nouveau lien YouTube.</p>
                <button
                  onClick={() => {
                    setAddMediaType('video');
                    setShowAddMediaModal(true);
                  }}
                  className="mt-4 px-4 py-2 bg-red-600 text-white font-bold text-xs rounded-xl cursor-pointer hover:bg-red-700 transition-colors"
                >
                  Ajouter une vidéo YouTube
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8">
                {filteredVideos.map((video) => {
                  const videoLikes = (likes[video.id] || 0) + (video.likes || 15);
                  const isLiked = liked[video.id];
                  const videoId = video.youtubeId || extractYouTubeId(video.youtubeUrl);
                  const thumbnailSrc = video.thumbnail || (videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : 'https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&q=80&w=800');

                  return (
                    <motion.div
                      key={video.id}
                      id={`video-card-${video.id}`}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="group bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col"
                    >
                      {/* Video Thumbnail & Click-to-Play Area */}
                      <div 
                        onClick={() => setActiveVideoPlayer(video)}
                        className="relative aspect-video bg-zinc-950 overflow-hidden cursor-pointer select-none"
                      >
                        <img
                          src={thumbnailSrc}
                          alt={video.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
                          referrerPolicy="no-referrer"
                        />

                        {/* Dark Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/30 to-transparent transition-opacity" />

                        {/* Category & Duration Badges */}
                        <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
                          <span className="px-2.5 py-1 bg-red-600 text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg shadow-sm flex items-center gap-1">
                            <Youtube size={12} />
                            {video.category}
                          </span>
                          {video.featured && (
                            <span className="px-2 py-0.5 bg-amber-400 text-zinc-950 font-black text-[9px] uppercase tracking-widest rounded-md">
                              À la Une
                            </span>
                          )}
                        </div>

                        {video.duration && (
                          <span className="absolute bottom-3 right-3 px-2 py-1 bg-zinc-950/85 backdrop-blur-md text-white font-mono text-[11px] font-bold rounded-lg border border-zinc-800 shadow-sm z-10">
                            {video.duration}
                          </span>
                        )}

                        {/* Center Animated Play Button */}
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                          <motion.div
                            whileHover={{ scale: 1.15 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-16 h-16 sm:w-20 sm:h-20 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-red-950/80 border-2 border-white/40 cursor-pointer transition-all"
                          >
                            <Play size={28} className="ml-1 fill-white" />
                          </motion.div>
                        </div>
                      </div>

                      {/* Video Info Content */}
                      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between text-left">
                        <div className="space-y-2">
                          <h4 
                            onClick={() => setActiveVideoPlayer(video)}
                            className="text-base sm:text-lg font-black text-zinc-900 dark:text-white leading-snug group-hover:text-red-500 transition-colors cursor-pointer"
                          >
                            {video.title}
                          </h4>
                          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-light line-clamp-2">
                            {video.description}
                          </p>
                        </div>

                        {/* Interactive Footer & Actions */}
                        <div className="flex items-center justify-between pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800/80">
                          <div className="flex items-center gap-3">
                            <button
                              id={`video-like-btn-${video.id}`}
                              onClick={(e) => handleLike(video.id, e)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                isLiked
                                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                  : 'bg-zinc-100 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-300 hover:text-rose-500'
                              }`}
                            >
                              <Heart size={14} fill={isLiked ? '#F43F5E' : 'none'} className={isLiked ? 'text-rose-500' : ''} />
                              <span>{videoLikes}</span>
                            </button>

                            <button
                              id={`video-share-btn-${video.id}`}
                              onClick={(e) => handleShareVideo(video, e)}
                              className="p-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                              title="Copier le lien de la vidéo"
                            >
                              {copiedVideoId === video.id ? (
                                <span className="text-[10px] font-bold text-emerald-500">Copié !</span>
                              ) : (
                                <Share2 size={15} />
                              )}
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <a
                              href={video.youtubeUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-zinc-700 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                              title="Regarder sur YouTube.com"
                            >
                              <ExternalLink size={13} />
                              <span className="hidden sm:inline">YouTube</span>
                            </a>

                            <button
                              onClick={() => setActiveVideoPlayer(video)}
                              className="px-4 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm cursor-pointer"
                            >
                              <Play size={12} fill="white" />
                              <span>Lire</span>
                            </button>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* ========================================================
            SECTION 2: ESPACE PHOTOS SOUVENIRS (When 'photos' or 'all')
           ======================================================== */}
        {(mediaSpace === 'photos' || mediaSpace === 'all') && (
          <div>
            
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-3 text-left">
                <div className="p-2.5 bg-rose-500/10 text-rose-500 rounded-2xl dark:bg-rose-950/40">
                  <Camera size={24} />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                    Espace Photos & Souvenirs
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Les plus beaux moments de nos cours, stages et soirées capturés en haute définition.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  id="gallery-add-photo-btn"
                  onClick={() => {
                    setAddMediaType('photo');
                    setShowAddMediaModal(true);
                  }}
                  className="px-3.5 py-1.5 bg-zinc-100 dark:bg-zinc-900 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-zinc-700 dark:text-zinc-300 hover:text-rose-600 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-800"
                >
                  <PlusCircle size={14} />
                  <span>+ Ajouter une photo</span>
                </button>
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  {filteredPhotos.length} photo{filteredPhotos.length > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Photos Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredPhotos.map((photo, idx) => {
                  const photoLikes = (likes[photo.id] || 0) + (photo.likes || 18);
                  const isLiked = liked[photo.id];
                  return (
                    <motion.div
                      key={photo.id}
                      id={`gallery-item-${photo.id}`}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                      onClick={() => setPhotoLightboxIndex(idx)}
                      className="group relative rounded-3xl overflow-hidden aspect-[4/3] bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm cursor-zoom-in hover:shadow-xl transition-all duration-300"
                    >
                      <img
                        src={photo.url}
                        alt={photo.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />

                      {/* Tropical Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/35 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 text-left">
                        <div className="space-y-1">
                          <span className="text-[10px] bg-amber-400 font-bold uppercase tracking-widest text-zinc-900 px-2 py-0.5 rounded">
                            {photo.category}
                          </span>
                          <h4 className="text-base font-extrabold text-white leading-tight">
                            {photo.title}
                          </h4>
                          <p className="text-xs text-zinc-300 font-light line-clamp-2">
                            {photo.description}
                          </p>
                        </div>

                        {/* Interactive photo actions inside overlay */}
                        <div className="flex items-center justify-between pt-4 mt-3 border-t border-white/10 text-white">
                          <button
                            id={`gallery-like-btn-${photo.id}`}
                            onClick={(e) => handleLike(photo.id, e)}
                            className="flex items-center gap-1.5 hover:text-rose-400 text-xs font-bold transition-colors cursor-pointer"
                          >
                            <Heart size={16} fill={isLiked ? '#F43F5E' : 'none'} className={isLiked ? 'text-rose-500 animate-bounce' : ''} />
                            <span>{photoLikes}</span>
                          </button>

                          <span className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                            <Eye size={16} />
                          </span>
                        </div>
                      </div>

                      {/* Simple visible category ribbon on mobile */}
                      <span className="absolute top-3 left-3 bg-white/95 dark:bg-zinc-900/95 text-zinc-800 dark:text-zinc-200 text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-lg shadow-sm group-hover:opacity-0 transition-opacity">
                        {photo.category}
                      </span>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

          </div>
        )}

        {/* ========================================================
            MODAL 1: THEATER MODE YOUTUBE PLAYER
           ======================================================== */}
        <AnimatePresence>
          {activeVideoPlayer && (
            <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 select-none overflow-y-auto">
              
              {/* Top controls */}
              <div className="flex items-center justify-between text-white w-full max-w-5xl mx-auto pt-2 mb-3">
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-red-600 text-white font-bold uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Youtube size={13} />
                      {activeVideoPlayer.category}
                    </span>
                    {activeVideoPlayer.duration && (
                      <span className="text-xs text-zinc-400 font-mono">
                        {activeVideoPlayer.duration}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold mt-1.5 leading-tight">{activeVideoPlayer.title}</h3>
                </div>
                <button
                  id="close-video-player-btn"
                  onClick={() => setActiveVideoPlayer(null)}
                  className="p-2.5 bg-white/10 hover:bg-red-600 rounded-full transition-colors cursor-pointer text-white text-lg font-bold"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Central Responsive YouTube Embed */}
              <div className="flex-1 flex items-center justify-center max-w-5xl mx-auto my-2 w-full">
                <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl bg-zinc-950 border border-zinc-800 relative">
                  {(() => {
                    const videoId = activeVideoPlayer.youtubeId || extractYouTubeId(activeVideoPlayer.youtubeUrl);
                    if (videoId) {
                      return (
                        <iframe
                          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
                          title={activeVideoPlayer.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      );
                    } else {
                      return (
                        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-white">
                          <Youtube size={48} className="text-red-500 mb-3" />
                          <p className="font-bold text-base">Lien YouTube non intégrable directement</p>
                          <a
                            href={activeVideoPlayer.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                          >
                            <span>Ouvrir sur YouTube</span>
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>

              {/* Bottom detail banner */}
              <div className="bg-zinc-900/80 border border-zinc-800 p-4 sm:p-5 rounded-2xl max-w-5xl w-full mx-auto text-left text-white flex flex-col md:flex-row md:items-center justify-between gap-4 mt-3">
                <p className="text-xs sm:text-sm font-light text-zinc-300 md:max-w-2xl">
                  {activeVideoPlayer.description}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    id="video-player-like-btn"
                    onClick={(e) => handleLike(activeVideoPlayer.id, e)}
                    className="flex-1 md:flex-initial py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Heart size={14} fill={liked[activeVideoPlayer.id] ? '#ffffff' : 'none'} />
                    <span>J'aime ({((likes[activeVideoPlayer.id] || 0) + (activeVideoPlayer.likes || 15))})</span>
                  </button>
                  <a
                    href={activeVideoPlayer.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 md:flex-initial py-2.5 px-4 bg-zinc-800 hover:bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <ExternalLink size={14} />
                    <span>Ouvrir sur YouTube</span>
                  </a>
                </div>
              </div>

            </div>
          )}
        </AnimatePresence>

        {/* ========================================================
            MODAL 2: PHOTO LIGHTBOX MODAL CAROUSEL
           ======================================================== */}
        <AnimatePresence>
          {photoLightboxIndex !== null && currentPhoto && (
            <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-6 select-none">
              
              {/* Top controls */}
              <div className="flex items-center justify-between text-white w-full max-w-5xl mx-auto pt-2">
                <div className="text-left">
                  <span className="text-xs bg-orange-500 text-white font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
                    {currentPhoto.category}
                  </span>
                  <h3 className="text-lg font-bold mt-1.5 leading-none">{currentPhoto.title}</h3>
                </div>
                <button
                  id="close-lightbox-btn"
                  onClick={() => setPhotoLightboxIndex(null)}
                  className="p-2.5 bg-white/10 hover:bg-rose-600 rounded-full transition-colors cursor-pointer text-white text-lg font-bold"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Central Image container */}
              <div className="flex-1 flex items-center justify-center max-w-5xl mx-auto my-4 w-full relative">
                
                {/* Previous trigger */}
                <button
                  id="prev-lightbox-btn"
                  onClick={() => setPhotoLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredPhotos.length - 1))}
                  className="absolute left-2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all cursor-pointer z-10"
                >
                  ◀
                </button>

                <div className="max-h-[70vh] md:max-h-[75vh] max-w-full flex items-center justify-center relative rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={currentPhoto.url}
                    alt={currentPhoto.title}
                    className="object-contain max-h-[70vh] md:max-h-[75vh] rounded-2xl"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Next trigger */}
                <button
                  id="next-lightbox-btn"
                  onClick={() => setPhotoLightboxIndex((prev) => (prev !== null && prev < filteredPhotos.length - 1 ? prev + 1 : 0))}
                  className="absolute right-2 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all cursor-pointer z-10"
                >
                  ▶
                </button>
              </div>

              {/* Bottom detail banner */}
              <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-2xl max-w-4xl w-full mx-auto text-left text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                <p className="text-sm font-light text-zinc-300 md:max-w-2xl">
                  {currentPhoto.description}
                </p>

                <div className="flex gap-2">
                  <button
                    id="lightbox-like-btn"
                    onClick={(e) => handleLike(currentPhoto.id, e)}
                    className="flex-1 md:flex-initial py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Heart size={14} fill={liked[currentPhoto.id] ? '#ffffff' : 'none'} />
                    <span>J'aime ({((likes[currentPhoto.id] || 0) + (currentPhoto.likes || 18))})</span>
                  </button>
                  <button
                    id="lightbox-download-btn"
                    onClick={() => alert('Photo haute résolution prête à être enregistrée')}
                    className="flex-1 md:flex-initial py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Download size={14} />
                    <span>Télécharger</span>
                  </button>
                </div>
              </div>

            </div>
          )}
        </AnimatePresence>

        {/* ========================================================
            MODAL 3: ADD NEW YOUTUBE VIDEO OR PHOTO
           ======================================================== */}
        <AnimatePresence>
          {showAddMediaModal && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl text-left"
              >
                <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800 mb-5">
                  <div className="flex items-center gap-2.5">
                    {addMediaType === 'video' ? (
                      <div className="p-2 bg-red-500/10 text-red-500 rounded-xl">
                        <Youtube size={20} />
                      </div>
                    ) : (
                      <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl">
                        <Camera size={20} />
                      </div>
                    )}
                    <div>
                      <h3 className="text-lg font-black text-zinc-900 dark:text-white">
                        {addMediaType === 'video' ? 'Ajouter un lien vidéo YouTube' : 'Ajouter une nouvelle photo'}
                      </h3>
                      <p className="text-xs text-zinc-500">
                        {addMediaType === 'video' ? 'Intégrez une vidéo de cours, rueda ou démo.' : 'Partagez un souvenir visuel.'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddMediaModal(false)}
                    className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-white rounded-lg cursor-pointer"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Media Type Switcher */}
                <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-950 rounded-xl mb-4">
                  <button
                    type="button"
                    onClick={() => setAddMediaType('video')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      addMediaType === 'video'
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <Youtube size={14} />
                    <span>Vidéo YouTube</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddMediaType('photo')}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      addMediaType === 'photo'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    <ImageIcon size={14} />
                    <span>Photo</span>
                  </button>
                </div>

                {formSuccess ? (
                  <div className="py-8 text-center space-y-2">
                    <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                    <h4 className="text-base font-bold text-zinc-900 dark:text-white">Média ajouté avec succès !</h4>
                    <p className="text-xs text-zinc-500">Il apparaît désormais en haut de la galerie.</p>
                  </div>
                ) : (
                  <form onSubmit={handleAddMediaSubmit} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                        Titre du média *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={addMediaType === 'video' ? 'Ex: Démo Rueda de Casino 2026' : 'Ex: Souvenir Soirée Tropicale'}
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                          Catégorie *
                        </label>
                        <select
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500"
                        >
                          <option value="Salsa Cubaine">Salsa Cubaine</option>
                          <option value="Cardio Latino">Cardio Latino</option>
                          <option value="Stages & Ateliers">Stages & Ateliers</option>
                          <option value="Soirées & Fêtes">Soirées & Fêtes</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                          {addMediaType === 'video' ? 'Lien YouTube (URL) *' : 'URL de l\'image (URL) *'}
                        </label>
                        <input
                          type="url"
                          required
                          placeholder={addMediaType === 'video' ? 'https://www.youtube.com/watch?v=...' : 'https://images.unsplash.com/...'}
                          value={newUrl}
                          onChange={(e) => setNewUrl(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500 font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 block mb-1">
                        Description courte (optionnelle)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Quelques mots pour décrire la vidéo ou la photo..."
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        className="w-full px-3.5 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddMediaModal(false)}
                        className="px-4 py-2.5 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className={`px-5 py-2.5 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer transition-all ${
                          addMediaType === 'video'
                            ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500'
                            : 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500'
                        }`}
                      >
                        Publier dans la galerie
                      </button>
                    </div>
                  </form>
                )}

              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};
