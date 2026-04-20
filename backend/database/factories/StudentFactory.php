<?php

namespace Database\Factories;

use App\Models\Student;
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
