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
     * Get all lessons (filtered by user role)
     * - Faculty: only sees their own lessons
     * - Students: see lessons for their enrolled classes
     * - Admin/Staff: see all lessons
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $perPage = $request->query('per_page', 15);

        // Admin and Staff see all lessons
        if ($user->hasAnyRole(['Admin', 'Staff'])) {
            $lessons = $this->lessonService->getAllLessons($perPage);
        }
        // Faculty see only their own lessons
        elseif ($user->hasRole('Faculty')) {
            $faculty = $user->faculty;
            if (!$faculty) {
                return response()->json([
                    'success' => false,
                    'message' => 'Faculty profile not found',
                ], 404);
            }
            $lessons = $this->lessonService->getLessonsByFaculty($faculty->faculty_id, $perPage);
        }
        // Students see lessons for their enrolled classes
        elseif ($user->hasRole('Student')) {
            $student = $user->student;
            if (!$student) {
                return response()->json([
                    'success' => false,
                    'message' => 'Student profile not found',
                ], 404);
            }
            $lessons = $this->lessonService->getLessonsForStudent($student->student_id, $perPage);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized role',
            ], 403);
        }

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
     * Get a single lesson by ID
     * Authorization: Faculty can only view their own lessons, students can view lessons in their classes
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $lesson = $this->lessonService->getLessonById($id);

        if (!$lesson) {
            return response()->json([
                'success' => false,
                'message' => 'Lesson not found',
            ], 404);
        }

        // Authorization check
        if ($user->hasRole('Faculty')) {
            $faculty = $user->faculty;
            if (!$faculty || $lesson->faculty_id !== $faculty->faculty_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Forbidden - You can only view your own lessons',
                ], 403);
            }
        } elseif ($user->hasRole('Student')) {
            // Students can only view lessons for classes they're enrolled in
            $student = $user->student;
            if (!$student) {
                return response()->json([
                    'success' => false,
                    'message' => 'Student profile not found',
                ], 404);
            }

            // Check if student is enrolled in the class that has this lesson's syllabus
            $enrolledClasses = $student->schoolClasses()->pluck('school_class_id')->toArray();
            $syllabusClasses = $lesson->syllabus->schoolClasses()->pluck('school_class_id')->toArray();
            
            $hasAccess = collect($enrolledClasses)->intersect($syllabusClasses)->count() > 0;
            if (!$hasAccess) {
                return response()->json([
                    'success' => false,
                    'message' => 'Forbidden - You are not enrolled in a class for this lesson',
                ], 403);
            }
        } elseif (!$user->hasAnyRole(['Admin', 'Staff'])) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden - Invalid user role',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $lesson,
        ]);
    }

    /**
     * POST /api/lessons
     * Create a new lesson
     * For Faculty: automatically associates the lesson with their faculty ID
     * For Admin/Staff: can specify faculty_id explicitly
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'syllabus_id' => 'required|exists:syllabus,syllabus_id',
            'faculty_id' => 'nullable|exists:faculty,faculty_id',
            'lesson_number' => 'required|integer|min:1',
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
            'objectives' => 'nullable|string',
            'duration_hours' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
        ]);

        // Faculty must create lessons for themselves
        if ($user->hasRole('Faculty')) {
            $faculty = $user->faculty;
            if (!$faculty) {
                return response()->json([
                    'success' => false,
                    'message' => 'Faculty profile not found',
                ], 404);
            }
            $validated['faculty_id'] = $faculty->faculty_id;
        }

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
     * Update an existing lesson
     * Only the lesson's faculty owner, admin, or staff can update
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $lesson = $this->lessonService->getLessonById($id);

        if (!$lesson) {
            return response()->json([
                'success' => false,
                'message' => 'Lesson not found',
            ], 404);
        }

        // Authorization check: only faculty owner, admin, or staff can update
        if (!$user->hasAnyRole(['Admin', 'Staff'])) {
            if ($user->hasRole('Faculty')) {
                $faculty = $user->faculty;
                if (!$faculty || $lesson->faculty_id !== $faculty->faculty_id) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Forbidden - You can only update your own lessons',
                    ], 403);
                }
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Forbidden - Only faculty and administrators can update lessons',
                ], 403);
            }
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
     * Delete a lesson
     * Only the lesson's faculty owner, admin, or staff can delete
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $lesson = $this->lessonService->getLessonById($id);

        if (!$lesson) {
            return response()->json([
                'success' => false,
                'message' => 'Lesson not found',
            ], 404);
        }

        // Authorization check: only faculty owner, admin, or staff can delete
        if (!$user->hasAnyRole(['Admin', 'Staff'])) {
            if ($user->hasRole('Faculty')) {
                $faculty = $user->faculty;
                if (!$faculty || $lesson->faculty_id !== $faculty->faculty_id) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Forbidden - You can only delete your own lessons',
                    ], 403);
                }
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Forbidden - Only faculty and administrators can delete lessons',
                ], 403);
            }
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
     * Get lessons by syllabus with role-based filtering
     * Faculty: only their own lessons
     * Students: only lessons in classes they're enrolled in
     * Admin/Staff: all lessons
     */
    public function getBySyllabus(Request $request, int $syllabusId): JsonResponse
    {
        $user = $request->user();

        if ($user->hasRole('Faculty')) {
            $faculty = $user->faculty;
            if (!$faculty) {
                return response()->json([
                    'success' => false,
                    'message' => 'Faculty profile not found',
                ], 404);
            }
            $lessons = $this->lessonService->getLessonsBySyllabusForFaculty($syllabusId, $faculty->faculty_id);
        } elseif ($user->hasRole('Student')) {
            $student = $user->student;
            if (!$student) {
                return response()->json([
                    'success' => false,
                    'message' => 'Student profile not found',
                ], 404);
            }

            // Get all lessons for this syllabus, then filter by student's enrolled classes
            $lessons = $this->lessonService->getLessonsBySyllabus($syllabusId);
            $enrolledClassIds = $student->schoolClasses()->pluck('school_class_id')->toArray();
            
            // Filter lessons that belong to classes the student is enrolled in
            $syllabus = \App\Models\Syllabus::find($syllabusId);
            if (!$syllabus) {
                return response()->json([
                    'success' => false,
                    'message' => 'Syllabus not found',
                ], 404);
            }

            $classIds = $syllabus->schoolClasses()->pluck('school_class_id')->toArray();
            $accessibleClassIds = collect($enrolledClassIds)->intersect($classIds)->toArray();

            if (empty($accessibleClassIds)) {
                return response()->json([
                    'success' => true,
                    'data' => [],
                ]);
            }

            $lessons = $lessons->filter(function ($lesson) use ($accessibleClassIds) {
                return in_array($lesson->syllabus->schoolClasses()->first()?->school_class_id, $accessibleClassIds);
            })->values();
        } else {
            // Admin/Staff see all lessons
            $lessons = $this->lessonService->getLessonsBySyllabus($syllabusId);
        }

        return response()->json([
            'success' => true,
            'data' => $lessons,
        ]);
    }
}
