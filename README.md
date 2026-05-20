# PatientVoice v2

NestJS + Prisma + Vue 3 · déployable en un seul conteneur

## Prérequis

- Node.js ≥ 20.19
- pnpm ≥ 10 (`corepack enable`)
- Docker Desktop

---

## Setup local

### 1. Variables d'environnement

```bash
cp .env.example .env
# Éditer au minimum : POSTGRES_PASSWORD, ADMIN_PASSWORD, ADMIN_TOKEN_SECRET
```

Un seul `.env` à la racine — utilisé par Docker Compose, NestJS et Prisma CLI.

### 2. Installer les dépendances

```bash
pnpm install
```

### 3. Démarrer la base de données

```bash
pnpm dev:db
# Démarre postgres via Docker + applique le schéma Prisma (db push)
```

### 4. Seeder (première fois)

```bash
pnpm db:seed
# Injecte les thèmes, questions et centres de soin de démonstration
```

La seed est idempotente — sans effet si la base contient déjà des données.

### 5. Lancer les serveurs

```bash
# Terminal 1 — API (http://localhost:3000/api)
pnpm dev:backend

# Terminal 2 — Frontend (http://localhost:5173)
pnpm dev:frontend
```

---

## Docker (production / Coolify)

```bash
cp .env.example .env
# Renseigner POSTGRES_PASSWORD, ADMIN_PASSWORD, ADMIN_TOKEN_SECRET

docker compose up --build -d
```

Au démarrage, le conteneur exécute automatiquement `prisma migrate deploy` (idempotent) puis `prisma db seed`.

App disponible sur [http://localhost:3000](http://localhost:3000)

---

## Migrations Prisma

| Contexte                | Commande                                                            |
| ----------------------- | ------------------------------------------------------------------- |
| Dev local (sync rapide) | `pnpm db:push`                                                      |
| Préparer une migration  | `pnpm db:migrate` → génère le SQL dans `backend/prisma/migrations/` |
| Production              | automatique via `entrypoint.sh` → `prisma migrate deploy`           |

---

## API

### Publique

| Méthode | Route              | Description             |
| ------- | ------------------ | ----------------------- |
| GET     | `/api/health`      | Health check            |
| GET     | `/api/centers`     | Liste des centres       |
| GET     | `/api/centers/:id` | Détail d'un centre      |
| GET     | `/api/forms`       | Thèmes et questions     |
| POST    | `/api/forms`       | Soumettre un formulaire |

### Admin (JWT requis)

| Méthode | Route                        | Description                       |
| ------- | ---------------------------- | --------------------------------- |
| POST    | `/api/admin/login`           | Obtenir un token                  |
| GET     | `/api/admin/audits`          | Liste des audits                  |
| GET     | `/api/admin/audits/:id`      | Détail d'un audit                 |
| PATCH   | `/api/admin/audits/:id`      | Mettre à jour un audit            |
| POST    | `/api/admin/audits/generate` | Générer un audit depuis les forms |
| GET     | `/api/admin/centers`         | Liste des centres (admin)         |
| POST    | `/api/admin/centers`         | Créer un centre                   |
| PATCH   | `/api/admin/centers/:id`     | Modifier un centre                |
| DELETE  | `/api/admin/centers/:id`     | Supprimer un centre               |

---

## Stack

- **Backend** : NestJS 11, Prisma 5, PostgreSQL 16
- **Frontend** : Vue 3, Vite, TypeScript
- **Auth** : JWT via `@nestjs/jwt`
- **Déploiement** : Docker multi-stage, Coolify (Docker Compose mode)
