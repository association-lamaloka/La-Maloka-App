import { FormEvent, ReactNode, SetStateAction, useEffect, useMemo, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { Archive, Download, LogIn, LogOut, Plus, Save, ShieldCheck } from 'lucide-react';
import { auth, authPersistenceReady } from '../firebase';
import { DanceClass, DanceEvent, FooterContent, HomePageContent, MembershipTerms, NavigationItem, PhotoItem, RegistrationProcess, SiteSettings, VideoItem } from '../types';
import { archiveCourse, archiveEvent, archiveGalleryPhoto, archiveVideo, saveHomepageCards, saveCourse, saveEvent, saveFooter, saveGalleryPhoto, saveHomePage, saveMembershipTerms, saveNavigation, saveRegistrationProcess, saveSiteSettingsToCloud, saveVideo } from '../services/firestoreService';
import { MediaUploader } from './MediaUploader';
import { RecoveryPanel } from './RecoveryPanel';
import { StructuralImage } from './StructuralImage';
import { YouTubePreview } from './YouTubePreview';
import { extractYouTubeId } from '../services/youtube';
import { extractGoogleDriveFileId, resolvePhotoSource } from '../services/mediaUrl';

type Tab = 'home' | 'navigation' | 'courses' | 'agenda' | 'media' | 'conditions' | 'footer' | 'configuration';
interface Props { settings: SiteSettings; homePage: HomePageContent; footerContent: FooterContent; navigation: NavigationItem[]; courses: DanceClass[]; events: DanceEvent[]; photos: PhotoItem[]; videos: VideoItem[]; registration: RegistrationProcess; terms: MembershipTerms; user: User | null; authLoading: boolean; authError: string; contentError: string; onAuthorized: (user: User) => void }
const inputClass = 'mt-1 w-full rounded-xl border border-zinc-300 bg-transparent p-2 dark:border-zinc-700';

const authErrorMessage = (caught: unknown) => {
  const code = caught instanceof FirebaseError ? caught.code : 'auth/unknown-error';
  if (code === 'auth/popup-blocked') return 'Le navigateur a bloqué la fenêtre Google. Autorisez les fenêtres émergentes pour cette Preview puis réessayez. Code Firebase : auth/popup-blocked.';
  if (code === 'auth/popup-closed-by-user') return 'La connexion Google a été annulée. Code Firebase : auth/popup-closed-by-user.';
  return `La connexion sécurisée avec Google a échoué. Veuillez réessayer ou contacter la personne responsable du site. Code Firebase : ${code}.`;
};

export function SimpleAdmin({ settings, homePage, footerContent, navigation, courses, events, photos, videos, registration, terms, user, authLoading, authError, contentError, onAuthorized }: Props) {
  const [authenticating, setAuthenticating] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('home');
  const [message, setMessage] = useState('');

  const downloadBackup = () => {
    const documents = {
      'site_settings/global': settings,
      'pages/home': homePage,
      'pages/footer': footerContent,
      'navigation/main': { items: navigation },
      'registration_process/global': registration,
      'membership_terms/global': terms,
      ...Object.fromEntries(courses.map((item) => [`courses/${item.id}`, item])),
      ...Object.fromEntries(events.map((item) => [`events/${item.id}`, item])),
      ...Object.fromEntries(photos.map((item) => [`gallery/${item.id}`, item])),
      ...Object.fromEntries(videos.map((item) => [`videos/${item.id}`, item])),
    };
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), documents }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `la-maloka-sauvegarde-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  };

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

  if (authenticating) return <Status text="Connexion sécurisée avec Google…" />;
  if (authLoading) return <Status text="Vérification de la connexion sécurisée…" />;
  if (!user) return <section className="mx-auto flex min-h-[65vh] max-w-md items-center px-4 py-16"><div className="w-full space-y-5 rounded-3xl border bg-white p-8 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"><ShieldCheck className="text-emerald-500" size={36} /><h1 className="text-2xl font-black">Accès équipe</h1><p className="text-sm text-zinc-500">Connexion sécurisée avec Google. Sélectionnez le compte officiel de l’association.</p>{(error || authError) && <p role="alert" className="rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">{error || authError}</p>}<button type="button" onClick={login} className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 p-3 font-bold text-white dark:bg-white dark:text-zinc-900"><LogIn size={17} /> Se connecter avec Google</button></div></section>;

  const tabs: Array<[Tab, string]> = [['home', 'Accueil'], ['navigation', 'Navigation'], ['courses', 'Cours'], ['agenda', 'Agenda'], ['media', 'Photos & Vidéos'], ['conditions', 'Conditions & inscription'], ['footer', 'Footer'], ['configuration', 'Configuration']];
  return <section className="mx-auto max-w-7xl space-y-6 px-4 py-10">
    <header className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm text-emerald-600">Connecté : {user.email}</p><h1 className="text-3xl font-black">ÉQUIPE — Administration</h1></div><div className="flex flex-wrap gap-2"><button type="button" onClick={downloadBackup} disabled={Boolean(contentError)} className="flex items-center gap-2 rounded-xl border px-4 py-2 disabled:opacity-50"><Download size={16} /> Télécharger une sauvegarde JSON</button><button onClick={() => signOut(auth)} className="flex items-center gap-2 rounded-xl border px-4 py-2"><LogOut size={16} /> Déconnexion</button></div></header>
    {message && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm dark:bg-emerald-950/30">{message}</p>}
    <nav aria-label="Sections du backoffice" className="flex gap-2 overflow-x-auto pb-2">{tabs.map(([id, label]) => <button key={id} onClick={() => setTab(id)} className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold ${tab === id ? 'bg-rose-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800'}`}>{label}</button>)}</nav>
    <fieldset disabled={Boolean(contentError)} className="space-y-6">
    {contentError && <p role="alert">Enregistrement suspendu : le contenu n’a pas pu être chargé. Rechargez la page après avoir rétabli la connexion.</p>}
    {tab === 'home' && <div className="space-y-6"><HomeEditor value={homePage} notify={setMessage} /><HomepageCardsEditor value={settings} notify={setMessage} /></div>}
    {tab === 'navigation' && <NavigationEditor value={navigation} notify={setMessage} />}
    {tab === 'courses' && <CourseEditor items={courses} notify={setMessage} />}
    {tab === 'agenda' && <EventEditor items={events} notify={setMessage} />}
    {tab === 'media' && <div className="grid gap-6 lg:grid-cols-2"><PhotoEditor items={photos} notify={setMessage} /><VideoEditor items={videos} notify={setMessage} /></div>}
    {tab === 'conditions' && <div className="space-y-6"><RegistrationEditor value={registration} notify={setMessage} /><TermsEditor value={terms} notify={setMessage} /></div>}
    {tab === 'footer' && <FooterEditor value={footerContent} notify={setMessage} />}
    {tab === 'configuration' && <ConfigurationEditor value={settings} notify={setMessage} />}
    </fieldset>
  </section>;
}

function Status({ text }: { text: string }) { return <p role="status" className="mx-auto min-h-[60vh] max-w-xl p-16 text-center">{text}</p>; }
function Field({ label, value, onChange, type = 'text', required = true }: { key?: string; label: string; value: string | number; onChange: (value: string) => void; type?: string; required?: boolean }) { return <label className="text-sm font-semibold">{label}<input className={inputClass} type={type} required={required} value={value} onChange={(event) => onChange(event.target.value)} /></label>; }
function SaveButton({ label = 'Enregistrer' }: { label?: string }) { return <button className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 p-3 font-bold text-white"><Save size={17} /> {label}</button>; }
let saveInProgress = false;
const notifySave = async (action: () => Promise<unknown>, notify: (text: string) => void) => {
  if (saveInProgress) {
    notify('Un enregistrement est déjà en cours. Attendez sa confirmation avant de recommencer.');
    return false;
  }
  saveInProgress = true;
  notify('Enregistrement…');
  try {
    await action();
    notify('Enregistrement réussi. Les données existantes ont été conservées.');
    return true;
  } catch (caught) {
    const code = caught instanceof FirebaseError ? caught.code : 'erreur-inconnue';
    notify(`Échec de l’enregistrement (${code}). Vos modifications restent dans le formulaire.`);
    return false;
  } finally {
    saveInProgress = false;
  }
};

function readProtectedDraft<T>(storageKey: string) {
  for (const storage of [typeof localStorage === 'undefined' ? null : localStorage, typeof sessionStorage === 'undefined' ? null : sessionStorage]) {
    try {
      const raw = storage?.getItem(storageKey);
      if (raw) return JSON.parse(raw) as T;
    } catch { /* Storage can be disabled or contain an obsolete draft. */ }
  }
  return undefined;
}

function storeProtectedDraft<T>(storageKey: string, value: T) {
  const serialized = JSON.stringify(value);
  try {
    localStorage.setItem(storageKey, serialized);
    return;
  } catch { /* Fall back to the current browser tab. */ }
  try { sessionStorage.setItem(storageKey, serialized); } catch { /* Storage can be disabled. */ }
}

function removeProtectedDraft(storageKey: string) {
  try { localStorage.removeItem(storageKey); } catch { /* Storage can be disabled. */ }
  try { sessionStorage.removeItem(storageKey); } catch { /* Storage can be disabled. */ }
}

function useProtectedDraft<T>(value: T, storageKey: string) {
  const initialDraft = readProtectedDraft<T>(storageKey);
  const [form, setFormState] = useState<T>(initialDraft ?? value);
  const [dirty, setDirty] = useState(initialDraft !== undefined);
  useEffect(() => {
    if (!dirty) setFormState(value);
  }, [value]);
  const setForm = (next: SetStateAction<T>) => {
    setDirty(true);
    setFormState((current) => {
      const resolved = typeof next === 'function' ? (next as (previous: T) => T)(current) : next;
      storeProtectedDraft(storageKey, resolved);
      return resolved;
    });
  };
  const markSaved = () => {
    setDirty(false);
    removeProtectedDraft(storageKey);
  };
  const reset = () => {
    setFormState(value);
    markSaved();
  };
  return { form, setForm, dirty, markSaved, reset };
}

function HomeEditor({ value, notify }: { value: HomePageContent; notify: (text: string) => void }) {
  const { form, setForm, dirty, markSaved, reset } = useProtectedDraft(value, 'maloka-draft-home');
  const textFields: Array<[string,keyof HomePageContent]> = [['Étiquette supérieure','eyebrow'],['Titre principal','headline'],['Titre mis en avant','highlight'],['Description','description'],['Titre carte superposée','overlayTitle'],['Texte carte superposée','overlayText'],['Texte banner supérieur','bannerText'],['Texte bouton banner','bannerButtonText'],['Texte bouton principal','primaryButtonText'],['Texte deuxième bouton','secondaryButtonText'],['Badge lieu 1','locationBadgeOne'],['Badge lieu 2','locationBadgeTwo']];
  const destination = (label: string, key: 'bannerButtonDestination'|'primaryButtonDestination'|'secondaryButtonDestination') => <label className="text-sm font-semibold">{label}<select className={inputClass} value={form[key]} onChange={(event) => setForm({ ...form,[key]: event.target.value as 'cours'|'agenda' })}><option value="cours">Cours</option><option value="agenda">Agenda</option></select></label>;
  return <form onSubmit={async (event) => { event.preventDefault(); if (await notifySave(() => saveHomePage(form),notify)) markSaved(); }} className="grid gap-4 rounded-3xl border p-6 md:grid-cols-2"><p className="md:col-span-2 text-sm text-zinc-500">La saison générale se modifie dans Configuration. {dirty && 'Brouillon protégé dans ce navigateur.'}</p>{textFields.map(([label,key]) => <Field key={key} label={label} required={false} value={String(form[key] ?? '')} onChange={(text) => setForm({ ...form,[key]: text })} />)}{([['Image principale','heroImageUrl'],['Logotype','logoUrl'],['Image de la carte superposée','overlayImageUrl']] as const).map(([label,key]) => <div key={key} className="space-y-3"><MediaUploader label={label} currentUrl={form[key]} onUploaded={({url}) => setForm((current) => ({...current,[key]:url}))} /><Field label={`URL HTTPS — ${label}`} required={false} type="url" value={form[key]} onChange={(url) => setForm({...form,[key]:url})} /></div>)}{destination('Destination bouton banner','bannerButtonDestination')}{destination('Destination bouton principal','primaryButtonDestination')}{destination('Destination deuxième bouton','secondaryButtonDestination')}<div className="space-y-3 md:col-span-2"><h2 className="font-black">Sections inférieures</h2>{[...form.sections].sort((a,b) => a.order-b.order).map((section) => <div key={section.id} className="grid gap-2 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900 md:grid-cols-2"><Field label="Titre" value={section.title} onChange={(title) => setForm({ ...form,sections: form.sections.map((item) => item.id === section.id ? {...item,title}:item) })} /><Field label="Sous-titre" value={section.subtitle} onChange={(subtitle) => setForm({ ...form,sections: form.sections.map((item) => item.id === section.id ? {...item,subtitle}:item) })} /><Field label="Ordre" type="number" value={section.order} onChange={(order) => setForm({ ...form,sections: form.sections.map((item) => item.id === section.id ? {...item,order:Number(order)}:item) })} /><label className="flex items-center gap-2"><input type="checkbox" checked={section.visible} onChange={(event) => setForm({ ...form,sections: form.sections.map((item) => item.id === section.id ? {...item,visible:event.target.checked}:item) })} /> Visible</label><button type="button" onClick={() => setForm({ ...form,sections: form.sections.map((item) => item.id === section.id ? {...item,visible:!item.visible}:item) })} className="text-left text-amber-700">{section.visible ? 'Archiver' : 'Restaurer'}</button></div>)}<button type="button" onClick={() => setForm({ ...form,sections:[...form.sections,{ id:crypto.randomUUID(),title:'',subtitle:'',order:form.sections.length,visible:true }] })} className="rounded-xl border px-4 py-2">Ajouter une section</button></div><label className="flex gap-2 md:col-span-2"><input type="checkbox" checked={form.published} onChange={(event) => setForm({...form,published:event.target.checked})} /> Accueil publié</label><div className="flex gap-2 md:col-span-2"><SaveButton /><button type="reset" onClick={reset} className="rounded-xl border px-4">Annuler / restaurer</button></div></form>;
}

function FooterEditor({ value, notify }: { value: FooterContent; notify: (text: string) => void }) {
  const { form, setForm, dirty, markSaved, reset } = useProtectedDraft(value, 'maloka-draft-footer');
  return <form onSubmit={async (event) => { event.preventDefault(); if (await notifySave(() => saveFooter(form),notify)) markSaved(); }} className="grid gap-4 rounded-3xl border p-6 md:grid-cols-2"><p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/30 dark:text-amber-200 md:col-span-2">Le courriel, le téléphone et les réseaux sociaux sont gérés dans Configuration. Leurs anciennes valeurs restent conservées dans Firebase. {dirty && 'Brouillon protégé dans ce navigateur.'}</p><Field label="Texte descriptif" value={form.description} onChange={(description) => setForm({...form,description})} /><Field label="Adresse" value={form.address} onChange={(address) => setForm({...form,address})} /><Field label="Mentions légales" value={form.legalNotice} onChange={(legalNotice) => setForm({...form,legalNotice})} /><Field label="Copyright" value={form.copyright} onChange={(copyright) => setForm({...form,copyright})} /><div className="space-y-3 md:col-span-2"><h2 className="font-black">Liens du footer</h2>{form.links.map((link) => <div key={link.id} className="grid gap-2 md:grid-cols-4"><Field label="Texte" value={link.label} onChange={(label) => setForm({...form,links:form.links.map((item) => item.id === link.id ? {...item,label}:item)})} /><label className="text-sm font-semibold">Destination<select className={inputClass} value={link.destination} onChange={(event) => setForm({...form,links:form.links.map((item) => item.id === link.id ? {...item,destination:event.target.value as FooterContent['links'][number]['destination']}:item)})}><option value="cours">Cours</option><option value="agenda">Agenda</option><option value="galerie">Photos & Vidéos</option><option value="conditions">Conditions</option></select></label><Field label="Ordre" type="number" value={link.order} onChange={(order) => setForm({...form,links:form.links.map((item) => item.id === link.id ? {...item,order:Number(order)}:item)})} /><label className="flex gap-2"><input type="checkbox" checked={link.visible} onChange={(event) => setForm({...form,links:form.links.map((item) => item.id === link.id ? {...item,visible:event.target.checked}:item)})} /> Visible</label></div>)}</div><div className="space-y-3 md:col-span-2"><h2 className="font-black">Ordre et visibilité des blocs</h2>{form.blocks.map((block) => <div key={block.id} className="grid gap-2 md:grid-cols-3"><Field label="Bloc" value={block.label} onChange={(label) => setForm({...form,blocks:form.blocks.map((item) => item.id === block.id ? {...item,label}:item)})} /><Field label="Ordre" type="number" value={block.order} onChange={(order) => setForm({...form,blocks:form.blocks.map((item) => item.id === block.id ? {...item,order:Number(order)}:item)})} /><label className="flex gap-2"><input type="checkbox" checked={block.visible} onChange={(event) => setForm({...form,blocks:form.blocks.map((item) => item.id === block.id ? {...item,visible:event.target.checked}:item)})} /> Visible</label></div>)}</div><label className="flex gap-2 md:col-span-2"><input type="checkbox" checked={form.published} onChange={(event) => setForm({...form,published:event.target.checked})} /> Footer publié</label><div className="flex gap-2 md:col-span-2"><SaveButton /><button type="reset" onClick={reset} className="rounded-xl border px-4">Annuler / restaurer</button></div></form>;
}

function ConfigurationEditor({ value, notify }: { value: SiteSettings; notify: (text: string) => void }) {
  const { form, setForm, dirty, markSaved } = useProtectedDraft(value, 'maloka-draft-configuration');
  const fields = [
    ['associationName','Nom de l’association','text'],['tagline','Sous-titre','text'],['season','Saison','text'],
    ['contactEmail','Courriel','email'],['contactPhone','Téléphone','text'],['contactWhatsApp','WhatsApp','text'],
    ['contactPerson','Personne de contact','text'],['contactHours','Disponibilités','text'],['postalAddress','Adresse postale','text'],
    ['locationFontenay','Adresse Fontenay','text'],['locationLaQueue','Adresse La Queue','text'],
    ['facebookUrl','Facebook HTTPS','url'],['instagramUrl','Instagram HTTPS','url'],['youtubeUrl','YouTube HTTPS','url'],
    ['coursesPageTitle','Titre page Cours','text'],['coursesPageSubtitle','Sous-titre page Cours','text'],
    ['agendaPageTitle','Titre page Agenda','text'],['agendaPageSubtitle','Sous-titre page Agenda','text'],
    ['galleryPageTitle','Titre page Photos & Vidéos','text'],['galleryPageSubtitle','Sous-titre page Photos & Vidéos','text'],
  ] as const;
  return <div className="space-y-5"><form onSubmit={async event => { event.preventDefault(); if (await notifySave(() => saveSiteSettingsToCloud(form),notify)) markSaved(); }} className="grid gap-4 rounded-3xl border p-6 md:grid-cols-2">
    <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200 md:col-span-2">Source générale du site : identité, contact, réseaux, saison et titres de pages. {dirty && 'Brouillon protégé dans ce navigateur.'}</p>
    {fields.map(([key,label,type]) => <Field key={key} label={label} type={type} required={false} value={form[key] ?? ''} onChange={text => setForm({...form,[key]:text})} />)}
    <MediaUploader label="Logotype général" currentUrl={form.logoUrl} onUploaded={({url}) => setForm(current => ({...current,logoUrl:url}))} />
    <div className="md:col-span-2"><SaveButton /></div>
  </form><RecoveryPanel /></div>;
}

function HomepageCardsEditor({ value, notify }: { value: SiteSettings; notify: (text: string) => void }) {
  const { form: cards, setForm: setCards, markSaved: markCardsSaved } = useProtectedDraft(value.vignettes, 'maloka-draft-home-cards');
  const { form: info, setForm: setInfo, markSaved: markInfoSaved } = useProtectedDraft(value.registrationInfo, 'maloka-draft-registration-info');
  const update = (id: string, patch: Partial<SiteSettings['vignettes'][number]>) => setCards(current => current.map(card => card.id === id ? {...card,...patch} : card));
  return <form className="space-y-5 rounded-3xl border p-6" onSubmit={async event => { event.preventDefault(); if (await notifySave(() => saveHomepageCards(cards,info),notify)) { markCardsSaved(); markInfoSaved(); } }}>
    <h2 className="text-xl font-black">Images et textes des cartes Salsa / Cardio Latino</h2>
    {!cards.length && <p>Les anciennes cartes peuvent être retrouvées dans Configuration → Retrouver le contenu précédent.</p>}
    {cards.map(card => <div key={card.id} className="grid gap-3 rounded-2xl border p-4 md:grid-cols-2">
      <MediaUploader label={`Image — ${card.title || 'Carte de la page d’accueil'}`} currentUrl={card.image} onUploaded={({url}) => update(card.id,{image:url})} />
      <Field label="URL HTTPS de l’image" required={false} type="url" value={card.image} onChange={image => update(card.id,{image})} />
      {(['title','subtitle','badge','description','scheduleSummary','locationSummary'] as const).map(key => <Field key={key} label={({title:'Titre',subtitle:'Sous-titre',badge:'Étiquette',description:'Description',scheduleSummary:'Horaires',locationSummary:'Lieu'} as const)[key]} required={false} value={card[key]} onChange={text => update(card.id,{[key]:text})} />)}
      <label className="md:col-span-2">Points clés (un par ligne)<textarea className={inputClass} value={card.keyPoints.join('\n')} onChange={event => update(card.id,{keyPoints:event.target.value.split('\n')})} /></label>
      <label><input type="checkbox" checked={card.active} onChange={event => update(card.id,{active:event.target.checked})} /> Carte visible</label>
      <button type="button" onClick={() => update(card.id,{active:!card.active})}>{card.active ? 'Archiver cette carte' : 'Restaurer cette carte'}</button>
    </div>)}
    <button type="button" className="rounded-xl border p-3" onClick={() => setCards(current => [...current,{id:crypto.randomUUID(),title:'',subtitle:'',badge:'',description:'',image:'',accentColor:'orange',scheduleSummary:'',locationSummary:'',keyPoints:[],active:false}])}>Ajouter une carte</button>
    <h2 className="text-xl font-black">Dates et informations de la page d’accueil</h2>
    <Field label="Titre de saison" required={false} value={info.seasonTitle} onChange={seasonTitle => setInfo({...info,seasonTitle})} />
    {info.importantDates.map((entry,index) => <div key={index} className="grid gap-3 md:grid-cols-3">{(['date','label','location'] as const).map(key => <Field key={key} label={({date:'Date',label:'Événement',location:'Lieu'} as const)[key]} required={false} value={entry[key]} onChange={text => setInfo({...info,importantDates:info.importantDates.map((item,i) => i === index ? {...item,[key]:text} : item)})} />)}<button type="button" onClick={() => setInfo({...info,importantDates:info.importantDates.map((item,i) => i === index ? {...item,active:item.active === false}:item)})}>{entry.active === false ? 'Restaurer cette date' : 'Archiver cette date'}</button></div>)}
    <button type="button" className="rounded-xl border p-3" onClick={() => setInfo({...info,importantDates:[...info.importantDates,{date:'',label:'',location:'',active:true}]})}>Ajouter une date</button>
    <SaveButton label="Enregistrer les cartes et les dates" />
  </form>;
}


function NavigationEditor({ value, notify }: { value: NavigationItem[]; notify: (text: string) => void }) {
  const { form: items, setForm: setItems, markSaved, reset } = useProtectedDraft(value, 'maloka-draft-navigation');
  const move = (index: number, offset: number) => { const ordered = [...items].sort((a,b) => a.order-b.order); const target = index + offset; if (target < 0 || target >= ordered.length) return; [ordered[index], ordered[target]] = [ordered[target], ordered[index]]; setItems(ordered.map((item, order) => ({ ...item, order }))); };
  return <form onSubmit={async (event) => { event.preventDefault(); if (await notifySave(() => saveNavigation(items), notify)) markSaved(); }} className="space-y-3 rounded-3xl border p-6"><p className="text-sm text-zinc-500">Les destinations sont limitées aux pages internes sûres.</p>{[...items].sort((a,b) => a.order-b.order).map((item,index) => <div key={item.id} className="grid gap-2 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900 md:grid-cols-[1fr_12rem_auto_auto]"><Field label="Texte" value={item.label} onChange={(label) => setItems(items.map((entry) => entry.id === item.id ? { ...entry, label } : entry))} /><label className="text-sm font-semibold">Destination<select className={inputClass} value={item.destination} onChange={(event) => setItems(items.map((entry) => entry.id === item.id ? { ...entry, destination: event.target.value as NavigationItem['destination'] } : entry))}><option value="accueil">Accueil</option><option value="cours">Cours</option><option value="agenda">Agenda</option><option value="galerie">Photos & Vidéos</option></select></label><label className="flex items-center gap-2"><input type="checkbox" checked={item.active} onChange={(event) => setItems(items.map((entry) => entry.id === item.id ? { ...entry, active: event.target.checked } : entry))} /> Publié</label><div className="flex items-end gap-1"><button type="button" aria-label={`Monter ${item.label}`} onClick={() => move(index,-1)} className="rounded-lg border p-2">↑</button><button type="button" aria-label={`Descendre ${item.label}`} onClick={() => move(index,1)} className="rounded-lg border p-2">↓</button></div></div>)}<div className="flex gap-2"><SaveButton /><button type="button" onClick={reset} className="rounded-xl border px-4">Restaurer / annuler</button></div></form>;
}

const blankCourse = (): DanceClass => ({ id: crypto.randomUUID(), name: '', description: '', category: '', level: '', instructor: '', schedule: '', location: '', image: '', season: '', priceMonthly: 0, annualPrice: 0, isFree: false, helloAssoUrl: '', registrationButtonText: 'S’inscrire', active: true, order: 0 });
function CourseEditor({ items, notify }: { items: DanceClass[]; notify: (text: string) => void }) {
  const [draft, setDraft] = useState<DanceClass | null>(() => readProtectedDraft<DanceClass>('maloka-draft-course') ?? null);
  const open = (item: DanceClass) => draft && draft.id !== item.id ? notify('Terminez ou annulez le brouillon de cours déjà ouvert avant d’en ouvrir un autre.') : setDraft(item);
  return <CollectionLayout title="Cours" onAdd={() => open({ ...blankCourse(), order: items.length })}>{draft && <CourseForm key={draft.id} value={draft} close={() => setDraft(null)} save={(item) => notifySave(() => saveCourse(item), notify)} />}{items.map((item) => <ItemRow key={item.id} title={item.name} detail={`${item.annualPrice ?? 0} € · ordre ${item.order ?? 0} · ${item.active === false ? 'archivé' : 'actif'}`} edit={() => open(item)} archive={() => confirm(`Archiver le cours « ${item.name} » ? Il restera restaurable.`) && notifySave(() => archiveCourse(item.id), notify)} />)}</CollectionLayout>;
}
function CourseForm({ value, save, close }: { key?: string; value: DanceClass; save: (value: DanceClass) => Promise<boolean>; close: () => void }) {
  const { form: f, setForm: setF, dirty, markSaved, reset } = useProtectedDraft(value, 'maloka-draft-course');
  const fields: Array<[string, keyof DanceClass]> = [['Nom', 'name'], ['Description', 'description'], ['Discipline / catégorie', 'category'], ['Niveau', 'level'], ['Professeur', 'instructor'], ['Horaire', 'schedule'], ['Lieu', 'location'], ['Saison', 'season'], ['Lien HelloAsso HTTPS', 'helloAssoUrl'], ['Texte bouton inscription', 'registrationButtonText']];
  return <form onSubmit={async (e) => { e.preventDefault(); if (await save(f)) { markSaved(); close(); } }} className="grid gap-3 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900 md:grid-cols-2"><p className="md:col-span-2 text-sm text-zinc-500">{dirty && 'Brouillon protégé dans ce navigateur.'}</p><div className="space-y-3"><MediaUploader label="Image du cours" currentUrl={f.image} onUploaded={({url}) => setF((current) => ({...current,image:url}))} /><Field label="URL HTTPS image du cours" required={false} type="url" value={f.image} onChange={(image) => setF({ ...f,image })} /></div>{fields.map(([label, key]) => <Field key={key} label={label} required={key !== 'helloAssoUrl'} value={String(f[key] ?? '')} onChange={(v) => setF({ ...f, [key]: v })} />)}<Field label="Prix annuel" type="number" value={f.annualPrice ?? 0} onChange={(v) => setF({ ...f, annualPrice: Number(v) })} /><Field label="Ordre" type="number" value={f.order ?? 0} onChange={(v) => setF({ ...f, order: Number(v) })} /><Checks active={f.active !== false} free={f.isFree === true} setActive={(active) => setF({ ...f, active })} setFree={(isFree) => setF({ ...f, isFree, annualPrice: isFree ? 0 : f.annualPrice })} /><Actions cancel={() => { reset(); close(); }} /></form>;
}

const blankEvent = (order: number): DanceEvent => ({ id: crypto.randomUUID(), title: '', type: 'Événement', date: '', time: '', location: '', description: '', price: 0, image: '', externalUrl: '', spotsLeft: 0, totalSpots: 0, active: true, order });
function EventEditor({ items, notify }: { items: DanceEvent[]; notify: (text: string) => void }) {
  const [draft,setDraft] = useState<DanceEvent | null>(() => readProtectedDraft<DanceEvent>('maloka-draft-event') ?? null);
  const open = (item: DanceEvent) => draft && draft.id !== item.id ? notify('Terminez ou annulez le brouillon d’événement déjà ouvert avant d’en ouvrir un autre.') : setDraft(item);
  return <CollectionLayout title="Événements" onAdd={() => open(blankEvent(items.length))}>{draft && <EventForm key={draft.id} value={draft} close={() => setDraft(null)} save={(item) => notifySave(() => saveEvent(item), notify)} />}{items.map((item) => <ItemRow key={item.id} title={item.title} detail={`${item.date} · ordre ${item.order ?? 0} · ${item.active === false ? 'archivé' : 'publié'}`} edit={() => open(item)} archive={() => confirm(`Archiver « ${item.title} » ? Il restera restaurable.`) && notifySave(() => archiveEvent(item.id), notify)} />)}</CollectionLayout>;
}
function EventForm({ value, save, close }: { key?: string; value: DanceEvent; save: (value: DanceEvent) => Promise<boolean>; close: () => void }) {
  const { form: f, setForm: setF, dirty, markSaved, reset } = useProtectedDraft(value, 'maloka-draft-event');
  return <form onSubmit={async (event) => { event.preventDefault(); if (await save(f)) { markSaved(); close(); } }} className="grid gap-3 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900 md:grid-cols-2"><p className="md:col-span-2 text-sm text-zinc-500">{dirty && 'Brouillon protégé dans ce navigateur.'}</p><div className="space-y-3"><MediaUploader label="Image de l’événement" currentUrl={f.image} onUploaded={({url}) => setF((current) => ({...current,image:url}))} /><Field label="URL HTTPS image de l’événement" required={false} type="url" value={f.image} onChange={(image) => setF({ ...f,image })} /></div><Field label="Titre" value={f.title} onChange={(title) => setF({ ...f,title })} /><Field label="Type" value={f.type} onChange={(type) => setF({ ...f,type })} /><Field label="Date" type="date" value={f.date} onChange={(date) => setF({ ...f,date })} /><Field label="Heure" value={f.time} onChange={(time) => setF({ ...f,time })} /><Field label="Lieu" value={f.location} onChange={(location) => setF({ ...f,location })} /><Field label="Description" value={f.description} onChange={(description) => setF({ ...f,description })} /><Field label="Prix" type="number" value={f.price} onChange={(price) => setF({ ...f,price: Number(price) })} /><Field label="Lien externe HTTPS" required={false} type="url" value={f.externalUrl ?? ''} onChange={(externalUrl) => setF({ ...f,externalUrl })} /><Field label="Ordre" type="number" value={f.order ?? 0} onChange={(order) => setF({ ...f,order: Number(order) })} /><label className="flex items-center gap-2"><input type="checkbox" checked={f.active !== false} onChange={(event) => setF({ ...f,active: event.target.checked })} /> Publié</label><Actions cancel={() => { reset(); close(); }} /></form>;
}

function RegistrationEditor({ value, notify }: { value: RegistrationProcess; notify: (text: string) => void }) { const { form: f, setForm: setF, markSaved } = useProtectedDraft(value, 'maloka-draft-registration'); return <form onSubmit={async (e) => { e.preventDefault(); if (await notifySave(() => saveRegistrationProcess(f), notify)) markSaved(); }} className="space-y-4 rounded-3xl border p-6"><Field label="Titre" value={f.title} onChange={(title) => setF({ ...f, title })} />{[...f.steps].sort((a,b) => a.order-b.order).map((step, index) => <div key={step.id} className="grid gap-2 md:grid-cols-[1fr_7rem_auto]"><Field label={`Étape ${index + 1}`} value={step.text} onChange={(text) => setF({ ...f, steps: f.steps.map((s) => s.id === step.id ? { ...s, text } : s) })} /><Field label="Ordre" type="number" value={step.order} onChange={(order) => setF({ ...f, steps: f.steps.map((s) => s.id === step.id ? { ...s, order: Number(order) } : s) })} /><button type="button" onClick={() => setF({ ...f, steps: f.steps.map((s) => s.id === step.id ? { ...s, visible: s.visible === false } : s) })} className="self-end p-3 text-amber-700">{step.visible === false ? 'Restaurer' : 'Archiver'}</button></div>)}<button type="button" onClick={() => setF({ ...f, steps: [...f.steps, { id: crypto.randomUUID(), text: '', order: f.steps.length, visible: true }] })} className="flex gap-2 rounded-xl border px-4 py-2"><Plus /> Ajouter une étape</button><Field label="Note finale" value={f.finalNote} onChange={(finalNote) => setF({ ...f, finalNote })} /><label className="flex gap-2"><input type="checkbox" checked={f.visible} onChange={(e) => setF({ ...f, visible: e.target.checked })} /> Section visible</label><SaveButton /></form>; }

function TermsEditor({ value, notify }: { value: MembershipTerms; notify: (text: string) => void }) {
  const { form: f, setForm: setF, markSaved } = useProtectedDraft(value, 'maloka-draft-terms');
  return <form onSubmit={async (event) => { event.preventDefault(); if (await notifySave(() => saveMembershipTerms(f), notify)) markSaved(); }} className="space-y-4 rounded-3xl border p-6">
    <Field label="Titre" value={f.title} onChange={(title) => setF({ ...f, title })} />
    <Field label="Sous-titre" value={f.subtitle} onChange={(subtitle) => setF({ ...f, subtitle })} />
    <Field label="Mise à jour" value={f.lastUpdated} onChange={(lastUpdated) => setF({ ...f, lastUpdated })} />
    {[...f.sections].sort((a,b) => a.order-b.order).map((section) => <div key={section.id} className="space-y-2 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900">
      <Field label="Titre de l’article" value={section.title} onChange={(title) => setF({ ...f, sections: f.sections.map((item) => item.id === section.id ? { ...item, title } : item) })} />
      <label className="block text-sm font-semibold">Contenu<textarea className={inputClass} rows={4} value={section.content} onChange={(event) => setF({ ...f, sections: f.sections.map((item) => item.id === section.id ? { ...item, content: event.target.value } : item) })} /></label>
      <Field label="Ordre" type="number" value={section.order} onChange={(order) => setF({ ...f, sections: f.sections.map((item) => item.id === section.id ? { ...item, order: Number(order) } : item) })} />
      <button type="button" onClick={() => setF({ ...f, sections: f.sections.map((item) => item.id === section.id ? { ...item, visible: item.visible === false } : item) })} className="text-amber-700">{section.visible === false ? 'Restaurer' : 'Archiver'}</button>
    </div>)}
    <button type="button" onClick={() => setF({ ...f, sections: [...f.sections, { id: crypto.randomUUID(), title: '', content: '', order: f.sections.length, visible: true }] })} className="flex gap-2 rounded-xl border px-4 py-2"><Plus /> Ajouter un article</button>
    <label className="flex gap-2"><input type="checkbox" checked={f.visible} onChange={(event) => setF({ ...f, visible: event.target.checked })} /> Conditions visibles</label>
    <SaveButton />
  </form>;
}

const blankPhoto = (order: number): PhotoItem => ({ id: crypto.randomUUID(), title: '', url: '', description: '', category: 'Association', date: '', active: true, order });
type MediaDraft = { kind: 'photo' | 'video'; item: PhotoItem | VideoItem; url: string; driveLink: string };
const restoredMediaItem = <T extends PhotoItem | VideoItem,>(kind: MediaDraft['kind']) => {
  const stored = readProtectedDraft<MediaDraft>(`maloka-draft-${kind}`);
  return stored?.kind === kind ? stored.item as T : null;
};
function PhotoEditor({ items, notify }: { items: PhotoItem[]; notify: (text: string) => void }) {
  const [draft, setDraft] = useState<PhotoItem | null>(() => restoredMediaItem<PhotoItem>('photo'));
  const open = (item: PhotoItem) => draft && draft.id !== item.id ? notify('Terminez ou annulez le brouillon de photo déjà ouvert avant d’en ouvrir un autre.') : setDraft(item);
  return <CollectionLayout title="Photos" onAdd={() => open(blankPhoto(items.length))}>{draft && <MediaForm key={draft.id} kind="photo" value={draft} save={(v) => notifySave(() => saveGalleryPhoto(v as PhotoItem), notify)} close={() => setDraft(null)} />}{items.map((item) => <ItemRow key={item.id} title={item.title} preview={<StructuralImage src={item.url} alt={item.title} className="h-24 w-32 rounded-xl object-cover" />} detail={`ordre ${item.order ?? 0} · ${item.active === false ? 'archivée' : 'active'}`} edit={() => open(item)} archive={() => confirm(`Archiver « ${item.title} » ? Elle restera restaurable.`) && notifySave(() => archiveGalleryPhoto(item.id), notify)} />)}</CollectionLayout>;
}
const blankVideo = (order: number): VideoItem => ({ id: crypto.randomUUID(), title: '', category: '', youtubeUrl: '', youtubeId: '', description: '', date: '', active: true, order });
function VideoEditor({ items, notify }: { items: VideoItem[]; notify: (text: string) => void }) {
  const [draft, setDraft] = useState<VideoItem | null>(() => restoredMediaItem<VideoItem>('video'));
  const open = (item: VideoItem) => draft && draft.id !== item.id ? notify('Terminez ou annulez le brouillon de vidéo déjà ouvert avant d’en ouvrir un autre.') : setDraft(item);
  return <CollectionLayout title="Vidéos YouTube" onAdd={() => open(blankVideo(items.length))}>{draft && <MediaForm key={draft.id} kind="video" value={draft} save={(v) => notifySave(() => saveVideo(v as VideoItem), notify)} close={() => setDraft(null)} />}{items.map((item) => <ItemRow key={item.id} title={item.title} preview={<YouTubePreview value={item.youtubeId || item.youtubeUrl} title={item.title} />} detail={`ordre ${item.order ?? 0} · ${item.active === false ? 'archivée' : 'active'}`} edit={() => open(item)} archive={() => confirm(`Archiver « ${item.title} » ? Elle restera restaurable.`) && notifySave(() => archiveVideo(item.id), notify)} />)}</CollectionLayout>;
}
function MediaForm({ kind, value, save, close }: { key?: string; kind: 'photo' | 'video'; value: PhotoItem | VideoItem; save: (value: PhotoItem | VideoItem) => Promise<boolean>; close: () => void }) {
  const initialDraft = useMemo<MediaDraft>(() => ({
    kind,
    item: value,
    url: kind === 'video' && 'youtubeUrl' in value ? (value.youtubeUrl || (value.youtubeId ? `https://youtu.be/${value.youtubeId}` : '')) : kind === 'photo' && 'url' in value ? value.url : '',
    driveLink: kind === 'photo' && 'driveFileId' in value && value.driveFileId ? `https://drive.google.com/file/d/${value.driveFileId}/view` : '',
  }), [kind, value]);
  const { form: draft, setForm: setDraft, dirty, markSaved, reset } = useProtectedDraft(initialDraft, `maloka-draft-${kind}`);
  const f = draft.item;
  const url = draft.url;
  const driveLink = draft.driveLink;
  const setF = (next: SetStateAction<PhotoItem | VideoItem>) => setDraft(current => ({ ...current, item: typeof next === 'function' ? (next as (previous: PhotoItem | VideoItem) => PhotoItem | VideoItem)(current.item) : next }));
  const setUrl = (nextUrl: string) => setDraft(current => ({ ...current, url: nextUrl }));
  const setDriveLink = (nextDriveLink: string) => setDraft(current => ({ ...current, driveLink: nextDriveLink }));
  const [validation, setValidation] = useState('');
  const checkDrive = async () => {
    const fileId = extractGoogleDriveFileId(driveLink);
    if (!fileId) return setValidation('Lien Drive invalide. Utilisez le lien de partage du fichier.');
    setValidation('Vérification du partage Google Drive…');
    try {
      const response = await fetch(`/api/media/drive?fileId=${encodeURIComponent(fileId)}`);
      const result = await response.json();
      if (!response.ok || !result.public) return setValidation(`${result.error || 'La vérification automatique Drive a échoué.'} Si le partage est bien « Toute personne disposant du lien », vous pouvez tout de même enregistrer.`);
      setDraft(current => ({ ...current, url: result.url, item: { ...current.item, driveFileId: fileId } as PhotoItem })); setValidation('Image Google Drive publique et prête à être enregistrée.');
    } catch { setValidation('Impossible de vérifier Drive. Vérifiez le partage « Toute personne disposant du lien ».'); }
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    let saved = false;
    if (kind === 'video') {
      const id = extractYouTubeId(url);
      if (!id) return setValidation('URL YouTube invalide. Formats watch, youtu.be et shorts acceptés.');
      saved = await save({ ...f, youtubeId: id, youtubeUrl: `https://www.youtube.com/watch?v=${id}` } as VideoItem);
    } else {
      const source = resolvePhotoSource(url, driveLink);
      if (!source) return setValidation(driveLink.trim() ? 'Lien Drive invalide. Utilisez le lien de partage du fichier.' : 'Choisissez une image, ajoutez une URL HTTPS ou collez un lien Google Drive.');
      saved = await save({ ...f, ...source } as PhotoItem);
    }
    if (saved) { markSaved(); close(); }
  };
  return <form onSubmit={submit} className="grid gap-3 rounded-2xl bg-zinc-50 p-4 dark:bg-zinc-900 md:grid-cols-2">
    <p className="md:col-span-2 text-sm text-zinc-500">{dirty && 'Brouillon protégé dans ce navigateur.'}</p>
    {kind === 'photo' && <div className="md:col-span-2"><MediaUploader label="Photo de la galerie" currentUrl={url} onUploaded={({ url: uploadedUrl }) => { setDraft(current => ({ ...current, url: uploadedUrl, driveLink: '', item: { ...current.item, url: uploadedUrl, driveFileId: '' } as PhotoItem })); setValidation('Photo mise en ligne. Cliquez sur « Enregistrer » pour la publier.'); }} /></div>}
    <Field label="Titre" value={f.title} onChange={(title) => setF({ ...f, title })} />
    {kind === 'video' && <div className="md:col-span-2"><YouTubePreview value={url} title={f.title} /></div>}
    <Field label={kind === 'video' ? 'URL YouTube' : 'URL HTTPS publique alternative (facultative avec Drive)'} type="url" required={kind === 'video'} value={url} onChange={setUrl} />
    {kind === 'photo' && <div className="md:col-span-2"><Field label="Lien partagé Google Drive" required={false} value={driveLink} onChange={setDriveLink} /><button type="button" onClick={() => void checkDrive()} className="mt-2 rounded-xl border px-4 py-2">Vérifier le partage Drive</button></div>}
    <Field label="Description" required={false} value={f.description ?? ''} onChange={(description) => setF({ ...f, description })} />
    <Field label="Date" type="date" required={false} value={f.date ?? ''} onChange={(date) => setF({ ...f, date })} />
    <Field label="Catégorie" required={false} value={f.category ?? ''} onChange={(category) => setF({ ...f, category })} />
    <Field label="Ordre" type="number" value={f.order ?? 0} onChange={(order) => setF({ ...f, order: Number(order) })} />
    <label className="flex items-center gap-2"><input type="checkbox" checked={f.active !== false} onChange={(event) => setF({ ...f, active: event.target.checked })} /> Publié</label>
    {validation && <p role="status" className="text-rose-600 md:col-span-2">{validation}</p>}<Actions cancel={() => { reset(); close(); }} />
  </form>;
}

function CollectionLayout({ title, onAdd, children }: { title: string; onAdd: () => void; children: ReactNode }) { return <div className="space-y-3 rounded-3xl border p-6"><div className="flex justify-between"><h2 className="text-xl font-black">{title}</h2><button onClick={onAdd} className="flex gap-2 rounded-xl bg-rose-600 px-4 py-2 font-bold text-white"><Plus /> Ajouter</button></div>{children}</div>; }
function ItemRow({ title, detail, edit, archive, preview }: { key?: string; title: string; detail: string; preview?: ReactNode; edit: () => void; archive: () => void }) { return <div className="flex flex-wrap items-center gap-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900"><div className="min-w-0 flex-1">{preview && <div className="mb-3 max-w-md">{preview}</div>}<p className="truncate font-bold">{title}</p><p className="text-xs text-zinc-500">{detail}</p></div><button onClick={edit} className="rounded-lg border px-3 py-2">Modifier</button><button aria-label={`Archiver ${title}`} title="Archiver sans supprimer" onClick={archive} className="p-2 text-amber-600"><Archive /></button></div>; }
function Checks({ active, free, setActive, setFree }: { active: boolean; free: boolean; setActive: (v: boolean) => void; setFree: (v: boolean) => void }) { return <div className="flex gap-5"><label className="flex gap-2"><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} /> Actif</label><label className="flex gap-2"><input type="checkbox" checked={free} onChange={(e) => setFree(e.target.checked)} /> Gratuit</label></div>; }
function Actions({ cancel }: { cancel: () => void }) { return <div className="flex gap-2 md:col-span-2"><SaveButton /><button type="button" onClick={cancel} className="rounded-xl border px-4">Annuler</button></div>; }
