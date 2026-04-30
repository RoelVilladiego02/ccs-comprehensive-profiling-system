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
        return Lesson::with(['syllabus', 'faculty'])
            ->orderBy('lesson_id', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get lesson by ID with relationships
     */
    public function getLessonById(int $lessonId): ?Lesson
    {
        return Lesson::with(['syllabus', 'faculty'])->find($lessonId);
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

    /**
     * Get lessons for faculty (only their own lessons)
     */
    public function getLessonsByFaculty(int $facultyId, int $perPage = 15): LengthAwarePaginator
    {
        return Lesson::where('faculty_id', $facultyId)
            ->with(['syllabus', 'faculty'])
            ->orderBy('lesson_id', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get lessons by syllabus for faculty
     */
    public function getLessonsBySyllabusForFaculty(int $syllabusId, int $facultyId): Collection
    {
        return Lesson::where('syllabus_id', $syllabusId)
            ->where('faculty_id', $facultyId)
            ->orderBy('lesson_number', 'asc')
            ->get();
    }

    /**
     * Get lessons for students based on their enrolled classes
     */
    public function getLessonsForStudent(int $studentId, int $perPage = 15): LengthAwarePaginator
    {
        return Lesson::with('syllabus', 'faculty')
            ->whereHas('syllabus.course.classes.students', function ($query) use ($studentId) {
                $query->where('student_id', $studentId);
            })
            ->paginate($perPage);
    }

    /**
     * Get lessons by class section for students
     */
    public function getLessonsByClassForStudent(int $classId, int $studentId): Collection
    {
        // Get the class and verify student is enrolled
        return Lesson::whereHas('syllabus.course.classes', function ($query) use ($classId, $studentId) {
            $query->where('class_id', $classId)
                ->whereHas('students', function ($q) use ($studentId) {
                    $q->where('student_id', $studentId);
                });
        })
            ->orderBy('lesson_number', 'asc')
            ->get();
    }
}

