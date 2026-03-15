<?php

namespace App\Services;

use App\Models\Attendance;
use Illuminate\Database\Eloquent\Collection;

class AttendanceService
{
    /**
     * Record attendance
     */
    public function recordAttendance(int $studentId, int $classId, string $date, string $status, ?string $remarks = null): Attendance
    {
        return Attendance::updateOrCreate(
            ['student_id' => $studentId, 'class_id' => $classId, 'attendance_date' => $date],
            ['status' => $status, 'remarks' => $remarks]
        );
    }

    /**
     * Get attendance record
     */
    public function getAttendanceRecord(int $studentId, int $classId, string $date): ?Attendance
    {
        return Attendance::where('student_id', $studentId)
            ->where('class_id', $classId)
            ->where('attendance_date', $date)
            ->first();
    }

    /**
     * Get student attendance for a class
     */
    public function getStudentClassAttendance(int $studentId, int $classId): Collection
    {
        return Attendance::where('student_id', $studentId)
            ->where('class_id', $classId)
            ->get();
    }

    /**
     * Get class attendance for a date
     */
    public function getClassAttendanceByDate(int $classId, string $date): Collection
    {
        return Attendance::where('class_id', $classId)
            ->where('attendance_date', $date)
            ->with('student')
            ->get();
    }

    /**
     * Get attendance statistics for student in class
     */
    public function getStudentAttendanceStats(int $studentId, int $classId): array
    {
        $records = Attendance::where('student_id', $studentId)
            ->where('class_id', $classId)
            ->get();

        if ($records->isEmpty()) {
            return [
                'total_sessions' => 0,
                'present' => 0,
                'absent' => 0,
                'late' => 0,
                'excused' => 0,
                'attendance_rate' => 0,
            ];
        }

        $total = $records->count();
        $present = $records->where('status', 'Present')->count();
        $absent = $records->where('status', 'Absent')->count();
        $late = $records->where('status', 'Late')->count();
        $excused = $records->where('status', 'Excused')->count();

        return [
            'total_sessions' => $total,
            'present' => $present,
            'absent' => $absent,
            'late' => $late,
            'excused' => $excused,
            'attendance_rate' => round(($present / $total) * 100, 2),
        ];
    }

    /**
     * Get class attendance statistics for a date
     */
    public function getClassAttendanceStats(int $classId, string $date): array
    {
        $records = Attendance::where('class_id', $classId)
            ->where('attendance_date', $date)
            ->get();

        if ($records->isEmpty()) {
            return [
                'total_enrolled' => 0,
                'present' => 0,
                'absent' => 0,
                'late' => 0,
                'excused' => 0,
            ];
        }

        return [
            'total_enrolled' => $records->count(),
            'present' => $records->where('status', 'Present')->count(),
            'absent' => $records->where('status', 'Absent')->count(),
            'late' => $records->where('status', 'Late')->count(),
            'excused' => $records->where('status', 'Excused')->count(),
        ];
    }

    /**
     * Mark entire class attendance
     */
    public function markClassAttendance(int $classId, string $date, array $attendanceMap): bool
    {
        try {
            foreach ($attendanceMap as $studentId => $status) {
                $this->recordAttendance($studentId, $classId, $date, $status);
            }
            return true;
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Get attendance by status
     */
    public function getAttendanceByStatus(int $classId, string $status): Collection
    {
        return Attendance::where('class_id', $classId)
            ->where('status', $status)
            ->with('student')
            ->get();
    }
}
