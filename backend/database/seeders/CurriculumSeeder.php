<?php

namespace Database\Seeders;

use App\Models\Curriculum;
use App\Models\Course;
use Illuminate\Database\Seeder;

class CurriculumSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Seeds curriculum data for each course/department
     */
    public function run(): void
    {
        // Get all courses
        $courses = Course::all();

        if ($courses->isEmpty()) {
            $this->command->warn('No courses found. Skipping curriculum seeding.');
            return;
        }

        $departments = ['Computer Science', 'Information Technology', 'Software Engineering', 'Data Science'];
        $departmentIndex = 0;

        foreach ($courses as $course) {
            $department = $departments[$departmentIndex % count($departments)];
            $departmentIndex++;

            Curriculum::firstOrCreate(
                ['curriculum_code' => 'CURR-' . $course->course_code],
                [
                    'title' => $course->course_title . ' Curriculum',
                    'description' => 'Comprehensive curriculum for ' . $course->course_title . ' with structured learning outcomes and assessment methods.',
                    'department' => $department,
                    'total_credits' => rand(3, 6),
                    'is_active' => true,
                ]
            );
        }

        // Create general departmental curriculum
        foreach ($departments as $dept) {
            Curriculum::firstOrCreate(
                ['curriculum_code' => 'GEN-' . strtoupper(substr($dept, 0, 3))],
                [
                    'title' => $dept . ' General Curriculum',
                    'description' => 'General curriculum framework for ' . $dept . ' department',
                    'department' => $dept,
                    'total_credits' => 120,
                    'is_active' => true,
                ]
            );
        }

        $this->command->info('Curriculum seeding completed successfully!');
    }
}
