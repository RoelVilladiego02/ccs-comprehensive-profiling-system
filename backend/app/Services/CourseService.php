<?php

namespace App\Services;

use App\Models\Course;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class CourseService
{
    /**
     * Get all courses with pagination
     */
    public function getAllCourses(int $perPage = 15): LengthAwarePaginator
    {
        return Course::paginate($perPage);
    }

    /**
     * Get course by ID with relationships
     */
    public function getCourseById(int $courseId): ?Course
    {
        return Course::with(['classes', 'syllabus', 'curriculum'])->find($courseId);
    }

    /**
     * Get course by course code
     */
    public function getCourseByCourseCode(string $courseCode): ?Course
    {
        return Course::where('course_code', $courseCode)->first();
    }

    /**
     * Get active courses
     */
    public function getActiveCourses(): Collection
    {
        return Course::where('is_active', true)->get();
    }

    /**
     * Get courses by department
     */
    public function getCoursesByDepartment(string $department): Collection
    {
        return Course::where('department', $department)->get();
    }

    /**
     * Search courses by title or code
     */
    public function searchCourses(string $query): Collection
    {
        return Course::where('course_title', 'like', "%{$query}%")
            ->orWhere('course_code', 'like', "%{$query}%")
            ->get();
    }

    /**
     * Create new course
     */
    public function createCourse(array $data): Course
    {
        return Course::create($data);
    }

    /**
     * Update course
     */
    public function updateCourse(int $courseId, array $data): bool
    {
        $course = Course::find($courseId);
        if (!$course) {
            return false;
        }
        return $course->update($data);
    }

    /**
     * Delete course
     */
    public function deleteCourse(int $courseId): bool
    {
        $course = Course::find($courseId);
        if (!$course) {
            return false;
        }
        return $course->delete();
    }

    /**
     * Deactivate course
     */
    public function deactivateCourse(int $courseId): bool
    {
        return $this->updateCourse($courseId, ['is_active' => false]);
    }

    /**
     * Activate course
     */
    public function activateCourse(int $courseId): bool
    {
        return $this->updateCourse($courseId, ['is_active' => true]);
    }
}
