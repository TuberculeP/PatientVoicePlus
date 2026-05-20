#!/bin/sh
if [ -f "dist/prisma/seed.js" ]; then
  node dist/prisma/seed.js
else
  ts-node prisma/seed.ts
fi
