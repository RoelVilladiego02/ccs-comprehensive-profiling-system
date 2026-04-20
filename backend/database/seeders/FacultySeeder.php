<?php

namespace Database\Seeders;

use App\Models\Faculty;
use Illuminate\Database\Seeder;

class FacultySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create test faculty records to match test users
        Faculty::firstOrCreate(
            ['email' => 'faculty@ccs.edu'],
            [
                'faculty_number' => '2024001',
                'first_name' => 'Dr.',
                'last_name' => 'Faculty',
                'gender' => 'Male',
                'email' => 'faculty@ccs.edu',
                'employment_status' => 'Full-Time',
                'department' => 'Computer Science',
            ]
        );

        Faculty::firstOrCreate(
            ['email' => 'prof.smith@ccs.edu'],
            [
                'faculty_number' => '2024002',
                'first_name' => 'James',
                'last_name' => 'Smith',
                'gender' => 'Male',
                'email' => 'prof.smith@ccs.edu',
                'employment_status' => 'Full-Time',
                'department' => 'Information Technology',
            ]
        );

        Faculty::firstOrCreate(
            ['email' => 'prof.johnson@ccs.edu'],
            [
                'faculty_number' => '2024003',
                'first_name' => 'Maria',
                'last_name' => 'Johnson',
                'gender' => 'Female',
                'email' => 'prof.johnson@ccs.edu',
                'employment_status' => 'Full-Time',
                'department' => 'Computer Science',
            ]
        );

        // Generate 20 additional faculty using factory
        $this->command->info('Generating 20 sample faculty...');
        Faculty::factory(20)->create();
        $this->command->info('Successfully created 23 faculty members!');
    }
}
