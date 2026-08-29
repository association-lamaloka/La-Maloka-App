import React, { useState } from 'react';
import { LaMalokaOfficialLogoSVG } from './LaMalokaOfficialLogo';
import { SiteSettings } from '../types';
import { Mail, Phone, MapPin, Clock, Instagram, Facebook, Youtube, MessageCircle, ExternalLink, QrCode } from 'lucide-react';
import { InstagramQRModal } from './InstagramQRModal';
import qrImage from '../assets/images/instagram_qr_1786885774879.jpg';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
  siteSettings?: SiteSettings;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab, siteSettings }) => {
  const [showQRModal, setShowQRModal] = useState(false);
  const email = siteSettings?.contactEmail || 'association.lamaloka@gmail.com';
  const phone = siteSettings?.contactPhone || '06 12 34 56 78';
  const whatsapp = siteSettings?.contactWhatsApp || phone;
  const contactPerson = siteSettings?.contactPerson || 'Bureau de l\'Association';
  const hours = siteSettings?.contactHours || 'Lundi au Vendredi : 10h00 - 19h30';
  const locationFontenay = siteSettings?.locationFontenay || 'Gymnase du Levant, Fontenay-le-Fleury (78330)';
  const locationLaQueue = siteSettings?.locationLaQueue || 'Salle des Fêtes, La Queue-les-Yvelines (78940)';
  const facebookUrl = siteSettings?.facebookUrl || 'https://facebook.com/lamaloka78';
  const instagramUrl = siteSettings?.instagramUrl || 'https://instagram.com/association_la_maloka';
  const youtubeUrl = siteSettings?.youtubeUrl || 'https://youtube.com/@lamalokadanse';

  return (
    <footer className="bg-zinc-950 text-zinc-400 border-t border-zinc-900 py-12 relative overflow-hidden">
      
      {/* Decorative plant watermark */}
      <div className="absolute -bottom-8 -left-8 text-emerald-950/25 pointer-events-none w-32 h-32 select-none">
        <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
          <path d="M50 5C30 5 15 25 15 50C15 65 22 78 35 87L38 83C28 75 22 63 22 50" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 text-left">
          
          {/* Logo Brand Info & Socials */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-white">
              <div className="w-14 h-12 rounded-xl bg-[#95B208] p-1 shadow-md shadow-lime-900/30 flex items-center justify-center shrink-0 overflow-hidden border border-lime-400/40">
                {siteSettings?.logoUrl ? <img src={siteSettings.logoUrl} alt="" className="h-full w-full object-contain" /> : <LaMalokaOfficialLogoSVG showText={false} className="w-full h-full object-contain" />}
              </div>
              <div>
                <span className="font-sans font-black text-lg tracking-tight bg-gradient-to-r from-lime-400 via-emerald-400 to-rose-400 bg-clip-text text-transparent uppercase block">
                  {siteSettings?.associationName || 'LA MALOKA'}
                </span>
                <span className="text-[10px] text-zinc-400 font-medium block">
                  Salsa Cubaine & Cardio Latino
                </span>
              </div>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed font-light">
              Association de Danse Tropicale dédiée à la Salsa Cubaine & au Cardio Latino. Convivialité, rythme et partage à Fontenay-le-Fleury et La Queue-les-Yvelines.
            </p>

            {/* Social media links & QR Code Scanner */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-2.5">
                {facebookUrl && (
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook La Maloka"
                    className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 flex items-center justify-center transition-colors border border-zinc-800"
                  >
                    <Facebook size={15} />
                  </a>
                )}
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram La Maloka"
                    className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-pink-500/20 text-zinc-400 hover:text-pink-400 flex items-center justify-center transition-colors border border-zinc-800"
                  >
                    <Instagram size={15} />
                  </a>
                )}
                {youtubeUrl && (
                  <a
                    href={youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube La Maloka"
                    className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 flex items-center justify-center transition-colors border border-zinc-800"
                  >
                    <Youtube size={15} />
                  </a>
                )}
              </div>

              {/* Instagram QR Code Miniature Card */}
              <div 
                onClick={() => setShowQRModal(true)}
                className="group cursor-pointer p-3 rounded-2xl bg-zinc-900/80 hover:bg-zinc-900 border border-pink-500/20 hover:border-pink-500/40 transition-all flex items-center gap-3 shadow-lg shadow-pink-500/5"
              >
                <div className="w-12 h-12 bg-white p-1 rounded-xl shrink-0 shadow-inner group-hover:scale-105 transition-transform overflow-hidden">
                  <img
                    src={qrImage}
                    alt="QR Code Instagram"
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="overflow-hidden">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-pink-400 uppercase tracking-wider">
                    <QrCode size={12} />
                    <span>Instagram QR</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 group-hover:text-zinc-200 transition-colors truncate">
                    Scanner @association_la_maloka
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Direct */}
          <div className="space-y-3.5 text-xs text-left">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Phone size={14} className="text-rose-400" />
              <span>Contact & Renseignements</span>
            </h4>
            <div className="space-y-2 font-light">
              <p className="text-zinc-500 text-[11px]">
                Référent : <span className="text-zinc-300 font-medium">{contactPerson}</span>
              </p>
              <a
                href={`mailto:${email}`}
                className="flex items-center gap-2 text-zinc-300 hover:text-rose-400 transition-colors"
              >
                <Mail size={13} className="text-rose-400 shrink-0" />
                <span className="truncate">{email}</span>
              </a>
              <a
                href={`tel:${phone.replace(/\s+/g, '')}`}
                className="flex items-center gap-2 text-zinc-300 hover:text-emerald-400 transition-colors font-medium"
              >
                <Phone size={13} className="text-emerald-400 shrink-0" />
                <span>{phone}</span>
              </a>
              {whatsapp && (
                <a
                  href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-emerald-400 hover:underline text-[11px]"
                >
                  <MessageCircle size={13} className="shrink-0" />
                  <span>WhatsApp direct</span>
                </a>
              )}
            </div>
          </div>

          {/* Salles et Adresses */}
          <div className="space-y-3.5 text-xs text-left">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={14} className="text-emerald-400" />
              <span>Nos Lieux de Pratique</span>
            </h4>
            <div className="space-y-2.5 font-light">
              <div className="flex items-start gap-2">
                <span className="text-rose-400 text-xs mt-0.5 font-bold">📍</span>
                <div>
                  <p className="font-semibold text-zinc-200">Fontenay-le-Fleury</p>
                  <p className="text-[11px] text-zinc-400">{locationFontenay}</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 text-xs mt-0.5 font-bold">📍</span>
                <div>
                  <p className="font-semibold text-zinc-200">La Queue-les-Yvelines</p>
                  <p className="text-[11px] text-zinc-400">{locationLaQueue}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick links & Hours */}
          <div className="space-y-3.5 text-xs text-left">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={14} className="text-amber-400" />
              <span>Permanence & Horaires</span>
            </h4>
            <div className="space-y-1.5 font-light text-[11px]">
              <p className="text-zinc-300 font-medium">{hours}</p>
              <p className="text-zinc-500 pt-1">
                Accueil lors des cours hebdomadaires et aux stands des Forums de rentrée.
              </p>
            </div>

            <div className="pt-2 border-t border-zinc-900">
              <button onClick={() => setCurrentTab('conditions')} className="mb-2 block text-[11px] text-zinc-400 hover:text-rose-400">Conditions générales d’adhésion</button>
              <button
                onClick={() => {
                  setCurrentTab('administration');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-[11px] text-zinc-500 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Accès Espace Administration</span>
                <ExternalLink size={11} />
              </button>
            </div>
          </div>

        </div>

        {/* Legal copyrights bar */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-600 font-light gap-4 text-center sm:text-left">
          <p>{siteSettings?.copyrightText || '© 2026 Association La Maloka. Salsa Cubaine & Cardio Latino dans les Yvelines.'}</p>
          {siteSettings?.footerLegalText && <p className="max-w-xl text-[10px]">{siteSettings.footerLegalText}</p>}
          <div className="flex gap-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-500">Fontenay-le-Fleury & La Queue-les-Yvelines</span>
          </div>
        </div>

      </div>

      {/* Instagram QR Code Fullscreen Modal */}
      <InstagramQRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        instagramUrl={instagramUrl}
        accountHandle="@association_la_maloka"
      />
    </footer>
  );
};
