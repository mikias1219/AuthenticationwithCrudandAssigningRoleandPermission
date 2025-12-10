<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class AccountController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user()->load('role.permissions');
        return response()->json($user);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'current_password' => 'required_with:password',
            'password' => 'sometimes|string|min:8|confirmed',
        ]);

        if (isset($validated['password'])) {
            if (!Hash::check($validated['current_password'], $user->password)) {
                return response()->json(['errors' => ['current_password' => ['Current password is incorrect.']]], 422);
            }
            $validated['password'] = Hash::make($validated['password']);
            unset($validated['current_password']);
            unset($validated['password_confirmation']);
        } else {
            unset($validated['current_password']);
        }

        $user->update($validated);
        $user->load('role.permissions');

        return response()->json([
            'message' => 'Account updated successfully',
            'user' => $user,
        ]);
    }
}

