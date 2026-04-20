<?php

namespace Database\Seeders;

use App\Models\Student;
use App\Models\AcademicHistory;
use App\Models\NonAcademicHistory;
use App\Models\Skills;
use App\Models\Affiliation;
use App\Models\StudentViolations;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class StudentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $faker = Faker::create();

        // Create test student record to match the test user
        $student1 = Student::firstOrCreate(
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
        $this->seedStudentRelations($student1, $faker);

        // Additional test students
        $student2 = Student::firstOrCreate(
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
        $this->seedStudentRelations($student2, $faker);

        $student3 = Student::firstOrCreate(
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
        $this->seedStudentRelations($student3, $faker);

        // Generate 1000 additional students using factory
        $this->command->info('Generating 1000 sample students with related data...');
        
        $studentCount = 0;
        $chunkSize = 50; // Process 50 students at a time

        for ($chunk = 0; $chunk < 20; $chunk++) {
            // Create students for this chunk
            $students = Student::factory($chunkSize)->create();

            foreach ($students as $student) {
                $this->seedStudentRelations($student, $faker);
                $studentCount++;

                if ($studentCount % 100 === 0) {
                    $this->command->info("Created {$studentCount} students...");
                }
            }

            // Clear memory after each chunk
            unset($students);
        }

        $this->command->info("Successfully created {$studentCount} sample students with all related data!");
    }

    /**
     * Seed related data for a student
     */
    private function seedStudentRelations(Student $student, $faker): void
    {
        // Academic History
        AcademicHistory::firstOrCreate(
            ['student_id' => $student->student_id],
            [
                'student_id' => $student->student_id,
                'school_name' => $faker->randomElement(['Santo Tomas High School', 'San Beda College', 'Ateneo de Manila', 'De La Salle University']),
                'program_course' => 'Information Technology',
                'academic_level' => 'Bachelor',
                'honors_awards' => $faker->randomElement(['With Honors', 'Cum Laude', null, null]),
                'gpa' => $faker->randomFloat(2, 2.5, 4.0),
            ]
        );

        // Non-Academic History (2-3 records per student)
        $nonAcademicRecords = [];
        $nonAcademicCount = $faker->numberBetween(2, 3);
        for ($i = 0; $i < $nonAcademicCount; $i++) {
            $nonAcademicRecords[] = [
                'student_id' => $student->student_id,
                'activity_name' => $faker->randomElement([
                    'Science Olympiad',
                    'Debate Club Competition',
                    'Basketball Tournament',
                    'Programming Contest',
                    'Music Performance',
                    'Volunteer Work',
                    'Leadership Summit'
                ]),
                'activity_type' => $faker->randomElement(['Competition', 'Performance', 'Volunteer', 'Leadership']),
                'organization' => $faker->randomElement(['CCS Club', 'Student Association', 'Community Center', 'Local NGO']),
                'role_position' => $faker->randomElement(['Participant', 'Team Leader', 'Volunteer', 'Organizer']),
                'achievement' => $faker->randomElement(['First Place', 'Gold Medal', 'Certificate', 'Recognition', null]),
                'description' => $faker->sentence(),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        NonAcademicHistory::insert($nonAcademicRecords);

        // Skills (3-5 records per student)
        $skillNames = ['Communication', 'Leadership', 'Problem Solving', 'Critical Thinking', 'Programming', 'Public Speaking', 'Team Work', 'Time Management', 'Creativity'];
        $skillCategories = ['Technical', 'Soft Skills', 'Leadership', 'Academic'];
        $proficiencyLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

        $skillRecords = [];
        $skillCount = $faker->numberBetween(3, 5);
        for ($i = 0; $i < $skillCount; $i++) {
            $skillRecords[] = [
                'student_id' => $student->student_id,
                'skill_name' => $faker->randomElement($skillNames),
                'skill_category' => $faker->randomElement($skillCategories),
                'proficiency_level' => $faker->randomElement($proficiencyLevels),
                'years_experience' => $faker->numberBetween(0, 5),
                'description' => $faker->sentence(),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        Skills::insert($skillRecords);

        // Affiliations (2-4 records per student)
        $organizationTypes = ['Sports', 'Academic Club', 'Organization', 'Community Service'];
        $positions = ['Member', 'Officer', 'President', 'Secretary', 'Treasurer', 'Coordinator'];

        $affiliationRecords = [];
        $affiliationCount = $faker->numberBetween(2, 4);
        for ($i = 0; $i < $affiliationCount; $i++) {
            $affiliationRecords[] = [
                'student_id' => $student->student_id,
                'organization_name' => $faker->randomElement([
                    'Computer Science Club',
                    'Debating Society',
                    'Basketball Team',
                    'Environmental Club',
                    'Student Government',
                    'Coding Bootcamp',
                    'Innovation Lab'
                ]),
                'organization_type' => $faker->randomElement($organizationTypes),
                'position_role' => $faker->randomElement($positions),
                'achievements' => $faker->sentence(),
                'description' => $faker->paragraph(),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        Affiliation::insert($affiliationRecords);

        // Violations (1-2 records per student - ensure seeded data)
        $violationRecords = [];
        $violationCount = $faker->numberBetween(1, 2);
        for ($i = 0; $i < $violationCount; $i++) {
            $violationRecords[] = [
                'student_id' => $student->student_id,
                'violation_type' => $faker->randomElement(['Academic Dishonesty', 'Attendance', 'Code of Conduct', 'Dress Code', 'Other']),
                'violation_description' => $faker->sentence(),
                'violation_date' => $faker->dateTimeBetween('-1 year', 'now'),
                'offense_level' => $faker->randomElement(['Minor', 'Moderate', 'Major', 'Grave']),
                'reported_by' => $faker->firstName(),
                'action_taken' => $faker->sentence(),
                'status' => $faker->randomElement(['Pending', 'Resolved', 'Dismissed']),
                'resolution_date' => $faker->randomElement([null, $faker->dateTimeBetween('-3 months', 'now')]),
                'penalty' => $faker->randomElement(['Warning', 'Suspension', 'Fine', 'Community Service', null]),
                'remarks' => $faker->paragraph(),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }
        StudentViolations::insert($violationRecords);
    }
}
