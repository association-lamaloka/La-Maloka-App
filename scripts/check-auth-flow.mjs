import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
const admin = readFileSync(new URL('../src/components/SimpleAdmin.tsx', import.meta.url), 'utf8');
const firebase = readFileSync(new URL('../src/firebase.ts', import.meta.url), 'utf8');

assert.match(firebase, /setPersistence\(auth, browserLocalPersistence\)/, 'La session Firebase doit persister après le retour Google et une actualisation.');
assert.match(app, /getRedirectResult\(auth\)/, 'Le retour Google doit être traité globalement dans App.');
assert.match(app, /onAuthStateChanged\(auth/, 'App doit attendre la résolution de la session Firebase.');
assert.match(app, /current\.email !== ADMIN_EMAIL \|\| !current\.emailVerified/, 'Une autre compte ou une adresse non vérifiée doit être rejetée.');
assert.match(app, /setView\('administration'\)/, 'Un retour autorisé doit ouvrir automatiquement ÉQUIPE.');
assert.match(admin, /window\.location\.hash = 'administration'/, 'La route ÉQUIPE doit être conservée avant la redirection.');
assert.match(admin, /signInWithRedirect\(auth, provider\)/, 'La redirection ne doit démarrer qu’après le clic de connexion.');
assert.doesNotMatch(admin, /getRedirectResult/, 'Le résultat de redirection ne doit pas dépendre du montage de SimpleAdmin.');
assert.match(admin, /signOut\(auth\)/, 'La fermeture de session doit rester disponible.');

console.log('Flux auth vérifié : accès ÉQUIPE, redirection, retour global, persistance, déconnexion et rejet de compte.');
