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
        // Get all courses and faculty
        $courses = Course::all();
        $faculty = Faculty::all();

        if ($courses->isEmpty() || $faculty->isEmpty()) {
            $this->command->warn('No courses or faculty found. Skipping class seeding.');
            return;
        }

        $this->command->info('Starting class seeding with 15 faculty members...');

        // Create 2 classes per faculty = 30 classes total
        $classesPerFaculty = 2;
        $totalClasses = $faculty->count() * $classesPerFaculty;
        
        // Calculate max students per class for fair distribution
        $totalStudents = Student::count();
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

        // Enroll students fairly across all classes using chunked queries
        $verifyCount = Student::count();
        if ($verifyCount === 0) {
            $this->command->error('❌ No students found in database! Run StudentSeeder first.');
            return;
        }

        $this->command->info("Found {$verifyCount} students to enroll.");
        $this->command->info("Enrolling students using bulk insert...");

        $studentOffset = 0;
        $totalEnrolled = 0;

        foreach ($allClasses as $class) {
            $spotsAvailable = min(
                $class->max_students,
                $verifyCount - $studentOffset
            );

            if ($spotsAvailable <= 0) {
                $this->command->warn("  No more students to enroll. Stopping.");
                break;
            }

            // Fetch only the students needed for THIS class (memory efficient)
            $studentsForClass = Student::skip($studentOffset)
                ->take($spotsAvailable)
                ->get(['student_id']);

            if ($studentsForClass->isEmpty()) {
                $this->command->warn("  Class {$class->class_id}: No students fetched at offset {$studentOffset}.");
                break;
            }

            // Build bulk insert array
            $enrollmentRecords = $studentsForClass->map(fn($s) => [
                'student_id'        => $s->student_id,
                'class_id'          => $class->class_id,
                'enrollment_status' => 'Enrolled',
                'enrollment_date'   => now()->toDateString(),
            ])->toArray();

            // Bulk insert (much faster than individual ::create() calls)
            StudentClassStatus::insert($enrollmentRecords);

            $actualCount = count($enrollmentRecords);

            // Update enrolled count to match actual insertions
            $class->update(['enrolled_students' => $actualCount]);

            $studentOffset += $actualCount;
            $totalEnrolled += $actualCount;

            $this->command->info(
                "  Class {$class->class_id} (section {$class->section}): {$actualCount} students enrolled."
            );
        }

        $this->command->info("\n✓ Enrollment complete!");
        $this->command->info("  Classes created : {$totalClasses}");
        $this->command->info("  Students enrolled: {$totalEnrolled}");
        $this->command->info("  DB verify: " . StudentClassStatus::count() . " records in student_class_status");
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
