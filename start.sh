#!/bin/bash
set -e

echo "Starting application..."

# Clear and cache config
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Create storage link
php artisan storage:link || true

# Run migrations
php artisan migrate --force

# Start the server
echo "Starting PHP server on port ${PORT:-8080}..."
exec php artisan serve --host=0.0.0.0 --port=${PORT:-8080}
