# Permission Core Functionality - Complete Code Reference

This document shows **exactly where** each permission is enforced and how the core permission system works.

---

## 🔑 Core Permission System Components

### 1. Backend Permission Middleware (THE CORE)

**Location**: `backend/backend/app/Http/Middleware/CheckPermission.php`

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    /**
     * 🔑 THIS IS THE CORE FUNCTION THAT ENFORCES ALL PERMISSIONS
     * 
     * @param Request $request
     * @param Closure $next
     * @param string $permission - The permission name (e.g., 'view_users', 'create_users')
     * @return Response
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        // 🔑 KEY: Load user's role and permissions from database
        $user->load('role.permissions');
        
        // 🔑 KEY: Check if user has the required permission through their role
        $hasPermission = $user->role && 
                         $user->role->permissions->contains('name', $permission);
        
        if (!$hasPermission) {
            return response()->json([
                'message' => 'You do not have permission to perform this action.',
                'required_permission' => $permission
            ], 403);
        }

        return $next($request);
    }
}
```

**How it works**:
1. Gets the authenticated user from the request
2. Loads user's role and all permissions from database
3. Checks if the permission name exists in the user's role permissions
4. If **NO**: Returns 403 Forbidden
5. If **YES**: Allows request to continue to controller

---

### 2. Middleware Registration

**Location**: `backend/backend/bootstrap/app.php`

```php
// Lines 19-22: Register permission middleware
$middleware->alias([
    'verified' => \App\Http\Middleware\EnsureEmailIsVerified::class,
    'permission' => \App\Http\Middleware\CheckPermission::class,  // 🔑 Registered here
]);
```

**How it works**:
- The `permission` alias maps to `CheckPermission` middleware
- Used in routes as: `->middleware('permission:view_users')`

---

### 3. Frontend Permission Check

**Location**: `frontend/frontend/src/utils/permissions.js`

```javascript
/**
 * 🔑 CORE FRONTEND PERMISSION CHECK FUNCTION
 * 
 * @param {string} permissionName - The permission to check (e.g., 'view_users')
 * @returns {boolean} - True if user has permission, false otherwise
 */
export function hasPermission(permissionName) {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;
    const user = JSON.parse(userStr);
    if (!user.role || !user.role.permissions) return false;
    // 🔑 KEY: Check if permission exists in user's role permissions
    return user.role.permissions.some(p => p.name === permissionName);
  } catch {
    return false;
  }
}
```

**How it works**:
1. Gets user data from localStorage
2. Checks if user has role and permissions
3. Searches for permission name in user's permissions array
4. Returns true/false

---

## 📋 Permission Mapping: Where Each Permission is Enforced

### User Management Permissions

#### `view_users` - Can see the users list page

**Backend Enforcement**:
```php
// Location: backend/backend/routes/api.php (Line 29)
Route::get('/users', [UserController::class, 'index'])
    ->middleware('permission:view_users');  // 🔑 Enforced here
```

**Controller Function**:
```php
// Location: backend/backend/app/Http/Controllers/UserController.php (Lines 12-16)
public function index()
{
    $users = User::with('role.permissions')->get();
    return response()->json($users);
}
```

**Frontend Check**:
```javascript
// Location: frontend/frontend/src/router/index.js (Line 37)
permission: "view_users"  // Route guard checks this

// Location: frontend/frontend/src/components/pages/Users.vue
// Used to show/hide UI elements
v-if="hasPermission('view_users')"
```

---

#### `create_users` - Can add new users to the system

**Backend Enforcement**:
```php
// Location: backend/backend/routes/api.php (Line 30)
Route::post('/users', [UserController::class, 'store'])
    ->middleware('permission:create_users');  // 🔑 Enforced here
```

**Controller Function**:
```php
// Location: backend/backend/app/Http/Controllers/UserController.php (Lines 18-33)
public function store(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|string|email|max:255|unique:users',
        'password' => 'required|string|min:8',
        'role_id' => 'required|exists:roles,id',
    ]);

    $validated['password'] = Hash::make($validated['password']);
    $user = User::create($validated);
    $user->load('role.permissions');

    return response()->json($user, 201);
}
```

**Frontend Check**:
```javascript
// Location: frontend/frontend/src/components/pages/Users.vue
// Used to show/hide "Create User" button
v-if="hasPermission('create_users')"
```

---

#### `edit_users` - Can modify existing user information

**Backend Enforcement**:
```php
// Location: backend/backend/routes/api.php (Line 32)
Route::put('/users/{user}', [UserController::class, 'update'])
    ->middleware('permission:edit_users');  // 🔑 Enforced here
```

**Controller Function**:
```php
// Location: backend/backend/app/Http/Controllers/UserController.php (Lines 41-58)
public function update(Request $request, User $user)
{
    $validated = $request->validate([
        'name' => 'sometimes|string|max:255',
        'email' => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
        'password' => 'sometimes|string|min:8',
        'role_id' => 'sometimes|exists:roles,id',
    ]);

    if (isset($validated['password'])) {
        $validated['password'] = Hash::make($validated['password']);
    }

    $user->update($validated);
    $user->load('role.permissions');

    return response()->json($user);
}
```

**Frontend Check**:
```javascript
// Location: frontend/frontend/src/components/pages/Users.vue
// Used to show/hide "Edit" button
v-if="hasPermission('edit_users')"
```

---

#### `delete_users` - Can remove users from the system

**Backend Enforcement**:
```php
// Location: backend/backend/routes/api.php (Line 33)
Route::delete('/users/{user}', [UserController::class, 'destroy'])
    ->middleware('permission:delete_users');  // 🔑 Enforced here
```

**Controller Function**:
```php
// Location: backend/backend/app/Http/Controllers/UserController.php (Lines 60-64)
public function destroy(User $user)
{
    $user->delete();
    return response()->json(['message' => 'User deleted successfully']);
}
```

**Frontend Check**:
```javascript
// Location: frontend/frontend/src/components/pages/Users.vue
// Used to show/hide "Delete" button
v-if="hasPermission('delete_users')"
```

---

#### `manage_users` - Full user management access (all above)

**Note**: `manage_users` is a **conceptual permission** that should grant all user-related permissions. However, in the current implementation, it's **NOT automatically checked**. 

**Current Implementation**:
- `manage_users` exists in the database seeder
- It's meant to be assigned to roles that should have full access
- **BUT**: The routes still check individual permissions (`view_users`, `create_users`, etc.)

**To make `manage_users` work automatically**, you would need to modify the middleware:

```php
// Enhanced CheckPermission middleware (not currently implemented)
public function handle(Request $request, Closure $next, string $permission): Response
{
    $user = $request->user();
    if (!$user) {
        return response()->json(['message' => 'Unauthenticated.'], 401);
    }

    $user->load('role.permissions');
    $permissions = $user->role->permissions->pluck('name')->toArray();
    
    // Check for specific permission OR manage_* permission
    $hasPermission = in_array($permission, $permissions) || 
                     in_array("manage_" . explode('_', $permission)[1] . "s", $permissions);
    
    if (!$hasPermission) {
        return response()->json([
            'message' => 'You do not have permission to perform this action.',
            'required_permission' => $permission
        ], 403);
    }

    return $next($request);
}
```

**Current Workaround**: Assign all individual permissions (`view_users`, `create_users`, `edit_users`, `delete_users`) to roles that should have `manage_users` access.

---

### Role Management Permissions

#### `view_roles` - Can view roles list

**Backend Enforcement**:
```php
// Location: backend/backend/routes/api.php (Line 36)
Route::get('/roles', [RoleController::class, 'index'])
    ->middleware('permission:view_roles');  // 🔑 Enforced here
```

**Controller Function**:
```php
// Location: backend/backend/app/Http/Controllers/RoleController.php (Lines 10-14)
public function index()
{
    $roles = Role::with(['permissions', 'users'])->get();
    return response()->json($roles);
}
```

**Frontend Check**:
```javascript
// Location: frontend/frontend/src/router/index.js (Line 47)
permission: "view_roles"  // Route guard

// Location: frontend/frontend/src/components/pages/Roles.vue
v-if="hasPermission('view_roles')"
```

---

#### `create_roles` - Can create new roles

**Backend Enforcement**:
```php
// Location: backend/backend/routes/api.php (Line 37)
Route::post('/roles', [RoleController::class, 'store'])
    ->middleware('permission:create_roles');  // 🔑 Enforced here
```

**Controller Function**:
```php
// Location: backend/backend/app/Http/Controllers/RoleController.php (Lines 16-26)
public function store(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255|unique:roles',
    ]);

    $role = Role::create($validated);
    $role->load(['permissions', 'users']);

    return response()->json($role, 201);
}
```

**Frontend Check**:
```javascript
// Location: frontend/frontend/src/components/pages/Roles.vue (Line 41)
v-if="hasPermission('create_roles')"  // Shows "Create new" button
```

---

#### `edit_roles` - Can modify role details

**Backend Enforcement**:
```php
// Location: backend/backend/routes/api.php (Line 39)
Route::put('/roles/{role}', [RoleController::class, 'update'])
    ->middleware('permission:edit_roles');  // 🔑 Enforced here
```

**Controller Function**:
```php
// Location: backend/backend/app/Http/Controllers/RoleController.php (Lines 34-44)
public function update(Request $request, Role $role)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255|unique:roles,name,' . $role->id,
    ]);

    $role->update($validated);
    $role->load(['permissions', 'users']);

    return response()->json($role);
}
```

**Frontend Check**:
```javascript
// Location: frontend/frontend/src/components/pages/Roles.vue (Line 87)
v-if="hasPermission('edit_roles') || hasPermission('assign_permissions')"  // Edit button
```

---

#### `delete_roles` - Can remove roles

**Backend Enforcement**:
```php
// Location: backend/backend/routes/api.php (Line 40)
Route::delete('/roles/{role}', [RoleController::class, 'destroy'])
    ->middleware('permission:delete_roles');  // 🔑 Enforced here
```

**Controller Function**:
```php
// Location: backend/backend/app/Http/Controllers/RoleController.php (Lines 46-50)
public function destroy(Role $role)
{
    $role->delete();
    return response()->json(['message' => 'Role deleted successfully']);
}
```

**Frontend Check**:
```javascript
// Location: frontend/frontend/src/components/pages/Roles.vue (Line 95)
v-if="hasPermission('delete_roles')"  // Delete button
```

---

#### `assign_permissions` - Can assign/revoke permissions to roles

**Backend Enforcement**:
```php
// Location: backend/backend/routes/api.php (Lines 41-43)
Route::post('/role/permissions', [RoleController::class, 'assignPermissions'])
    ->middleware('permission:assign_permissions');  // 🔑 Enforced here

Route::delete('/role/permissions', [RoleController::class, 'removePermissions'])
    ->middleware('permission:assign_permissions');  // 🔑 Enforced here

Route::put('/role/permissions', [RoleController::class, 'syncPermissions'])
    ->middleware('permission:assign_permissions');  // 🔑 Enforced here
```

**Controller Functions**:
```php
// Location: backend/backend/app/Http/Controllers/RoleController.php

// Lines 52-66: Assign permissions (add without removing)
public function assignPermissions(Request $request)
{
    $validated = $request->validate([
        'role_id' => 'required|exists:roles,id',
        'permissions' => 'required|array',
        'permissions.*' => 'exists:permissions,id',
    ]);

    $role = Role::findOrFail($validated['role_id']);
    $role->permissions()->syncWithoutDetaching($validated['permissions']);
    $role->load('permissions');
    return response()->json($role);
}

// Lines 68-81: Remove permissions
public function removePermissions(Request $request)
{
    $validated = $request->validate([
        'role_id' => 'required|exists:roles,id',
        'permissions' => 'required|array',
        'permissions.*' => 'exists:permissions,id',
    ]);

    $role = Role::findOrFail($validated['role_id']);
    $role->permissions()->detach($validated['permissions']);
    $role->load('permissions');
    return response()->json($role);
}

// Lines 83-97: Sync permissions (replace all)
public function syncPermissions(Request $request)
{
    $validated = $request->validate([
        'role_id' => 'required|exists:roles,id',
        'permissions' => 'required|array',
        'permissions.*' => 'exists:permissions,id',
    ]);

    $role = Role::findOrFail($validated['role_id']);
    $role->permissions()->sync($validated['permissions']);
    $role->load('permissions');
    return response()->json($role);
}
```

**Frontend Check**:
```javascript
// Location: frontend/frontend/src/components/pages/Roles.vue (Line 140)
v-if="hasPermission('assign_permissions')"  // Shows permission checkboxes
```

---

#### `manage_roles` - Full role management access

**Note**: Same as `manage_users` - it's a conceptual permission that should grant all role-related permissions, but currently requires assigning all individual permissions.

---

### Permission Management Permissions

#### `view_permissions` - Can view permissions list

**Backend Enforcement**:
```php
// Location: backend/backend/routes/api.php (Line 46)
Route::get('/permissions', [PermissionController::class, 'index'])
    ->middleware('permission:view_permissions');  // 🔑 Enforced here
```

**Controller Function**:
```php
// Location: backend/backend/app/Http/Controllers/PermissionController.php (Lines 10-14)
public function index()
{
    $permissions = Permission::all();
    return response()->json($permissions);
}
```

**Frontend Check**:
```javascript
// Location: frontend/frontend/src/router/index.js (Line 57)
permission: "view_permissions"  // Route guard
```

---

#### `create_permissions` - Can create new permissions

**Backend Enforcement**:
```php
// Location: backend/backend/routes/api.php (Line 47)
Route::post('/permissions', [PermissionController::class, 'store'])
    ->middleware('permission:create_permissions');  // 🔑 Enforced here
```

**Controller Function**:
```php
// Location: backend/backend/app/Http/Controllers/PermissionController.php (Lines 16-27)
public function store(Request $request)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255|unique:permissions',
        'guard_name' => 'sometimes|string|max:255',
    ]);

    $validated['guard_name'] = $validated['guard_name'] ?? 'web';
    $permission = Permission::create($validated);
    return response()->json($permission, 201);
}
```

---

#### `edit_permissions` - Can modify permission details

**Backend Enforcement**:
```php
// Location: backend/backend/routes/api.php (Line 49)
Route::put('/permissions/{permission}', [PermissionController::class, 'update'])
    ->middleware('permission:edit_permissions');  // 🔑 Enforced here
```

**Controller Function**:
```php
// Location: backend/backend/app/Http/Controllers/PermissionController.php (Lines 34-43)
public function update(Request $request, Permission $permission)
{
    $validated = $request->validate([
        'name' => 'required|string|max:255|unique:permissions,name,' . $permission->id,
        'guard_name' => 'sometimes|string|max:255',
    ]);

    $permission->update($validated);
    return response()->json($permission);
}
```

---

#### `delete_permissions` - Can remove permissions

**Backend Enforcement**:
```php
// Location: backend/backend/routes/api.php (Line 50)
Route::delete('/permissions/{permission}', [PermissionController::class, 'destroy'])
    ->middleware('permission:delete_permissions');  // 🔑 Enforced here
```

**Controller Function**:
```php
// Location: backend/backend/app/Http/Controllers/PermissionController.php (Lines 45-49)
public function destroy(Permission $permission)
{
    $permission->delete();
    return response()->json(['message' => 'Permission deleted successfully']);
}
```

---

#### `manage_permissions` - Full permission management access

**Note**: Same as other `manage_*` permissions - conceptual, requires assigning all individual permissions.

---

### General Permissions

#### `view_dashboard` - Access to main dashboard

**Backend Enforcement**:
- **No backend enforcement** - Dashboard is a frontend-only route
- Backend API calls made from dashboard may require other permissions

**Frontend Check**:
```javascript
// Location: frontend/frontend/src/router/index.js (Line 27)
permission: "view_dashboard"  // Route guard

// Location: frontend/frontend/src/components/pages/Dashboard.vue
// Used to control dashboard access
```

---

#### `manage_account` - Manage own account settings

**Backend Enforcement**:
```php
// Location: backend/backend/routes/api.php (Lines 25-26)
// Note: NO permission middleware - accessible to all authenticated users
Route::get('/account', [AccountController::class, 'show']);
Route::put('/account', [AccountController::class, 'update']);
```

**Controller Functions**:
```php
// Location: backend/backend/app/Http/Controllers/AccountController.php

// Lines 11-15: Get account
public function show(Request $request)
{
    $user = $request->user()->load('role.permissions');
    return response()->json($user);
}

// Lines 17-46: Update account
public function update(Request $request)
{
    // ... validation and update logic
    $user->update($validated);
    $user->load('role.permissions');
    return response()->json([
        'message' => 'Account updated successfully',
        'user' => $user,
    ]);
}
```

**Note**: Account endpoints are accessible to **all authenticated users** without permission check, as everyone should be able to manage their own account.

---

## 🔄 Complete Permission Check Flow

```
┌─────────────────────────────────────────────────────────────┐
│ USER ATTEMPTS ACTION (e.g., Create User)                    │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND CHECK (Optional - UX Only)                          │
│ Location: frontend/src/utils/permissions.js                  │
│ hasPermission('create_users') → checks localStorage           │
│ If false: Button hidden (but can still try API call)         │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ API REQUEST                                                   │
│ POST /api/users                                               │
│ Headers: Authorization: Bearer {token}                       │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ SANCTUM MIDDLEWARE                                            │
│ Validates token, loads authenticated user                    │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ PERMISSION MIDDLEWARE (THE CORE)                              │
│ Location: backend/app/Http/Middleware/CheckPermission.php    │
│                                                                 │
│ 1. Gets user from request                                     │
│ 2. Loads: user->load('role.permissions')                       │
│ 3. Checks: permissions->contains('name', 'create_users')     │
│                                                                 │
│ If NO permission:                                             │
│   → Returns 403 Forbidden                                     │
│                                                                 │
│ If YES permission:                                            │
│   → Allows request to continue                                 │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ CONTROLLER EXECUTES                                           │
│ Location: backend/app/Http/Controllers/UserController.php    │
│ public function store() { ... }                              │
│ Creates user in database                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📍 Summary: Core Files

| Component | File Path | Purpose |
|-----------|-----------|---------|
| **Core Permission Check** | `backend/backend/app/Http/Middleware/CheckPermission.php` | **THE MAIN FUNCTION** that enforces all permissions |
| **Middleware Registration** | `backend/backend/bootstrap/app.php` | Registers `permission` middleware alias |
| **Route Definitions** | `backend/backend/routes/api.php` | Maps routes to permissions via middleware |
| **User Controller** | `backend/backend/app/Http/Controllers/UserController.php` | Implements user CRUD operations |
| **Role Controller** | `backend/backend/app/Http/Controllers/RoleController.php` | Implements role CRUD and permission assignment |
| **Permission Controller** | `backend/backend/app/Http/Controllers/PermissionController.php` | Implements permission CRUD operations |
| **Frontend Permission Check** | `frontend/frontend/src/utils/permissions.js` | Frontend permission checking utility |
| **Frontend Route Guards** | `frontend/frontend/src/router/index.js` | Route-level permission checks |

---

## ✅ Key Takeaways

1. **Backend is the source of truth**: All permissions are enforced by `CheckPermission` middleware
2. **Frontend checks are for UX only**: They hide/show UI elements but don't prevent API calls
3. **Every protected route** uses `->middleware('permission:xxx')` to enforce permissions
4. **Permission check happens on every request**: Fresh from database, no caching
5. **`manage_*` permissions** are conceptual - currently require assigning all individual permissions

---

## 🎯 The Single Most Important File

**`backend/backend/app/Http/Middleware/CheckPermission.php`**

This is **THE CORE** of the entire permission system. Every permission check goes through this middleware's `handle()` method. This is where all the magic happens! ✨

