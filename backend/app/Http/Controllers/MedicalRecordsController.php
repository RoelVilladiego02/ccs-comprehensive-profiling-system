<?php

namespace App\Http\Controllers;

use App\Models\MedicalRecords;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MedicalRecordsController extends Controller
{
    /**
     * POST /api/students/{studentId}/medical-records
     * Create or update medical records for a student
     */
    public function store(int $studentId, Request $request): JsonResponse
    {
        $student = Student::find($studentId);
        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found',
            ], 404);
        }

        $validated = $request->validate([
            'blood_type' => 'nullable|string|max:10',
            'allergies' => 'nullable|string',
            'medical_conditions' => 'nullable|string',
            'medications' => 'nullable|string',
            'disability' => 'nullable|string',
            'last_medical_checkup' => 'nullable|date',
            'emergency_contact_name' => 'nullable|string|max:100',
            'emergency_contact_number' => 'nullable|string|max:20',
            'notes' => 'nullable|string',
        ]);

        $medicalRecord = MedicalRecords::updateOrCreate(
            ['student_id' => $studentId],
            array_merge($validated, ['student_id' => $studentId])
        );

        return response()->json([
            'success' => true,
            'message' => 'Medical records saved successfully',
            'data' => $medicalRecord,
        ], 201);
    }

    /**
     * GET /api/students/{studentId}/medical-records
     * Get medical records for a student
     */
    public function show(int $studentId): JsonResponse
    {
        $student = Student::find($studentId);
        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found',
            ], 404);
        }

        $medicalRecord = MedicalRecords::where('student_id', $studentId)->first();

        if (!$medicalRecord) {
            return response()->json([
                'success' => false,
                'message' => 'No medical records found for this student',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $medicalRecord,
        ]);
    }

    /**
     * PUT /api/students/{studentId}/medical-records
     * Update medical records for a student
     */
    public function update(int $studentId, Request $request): JsonResponse
    {
        $student = Student::find($studentId);
        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found',
            ], 404);
        }

        $medicalRecord = MedicalRecords::where('student_id', $studentId)->first();
        if (!$medicalRecord) {
            return response()->json([
                'success' => false,
                'message' => 'No medical records found for this student',
            ], 404);
        }

        $validated = $request->validate([
            'blood_type' => 'nullable|string|max:10',
            'allergies' => 'nullable|string',
            'medical_conditions' => 'nullable|string',
            'medications' => 'nullable|string',
            'disability' => 'nullable|string',
            'last_medical_checkup' => 'nullable|date',
            'emergency_contact_name' => 'nullable|string|max:100',
            'emergency_contact_number' => 'nullable|string|max:20',
            'notes' => 'nullable|string',
        ]);

        $medicalRecord->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Medical records updated successfully',
            'data' => $medicalRecord,
        ]);
    }

    /**
     * DELETE /api/students/{studentId}/medical-records
     * Delete medical records for a student
     */
    public function destroy(int $studentId): JsonResponse
    {
        $student = Student::find($studentId);
        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found',
            ], 404);
        }

        $medicalRecord = MedicalRecords::where('student_id', $studentId)->first();
        if (!$medicalRecord) {
            return response()->json([
                'success' => false,
                'message' => 'No medical records found for this student',
            ], 404);
        }

        $medicalRecord->delete();

        return response()->json([
            'success' => true,
            'message' => 'Medical records deleted successfully',
        ]);
    }
}
