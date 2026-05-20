#!/bin/sh
docker compose -f docker-compose.yml -f docker-compose.local.yml up db --build --force-recreate -d