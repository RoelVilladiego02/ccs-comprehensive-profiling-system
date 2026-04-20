<?php

namespace App\Http\Controllers;

use App\Services\ClassService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClassController extends Controller
{
    protected ClassService $classService;

    public function __construct(ClassService $classService)
    {
        $this->classService = $classService;
    }

    /**
     * GET /api/classes
     * Get all classes
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->query('per_page', 15);
        $classes = $this->classService->getAllClasses($perPage);

        return response()->json([
            'success' => true,
            'data' => $classes->items(),
            'pagination' => [
                'total' => $classes->total(),
                'per_page' => $classes->perPage(),
                'current_page' => $classes->currentPage(),
                'last_page' => $classes->lastPage(),
            ],
        ]);
    }

    /**
     * GET /api/classes/open
     * Get open classes
     */
    public function getOpen(): JsonResponse
    {
        $classes = $this->classService->getOpenClasses();

        return response()->json([
            'success' => true,
            'data' => $classes,
        ]);
    }

    /**
     * GET /api/classes/{id}
     * Get class by ID
     */
    public function show(int $id): JsonResponse
    {
        $class = $this->classService->getClassById($id);

        if (!$class) {
            return response()->json([
                'success' => false,
                'message' => 'Class not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $class,
        ]);
    }

    /**
     * POST /api/classes
     * Create new class
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'course_id' => 'required|exists:course,course_id',
            'faculty_id' => 'required|exists:faculty,faculty_id',
            'section' => 'required|string|max:20',
            'academic_year' => 'required|string|max:20',
            'semester' => 'required|integer|in:1,2,3',
            'schedule_day' => 'nullable|string|max:50',
            'schedule_time' => 'nullable|date_format:H:i',
            'schedule_end_time' => 'nullable|date_format:H:i',
            'room' => 'nullable|string|max:50',
            'max_students' => 'required|integer|min:1',
            'class_status' => 'in:Open,Closed,Cancelled',
        ]);

        $class = $this->classService->createClass($validated);

        return response()->json([
            'success' => true,
            'message' => 'Class created successfully',
            'data' => $this->classService->getClassById($class->class_id),
        ], 201);
    }

    /**
     * PUT /api/classes/{id}
     * Update class
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'section' => 'sometimes|string|max:20',
            'academic_year' => 'sometimes|string|max:20',
            'semester' => 'sometimes|integer|in:1,2,3',
            'schedule_day' => 'nullable|string|max:50',
            'schedule_time' => 'nullable|date_format:H:i',
            'schedule_end_time' => 'nullable|date_format:H:i',
            'room' => 'nullable|string|max:50',
            'max_students' => 'sometimes|integer|min:1',
            'class_status' => 'sometimes|in:Open,Closed,Cancelled',
        ]);

        $success = $this->classService->updateClass($id, $validated);

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Class not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Class updated successfully',
            'data' => $this->classService->getClassById($id),
        ]);
    }

    /**
     * DELETE /api/classes/{id}
     * Delete class
     */
    public function destroy(int $id): JsonResponse
    {
        $success = $this->classService->deleteClass($id);

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Class not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Class deleted successfully',
        ]);
    }

    /**
     * GET /api/classes/faculty/{facultyId}
     * Get classes by faculty
     */
    public function getByFaculty(int $facultyId): JsonResponse
    {
        $classes = $this->classService->getClassesByFaculty($facultyId);

        return response()->json([
            'success' => true,
            'data' => $classes,
        ]);
    }
}
