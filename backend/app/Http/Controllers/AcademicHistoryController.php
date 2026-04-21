<?php

namespace App\Http\Controllers;

use App\Models\AcademicHistory;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AcademicHistoryController extends Controller
{
    /**
     * GET /api/students/{studentId}/academic-history
     * Get all academic history records for a student
     */
    public function index(int $studentId): JsonResponse
    {
        $student = Student::find($studentId);
        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found',
            ], 404);
        }

        $history = AcademicHistory::where('student_id', $studentId)->get();

        return response()->json([
            'success' => true,
            'data' => $history,
        ]);
    }

    /**
     * POST /api/students/{studentId}/academic-history
     * Create a new academic history record
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
            'school_name' => 'required|string|max:150',
            'program_course' => 'required|string|max:150',
            'academic_level' => 'required|string|max:50',
            'honors_awards' => 'nullable|string',
            'gpa' => 'nullable|numeric|min:0|max:4.0',
        ]);

        $record = AcademicHistory::create(array_merge(
            $validated,
            ['student_id' => $studentId]
        ));

        return response()->json([
            'success' => true,
            'message' => 'Academic history record created successfully',
            'data' => $record,
        ], 201);
    }

    /**
     * GET /api/students/{studentId}/academic-history/{academicId}
     * Get a specific academic history record
     */
    public function show(int $studentId, int $academicId): JsonResponse
    {
        $student = Student::find($studentId);
        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found',
            ], 404);
        }

        $record = AcademicHistory::where('student_id', $studentId)
            ->where('academic_id', $academicId)
            ->first();

        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'Academic history record not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $record,
        ]);
    }

    /**
     * PUT /api/students/{studentId}/academic-history/{academicId}
     * Update an academic history record
     */
    public function update(int $studentId, int $academicId, Request $request): JsonResponse
    {
        $student = Student::find($studentId);
        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found',
            ], 404);
        }

        $record = AcademicHistory::where('student_id', $studentId)
            ->where('academic_id', $academicId)
            ->first();

        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'Academic history record not found',
            ], 404);
        }

        $validated = $request->validate([
            'school_name' => 'nullable|string|max:150',
            'program_course' => 'nullable|string|max:150',
            'academic_level' => 'nullable|string|max:50',
            'honors_awards' => 'nullable|string',
            'gpa' => 'nullable|numeric|min:0|max:4.0',
        ]);

        $record->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Academic history record updated successfully',
            'data' => $record,
        ]);
    }

    /**
     * DELETE /api/students/{studentId}/academic-history/{academicId}
     * Delete an academic history record
     */
    public function destroy(int $studentId, int $academicId): JsonResponse
    {
        $student = Student::find($studentId);
        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found',
            ], 404);
        }

        $record = AcademicHistory::where('student_id', $studentId)
            ->where('academic_id', $academicId)
            ->first();

        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'Academic history record not found',
            ], 404);
        }

        $record->delete();

        return response()->json([
            'success' => true,
            'message' => 'Academic history record deleted successfully',
        ]);
    }
}
