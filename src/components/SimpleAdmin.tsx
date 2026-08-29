import { FormEvent, useEffect, useState } from 'react';
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import { LogIn, LogOut, Plus, Save, ShieldCheck, Trash2 } from 'lucide-react';
import { auth } from '../firebase';
import { PhotoItem, SiteSettings } from '../types';
import { deleteGalleryPhoto, saveGalleryPhoto, saveSiteSettingsToCloud } from '../services/firestoreService';

interface Props { settings: SiteSettings; photos: PhotoItem[] }

export function SimpleAdmin({ settings, photos }: Props) {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState(settings);
  const [photo, setPhoto] = useState({ title: '', url: '', description: '' });

  useEffect(() => onAuthStateChanged(auth, setUser), []);
  useEffect(() => setForm(settings), [settings]);

  const login = async () => {
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ login_hint: 'association.lamaloka@gmail.com' });
      await signInWithPopup(auth, provider);
    } catch {
      setError('La connexion avec Google a échoué. Réessayez avec le compte association.lamaloka@gmail.com ou contactez la personne responsable du site.');
    }
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('Enregistrement…');
    try {
      await saveSiteSettingsToCloud(form);
      setMessage('Modifications publiées.');
    } catch {
      setMessage("Échec de l'enregistrement. Votre compte ne dispose peut-être pas des droits nécessaires.");
    }
  };

  const addPhoto = async (event: FormEvent) => {
    event.preventDefault();
    if (!photo.title.trim() || !photo.url.startsWith('https://')) return;
    await saveGalleryPhoto({ id: crypto.randomUUID(), ...photo, category: 'Association', date: new Date().toISOString().slice(0, 10) });
    setPhoto({ title: '', url: '', description: '' });
  };

  if (!user) return (
    <section className="mx-auto flex min-h-[65vh] max-w-md items-center px-4 py-16">
      <div className="w-full space-y-5 rounded-3xl border border-zinc-200 bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
        <ShieldCheck className="text-emerald-500" size={36} /><div><h1 className="text-2xl font-black">Accès équipe</h1><p className="mt-2 text-sm text-zinc-500">Connectez-vous avec le compte Google de l'association.</p></div>
        {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}
        <button type="button" onClick={login} className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 p-3 font-bold text-white dark:bg-white dark:text-zinc-900"><LogIn size={17} /> Se connecter avec Google</button>
      </div>
    </section>
  );

  return (
    <section className="mx-auto max-w-5xl space-y-8 px-4 py-12">
      <header className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm text-emerald-600">Connecté : {user.email}</p><h1 className="text-3xl font-black">Administration du contenu</h1></div><button onClick={() => signOut(auth)} className="flex items-center gap-2 rounded-xl border px-4 py-2"><LogOut size={16} /> Déconnexion</button></header>
      <form onSubmit={save} className="grid gap-5 rounded-3xl border border-zinc-200 p-6 dark:border-zinc-800 md:grid-cols-2">
        <h2 className="text-xl font-black md:col-span-2">Informations principales</h2>
        <Field label="Titre principal" value={form.heroHeadline} onChange={(heroHeadline) => setForm({ ...form, heroHeadline })} />
        <Field label="Sous-titre" value={form.heroSubheadline} onChange={(heroSubheadline) => setForm({ ...form, heroSubheadline })} />
        <Field label="Email public" type="email" value={form.contactEmail} onChange={(contactEmail) => setForm({ ...form, contactEmail })} />
        <Field label="Téléphone public" value={form.contactPhone} onChange={(contactPhone) => setForm({ ...form, contactPhone })} />
        <button className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 p-3 font-bold text-white md:col-span-2"><Save size={17} /> Publier les modifications</button>
        {message && <p role="status" className="text-sm md:col-span-2">{message}</p>}
      </form>

      <div className="rounded-3xl border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="mb-5 text-xl font-black">Galerie publique</h2>
        <form onSubmit={addPhoto} className="grid gap-3 md:grid-cols-3"><input required placeholder="Titre" value={photo.title} onChange={(e) => setPhoto({ ...photo, title: e.target.value })} className="rounded-xl border bg-transparent p-3 dark:border-zinc-700" /><input required type="url" placeholder="https://…" value={photo.url} onChange={(e) => setPhoto({ ...photo, url: e.target.value })} className="rounded-xl border bg-transparent p-3 dark:border-zinc-700" /><button className="flex items-center justify-center gap-2 rounded-xl bg-rose-600 p-3 font-bold text-white"><Plus size={17} /> Ajouter</button></form>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">{photos.map((item) => <div key={item.id} className="flex items-center gap-3 rounded-2xl bg-zinc-100 p-3 dark:bg-zinc-800"><img src={item.url} alt="" className="h-14 w-14 rounded-xl object-cover" /><span className="min-w-0 flex-1 truncate font-semibold">{item.title}</span><button onClick={() => deleteGalleryPhoto(item.id)} aria-label={`Supprimer ${item.title}`} className="p-2 text-rose-600"><Trash2 size={17} /></button></div>)}</div>
      </div>
    </section>
  );
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="text-sm font-semibold">{label}<input type={type} required value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full rounded-xl border border-zinc-300 bg-transparent p-3 dark:border-zinc-700" /></label>;
}
