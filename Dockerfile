# ── Stage 1: Build Vue frontend ─────────────────────────────────────────────
FROM node:22-alpine AS frontend-builder
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY frontend/package.json ./frontend/package.json
COPY backend/package.json ./backend/package.json

RUN pnpm install --filter frontend --frozen-lockfile

COPY frontend/ ./frontend/
RUN pnpm --filter frontend run build-only

# ── Stage 2: Build NestJS backend ────────────────────────────────────────────
FROM node:22-alpine AS backend-builder
WORKDIR /app

RUN corepack enable

COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json

# Full install for build (dev + prod)
RUN pnpm install --filter backend --frozen-lockfile

COPY backend/ ./backend/

RUN pnpm --filter backend run build

# Switch to prod-only deps then regenerate prisma client
RUN rm -rf node_modules && NODE_ENV=production pnpm install --filter backend --frozen-lockfile
RUN pnpm --filter backend exec -- prisma generate

# ── Stage 3: Production image ─────────────────────────────────────────────────
FROM node:22-alpine AS production
ENV NODE_ENV=production

# OpenSSL required by Prisma query engine
RUN apk add --no-cache openssl

# Create non-root user before copying files
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy files with correct ownership
COPY --from=backend-builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=backend-builder --chown=appuser:appgroup /app/backend/dist ./dist
COPY --from=backend-builder --chown=appuser:appgroup /app/backend/prisma ./prisma
COPY --from=backend-builder --chown=appuser:appgroup /app/backend/package.json ./package.json

# Vue build output — join(__dirname='dist/src', '../..', 'frontend-dist') = /app/frontend-dist
COPY --from=frontend-builder --chown=appuser:appgroup /app/frontend/dist ./frontend-dist

COPY --chown=appuser:appgroup entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["sh", "entrypoint.sh"]
