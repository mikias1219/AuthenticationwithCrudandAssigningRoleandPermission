#!/bin/bash

echo "🚀 Setting up Laravel Backend..."

# Check if PHP is installed
if ! command -v php &> /dev/null; then
    echo "❌ PHP is not installed."
    echo "📦 Installing PHP and required extensions..."
    sudo apt update
    sudo apt install -y php php-cli php-mbstring php-xml php-mysql php-curl php-zip php-sqlite3
fi

# Check if Composer is installed
if ! command -v composer &> /dev/null; then
    echo "❌ Composer is not installed."
    echo "📦 Installing Composer..."
    curl -sS https://getcomposer.org/installer | php
    sudo mv composer.phar /usr/local/bin/composer
    sudo chmod +x /usr/local/bin/composer
fi

echo "✅ PHP version: $(php --version | head -1)"
echo "✅ Composer version: $(composer --version | head -1)"

# Install dependencies
echo "📦 Installing Composer dependencies..."
composer install --no-interaction

# Create .env if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
fi

# Generate application key
echo "🔑 Generating application key..."
php artisan key:generate --force

# Create SQLite database
echo "💾 Setting up database..."
mkdir -p database
touch database/database.sqlite
chmod 664 database/database.sqlite

# Run migrations
echo "🗄️  Running database migrations..."
php artisan migrate --force

# Seed database
echo "🌱 Seeding database..."
php artisan db:seed --force

echo "✅ Setup complete!"
echo ""
echo "🎯 To start the server, run:"
echo "   php artisan serve"
echo ""
echo "📝 Default login credentials:"
echo "   Email: admin@example.com"
echo "   Password: password"

