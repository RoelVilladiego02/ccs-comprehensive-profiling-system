<?php

namespace Database\Factories;

use App\Models\StudentViolations;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\StudentViolations>
 */
class StudentViolationsFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $violationDate = $this->faker->dateTimeThisYear();
        
        return [
            'student_id' => Student::factory(),
            'violation_type' => $this->faker->randomElement([
                'Attendance',
                'Academic Misconduct',
                'Classroom Conduct',
                'Dress Code',
                'Bullying',
                'Substance Use',
                'Property Damage',
                'Insubordination'
            ]),
            'violation_description' => $this->faker->sentence(),
            'violation_date' => $violationDate,
            'offense_level' => $this->faker->randomElement([
                'Minor',
                'Moderate',
                'Major',
                'Grave'
            ]),
            'reported_by' => $this->faker->name(),
            'action_taken' => $this->faker->randomElement([
                'Verbal Warning',
                'Written Warning',
                'Detention',
                'Suspension',
                'Community Service',
                'Parental Conference'
            ]),
            'penalty' => $this->faker->randomElement([
                '1 Day',
                '3 Days',
                '1 Week',
                '2 Weeks',
                null,
                null
            ]),
            'status' => $this->faker->randomElement([
                'Resolved',
                'Pending',
                'Dismissed'
            ]),
            'resolution_date' => $this->faker->randomElement([
                $violationDate->modify('+' . $this->faker->numberBetween(1, 30) . ' days'),
                null,
                null
            ]),
            'remarks' => $this->faker->randomElement([
                $this->faker->paragraph(),
                null,
                null
            ]),
            'supporting_document' => null,
        ];
    }
}
