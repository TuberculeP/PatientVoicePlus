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

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/centers` | Liste des centres |
| GET | `/api/centers/:id` | Détail d'un centre |
| GET | `/api/forms` | Thèmes et questions |
| POST | `/api/forms` | Soumettre un formulaire |
