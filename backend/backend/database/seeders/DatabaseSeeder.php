<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // Create Comprehensive Permissions
        $permissions = [
            // User Management Permissions
            ['name' => 'view_users', 'guard_name' => 'web'],
            ['name' => 'create_users', 'guard_name' => 'web'],
            ['name' => 'edit_users', 'guard_name' => 'web'],
            ['name' => 'delete_users', 'guard_name' => 'web'],
            ['name' => 'manage_users', 'guard_name' => 'web'], // Full access to users
            
            // Role Management Permissions
            ['name' => 'view_roles', 'guard_name' => 'web'],
            ['name' => 'create_roles', 'guard_name' => 'web'],
            ['name' => 'edit_roles', 'guard_name' => 'web'],
            ['name' => 'delete_roles', 'guard_name' => 'web'],
            ['name' => 'assign_permissions', 'guard_name' => 'web'], // Assign/revoke permissions to roles
            ['name' => 'manage_roles', 'guard_name' => 'web'], // Full access to roles
            
            // Permission Management Permissions
            ['name' => 'view_permissions', 'guard_name' => 'web'],
            ['name' => 'create_permissions', 'guard_name' => 'web'],
            ['name' => 'edit_permissions', 'guard_name' => 'web'],
            ['name' => 'delete_permissions', 'guard_name' => 'web'],
            ['name' => 'manage_permissions', 'guard_name' => 'web'], // Full access to permissions
            
            // Dashboard Access
            ['name' => 'view_dashboard', 'guard_name' => 'web'],
            
            // Account Management (all authenticated users have this by default)
            ['name' => 'manage_account', 'guard_name' => 'web'],
        ];

        foreach ($permissions as $permission) {
            Permission::create($permission);
        }

        // Create Roles
        $adminRole = Role::create(['name' => 'Admin']);
        $managerRole = Role::create(['name' => 'Manager']);
        $userRole = Role::create(['name' => 'User']);
        $viewerRole = Role::create(['name' => 'Viewer']);

        // Assign all permissions to Admin
        $adminRole->permissions()->attach(Permission::pluck('id'));

        // Manager: Can view and edit users, view roles/permissions, but cannot delete or manage permissions
        $managerPermissions = Permission::whereIn('name', [
            'view_users', 'create_users', 'edit_users',
            'view_roles', 'edit_roles',
            'view_permissions',
            'view_dashboard',
            'manage_account'
        ])->pluck('id');
        $managerRole->permissions()->attach($managerPermissions);

        // User: Can view dashboard and manage own account (all users should have dashboard access)
        $userPermissions = Permission::whereIn('name', [
            'view_dashboard',
            'manage_account'
        ])->pluck('id');
        $userRole->permissions()->attach($userPermissions);
        
        // Ensure all roles have view_dashboard and manage_account by default
        // This is already handled above, but making it explicit

        // Viewer: Can view users and dashboard, but cannot edit anything
        $viewerPermissions = Permission::whereIn('name', [
            'view_users',
            'view_roles',
            'view_permissions',
            'view_dashboard',
            'manage_account'
        ])->pluck('id');
        $viewerRole->permissions()->attach($viewerPermissions);

        // Create Users
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role_id' => $adminRole->id,
        ]);

        User::create([
            'name' => 'Manager User',
            'email' => 'manager@example.com',
            'password' => Hash::make('password'),
            'role_id' => $managerRole->id,
        ]);

        User::create([
            'name' => 'Regular User',
            'email' => 'user@example.com',
            'password' => Hash::make('password'),
            'role_id' => $userRole->id,
        ]);

        User::create([
            'name' => 'Viewer User',
            'email' => 'viewer@example.com',
            'password' => Hash::make('password'),
            'role_id' => $viewerRole->id,
        ]);
    }
}

