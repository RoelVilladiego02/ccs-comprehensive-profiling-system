<?php

namespace Database\Seeders;

use App\Models\Course;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $courses = [
            [
                'course_code' => 'CS101',
                'course_title' => 'Introduction to Computer Science',
                'course_description' => 'Fundamentals of computer science, programming concepts, and computational thinking.',
                'units_lecture' => 3.0,
                'units_lab' => 1.0,
                'department' => 'Information Technology',
                'is_active' => true,
            ],
            [
                'course_code' => 'CS102',
                'course_title' => 'Programming Fundamentals',
                'course_description' => 'Basic programming principles using a modern programming language. Coverage includes variables, control structures, functions, and basic data structures.',
                'units_lecture' => 3.0,
                'units_lab' => 1.0,
                'department' => 'Information Technology',
                'is_active' => true,
            ],
            [
                'course_code' => 'CS201',
                'course_title' => 'Data Structures',
                'course_description' => 'Study of fundamental data structures including arrays, linked lists, stacks, queues, trees, and graphs.',
                'units_lecture' => 3.0,
                'units_lab' => 1.0,
                'department' => 'Information Technology',
                'is_active' => true,
            ],
            [
                'course_code' => 'CS301',
                'course_title' => 'Database Systems',
                'course_description' => 'Relational databases, SQL, normalization, transactions, and database design principles.',
                'units_lecture' => 3.0,
                'units_lab' => 1.0,
                'department' => 'Information Technology',
                'is_active' => true,
            ],
            [
                'course_code' => 'CS302',
                'course_title' => 'Web Development',
                'course_description' => 'Front-end and back-end web development. HTML, CSS, JavaScript, and server-side frameworks.',
                'units_lecture' => 3.0,
                'units_lab' => 1.0,
                'department' => 'Information Technology',
                'is_active' => true,
            ],
            [
                'course_code' => 'CS303',
                'course_title' => 'Software Engineering',
                'course_description' => 'Software development life cycle, design methodologies, testing, and project management.',
                'units_lecture' => 3.0,
                'units_lab' => 1.0,
                'department' => 'Information Technology',
                'is_active' => true,
            ],
        ];

        foreach ($courses as $course) {
            Course::firstOrCreate(
                ['course_code' => $course['course_code']],
                $course
            );
        }
    }
}
