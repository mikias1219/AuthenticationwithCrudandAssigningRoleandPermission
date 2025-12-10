<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\AccountController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Account - accessible to all authenticated users (no permission check needed, everyone can manage their own account)
    Route::get('/account', [AccountController::class, 'show']);
    Route::put('/account', [AccountController::class, 'update']);
    
    // Users - granular permissions
    Route::get('/users', [UserController::class, 'index'])->middleware('permission:view_users');
    Route::post('/users', [UserController::class, 'store'])->middleware('permission:create_users');
    Route::get('/users/{user}', [UserController::class, 'show'])->middleware('permission:view_users');
    Route::put('/users/{user}', [UserController::class, 'update'])->middleware('permission:edit_users');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->middleware('permission:delete_users');
    
    // Roles - granular permissions
    Route::get('/roles', [RoleController::class, 'index'])->middleware('permission:view_roles');
    Route::post('/roles', [RoleController::class, 'store'])->middleware('permission:create_roles');
    Route::get('/roles/{role}', [RoleController::class, 'show'])->middleware('permission:view_roles');
    Route::put('/roles/{role}', [RoleController::class, 'update'])->middleware('permission:edit_roles');
    Route::delete('/roles/{role}', [RoleController::class, 'destroy'])->middleware('permission:delete_roles');
    Route::post('/role/permissions', [RoleController::class, 'assignPermissions'])->middleware('permission:assign_permissions');
    Route::delete('/role/permissions', [RoleController::class, 'removePermissions'])->middleware('permission:assign_permissions');
    Route::put('/role/permissions', [RoleController::class, 'syncPermissions'])->middleware('permission:assign_permissions');
    
    // Permissions - granular permissions
    Route::get('/permissions', [PermissionController::class, 'index'])->middleware('permission:view_permissions');
    Route::post('/permissions', [PermissionController::class, 'store'])->middleware('permission:create_permissions');
    Route::get('/permissions/{permission}', [PermissionController::class, 'show'])->middleware('permission:view_permissions');
    Route::put('/permissions/{permission}', [PermissionController::class, 'update'])->middleware('permission:edit_permissions');
    Route::delete('/permissions/{permission}', [PermissionController::class, 'destroy'])->middleware('permission:delete_permissions');
});

