import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Bell, Moon, Sun, Shield, Sparkles, Instagram, QrCode } from 'lucide-react';
import { LaMalokaOfficialLogoSVG, LaMalokaLogoBadge } from './LaMalokaOfficialLogo';
import { InstagramQRModal } from './InstagramQRModal';

interface NavigationProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  notificationCount: number;
  setShowNotifications: (show: boolean) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  setCurrentTab,
  notificationCount,
  setShowNotifications,
  isDarkMode,
  toggleDarkMode,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  const menuItems = [
    { id: 'inicio', label: 'Accueil' },
    { id: 'clases', label: 'Cours & Inscriptions' },
    { id: 'calendario', label: 'Agenda & Dates' },
    { id: 'galeria', label: 'Galerie Photos' },
  ];

  return (
    <nav className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-lime-200/60 dark:border-zinc-800 transition-colors duration-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo and Name with Official La Maloka Emblem */}
          <div 
            className="flex items-center gap-3 cursor-pointer select-none group"
            onClick={() => setCurrentTab('inicio')}
            id="logo-container"
          >
            <motion.div
              whileHover={{ scale: 1.06, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#95B208] p-1 shadow-md shadow-lime-900/20 border border-lime-300/50 flex items-center justify-center shrink-0 overflow-hidden"
              title="Logo Officiel Association La Maloka"
            >
              <LaMalokaOfficialLogoSVG showText={false} className="w-full h-full object-contain" />
            </motion.div>

            <div className="text-left">
              <span className="font-sans font-black text-xl sm:text-2xl tracking-tight bg-gradient-to-r from-[#557219] via-emerald-600 to-[#C51D24] dark:from-lime-400 dark:via-emerald-400 dark:to-rose-400 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
                LA MALOKA
              </span>
              <span className="hidden sm:block text-[10px] uppercase font-mono tracking-widest text-[#557219] dark:text-lime-400 font-bold">
                Salsa Cubaine & Cardio Latino
              </span>
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-1">
            {menuItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setCurrentTab(item.id)}
                  className={`relative px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors duration-200 cursor-pointer ${
                    isActive
                      ? 'text-rose-600 dark:text-rose-400 font-bold'
                      : 'text-zinc-600 hover:text-rose-500 dark:text-zinc-300 dark:hover:text-rose-400'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeNavTab"
                      className="absolute inset-0 bg-rose-50 dark:bg-rose-950/40 rounded-xl -z-10"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Action Icons */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Instagram QR Code button */}
            <button
              onClick={() => setShowQRModal(true)}
              className="p-2 text-pink-500 hover:text-pink-600 dark:text-pink-400 dark:hover:text-pink-300 rounded-xl hover:bg-pink-50 dark:hover:bg-pink-950/40 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Scanner le QR Code Instagram"
            >
              <Instagram size={18} />
              <span className="text-[11px] font-bold tracking-wider">QR</span>
            </button>

            {/* Dark Mode toggle */}
            <button
              id="theme-toggle-btn"
              onClick={toggleDarkMode}
              className="p-2 text-zinc-500 hover:text-rose-500 dark:text-zinc-400 dark:hover:text-rose-400 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Changer de Thème"
            >
              {isDarkMode ? <Sun size={19} /> : <Moon size={19} />}
            </button>

            {/* Notification bell */}
            <button
              id="notifications-toggle-btn"
              onClick={() => setShowNotifications(true)}
              className="relative p-2 text-zinc-600 hover:text-rose-500 dark:text-zinc-300 dark:hover:text-rose-400 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell size={19} />
              {notificationCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-zinc-900 animate-pulse">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* Administration / Back-office Button */}
            <button
              id="nav-backoffice-btn"
              onClick={() => setCurrentTab('backoffice')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer border ${
                currentTab === 'backoffice'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-transparent shadow-md'
                  : 'bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800/80 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
              }`}
            >
              <Shield size={14} className="text-amber-500" />
              <span>Administration</span>
            </button>
          </div>

          {/* Mobile elements (Bell, Theme & Menu trigger) */}
          <div className="flex items-center lg:hidden gap-1.5">
            <button
              onClick={() => setShowQRModal(true)}
              className="p-2 text-pink-500 dark:text-pink-400"
              title="Instagram QR"
            >
              <Instagram size={20} />
            </button>
            <button
              id="mobile-theme-toggle"
              onClick={toggleDarkMode}
              className="p-2 text-zinc-500 dark:text-zinc-400"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button
              id="mobile-notifications-btn"
              onClick={() => setShowNotifications(true)}
              className="relative p-2 text-zinc-600 dark:text-zinc-300"
            >
              <Bell size={20} />
              {notificationCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white ring-2 ring-white">
                  {notificationCount}
                </span>
              )}
            </button>

            <button
              id="mobile-menu-toggle"
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-menu-container"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-rose-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2 text-left">
              {menuItems.map((item) => {
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`mobile-nav-tab-${item.id}`}
                    onClick={() => {
                      setCurrentTab(item.id);
                      setIsOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all ${
                      isActive
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400 font-bold'
                        : 'text-zinc-600 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}

              <div className="pt-3 border-t border-rose-50 dark:border-zinc-800">
                <button
                  id="mobile-nav-backoffice"
                  onClick={() => {
                    setCurrentTab('backoffice');
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-xs font-bold uppercase tracking-wider shadow-md"
                >
                  <Shield size={14} className="text-amber-400" />
                  Espace Administration (Back-Office)
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instagram QR Code Modal */}
      <InstagramQRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        instagramUrl="https://instagram.com/association_la_maloka"
        accountHandle="@association_la_maloka"
      />
    </nav>
  );
};
