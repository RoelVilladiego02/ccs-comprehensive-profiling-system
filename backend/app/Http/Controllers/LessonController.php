<?php

namespace App\Http\Controllers;

use App\Services\LessonService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LessonController extends Controller
{
    protected LessonService $lessonService;

    public function __construct(LessonService $lessonService)
    {
        $this->lessonService = $lessonService;
    }

    /**
     * GET /api/lessons
     * Get all lessons
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->query('per_page', 15);
        $lessons = $this->lessonService->getAllLessons($perPage);

        return response()->json([
            'success' => true,
            'data' => $lessons->items(),
            'pagination' => [
                'total' => $lessons->total(),
                'per_page' => $lessons->perPage(),
                'current_page' => $lessons->currentPage(),
                'last_page' => $lessons->lastPage(),
            ],
        ]);
    }

    /**
     * GET /api/lessons/search
     * Search lessons
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

        $lessons = $this->lessonService->searchLessons($query);

        return response()->json([
            'success' => true,
            'data' => $lessons,
        ]);
    }

    /**
     * GET /api/lessons/active
     * Get active lessons
     */
    public function getActive(): JsonResponse
    {
        $lessons = $this->lessonService->getActiveLessons();

        return response()->json([
            'success' => true,
            'data' => $lessons,
        ]);
    }

    /**
     * GET /api/lessons/{id}
     * Get lesson by ID
     */
    public function show(int $id): JsonResponse
    {
        $lesson = $this->lessonService->getLessonById($id);

        if (!$lesson) {
            return response()->json([
                'success' => false,
                'message' => 'Lesson not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $lesson,
        ]);
    }

    /**
     * POST /api/lessons
     * Create a new lesson
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'syllabus_id' => 'required|exists:syllabus,syllabus_id',
            'lesson_number' => 'required|integer|min:1',
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'objectives' => 'nullable|string',
            'duration_hours' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
        ]);

        try {
            $lesson = $this->lessonService->createLesson($validated);

            return response()->json([
                'success' => true,
                'message' => 'Lesson created successfully',
                'data' => $lesson,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create lesson: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * PUT /api/lessons/{id}
     * Update lesson
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $lesson = $this->lessonService->getLessonById($id);

        if (!$lesson) {
            return response()->json([
                'success' => false,
                'message' => 'Lesson not found',
            ], 404);
        }

        $validated = $request->validate([
            'syllabus_id' => 'sometimes|exists:syllabus,syllabus_id',
            'lesson_number' => 'sometimes|integer|min:1',
            'title' => 'sometimes|string|max:255',
            'content' => 'nullable|string',
            'objectives' => 'nullable|string',
            'duration_hours' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
        ]);

        try {
            $updated = $this->lessonService->updateLesson($id, $validated);

            return response()->json([
                'success' => true,
                'message' => 'Lesson updated successfully',
                'data' => $updated,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update lesson: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * DELETE /api/lessons/{id}
     * Delete lesson
     */
    public function destroy(int $id): JsonResponse
    {
        $lesson = $this->lessonService->getLessonById($id);

        if (!$lesson) {
            return response()->json([
                'success' => false,
                'message' => 'Lesson not found',
            ], 404);
        }

        try {
            $this->lessonService->deleteLesson($id);

            return response()->json([
                'success' => true,
                'message' => 'Lesson deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete lesson: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * GET /api/lessons/syllabus/{syllabusId}
     * Get lessons by syllabus
     */
    public function getBySyllabus(int $syllabusId): JsonResponse
    {
        $lessons = $this->lessonService->getLessonsBySyllabus($syllabusId);

        return response()->json([
            'success' => true,
            'data' => $lessons,
        ]);
    }
}
