<?php

namespace App\Http\Controllers;

use App\Services\StudentProfileService;
use Illuminate\Http\JsonResponse;

class StudentProfileController extends Controller
{
    protected StudentProfileService $studentProfileService;

    public function __construct(StudentProfileService $studentProfileService)
    {
        $this->studentProfileService = $studentProfileService;
    }

    /**
     * GET /api/students/{studentId}/profile
     * Get comprehensive student profile
     */
    public function getProfile(int $studentId): JsonResponse
    {
        $profile = $this->studentProfileService->getStudentProfile($studentId);

        if (!$profile) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $profile,
        ]);
    }

    /**
     * GET /api/students/{studentId}/academic-performance
     * Get student's academic performance
     */
    public function getAcademicPerformance(int $studentId): JsonResponse
    {
        $performance = $this->studentProfileService->getAcademicPerformance($studentId);

        if (!$performance) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $performance,
        ]);
    }

    /**
     * GET /api/students/{studentId}/current-courses
     * Get student's current courses
     */
    public function getCurrentCourses(int $studentId): JsonResponse
    {
        $courses = $this->studentProfileService->getStudentCurrentCourses($studentId);

        return response()->json([
            'success' => true,
            'data' => $courses,
        ]);
    }
}
