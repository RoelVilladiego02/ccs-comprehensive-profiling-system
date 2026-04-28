<?php

namespace Database\Factories;

use App\Models\Skills;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Skills>
 */
class SkillsFactory extends Factory
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
            'skill_name' => $this->faker->randomElement([
                'PHP',
                'JavaScript',
                'Python',
                'Java',
                'C++',
                'React',
                'Vue.js',
                'Laravel',
                'Django',
                'SQL',
                'MongoDB',
                'Git',
                'Docker',
                'AWS',
                'Public Speaking',
                'Leadership',
                'Problem Solving',
                'Communication',
                'Teamwork',
                'Critical Thinking'
            ]),
            'skill_category' => $this->faker->randomElement([
                'Technical',
                'Programming',
                'Framework',
                'Database',
                'DevOps',
                'Soft Skills',
                'Leadership',
                'Communication'
            ]),
            'proficiency_level' => $this->faker->randomElement([
                'Beginner',
                'Intermediate',
                'Advanced',
                'Expert'
            ]),
            'years_experience' => $this->faker->numberBetween(0, 10),
            'description' => $this->faker->sentence(),
        ];
    }
}
