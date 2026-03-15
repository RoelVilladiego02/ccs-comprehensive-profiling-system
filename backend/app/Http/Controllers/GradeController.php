<?php

namespace App\Http\Controllers;

use App\Services\GradeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GradeController extends Controller
{
    protected GradeService $gradeService;

    public function __construct(GradeService $gradeService)
    {
        $this->gradeService = $gradeService;
    }

    /**
     * POST /api/grades
     * Record or update grade
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:student,student_id',
            'class_id' => 'required|exists:class,class_id',
            'midterm_grade' => 'nullable|numeric|min:0|max:100',
            'final_grade' => 'nullable|numeric|min:0|max:100',
            'remarks' => 'nullable|string',
        ]);

        $grade = $this->gradeService->recordGrade(
            $validated['student_id'],
            $validated['class_id'],
            $validated
        );

        return response()->json([
            'success' => true,
            'message' => 'Grade recorded successfully',
            'data' => $grade,
        ], 201);
    }

    /**
     * GET /api/grades/student/{studentId}
     * Get all grades for student
     */
    public function getStudentGrades(int $studentId): JsonResponse
    {
        $grades = $this->gradeService->getStudentGrades($studentId);

        return response()->json([
            'success' => true,
            'data' => $grades,
        ]);
    }

    /**
     * GET /api/grades/class/{classId}
     * Get all grades for class
     */
    public function getClassGrades(int $classId): JsonResponse
    {
        $grades = $this->gradeService->getClassGrades($classId);

        return response()->json([
            'success' => true,
            'data' => $grades,
        ]);
    }

    /**
     * GET /api/grades/student/{studentId}/average
     * Get student's average grade
     */
    public function getStudentAverageGrade(int $studentId): JsonResponse
    {
        $average = $this->gradeService->getStudentAverageGrade($studentId);

        return response()->json([
            'success' => true,
            'average_grade' => $average,
        ]);
    }

    /**
     * GET /api/grades/class/{classId}/statistics
     * Get class grade statistics
     */
    public function getClassStatistics(int $classId): JsonResponse
    {
        $statistics = $this->gradeService->getClassGradeStatistics($classId);

        return response()->json([
            'success' => true,
            'data' => $statistics,
        ]);
    }

    /**
     * PUT /api/grades/student/{studentId}/class/{classId}/midterm
     * Update midterm grade
     */
    public function updateMidtermGrade(Request $request, int $studentId, int $classId): JsonResponse
    {
        $validated = $request->validate([
            'midterm_grade' => 'required|numeric|min:0|max:100',
        ]);

        $success = $this->gradeService->updateMidtermGrade($studentId, $classId, $validated['midterm_grade']);

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Grade record not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Midterm grade updated successfully',
        ]);
    }

    /**
     * PUT /api/grades/student/{studentId}/class/{classId}/final
     * Update final grade
     */
    public function updateFinalGrade(Request $request, int $studentId, int $classId): JsonResponse
    {
        $validated = $request->validate([
            'final_grade' => 'required|numeric|min:0|max:100',
        ]);

        $success = $this->gradeService->updateFinalGrade($studentId, $classId, $validated['final_grade']);

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Grade record not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Final grade updated successfully',
        ]);
    }
}
