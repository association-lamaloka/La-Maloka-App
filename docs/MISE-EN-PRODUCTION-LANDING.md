# Mise en production du mode landing page

Le code ne lit plus, n'écrit plus et n'affiche plus aucune inscription, fiche de santé, reçu ou liste d'adhérents. Les règles ferment intégralement les anciennes collections `inscriptions` et `health_forms`.

## Actions obligatoires dans Firebase

Le dépôt ne possède pas les identifiants de production et ne peut donc pas effacer les documents distants. Un propriétaire du projet doit effectuer ces actions dans cet ordre :

1. **Sauvegarder uniquement si une obligation légale le requiert**, dans un emplacement chiffré et à accès limité.
2. Déployer immédiatement `firestore.rules` afin de bloquer les collections historiques.
3. Dans Firestore, supprimer tous les documents puis les collections `inscriptions` et `health_forms`.
4. Supprimer le champ historique `adminPassword` du document `site_settings/global`.
5. Supprimer les anciennes données personnelles de Google Sheets, Apps Script, exports, logs applicatifs et sauvegardes selon la politique de conservation de l'association.
6. Révoquer l'ancien mot de passe partagé et le token Google Sheets. Ils ne sont plus utilisés par l'application.

La suppression d'une collection dans le fichier blueprint **ne supprime pas les documents déjà présents dans Firestore**. Vérifier dans la console que les deux collections n'existent plus.

## Comptes de l'équipe

1. Activer la connexion Email/Mot de passe dans Firebase Authentication.
2. Créer un compte nominatif par membre de l'équipe. Ne jamais partager un même compte.
3. Attribuer via Firebase Admin SDK le custom claim `{ "associationTeam": true }` uniquement aux personnes autorisées.
4. Demander à la personne de se déconnecter/reconnecter après l'attribution du claim.
5. Retirer le claim et révoquer les sessions dès qu'une personne quitte l'équipe.

Exemple à exécuter depuis un environnement administratif sécurisé, avec `firebase-admin` et un compte de service hors du dépôt :

```js
await getAuth().setCustomUserClaims(uid, { associationTeam: true });
await getAuth().revokeRefreshTokens(uid);
```

Une simple identité Firebase ne suffit pas pour modifier le contenu : les règles exigent explicitement le claim `associationTeam`.

## Vérifications avant publication

- Un visiteur peut lire `site_settings` et `gallery`, mais aucune autre collection.
- Un compte Firebase sans claim reçoit `permission-denied` lors d'une écriture.
- Un compte de l'équipe peut modifier les textes et gérer la galerie.
- Aucune inscription, donnée médicale ou credential n'apparaît dans DevTools, IndexedDB ou `localStorage`.
- Les photos publiées disposent de l'autorisation des personnes reconnaissables et ne contiennent pas de métadonnées inutiles.
