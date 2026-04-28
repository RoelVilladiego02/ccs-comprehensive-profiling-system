<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Faculty;
use App\Models\Student;
use App\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserAccountSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * Creates User accounts for all Faculty and Student records
     * so they can login to the system.
     */
    public function run(): void
    {
        $this->command->info('Creating user accounts for faculty and students...\n');

        // Get roles
        $facultyRole = Role::where('role_name', 'Faculty')->first();
        $studentRole = Role::where('role_name', 'Student')->first();

        if (!$facultyRole || !$studentRole) {
            $this->command->error('❌ Faculty or Student roles not found. Run RolePermissionSeeder first.');
            return;
        }

        // Create user accounts for Faculty
        $this->createFacultyUsers($facultyRole);

        // Create user accounts for Students
        $this->createStudentUsers($studentRole);

        $this->command->info("\n✓ User account creation complete!");
    }

    /**
     * Create user accounts for all faculty members
     */
    private function createFacultyUsers(Role $facultyRole): void
    {
        $this->command->info('Creating Faculty user accounts...');

        // Get all faculty that don't have a user account yet
        $faculty = Faculty::all();
        $usersCreated = 0;

        foreach ($faculty as $facultyMember) {
            // Check if user already exists
            $existingUser = User::where('email', $facultyMember->email)->first();

            if (!$existingUser) {
                // Create new user
                $user = User::create([
                    'email' => $facultyMember->email,
                    'name' => $facultyMember->first_name . ' ' . $facultyMember->last_name,
                    'password' => Hash::make('faculty123456'),
                    'is_active' => true,
                ]);

                // Assign Faculty role
                if (!$user->hasRole('Faculty')) {
                    $user->assignRole($facultyRole);
                }

                $usersCreated++;
            }
        }

        $this->command->info("  ✓ Created {$usersCreated} faculty user accounts");
        $this->command->line("  📧 All faculty can login with password: <fg=yellow>faculty123456</>");
    }

    /**
     * Create user accounts for all students
     */
    private function createStudentUsers(Role $studentRole): void
    {
        $this->command->info('Creating Student user accounts...');

        // Get all students that don't have a user account yet
        $students = Student::all();
        $usersCreated = 0;
        $batchSize = 100;

        foreach ($students as $index => $student) {
            // Check if user already exists
            $existingUser = User::where('email', $student->email)->first();

            if (!$existingUser) {
                // Create new user
                $user = User::create([
                    'email' => $student->email,
                    'name' => $student->first_name . ' ' . $student->last_name,
                    'password' => Hash::make('student123456'),
                    'is_active' => true,
                ]);

                // Assign Student role
                if (!$user->hasRole('Student')) {
                    $user->assignRole($studentRole);
                }

                $usersCreated++;
            }

            // Show progress every 100 users
            if (($index + 1) % $batchSize === 0) {
                $this->command->info("  Created {$usersCreated} student user accounts...");
            }
        }

        $this->command->info("  ✓ Created {$usersCreated} student user accounts");
        $this->command->line("  📧 All students can login with password: <fg=yellow>student123456</>");
    }
}
