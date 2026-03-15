<?php

namespace App\Services;

use App\Models\MedicalRecords;

class MedicalRecordsService
{
    /**
     * Create or update medical records
     */
    public function upsertMedicalRecords(int $studentId, array $data): MedicalRecords
    {
        return MedicalRecords::updateOrCreate(
            ['student_id' => $studentId],
            $data
        );
    }

    /**
     * Get student medical records
     */
    public function getMedicalRecords(int $studentId): ?MedicalRecords
    {
        return MedicalRecords::where('student_id', $studentId)->first();
    }

    /**
     * Update medical checkup date
     */
    public function updateMedicalCheckupDate(int $studentId): bool
    {
        return MedicalRecords::where('student_id', $studentId)
            ->update(['last_medical_checkup' => now()->toDateString()]);
    }

    /**
     * Get students with medical conditions
     */
    public function getStudentsWithMedicalConditions()
    {
        return MedicalRecords::whereNotNull('medical_conditions')
            ->with('student')
            ->get();
    }

    /**
     * Get students with disabilities
     */
    public function getStudentsWithDisabilities()
    {
        return MedicalRecords::whereNotNull('disability')
            ->with('student')
            ->get();
    }

    /**
     * Get students with allergies
     */
    public function getStudentsWithAllergies()
    {
        return MedicalRecords::whereNotNull('allergies')
            ->with('student')
            ->get();
    }
}
