<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define roles
        $adminRole = Role::firstOrCreate(
            ['role_name' => 'Admin'],
            ['role_description' => 'System administrator with full permissions', 'is_active' => true]
        );

        $facultyRole = Role::firstOrCreate(
            ['role_name' => 'Faculty'],
            ['role_description' => 'Faculty member - can manage their classes', 'is_active' => true]
        );

        $studentRole = Role::firstOrCreate(
            ['role_name' => 'Student'],
            ['role_description' => 'Student - can view their courses and grades', 'is_active' => true]
        );

        $staffRole = Role::firstOrCreate(
            ['role_name' => 'Staff'],
            ['role_description' => 'Administrative staff', 'is_active' => true]
        );

        // Define permissions
        $permissions = [
            // Student Management
            ['permission_name' => 'students.view', 'permission_description' => 'View students', 'module' => 'students'],
            ['permission_name' => 'students.create', 'permission_description' => 'Create students', 'module' => 'students'],
            ['permission_name' => 'students.edit', 'permission_description' => 'Edit students', 'module' => 'students'],
            ['permission_name' => 'students.delete', 'permission_description' => 'Delete students', 'module' => 'students'],
            ['permission_name' => 'students.view_profile', 'permission_description' => 'View student profile', 'module' => 'students'],

            // Course Management
            ['permission_name' => 'courses.view', 'permission_description' => 'View courses', 'module' => 'courses'],
            ['permission_name' => 'courses.create', 'permission_description' => 'Create courses', 'module' => 'courses'],
            ['permission_name' => 'courses.edit', 'permission_description' => 'Edit courses', 'module' => 'courses'],
            ['permission_name' => 'courses.delete', 'permission_description' => 'Delete courses', 'module' => 'courses'],

            // Faculty Management
            ['permission_name' => 'faculty.view', 'permission_description' => 'View faculty', 'module' => 'faculty'],
            ['permission_name' => 'faculty.create', 'permission_description' => 'Create faculty', 'module' => 'faculty'],
            ['permission_name' => 'faculty.edit', 'permission_description' => 'Edit faculty', 'module' => 'faculty'],
            ['permission_name' => 'faculty.delete', 'permission_description' => 'Delete faculty', 'module' => 'faculty'],

            // Class Management
            ['permission_name' => 'classes.view', 'permission_description' => 'View classes', 'module' => 'classes'],
            ['permission_name' => 'classes.create', 'permission_description' => 'Create classes', 'module' => 'classes'],
            ['permission_name' => 'classes.edit', 'permission_description' => 'Edit classes', 'module' => 'classes'],
            ['permission_name' => 'classes.delete', 'permission_description' => 'Delete classes', 'module' => 'classes'],
            ['permission_name' => 'classes.manage_own', 'permission_description' => 'Manage own classes', 'module' => 'classes'],

            // Enrollment Management
            ['permission_name' => 'enrollments.view', 'permission_description' => 'View enrollments', 'module' => 'enrollments'],
            ['permission_name' => 'enrollments.create', 'permission_description' => 'Create enrollments', 'module' => 'enrollments'],
            ['permission_name' => 'enrollments.edit', 'permission_description' => 'Edit enrollments', 'module' => 'enrollments'],
            ['permission_name' => 'enrollments.delete', 'permission_description' => 'Delete enrollments', 'module' => 'enrollments'],

            // Grades Management
            ['permission_name' => 'grades.view', 'permission_description' => 'View grades', 'module' => 'grades'],
            ['permission_name' => 'grades.create', 'permission_description' => 'Create grades', 'module' => 'grades'],
            ['permission_name' => 'grades.edit', 'permission_description' => 'Edit grades', 'module' => 'grades'],
            ['permission_name' => 'grades.delete', 'permission_description' => 'Delete grades', 'module' => 'grades'],

            // Attendance Management
            ['permission_name' => 'attendance.view', 'permission_description' => 'View attendance', 'module' => 'attendance'],
            ['permission_name' => 'attendance.create', 'permission_description' => 'Create attendance', 'module' => 'attendance'],
            ['permission_name' => 'attendance.edit', 'permission_description' => 'Edit attendance', 'module' => 'attendance'],
            ['permission_name' => 'attendance.delete', 'permission_description' => 'Delete attendance', 'module' => 'attendance'],

            // Violations Management
            ['permission_name' => 'violations.view', 'permission_description' => 'View violations', 'module' => 'violations'],
            ['permission_name' => 'violations.create', 'permission_description' => 'Create violations', 'module' => 'violations'],
            ['permission_name' => 'violations.edit', 'permission_description' => 'Edit violations', 'module' => 'violations'],
            ['permission_name' => 'violations.delete', 'permission_description' => 'Delete violations', 'module' => 'violations'],

            // Events Management
            ['permission_name' => 'events.view', 'permission_description' => 'View events', 'module' => 'events'],
            ['permission_name' => 'events.create', 'permission_description' => 'Create events', 'module' => 'events'],
            ['permission_name' => 'events.edit', 'permission_description' => 'Edit events', 'module' => 'events'],
            ['permission_name' => 'events.delete', 'permission_description' => 'Delete events', 'module' => 'events'],
            ['permission_name' => 'events.manage_students', 'permission_description' => 'Manage student enrollment in events', 'module' => 'events'],

            // System Management
            ['permission_name' => 'roles.manage', 'permission_description' => 'Manage roles', 'module' => 'system'],
            ['permission_name' => 'permissions.manage', 'permission_description' => 'Manage permissions', 'module' => 'system'],
            ['permission_name' => 'users.manage', 'permission_description' => 'Manage users', 'module' => 'system'],
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate($perm);
        }

        // Assign all permissions to Admin
        $allPermissions = Permission::all();
        foreach ($allPermissions as $permission) {
            $adminRole->grantPermission($permission);
        }

        // Assign relevant permissions to Faculty
        $facultyPermissions = [
            'students.view', 'courses.view', 'courses.create', 'courses.edit', 'courses.delete',
            'classes.view', 'classes.manage_own',
            'enrollments.view',
            'grades.view', 'grades.create', 'grades.edit',
            'attendance.view', 'attendance.create', 'attendance.edit',
            'violations.view', 'violations.create',
            'events.view', 'events.create', 'events.manage_students'
        ];
        foreach ($facultyPermissions as $permName) {
            $permission = Permission::where('permission_name', $permName)->first();
            if ($permission) {
                $facultyRole->grantPermission($permission);
            }
        }

        // Assign relevant permissions to Student
        $studentPermissions = [
            'students.view', 'students.view_profile', 'courses.view', 'classes.view',
            'grades.view', 'attendance.view', 'events.view'
        ];
        foreach ($studentPermissions as $permName) {
            $permission = Permission::where('permission_name', $permName)->first();
            if ($permission) {
                $studentRole->grantPermission($permission);
            }
        }

        // Assign relevant permissions to Staff
        $staffPermissions = [
            'students.view', 'students.create', 'students.edit',
            'courses.view', 'faculty.view', 'classes.view',
            'enrollments.view', 'enrollments.create',
            'violations.view', 'violations.create',
            'events.view', 'events.create', 'events.edit', 'events.manage_students'
        ];
        foreach ($staffPermissions as $permName) {
            $permission = Permission::where('permission_name', $permName)->first();
            if ($permission) {
                $staffRole->grantPermission($permission);
            }
        }
    }
}
