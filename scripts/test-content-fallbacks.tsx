import assert from 'node:assert/strict';
import React from 'react';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import { LandingContent } from '../src/components/LandingContent';
import { Navigation } from '../src/components/Navigation';
import { normalizeCourses, normalizeEvents, normalizeFooter, normalizeHome, normalizeNavigation, normalizePhotos, normalizeSiteSettings, normalizeVideos } from '../src/services/contentNormalization';

const home = normalizeHome(undefined);
const partialHome = normalizeHome({ headline: 'Titre partiel', sections: undefined });
const footer = normalizeFooter({ description: 'Partiel', links: null, blocks: undefined });
const courses = normalizeCourses([null, { id: 'bad' }]);
const events = normalizeEvents([undefined, { id: 'bad', title: null }]);
const photos = normalizePhotos(undefined);
const videos = normalizeVideos(undefined);
const navigation = normalizeNavigation({ items: undefined });
const boundary = readFileSync(new URL('../src/components/AppErrorBoundary.tsx', import.meta.url), 'utf8');
const main = readFileSync(new URL('../src/main.tsx', import.meta.url), 'utf8');
const settings = normalizeSiteSettings({ vignettes: null, registrationInfo: null, moduleToggles: null });
assert.ok(home.headline && home.sections.length);
assert.equal(partialHome.headline, 'Titre partiel'); assert.ok(partialHome.sections.length);
assert.ok(footer.links.length && footer.blocks.length);
assert.ok(courses.length && events.length && photos.length && videos.length && navigation.length);
assert.ok(settings.vignettes.length);
assert.match(main, /AppErrorBoundary/); assert.match(boundary, /window.location.reload/);
const noop = () => {};
for (const markup of [
  renderToStaticMarkup(<LandingContent section="cours" classes={courses} />),
  renderToStaticMarkup(<LandingContent section="agenda" events={events} />),
  renderToStaticMarkup(<LandingContent section="galerie" photos={photos} videos={videos} />),
  renderToStaticMarkup(<Navigation currentTab="accueil" setCurrentTab={noop} isDarkMode={false} toggleDarkMode={noop} items={navigation} />),
]) assert.ok(markup.length > 100);
console.log('Fallbacks vérifiés : base vide, documents absents/partiels, tableaux absents, entrées invalides et rendus publics.');
