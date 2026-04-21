<?php

namespace App\Http\Controllers;

use App\Models\NonAcademicHistory;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NonAcademicHistoryController extends Controller
{
    /**
     * GET /api/students/{studentId}/non-academic-history
     * Get all non-academic history records for a student
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

        $history = NonAcademicHistory::where('student_id', $studentId)->get();

        return response()->json([
            'success' => true,
            'data' => $history,
        ]);
    }

    /**
     * POST /api/students/{studentId}/non-academic-history
     * Create a new non-academic history record
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
            'activity_name' => 'required|string|max:150',
            'activity_type' => 'required|string|max:50',
            'event_date' => 'nullable|date',
            'description' => 'nullable|string',
            'achievement_level' => 'nullable|string|max:50',
        ]);

        $record = NonAcademicHistory::create(array_merge(
            $validated,
            ['student_id' => $studentId]
        ));

        return response()->json([
            'success' => true,
            'message' => 'Non-academic history record created successfully',
            'data' => $record,
        ], 201);
    }

    /**
     * GET /api/students/{studentId}/non-academic-history/{nonAcademicId}
     * Get a specific non-academic history record
     */
    public function show(int $studentId, int $nonAcademicId): JsonResponse
    {
        $student = Student::find($studentId);
        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found',
            ], 404);
        }

        $record = NonAcademicHistory::where('student_id', $studentId)
            ->where('non_academic_id', $nonAcademicId)
            ->first();

        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'Non-academic history record not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $record,
        ]);
    }

    /**
     * PUT /api/students/{studentId}/non-academic-history/{nonAcademicId}
     * Update a non-academic history record
     */
    public function update(int $studentId, int $nonAcademicId, Request $request): JsonResponse
    {
        $student = Student::find($studentId);
        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found',
            ], 404);
        }

        $record = NonAcademicHistory::where('student_id', $studentId)
            ->where('non_academic_id', $nonAcademicId)
            ->first();

        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'Non-academic history record not found',
            ], 404);
        }

        $validated = $request->validate([
            'activity_name' => 'nullable|string|max:150',
            'activity_type' => 'nullable|string|max:50',
            'event_date' => 'nullable|date',
            'description' => 'nullable|string',
            'achievement_level' => 'nullable|string|max:50',
        ]);

        $record->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Non-academic history record updated successfully',
            'data' => $record,
        ]);
    }

    /**
     * DELETE /api/students/{studentId}/non-academic-history/{nonAcademicId}
     * Delete a non-academic history record
     */
    public function destroy(int $studentId, int $nonAcademicId): JsonResponse
    {
        $student = Student::find($studentId);
        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found',
            ], 404);
        }

        $record = NonAcademicHistory::where('student_id', $studentId)
            ->where('non_academic_id', $nonAcademicId)
            ->first();

        if (!$record) {
            return response()->json([
                'success' => false,
                'message' => 'Non-academic history record not found',
            ], 404);
        }

        $record->delete();

        return response()->json([
            'success' => true,
            'message' => 'Non-academic history record deleted successfully',
        ]);
    }
}
