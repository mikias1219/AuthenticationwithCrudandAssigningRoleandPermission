# GitHub Setup Instructions

## Steps to Push to GitHub

### 1. Create a New Repository on GitHub
- Go to https://github.com/new
- Create a new repository (e.g., `authentication-rbac-system`)
- **DO NOT** initialize with README, .gitignore, or license (we already have these)

### 2. Push to GitHub

Run these commands in your terminal:

```bash
cd /home/mikias/Mikias/Work/Projects/AuthenticationwithCrudandAssigningRoleandPermission

# Add remote repository (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. Alternative: Using SSH

If you prefer SSH:

```bash
git remote add origin git@github.com:YOUR_USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

## What's Included

✅ `.gitignore` - Excludes node_modules, vendor, .env, and other unnecessary files
✅ `README.md` - Complete project documentation
✅ `run.sh` - Script to run both backend and frontend servers
✅ All source code (frontend and backend)
✅ Database migrations and seeders

## Excluded from Git

- `node_modules/` - Frontend dependencies
- `vendor/` - Backend dependencies
- `.env` files - Environment configuration
- `database.sqlite` - Database file
- IDE configuration files
- Log files

## After Pushing

1. Clone on another machine:
   ```bash
   git clone https://github.com/YOUR_USERNAME/REPO_NAME.git
   cd REPO_NAME
   ```

2. Setup backend:
   ```bash
   cd backend/backend
   composer install
   cp .env.example .env
   php artisan key:generate
   touch database/database.sqlite
   php artisan migrate --seed
   ```

3. Setup frontend:
   ```bash
   cd frontend/frontend
   npm install
   ```

4. Run both:
   ```bash
   ./run.sh
   ```

