# Authentication with CRUD and Role-Based Access Control

## 📋 Project Overview

A full-stack web application demonstrating secure authentication, comprehensive CRUD operations, and fine-grained role-based access control (RBAC). The system separates frontend and backend concerns, implementing security at both API and UI levels.

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (Browser)                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Vue 3 SPA (Port 5173)                                │  │
│  │  ├── Vue Router (Route Guards)                        │  │
│  │  ├── Pinia Store (Auth State Management)              │  │
│  │  ├── Permission Utils (Access Control)                │  │
│  │  └── UI Components (Tailwind CSS)                      │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │ HTTP/REST API
                        │ (Bearer Token Authentication)
┌───────────────────────▼─────────────────────────────────────┐
│                  SERVER LAYER (Laravel)                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Laravel 11 API (Port 8000)                           │  │
│  │  ├── Sanctum Middleware (Token Validation)            │  │
│  │  ├── Permission Middleware (Access Control)           │  │
│  │  ├── Controllers (Business Logic)                     │  │
│  │  └── Eloquent Models (Data Access)                    │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────────┐
        │      SQLite Database                   │
        │  ┌─────────┐  ┌─────────┐  ┌─────────┐│
        │  │  Users  │  │  Roles  │  │Perms    ││
        │  └────┬────┘  └────┬────┘  └────┬────┘│
        │       │            │            │      │
        │       └────────────┼────────────┘      │
        │              (Many-to-Many)            │
        └───────────────────────────────────────┘
```

**Architecture Pattern**: RESTful API with Single Page Application (SPA)

## 📦 Tech Stack & Rationale

### Backend Stack
- **Laravel 11**: Modern PHP framework with built-in security features
- **Laravel Sanctum**: Lightweight token-based authentication (perfect for SPAs)
- **SQLite**: File-based database, no server setup required for development
- **Eloquent ORM**: Active Record pattern for database interactions

### Frontend Stack
- **Vue 3**: Progressive JavaScript framework with Composition API
- **Vue Router**: Client-side routing with navigation guards
- **Pinia**: Modern state management (replacement for Vuex)
- **Tailwind CSS**: Utility-first CSS framework for rapid UI development
- **Vite**: Fast build tool and dev server
- **Axios**: HTTP client for API communication

## 🔐 Authentication & Authorization Flow

### Step-by-Step Authentication Process

```
┌──────────┐
│   User   │
│ Enters   │
│ Credentials
└────┬─────┘
     │
     ▼
┌─────────────────────────────────────┐
│  1. POST /api/login                 │
│     { email, password }             │
└────┬────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│  2. Laravel Validates Credentials   │
│     - Checks user exists            │
│     - Verifies password hash        │
│     - Loads user role & permissions │
└────┬────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│  3. Sanctum Generates Token         │
│     - Creates personal access token  │
│     - Returns token + user data      │
└────┬────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│  4. Frontend Stores in localStorage  │
│     - Token: for API authentication │
│     - User: for permission checks   │
└────┬────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│  5. Subsequent API Requests         │
│     - Header: Authorization: Bearer  │
│     - Middleware validates token    │
│     - Permission middleware checks   │
└─────────────────────────────────────┘
```

### Authorization Layers

**Layer 1 - Backend API Protection:**
- Every protected route requires `auth:sanctum` middleware
- Token validation happens automatically
- Permission middleware checks user's role permissions

**Layer 2 - Frontend Route Guards:**
- Router checks authentication before navigation
- Permission-based route access control
- Automatic redirect if unauthorized

## 🗄️ Database Schema & Relationships

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    USERS TABLE                          │
│  ┌─────┐  ┌──────┐  ┌──────────┐  ┌─────────┐         │
│  │ id  │  │ name │  │  email   │  │ role_id │         │
│  └─────┘  └──────┘  └──────────┘  └────┬────┘         │
└─────────────────────────────────────────┼──────────────┘
                                           │
                                           │ belongsTo
                                           │ (Many-to-One)
                                           ▼
┌─────────────────────────────────────────────────────────┐
│                    ROLES TABLE                          │
│  ┌─────┐  ┌──────────┐                                 │
│  │ id  │  │   name   │                                 │
│  └─────┘  └──────────┘                                 │
└─────┬───────────────────────────────────────┬──────────┘
      │                                       │
      │ hasMany                               │ belongsToMany
      │                                       │ (Many-to-Many)
      │                                       │
      ▼                                       ▼
┌──────────┐                    ┌──────────────────────────┐
│  USERS   │                    │  ROLE_PERMISSIONS (Pivot) │
│  (Many)  │                    │  ┌─────────┐  ┌─────────┐│
└──────────┘                    │  │role_id  │  │perm_id  ││
                                │  └─────────┘  └────┬────┘│
                                └────────────────────┼──────┘
                                                     │
                                                     │ belongsToMany
                                                     │
                                                     ▼
                                ┌──────────────────────────┐
                                │   PERMISSIONS TABLE      │
                                │  ┌─────┐  ┌──────────┐  │
                                │  │ id  │  │   name   │  │
                                │  └─────┘  └──────────┘  │
                                └──────────────────────────┘
```

### Key Relationships Explained

1. **User → Role**: One user has one role (Many-to-One)
   - Each user is assigned a single role
   - Role determines user's access level

2. **Role → Permissions**: One role has many permissions (Many-to-Many)
   - Roles can have multiple permissions
   - Permissions can belong to multiple roles
   - Pivot table: `role_permissions`

3. **User Permissions**: Inherited through role
   - User gets all permissions assigned to their role
   - No direct user-permission relationship

## 🚀 Key Features & Capabilities

### 1. Secure Authentication System
- **Token-based Auth**: Laravel Sanctum provides secure API token authentication
- **Session Management**: Tokens stored securely in localStorage
- **Auto-logout**: Token expiration handling and automatic session cleanup
- **Password Security**: Bcrypt hashing for all passwords

### 2. User Management (CRUD)
- **Create**: Add new users with role assignment
- **Read**: View user list with role and permission details
- **Update**: Edit user information and role assignments
- **Delete**: Remove users from the system
- **Permission Checks**: Each operation requires specific permissions

### 3. Role Management
- **Role Creation**: Define custom roles with descriptive names
- **Permission Assignment**: Assign multiple permissions to roles
- **Role Editing**: Modify role names and permission sets
- **Role Deletion**: Remove roles (with user reassignment handling)

### 4. Permission System
- **Granular Control**: Separate permissions for view/create/edit/delete operations
- **Resource-based**: Permissions organized by resource (users, roles, permissions)
- **Dynamic Updates**: Real-time permission refresh without logout
- **Hierarchical**: Support for manage_* permissions (full access)

### 5. Multi-Layer Security
- **Backend Middleware**: API-level permission enforcement
- **Frontend Guards**: Route-level access control
- **UI Hiding**: Buttons/links hidden based on permissions
- **Error Handling**: Graceful handling of unauthorized access attempts

## 📁 Project Structure

```
backend/backend/          # Laravel API
  ├── app/Models/         # User, Role, Permission models
  ├── app/Http/Controllers/ # CRUD controllers
  ├── routes/api.php      # Protected API routes
  └── database/migrations/ # Schema definitions

frontend/frontend/        # Vue 3 SPA
  ├── src/components/pages/ # Dashboard, Users, Roles, Permissions
  ├── src/router/         # Route guards with permission checks
  ├── src/store/Auth.js   # Pinia store for auth state
  └── src/utils/permissions.js # Permission helper functions
```

## 🔑 Default Users & Roles

### Pre-configured Test Accounts

| Role | Email | Password | Permissions | Use Case |
|------|-------|----------|-------------|----------|
| **Admin** | `admin@example.com` | `password` | All permissions | Full system access, can manage everything |
| **Manager** | `manager@example.com` | `password` | View/Edit users, View roles/permissions | Can manage users but not roles/permissions |
| **User** | `user@example.com` | `password` | View dashboard only | Limited access, basic user experience |
| **Viewer** | `viewer@example.com` | `password` | View all resources (read-only) | Can see data but cannot modify anything |

### Role Hierarchy Example
```
Admin Role
├── All User Permissions (view, create, edit, delete, manage)
├── All Role Permissions (view, create, edit, delete, assign, manage)
├── All Permission Permissions (view, create, edit, delete, manage)
└── Dashboard & Account Access

Manager Role
├── User Permissions (view, edit)
├── View Roles & Permissions (read-only)
└── Dashboard & Account Access

User Role
└── Dashboard & Account Access Only

Viewer Role
├── View Users, Roles, Permissions (read-only)
└── Dashboard & Account Access
```

## 💼 Use Cases & Scenarios

### Scenario 1: New Employee Onboarding
1. Admin logs in with full access
2. Navigates to Users page
3. Creates new user account
4. Assigns appropriate role (e.g., "User" for basic access)
5. New employee can immediately log in with assigned permissions

### Scenario 2: Permission Update
1. Admin needs to grant editing rights to Manager role
2. Navigates to Roles page
3. Selects "Manager" role
4. Adds `edit_users` permission to role
5. All users with Manager role immediately gain edit access (no logout needed)

### Scenario 3: Restricted Access
1. Viewer role user logs in
2. Can see Users, Roles, Permissions lists
3. Cannot see "Create", "Edit", or "Delete" buttons
4. Attempting direct API access returns 403 Forbidden
5. Router prevents navigation to restricted routes

## 🛡️ Permission System Details

### Permission Categories

**User Management Permissions:**
- `view_users` - Can see the users list page
- `create_users` - Can add new users to the system
- `edit_users` - Can modify existing user information
- `delete_users` - Can remove users from the system
- `manage_users` - Full user management access (all above)

**Role Management Permissions:**
- `view_roles` - Can view roles list
- `create_roles` - Can create new roles
- `edit_roles` - Can modify role details
- `delete_roles` - Can remove roles
- `assign_permissions` - Can assign/revoke permissions to roles
- `manage_roles` - Full role management access

**Permission Management Permissions:**
- `view_permissions` - Can view permissions list
- `create_permissions` - Can create new permissions
- `edit_permissions` - Can modify permission details
- `delete_permissions` - Can remove permissions
- `manage_permissions` - Full permission management access

**General Permissions:**
- `view_dashboard` - Access to main dashboard
- `manage_account` - Manage own account settings

### Permission Inheritance
- Users inherit permissions from their assigned role
- No direct user-permission assignment
- Changes to role permissions affect all users with that role

## 🚦 How It Works - Detailed Workflow

### 1. User Login Process
```
User submits login form
    ↓
Frontend sends POST /api/login with credentials
    ↓
Backend validates email/password
    ↓
Laravel Sanctum creates personal access token
    ↓
Backend returns: { token, user: { id, name, email, role: { name, permissions } } }
    ↓
Frontend stores token & user data in localStorage
    ↓
Pinia store updates authentication state
    ↓
User redirected to dashboard
```

### 2. Protected API Request Flow
```
User clicks "View Users" button
    ↓
Frontend checks hasPermission('view_users')
    ↓
If authorized, sends GET /api/users with Authorization header
    ↓
Backend Sanctum middleware validates token
    ↓
Permission middleware checks user's role permissions
    ↓
If permission exists, controller executes
    ↓
Database query retrieves users
    ↓
JSON response sent to frontend
    ↓
Vue component updates with data
```

### 3. Frontend Route Protection
```
User navigates to /users route
    ↓
Vue Router beforeEach guard triggers
    ↓
Checks if token exists (authentication)
    ↓
Checks if user has 'view_users' permission
    ↓
If authorized: Allow navigation
    ↓
If unauthorized: Redirect to dashboard or account page
```

### 4. Real-time Permission Updates
- **Auto-refresh**: Every 30 seconds, frontend fetches updated user data
- **Manual refresh**: Sidebar button triggers immediate permission update
- **Multi-tab sync**: Changes in one tab reflect in others
- **No logout required**: Permission changes take effect immediately

## 🏃 Quick Start Guide

### Prerequisites Check
```bash
# Verify PHP version (8.1+)
php -v

# Verify Composer installed
composer --version

# Verify Node.js version (16+)
node -v
npm -v
```

### Installation Steps

**Step 1: Backend Setup**
```bash
cd backend/backend
composer install                    # Install PHP dependencies
cp .env.example .env               # Create environment file
php artisan key:generate           # Generate application key
touch database/database.sqlite     # Create SQLite database
php artisan migrate --seed         # Run migrations & seed data
php artisan serve                  # Start server on :8000
```

**Step 2: Frontend Setup**
```bash
cd frontend/frontend
npm install                        # Install Node dependencies
npm run dev                        # Start dev server on :5173
```

**Step 3: Access Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Login with: `admin@example.com` / `password`

### Alternative: One-Command Start
```bash
chmod +x run.sh
./run.sh                           # Runs both servers simultaneously
```

## 🔒 Security Features

### Backend Security
- **Password Hashing**: Bcrypt algorithm (cost factor 10)
- **Token Authentication**: Laravel Sanctum personal access tokens
- **CORS Protection**: Configured for frontend origin only
- **SQL Injection Prevention**: Eloquent ORM parameter binding
- **XSS Protection**: Laravel's built-in output escaping
- **CSRF Protection**: Token-based for state-changing operations

### Frontend Security
- **Token Storage**: Secure localStorage (consider httpOnly cookies for production)
- **Route Guards**: Prevent unauthorized navigation
- **Permission Checks**: UI elements hidden based on permissions
- **API Error Handling**: Graceful handling of 401/403 responses
- **Auto-logout**: On token expiration or invalid response

### Best Practices Implemented
- Principle of Least Privilege: Users only get necessary permissions
- Defense in Depth: Multiple security layers (frontend + backend)
- Secure by Default: All routes protected unless explicitly public
- Input Validation: Both client-side and server-side validation

## 📊 Complete Data Flow Example

### Scenario: Admin Creates a New User

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER INTERACTION                                         │
│    Admin fills "Create User" form and clicks Submit        │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. FRONTEND VALIDATION                                       │
│    - Form validation (email format, required fields)        │
│    - Permission check: hasPermission('create_users')         │
│    - If authorized, proceed to API call                    │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. API REQUEST (Axios)                                       │
│    POST /api/users                                           │
│    Headers: {                                                │
│      Authorization: Bearer {token}                          │
│      Content-Type: application/json                         │
│    }                                                         │
│    Body: { name, email, password, role_id }                 │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. BACKEND MIDDLEWARE CHAIN                                  │
│    a) Sanctum Middleware: Validates token                   │
│    b) Permission Middleware: Checks 'create_users'          │
│    c) If both pass, route to controller                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. CONTROLLER LOGIC (UserController@store)                   │
│    - Validates request data                                  │
│    - Hashes password                                         │
│    - Creates user via Eloquent Model                        │
│    - Loads user with role relationship                      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. DATABASE OPERATION                                        │
│    INSERT INTO users (name, email, password, role_id)        │
│    Returns: New user record with ID                         │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. API RESPONSE                                              │
│    Status: 201 Created                                       │
│    Body: {                                                   │
│      id, name, email, role: { id, name, permissions }       │
│    }                                                         │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. FRONTEND STATE UPDATE                                     │
│    - Pinia store updates users list                         │
│    - Component re-renders with new data                     │
│    - Success notification displayed                         │
│    - Form reset                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🔌 API Endpoints Reference

### Authentication Endpoints
- `POST /api/login` - Authenticate user, returns token
- `POST /api/logout` - Invalidate current token

### User Management Endpoints
- `GET /api/users` - List all users (requires: `view_users`)
- `POST /api/users` - Create user (requires: `create_users`)
- `GET /api/users/{id}` - Get user details (requires: `view_users`)
- `PUT /api/users/{id}` - Update user (requires: `edit_users`)
- `DELETE /api/users/{id}` - Delete user (requires: `delete_users`)

### Role Management Endpoints
- `GET /api/roles` - List all roles (requires: `view_roles`)
- `POST /api/roles` - Create role (requires: `create_roles`)
- `PUT /api/roles/{id}` - Update role (requires: `edit_roles`)
- `DELETE /api/roles/{id}` - Delete role (requires: `delete_roles`)
- `PUT /api/role/permissions` - Sync role permissions (requires: `assign_permissions`)

### Permission Management Endpoints
- `GET /api/permissions` - List all permissions (requires: `view_permissions`)
- `POST /api/permissions` - Create permission (requires: `create_permissions`)
- `PUT /api/permissions/{id}` - Update permission (requires: `edit_permissions`)
- `DELETE /api/permissions/{id}` - Delete permission (requires: `delete_permissions`)

### Account Endpoints
- `GET /api/account` - Get current user account (authenticated users)
- `PUT /api/account` - Update current user account (authenticated users)

## 📈 Project Highlights

### Key Achievements
✅ **Full-Stack Implementation**: Complete separation of frontend and backend  
✅ **Secure Authentication**: Token-based auth with Laravel Sanctum  
✅ **Granular RBAC**: Fine-grained permission system with role inheritance  
✅ **Real-time Updates**: Permission changes without logout  
✅ **Multi-Layer Security**: Protection at API, route, and UI levels  
✅ **Modern Tech Stack**: Latest versions of Laravel, Vue 3, and modern tooling  
✅ **RESTful API**: Clean, standardized API endpoints  
✅ **Responsive UI**: Modern interface with Tailwind CSS  

### Technical Excellence
- **Clean Architecture**: Separation of concerns (Models, Controllers, Middleware)
- **Type Safety**: Proper data validation and type checking
- **Error Handling**: Comprehensive error responses and user feedback
- **Code Organization**: Modular structure for maintainability
- **Database Design**: Normalized schema with proper relationships

## 🎯 Summary

This project demonstrates a production-ready authentication and authorization system with:

1. **Secure User Authentication** using Laravel Sanctum tokens
2. **Comprehensive CRUD Operations** for Users, Roles, and Permissions
3. **Role-Based Access Control** with granular permission management
4. **Multi-Layer Security** implemented at both frontend and backend
5. **Modern Full-Stack Architecture** using Laravel 11 and Vue 3

The system is designed to be scalable, maintainable, and secure, following industry best practices for web application development. It serves as an excellent foundation for any application requiring user management and access control.

