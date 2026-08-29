import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');
const admin = readFileSync(new URL('../src/components/SimpleAdmin.tsx', import.meta.url), 'utf8');
const firebase = readFileSync(new URL('../src/firebase.ts', import.meta.url), 'utf8');

assert.match(firebase, /setPersistence\(auth, browserLocalPersistence\)/, 'La session Firebase doit persister après une actualisation.');
assert.match(app, /onAuthStateChanged\(auth/, 'App doit restaurer globalement la session Firebase au chargement.');
assert.doesNotMatch(app, /getRedirectResult|signInWithRedirect/, 'App ne doit plus traiter de retour par redirection.');
assert.match(app, /current\.email !== ADMIN_EMAIL \|\| !current\.emailVerified/, 'Une autre compte ou une adresse non vérifiée doit être rejetée globalement.');
assert.match(admin, /setCustomParameters\(\{ prompt: 'select_account' \}\)/, 'Google doit afficher son sélecteur officiel de compte.');
assert.match(admin, /signInWithPopup\(auth, provider\)/, 'La fenêtre Google doit être ouverte directement par le clic.');
assert.match(admin, /result\.user\.email !== 'association\.lamaloka@gmail\.com' \|\| !result\.user\.emailVerified/, 'Le résultat doit valider immédiatement le compte officiel vérifié.');
assert.match(admin, /await signOut\(auth\)/, 'Une compte refusée doit être déconnectée.');
assert.match(admin, /auth\/popup-blocked/, 'Le blocage de popup doit avoir un message spécifique.');
assert.match(admin, /auth\/popup-closed-by-user/, 'L’annulation de popup doit avoir un message spécifique.');
assert.match(admin, /onClick=\{login\}/, 'La popup ne doit démarrer que depuis le clic utilisateur.');
assert.match(admin, /onClick=\{\(\) => signOut\(auth\)\}/, 'La fermeture de session doit rester disponible.');
assert.doesNotMatch(admin, /signInWithRedirect|getRedirectResult|location\.hash/, 'Aucune logique de redirection ou route pending ne doit subsister.');

console.log('Flux popup vérifié : sélecteur, autorisation, rejet, persistance, déconnexion, blocage et annulation.');
