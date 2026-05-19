#!/bin/sh
set -e

echo "Applying database schema..."
node_modules/.bin/prisma db push

echo "Starting server..."
exec node dist/src/main.js
