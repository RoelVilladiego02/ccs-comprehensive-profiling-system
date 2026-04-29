<?php

namespace App\Services;

use App\Models\Lesson;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class LessonService
{
    /**
     * Get all lessons with pagination
     */
    public function getAllLessons(int $perPage = 15): LengthAwarePaginator
    {
        return Lesson::with('syllabus')->paginate($perPage);
    }

    /**
     * Get lesson by ID with relationships
     */
    public function getLessonById(int $lessonId): ?Lesson
    {
        return Lesson::with('syllabus')->find($lessonId);
    }

    /**
     * Get lessons by syllabus
     */
    public function getLessonsBySyllabus(int $syllabusId): Collection
    {
        return Lesson::where('syllabus_id', $syllabusId)
            ->orderBy('lesson_number', 'asc')
            ->get();
    }

    /**
     * Get active lessons
     */
    public function getActiveLessons(): Collection
    {
        return Lesson::where('is_active', true)
            ->with('syllabus')
            ->orderBy('lesson_number', 'asc')
            ->get();
    }

    /**
     * Create a new lesson
     */
    public function createLesson(array $data): Lesson
    {
        return Lesson::create($data);
    }

    /**
     * Update lesson
     */
    public function updateLesson(int $lessonId, array $data): ?Lesson
    {
        $lesson = Lesson::find($lessonId);
        if ($lesson) {
            $lesson->update($data);
        }
        return $lesson;
    }

    /**
     * Delete lesson
     */
    public function deleteLesson(int $lessonId): bool
    {
        $lesson = Lesson::find($lessonId);
        return $lesson ? $lesson->delete() : false;
    }

    /**
     * Search lessons
     */
    public function searchLessons(string $query): Collection
    {
        return Lesson::where('title', 'like', "%{$query}%")
            ->orWhere('content', 'like', "%{$query}%")
            ->with('syllabus')
            ->get();
    }
}
