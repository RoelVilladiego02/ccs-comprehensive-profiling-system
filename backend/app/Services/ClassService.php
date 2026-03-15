<?php

namespace App\Services;

use App\Models\SchoolClass;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class ClassService
{
    /**
     * Get all classes with pagination
     */
    public function getAllClasses(int $perPage = 15): LengthAwarePaginator
    {
        return SchoolClass::with(['course', 'faculty'])->paginate($perPage);
    }

    /**
     * Get class by ID with all relationships
     */
    public function getClassById(int $classId): ?SchoolClass
    {
        return SchoolClass::with([
            'course',
            'faculty',
            'studentClassStatuses',
            'students'
        ])->find($classId);
    }

    /**
     * Get classes by academic year and semester
     */
    public function getClassesByAcademicYear(string $academicYear, int $semester): Collection
    {
        return SchoolClass::where('academic_year', $academicYear)
            ->where('semester', $semester)
            ->with(['course', 'faculty'])
            ->get();
    }

    /**
     * Get classes by faculty
     */
    public function getClassesByFaculty(int $facultyId): Collection
    {
        return SchoolClass::where('faculty_id', $facultyId)
            ->with(['course'])
            ->get();
    }

    /**
     * Get classes by course
     */
    public function getClassesByCourse(int $courseId): Collection
    {
        return SchoolClass::where('course_id', $courseId)
            ->with(['faculty'])
            ->get();
    }

    /**
     * Get open classes (available for enrollment)
     */
    public function getOpenClasses(): Collection
    {
        return SchoolClass::where('class_status', 'Open')
            ->where('enrolled_students', '<', 'max_students')
            ->with(['course', 'faculty'])
            ->get();
    }

    /**
     * Create new class
     */
    public function createClass(array $data): SchoolClass
    {
        return SchoolClass::create($data);
    }

    /**
     * Update class information
     */
    public function updateClass(int $classId, array $data): bool
    {
        $class = SchoolClass::find($classId);
        if (!$class) {
            return false;
        }
        return $class->update($data);
    }

    /**
     * Delete class
     */
    public function deleteClass(int $classId): bool
    {
        $class = SchoolClass::find($classId);
        if (!$class) {
            return false;
        }
        return $class->delete();
    }

    /**
     * Check if class is available for enrollment
     */
    public function isClassAvailable(int $classId): bool
    {
        $class = SchoolClass::find($classId);
        if (!$class) {
            return false;
        }
        return $class->class_status === 'Open' && $class->enrolled_students < $class->max_students;
    }

    /**
     * Cancel class
     */
    public function cancelClass(int $classId): bool
    {
        return $this->updateClass($classId, ['class_status' => 'Cancelled']);
    }

    /**
     * Close class
     */
    public function closeClass(int $classId): bool
    {
        return $this->updateClass($classId, ['class_status' => 'Closed']);
    }
}
