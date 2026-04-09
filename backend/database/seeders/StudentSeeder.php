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
    }
}
