<?php

namespace App\Http\Controllers;

use App\Services\ViolationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ViolationController extends Controller
{
    protected ViolationService $violationService;

    public function __construct(ViolationService $violationService)
    {
        $this->violationService = $violationService;
    }

    /**
     * POST /api/violations
     * Report violation
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:student,student_id',
            'violation_type' => 'required|string|max:100',
            'description' => 'required|string',
            'violation_date' => 'nullable|date_format:Y-m-d',
            'status' => 'nullable|in:Pending,Under Investigation,Resolved',
            'penalty' => 'nullable|string',
        ]);

        $violation = $this->violationService->reportViolation(
            $validated['student_id'],
            $validated
        );

        return response()->json([
            'success' => true,
            'message' => 'Violation reported successfully',
            'data' => $violation,
        ], 201);
    }

    /**
     * GET /api/violations/student/{studentId}
     * Get student violations
     */
    public function getStudentViolations(int $studentId): JsonResponse
    {
        $violations = $this->violationService->getStudentViolations($studentId);

        return response()->json([
            'success' => true,
            'data' => $violations,
        ]);
    }

    /**
     * GET /api/violations/unresolved
     * Get unresolved violations
     */
    public function getUnresolved(): JsonResponse
    {
        $violations = $this->violationService->getUnresolvedViolations();

        return response()->json([
            'success' => true,
            'data' => $violations,
        ]);
    }

    /**
     * GET /api/violations/status/{status}
     * Get violations by status
     */
    public function getByStatus(string $status): JsonResponse
    {
        $validStatuses = ['Pending', 'Under Investigation', 'Resolved'];

        if (!in_array($status, $validStatuses)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid status',
            ], 400);
        }

        $violations = $this->violationService->getViolationsByStatus($status);

        return response()->json([
            'success' => true,
            'data' => $violations,
        ]);
    }

    /**
     * GET /api/violations/type/{type}
     * Get violations by type
     */
    public function getByType(string $type): JsonResponse
    {
        $violations = $this->violationService->getViolationsByType($type);

        return response()->json([
            'success' => true,
            'data' => $violations,
        ]);
    }

    /**
     * GET /api/violations/recent
     * Get recent violations
     */
    public function getRecent(Request $request): JsonResponse
    {
        $days = $request->query('days', 30);
        $violations = $this->violationService->getRecentViolations($days);

        return response()->json([
            'success' => true,
            'data' => $violations,
        ]);
    }

    /**
     * PUT /api/violations/{violationId}/resolve
     * Resolve violation
     */
    public function resolve(Request $request, int $violationId): JsonResponse
    {
        $validated = $request->validate([
            'penalty' => 'nullable|string',
        ]);

        $success = $this->violationService->resolveViolation(
            $violationId,
            $validated['penalty'] ?? null
        );

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Violation not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Violation resolved successfully',
        ]);
    }

    /**
     * DELETE /api/violations/{violationId}
     * Delete violation
     */
    public function destroy(int $violationId): JsonResponse
    {
        $success = $this->violationService->deleteViolation($violationId);

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Violation not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Violation deleted successfully',
        ]);
    }
}
