#!/bin/bash

cd "$(dirname "$0")"

# Check if PHP is installed
if ! command -v php &> /dev/null; then
    echo "PHP is not installed. Please install it first:"
    echo "sudo apt update && sudo apt install -y php php-cli php-mbstring php-xml php-mysql php-curl php-zip php-sqlite3"
    exit 1
fi

# Check if Composer is installed
if ! command -v composer &> /dev/null; then
    echo "Composer is not installed. Installing..."
    curl -sS https://getcomposer.org/installer | php
    sudo mv composer.phar /usr/local/bin/composer
    sudo chmod +x /usr/local/bin/composer
fi

# Install dependencies if vendor doesn't exist
if [ ! -d "vendor" ] || [ ! -f "vendor/autoload.php" ]; then
    echo "Installing Composer dependencies..."
    composer install --no-interaction
fi

# Generate key if not set
if ! grep -q "APP_KEY=base64" .env 2>/dev/null; then
    echo "Generating application key..."
    php artisan key:generate --force
fi

# Create database if it doesn't exist
if [ ! -f "database/database.sqlite" ]; then
    echo "Creating database..."
    touch database/database.sqlite
    chmod 664 database/database.sqlite
fi

# Run migrations
echo "Running migrations..."
php artisan migrate --force

# Seed database if needed
if php artisan tinker --execute="echo App\Models\User::count();" 2>/dev/null | grep -q "^0$"; then
    echo "Seeding database..."
    php artisan db:seed --force
fi

# Start server
echo "Starting Laravel server on http://localhost:8000"
echo "Default login: admin@example.com / password"
php artisan serve

