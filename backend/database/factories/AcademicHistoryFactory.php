<?php

namespace Database\Factories;

use App\Models\AcademicHistory;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\AcademicHistory>
 */
class AcademicHistoryFactory extends Factory
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
            'school_name' => $this->faker->company() . ' Academy',
            'program_course' => $this->faker->randomElement([
                'BS Information Technology',
                'BS Computer Science',
                'BS Information Systems',
                'BS Engineering',
                'General Education',
                'Senior High School'
            ]),
            'academic_level' => $this->faker->randomElement([
                'High School',
                'Junior High School',
                'Bachelor',
                'Associate',
                'Vocational'
            ]),
            'honors_awards' => $this->faker->randomElement([
                'Dean\'s List',
                'Cum Laude',
                'Magna Cum Laude',
                'Summa Cum Laude',
                null,
                null,
                null
            ]),
            'gpa' => $this->faker->randomFloat(2, 2.5, 4.0),
        ];
    }
}
