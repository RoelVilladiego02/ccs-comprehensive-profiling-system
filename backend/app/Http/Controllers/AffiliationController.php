<?php

namespace App\Http\Controllers;

use App\Models\Affiliation;
use App\Models\Student;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AffiliationController extends Controller
{
    /**
     * GET /api/students/{studentId}/affiliations
     * Get all affiliations for a student
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

        $affiliations = Affiliation::where('student_id', $studentId)->get();

        return response()->json([
            'success' => true,
            'data' => $affiliations,
        ]);
    }

    /**
     * POST /api/students/{studentId}/affiliations
     * Create a new affiliation for a student
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
            'organization_name' => 'required|string|max:100',
            'organization_type' => 'required|string|max:50',
            'position_role' => 'nullable|string|max:100',
            'achievements' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        $affiliation = Affiliation::create(array_merge(
            $validated,
            ['student_id' => $studentId]
        ));

        return response()->json([
            'success' => true,
            'message' => 'Affiliation created successfully',
            'data' => $affiliation,
        ], 201);
    }

    /**
     * GET /api/students/{studentId}/affiliations/{affiliationId}
     * Get a specific affiliation
     */
    public function show(int $studentId, int $affiliationId): JsonResponse
    {
        $student = Student::find($studentId);
        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found',
            ], 404);
        }

        $affiliation = Affiliation::where('student_id', $studentId)
            ->where('affiliation_id', $affiliationId)
            ->first();

        if (!$affiliation) {
            return response()->json([
                'success' => false,
                'message' => 'Affiliation not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $affiliation,
        ]);
    }

    /**
     * PUT /api/students/{studentId}/affiliations/{affiliationId}
     * Update an affiliation
     */
    public function update(int $studentId, int $affiliationId, Request $request): JsonResponse
    {
        $student = Student::find($studentId);
        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found',
            ], 404);
        }

        $affiliation = Affiliation::where('student_id', $studentId)
            ->where('affiliation_id', $affiliationId)
            ->first();

        if (!$affiliation) {
            return response()->json([
                'success' => false,
                'message' => 'Affiliation not found',
            ], 404);
        }

        $validated = $request->validate([
            'organization_name' => 'nullable|string|max:100',
            'organization_type' => 'nullable|string|max:50',
            'position_role' => 'nullable|string|max:100',
            'achievements' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        $affiliation->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Affiliation updated successfully',
            'data' => $affiliation,
        ]);
    }

    /**
     * DELETE /api/students/{studentId}/affiliations/{affiliationId}
     * Delete an affiliation
     */
    public function destroy(int $studentId, int $affiliationId): JsonResponse
    {
        $student = Student::find($studentId);
        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found',
            ], 404);
        }

        $affiliation = Affiliation::where('student_id', $studentId)
            ->where('affiliation_id', $affiliationId)
            ->first();

        if (!$affiliation) {
            return response()->json([
                'success' => false,
                'message' => 'Affiliation not found',
            ], 404);
        }

        $affiliation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Affiliation deleted successfully',
        ]);
    }
}
