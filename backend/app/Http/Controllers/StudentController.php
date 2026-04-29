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
     * Get faculty_id if user is faculty, null otherwise
     */
    private function getFacultyIdIfFaculty(Request $request): ?int
    {
        $user = $request->user();
        
        if (!$user || !$user->hasRole('Faculty')) {
            return null;
        }

        $faculty = $user->faculty;
        return $faculty?->faculty_id;
    }

    /**
     * GET /api/students
     * Get all students with pagination
     * If user is faculty, only shows students in their classes
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->query('per_page', 15);
        
        $facultyId = $this->getFacultyIdIfFaculty($request);
        
        if ($facultyId) {
            $students = $this->studentService->getStudentsByFaculty($facultyId, $perPage);
        } else {
            $students = $this->studentService->getAllStudents($perPage);
        }

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
     * If user is faculty, only searches within their students
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

        $facultyId = $this->getFacultyIdIfFaculty($request);
        
        if ($facultyId) {
            $students = $this->studentService->searchStudentsByFaculty($query, $facultyId);
        } else {
            $students = $this->studentService->searchStudents($query);
        }

        return response()->json([
            'success' => true,
            'data' => $students,
        ]);
    }

    /**
     * GET /api/students/{id}
     * Get student by ID
     * If user is faculty, checks if student is in their classes
     */
    public function show(int $id, Request $request): JsonResponse
    {
        $student = $this->studentService->getStudentById($id);

        if (!$student) {
            return response()->json([
                'success' => false,
                'message' => 'Student not found',
            ], 404);
        }

        // Check if faculty can view this student
        $facultyId = $this->getFacultyIdIfFaculty($request);
        if ($facultyId) {
            // Verify this student is in one of the faculty's classes
            $isStudentOfFaculty = $student->classStatuses()
                ->whereHas('class', function ($q) use ($facultyId) {
                    $q->where('faculty_id', $facultyId);
                })
                ->exists();

            if (!$isStudentOfFaculty) {
                return response()->json([
                    'success' => false,
                    'message' => 'You do not have permission to view this student',
                ], 403);
            }
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
     * If user is faculty, only filters from their students
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

        $facultyId = $this->getFacultyIdIfFaculty($request);
        
        if ($facultyId) {
            $students = $this->studentService->getStudentsBySkillAndFaculty($skillName, $facultyId);
        } else {
            $students = $this->studentService->getStudentsBySkill($skillName);
        }

        return response()->json([
            'success' => true,
            'count' => count($students),
            'data' => $students,
        ]);
    }

    /**
     * GET /api/students/filter/affiliations
     * Get students by affiliation type
     * If user is faculty, only filters from their students
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

        $facultyId = $this->getFacultyIdIfFaculty($request);
        
        if ($facultyId) {
            $students = $this->studentService->getStudentsByAffiliationAndFaculty($affiliationType, $facultyId);
        } else {
            $students = $this->studentService->getStudentsByAffiliation($affiliationType);
        }

        return response()->json([
            'success' => true,
            'count' => count($students),
            'data' => $students,
        ]);
    }

    /**
     * GET /api/students/filter/skills-list
     * Get available skills for filtering
     * If user is faculty, only returns skills from their students
     */
    public function getAvailableSkills(Request $request): JsonResponse
    {
        $facultyId = $this->getFacultyIdIfFaculty($request);
        
        if ($facultyId) {
            $skills = $this->studentService->getAvailableSkillsForFaculty($facultyId);
        } else {
            $skills = $this->studentService->getAvailableSkills();
        }

        return response()->json([
            'success' => true,
            'data' => $skills,
        ]);
    }

    /**
     * GET /api/students/filter/affiliations-list
     * Get available affiliation types for filtering
     * If user is faculty, only returns affiliations from their students
     */
    public function getAvailableAffiliationTypes(Request $request): JsonResponse
    {
        $facultyId = $this->getFacultyIdIfFaculty($request);
        
        if ($facultyId) {
            $affiliationTypes = $this->studentService->getAvailableAffiliationTypesForFaculty($facultyId);
        } else {
            $affiliationTypes = $this->studentService->getAvailableAffiliationTypes();
        }

        return response()->json([
            'success' => true,
            'data' => $affiliationTypes,
        ]);
    }

    /**
     * GET /api/students/filter/skills-by-category
     * Get skills grouped by category for cascading dropdown
     * Returns: { "Communication": ["Basketball", "Leadership"], "Technical": ["Programming", ...] }
     * If user is faculty, only returns skills from their students
     */
    public function getSkillsByCategory(Request $request): JsonResponse
    {
        $facultyId = $this->getFacultyIdIfFaculty($request);
        
        $skillsByCategory = $this->studentService->getSkillsByCategory($facultyId);

        return response()->json([
            'success' => true,
            'data' => (object) $skillsByCategory,  // ✅ Cast to object to ensure JSON object format
        ]);
        ]);
    }

    /**
     * GET /api/students/filter/affiliations-by-type
     * Get affiliations grouped by organization type for cascading dropdown
     * Returns: { "Professional": ["Org A", "Org B"], "Sports": ["Club X", ...] }
     * If user is faculty, only returns affiliations from their students
     */
    public function getAffiliationsByType(Request $request): JsonResponse
    {
        $facultyId = $this->getFacultyIdIfFaculty($request);
        
        $affiliationsByType = $this->studentService->getAffiliationsByType($facultyId);

        return response()->json([
            'success' => true,
            'data' => (object) $affiliationsByType,  // ✅ Cast to object to ensure JSON object format
        ]);
        ]);
    }
}
