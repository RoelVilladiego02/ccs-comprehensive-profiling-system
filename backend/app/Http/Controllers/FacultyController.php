<?php

namespace App\Http\Controllers;

use App\Services\FacultyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FacultyController extends Controller
{
    protected FacultyService $facultyService;

    public function __construct(FacultyService $facultyService)
    {
        $this->facultyService = $facultyService;
    }

    /**
     * GET /api/faculty
     * Get all faculty
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->query('per_page', 15);
        $faculty = $this->facultyService->getAllFaculty($perPage);

        return response()->json([
            'success' => true,
            'data' => $faculty->items(),
            'pagination' => [
                'total' => $faculty->total(),
                'per_page' => $faculty->perPage(),
                'current_page' => $faculty->currentPage(),
                'last_page' => $faculty->lastPage(),
            ],
        ]);
    }

    /**
     * GET /api/faculty/search
     * Search faculty
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

        $faculty = $this->facultyService->searchFaculty($query);

        return response()->json([
            'success' => true,
            'data' => $faculty,
        ]);
    }

    /**
     * GET /api/faculty/{id}
     * Get faculty by ID
     */
    public function show(int $id): JsonResponse
    {
        $faculty = $this->facultyService->getFacultyById($id);

        if (!$faculty) {
            return response()->json([
                'success' => false,
                'message' => 'Faculty not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $faculty,
        ]);
    }

    /**
     * POST /api/faculty
     * Create new faculty
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'faculty_number' => 'required|unique:faculty,faculty_number|string|max:20',
            'first_name' => 'required|string|max:50',
            'middle_name' => 'nullable|string|max:50',
            'last_name' => 'required|string|max:50',
            'suffix' => 'nullable|string|max:10',
            'gender' => 'required|in:Male,Female,Prefer not to say',
            'email' => 'required|unique:faculty,email|email|max:100',
            'phone_number' => 'nullable|string|max:20',
            'employment_status' => 'required|in:Full-Time,Part-Time,Probationary,Contractual',
            'department' => 'nullable|string|max:100',
        ]);

        $faculty = $this->facultyService->createFaculty($validated);

        return response()->json([
            'success' => true,
            'message' => 'Faculty created successfully',
            'data' => $faculty,
        ], 201);
    }

    /**
     * PUT /api/faculty/{id}
     * Update faculty
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'faculty_number' => 'sometimes|string|max:20|unique:faculty,faculty_number,' . $id . ',faculty_id',
            'first_name' => 'sometimes|string|max:50',
            'middle_name' => 'nullable|string|max:50',
            'last_name' => 'sometimes|string|max:50',
            'suffix' => 'nullable|string|max:10',
            'gender' => 'sometimes|in:Male,Female,Prefer not to say',
            'email' => 'sometimes|email|max:100|unique:faculty,email,' . $id . ',faculty_id',
            'phone_number' => 'nullable|string|max:20',
            'employment_status' => 'sometimes|in:Full-Time,Part-Time,Probationary,Contractual',
            'department' => 'nullable|string|max:100',
        ]);

        $success = $this->facultyService->updateFaculty($id, $validated);

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Faculty not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Faculty updated successfully',
            'data' => $this->facultyService->getFacultyById($id),
        ]);
    }

    /**
     * DELETE /api/faculty/{id}
     * Delete faculty
     */
    public function destroy(int $id): JsonResponse
    {
        $success = $this->facultyService->deleteFaculty($id);

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Faculty not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Faculty deleted successfully',
        ]);
    }

    /**
     * GET /api/faculty/department/{department}
     * Get faculty by department
     */
    public function getByDepartment(string $department): JsonResponse
    {
        $faculty = $this->facultyService->getFacultyByDepartment($department);

        return response()->json([
            'success' => true,
            'data' => $faculty,
        ]);
    }
}
