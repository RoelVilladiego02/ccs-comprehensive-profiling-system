<?php

namespace App\Services;

use App\Models\Student;

class StudentProfileService
{
    protected GradeService $gradeService;

    public function __construct(GradeService $gradeService)
    {
        $this->gradeService = $gradeService;
    }
    /**
     * Get comprehensive student profile
     */
    public function getStudentProfile(int $studentId): ?array
    {
        $student = Student::with([
            'classStatuses.class.course',
            'programs',
            'attendance',
            'grades',
            'violations',
            'medicalRecords',
            'affiliations',
            'academicHistory',
            'nonAcademicHistory',
            'skills'
        ])->find($studentId);

        if (!$student) {
            return null;
        }

        return [
            'student' => $student->toArray(),
            'violations' => $student->violations->toArray(),
            'skills' => $student->skills->toArray(),
            'affiliations' => $student->affiliations->toArray(),
            'academic_history' => $student->academicHistory->toArray(),
            'non_academic_history' => $student->nonAcademicHistory->toArray(),
            'medical_records' => $student->medicalRecords ? $student->medicalRecords->toArray() : [],
            'academic_summary' => [
                'total_courses' => $student->classStatuses->count(),
                'completed_courses' => $student->classStatuses->where('enrollment_status', 'Completed')->count(),
                'current_courses' => $student->classStatuses->where('enrollment_status', 'Enrolled')->count(),
                'gpa' => $this->calculateGPA($student),
            ],
            'attendance_summary' => $this->calculateAttendanceSummary($student),
            'violations_summary' => [
                'total_violations' => $student->violations->count(),
                'unresolved_violations' => $student->violations->where('status', '!=', 'Resolved')->count(),
            ],
        ];
    }

    /**
     * Calculate GPA from grades (returns 0-4.0 scale)
     */
    private function calculateGPA(Student $student): float
    {
        if ($student->grades->isEmpty()) {
            return 0;
        }

        // Use GradeService to calculate GPA in 4.0 scale
        return $this->gradeService->calculateGPAFromGradesInScale($student->grades);
    }

    /**
     * Calculate attendance summary
     */
    private function calculateAttendanceSummary(Student $student): array
    {
        $totalAttendance = $student->attendance->count();
        $presentCount = $student->attendance->where('status', 'Present')->count();
        $absentCount = $student->attendance->where('status', 'Absent')->count();
        $lateCount = $student->attendance->where('status', 'Late')->count();

        return [
            'total_sessions' => $totalAttendance,
            'present' => $presentCount,
            'absent' => $absentCount,
            'late' => $lateCount,
            'attendance_rate' => $totalAttendance > 0 ? round(($presentCount / $totalAttendance) * 100, 2) : 0,
        ];
    }

    /**
     * Get student's academic performance
     */
    public function getAcademicPerformance(int $studentId): ?array
    {
        $student = Student::with('grades.class.course')->find($studentId);

        if (!$student) {
            return null;
        }

        $grades = $student->grades;

        return [
            'total_courses' => $grades->count(),
            'average_grade' => $grades->avg('final_grade') ?? 0,
            'passed_courses' => $grades->where('is_passed', true)->count(),
            'failed_courses' => $grades->where('is_passed', false)->count(),
            'courses' => $grades->map(function ($grade) {
                return [
                    'course_code' => $grade->class->course->course_code,
                    'course_title' => $grade->class->course->course_title,
                    'grade' => $grade->final_grade,
                    'letter_grade' => $grade->grade_letter,
                    'status' => $grade->is_passed ? 'Passed' : 'Failed',
                ];
            }),
        ];
    }

    /**
     * Get student's current semester courses
     */
    public function getStudentCurrentCourses(int $studentId): array
    {
        $student = Student::with('classStatuses.class.course', 'classStatuses.class.faculty')->find($studentId);

        if (!$student) {
            return [];
        }

        return $student->classStatuses
            ->where('enrollment_status', 'Enrolled')
            ->map(function ($enrollment) {
                return [
                    'class_id' => $enrollment->class->class_id,
                    'course_code' => $enrollment->class->course->course_code,
                    'course_title' => $enrollment->class->course->course_title,
                    'faculty' => $enrollment->class->faculty->getFullNameAttribute(),
                    'schedule_day' => $enrollment->class->schedule_day,
                    'schedule_time' => $enrollment->class->schedule_time,
                    'room' => $enrollment->class->room,
                ];
            })
            ->values()
            ->toArray();
    }
}
