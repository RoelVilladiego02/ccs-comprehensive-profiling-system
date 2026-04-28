<?php

namespace Database\Factories;

use App\Models\NonAcademicHistory;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\NonAcademicHistory>
 */
class NonAcademicHistoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'student_id' => Student::factory(),
            'activity_name' => $this->faker->catchPhrase(),
            'activity_type' => $this->faker->randomElement([
                'Sports',
                'Arts & Culture',
                'Community Service',
                'Leadership',
                'Academic Club',
                'Tech Club',
                'Gaming Club',
                'Photography Club'
            ]),
            'organization' => $this->faker->company(),
            'role_position' => $this->faker->randomElement([
                'Member',
                'Officer',
                'President',
                'Vice President',
                'Secretary',
                'Treasurer',
                'Coordinator',
                'Volunteer'
            ]),
            'achievement' => $this->faker->randomElement([
                'First Place',
                'Second Place',
                'Third Place',
                'Best in Category',
                'Participant',
                null,
                null
            ]),
            'description' => $this->faker->sentence(),
        ];
    }
}
