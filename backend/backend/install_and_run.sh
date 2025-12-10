#!/bin/bash

echo "🔧 Fixing repository issues..."
sudo add-apt-repository --remove ppa:strukturag/libde265 -y 2>/dev/null || true

echo "📦 Updating package lists..."
sudo apt update

echo "🚀 Installing PHP and extensions..."
sudo apt install -y php php-cli php-mbstring php-xml php-mysql php-curl php-zip php-sqlite3

echo "📥 Installing Composer..."
if ! command -v composer &> /dev/null; then
    curl -sS https://getcomposer.org/installer | php
    sudo mv composer.phar /usr/local/bin/composer
    sudo chmod +x /usr/local/bin/composer
fi

echo "✅ Installation complete!"
echo ""
echo "🎯 Starting backend setup..."

cd "$(dirname "$0")"

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
USER_COUNT=$(php artisan tinker --execute="echo App\Models\User::count();" 2>/dev/null | tail -1)
if [ "$USER_COUNT" = "0" ] || [ -z "$USER_COUNT" ]; then
    echo "Seeding database..."
    php artisan db:seed --force
fi

# Start server
echo ""
echo "✅ Backend is ready!"
echo "🚀 Starting Laravel server on http://localhost:8000"
echo "📝 Default login: admin@example.com / password"
echo ""
php artisan serve

