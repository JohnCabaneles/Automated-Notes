#!/bin/bash

# Exit on error
set -e

echo "Installing PHP dependencies..."
composer install --no-dev --optimize-autoloader

echo "Installing Node dependencies..."
npm install

echo "Building frontend assets..."
npm run build

echo "Setting up database..."
mkdir -p database
touch database/database.sqlite

echo "Setting permissions..."
chmod -R 775 storage bootstrap/cache database

echo "Clearing caches..."
php artisan config:clear
php artisan cache:clear

echo "Build completed successfully!"
