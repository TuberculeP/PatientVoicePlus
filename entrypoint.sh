#!/bin/sh
set -e

echo "Running database migrations..."
node_modules/.bin/prisma migrate deploy

echo "Seeding database if empty..."
node_modules/.bin/prisma db seed

echo "Starting server..."
exec node dist/src/main.js
