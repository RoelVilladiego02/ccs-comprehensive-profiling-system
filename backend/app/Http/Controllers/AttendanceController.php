<?php

namespace App\Http\Controllers;

use App\Services\AttendanceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    protected AttendanceService $attendanceService;

    public function __construct(AttendanceService $attendanceService)
    {
        $this->attendanceService = $attendanceService;
    }

    /**
     * POST /api/attendance
     * Record attendance
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:student,student_id',
            'class_id' => 'required|exists:class,class_id',
            'attendance_date' => 'required|date_format:Y-m-d',
            'status' => 'required|in:Present,Absent,Late,Excused',
            'remarks' => 'nullable|string',
        ]);

        $attendance = $this->attendanceService->recordAttendance(
            $validated['student_id'],
            $validated['class_id'],
            $validated['attendance_date'],
            $validated['status'],
            $validated['remarks'] ?? null
        );

        return response()->json([
            'success' => true,
            'message' => 'Attendance recorded successfully',
            'data' => $attendance,
        ], 201);
    }

    /**
     * POST /api/attendance/bulk
     * Record attendance for entire class
     */
    public function bulkRecord(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'class_id' => 'required|exists:class,class_id',
            'attendance_date' => 'required|date_format:Y-m-d',
            'attendance_map' => 'required|array',
            'attendance_map.*' => 'required|in:Present,Absent,Late,Excused',
        ]);

        $success = $this->attendanceService->markClassAttendance(
            $validated['class_id'],
            $validated['attendance_date'],
            $validated['attendance_map']
        );

        if (!$success) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to record attendance',
            ], 400);
        }

        return response()->json([
            'success' => true,
            'message' => 'Attendance recorded successfully for entire class',
        ]);
    }

    /**
     * GET /api/attendance/student/{studentId}/class/{classId}
     * Get attendance for student in class
     */
    public function getStudentClassAttendance(int $studentId, int $classId): JsonResponse
    {
        $attendance = $this->attendanceService->getStudentClassAttendance($studentId, $classId);

        return response()->json([
            'success' => true,
            'data' => $attendance,
        ]);
    }

    /**
     * GET /api/attendance/student/{studentId}/class/{classId}/stats
     * Get attendance statistics for student
     */
    public function getStudentAttendanceStats(int $studentId, int $classId): JsonResponse
    {
        $stats = $this->attendanceService->getStudentAttendanceStats($studentId, $classId);

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * GET /api/attendance/class/{classId}/date/{date}
     * Get class attendance by date
     */
    public function getClassAttendanceByDate(int $classId, string $date): JsonResponse
    {
        $attendance = $this->attendanceService->getClassAttendanceByDate($classId, $date);

        return response()->json([
            'success' => true,
            'data' => $attendance,
        ]);
    }

    /**
     * GET /api/attendance/class/{classId}/date/{date}/stats
     * Get class attendance statistics for date
     */
    public function getClassAttendanceStats(int $classId, string $date): JsonResponse
    {
        $stats = $this->attendanceService->getClassAttendanceStats($classId, $date);

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }
}
