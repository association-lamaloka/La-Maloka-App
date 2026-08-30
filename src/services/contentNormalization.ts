import { DEFAULT_FOOTER, DEFAULT_HOME_PAGE, DEFAULT_MEMBERSHIP_TERMS, DEFAULT_NAVIGATION, DEFAULT_REGISTRATION_PROCESS, DEFAULT_SITE_SETTINGS, DEFAULT_VIDEOS, DANCE_CLASSES, DANCE_EVENTS, PHOTO_GALLERY } from '../data';
import { DanceClass, DanceEvent, FooterContent, HomePageContent, MembershipTerms, NavigationItem, PhotoItem, RegistrationProcess, SiteSettings, VideoItem } from '../types';

const object = (value: unknown): Record<string, unknown> => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const array = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
const finiteOrder = (value: unknown, fallback: number) => typeof value === 'number' && Number.isFinite(value) ? value : fallback;
const https = (value: unknown) => typeof value === 'string' && value.startsWith('https://');
export const sorted = <T extends { order?: number }>(items: T[]) => [...items].sort((a,b) => (a.order ?? 0) - (b.order ?? 0));

export function normalizeSiteSettings(value: unknown): SiteSettings {
  const remote = object(value);
  return {
    ...DEFAULT_SITE_SETTINGS,
    ...remote,
    vignettes: Array.isArray(remote.vignettes) ? remote.vignettes.filter((item) => item && typeof item === 'object') as SiteSettings['vignettes'] : DEFAULT_SITE_SETTINGS.vignettes.map((item) => ({ ...item })),
    registrationInfo: { ...DEFAULT_SITE_SETTINGS.registrationInfo, ...object(remote.registrationInfo), importantDates: Array.isArray(object(remote.registrationInfo).importantDates) ? object(remote.registrationInfo).importantDates as SiteSettings['registrationInfo']['importantDates'] : DEFAULT_SITE_SETTINGS.registrationInfo.importantDates, guidelines: Array.isArray(object(remote.registrationInfo).guidelines) ? object(remote.registrationInfo).guidelines as string[] : DEFAULT_SITE_SETTINGS.registrationInfo.guidelines, documentsRequired: Array.isArray(object(remote.registrationInfo).documentsRequired) ? object(remote.registrationInfo).documentsRequired as string[] : DEFAULT_SITE_SETTINGS.registrationInfo.documentsRequired },
    moduleToggles: { ...DEFAULT_SITE_SETTINGS.moduleToggles, ...object(remote.moduleToggles) },
  } as SiteSettings;
}

export function normalizeHome(value: unknown): HomePageContent {
  const remote = object(value);
  const sections = array(remote.sections).map((item,index) => ({ ...object(item), order: finiteOrder(object(item).order,index) })).filter((item) => typeof item.id === 'string' && typeof item.title === 'string' && typeof item.subtitle === 'string' && typeof item.visible === 'boolean') as HomePageContent['sections'];
  return { ...DEFAULT_HOME_PAGE, ...remote, heroImageUrl: https(remote.heroImageUrl) ? remote.heroImageUrl as string : DEFAULT_HOME_PAGE.heroImageUrl, logoUrl: remote.logoUrl === '' || https(remote.logoUrl) ? remote.logoUrl as string : DEFAULT_HOME_PAGE.logoUrl, overlayImageUrl: https(remote.overlayImageUrl) ? remote.overlayImageUrl as string : DEFAULT_HOME_PAGE.overlayImageUrl, sections: sections.length ? sorted(sections) : DEFAULT_HOME_PAGE.sections.map((item) => ({ ...item })) } as HomePageContent;
}
export function normalizeFooter(value: unknown): FooterContent {
  const remote = object(value);
  const links = array(remote.links).map((item,index) => ({ ...object(item), order: finiteOrder(object(item).order,index) })).filter((item) => typeof item.id === 'string' && typeof item.label === 'string' && ['cours','agenda','galerie','conditions'].includes(String(item.destination)) && typeof item.visible === 'boolean') as FooterContent['links'];
  const blocks = array(remote.blocks).map((item,index) => ({ ...object(item), order: finiteOrder(object(item).order,index) })).filter((item) => typeof item.id === 'string' && typeof item.label === 'string' && typeof item.visible === 'boolean') as FooterContent['blocks'];
  return { ...DEFAULT_FOOTER, ...remote, links: links.length ? sorted(links) : DEFAULT_FOOTER.links.map((item) => ({ ...item })), blocks: blocks.length ? sorted(blocks) : DEFAULT_FOOTER.blocks.map((item) => ({ ...item })) } as FooterContent;
}
export function normalizeRegistration(value: unknown): RegistrationProcess { const remote = object(value); const steps = array(remote.steps).map((item,index) => ({ ...object(item), order: finiteOrder(object(item).order,index) })).filter((item) => typeof item.id === 'string' && typeof item.text === 'string') as RegistrationProcess['steps']; return { ...DEFAULT_REGISTRATION_PROCESS, ...remote, steps: steps.length ? sorted(steps) : DEFAULT_REGISTRATION_PROCESS.steps.map((item) => ({ ...item })) } as RegistrationProcess; }
export function normalizeTerms(value: unknown): MembershipTerms { const remote = object(value); const sections = array(remote.sections).map((item,index) => ({ ...object(item), order: finiteOrder(object(item).order,index) })).filter((item) => typeof item.id === 'string' && typeof item.title === 'string' && typeof item.content === 'string') as MembershipTerms['sections']; return { ...DEFAULT_MEMBERSHIP_TERMS, ...remote, sections: sections.length ? sorted(sections) : DEFAULT_MEMBERSHIP_TERMS.sections.map((item) => ({ ...item })) } as MembershipTerms; }

export function normalizeNavigation(value: unknown): NavigationItem[] { const items = array(object(value).items).map((item,index) => ({ ...object(item), order: finiteOrder(object(item).order,index) })).filter((item) => typeof item.id === 'string' && typeof item.label === 'string' && ['accueil','cours','agenda','galerie'].includes(String(item.destination)) && typeof item.active === 'boolean') as NavigationItem[]; return items.length ? sorted(items) : DEFAULT_NAVIGATION.map((item) => ({ ...item })); }
function normalizeCollection<T extends { id: string; order?: number }>(value: unknown, defaults: T[], valid: (item: Record<string, unknown>) => boolean): T[] { const items = array(value).map((item,index) => ({ ...object(item), order: finiteOrder(object(item).order,index) })).filter(valid) as unknown as T[]; return items.length ? sorted(items) : defaults.map((item,index) => ({ ...item, order: item.order ?? index })); }
export const normalizeCourses = (value: unknown): DanceClass[] => normalizeCollection(value,DANCE_CLASSES,(item) => typeof item.id === 'string' && typeof item.name === 'string' && typeof item.description === 'string' && https(item.image));
export const normalizeEvents = (value: unknown): DanceEvent[] => normalizeCollection(value,DANCE_EVENTS,(item) => typeof item.id === 'string' && typeof item.title === 'string' && typeof item.description === 'string' && typeof item.date === 'string' && https(item.image));
export const normalizePhotos = (value: unknown): PhotoItem[] => normalizeCollection(value,PHOTO_GALLERY,(item) => typeof item.id === 'string' && typeof item.title === 'string' && https(item.url));
export const normalizeVideos = (value: unknown): VideoItem[] => normalizeCollection(value,DEFAULT_VIDEOS,(item) => typeof item.id === 'string' && typeof item.title === 'string' && typeof item.youtubeId === 'string' && /^[A-Za-z0-9_-]{11}$/.test(item.youtubeId));
