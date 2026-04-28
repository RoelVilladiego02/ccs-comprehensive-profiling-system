<?php

namespace Database\Factories;

use App\Models\MedicalRecords;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MedicalRecords>
 */
class MedicalRecordsFactory extends Factory
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
            'blood_type' => $this->faker->randomElement([
                'A+',
                'A-',
                'B+',
                'B-',
                'AB+',
                'AB-',
                'O+',
                'O-'
            ]),
            'allergies' => $this->faker->randomElement([
                'Peanuts',
                'Shellfish',
                'Penicillin',
                'Aspirin',
                'Latex',
                'None',
                'None',
                'None'
            ]),
            'medical_conditions' => $this->faker->randomElement([
                'Asthma',
                'Diabetes',
                'Hypertension',
                'Migraine',
                'None',
                'None',
                'None',
                'None'
            ]),
            'medications' => $this->faker->randomElement([
                'Vitamin D',
                'Aspirin',
                'Metformin',
                'Albuterol',
                'None',
                'None',
                'None',
                'None'
            ]),
            'disability' => $this->faker->randomElement([
                null,
                null,
                null,
                'Hearing Impairment',
                'Visual Impairment',
                'Mobility Limitation',
                'Learning Disability'
            ]),
            'last_medical_checkup' => $this->faker->dateTimeBetween('-1 year', 'now'),
            'emergency_contact_name' => $this->faker->name(),
            'emergency_contact_number' => $this->faker->phoneNumber(),
            'notes' => $this->faker->randomElement([
                $this->faker->paragraph(),
                null,
                null
            ]),
        ];
    }
}
