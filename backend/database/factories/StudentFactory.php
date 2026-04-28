<?php

namespace Database\Factories;

use App\Models\Student;
use App\Models\AcademicHistory;
use App\Models\NonAcademicHistory;
use App\Models\StudentViolations;
use App\Models\Skills;
use App\Models\Affiliation;
use App\Models\MedicalRecords;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Student>
 */
class StudentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        static $studentCounter = null;

        // Initialize counter to highest existing student_number + 1
        if ($studentCounter === null) {
            $maxStudent = \App\Models\Student::max('student_number');
            $studentCounter = $maxStudent ? (int)$maxStudent + 1 : 2024004;
        }

        $gender = $this->faker->randomElement(['Male', 'Female']);
        $firstName = $this->faker->firstName($gender === 'Male' ? 'male' : 'female');
        $lastName = $this->faker->lastName();

        return [
            'student_number' => (string)$studentCounter++,
            'first_name' => $firstName,
            'middle_name' => $this->faker->firstName(),
            'last_name' => $lastName,
            'suffix' => $this->faker->randomElement([null, 'Jr.', 'Sr.', 'III', 'IV']),
            'gender' => $gender,
            'email' => $this->faker->unique()->safeEmail(),
            'phone_number' => $this->faker->phoneNumber(),
            'student_identification' => $this->faker->randomElement(['Regular', 'Irregular', 'Graduated', 'On Leave', 'Dropped']),
            'curriculum' => $this->faker->randomElement(['BS Information Technology', 'BS Computer Science', 'BS Information Systems', 'BS Engineering']),
        ];
    }

    /**
     * Configure the factory to create related records
     */
    public function configure(): static
    {
        return $this->afterCreating(function (Student $student) {
            // Create 1-3 Academic History records
            AcademicHistory::factory(rand(1, 3))->create([
                'student_id' => $student->student_id,
            ]);

            // Create 1-3 Non-Academic History records
            NonAcademicHistory::factory(rand(1, 3))->create([
                'student_id' => $student->student_id,
            ]);

            // Create 0-2 Violation records (many students have no violations)
            if (rand(1, 100) > 60) { // 40% chance of having violations
                StudentViolations::factory(rand(1, 2))->create([
                    'student_id' => $student->student_id,
                ]);
            }

            // Create 2-5 Skills records
            Skills::factory(rand(2, 5))->create([
                'student_id' => $student->student_id,
            ]);

            // Create 1-2 Affiliation records
            Affiliation::factory(rand(1, 2))->create([
                'student_id' => $student->student_id,
            ]);

            // Create Medical Records (one per student)
            MedicalRecords::factory()->create([
                'student_id' => $student->student_id,
            ]);
        });
    }

    /**
     * Indicate that the student is irregular.
     */
    public function irregular(): static
    {
        return $this->state(fn (array $attributes) => [
            'student_identification' => 'Irregular',
        ]);
    }

    /**
     * Indicate that the student is graduated.
     */
    public function graduated(): static
    {
        return $this->state(fn (array $attributes) => [
            'student_identification' => 'Graduated',
        ]);
    }

    /**
     * Indicate that the student is on leave.
     */
    public function onLeave(): static
    {
        return $this->state(fn (array $attributes) => [
            'student_identification' => 'On Leave',
        ]);
    }

    /**
     * Indicate that the student is dropped.
     */
    public function dropped(): static
    {
        return $this->state(fn (array $attributes) => [
            'student_identification' => 'Dropped',
        ]);
    }
}
