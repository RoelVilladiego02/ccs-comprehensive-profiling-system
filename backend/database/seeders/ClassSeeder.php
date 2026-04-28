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
     * 
     * Strategy:
     * - Create 2 classes per faculty (30 classes total for 15 faculty)
     * - Rotate courses evenly across classes
     * - Calculate max_students to fairly distribute 1000 students
     * - Enroll students sequentially for fair distribution
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

        $this->command->info('Starting class seeding with 15 faculty members...');

        // Create 2 classes per faculty = 30 classes total
        $classesPerFaculty = 2;
        $totalClasses = $faculty->count() * $classesPerFaculty;
        
        // Calculate max students per class for fair distribution
        $totalStudents = $students->count();
        $baseMaxStudents = (int) ceil($totalStudents / $totalClasses);
        
        if ($totalStudents === 0) {
            $this->command->warn('⚠️  No students found! Make sure StudentSeeder runs before ClassSeeder.');
            $baseMaxStudents = 30; // Default for empty database
        }
        
        $this->command->info("Creating {$totalClasses} classes to enroll ~{$totalStudents} students.");
        $this->command->info("Target: ~{$baseMaxStudents} students per class.\n");

        $allClasses = [];
        $courseIndex = 0;
        $classIndex = 0;

        // Create classes: 2 per faculty, rotating through courses
        foreach ($faculty as $facultyMember) {
            for ($i = 0; $i < $classesPerFaculty; $i++) {
                // Rotate through courses
                $course = $courses[$courseIndex % $courses->count()];
                $courseIndex++;

                // Generate section letter
                $section = $this->getSectionLetter($classIndex);

                // Vary max_students slightly (±5 from base) for realistic diversity
                $maxStudents = $baseMaxStudents + rand(-5, 5);
                $maxStudents = max(20, min(50, $maxStudents)); // Keep in range 20-50

                // Generate valid schedule times (end must be after start)
                $startTime = $this->getRandomTime();
                $endTime = $this->getRandomEndTime($startTime);

                $class = SchoolClass::create([
                    'course_id' => $course->course_id,
                    'faculty_id' => $facultyMember->faculty_id,
                    'section' => $section,
                    'academic_year' => '2025-2026',
                    'semester' => (($classIndex % 3) + 1), // Distribute across 3 semesters
                    'schedule_day' => $this->getRandomScheduleDay(),
                    'schedule_time' => $startTime,
                    'schedule_end_time' => $endTime,
                    'room' => 'Room ' . (101 + ($classIndex % 20)),
                    'max_students' => $maxStudents,
                    'enrolled_students' => 0,
                    'class_status' => 'Open',
                ]);

                $allClasses[] = $class;
                $classIndex++;
            }
        }

        $this->command->info("Created {$totalClasses} classes.\n");

        // Enroll students fairly across all classes
        if (!$students->isEmpty()) {
            $this->command->info("Enrolling students across {$totalClasses} classes...");

            $studentIndex = 0;
            $enrolledCount = 0;

            // Distribute students sequentially to ensure fair load
            foreach ($allClasses as $class) {
                $enrollmentsForClass = min(
                    $class->max_students,
                    $students->count() - $studentIndex
                );

                if ($enrollmentsForClass <= 0) {
                    break;
                }

                // Enroll students for this class
                for ($i = 0; $i < $enrollmentsForClass; $i++) {
                    $student = $students[$studentIndex];

                    StudentClassStatus::create([
                        'student_id' => $student->student_id,
                        'class_id' => $class->class_id,
                        'enrollment_status' => 'Enrolled',
                        'enrollment_date' => now(),
                    ]);

                    $studentIndex++;
                    $enrolledCount++;
                }

                // Update enrolled_students count
                $class->update(['enrolled_students' => $enrollmentsForClass]);
            }

            $this->command->info("Successfully enrolled {$enrolledCount} students across {$totalClasses} classes!");
        }

        $this->command->info("\n✓ Classes and student enrollments seeded successfully!");
        $this->command->info("  - Faculty: " . $faculty->count());
        $this->command->info("  - Classes: " . $totalClasses);
        $this->command->info("  - Total Students: " . $totalStudents);
    }

    private function getSectionLetter(int $index): string
    {
        $sections = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        return $sections[$index % count($sections)];
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

    private function getRandomEndTime(?string $startTime = null): string
    {
        $startHour = $startTime ? (int)substr($startTime, 0, 2) : 8;
        
        // Generate end time 1-4 hours after start time
        $duration = rand(1, 4);
        $endHour = $startHour + $duration;
        
        // Cap at 17:00 (5 PM)
        if ($endHour > 17) {
            $endHour = 17;
        }
        
        return str_pad($endHour, 2, '0', STR_PAD_LEFT) . ':00';
    }
}
