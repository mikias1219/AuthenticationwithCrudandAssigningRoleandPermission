#!/bin/bash

# Script to run both frontend and backend servers
# Usage: ./run.sh

echo "🚀 Starting Authentication with CRUD and Role-Based Access Control System"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Shutting down servers...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit
}

# Trap Ctrl+C
trap cleanup SIGINT SIGTERM

# Check if backend directory exists
if [ ! -d "backend/backend" ]; then
    echo -e "${YELLOW}Backend directory not found. Please ensure backend is set up.${NC}"
    exit 1
fi

# Check if frontend directory exists
if [ ! -d "frontend/frontend" ]; then
    echo -e "${YELLOW}Frontend directory not found. Please ensure frontend is set up.${NC}"
    exit 1
fi

# Start Backend
echo -e "${BLUE}📦 Starting Backend Server (Laravel)...${NC}"
cd backend/backend

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating from .env.example...${NC}"
    if [ -f ".env.example" ]; then
        cp .env.example .env
        php artisan key:generate
    else
        echo "DB_CONNECTION=sqlite" > .env
        echo "DB_DATABASE=$(pwd)/database/database.sqlite" >> .env
        php artisan key:generate
    fi
fi

# Check if database exists
if [ ! -f "database/database.sqlite" ]; then
    echo -e "${YELLOW}📊 Creating database...${NC}"
    touch database/database.sqlite
    php artisan migrate --force
    php artisan db:seed --force
fi

# Start Laravel server
php artisan serve > /dev/null 2>&1 &
BACKEND_PID=$!
cd ../..

# Wait a moment for backend to start
sleep 2

# Start Frontend
echo -e "${BLUE}🎨 Starting Frontend Server (Vue 3 + Vite)...${NC}"
cd frontend/frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    npm install
fi

# Start Vite dev server
npm run dev > /dev/null 2>&1 &
FRONTEND_PID=$!
cd ../..

# Wait a moment for frontend to start
sleep 3

# Display status
echo ""
echo -e "${GREEN}✅ Servers are running!${NC}"
echo ""
echo -e "${GREEN}Backend:${NC}  http://localhost:8000"
echo -e "${GREEN}Frontend:${NC} http://localhost:5173"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop both servers${NC}"
echo ""

# Wait for processes
wait

