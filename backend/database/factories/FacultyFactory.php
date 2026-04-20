<?php

namespace Database\Factories;

use App\Models\Faculty;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Faculty>
 */
class FacultyFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        static $facultyCounter = null;

        // Initialize counter to highest existing faculty_number + 1
        if ($facultyCounter === null) {
            $maxFaculty = \App\Models\Faculty::max('faculty_number');
            $facultyCounter = $maxFaculty ? (int)$maxFaculty + 1 : 2024001;
        }

        $gender = $this->faker->randomElement(['Male', 'Female', 'Prefer not to say']);
        $firstName = $this->faker->firstName($gender === 'Male' ? 'male' : 'female');
        $lastName = $this->faker->lastName();

        return [
            'faculty_number' => (string)$facultyCounter++,
            'first_name' => $firstName,
            'middle_name' => $this->faker->randomElement([$this->faker->firstName(), null]),
            'last_name' => $lastName,
            'suffix' => $this->faker->randomElement([null, 'Jr.', 'Sr.', 'Ph.D.', 'M.D.']),
            'gender' => $gender,
            'email' => $this->faker->unique()->safeEmail(),
            'phone_number' => $this->faker->phoneNumber(),
            'employment_status' => $this->faker->randomElement(['Full-Time', 'Part-Time', 'Probationary', 'Contractual']),
            'department' => $this->faker->randomElement(['Computer Science', 'Information Technology', 'Engineering', 'Mathematics', 'Physics', 'Chemistry']),
        ];
    }

    /**
     * Indicate that the faculty is full-time.
     */
    public function fullTime(): static
    {
        return $this->state(fn (array $attributes) => [
            'employment_status' => 'Full-Time',
        ]);
    }

    /**
     * Indicate that the faculty is part-time.
     */
    public function partTime(): static
    {
        return $this->state(fn (array $attributes) => [
            'employment_status' => 'Part-Time',
        ]);
    }

    /**
     * Indicate that the faculty is probationary.
     */
    public function probationary(): static
    {
        return $this->state(fn (array $attributes) => [
            'employment_status' => 'Probationary',
        ]);
    }

    /**
     * Indicate that the faculty is contractual.
     */
    public function contractual(): static
    {
        return $this->state(fn (array $attributes) => [
            'employment_status' => 'Contractual',
        ]);
    }
}
