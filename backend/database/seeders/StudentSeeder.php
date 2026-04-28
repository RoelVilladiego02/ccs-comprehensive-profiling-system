<?php

namespace Database\Seeders;

use App\Models\Student;
use Illuminate\Database\Seeder;

class StudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->command->info('Creating test students...');

        // Create test student record to match the test user
        Student::firstOrCreate(
            ['email' => 'student@ccs.edu'],
            [
                'student_number' => '2024001',
                'first_name' => 'John',
                'last_name' => 'Student',
                'gender' => 'Male',
                'email' => 'student@ccs.edu',
                'student_identification' => 'Regular',
            ]
        );

        // Additional test students
        Student::firstOrCreate(
            ['email' => 'jane.doe@ccs.edu'],
            [
                'student_number' => '2024002',
                'first_name' => 'Jane',
                'last_name' => 'Doe',
                'gender' => 'Female',
                'email' => 'jane.doe@ccs.edu',
                'student_identification' => 'Regular',
            ]
        );

        Student::firstOrCreate(
            ['email' => 'michael.smith@ccs.edu'],
            [
                'student_number' => '2024003',
                'first_name' => 'Michael',
                'last_name' => 'Smith',
                'gender' => 'Male',
                'email' => 'michael.smith@ccs.edu',
                'student_identification' => 'Regular',
            ]
        );

        // Generate 1000 students using factory
        $this->command->info('Generating 1000 sample students...');
        
        $chunkSize = 100; // Process 100 students at a time
        $totalChunks = 10;
        $createdCount = 0;

        for ($chunk = 0; $chunk < $totalChunks; $chunk++) {
            $students = Student::factory($chunkSize)->create();
            $createdCount += $students->count();
            
            $this->command->info("Created {$createdCount} students...");
            
            // Clear memory after each chunk
            unset($students);
        }

        $this->command->info("✓ Successfully created 1000 sample students!");
        $this->command->info("Total students in database: " . Student::count());
    }
}

