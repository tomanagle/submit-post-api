#!/bin/bash

# export SITE_ADDRESS=example.com

echo "Pulling"
git pull

echo "Building application"
docker-compose up -d --build



safeandvaxxed.com