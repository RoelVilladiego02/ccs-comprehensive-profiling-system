<?php

namespace App\Services;

use App\Models\Grades;
use Illuminate\Database\Eloquent\Collection;

class GradeService
{
    /**
     * Create or update grade record
     */
    public function recordGrade(int $studentId, int $classId, array $gradeData): Grades
    {
        // Find existing grade or create new one
        $grade = Grades::firstOrCreate(
            ['student_id' => $studentId, 'class_id' => $classId],
            array_merge($gradeData, [
                'is_passed' => $this->calculatePassed($gradeData['final_grade'] ?? 0),
                'grade_letter' => $this->calculateGradeLetter($gradeData['final_grade'] ?? 0),
            ])
        );

        // If record exists, update it
        if ($grade->wasRecentlyCreated === false) {
            $grade->update(array_merge($gradeData, [
                'is_passed' => $this->calculatePassed($gradeData['final_grade'] ?? 0),
                'grade_letter' => $this->calculateGradeLetter($gradeData['final_grade'] ?? 0),
            ]));
        }

        return $grade;
    }

    /**
     * Get student's grade for a class
     */
    public function getStudentGrade(int $studentId, int $classId): ?Grades
    {
        return Grades::where('student_id', $studentId)
            ->where('class_id', $classId)
            ->first();
    }

    /**
     * Get all grades for a student
     */
    public function getStudentGrades(int $studentId): Collection
    {
        return Grades::where('student_id', $studentId)
            ->with('class.course')
            ->get();
    }

    /**
     * Get all grades for a class
     */
    public function getClassGrades(int $classId): Collection
    {
        return Grades::where('class_id', $classId)
            ->with('student')
            ->get();
    }

    /**
     * Calculate passing grade (60 or higher)
     */
    public function calculatePassed(float $grade): bool
    {
        return $grade >= 60;
    }

    /**
     * Calculate letter grade
     */
    public function calculateGradeLetter(float $grade): string
    {
        if ($grade >= 90) return 'A';
        if ($grade >= 80) return 'B';
        if ($grade >= 70) return 'C';
        if ($grade >= 60) return 'D';
        return 'F';
    }

    /**
     * Get class grade statistics
     */
    public function getClassGradeStatistics(int $classId): array
    {
        $grades = Grades::where('class_id', $classId)->get();

        if ($grades->isEmpty()) {
            return [
                'total_students' => 0,
                'average_grade' => 0,
                'passed_count' => 0,
                'failed_count' => 0,
            ];
        }

        return [
            'total_students' => $grades->count(),
            'average_grade' => round($grades->avg('final_grade'), 2),
            'passed_count' => $grades->where('is_passed', true)->count(),
            'failed_count' => $grades->where('is_passed', false)->count(),
            'highest_grade' => $grades->max('final_grade'),
            'lowest_grade' => $grades->min('final_grade'),
        ];
    }

    /**
     * Get student's average grade
     */
    public function getStudentAverageGrade(int $studentId): float
    {
        $average = Grades::where('student_id', $studentId)->avg('final_grade');
        return $average ? round($average, 2) : 0;
    }

    /**
     * Update midterm grade
     */
    public function updateMidtermGrade(int $studentId, int $classId, float $grade): bool
    {
        return Grades::where('student_id', $studentId)
            ->where('class_id', $classId)
            ->update(['midterm_grade' => $grade]);
    }

    /**
     * Update final grade
     */
    public function updateFinalGrade(int $studentId, int $classId, float $grade): bool
    {
        $updated = Grades::where('student_id', $studentId)
            ->where('class_id', $classId)
            ->update([
                'final_grade' => $grade,
                'is_passed' => $this->calculatePassed($grade),
                'grade_letter' => $this->calculateGradeLetter($grade),
            ]);

        return $updated > 0;
    }
}
