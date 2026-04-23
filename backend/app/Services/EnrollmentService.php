<?php

namespace App\Services;

use App\Models\StudentClassStatus;
use App\Models\SchoolClass;
use Illuminate\Database\Eloquent\Collection;

class EnrollmentService
{
    /**
     * Enroll student in class
     * Returns array with status, message, and data
     */
    public function enrollStudentInClass(int $studentId, int $classId, string $enrollmentDate = null): array
    {
        // Check if class exists
        $class = SchoolClass::find($classId);
        if (!$class) {
            return [
                'success' => false,
                'message' => 'Class not found',
                'data' => null
            ];
        }

        // Check if already enrolled (prevents duplicate students)
        $existing = StudentClassStatus::where('student_id', $studentId)
            ->where('class_id', $classId)
            ->where('enrollment_status', '!=', 'Dropped')
            ->first();

        if ($existing) {
            return [
                'success' => false,
                'message' => 'Student is already enrolled in this class',
                'data' => null
            ];
        }

        // Check class capacity (respects max_students limit)
        if ($class->enrolled_students >= $class->max_students) {
            return [
                'success' => false,
                'message' => "Class is at full capacity ({$class->max_students} students)",
                'data' => null
            ];
        }

        try {
            // Create enrollment
            $enrollment = StudentClassStatus::create([
                'student_id' => $studentId,
                'class_id' => $classId,
                'enrollment_status' => 'Enrolled',
                'enrollment_date' => $enrollmentDate ?? now()->toDateString(),
            ]);

            return [
                'success' => true,
                'message' => 'Student enrolled successfully',
                'data' => $enrollment
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'message' => 'Failed to enroll student: ' . $e->getMessage(),
                'data' => null
            ];
        }
    }

    /**
     * Withdraw student from class
     */
    public function withdrawStudent(int $enrollmentId): bool
    {
        $enrollment = StudentClassStatus::find($enrollmentId);
        if (!$enrollment) {
            return false;
        }
        return $enrollment->update(['enrollment_status' => 'Dropped']);
    }

    /**
     * Complete student enrollment
     */
    public function completeEnrollment(int $enrollmentId): bool
    {
        $enrollment = StudentClassStatus::find($enrollmentId);
        if (!$enrollment) {
            return false;
        }
        return $enrollment->update([
            'enrollment_status' => 'Completed',
            'completion_date' => now()->toDateString(),
        ]);
    }

    /**
     * Get student enrollments
     */
    public function getStudentEnrollments(int $studentId): Collection
    {
        return StudentClassStatus::where('student_id', $studentId)
            ->with('class')
            ->get();
    }

    /**
     * Get class enrollments
     */
    public function getClassEnrollments(int $classId): Collection
    {
        return StudentClassStatus::where('class_id', $classId)
            ->with('student')
            ->get();
    }

    /**
     * Get active enrollments for student
     */
    public function getActiveEnrollments(int $studentId): Collection
    {
        return StudentClassStatus::where('student_id', $studentId)
            ->where('enrollment_status', 'Enrolled')
            ->with('class.course')
            ->get();
    }

    /**
     * Update enrollment status
     */
    public function updateEnrollmentStatus(int $enrollmentId, string $status): bool
    {
        $enrollment = StudentClassStatus::find($enrollmentId);
        if (!$enrollment) {
            return false;
        }

        $data = ['enrollment_status' => $status];
        if ($status === 'Completed') {
            $data['completion_date'] = now()->toDateString();
        }

        return $enrollment->update($data);
    }

    /**
     * Set final grade for enrollment
     */
    public function setFinalGrade(int $enrollmentId, float $grade): bool
    {
        return StudentClassStatus::where('enrollment_id', $enrollmentId)
            ->update(['final_grade' => $grade]);
    }

    /**
     * Get enrollments by status
     */
    public function getEnrollmentsByStatus(string $status): Collection
    {
        return StudentClassStatus::where('enrollment_status', $status)
            ->with(['student', 'class'])
            ->get();
    }
}
