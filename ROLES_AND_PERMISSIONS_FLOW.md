# Roles and Permissions - Dynamic Flow Explanation

## 🎯 Overview

This document explains how the **dynamic role-permission system** works in this application. When you assign permissions to a role, the changes take effect **immediately** without requiring users to log out and log back in.

---

## 📊 Database Structure

### Tables and Relationships

```
┌─────────────┐         ┌──────────────────┐         ┌──────────────┐
│   users     │         │ role_permissions │         │ permissions  │
│─────────────│         │──────────────────│         │──────────────│
│ id          │         │ id                │         │ id            │
│ name        │         │ role_id (FK)      │         │ name          │
│ email       │         │ permission_id(FK)│         │ guard_name    │
│ password    │         │ timestamps       │         │ timestamps    │
│ role_id(FK) │         └──────────────────┘         └──────────────┘
└──────┬──────┘                    ▲                        ▲
       │                            │                        │
       │ belongsTo                  │                        │
       │                            │                        │
       ▼                            │                        │
┌─────────────┐                    │                        │
│   roles     │                    │                        │
│─────────────│                    │                        │
│ id          │────────────────────┘                        │
│ name        │  belongsToMany                             │
│ timestamps  │  (Many-to-Many)                            │
└─────────────┘                                             │
                                                            │
                                            belongsToMany ───┘
```

**Key Point**: Users inherit permissions through their role. There's no direct user-permission relationship.

---

## 🔄 Complete Flow: Assigning Permissions to a Role

### Step 1: Frontend - User Assigns Permissions

**Location**: `frontend/frontend/src/components/pages/Roles.vue`

```javascript
// Lines 270-317: saveRole() function
async function saveRole() {
  if (!form.value.name) return alert("Role name is required");
  
  saving.value = true;
  try {
    if (editing.value) {
      // Update role name if changed
      const originalRole = roles.value.find(r => r.id === form.value.id);
      if (originalRole.name !== form.value.name) {
        await api.put(`/roles/${form.value.id}`, { name: form.value.name });
      }
      
      // 🔑 KEY: Sync all permissions at once
      await api.put('/role/permissions', {
        role_id: form.value.id,
        permissions: form.value.permissions  // Array of permission IDs
      });
      
      // 🔑 KEY: Refresh current user permissions if they were affected
      await refreshCurrentUserIfNeeded(form.value.id);
    }
    // ... rest of code
  }
}
```

**What happens**:
1. User selects permissions via checkboxes
2. Form submits with `role_id` and array of `permission_ids`
3. API call to `PUT /api/role/permissions`

---

### Step 2: Backend API Route

**Location**: `backend/backend/routes/api.php`

```php
// Line 43
Route::put('/role/permissions', [RoleController::class, 'syncPermissions'])
    ->middleware('permission:assign_permissions');
```

**What happens**:
- Route is protected by `permission:assign_permissions` middleware
- Only users with this permission can assign permissions to roles

---

### Step 3: Backend Controller - Sync Permissions

**Location**: `backend/backend/app/Http/Controllers/RoleController.php`

```php
// Lines 83-97
public function syncPermissions(Request $request)
{
    $validated = $request->validate([
        'role_id' => 'required|exists:roles,id',
        'permissions' => 'required|array',
        'permissions.*' => 'exists:permissions,id',
    ]);

    $role = Role::findOrFail($validated['role_id']);
    
    // 🔑 KEY: Sync replaces all permissions with the new set
    $role->permissions()->sync($validated['permissions']);

    $role->load('permissions');
    return response()->json($role);
}
```

**What `sync()` does**:
- **Removes** all existing permissions for the role
- **Adds** the new permissions from the request
- This ensures the role has **exactly** the permissions you selected

**Database Operation**:
```sql
-- Laravel Eloquent sync() performs:
DELETE FROM role_permissions WHERE role_id = ?;
INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?), (?, ?), ...;
```

---

### Step 4: Frontend - Auto-Refresh User Permissions

**Location**: `frontend/frontend/src/components/pages/Roles.vue`

```javascript
// Lines 187-196
async function refreshCurrentUserIfNeeded(modifiedRoleId) {
  const currentUser = getCurrentUser();
  if (currentUser && currentUser.role_id === modifiedRoleId) {
    // Current user's role was modified, refresh their permissions
    await refreshUserPermissions(api);
    // Trigger a custom event to notify other components
    window.dispatchEvent(new CustomEvent('permissions-updated'));
  }
}
```

**What happens**:
- Checks if the current logged-in user has the modified role
- If yes, immediately refreshes their permissions from the API
- Dispatches event to update UI across all components

---

### Step 5: Permission Refresh Utility

**Location**: `frontend/frontend/src/utils/permissions.js`

```javascript
// Lines 6-16
export async function refreshUserPermissions(api) {
  try {
    const response = await api.get('/account');
    const userData = response.data;
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
  } catch (error) {
    console.error('Failed to refresh user permissions:', error);
    return null;
  }
}
```

**What happens**:
- Calls `/api/account` endpoint
- Gets fresh user data with updated role and permissions
- Updates `localStorage` with new permission data
- **No logout required!**

---

### Step 6: Backend - Account Endpoint Returns Fresh Data

**Location**: `backend/backend/app/Http/Controllers/AccountController.php`

```php
public function show(Request $request)
{
    // 🔑 KEY: Always loads fresh role and permissions from database
    $user = $request->user()->load('role.permissions');
    return response()->json($user);
}
```

**What happens**:
- Loads user with their role relationship
- Loads role with all its permissions (fresh from database)
- Returns complete user object with updated permissions

---

## 🔐 How Permissions Are Checked (Runtime)

### Frontend Permission Check

**Location**: `frontend/frontend/src/utils/permissions.js`

```javascript
// Lines 21-31
export function hasPermission(permissionName) {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;
    const user = JSON.parse(userStr);
    if (!user.role || !user.role.permissions) return false;
    // 🔑 KEY: Checks if permission exists in user's role permissions
    return user.role.permissions.some(p => p.name === permissionName);
  } catch {
    return false;
  }
}
```

**Usage Example**:
```vue
<!-- In Vue components -->
<button v-if="hasPermission('create_users')">Create User</button>
```

---

### Backend Permission Check (Middleware)

**Location**: `backend/backend/app/Http/Middleware/CheckPermission.php`

```php
// Lines 11-33
public function handle(Request $request, Closure $next, string $permission): Response
{
    $user = $request->user();
    
    if (!$user) {
        return response()->json(['message' => 'Unauthenticated.'], 401);
    }

    // 🔑 KEY: Always loads fresh permissions from database
    $user->load('role.permissions');
    
    // Check if user has the required permission through their role
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
```

**What happens**:
1. Every API request with `permission:xxx` middleware
2. Loads user's role and permissions **fresh from database**
3. Checks if permission name exists in the collection
4. Allows or denies the request

**Important**: Backend always checks **fresh from database**, so permission changes are immediately effective!

---

## 🔄 Complete Dynamic Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. ADMIN ASSIGNS PERMISSIONS TO ROLE                            │
│    Frontend: Roles.vue → saveRole()                             │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. API REQUEST                                                   │
│    PUT /api/role/permissions                                     │
│    { role_id: 2, permissions: [1, 3, 5] }                       │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. MIDDLEWARE CHECK                                              │
│    CheckPermission → validates 'assign_permissions'              │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. CONTROLLER PROCESSES                                          │
│    RoleController::syncPermissions()                             │
│    → role->permissions()->sync([1, 3, 5])                       │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. DATABASE UPDATE                                               │
│    DELETE FROM role_permissions WHERE role_id = 2                │
│    INSERT INTO role_permissions VALUES (2,1), (2,3), (2,5)       │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. FRONTEND AUTO-REFRESH                                         │
│    refreshCurrentUserIfNeeded()                                  │
│    → Checks if current user has modified role                    │
│    → If yes: refreshUserPermissions()                            │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. FETCH FRESH USER DATA                                         │
│    GET /api/account                                              │
│    → Backend loads: user->load('role.permissions')               │
│    → Returns user with updated permissions                       │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 8. UPDATE LOCALSTORAGE                                           │
│    localStorage.setItem('user', JSON.stringify(userData))        │
│    → Frontend now has latest permissions                         │
└───────────────────────┬─────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│ 9. UI UPDATES IMMEDIATELY                                        │
│    hasPermission() now returns true for new permissions          │
│    → Buttons appear/disappear                                    │
│    → Routes become accessible                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Code Locations Summary

| Component | File Path | Key Function/Method |
|-----------|-----------|---------------------|
| **Frontend Role Management** | `frontend/frontend/src/components/pages/Roles.vue` | `saveRole()` (line 270) |
| **Permission Sync API** | `backend/backend/app/Http/Controllers/RoleController.php` | `syncPermissions()` (line 83) |
| **Permission Check Middleware** | `backend/backend/app/Http/Middleware/CheckPermission.php` | `handle()` (line 11) |
| **Permission Utility** | `frontend/frontend/src/utils/permissions.js` | `hasPermission()` (line 21) |
| **Auto-Refresh** | `frontend/frontend/src/components/pages/Roles.vue` | `refreshCurrentUserIfNeeded()` (line 187) |
| **Account Endpoint** | `backend/backend/app/Http/Controllers/AccountController.php` | `show()` (line 13) |
| **Role Model** | `backend/backend/app/Models/Role.php` | `permissions()` relationship (line 21) |
| **Permission Model** | `backend/backend/app/Models/Permission.php` | `roles()` relationship (line 21) |
| **API Routes** | `backend/backend/routes/api.php` | Line 43: `PUT /role/permissions` |
| **Middleware Registration** | `backend/backend/bootstrap/app.php` | Line 21: `'permission'` alias |

---

## ✅ Why It Works Dynamically

### 1. **Backend Always Checks Fresh Data**
   - Every API request with `permission:xxx` middleware loads permissions from database
   - No caching - always current!

### 2. **Frontend Auto-Refreshes**
   - When you modify a role, frontend checks if current user is affected
   - Automatically fetches fresh permissions
   - Updates localStorage without logout

### 3. **Eloquent Relationships**
   - `$role->permissions()` uses `belongsToMany` relationship
   - `sync()` method atomically updates the pivot table
   - Changes are immediately queryable

### 4. **No Session Caching**
   - Permissions are not stored in session
   - Always loaded from database on each request
   - Ensures real-time updates

---

## 🧪 Testing the Dynamic Behavior

### Test Scenario:
1. **Login as Admin** (has all permissions)
2. **Open two browser tabs** (both logged in as Admin)
3. **In Tab 1**: Remove `create_users` permission from Admin role
4. **In Tab 2**: Try to create a user
5. **Result**: Tab 2 should immediately show "No permission" error

### Why This Works:
- Tab 2's next API request will hit `permission:create_users` middleware
- Middleware loads fresh permissions from database
- Permission no longer exists → 403 Forbidden
- **No logout required!**

---

## 📝 Important Notes

1. **`sync()` vs `syncWithoutDetaching()`**:
   - `sync()`: Replaces all permissions (used in this app)
   - `syncWithoutDetaching()`: Adds permissions without removing existing ones

2. **Permission Inheritance**:
   - Users get permissions through their role
   - Changing role permissions affects ALL users with that role
   - No individual user permission overrides

3. **Real-time Updates**:
   - Frontend auto-refreshes if current user's role is modified
   - Other users will get updated permissions on their next API request
   - No manual refresh needed for most cases

4. **Security**:
   - Backend always validates permissions (can't be bypassed)
   - Frontend checks are for UX only (hiding buttons)
   - Always trust backend validation!

---

## 🔄 What Happens When User Doesn't Have Permission?

### Frontend Route Protection - Redirect to Account

**Location**: `frontend/frontend/src/router/index.js`

```javascript
// Lines 104-119: Router guard that redirects to account
if (to.meta.permission && token) {
  if (!hasPermission(to.meta.permission)) {
    // Log the permission issue (for debugging)
    console.warn(`Access denied: User does not have permission '${to.meta.permission}' for route '${to.path}'`);
    
    // 🔑 KEY: Redirect to a safe page
    // Try dashboard first, then account (which all authenticated users can access)
    if (hasPermission('view_dashboard')) {
      next('/');  // Redirect to dashboard
    } else {
      // If no dashboard permission, go to account page
      next('/account');  // 🔑 This redirects to account page
    }
    return;
  }
}
```

**What happens**:
1. User tries to access a route (e.g., `/users`)
2. Router checks if user has required permission (`view_users`)
3. If **NO permission**: Redirects to `/account` page
4. Account page is accessible to **all authenticated users** (no permission check)

---

### Backend Account Endpoint - Returns Account Data

**Location**: `backend/backend/routes/api.php`

```php
// Lines 24-26: Account routes - NO permission middleware!
// Account - accessible to all authenticated users (no permission check needed, everyone can manage their own account)
Route::get('/account', [AccountController::class, 'show']);
Route::put('/account', [AccountController::class, 'update']);
```

**Key Point**: Account endpoint has **NO permission middleware** - it's accessible to all authenticated users!

**Location**: `backend/backend/app/Http/Controllers/AccountController.php`

```php
// Lines 11-15: Returns account data
public function show(Request $request)
{
    // 🔑 KEY: Always loads fresh role and permissions from database
    $user = $request->user()->load('role.permissions');
    return response()->json($user);
}
```

**What happens**:
- Loads current authenticated user
- Loads their role with all permissions (fresh from database)
- Returns complete user object with role and permissions
- **No permission check required** - everyone can access their own account

---

### Frontend Account Component - Fetches Account Data

**Location**: `frontend/frontend/src/components/pages/Account.vue`

```javascript
// Lines 118-138: Fetches account data when component loads
async function fetchAccountData() {
  loading.value = true;
  errors.value = {};
  
  try {
    // 🔑 KEY: Calls /api/account endpoint
    const response = await axiosInstance.get("/account");
    userData.value = response.data;
    form.value.name = userData.value.name || "";
    form.value.email = userData.value.email || "";
  } catch (error) {
    if (error.response?.status === 401) {
      alert("Session expired. Please login again.");
      localStorage.removeItem("token");
      router.push("/login");
    } else {
      alert("Failed to load account information.");
    }
  } finally {
    loading.value = false;
  }
}

// Line 192: Automatically fetches when component mounts
onMounted(fetchAccountData);
```

**What happens**:
1. User is redirected to `/account` route
2. Account component mounts
3. Calls `GET /api/account` endpoint
4. Backend returns user data with role and permissions
5. Component displays account information

---

### Complete Flow: No Permission → Account Page

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER TRIES TO ACCESS PROTECTED ROUTE                     │
│    Example: User clicks on "Users" menu item                │
│    Route: /users (requires 'view_users' permission)          │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. ROUTER GUARD CHECKS PERMISSION                            │
│    Location: frontend/src/router/index.js (line 105)         │
│    hasPermission('view_users') → returns false                │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. ROUTER REDIRECTS TO ACCOUNT                               │
│    Location: frontend/src/router/index.js (line 116)         │
│    next('/account') → Navigates to account page               │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. ACCOUNT COMPONENT MOUNTS                                   │
│    Location: frontend/src/components/pages/Account.vue        │
│    onMounted() → fetchAccountData() called                    │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. FRONTEND CALLS ACCOUNT API                                 │
│    GET /api/account                                           │
│    Headers: Authorization: Bearer {token}                     │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. BACKEND RETURNS ACCOUNT DATA                               │
│    Location: backend/app/Http/Controllers/AccountController   │
│    → No permission check (accessible to all authenticated)     │
│    → Loads user with role.permissions                         │
│    → Returns: { id, name, email, role: { name, permissions }} │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. ACCOUNT PAGE DISPLAYS                                      │
│    Shows user profile, role, and account settings             │
│    User can manage their own account                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 📍 Code Locations Summary: Account Fallback

| Component | File Path | Line | What It Does |
|-----------|-----------|------|--------------|
| **Router Redirect** | `frontend/frontend/src/router/index.js` | 116 | Redirects to `/account` when permission denied |
| **Account Route** | `backend/backend/routes/api.php` | 25 | Defines `/api/account` endpoint (no permission check) |
| **Account Controller** | `backend/backend/app/Http/Controllers/AccountController.php` | 11-15 | Returns user account data with permissions |
| **Account Component** | `frontend/frontend/src/components/pages/Account.vue` | 118-138 | Fetches and displays account data |
| **Account Fetch** | `frontend/frontend/src/components/pages/Account.vue` | 123 | Calls `GET /api/account` endpoint |

---

## ✅ Why Account Page is the Fallback

1. **No Permission Required**: Account endpoint has no `permission:xxx` middleware
2. **Always Accessible**: All authenticated users can access their own account
3. **Safe Landing Page**: Users always have somewhere to go when denied access
4. **Shows User Info**: Displays their role and permissions so they know what they have access to

---

## 🎓 Summary

The system works dynamically because:
- ✅ **Database is the source of truth** - permissions stored in `role_permissions` table
- ✅ **Backend always queries fresh** - no caching of permissions
- ✅ **Frontend auto-refreshes** - when roles are modified, affected users get updated
- ✅ **Eloquent relationships** - make it easy to query and update permissions
- ✅ **Middleware checks on every request** - ensures security and real-time updates
- ✅ **Account as fallback** - when permission denied, users are redirected to account page which is always accessible

**Result**: Permission changes take effect immediately without requiring logout/login! 🚀

