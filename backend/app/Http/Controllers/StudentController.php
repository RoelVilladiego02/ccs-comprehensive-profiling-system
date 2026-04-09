<?php

namespace App\Http\Controllers;

use App\Services\StudentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    protected StudentService $studentService;

    public function __construct(StudentService $studentService)
    {
        $this->studentService = $studentService;
    }

    /**
     * GET /api/students
     * Get all students with pagination
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->query('per_page', 15);
        $students = $this->studentService->getAllStudents($perPage);

        return response()->json([
            'success' => true,
            'data' => $students->items(),
            'pagination' => [
                'total' => $students->total(),
                'per_page' => $students->perPage(),
                'current_page' => $students->currentPage(),
                'last_page' => $students->lastPage(),
            ],
        ]);
    }

    /**
     * GET /api/students/search
     * Search students
     */
    public function search(Request $request): JsonResponse
    {
        $query = $request->query('q', '');

        if (strlen($query) < 2) {
            return response()->json([
                'success' => false,
                'message' => 'Search query must be at least 2 characters',
            ], 400);
        }

        $students = $this->studentService->searchStudents($query);

        return response()->json([
            'success' => true,
            'data' => $students,
        ]);
    }

    /**
     * GET /api/students/{id}
     * Get student by ID
     */
    public function show(int $id): JsonResponse
    {
        $student = $this->studentService->getStudentById($id);

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $student,
        ]);
    }

    /**
     * POST /api/students
     * Create new student
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_number' => 'required|unique:student,student_number|string|max:20',
            'first_name' => 'required|string|max:50',
            'middle_name' => 'nullable|string|max:50',
            'last_name' => 'required|string|max:50',
            'suffix' => 'nullable|string|max:10',
            'gender' => 'required|in:Male,Female,Prefer not to say',
            'email' => 'required|unique:student,email|email|max:100',
            'phone_number' => 'nullable|string|max:20',
            'student_identification' => 'required|in:Regular,Irregular,Graduated,On Leave,Dropped',
            'curriculum' => 'nullable|string|max:100',
        ]);

        $student = $this->studentService->createStudent($validated);

        return response()->json([
            'success' => true,
            'message' => 'Student created successfully',
            'data' => $student,
        ], 201);
    }

    /**
     * PUT /api/students/{id}
     * Update student
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'student_number' => 'sometimes|string|max:20|unique:student,student_number,' . $id . ',student_id',
            'first_name' => 'sometimes|string|max:50',
            'middle_name' => 'nullable|string|max:50',
            'last_name' => 'sometimes|string|max:50',
            'suffix' => 'nullable|string|max:10',
            'gender' => 'sometimes|in:Male,Female,Prefer not to say',
            'email' => 'sometimes|email|max:100|unique:student,email,' . $id . ',student_id',
            'phone_number' => 'nullable|string|max:20',
            'student_identification' => 'sometimes|in:Regular,Irregular,Graduated,On Leave,Dropped',
            'curriculum' => 'nullable|string|max:100',
        ]);

        $success = $this->studentService->updateStudent($id, $validated);

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Student updated successfully',
            'data' => $this->studentService->getStudentById($id),
        ]);
    }

    /**
     * DELETE /api/students/{id}
     * Delete student
     */
    public function destroy(int $id): JsonResponse
    {
        $success = $this->studentService->deleteStudent($id);

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Student deleted successfully',
        ]);
    }

    /**
     * GET /api/students/status/{status}
     * Get students by status
     */
    public function getByStatus(string $status): JsonResponse
    {
        $validStatuses = ['Regular', 'Irregular', 'Graduated', 'On Leave', 'Dropped'];

        if (!in_array($status, $validStatuses)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid status',
            ], 400);
        }

        $students = $this->studentService->getStudentsByStatus($status);

        return response()->json([
            'success' => true,
            'data' => $students,
        ]);
    }

    /**
     * GET /api/students/filter/skills
     * Get students by skill
     */
    public function getBySkill(Request $request): JsonResponse
    {
        $skillName = $request->query('skill');

        if (!$skillName || strlen($skillName) < 2) {
            return response()->json([
                'success' => false,
                'message' => 'Skill parameter must be at least 2 characters',
            ], 400);
        }

        $students = $this->studentService->getStudentsBySkill($skillName);

        return response()->json([
            'success' => true,
            'count' => count($students),
            'data' => $students,
        ]);
    }

    /**
     * GET /api/students/filter/affiliations
     * Get students by affiliation type
     */
    public function getByAffiliation(Request $request): JsonResponse
    {
        $affiliationType = $request->query('affiliation');

        if (!$affiliationType || strlen($affiliationType) < 2) {
            return response()->json([
                'success' => false,
                'message' => 'Affiliation parameter must be at least 2 characters',
            ], 400);
        }

        $students = $this->studentService->getStudentsByAffiliation($affiliationType);

        return response()->json([
            'success' => true,
            'count' => count($students),
            'data' => $students,
        ]);
    }

    /**
     * GET /api/students/filter/skills-list
     * Get available skills for filtering
     */
    public function getAvailableSkills(): JsonResponse
    {
        $skills = $this->studentService->getAvailableSkills();

        return response()->json([
            'success' => true,
            'data' => $skills,
        ]);
    }

    /**
     * GET /api/students/filter/affiliations-list
     * Get available affiliation types for filtering
     */
    public function getAvailableAffiliationTypes(): JsonResponse
    {
        $affiliationTypes = $this->studentService->getAvailableAffiliationTypes();

        return response()->json([
            'success' => true,
            'data' => $affiliationTypes,
        ]);
    }
}
