import { FormEvent, ReactNode, useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { LogIn, LogOut, Plus, Save, ShieldCheck, Trash2 } from 'lucide-react';
import { auth, authPersistenceReady } from '../firebase';
import { DanceClass, DanceEvent, MembershipTerms, NavigationItem, PhotoItem, RegistrationProcess, SiteSettings, VideoItem } from '../types';
import { deleteCourse, deleteEvent, deleteGalleryPhoto, deleteVideo, initializeFirestoreContent, saveCourse, saveEvent, saveGalleryPhoto, saveMembershipTerms, saveNavigation, saveRegistrationProcess, saveSiteSettingsToCloud, saveVideo } from '../services/firestoreService';
import { MediaUploader } from './MediaUploader';

type Tab = 'general' | 'navigation' | 'courses' | 'agenda' | 'registration' | 'terms' | 'photos' | 'videos';
interface Props { settings: SiteSettings; navigation: NavigationItem[]; courses: DanceClass[]; events: DanceEvent[]; photos: PhotoItem[]; videos: VideoItem[]; registration: RegistrationProcess; terms: MembershipTerms; user: User | null; authLoading: boolean; authError: string; onAuthorized: (user: User) => void }
const inputClass = 'mt-1 w-full rounded-xl border border-zinc-300 bg-transparent p-2 dark:border-zinc-700';
const extractYouTubeId = (value: string) => {
  const match = value.trim().match(/^(?:https:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/))([A-Za-z0-9_-]{11})(?:[?&#/].*)?$/);
  return match?.[1] ?? null;
};

const authErrorMessage = (caught: unknown) => {
  const code = caught instanceof FirebaseError ? caught.code : 'auth/unknown-error';
  if (code === 'auth/popup-blocked') return 'Le navigateur a bloqué la fenêtre Google. Autorisez les fenêtres émergentes pour cette Preview puis réessayez. Code Firebase : auth/popup-blocked.';
  if (code === 'auth/popup-closed-by-user') return 'La connexion Google a été annulée. Code Firebase : auth/popup-closed-by-user.';
  return `La connexion sécurisée avec Google a échoué. Veuillez réessayer ou contacter la personne responsable du site. Code Firebase : ${code}.`;
};

export function SimpleAdmin({ settings, navigation, courses, events, photos, videos, registration, terms, user, authLoading, authError, onAuthorized }: Props) {
  const [authenticating, setAuthenticating] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('general');
  const [message, setMessage] = useState('');
  const [initializing, setInitializing] = useState(false);

  const login = async () => {
    setError('');
    setAuthenticating(true);
    try {
      await authPersistenceReady;
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      if (result.user.email !== 'association.lamaloka@gmail.com' || !result.user.emailVerified) {
        await signOut(auth);
        setError('Ce compte Google n’est pas autorisé à administrer La Maloka.');
        return;
      }
      onAuthorized(result.user);
    } catch (caught) {
      setError(authErrorMessage(caught));
    } finally {
      setAuthenticating(false);
    }
  };

  const initialize = async () => {
    if (!window.confirm('Initialiser uniquement les collections Firestore encore vides avec le contenu actuel ?')) return;
    setInitializing(true); setMessage('Initialisation en cours…');
    try { setMessage(`Initialisation terminée : ${(await initializeFirestoreContent()).join(' · ')}`); }
    catch { setMessage("Échec de l’initialisation. Vérifiez les règles Firestore et réessayez."); }
    finally { setInitializing(false); }
  };

  if (authenticating) return <Status text="Connexion sécurisée avec Google…" />;
  if (authLoading) return <Status text="Vérification de la connexion sécurisée…" />;
  if (!user) return <section className="mx-auto flex min-h-[65vh] max-w-md items-center px-4 py-16"><div className="w-full space-y-5 rounded-3xl border bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"><ShieldCheck className="text-emerald-500" size={36} /><h1 className="text-2xl font-black">Accès équipe</h1><p className="text-sm text-zinc-500">Connexion sécurisée avec Google. Sélectionnez le compte officiel de l’association.</p>{(error || authError) && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{error || authError}</p>}<button type="button" onClick={login} className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 p-3 font-bold text-white dark:bg-white dark:text-zinc-900"><LogIn size={17} /> Se connecter avec Google</button></div></section>;

  const tabs: Array<[Tab, string]> = [['general', 'Configuration générale'], ['navigation', 'Navigation'], ['courses', 'Cours, tarifs et inscriptions'], ['agenda', 'Agenda'], ['registration', 'Procédure d’inscription'], ['terms', 'Conditions générales d’adhésion'], ['photos', 'Photos'], ['videos', 'Vidéos YouTube']];
  return <section className="mx-auto max-w-7xl space-y-6 px-4 py-10">
    <header className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm text-emerald-600">Connecté : {user.email}</p><h1 className="text-3xl font-black">ÉQUIPE — Administration</h1></div><button onClick={() => signOut(auth)} className="flex items-center gap-2 rounded-xl border px-4 py-2"><LogOut size={16} /> Déconnexion</button></header>
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30"><p className="font-bold">Premier démarrage de Firestore</p><p className="mt-1 text-sm">L’import est idempotent : les collections déjà remplies sont ignorées.</p><button disabled={initializing} onClick={initialize} className="mt-3 rounded-xl bg-amber-600 px-4 py-2 font-bold text-white disabled:opacity-50">{initializing ? 'Initialisation…' : 'Initialiser le contenu'}</button></div>
    {message && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm dark:bg-emerald-950/30">{message}</p>}
    <nav aria-label="Sections du backoffice" className="flex gap-2 overflow-x-auto pb-2">{tabs.map(([id, label]) => <button key={id} onClick={() => setTab(id)} className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold ${tab === id ? 'bg-rose-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800'}`}>{label}</button>)}</nav>
    {tab === 'general' && <GeneralEditor value={settings} notify={setMessage} />}
    {tab === 'navigation' && <NavigationEditor value={navigation} notify={setMessage} />}
    {tab === 'courses' && <CourseEditor items={courses} notify={setMessage} />}
    {tab === 'agenda' && <EventEditor items={events} notify={setMessage} />}
    {tab === 'registration' && <RegistrationEditor value={registration} notify={setMessage} />}
    {tab === 'terms' && <TermsEditor value={terms} notify={setMessage} />}
    {tab === 'photos' && <PhotoEditor items={photos} notify={setMessage} />}
    {tab === 'videos' && <VideoEditor items={videos} notify={setMessage} />}
  </section>;
}

function Status({ text }: { text: string }) { return <p role="status" className="mx-auto min-h-[60vh] max-w-xl p-16 text-center">{text}</p>; }
function Field({ label, value, onChange, type = 'text', required = true }: { key?: string; label: string; value: string | number; onChange: (value: string) => void; type?: string; required?: boolean }) { return <label className="text-sm font-semibold">{label}<input className={inputClass} type={type} required={required} value={value} onChange={(event) => onChange(event.target.value)} /></label>; }
function SaveButton({ label = 'Enregistrer' }: { label?: string }) { return <button className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 p-3 font-bold text-white"><Save size={17} /> {label}</button>; }
const notifySave = async (action: () => Promise<unknown>, notify: (text: string) => void) => { notify('Enregistrement…'); try { await action(); notify('Enregistrement réussi.'); } catch { notify("Erreur lors de l’enregistrement. Vérifiez les champs et vos droits."); } };

function GeneralEditor({ value, notify }: { value: SiteSettings; notify: (text: string) => void }) { const [form, setForm] = useState(value); useEffect(() => setForm(value), [value]); const fields: Array<[string, keyof SiteSettings]> = [['Nom de l’association','associationName'],['Sous-titre / étiquette','tagline'],['Titre principal','heroHeadline'],['Texte descriptif','heroSubheadline'],['Email public','contactEmail'],['Téléphone public','contactPhone'],['Facebook HTTPS','facebookUrl'],['Instagram HTTPS','instagramUrl'],['YouTube HTTPS','youtubeUrl'],['Adresse Fontenay','locationFontenay'],['Adresse La Queue','locationLaQueue'],['Saison','season'],['Texte légal du pied','footerLegalText'],['Copyright','copyrightText'],['Titre page Cours','coursesPageTitle'],['Sous-titre page Cours','coursesPageSubtitle'],['Titre page Agenda','agendaPageTitle'],['Sous-titre page Agenda','agendaPageSubtitle'],['Titre Photos & Vidéos','galleryPageTitle'],['Sous-titre Photos & Vidéos','galleryPageSubtitle'],['Texte du bandeau','bannerText'],['Bouton principal accueil','heroPrimaryButtonText'],['Bouton agenda accueil','heroSecondaryButtonText']]; return <form onSubmit={(e) => { e.preventDefault(); notifySave(() => saveSiteSettingsToCloud(form), notify); }} className="grid gap-4 rounded-3xl border p-6 md:grid-cols-2"><div className="grid gap-4 md:col-span-2 md:grid-cols-2"><MediaUploader label="Logotype" currentUrl={form.logoUrl} onUploaded={(media) => setForm({ ...form, logoUrl: media.url })} /><MediaUploader label="Image principale de portada" currentUrl={form.heroImage} onUploaded={(media) => setForm({ ...form, heroImage: media.url })} /></div>{fields.map(([label,key]) => <Field key={key} label={label} required={!['facebookUrl','instagramUrl','youtubeUrl','season','footerLegalText','copyrightText','coursesPageSubtitle','agendaPageSubtitle','galleryPageSubtitle'].includes(key)} value={String(form[key] ?? '')} onChange={(text) => setForm({ ...form, [key]: text })} />)}<label className="flex items-center gap-2 md:col-span-2"><input type="checkbox" checked={form.bannerVisible ?? true} onChange={(event) => setForm({ ...form, bannerVisible: event.target.checked })} /> Bandeau accueil publié</label><div className="flex gap-2 md:col-span-2"><SaveButton /><button type="button" onClick={() => setForm(value)} className="rounded-xl border px-4">Restaurer / annuler</button></div></form>; }

function NavigationEditor({ value, notify }: { value: NavigationItem[]; notify: (text: string) => void }) {
  const [items, setItems] = useState(value);
  useEffect(() => setItems(value), [value]);
  const move = (index: number, offset: number) => { const ordered = [...items].sort((a,b) => a.order-b.order); const target = index + offset; if (target < 0 || target >= ordered.length) return; [ordered[index], ordered[target]] = [ordered[target], ordered[index]]; setItems(ordered.map((item, order) => ({ ...item, order }))); };
  return <form onSubmit={(event) => { event.preventDefault(); notifySave(() => saveNavigation(items), notify); }} className="space-y-3 rounded-3xl border p-6"><p className="text-sm text-zinc-500">Les destinations sont limitées aux pages internes sûres.</p>{[...items].sort((a,b) => a.order-b.order).map((item,index) => <div key={item.id} className="grid gap-2 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900 md:grid-cols-[1fr_12rem_auto_auto]"><Field label="Texte" value={item.label} onChange={(label) => setItems(items.map((entry) => entry.id === item.id ? { ...entry, label } : entry))} /><label className="text-sm font-semibold">Destination<select className={inputClass} value={item.destination} onChange={(event) => setItems(items.map((entry) => entry.id === item.id ? { ...entry, destination: event.target.value as NavigationItem['destination'] } : entry))}><option value="accueil">Accueil</option><option value="cours">Cours</option><option value="agenda">Agenda</option><option value="galerie">Photos & Vidéos</option></select></label><label className="flex items-center gap-2"><input type="checkbox" checked={item.active} onChange={(event) => setItems(items.map((entry) => entry.id === item.id ? { ...entry, active: event.target.checked } : entry))} /> Publié</label><div className="flex items-end gap-1"><button type="button" aria-label={`Monter ${item.label}`} onClick={() => move(index,-1)} className="rounded-lg border p-2">↑</button><button type="button" aria-label={`Descendre ${item.label}`} onClick={() => move(index,1)} className="rounded-lg border p-2">↓</button></div></div>)}<div className="flex gap-2"><SaveButton /><button type="button" onClick={() => setItems(value)} className="rounded-xl border px-4">Restaurer / annuler</button></div></form>;
}

const blankCourse = (): DanceClass => ({ id: crypto.randomUUID(), name: '', description: '', category: '', level: '', instructor: '', schedule: '', location: '', image: '', season: '', priceMonthly: 0, annualPrice: 0, isFree: false, helloAssoUrl: '', active: true, order: 0 });
function CourseEditor({ items, notify }: { items: DanceClass[]; notify: (text: string) => void }) { const [draft, setDraft] = useState<DanceClass | null>(null); return <CollectionLayout title="Cours" onAdd={() => setDraft({ ...blankCourse(), order: items.length })}>{draft && <CourseForm value={draft} cancel={() => setDraft(null)} save={(item) => notifySave(async () => { await saveCourse(item); setDraft(null); }, notify)} />}{items.map((item) => <ItemRow key={item.id} title={item.name} detail={`${item.annualPrice ?? 0} € · ordre ${item.order ?? 0} · ${item.active === false ? 'inactif' : 'actif'}`} edit={() => setDraft(item)} remove={async () => { if (confirm(`Supprimer le cours « ${item.name} » ?`)) await notifySave(() => deleteCourse(item.id), notify); }} />)}</CollectionLayout>; }
function CourseForm({ value, save, cancel }: { value: DanceClass; save: (value: DanceClass) => void; cancel: () => void }) { const [f, setF] = useState(value); const fields: Array<[string, keyof DanceClass]> = [['Nom', 'name'], ['Description', 'description'], ['Discipline / catégorie', 'category'], ['Niveau', 'level'], ['Professeur', 'instructor'], ['Horaire', 'schedule'], ['Lieu', 'location'], ['Saison', 'season'], ['Lien HelloAsso HTTPS', 'helloAssoUrl']]; return <form onSubmit={(e) => { e.preventDefault(); save(f); }} className="grid gap-3 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900 md:grid-cols-2"><div className="md:col-span-2"><MediaUploader label="Image structurelle du cours" currentUrl={f.image} onUploaded={(media) => setF({ ...f, image: media.url })} /></div>{fields.map(([label, key]) => <Field key={key} label={label} required={key !== 'helloAssoUrl'} value={String(f[key] ?? '')} onChange={(v) => setF({ ...f, [key]: v })} />)}<Field label="Prix annuel" type="number" value={f.annualPrice ?? 0} onChange={(v) => setF({ ...f, annualPrice: Number(v) })} /><Field label="Ordre" type="number" value={f.order ?? 0} onChange={(v) => setF({ ...f, order: Number(v) })} /><Checks active={f.active !== false} free={f.isFree === true} setActive={(active) => setF({ ...f, active })} setFree={(isFree) => setF({ ...f, isFree, annualPrice: isFree ? 0 : f.annualPrice })} /><Actions cancel={cancel} /></form>; }

const blankEvent = (order: number): DanceEvent => ({ id: crypto.randomUUID(), title: '', type: 'Événement', date: '', time: '', location: '', description: '', price: 0, image: '', externalUrl: '', spotsLeft: 0, totalSpots: 0, active: true, order });
function EventEditor({ items, notify }: { items: DanceEvent[]; notify: (text: string) => void }) { const [draft,setDraft] = useState<DanceEvent | null>(null); return <CollectionLayout title="Événements" onAdd={() => setDraft(blankEvent(items.length))}>{draft && <EventForm value={draft} cancel={() => setDraft(null)} save={(item) => notifySave(async () => { await saveEvent(item); setDraft(null); }, notify)} />}{items.map((item) => <ItemRow key={item.id} title={item.title} detail={`${item.date} · ordre ${item.order ?? 0} · ${item.active === false ? 'brouillon' : 'publié'}`} edit={() => setDraft(item)} remove={() => confirm(`Supprimer « ${item.title} » ?`) && notifySave(() => deleteEvent(item.id), notify)} />)}</CollectionLayout>; }
function EventForm({ value, save, cancel }: { value: DanceEvent; save: (value: DanceEvent) => void; cancel: () => void }) { const [f,setF] = useState(value); return <form onSubmit={(event) => { event.preventDefault(); save(f); }} className="grid gap-3 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900 md:grid-cols-2"><div className="md:col-span-2"><MediaUploader label="Image structurelle de l’événement" currentUrl={f.image} onUploaded={(media) => setF({ ...f, image: media.url })} /></div><Field label="Titre" value={f.title} onChange={(title) => setF({ ...f,title })} /><Field label="Type" value={f.type} onChange={(type) => setF({ ...f,type })} /><Field label="Date" type="date" value={f.date} onChange={(date) => setF({ ...f,date })} /><Field label="Heure" value={f.time} onChange={(time) => setF({ ...f,time })} /><Field label="Lieu" value={f.location} onChange={(location) => setF({ ...f,location })} /><Field label="Description" value={f.description} onChange={(description) => setF({ ...f,description })} /><Field label="Prix" type="number" value={f.price} onChange={(price) => setF({ ...f,price: Number(price) })} /><Field label="Lien externe HTTPS" required={false} type="url" value={f.externalUrl ?? ''} onChange={(externalUrl) => setF({ ...f,externalUrl })} /><Field label="Ordre" type="number" value={f.order ?? 0} onChange={(order) => setF({ ...f,order: Number(order) })} /><label className="flex items-center gap-2"><input type="checkbox" checked={f.active !== false} onChange={(event) => setF({ ...f,active: event.target.checked })} /> Publié</label><Actions cancel={cancel} /></form>; }

function RegistrationEditor({ value, notify }: { value: RegistrationProcess; notify: (text: string) => void }) { const [f, setF] = useState(value); useEffect(() => setF(value), [value]); return <form onSubmit={(e) => { e.preventDefault(); notifySave(() => saveRegistrationProcess(f), notify); }} className="space-y-4 rounded-3xl border p-6"><Field label="Titre" value={f.title} onChange={(title) => setF({ ...f, title })} />{[...f.steps].sort((a,b) => a.order-b.order).map((step, index) => <div key={step.id} className="grid gap-2 md:grid-cols-[1fr_7rem_auto]"><Field label={`Étape ${index + 1}`} value={step.text} onChange={(text) => setF({ ...f, steps: f.steps.map((s) => s.id === step.id ? { ...s, text } : s) })} /><Field label="Ordre" type="number" value={step.order} onChange={(order) => setF({ ...f, steps: f.steps.map((s) => s.id === step.id ? { ...s, order: Number(order) } : s) })} /><button type="button" aria-label={`Supprimer l’étape ${index + 1}`} onClick={() => confirm('Supprimer cette étape ?') && setF({ ...f, steps: f.steps.filter((s) => s.id !== step.id) })} className="self-end p-3 text-rose-600"><Trash2 /></button></div>)}<button type="button" onClick={() => setF({ ...f, steps: [...f.steps, { id: crypto.randomUUID(), text: '', order: f.steps.length }] })} className="flex gap-2 rounded-xl border px-4 py-2"><Plus /> Ajouter une étape</button><Field label="Note finale" value={f.finalNote} onChange={(finalNote) => setF({ ...f, finalNote })} /><label className="flex gap-2"><input type="checkbox" checked={f.visible} onChange={(e) => setF({ ...f, visible: e.target.checked })} /> Section visible</label><SaveButton /></form>; }

function TermsEditor({ value, notify }: { value: MembershipTerms; notify: (text: string) => void }) { const [f, setF] = useState(value); useEffect(() => setF(value), [value]); return <form onSubmit={(e) => { e.preventDefault(); notifySave(() => saveMembershipTerms(f), notify); }} className="space-y-4 rounded-3xl border p-6"><Field label="Titre" value={f.title} onChange={(title) => setF({ ...f, title })} /><Field label="Sous-titre" value={f.subtitle} onChange={(subtitle) => setF({ ...f, subtitle })} /><Field label="Mise à jour" value={f.lastUpdated} onChange={(lastUpdated) => setF({ ...f, lastUpdated })} />{[...f.sections].sort((a,b) => a.order-b.order).map((section) => <div key={section.id} className="space-y-2 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900"><Field label="Titre de l’article" value={section.title} onChange={(title) => setF({ ...f, sections: f.sections.map((s) => s.id === section.id ? { ...s, title } : s) })} /><label className="block text-sm font-semibold">Contenu<textarea className={inputClass} rows={4} value={section.content} onChange={(e) => setF({ ...f, sections: f.sections.map((s) => s.id === section.id ? { ...s, content: e.target.value } : s) })} /></label><Field label="Ordre" type="number" value={section.order} onChange={(order) => setF({ ...f, sections: f.sections.map((s) => s.id === section.id ? { ...s, order: Number(order) } : s) })} /><button type="button" onClick={() => confirm('Supprimer cet article ?') && setF({ ...f, sections: f.sections.filter((s) => s.id !== section.id) })} className="text-rose-600">Supprimer</button></div>)}<button type="button" onClick={() => setF({ ...f, sections: [...f.sections, { id: crypto.randomUUID(), title: '', content: '', order: f.sections.length }] })} className="flex gap-2 rounded-xl border px-4 py-2"><Plus /> Ajouter un article</button><label className="flex gap-2"><input type="checkbox" checked={f.visible} onChange={(e) => setF({ ...f, visible: e.target.checked })} /> Conditions visibles</label><SaveButton /></form>; }

const blankPhoto = (order: number): PhotoItem => ({ id: crypto.randomUUID(), title: '', url: '', description: '', category: 'Association', date: '', active: true, order });
function PhotoEditor({ items, notify }: { items: PhotoItem[]; notify: (text: string) => void }) { const [draft, setDraft] = useState<PhotoItem | null>(null); return <CollectionLayout title="Photos" onAdd={() => setDraft(blankPhoto(items.length))}>{draft && <MediaForm kind="photo" value={draft} save={(v) => notifySave(async () => { await saveGalleryPhoto(v as PhotoItem); setDraft(null); }, notify)} cancel={() => setDraft(null)} />}{items.map((item) => <ItemRow key={item.id} title={item.title} detail={`ordre ${item.order ?? 0} · ${item.active === false ? 'inactive' : 'active'}`} edit={() => setDraft(item)} remove={() => confirm(`Supprimer « ${item.title} » ?`) && notifySave(() => deleteGalleryPhoto(item.id), notify)} />)}</CollectionLayout>; }
const blankVideo = (order: number): VideoItem => ({ id: crypto.randomUUID(), title: '', category: '', youtubeUrl: '', youtubeId: '', description: '', date: '', active: true, order });
function VideoEditor({ items, notify }: { items: VideoItem[]; notify: (text: string) => void }) { const [draft, setDraft] = useState<VideoItem | null>(null); return <CollectionLayout title="Vidéos YouTube" onAdd={() => setDraft(blankVideo(items.length))}>{draft && <MediaForm kind="video" value={draft} save={(v) => notifySave(async () => { await saveVideo(v as VideoItem); setDraft(null); }, notify)} cancel={() => setDraft(null)} />}{items.map((item) => <ItemRow key={item.id} title={item.title} detail={`ordre ${item.order ?? 0} · ${item.active === false ? 'inactive' : 'active'}`} edit={() => setDraft(item)} remove={() => confirm(`Supprimer « ${item.title} » ?`) && notifySave(() => deleteVideo(item.id), notify)} />)}</CollectionLayout>; }
function MediaForm({ kind, value, save, cancel }: { kind: 'photo' | 'video'; value: PhotoItem | VideoItem; save: (value: PhotoItem | VideoItem) => void; cancel: () => void }) {
  const [f, setF] = useState(value);
  const [url, setUrl] = useState(kind === 'video' && 'youtubeId' in value && value.youtubeId ? `https://youtu.be/${value.youtubeId}` : kind === 'photo' && 'url' in value ? value.url : '');
  const [driveLink, setDriveLink] = useState(kind === 'photo' && 'driveFileId' in value && value.driveFileId ? `https://drive.google.com/file/d/${value.driveFileId}/view` : '');
  const [validation, setValidation] = useState('');
  const checkDrive = async () => {
    const fileId = driveLink.match(/\/d\/([A-Za-z0-9_-]{20,100})/)?.[1] || new URLSearchParams(driveLink.split('?')[1] || '').get('id');
    if (!fileId) return setValidation('Lien Drive invalide. Utilisez le lien de partage du fichier.');
    setValidation('Vérification du partage Google Drive…');
    try {
      const response = await fetch(`/api/media/drive?fileId=${encodeURIComponent(fileId)}`);
      const result = await response.json();
      if (!response.ok || !result.public) return setValidation(result.error || 'Rendez le fichier accessible à « Toute personne disposant du lien ».');
      setUrl(result.url); setF({ ...f, driveFileId: fileId } as PhotoItem); setValidation('Image Google Drive publique et prête à être enregistrée.');
    } catch { setValidation('Impossible de vérifier Drive. Vérifiez le partage « Toute personne disposant du lien ».'); }
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (kind === 'video') {
      const id = extractYouTubeId(url);
      if (!id) return setValidation('URL YouTube invalide. Formats watch, youtu.be et shorts acceptés.');
      save({ ...f, youtubeId: id } as VideoItem);
    } else {
      if (!url.startsWith('https://')) return setValidation('Utilisez une URL HTTPS publique ou vérifiez un lien Google Drive.');
      save({ ...f, url } as PhotoItem);
    }
  };
  return <form onSubmit={submit} className="grid gap-3 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900 md:grid-cols-2">
    <Field label="Titre" value={f.title} onChange={(title) => setF({ ...f, title })} />
    <Field label={kind === 'video' ? 'URL YouTube' : 'URL HTTPS publique alternative'} type="url" value={url} onChange={setUrl} />
    {kind === 'photo' && <div className="md:col-span-2"><Field label="Lien partagé Google Drive" required={false} value={driveLink} onChange={setDriveLink} /><button type="button" onClick={() => void checkDrive()} className="mt-2 rounded-xl border px-4 py-2">Vérifier le partage Drive</button></div>}
    <Field label="Description" required={false} value={f.description ?? ''} onChange={(description) => setF({ ...f, description })} />
    <Field label="Date" type="date" required={false} value={f.date ?? ''} onChange={(date) => setF({ ...f, date })} />
    <Field label="Catégorie" required={false} value={f.category ?? ''} onChange={(category) => setF({ ...f, category })} />
    <Field label="Ordre" type="number" value={f.order ?? 0} onChange={(order) => setF({ ...f, order: Number(order) })} />
    <label className="flex items-center gap-2"><input type="checkbox" checked={f.active !== false} onChange={(event) => setF({ ...f, active: event.target.checked })} /> Publié</label>
    {validation && <p role="status" className="text-rose-600 md:col-span-2">{validation}</p>}<Actions cancel={cancel} />
  </form>;
}

function CollectionLayout({ title, onAdd, children }: { title: string; onAdd: () => void; children: ReactNode }) { return <div className="space-y-3 rounded-3xl border p-6"><div className="flex justify-between"><h2 className="text-xl font-black">{title}</h2><button onClick={onAdd} className="flex gap-2 rounded-xl bg-rose-600 px-4 py-2 font-bold text-white"><Plus /> Ajouter</button></div>{children}</div>; }
function ItemRow({ title, detail, edit, remove }: { key?: string; title: string; detail: string; edit: () => void; remove: () => void }) { return <div className="flex flex-wrap items-center gap-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900"><div className="min-w-0 flex-1"><p className="truncate font-bold">{title}</p><p className="text-xs text-zinc-500">{detail}</p></div><button onClick={edit} className="rounded-lg border px-3 py-2">Modifier</button><button aria-label={`Supprimer ${title}`} onClick={remove} className="p-2 text-rose-600"><Trash2 /></button></div>; }
function Checks({ active, free, setActive, setFree }: { active: boolean; free: boolean; setActive: (v: boolean) => void; setFree: (v: boolean) => void }) { return <div className="flex gap-5"><label className="flex gap-2"><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Actif</label><label className="flex gap-2"><input type="checkbox" checked={free} onChange={(e) => setFree(e.target.checked)} /> Gratuit</label></div>; }
function Actions({ cancel }: { cancel: () => void }) { return <div className="flex gap-2 md:col-span-2"><SaveButton /><button type="button" onClick={cancel} className="rounded-xl border px-4">Annuler</button></div>; }
