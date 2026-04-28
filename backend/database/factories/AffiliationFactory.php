<?php

namespace Database\Factories;

use App\Models\Affiliation;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Affiliation>
 */
class AffiliationFactory extends Factory
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
            'organization_name' => $this->faker->company() . ' ' . $this->faker->randomElement([
                'Club',
                'Organization',
                'Society',
                'Association',
                'Group'
            ]),
            'organization_type' => $this->faker->randomElement([
                'Sports',
                'Academic',
                'Cultural',
                'Professional',
                'Volunteer',
                'Religious',
                'Social'
            ]),
            'position_role' => $this->faker->randomElement([
                'Member',
                'Officer',
                'President',
                'Vice President',
                'Secretary',
                'Treasurer',
                'Advisor',
                'Coach'
            ]),
            'achievements' => $this->faker->randomElement([
                'Award Recipient',
                'Recognition',
                'Leadership Award',
                null,
                null,
                null
            ]),
            'description' => $this->faker->sentence(),
        ];
    }
}
