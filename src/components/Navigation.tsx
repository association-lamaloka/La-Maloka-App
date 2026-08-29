import { useState } from 'react';
import { Menu, Moon, Shield, Sun, X } from 'lucide-react';
import { LaMalokaOfficialLogoSVG } from './LaMalokaOfficialLogo';

interface NavigationProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const items = [
  { id: 'accueil', label: 'Accueil' },
  { id: 'cours', label: 'Cours' },
  { id: 'agenda', label: 'Agenda' },
  { id: 'galerie', label: 'Photos' },
];

export function Navigation({ currentTab, setCurrentTab, isDarkMode, toggleDarkMode }: NavigationProps) {
  const [open, setOpen] = useState(false);

  const navigate = (tab: string) => {
    setCurrentTab(tab);
    setOpen(false);
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-lime-200/60 bg-white/95 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6">
        <button onClick={() => navigate('accueil')} className="flex items-center gap-3 text-left" aria-label="Accueil La Maloka">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#95B208] p-1 shadow-md">
            <LaMalokaOfficialLogoSVG showText={false} className="h-full w-full" />
          </span>
          <span>
            <strong className="block text-xl font-black text-[#557219] dark:text-lime-400">LA MALOKA</strong>
            <small className="hidden uppercase tracking-widest text-zinc-500 sm:block">Salsa & Cardio Latino</small>
          </span>
        </button>

        <div className="hidden items-center gap-1 md:flex">
          {items.map((item) => (
            <button key={item.id} onClick={() => navigate(item.id)} className={`rounded-xl px-4 py-2 text-sm font-semibold ${currentTab === item.id ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300' : 'text-zinc-600 dark:text-zinc-300'}`}>
              {item.label}
            </button>
          ))}
          <button onClick={toggleDarkMode} className="ml-2 rounded-xl p-2" aria-label="Changer de thème">
            {isDarkMode ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <button onClick={() => navigate('administration')} className="ml-2 flex items-center gap-2 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white dark:bg-white dark:text-zinc-900">
            <Shield size={14} /> Équipe
          </button>
        </div>

        <button onClick={() => setOpen((value) => !value)} className="rounded-xl p-2 md:hidden" aria-label="Ouvrir le menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="space-y-2 border-t bg-white px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900 md:hidden">
          {[...items, { id: 'administration', label: 'Accès équipe' }].map((item) => (
            <button key={item.id} onClick={() => navigate(item.id)} className="block w-full rounded-xl px-4 py-3 text-left font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800">
              {item.label}
            </button>
          ))}
          <button onClick={toggleDarkMode} className="rounded-xl px-4 py-3">{isDarkMode ? 'Mode clair' : 'Mode sombre'}</button>
        </div>
      )}
    </nav>
  );
}
