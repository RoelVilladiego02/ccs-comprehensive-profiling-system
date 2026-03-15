<?php

namespace App\Http\Controllers;

use App\Services\CourseService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    protected CourseService $courseService;

    public function __construct(CourseService $courseService)
    {
        $this->courseService = $courseService;
    }

    /**
     * GET /api/courses
     * Get all courses
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->query('per_page', 15);
        $courses = $this->courseService->getAllCourses($perPage);

        return response()->json([
            'success' => true,
            'data' => $courses->items(),
            'pagination' => [
                'total' => $courses->total(),
                'per_page' => $courses->perPage(),
                'current_page' => $courses->currentPage(),
                'last_page' => $courses->lastPage(),
            ],
        ]);
    }

    /**
     * GET /api/courses/active
     * Get active courses
     */
    public function getActive(): JsonResponse
    {
        $courses = $this->courseService->getActiveCourses();

        return response()->json([
            'success' => true,
            'data' => $courses,
        ]);
    }

    /**
     * GET /api/courses/search
     * Search courses
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

        $courses = $this->courseService->searchCourses($query);

        return response()->json([
            'success' => true,
            'data' => $courses,
        ]);
    }

    /**
     * GET /api/courses/{id}
     * Get course by ID
     */
    public function show(int $id): JsonResponse
    {
        $course = $this->courseService->getCourseById($id);

        if (!$course) {
            return response()->json([
                'success' => false,
                'message' => 'Course not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $course,
        ]);
    }

    /**
     * POST /api/courses
     * Create new course
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'course_code' => 'required|unique:course,course_code|string|max:20',
            'course_title' => 'required|string|max:255',
            'course_description' => 'nullable|string',
            'units_lecture' => 'required|numeric|min:0|max:999',
            'units_lab' => 'nullable|numeric|min:0|max:999',
            'department' => 'nullable|string|max:100',
            'is_active' => 'boolean',
        ]);

        $course = $this->courseService->createCourse($validated);

        return response()->json([
            'success' => true,
            'message' => 'Course created successfully',
            'data' => $course,
        ], 201);
    }

    /**
     * PUT /api/courses/{id}
     * Update course
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'course_code' => 'sometimes|string|max:20|unique:course,course_code,' . $id . ',course_id',
            'course_title' => 'sometimes|string|max:255',
            'course_description' => 'nullable|string',
            'units_lecture' => 'sometimes|numeric|min:0|max:999',
            'units_lab' => 'nullable|numeric|min:0|max:999',
            'department' => 'nullable|string|max:100',
            'is_active' => 'boolean',
        ]);

        $success = $this->courseService->updateCourse($id, $validated);

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Course not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Course updated successfully',
            'data' => $this->courseService->getCourseById($id),
        ]);
    }

    /**
     * DELETE /api/courses/{id}
     * Delete course
     */
    public function destroy(int $id): JsonResponse
    {
        $success = $this->courseService->deleteCourse($id);

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Course not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Course deleted successfully',
        ]);
    }

    /**
     * GET /api/courses/department/{department}
     * Get courses by department
     */
    public function getByDepartment(string $department): JsonResponse
    {
        $courses = $this->courseService->getCoursesByDepartment($department);

        return response()->json([
            'success' => true,
            'data' => $courses,
        ]);
    }
}
