<?php

namespace Database\Seeders;

use App\Models\SchoolClass;
use App\Models\Course;
use App\Models\Faculty;
use App\Models\Student;
use App\Models\StudentClassStatus;
use Illuminate\Database\Seeder;

class ClassSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get all courses, faculty, and students
        $courses = Course::all();
        $faculty = Faculty::all();
        $students = Student::all();

        if ($courses->isEmpty() || $faculty->isEmpty()) {
            $this->command->warn('No courses or faculty found. Skipping class seeding.');
            return;
        }

        if ($students->isEmpty()) {
            $this->command->warn('No students found. Classes will be created but not enrolled.');
        }

        // Create classes for each course, distributed among faculty
        $facultyIndex = 0;
        $sectionLetters = ['A', 'B', 'C', 'D'];
        $sectionIndex = 0;

        foreach ($courses as $course) {
            // Create 2-3 sections per course
            $sections = rand(2, 3);
            
            for ($i = 0; $i < $sections; $i++) {
                $section = $sectionLetters[$sectionIndex % count($sectionLetters)];
                $sectionIndex++;

                // Assign to faculty in round-robin
                $assignedFaculty = $faculty[$facultyIndex % $faculty->count()];
                $facultyIndex++;

                $maxStudents = rand(30, 50);

                $class = SchoolClass::create([
                    'course_id' => $course->course_id,
                    'faculty_id' => $assignedFaculty->faculty_id,
                    'section' => $section,
                    'academic_year' => '2025-2026',
                    'semester' => rand(1, 3),
                    'schedule_day' => $this->getRandomScheduleDay(),
                    'schedule_time' => $this->getRandomTime(),
                    'schedule_end_time' => $this->getRandomEndTime(),
                    'room' => 'Room ' . rand(101, 320),
                    'max_students' => $maxStudents,
                    'enrolled_students' => 0,
                    'class_status' => 'Open',
                ]);

                // Enroll random existing students if available
                if (!$students->isEmpty()) {
                    $enrollmentCount = rand(10, min(40, $maxStudents, $students->count()));
                    $selectedStudents = $students->random(min($enrollmentCount, $students->count()));

                    foreach ($selectedStudents as $student) {
                        StudentClassStatus::create([
                            'student_id' => $student->student_id,
                            'class_id' => $class->class_id,
                            'enrollment_status' => 'Enrolled',
                            'enrollment_date' => now(),
                        ]);
                    }

                    // Update enrolled_students count
                    $class->update(['enrolled_students' => $enrollmentCount]);
                }
            }
        }

        $this->command->info('Classes and student enrollments seeded successfully!');
    }

    private function getRandomScheduleDay(): string
    {
        $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        return $days[array_rand($days)];
    }

    private function getRandomTime(): string
    {
        $times = ['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00'];
        return $times[array_rand($times)];
    }

    private function getRandomEndTime(): string
    {
        $times = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
        return $times[array_rand($times)];
    }
}
