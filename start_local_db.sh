#!/bin/sh
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

docker compose -f "$SCRIPT_DIR/docker-compose.yml" -f "$SCRIPT_DIR/docker-compose.local.yml" up db --force-recreate -d

echo "Waiting for database to be ready..."
until docker compose -f "$SCRIPT_DIR/docker-compose.yml" -f "$SCRIPT_DIR/docker-compose.local.yml" ps db | grep -q "healthy"; do
  sleep 1
done

echo "Applying schema..."
pnpm --filter backend db:push
