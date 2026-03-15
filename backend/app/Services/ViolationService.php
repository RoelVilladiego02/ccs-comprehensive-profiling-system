<?php

namespace App\Services;

use App\Models\StudentViolations;
use Illuminate\Database\Eloquent\Collection;

class ViolationService
{
    /**
     * Report violation
     */
    public function reportViolation(int $studentId, array $violationData): StudentViolations
    {
        return StudentViolations::create(array_merge($violationData, [
            'student_id' => $studentId,
            'status' => $violationData['status'] ?? 'Pending',
            'violation_date' => $violationData['violation_date'] ?? now()->toDateString(),
        ]));
    }

    /**
     * Get student violations
     */
    public function getStudentViolations(int $studentId): Collection
    {
        return StudentViolations::where('student_id', $studentId)
            ->orderBy('violation_date', 'desc')
            ->get();
    }

    /**
     * Get violations by status
     */
    public function getViolationsByStatus(string $status): Collection
    {
        return StudentViolations::where('status', $status)
            ->with('student')
            ->orderBy('violation_date', 'desc')
            ->get();
    }

    /**
     * Get unresolved violations
     */
    public function getUnresolvedViolations(): Collection
    {
        return StudentViolations::where('status', '!=', 'Resolved')
            ->with('student')
            ->orderBy('violation_date', 'desc')
            ->get();
    }

    /**
     * Resolve violation
     */
    public function resolveViolation(int $violationId, ?string $penalty = null): bool
    {
        return StudentViolations::where('violation_id', $violationId)
            ->update([
                'status' => 'Resolved',
                'resolution_date' => now()->toDateString(),
                'penalty' => $penalty,
            ]);
    }

    /**
     * Get violations by type
     */
    public function getViolationsByType(string $type): Collection
    {
        return StudentViolations::where('violation_type', $type)
            ->with('student')
            ->get();
    }

    /**
     * Get violation count by student
     */
    public function getViolationCountByStudent(int $studentId): int
    {
        return StudentViolations::where('student_id', $studentId)->count();
    }

    /**
     * Get recent violations
     */
    public function getRecentViolations(int $days = 30): Collection
    {
        $date = now()->subDays($days)->toDateString();
        return StudentViolations::where('violation_date', '>=', $date)
            ->with('student')
            ->orderBy('violation_date', 'desc')
            ->get();
    }

    /**
     * Update violation
     */
    public function updateViolation(int $violationId, array $data): bool
    {
        return StudentViolations::where('violation_id', $violationId)
            ->update($data);
    }

    /**
     * Delete violation
     */
    public function deleteViolation(int $violationId): bool
    {
        return StudentViolations::where('violation_id', $violationId)
            ->delete() > 0;
    }
}
