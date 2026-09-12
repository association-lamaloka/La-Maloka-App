import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { LandingContent } from '../src/components/LandingContent';
import { normalizeCourses, normalizeEvents, normalizeHome, normalizePhotos, normalizeSiteSettings, normalizeVideos } from '../src/services/contentNormalization';
import { extractYouTubeId } from '../src/services/youtube';
import { buildRecoveryPlan, equal, isUnchangedExample, localRecoveryData } from '../src/services/contentRecovery';
import { extractGoogleDriveFileId, publicImageUrl, resolvePhotoSource } from '../src/services/mediaUrl';
import examples from '../src/data/previous-examples.json';

for (const normalize of [normalizeCourses,normalizeEvents,normalizePhotos,normalizeVideos]) {
  assert.deepEqual(normalize(undefined),[]);
  assert.deepEqual(normalize([]),[]);
  assert.deepEqual(normalize([null,{id:'broken'}]),[]);
}
assert.deepEqual(normalizeHome({sections:[]}).sections,[]);
assert.deepEqual(normalizeSiteSettings({vignettes:[]}).vignettes,[]);
assert.equal(normalizeHome({heroImageUrl:''}).heroImageUrl,'');
const id = 'dQw4w9WgXcQ';
for (const url of [`https://youtu.be/${id}?si=shared`,`https://www.youtube.com/watch?list=abc&v=${id}`,`https://m.youtube.com/shorts/${id}`,`https://youtube.com/embed/${id}`,`https://youtube.com/live/${id}`,id]) assert.equal(extractYouTubeId(url),id);
for (const url of [`https://evil.example/youtube.com/watch?v=${id}`,`https://youtube.com.evil.example/watch?v=${id}`,`javascript:${id}`,'https://youtube.com/watch?v=bad']) assert.equal(extractYouTubeId(url),null);
assert.equal(normalizeVideos([{id:'legacy',title:'Saved video',youtubeUrl:`https://youtu.be/${id}`}])[0].youtubeId,id);
const markup = renderToStaticMarkup(<LandingContent section="galerie" photos={[]} videos={[]} />);
assert.match(markup,/Aucune photo publiée/); assert.match(markup,/Aucune vidéo publiée/); assert.doesNotMatch(markup,/unsplash|iframe/);
const protectedMarkup = renderToStaticMarkup(<LandingContent section="cours" classes={[]} registration={{title:'Inscription',steps:[{id:'visible',text:'Visible step',order:0,visible:true},{id:'archived',text:'Archived step',order:1,visible:false}],finalNote:'Done',visible:true}} terms={{title:'Terms',subtitle:'',lastUpdated:'',sections:[],visible:false}} />);
assert.match(protectedMarkup,/Visible step/); assert.doesNotMatch(protectedMarkup,/Archived step/);
const seed = examples.gallery[0];
assert.ok(isUnchangedExample('gallery',seed));
assert.ok(!isUnchangedExample('gallery',{...seed,title:'My real photo'}));
const archivePlan = buildRecoveryPlan({[`gallery/${seed.id}`]:seed},localRecoveryData({getItem: () => null}));
assert.equal(archivePlan.find(item => item.path === `gallery/${seed.id}`)?.after.active,false, 'Example cleanup must be a reversible archive.');
const local = localRecoveryData({getItem: key => key === 'maloka_gallery_videos' ? JSON.stringify([{id:'saved-video',title:'Saved video',youtubeUrl:`https://youtu.be/${id}`}]) : null});
const plan = buildRecoveryPlan({'site_settings/global':{...examples.settings,contactPhone:'NEW PHONE',heroImage:'https://my.example/new.jpg'}},local);
const settings = plan.find(item => item.path === 'site_settings/global')!.after!;
assert.equal(settings.contactPhone,'NEW PHONE'); assert.equal(settings.heroImage,'https://my.example/new.jpg');
assert.equal(plan.find(item => item.path === 'videos/saved-video')!.after!.active,false);
assert.ok(plan.every(item => item.after !== null), 'Recovery must archive records and never propose permanent deletion.');
assert.ok(!JSON.stringify(plan).includes('adminPassword'));
assert.ok(equal({a:1,b:{x:2,y:3}},{b:{y:3,x:2},a:1}));
const driveId = '1gEYbTTpomRaa-mnuR6pwtQNivalsYeFV';
for (const url of [`https://drive.google.com/file/d/${driveId}/view?usp=sharing`,`https://drive.google.com/uc?export=view&id=${driveId}`]) {
  assert.equal(extractGoogleDriveFileId(url),driveId);
  assert.equal(publicImageUrl(url),`/api/media/drive-image?fileId=${driveId}`);
}
assert.deepEqual(resolvePhotoSource('', `https://drive.google.com/file/d/${driveId}/view?usp=sharing`), {
  url: `https://drive.google.com/file/d/${driveId}/view?usp=sharing`,
  driveFileId: driveId,
});
assert.deepEqual(resolvePhotoSource('https://images.example/photo.jpg', ''), {
  url: 'https://images.example/photo.jpg',
  driveFileId: '',
});
assert.equal(resolvePhotoSource('', 'https://evil.example/photo.jpg'), null);
assert.equal(extractGoogleDriveFileId(`https://evil.example/file/d/${driveId}/view`),null);
assert.equal(publicImageUrl('https://example.com/photo.jpg'),'https://example.com/photo.jpg');
const before = Object.fromEntries(plan.filter(item => item.after).map(item => [item.path,item.after!]));
assert.deepEqual(buildRecoveryPlan(before,local),[], 'Applying the same recovery twice must propose no additional writes.');
console.log('Verified: empty collections, deleted sections, legacy YouTube URLs, empty rendering, exact sample detection, preserved new settings, draft recovery, idempotency.');
