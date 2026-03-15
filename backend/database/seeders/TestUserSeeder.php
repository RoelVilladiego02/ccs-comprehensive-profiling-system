<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get roles
        $adminRole = Role::where('role_name', 'Admin')->first();
        $facultyRole = Role::where('role_name', 'Faculty')->first();
        $studentRole = Role::where('role_name', 'Student')->first();
        $staffRole = Role::where('role_name', 'Staff')->first();

        // Create admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@ccs.edu'],
            [
                'name' => 'Administrator',
                'password' => Hash::make('admin123456'),
                'is_active' => true,
            ]
        );
        if ($adminRole && !$admin->hasRole('Admin')) {
            $admin->assignRole($adminRole);
        }

        // Create faculty user
        $faculty = User::firstOrCreate(
            ['email' => 'faculty@ccs.edu'],
            [
                'name' => 'Dr. Jane Smith',
                'password' => Hash::make('faculty123456'),
                'is_active' => true,
            ]
        );
        if ($facultyRole && !$faculty->hasRole('Faculty')) {
            $faculty->assignRole($facultyRole);
        }

        // Create student user
        $student = User::firstOrCreate(
            ['email' => 'student@ccs.edu'],
            [
                'name' => 'John Student',
                'password' => Hash::make('student123456'),
                'is_active' => true,
            ]
        );
        if ($studentRole && !$student->hasRole('Student')) {
            $student->assignRole($studentRole);
        }

        // Create staff user
        $staff = User::firstOrCreate(
            ['email' => 'staff@ccs.edu'],
            [
                'name' => 'Staff Member',
                'password' => Hash::make('staff123456'),
                'is_active' => true,
            ]
        );
        if ($staffRole && !$staff->hasRole('Staff')) {
            $staff->assignRole($staffRole);
        }
    }
}
