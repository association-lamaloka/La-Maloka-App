import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Check, Trash2, Shield, MessageSquare, Play, Sparkles, Megaphone } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationsCenterProps {
  show: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onMarkRead: (id: string) => void;
  onTriggerTestAlert: () => void;
}

export const NotificationsCenter: React.FC<NotificationsCenterProps> = ({
  show,
  onClose,
  notifications,
  onMarkAllRead,
  onClearAll,
  onMarkRead,
  onTriggerTestAlert,
}) => {
  // Subscription Preferences state
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [reminderHours, setReminderHours] = useState(true);

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop Overlay click-out */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-xs"
          />

          {/* Drawer Slide-Over Sheet */}
          <motion.div
            id="notifications-drawer-container"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 max-w-md w-full bg-white dark:bg-zinc-900 shadow-2xl z-50 border-l border-rose-100 dark:border-zinc-800 flex flex-col justify-between"
          >
            
            {/* Header section */}
            <div className="p-6 border-b border-rose-100 dark:border-zinc-800 flex justify-between items-center bg-rose-50/20 dark:bg-zinc-900 text-left">
              <div className="flex items-center gap-2.5">
                <Bell size={20} className="text-rose-500 animate-pulse" />
                <div>
                  <h3 className="font-extrabold text-zinc-900 dark:text-white">Notifications</h3>
                  <p className="text-[10px] text-zinc-400 uppercase font-semibold">Alertes de la Communauté</p>
                </div>
              </div>
              
              <button
                id="close-notifications-drawer"
                onClick={onClose}
                className="p-1.5 hover:bg-rose-100 text-zinc-400 hover:text-rose-600 rounded-full transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Notifications Scroll List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-semibold uppercase">Historique des Messages ({notifications.length})</span>
                {notifications.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      id="notifications-mark-read-all-btn"
                      onClick={onMarkAllRead}
                      className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline cursor-pointer"
                    >
                      Lus
                    </button>
                    <span className="text-zinc-300">|</span>
                    <button
                      id="notifications-clear-all-btn"
                      onClick={onClearAll}
                      className="text-rose-500 hover:text-rose-600 font-bold hover:underline cursor-pointer"
                    >
                      Effacer
                    </button>
                  </div>
                )}
              </div>

              {notifications.length === 0 ? (
                /* Empty state screen */
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                    🔔
                  </div>
                  <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Aucune nouvelle alerte</h4>
                  <p className="text-xs text-zinc-400 font-light max-w-xs mx-auto">
                    Vous êtes à jour avec vos événements et inscriptions. Continuez à danser avec passion !
                  </p>
                </div>
              ) : (
                /* Feed items */
                <div className="space-y-3.5">
                  <AnimatePresence mode="popLayout">
                    {notifications.map((notif) => (
                      <motion.div
                        key={notif.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className={`p-4 rounded-2xl border text-left transition-all relative ${
                          notif.read
                            ? 'bg-zinc-50/50 dark:bg-zinc-900/30 border-zinc-100 dark:border-zinc-800/85'
                            : 'bg-rose-50/30 dark:bg-rose-950/10 border-rose-100/60 dark:border-rose-900/40 shadow-xs'
                        }`}
                      >
                        {/* Red unread dot */}
                        {!notif.read && (
                          <span className="absolute top-4 right-4 w-2 h-2 bg-orange-500 rounded-full animate-ping" />
                        )}

                        <div className="space-y-1 pr-4">
                          <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider font-extrabold">
                            <span className={
                              notif.type === 'pago' ? 'text-emerald-600' :
                              notif.type === 'evento' ? 'text-orange-500' :
                              notif.type === 'clase' ? 'text-cyan-500' : 'text-rose-500'
                            }>
                              ● {notif.type === 'pago' ? 'paiement' : notif.type === 'evento' ? 'événement' : notif.type === 'clase' ? 'cours' : 'alerte'}
                            </span>
                            <span className="text-zinc-300">•</span>
                            <span className="text-zinc-400">{notif.date}</span>
                          </div>

                          <h4 className="text-sm font-extrabold text-zinc-800 dark:text-zinc-100 leading-snug">
                            {notif.title}
                          </h4>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-light leading-relaxed">
                            {notif.description}
                          </p>
                        </div>

                        {/* Actions for notification */}
                        {!notif.read && (
                          <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/60 flex justify-end">
                            <button
                              id={`mark-read-item-${notif.id}`}
                              onClick={() => onMarkRead(notif.id)}
                              className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                            >
                              <Check size={12} /> Marcar Vu
                            </button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              {/* Simulated push alert triggers for the client review */}
              <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  id="notifications-demo-trigger"
                  onClick={onTriggerTestAlert}
                  className="w-full py-3.5 bg-zinc-50 hover:bg-rose-50 dark:bg-zinc-800 dark:hover:bg-rose-950/20 text-rose-600 dark:text-rose-400 font-bold rounded-2xl text-xs uppercase tracking-wider border border-rose-100 dark:border-zinc-800 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles size={14} className="animate-spin text-orange-500" />
                  <span>Simuler une Nouvelle Alerte de Danse</span>
                </button>
              </div>
            </div>

            {/* Footer settings/preferences */}
            <div className="p-6 border-t border-rose-100 dark:border-zinc-800 bg-rose-50/25 dark:bg-zinc-900/60 text-left space-y-4">
              <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Paramètres des Canaux</h4>
              
              <div className="space-y-3 text-xs">
                {/* Pref 1 */}
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600 dark:text-zinc-300 font-medium flex items-center gap-1.5">
                    <MessageSquare size={14} /> WhatsApp & Alertes SMS
                  </span>
                  <button
                    id="whatsapp-alert-switch"
                    onClick={() => setWhatsappAlerts(!whatsappAlerts)}
                    className={`w-10 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center ${
                      whatsappAlerts ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'
                    }`}
                  >
                    <div
                      className="w-5 h-5 bg-white rounded-full shadow-md"
                      style={{ transform: whatsappAlerts ? 'translateX(16px)' : 'none' }}
                    />
                  </button>
                </div>

                {/* Pref 2 */}
                <div className="flex items-center justify-between">
                  <span className="text-zinc-600 dark:text-zinc-300 font-medium flex items-center gap-1.5">
                    <Megaphone size={14} /> Rappels 2h avant les soirées
                  </span>
                  <button
                    id="reminder-hours-switch"
                    onClick={() => setReminderHours(!reminderHours)}
                    className={`w-10 h-6 rounded-full transition-colors p-0.5 cursor-pointer flex items-center ${
                      reminderHours ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'
                    }`}
                  >
                    <div
                      className="w-5 h-5 bg-white rounded-full shadow-md"
                      style={{ transform: reminderHours ? 'translateX(16px)' : 'none' }}
                    />
                  </button>
                </div>
              </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
