# ── Stage 1: Build Vue frontend ─────────────────────────────────────────────
FROM node:22-alpine AS frontend-builder
WORKDIR /app

COPY frontend/package*.json ./
RUN NODE_ENV=development npm ci

COPY frontend/ ./
RUN npm run build-only

# ── Stage 2: Build NestJS backend ────────────────────────────────────────────
FROM node:22-alpine AS backend-builder
WORKDIR /app

COPY backend/package*.json ./
RUN NODE_ENV=development npm ci

COPY backend/ ./

RUN npx prisma generate
RUN npm run build
RUN npm prune --omit=dev

# ── Stage 3: Production image ─────────────────────────────────────────────────
FROM node:22-alpine AS production
ENV NODE_ENV=production

# OpenSSL required by Prisma query engine
RUN apk add --no-cache openssl

# Create non-root user before copying files
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy files with correct ownership
COPY --from=backend-builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=backend-builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=backend-builder --chown=appuser:appgroup /app/prisma ./prisma
COPY --from=backend-builder --chown=appuser:appgroup /app/package.json ./package.json

# Vue build output — join(__dirname='dist/src', '../..', 'frontend-dist') = /app/frontend-dist
COPY --from=frontend-builder --chown=appuser:appgroup /app/dist ./frontend-dist

COPY --chown=appuser:appgroup entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["sh", "entrypoint.sh"]
