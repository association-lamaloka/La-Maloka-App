import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Instagram, QrCode, X, Download, ExternalLink, Sparkles, Smartphone, Check } from 'lucide-react';
import qrImage from '../assets/images/instagram_qr_1786885774879.jpg';

interface InstagramQRProps {
  isOpen: boolean;
  onClose: () => void;
  instagramUrl?: string;
  accountHandle?: string;
}

export const InstagramQRModal: React.FC<InstagramQRProps> = ({
  isOpen,
  onClose,
  instagramUrl = 'https://instagram.com/association_la_maloka',
  accountHandle = '@association_la_maloka'
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(instagramUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm sm:max-w-md bg-zinc-900 border border-pink-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-pink-500/10 text-center overflow-hidden z-10"
          >
            {/* Top decorative glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-pink-500 to-amber-500 rounded-full blur-3xl opacity-25 pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-tr from-purple-600 to-rose-500 rounded-full blur-3xl opacity-20 pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
              aria-label="Fermer"
            >
              <X size={18} />
            </button>

            {/* Header Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-pink-500/20 to-orange-500/20 border border-pink-500/30 text-pink-400 text-xs font-bold uppercase tracking-wider mb-4">
              <Instagram size={14} className="text-pink-400" />
              <span>Instagram Officiel</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Scannez pour nous Suivre !
            </h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
              Retrouvez nos vidéos de cours, chorégraphies, ambiances des soirées et actualités de La Maloka.
            </p>

            {/* QR Code Card Display */}
            <div className="mt-5 p-4 sm:p-5 bg-white rounded-3xl shadow-xl border border-zinc-200 inline-block relative group">
              <img
                src={qrImage}
                alt="QR Code Instagram Association La Maloka"
                className="w-56 h-56 sm:w-64 sm:h-64 object-contain mx-auto rounded-xl"
                referrerPolicy="no-referrer"
              />

              <div className="mt-2 text-center">
                <span className="font-mono font-bold text-xs sm:text-sm tracking-wider bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 bg-clip-text text-transparent uppercase">
                  ASSOCIATION_LA_MALOKA
                </span>
              </div>
            </div>

            {/* Scanning Guide Instructions */}
            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-zinc-400 font-light">
              <Smartphone size={13} className="text-pink-400 shrink-0" />
              <span>Ouvrez l'appareil photo de votre smartphone et visez le QR code</span>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-500 hover:via-pink-500 hover:to-orange-400 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-pink-500/20 transition-all cursor-pointer"
              >
                <Instagram size={14} />
                <span>Ouvrir l'application</span>
                <ExternalLink size={12} />
              </a>

              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer border border-zinc-700"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-emerald-400" />
                    <span className="text-emerald-400">Lien copié !</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} className="text-amber-400" />
                    <span>Copier le profil</span>
                  </>
                )}
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800/80 text-[11px] text-zinc-500">
              Compte officiel : <span className="text-pink-400 font-semibold">{accountHandle}</span>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
