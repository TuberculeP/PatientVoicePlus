# PatientVoice v2

NestJS + Prisma + Vue 3 · déployable en un seul conteneur Docker.

## Prérequis

- Node.js 22+
- Docker Desktop

---

## Setup local

### 1. Variables d'environnement

```bash
cp .env.example .env
# Renseigne POSTGRES_PASSWORD
```

```bash
# backend/.env (créer)
DATABASE_URL="postgresql://postgres:<POSTGRES_PASSWORD>@localhost:5432/patientvoice"
```

### 2. Installer les dépendances

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Démarrer la base de données

```bash
# Démarre postgres + applique le schéma Prisma
./start_local_db.sh
```

> `start_local.sh` fait la même chose sans le `prisma db push` (utile si le schéma est déjà à jour).

### 4. Seeder (première fois seulement)

```bash
cd backend
npx ts-node --project tsconfig.json prisma/seed.ts
```

### 5. Lancer les serveurs

Dans deux terminaux séparés :

```bash
# Terminal 1
cd backend && npm run start:dev

# Terminal 2
cd frontend && npm run dev
```

Frontend disponible sur [http://localhost:5173](http://localhost:5173) · API sur [http://localhost:3000/api](http://localhost:3000/api)

---

## Docker (production)

```bash
cp .env.example .env
# Renseigne POSTGRES_PASSWORD dans .env

docker compose up --build -d
```

Seeder (première fois) :

```bash
# Exposer postgres temporairement
echo "services:\n  db:\n    ports:\n      - \"5433:5432\"" > docker-compose.override.yml
docker compose up db -d
DATABASE_URL="postgresql://postgres:<POSTGRES_PASSWORD>@localhost:5433/patientvoice" \
  npx ts-node --project backend/tsconfig.json backend/prisma/seed.ts
rm docker-compose.override.yml
docker compose up -d
```

App disponible sur [http://localhost:3000](http://localhost:3000)

---

## Endpoints API

| Méthode | Route              | Description             |
| ------- | ------------------ | ----------------------- |
| GET     | `/api/health`      | Health check            |
| GET     | `/api/centers`     | Liste des centres       |
| GET     | `/api/centers/:id` | Détail d'un centre      |
| GET     | `/api/forms`       | Thèmes et questions     |
| POST    | `/api/forms`       | Soumettre un formulaire |

# Readme de la V1 :

# [PatientVoice](https://patientvoice-frontend.onrender.com/) - Redonner voix aux patients en centres de rééducation

[PatientVoice](https://patientvoice-frontend.onrender.com/) est un site web permettant aux patients et patientes et à leurs proches de partager leur retour d’expérience sur leur parcours au sein d’un centre de rééducation fonctionnelle. De fait, le site référence un ensemble de centres de rééducation fonctionnelle, avec leurs informations publiques (adresse, nom, spécialités, etc.) et offre aux utilisateurs et utilisatrices la possibilité de remplir un questionnaire de satisfaction associé à chaque centre.

Le questionnaire se décompose en plusieurs thématiques, et permet d’explorer en profondeur le vécu et le ressenti des personnes sur les aspects formant leur expérience totale au sein des centres. Les avis sont envoyés et reçus de manière totalement anonymisée, et servent de base afin de proposer aux-dits centres des axes d’amélioration afin de garantir un meilleur accueil à leurs patients et patientes.

## L'équipe PatientVoice

### Frontend

- Pierric LETARD - Développement Vue.js
- Laura KOKONYANGE-NKASEI - Développement Vue.js

### Backend et DevOps

- Aurore DIMECH - Développement Express.js et mise en ligne des services

### Product Owner

- Rayan MAHANI - Cohésion d'équipe

## Fonctionnalités principales

### Consultation des centres de rééducation

**Utilité :** Notre projet présente une liste de centres de rééducation et de leurs informations publiques, permettant aux utilisateurs de les consulter (nom, adresse complète).

**Mise en place technique :**
Les données sont récupérées via une API REST Express.js connectée à la base de données PostgreSQL. Les informations alors obtenues sont affichées et organisées côté front afin d’offrir une interface simple et donc les rendre intelligible à nos utilisateurs et utilisatrices.

### Consultation des informations d’un centre de rééducation

**Utilité :** Il est possible de consulter les informations précises d’un centre rééducation spécifique sur PatientVoice. L’objectif de cette fonctionnalité est d’offrir aux utilisateurs et utilisatrices un endroit accessible où consulter ces informations (nom, adresse complète, une possible description, et les spécialités de l’établissement) et d’avoir l’opportunité par la même occasion de visualiser leur emplacement sur la carte. Au final, cela répond à un double besoin : se renseigner sur un établissement, ou vérifier si un établissement sélectionné est bien celui sur lequel on souhaite déposer un retour d’expérience.

**Mise en place technique :** Les données sont récupérées via une API REST Express.js connectée à la base de données puis sont affichées côté front avec toutes leurs informations, en utilisant leaflet, une librairie Javascript, pour créer la carte. Celle-ci fonctionne à l’aide de coordonnées, qui sont également fournies par le backend, rendant toutes les données backend-driven.

### Récupération des questions pour nourrir le questionnaire

**Utilité :** Pour chaque centre, l’utilisateur a la possibilité d’accéder à un formulaire de satisfaction, avec des questions regroupés par thème (nourriture, etc..). Chaque question présente un choix multiple pour évaluer la qualité d’un service, puis un champ de texte libre pour ajouter un commentaire si voulu.

**Mise en place technique :** Similairement à la fonctionnalité précédente, les données demandées par le front sont récupérées dans la base de données au travers d’une API REST. Les questions sont reçues du back-end directement triées, par thème, et le front reçoit de ce fait un objet contenant le nom d’un thème, et les questions qui le composent avec leur nom et leur identifiant unique. Cela permet de faciliter l’affichage en front, qui itère sur les différents thèmes et les questions à l’intérieur de ceux-ci.
Ainsi, le formulaire est également backend-driven. Les questions sont toutes récupérées via l’API et non pas codées directement côté front, permettant de modifier plus facilement le questionnaire à l’avenir.

### Enregistrement des réponses des participants

**Utilité :** Une fois le questionnaire rempli, les utilisateurs et utilisatrices peuvent enregistrer leurs réponses, et ainsi envoyer à l’équipe de PatientVoice leur retour d’expérience. Sur le long terme, le recueil de plusieurs retours d’expériences serait l’occasion de proposer aux centres des axes d’amélioration afin d’augmenter leur satisfaction client.

**Mise en place technique :** Pour chaque question, les réponses (note et commentaire) sont envoyées via l’id de la question fournie. Chaque réponse est alors stockée côté back-end, et associée à un retour d’expérience (dont l’id est généré par le serveur backend), lui-même lié à un centre (l’id du centre concerné est également envoyé lors de la soumission de la réponse).

## Technologies utilisées

### Frontend

- Vue.js
- Tailwind CSS

### Backend

- Node.js : permet de partager un unique langage (JS) pour le frontend et le backend
- Express.js : un framework réputé dans l’industrie, permettant de proposer des API REST en JavaScript
- Sequelize : un ORM facilitant la mise en place de la base de données et la gestion des données à l’intérieur de celle-ci

### Base de données

- PostgreSQL : Stocker de manière sécurisée et durable les informations relatives aux centres, aux questionnaires, et aux réponses données par les utilisateurs et utilisatrices

### DevOps

- GitHub Actions : Intégration continue
- Render - Déploiement frontend, backend et de la base de données

## Architecture du projet

```
PatientVoice/
├── frontend/                     # Application Vue.js
│   ├── public/
│   ├── src/
│   │   ├── assets/               # Ressources nécessaires à l'affichages (images, etc.)
│   │   ├── router/               # Liste et liens des Page de l'application
│   │   ├── stores/               # Fonctions utilitaires nécessaires à l'affichage et scripts réutilisables
│   │   ├── views/                # Pages du site
│   │   │   └── components/       # Composant utilisés dans les pages du site
│   │   └── App.vue               # Composant principal
│   │   └── main.ts               # Composant principal
│   └── package.json

│
├── backend/                      # API Express.js
│   ├── src/
│   │   ├── config/               # Configurations du serveur et de la base de données
│   │   ├── migrations/           # Données nécessaires à la construction de la base de données
│   │   ├── models/               # Modèles/ classes des types de données enregistrées, basées sur les tables de la base de données
│   │   ├── routes/               # Logique métier et routes API
│   │   ├── seeders/              # Données de base à enregistrer dans la base de données
│   │   └── app.js                # Point d'entrée
│   └──  package.json
│
└── README.md                     # Documentation
```

## Diagramme de Flux de Données

- **Initialisation** : L'API charge les différents centres existants dans notre base de données
- **Accès à la page d’un centre** : Le front réalise une requête GET sur /centers/{uuid} avec le centre qu’on essaie de charger
- **Accès à la page de formulaire** : L'API envoie les données nécessaires pour récupérer le formulaire avec ses questions
- **Envoie du formulaire** : Le front formulaire effectue une requête POST sur /forms avec comme données l’id du centre concerné, et pour chacune des questions l’id de la question, la valeur de la réponse et le contenu supplémentaire
- **Réponse** : L'API renvoie les un message pour justifier de la bonne réception et enregistrement du formulaire

## Sécurité

Certaines mesures de sécurité structurelles ont été mises en place afin d’assurer l’intégrité et la protection des données pouvant être sensibles dans notre MVP :

- **Obfuscation des URL** : Utilisation d'UUID v4 pour les identifiants de certains modèles (centres, forms, answers), ce qui empêche de deviner ou pouvoir récupérer les identifiants des autres éléments du même modèle
- **Gestion des Secrets** : Toutes les données sensibles (telles que les clefs API ou encore les url Hooks de Render) sont stockées dans des fichiers d’environnement (.env) ou dans des variables d’environnement sur GitHub et Render. Ainsi, aucune d’entre elles n’est directement dans le code source, ce qui évite qu’elles puissent être récupérées par une personne tierce non-autorisée
- **Validation des Données** : les données reçues au travers des requêtes POST doivent passer une validation, qui assure que le type et le contenu des requêtes est correct, sécurisé (empêche entre autres les injections SQL) et correspond à ce qui est attendu pour être stocké dans notre base de données
- **CORS** : L'API n'accepte que certains types de requêtes (POST, GET) car étant les seules qui sont utilisées dans nos routes, et ces requêtes ne sont traitées que si elles viennent du domaine frontend autorisé (url de la version déployée du frontend).
