import recovered from '../data/recovered-public-settings.json';
import examples from '../data/previous-examples.json';
import { extractYouTubeId } from './youtube';

export interface RecoveryChange { path: string; before: Record<string, unknown> | null; after: Record<string, unknown>; reason: string }
const object = (value: unknown): Record<string, any> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {};
const list = (value: unknown): Record<string, any>[] => Array.isArray(value) ? value.map(object) : [];
export const equal = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) || Array.isArray(b)) return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((v,i) => equal(v,b[i]));
  const left = Object.keys(a).sort(), right = Object.keys(b).sort();
  return equal(left,right) && left.every(key => equal((a as any)[key],(b as any)[key]));
};
const safeId = (id: unknown): id is string => typeof id === 'string' && /^[A-Za-z0-9_-]{1,120}$/.test(id);
const image = (url: unknown) => typeof url === 'string' && url.startsWith('https://') && !url.includes('images.unsplash.com/') ? url : '';
const text = (v: unknown) => typeof v === 'string' ? v : '';

export function localRecoveryData(storage: Pick<Storage, 'getItem'>) {
  const read = (key: string) => { try { return JSON.parse(storage.getItem(key) || 'null'); } catch { return null; } };
  return { settings: read('maloka_site_settings'), gallery: read('maloka_gallery_photos'), videos: read('maloka_gallery_videos'), courses: read('maloka_classes'), events: read('maloka_events') };
}

/** Only confirmed seed records are removable; any edited field preserves the record. */
export function isUnchangedExample(name: string, record: Record<string, any>) {
  const source = (examples as Record<string, any>)[name];
  const seed = Array.isArray(source) && source.find((item: any) => item.id === record.id);
  if (!seed) return false;
  const ignored = new Set(['updatedAt']);
  const defaults: Record<string, unknown> = { order: source.indexOf(seed), active: true, driveFileId: '', externalUrl: '', registrationButtonText: 'S’inscrire', season: '', isFree: seed.annualPrice === 0, annualPrice: 0 };
  return Object.keys(record).filter(key => !ignored.has(key)).every(key => equal(record[key], seed[key] ?? defaults[key]));
}

export function buildRecoveryPlan(current: Record<string, Record<string, any>>, local: ReturnType<typeof localRecoveryData>): RecoveryChange[] {
  const changes = new Map<string, RecoveryChange>();
  const propose = (path: string, after: Record<string, any>, reason: string) => { const before = current[path] || null; if (!equal(before, after)) changes.set(path, { path, before, after, reason }); };
  // Example records are archived, never deleted, so every recovery action remains reversible.
  for (const [path, value] of Object.entries(current)) {
    const [name, id] = path.split('/');
    if (isUnchangedExample(name, { ...value, id })) propose(path, { ...value, active: false }, 'Donnée d’exemple inchangée — archivage réversible');
  }
  const old = { ...recovered, ...object(local.settings) };
  const settingsPath = 'site_settings/global';
  const now = current[settingsPath] || {};
  const patch: Record<string, any> = {};
  for (const key of ['associationName','tagline','heroHeadline','heroSubheadline','contactEmail','contactPhone','contactPerson','contactHours','postalAddress','contactWhatsApp','associationStory','locationFontenay','locationLaQueue','facebookUrl','instagramUrl','youtubeUrl','vignettes','registrationInfo','moduleToggles']) {
    if (old[key] !== undefined && (now[key] === undefined || equal(now[key], (examples.settings as Record<string, any>)[key]))) patch[key] = old[key];
  }
  if (patch.vignettes) patch.vignettes = list(patch.vignettes).map(v => ({ id:text(v.id),title:text(v.title),subtitle:text(v.subtitle),badge:text(v.badge),description:text(v.description),image:image(v.image),accentColor:['orange','rose','emerald','amber'].includes(v.accentColor) ? v.accentColor : 'orange',scheduleSummary:text(v.scheduleSummary),locationSummary:text(v.locationSummary),keyPoints:Array.isArray(v.keyPoints) ? v.keyPoints.filter((x: unknown) => typeof x === 'string') : [],active:v.active === true }));
  if (Object.keys(patch).length) propose(settingsPath, { ...now, ...patch }, 'Configuration retrouvée le 29 août ; valeurs récentes conservées');
  if (now.heroImage === examples.settings.heroImage) {
    const after = changes.get(settingsPath)?.after || {...now};
    propose(settingsPath,{...after,heroImage:''},'Configuration retrouvée et retrait de l’image d’exemple ; valeurs récentes conservées');
  }
  const home = current['pages/home'];
  if (home) {
    const after = {...home};
    for (const key of ['heroImageUrl','overlayImageUrl']) if (after[key] === examples.settings.heroImage) after[key] = '';
    propose('pages/home',after,'Retrait des images d’exemple de la page d’accueil');
  }
  const footer = current['pages/footer'];
  if (footer && patch.contactPhone && footer.phone === examples.settings.contactPhone) propose('pages/footer', { ...footer, phone: patch.contactPhone }, 'Téléphone retrouvé dans la configuration précédente');

  for (const [name, source] of [['gallery',local.gallery], ['videos',local.videos]] as const) {
    for (const entry of list(source)) {
      if (!safeId(entry.id) || isUnchangedExample(name,entry) || (current[`${name}/${entry.id}`] && !changes.has(`${name}/${entry.id}`))) continue;
      const common = { id:entry.id,title:text(entry.title),description:text(entry.description),date:text(entry.date),active:false,order:changes.size };
      if (name === 'gallery' && image(entry.url)) propose(`${name}/${entry.id}`, { ...common,url:image(entry.url),driveFileId:'',category:text(entry.category) }, 'Photo retrouvée sur cet appareil — brouillon');
      const id = extractYouTubeId(entry.youtubeId) || extractYouTubeId(entry.youtubeUrl);
      if (name === 'videos' && id) propose(`${name}/${entry.id}`, { ...common,youtubeId:id,youtubeUrl:`https://www.youtube.com/watch?v=${id}`,category:text(entry.category) }, 'Vidéo retrouvée sur cet appareil — brouillon');
    }
  }
  for (const [name,source] of [['courses',local.courses],['events',local.events]] as const) {
    for (const entry of list(source)) {
      if (!safeId(entry.id) || isUnchangedExample(name,entry) || (current[`${name}/${entry.id}`] && !changes.has(`${name}/${entry.id}`))) continue;
      const common = {id:entry.id,description:text(entry.description),location:text(entry.location),image:image(entry.image),active:false,order:changes.size};
      if (name === 'courses' && entry.name) propose(`${name}/${entry.id}`, {...common,name:text(entry.name),category:text(entry.category),level:text(entry.level),instructor:text(entry.instructor),schedule:text(entry.schedule),season:text(entry.season),priceMonthly:Math.max(0,Number(entry.priceMonthly) || 0),annualPrice:Math.max(0,Number(entry.annualPrice) || 0),isFree:entry.isFree === true,helloAssoUrl:text(entry.helloAssoUrl),registrationButtonText:text(entry.registrationButtonText) || 'S’inscrire'}, 'Cours retrouvé sur cet appareil — brouillon');
      if (name === 'events' && entry.title) propose(`${name}/${entry.id}`, {...common,title:text(entry.title),type:text(entry.type),date:text(entry.date),time:text(entry.time),price:Math.max(0,Number(entry.price) || 0),externalUrl:text(entry.externalUrl)}, 'Événement retrouvé sur cet appareil — brouillon');
    }
  }
  // Restore course facts from the actual saved pricing plans, never from example schedules.
  for (const plan of list(old.pricingPlans)) {
    if (!safeId(plan.classId)) continue;
    const path = `courses/${plan.classId}`;
    if ((current[path] && !changes.has(path)) || changes.has(path)) continue;
    propose(path, { id:plan.classId,name:`${text(plan.discipline)} — ${text(plan.level)}`,description:text(plan.notes),category:text(plan.discipline),level:text(plan.level),instructor:'',schedule:`${text(plan.day)} ${text(plan.time)}`,location:`${text(plan.room)} · ${text(plan.location)}`,image:'',season:'2026-2027',priceMonthly:0,annualPrice:Number(plan.price) || 0,isFree:Number(plan.price) === 0,helloAssoUrl:text(plan.helloAssoUrl),registrationButtonText:'S’inscrire',active:false,order:changes.size }, 'Tarif et horaire retrouvés — cours en brouillon à compléter');
  }
  return [...changes.values()];
}
