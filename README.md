# Authentication with CRUD and Role-Based Access Control (RBAC)

A full-stack application with user authentication, CRUD operations, and comprehensive role-based access control system.

## 🚀 Features

- **User Authentication** - Secure login/logout with Laravel Sanctum
- **Role-Based Access Control** - Granular permissions system
- **User Management** - Create, read, update, delete users
- **Role Management** - Create and manage roles with permissions
- **Permission Management** - Create and manage system permissions
- **Real-time Permission Updates** - Automatic permission refresh
- **Responsive UI** - Modern Vue 3 interface with Tailwind CSS

## 📋 Prerequisites

- PHP 8.1 or higher
- Composer
- Node.js 16+ and npm
- SQLite (or MySQL/PostgreSQL)

## 🛠️ Installation

### Backend Setup

```bash
cd backend/backend
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate --seed
php artisan serve
```

Backend will run on: http://localhost:8000

### Frontend Setup

```bash
cd frontend/frontend
npm install
npm run dev
```

Frontend will run on: http://localhost:5173

## 🚀 Quick Start (Run Both Servers)

### Option 1: Using the run script

```bash
chmod +x run.sh
./run.sh
```

### Option 2: Run separately

**Terminal 1 - Backend:**
```bash
cd backend/backend && php artisan serve
```

**Terminal 2 - Frontend:**
```bash
cd frontend/frontend && npm run dev
```

## 👤 Default Users

- **Admin**: `admin@example.com` / `password` (Full access)
- **Manager**: `manager@example.com` / `password` (Limited edit access)
- **User**: `user@example.com` / `password` (Dashboard only)
- **Viewer**: `viewer@example.com` / `password` (Read-only access)

## 🔐 Permissions

### User Management
- `view_users` - View users list
- `create_users` - Create new users
- `edit_users` - Edit existing users
- `delete_users` - Delete users
- `manage_users` - Full user management access

### Role Management
- `view_roles` - View roles list
- `create_roles` - Create new roles
- `edit_roles` - Edit role details
- `delete_roles` - Delete roles
- `assign_permissions` - Assign/revoke permissions to roles
- `manage_roles` - Full role management access

### Permission Management
- `view_permissions` - View permissions list
- `create_permissions` - Create new permissions
- `edit_permissions` - Edit permission details
- `delete_permissions` - Delete permissions
- `manage_permissions` - Full permission management access

### Dashboard & Account
- `view_dashboard` - Access dashboard
- `manage_account` - Manage own account

## 🏗️ Tech Stack

### Backend
- Laravel 11
- Laravel Sanctum (Authentication)
- SQLite Database
- PHP 8.1+

### Frontend
- Vue 3 (Composition API)
- Vue Router
- Axios
- Tailwind CSS
- Vite
- Chart.js

## 📁 Project Structure

```
.
├── backend/
│   └── backend/          # Laravel application
│       ├── app/
│       ├── database/
│       ├── routes/
│       └── ...
├── frontend/
│   └── frontend/          # Vue 3 application
│       ├── src/
│       │   ├── components/
│       │   ├── router/
│       │   ├── api/
│       │   └── utils/
│       └── ...
├── run.sh                 # Script to run both servers
└── README.md
```

## 🔄 Real-time Permission Updates

The system includes real-time permission refresh:
- Auto-refresh every 30 seconds
- Manual refresh button in sidebar
- Event-driven updates when admin changes permissions
- Multi-tab synchronization

## 📝 API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/logout` - User logout

### Users
- `GET /api/users` - List users (requires `view_users`)
- `POST /api/users` - Create user (requires `create_users`)
- `GET /api/users/{id}` - Get user (requires `view_users`)
- `PUT /api/users/{id}` - Update user (requires `edit_users`)
- `DELETE /api/users/{id}` - Delete user (requires `delete_users`)

### Roles
- `GET /api/roles` - List roles (requires `view_roles`)
- `POST /api/roles` - Create role (requires `create_roles`)
- `PUT /api/roles/{id}` - Update role (requires `edit_roles`)
- `DELETE /api/roles/{id}` - Delete role (requires `delete_roles`)
- `PUT /api/role/permissions` - Sync role permissions (requires `assign_permissions`)

### Permissions
- `GET /api/permissions` - List permissions (requires `view_permissions`)
- `POST /api/permissions` - Create permission (requires `create_permissions`)
- `PUT /api/permissions/{id}` - Update permission (requires `edit_permissions`)
- `DELETE /api/permissions/{id}` - Delete permission (requires `delete_permissions`)

### Account
- `GET /api/account` - Get current user account
- `PUT /api/account` - Update current user account

## 🧪 Testing

```bash
# Backend tests
cd backend/backend
php artisan test

# Frontend (if tests are set up)
cd frontend/frontend
npm run test
```

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Development

### Adding New Permissions

1. Add permission to database seeder
2. Update routes with permission middleware
3. Update frontend router with permission checks
4. Update sidebar visibility rules

### Adding New Roles

1. Create role in database seeder
2. Assign appropriate permissions
3. Create test user with new role

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

