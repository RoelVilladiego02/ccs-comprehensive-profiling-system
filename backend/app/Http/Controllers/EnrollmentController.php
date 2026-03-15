<?php

namespace App\Http\Controllers;

use App\Services\EnrollmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    protected EnrollmentService $enrollmentService;

    public function __construct(EnrollmentService $enrollmentService)
    {
        $this->enrollmentService = $enrollmentService;
    }

    /**
     * POST /api/enrollments
     * Enroll student in class
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:student,student_id',
            'class_id' => 'required|exists:class,class_id',
            'enrollment_date' => 'nullable|date_format:Y-m-d',
        ]);

        $enrollment = $this->enrollmentService->enrollStudentInClass(
            $validated['student_id'],
            $validated['class_id'],
            $validated['enrollment_date'] ?? null
        );

        if (!$enrollment) {
            return response()->json([
                'success' => false,
                'message' => 'Unable to enroll student. Class may be full or student already enrolled.',
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Student enrolled successfully',
            'data' => $enrollment,
        ], 201);
    }

    /**
     * GET /api/enrollments/student/{studentId}
     * Get student enrollments
     */
    public function getStudentEnrollments(int $studentId): JsonResponse
    {
        $enrollments = $this->enrollmentService->getStudentEnrollments($studentId);

        return response()->json([
            'success' => true,
            'data' => $enrollments,
        ]);
    }

    /**
     * GET /api/enrollments/class/{classId}
     * Get class enrollments
     */
    public function getClassEnrollments(int $classId): JsonResponse
    {
        $enrollments = $this->enrollmentService->getClassEnrollments($classId);

        return response()->json([
            'success' => true,
            'data' => $enrollments,
        ]);
    }

    /**
     * GET /api/enrollments/student/{studentId}/active
     * Get active enrollments for student
     */
    public function getActiveEnrollments(int $studentId): JsonResponse
    {
        $enrollments = $this->enrollmentService->getActiveEnrollments($studentId);

        return response()->json([
            'success' => true,
            'data' => $enrollments,
        ]);
    }

    /**
     * PUT /api/enrollments/{enrollmentId}/status
     * Update enrollment status
     */
    public function updateStatus(Request $request, int $enrollmentId): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:Enrolled,Dropped,Completed,On Leave',
        ]);

        $success = $this->enrollmentService->updateEnrollmentStatus($enrollmentId, $validated['status']);

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Enrollment not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Enrollment status updated successfully',
        ]);
    }

    /**
     * PUT /api/enrollments/{enrollmentId}/grade
     * Set final grade for enrollment
     */
    public function setFinalGrade(Request $request, int $enrollmentId): JsonResponse
    {
        $validated = $request->validate([
            'grade' => 'required|numeric|min:0|max:100',
        ]);

        $success = $this->enrollmentService->setFinalGrade($enrollmentId, $validated['grade']);

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Enrollment not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Final grade set successfully',
        ]);
    }

    /**
     * DELETE /api/enrollments/{enrollmentId}
     * Withdraw student from class
     */
    public function destroy(int $enrollmentId): JsonResponse
    {
        $success = $this->enrollmentService->withdrawStudent($enrollmentId);

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Enrollment not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Student withdrawn successfully',
        ]);
    }
}
