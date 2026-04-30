<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            RolePermissionSeeder::class,
            TestUserSeeder::class,
            CourseSeeder::class,
            FacultySeeder::class,
            StudentSeeder::class,      // Must run BEFORE ClassSeeder for enrollment
            ClassSeeder::class,        // Now has students to enroll
            GradesSeeder::class,       // Seeds midterm and final grades
            UserAccountSeeder::class,  // Creates login accounts for all faculty and students
            CurriculumSeeder::class,   // Seeds curriculum data
            LessonSeeder::class,       // Seeds lessons with faculty associations
            EventSeeder::class,        // Seeds events with student registrations
        ]);
    }
}
