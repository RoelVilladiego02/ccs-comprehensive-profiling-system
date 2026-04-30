<?php

namespace Database\Seeders;

use App\Models\Lesson;
use App\Models\Syllabus;
use App\Models\Faculty;
use Illuminate\Database\Seeder;

class LessonSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Seeds lessons associated with syllabi and faculty members
     * Lessons are associated with a faculty member so they can only view their own lessons
     */
    public function run(): void
    {
        $syllabi = Syllabus::all();
        $faculty = Faculty::all();

        if ($syllabi->isEmpty() || $faculty->isEmpty()) {
            $this->command->warn('No syllabi or faculty found. Skipping lesson seeding.');
            return;
        }

        $lessonTitles = [
            'Introduction and Course Overview',
            'Fundamentals and Core Concepts',
            'Practical Applications and Examples',
            'Advanced Topics and Deep Dive',
            'Case Studies and Real-World Scenarios',
            'Problem-Solving Techniques',
            'Best Practices and Standards',
            'Review and Assessment Preparation',
            'Practical Exercises and Lab Work',
            'Industry Trends and Future Directions',
            'Collaborative Projects',
            'Guest Lectures and Expert Insights',
            'Midterm Review and Exam Preparation',
            'Advanced Implementation Strategies',
            'Final Project Guidance',
        ];

        $lessonsPerSyllabus = 5;
        $facultyIndex = 0;

        foreach ($syllabi as $syllabus) {
            for ($i = 1; $i <= $lessonsPerSyllabus; $i++) {
                // Rotate through faculty members
                $currentFaculty = $faculty[$facultyIndex % $faculty->count()];
                $facultyIndex++;

                $titleIndex = (($syllabus->syllabus_id - 1) * $lessonsPerSyllabus + $i - 1) % count($lessonTitles);

                Lesson::firstOrCreate(
                    [
                        'syllabus_id' => $syllabus->syllabus_id,
                        'faculty_id' => $currentFaculty->faculty_id,
                        'lesson_number' => $i,
                    ],
                    [
                        'title' => $lessonTitles[$titleIndex],
                        'content' => 'Detailed content for lesson ' . $i . ' of ' . $syllabus->title . '. '
                            . 'This lesson covers fundamental and advanced concepts related to the course objectives. '
                            . 'Students will learn through a combination of theoretical knowledge, practical examples, and hands-on exercises.',
                        'objectives' => '• Understand key concepts and principles'
                            . '\n• Apply knowledge in practical scenarios'
                            . '\n• Develop critical thinking skills'
                            . '\n• Prepare for real-world applications',
                        'duration_hours' => rand(1, 3),
                        'is_active' => true,
                    ]
                );
            }
        }

        $this->command->info('Lesson seeding completed successfully!');
        $this->command->info('Each lesson is associated with a faculty member for access control.');
    }
}
