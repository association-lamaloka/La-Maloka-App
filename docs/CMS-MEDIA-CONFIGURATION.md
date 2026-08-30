# Configuration des médias du CMS

## Vercel Blob

1. Dans le projet Vercel, ouvrir **Storage** puis **Create Database**.
2. Choisir **Blob**, créer un store public et le relier au projet.
3. Vérifier dans **Settings → Environment Variables** que `BLOB_READ_WRITE_TOKEN` est disponible pour **Preview** (et seulement plus tard pour Production après validation).
4. Ajouter facultativement `BLOB_MAX_FILE_SIZE_MB=5`.
5. Redéployer uniquement la Preview de la pull request.

Le token reste côté serveur. `/api/media/upload` valide d'abord le Firebase ID token, le compte Google officiel vérifié, le type MIME et la taille avant de contacter Blob.

## Google Drive pour la galerie

Les photos non structurelles restent dans Drive. Dans Google Drive, ouvrir **Partager**, choisir **Toute personne disposant du lien**, rôle **Lecteur**, puis coller le lien dans ÉQUIPE. Le CMS extrait le `fileId` et vérifie que la réponse publique est une image avant l'enregistrement.

## Modèle Firestore

- `site_settings/global`: identité, contacts, réseaux, adresses, saison, textes du pied et URLs Blob structurelles.
- `pages/home`: tous les textes, URLs d’images, boutons, badges et sections publiables de l’accueil.
- `pages/footer`: description, coordonnées, réseaux, liens, textes légaux et blocs ordonnés du footer.
- `navigation/main`: libellés, destinations internes, ordre et publication.
- `courses/{id}`: cours publiables et URL Blob de l'image.
- `events/{id}`: agenda, prix, liens externes et URL Blob de l'image.
- `gallery/{id}`: métadonnées, `driveFileId` ou URL HTTPS publique; aucun binaire.
- `videos/{id}`: identifiant YouTube et métadonnées; aucun binaire ou iframe.
- `registration_process/global` et `membership_terms/global`: contenus éditoriaux structurés.

Les collections personnelles historiques et toute collection inconnue restent bloquées par les règles.
