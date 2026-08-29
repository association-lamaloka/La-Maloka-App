# La Maloka — landing page

Site public informatif de l'association La Maloka, avec un espace d'édition réservé aux comptes de l'équipe.

## Visualiser sans rien installer sur son ordinateur

Oui. La solution recommandée est une **Preview Vercel** : la compilation se fait dans le cloud et la maquette s'ouvre avec un simple lien web, sur ordinateur ou téléphone.

1. Ouvrir le projet `association-lamaloka/La-Maloka-App` dans Vercel.
2. Si le projet est déjà connecté à GitHub, ouvrir **Deployments** et sélectionner le déploiement associé à la branche ou à la pull request. Vercel affiche un bouton **Visit** et une URL `*.vercel.app`.
3. Si le projet n'est pas encore connecté, choisir **Add New → Project**, importer le dépôt GitHub, conserver le preset **Vite**, puis cliquer sur **Deploy**.
4. Partager l'URL de preview avec l'équipe. Cette URL ne remplace pas `lamaloka.fr` et permet de valider la maquette sans toucher à la production.

Il n'est pas nécessaire d'installer Node.js, npm, Firebase CLI ou le dépôt pour consulter cette preview. Ces outils ne sont utiles que pour développer localement ou administrer Firebase.

> Une URL de preview ne peut être générée qu'après l'envoi de la branche sur GitHub et son déploiement par Vercel. Une copie locale non poussée n'est pas accessible depuis Internet.

### Si aucune pull request n'apparaît dans GitHub

Un commit créé dans un environnement de travail distant n'est pas automatiquement présent sur GitHub. Il faut que cet environnement dispose à la fois d'un accès réseau à GitHub et d'une session autorisée, puis pousser la branche. La préparation d'un titre de pull request, à elle seule, ne publie aucun code.

Dans un terminal déjà autorisé avec GitHub CLI, le script suivant pousse la branche et crée la pull request vers `main` :

```bash
./scripts/publish-github-branch.sh work main
```

Le script s'arrête sans modifier GitHub si `gh auth status` ne confirme pas une session valide. Après son exécution, vérifier que GitHub affiche la branche `work` et la pull request avant d'attendre une Preview Vercel.

### Depuis une pull request déjà ouverte

1. Cliquer sur le titre de la pull request dans GitHub.
2. Ouvrir l'onglet **Checks** ou descendre jusqu'à la zone des contrôles en bas de **Conversation**.
3. Attendre que le contrôle Vercel affiche **Success**. Cliquer sur **Details** pour ouvrir directement la maquette.
4. Si aucun contrôle Vercel n'apparaît après quelques minutes, ouvrir Vercel → **Deployments**, retirer le filtre **Production**, sélectionner **Preview** et chercher la branche de la pull request.
5. Si la Preview est en erreur, ouvrir le déploiement puis **Build Logs** ; ne pas fusionner la pull request.
6. Si la Preview est prête, utiliser **Visit** et partager son URL `*.vercel.app`. Tester la maquette avant toute fusion vers `main`.

Le bouton GitHub **Merge pull request** publiera ensuite les changements sur `main` et déclenchera le déploiement Production ; ne l'utiliser qu'après validation de la Preview et sécurisation de Firebase.

#### Message « This branch has not been deployed »

Ce message signifie que GitHub connaît la branche, mais que Vercel n'a créé aucun déploiement pour elle. Il ne faut pas fusionner uniquement pour essayer de débloquer la Preview.

Dans Vercel, ouvrir le projet puis **Settings → Git** et vérifier :

1. **Connected Git Repository** doit être exactement `association-lamaloka/La-Maloka-App` ;
2. **Production Branch** doit être `main` ;
3. les déploiements de branches et pull requests ne doivent pas être désactivés par un **Ignored Build Step** ;
4. dans **Settings → Security / Git**, l'application Vercel doit avoir accès à l'organisation `association-lamaloka` et à ce dépôt ;
5. après correction, ouvrir **Deployments → Create Deployment**, choisir la branche `codex/effectuer-une-audit-extensif-du-site` et lancer un déploiement Preview.

Si Vercel est encore connecté à un ancien dépôt ou à une branche `principal`, le déconnecter puis importer le dépôt exact ci-dessus. Cette opération ne modifie pas le domaine de production tant que la Preview n'est pas promue et que la pull request n'est pas fusionnée.

## Visualiser la maquette en local

### Prérequis

- Node.js 20 ou supérieur ;
- npm ;
- une copie de ce dépôt.

### Démarrage

```bash
git clone <URL_DU_DEPOT>
cd La-Maloka-App
npm install
npm run dev
```

Ouvrir ensuite [http://localhost:3000](http://localhost:3000). Les pages publiques sont disponibles dans le menu : **Accueil**, **Cours**, **Agenda** et **Photos**. Le bouton **Équipe** affiche l'écran de connexion, mais une connexion fonctionnelle nécessite les comptes Firebase décrits ci-dessous.

Pour vérifier exactement l'artefact qui sera mis en production :

```bash
npm run build
npm run preview -- --host 0.0.0.0
```

Ouvrir l'adresse indiquée par Vite, généralement [http://localhost:4173](http://localhost:4173).

## Ordre de mise en production

Ne pas publier d'abord l'interface puis sécuriser Firebase plus tard. Respecter cet ordre :

1. fermer les anciennes collections avec les nouvelles règles Firestore ;
2. purger les données historiques ;
3. configurer les comptes nominatifs de l'équipe ;
4. tester dans une preview Vercel ;
5. publier et raccorder le domaine OVH.

Les opérations Firebase détaillées et les vérifications de confidentialité se trouvent dans [`docs/MISE-EN-PRODUCTION-LANDING.md`](docs/MISE-EN-PRODUCTION-LANDING.md).

## Preview Vercel depuis GitHub

1. Pousser la branche sur GitHub.
2. Dans Vercel, choisir **Add New → Project** puis importer `association-lamaloka/La-Maloka-App`.
3. Vérifier les valeurs détectées :
   - Framework Preset : **Vite** ;
   - Build Command : `npm run build` ;
   - Output Directory : `dist` ;
   - aucune variable secrète n'est nécessaire pour le frontend.
4. Cliquer sur **Deploy**.
5. Utiliser l'URL de preview `*.vercel.app` pour tester les quatre pages publiques, le responsive et l'écran de connexion.

Chaque nouvelle branche ou pull request connectée à Vercel produira ensuite une preview isolée. Ne raccorder `lamaloka.fr` qu'après validation de cette preview.

### Vérifier si la bonne version est déployée

Dans **Vercel → Deployments**, chaque ligne indique le hash Git et la branche ayant produit le déploiement. Comparer ce hash avec le dernier commit visible dans GitHub :

- si Vercel affiche encore un ancien hash, la nouvelle branche n'a pas été poussée, fusionnée ou redéployée ;
- le badge **Production** signifie que cette ligne sert actuellement le domaine de production ;
- un déploiement de la branche de travail doit d'abord apparaître comme **Preview**, avec son propre lien `*.vercel.app` ;
- après validation, fusionner la pull request dans la branche de production configurée dans **Settings → Git** (souvent `main`, `master` ou `principal`) ;
- Vercel doit alors créer une nouvelle ligne **Production** portant exactement le hash du commit fusionné.

Ne cliquer sur **Promote to Production** que si les règles Firestore sécurisées ont déjà été déployées et si la purge des données historiques a été réalisée. Si aucun déploiement Preview n'apparaît après le push, vérifier **Settings → Git → Connected Repository**, la branche de production et les journaux du build concerné.

## Activer l'administration

Dans la console Firebase du projet indiqué par `firebase-applet-config.json` :

1. ouvrir **Authentication → Sign-in method** et activer **Email/Password** ;
2. créer un compte individuel pour chaque personne autorisée ;
3. attribuer à ces comptes le custom claim `associationTeam: true` depuis un environnement Firebase Admin SDK sécurisé ;
4. déployer `firestore.rules` ;
5. demander aux personnes concernées de se déconnecter puis se reconnecter après l'attribution du claim.

Sans ce claim, un utilisateur peut réussir son authentification, mais Firestore refusera toute modification. Ne jamais committer de compte de service ou de clé privée dans ce dépôt.

## Déployer les règles Firestore

Si Firebase CLI est installé et authentifié avec un compte autorisé :

```bash
firebase login
firebase use western-theater-sds98
firebase deploy --only firestore:rules
```

Avant le déploiement, vérifier que la base ciblée est bien celle indiquée par `firestoreDatabaseId` dans `firebase-applet-config.json`. Si la CLI ne cible pas correctement cette base nommée, publier les règles depuis la console Firebase/Google Cloud correspondante et confirmer leur fonctionnement avec les vérifications du runbook.

## Raccorder `lamaloka.fr` depuis OVH à Vercel

1. Dans Vercel, ouvrir le projet puis **Settings → Domains**.
2. Ajouter `lamaloka.fr`, puis `www.lamaloka.fr`.
3. Vercel affiche les enregistrements DNS exacts à créer. Les recopier dans **OVHcloud → Domaines → Zone DNS** ; ne pas deviner les valeurs, car elles peuvent dépendre de la configuration Vercel.
4. Choisir un domaine canonique dans Vercel et rediriger l'autre vers celui-ci.
5. Supprimer uniquement les anciens enregistrements OVH qui entrent réellement en conflit. Conserver les enregistrements MX/TXT utilisés par l'email de l'association.
6. Attendre la validation DNS et l'émission du certificat TLS par Vercel.
7. Tester `https://lamaloka.fr` et `https://www.lamaloka.fr` en navigation privée et sur mobile.

Le trafic web peut ainsi être servi par Vercel tout en conservant le registraire et la zone DNS chez OVH.

## Checklist avant bascule

- [ ] `npm run lint` passe.
- [ ] `npm run build` passe.
- [ ] La preview Vercel correspond à la maquette validée.
- [ ] Les collections `inscriptions` et `health_forms` ont été supprimées à distance.
- [ ] Le champ historique `adminPassword` a été supprimé de Firestore.
- [ ] Un visiteur anonyme ne peut écrire dans aucune collection.
- [ ] Un compte sans claim ne peut pas modifier le contenu.
- [ ] Un compte `associationTeam` peut modifier les textes et la galerie.
- [ ] Les anciennes clés locales sont absentes dans DevTools → Application → Local Storage.
- [ ] Les photos disposent des autorisations nécessaires.
- [ ] Les deux variantes du domaine utilisent HTTPS et une seule URL canonique.

## Retour arrière

Si la publication présente un problème, utiliser **Vercel → Deployments → Promote to Production** sur le dernier déploiement stable. Ne jamais réouvrir les anciennes règles Firestore pour restaurer l'ancien back-office.
