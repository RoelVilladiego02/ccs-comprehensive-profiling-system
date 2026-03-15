<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\Permission;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RolePermissionController extends Controller
{
    /**
     * GET /api/roles
     * Get all roles
     */
    public function getRoles(): JsonResponse
    {
        $roles = Role::with('permissions')->get();

        return response()->json([
            'success' => true,
            'data' => $roles,
        ]);
    }

    /**
     * GET /api/permissions
     * Get all permissions
     */
    public function getPermissions(): JsonResponse
    {
        $permissions = Permission::all();

        return response()->json([
            'success' => true,
            'data' => $permissions,
        ]);
    }

    /**
     * POST /api/roles
     * Create new role
     */
    public function createRole(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'role_name' => 'required|unique:roles,role_name|string|max:100',
            'role_description' => 'nullable|string',
            'is_active' => 'boolean',
        ]);

        $role = Role::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Role created successfully',
            'data' => $role,
        ], 201);
    }

    /**
     * POST /api/roles/{roleId}/permissions/{permissionId}
     * Assign permission to role
     */
    public function assignPermissionToRole(int $roleId, int $permissionId): JsonResponse
    {
        $role = Role::find($roleId);
        $permission = Permission::find($permissionId);

        if (!$role || !$permission) {
            return response()->json([
                'success' => false,
                'message' => 'Role or Permission not found',
            ], 404);
        }

        $role->grantPermission($permission);

        return response()->json([
            'success' => true,
            'message' => 'Permission assigned to role',
        ]);
    }

    /**
     * DELETE /api/roles/{roleId}/permissions/{permissionId}
     * Remove permission from role
     */
    public function removePermissionFromRole(int $roleId, int $permissionId): JsonResponse
    {
        $role = Role::find($roleId);
        $permission = Permission::find($permissionId);

        if (!$role || !$permission) {
            return response()->json([
                'success' => false,
                'message' => 'Role or Permission not found',
            ], 404);
        }

        $role->revokePermission($permission);

        return response()->json([
            'success' => true,
            'message' => 'Permission removed from role',
        ]);
    }

    /**
     * POST /api/users/{userId}/roles/{roleId}
     * Assign role to user
     */
    public function assignRoleToUser(int $userId, int $roleId): JsonResponse
    {
        $user = User::find($userId);
        $role = Role::find($roleId);

        if (!$user || !$role) {
            return response()->json([
                'success' => false,
                'message' => 'User or Role not found',
            ], 404);
        }

        $user->assignRole($role);

        return response()->json([
            'success' => true,
            'message' => 'Role assigned to user',
        ]);
    }

    /**
     * DELETE /api/users/{userId}/roles/{roleId}
     * Remove role from user
     */
    public function removeRoleFromUser(int $userId, int $roleId): JsonResponse
    {
        $user = User::find($userId);
        $role = Role::find($roleId);

        if (!$user || !$role) {
            return response()->json([
                'success' => false,
                'message' => 'User or Role not found',
            ], 404);
        }

        $user->removeRole($role);

        return response()->json([
            'success' => true,
            'message' => 'Role removed from user',
        ]);
    }

    /**
     * GET /api/users/{userId}/roles
     * Get user's roles
     */
    public function getUserRoles(int $userId): JsonResponse
    {
        $user = User::find($userId);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $user->load('roles.permissions'),
        ]);
    }

    /**
     * GET /api/users/{userId}/permissions
     * Get user's permissions through roles
     */
    public function getUserPermissions(int $userId): JsonResponse
    {
        $user = User::find($userId);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found',
            ], 404);
        }

        $permissions = $user->roles()
            ->with('permissions')
            ->get()
            ->pluck('permissions')
            ->flatten()
            ->unique('permission_id');

        return response()->json([
            'success' => true,
            'data' => $permissions,
        ]);
    }
}
