<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RolePermissionController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\FacultyController;
use App\Http\Controllers\ClassController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\GradeController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\ViolationController;
use App\Http\Controllers\StudentProfileController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// ====== PUBLIC AUTHENTICATION ROUTES ======
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// ====== PROTECTED ROUTES (Require Authentication) ======
Route::middleware(['auth:sanctum', 'active.user'])->group(function () {
    // Auth Routes
    Route::prefix('auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::post('/change-password', [AuthController::class, 'changePassword']);
    });

    // ====== ADMIN ONLY: Role & Permission Management ======
    Route::middleware('role:Admin')->prefix('admin')->group(function () {
        Route::get('/roles', [RolePermissionController::class, 'getRoles']);
        Route::get('/permissions', [RolePermissionController::class, 'getPermissions']);
        Route::post('/roles', [RolePermissionController::class, 'createRole']);
        Route::post('/roles/{roleId}/permissions/{permissionId}', [RolePermissionController::class, 'assignPermissionToRole']);
        Route::delete('/roles/{roleId}/permissions/{permissionId}', [RolePermissionController::class, 'removePermissionFromRole']);
        Route::post('/users/{userId}/roles/{roleId}', [RolePermissionController::class, 'assignRoleToUser']);
        Route::delete('/users/{userId}/roles/{roleId}', [RolePermissionController::class, 'removeRoleFromUser']);
        Route::get('/users/{userId}/roles', [RolePermissionController::class, 'getUserRoles']);
        Route::get('/users/{userId}/permissions', [RolePermissionController::class, 'getUserPermissions']);
    });

    // ====== Student Routes (Require Permission) ======
    Route::prefix('students')->middleware('permission:students.view')->group(function () {
        Route::get('/', [StudentController::class, 'index']);
        Route::get('/search', [StudentController::class, 'search']);
        Route::get('/filter/skills', [StudentController::class, 'getBySkill']);
        Route::get('/filter/affiliations', [StudentController::class, 'getByAffiliation']);
        Route::get('/filter/skills-list', [StudentController::class, 'getAvailableSkills']);
        Route::get('/filter/affiliations-list', [StudentController::class, 'getAvailableAffiliationTypes']);
        Route::post('/', [StudentController::class, 'store'])->middleware('permission:students.create');
        Route::get('/{id}', [StudentController::class, 'show']);
        Route::put('/{id}', [StudentController::class, 'update'])->middleware('permission:students.edit');
        Route::delete('/{id}', [StudentController::class, 'destroy'])->middleware('permission:students.delete');
        Route::get('/status/{status}', [StudentController::class, 'getByStatus']);

        // Student Profile Routes
        Route::get('/{studentId}/profile', [StudentProfileController::class, 'getProfile'])->middleware('permission:students.view_profile');
        Route::get('/{studentId}/academic-performance', [StudentProfileController::class, 'getAcademicPerformance'])->middleware('permission:students.view_profile');
        Route::get('/{studentId}/current-courses', [StudentProfileController::class, 'getCurrentCourses'])->middleware('permission:students.view_profile');
    });

    // ====== Course Routes (Require Permission) ======
    Route::prefix('courses')->middleware('permission:courses.view')->group(function () {
        Route::get('/', [CourseController::class, 'index']);
        Route::get('/search', [CourseController::class, 'search']);
        Route::get('/active', [CourseController::class, 'getActive']);
        Route::post('/', [CourseController::class, 'store'])->middleware('permission:courses.create');
        Route::get('/{id}', [CourseController::class, 'show']);
        Route::put('/{id}', [CourseController::class, 'update'])->middleware('permission:courses.edit');
        Route::delete('/{id}', [CourseController::class, 'destroy'])->middleware('permission:courses.delete');
        Route::get('/department/{department}', [CourseController::class, 'getByDepartment']);
    });

    // ====== Faculty Routes (Require Permission) ======
    Route::prefix('faculty')->middleware('permission:faculty.view')->group(function () {
        Route::get('/', [FacultyController::class, 'index']);
        Route::get('/search', [FacultyController::class, 'search']);
        Route::post('/', [FacultyController::class, 'store'])->middleware('permission:faculty.create');
        Route::get('/{id}', [FacultyController::class, 'show']);
        Route::put('/{id}', [FacultyController::class, 'update'])->middleware('permission:faculty.edit');
        Route::delete('/{id}', [FacultyController::class, 'destroy'])->middleware('permission:faculty.delete');
        Route::get('/department/{department}', [FacultyController::class, 'getByDepartment']);
    });

    // ====== Class Routes (Require Permission) ======
    Route::prefix('classes')->middleware('permission:classes.view')->group(function () {
        Route::get('/', [ClassController::class, 'index']);
        Route::get('/open', [ClassController::class, 'getOpen']);
        Route::post('/', [ClassController::class, 'store'])->middleware('permission:classes.create');
        Route::get('/{id}', [ClassController::class, 'show']);
        Route::put('/{id}', [ClassController::class, 'update'])->middleware('permission:classes.edit');
        Route::delete('/{id}', [ClassController::class, 'destroy'])->middleware('permission:classes.delete');
        Route::get('/faculty/{facultyId}', [ClassController::class, 'getByFaculty']);
    });

    // ====== Enrollment Routes (Require Permission) ======
    Route::prefix('enrollments')->middleware('permission:enrollments.view')->group(function () {
        Route::post('/', [EnrollmentController::class, 'store'])->middleware('permission:enrollments.create');
        Route::get('/student/{studentId}', [EnrollmentController::class, 'getStudentEnrollments']);
        Route::get('/class/{classId}', [EnrollmentController::class, 'getClassEnrollments']);
        Route::get('/student/{studentId}/active', [EnrollmentController::class, 'getActiveEnrollments']);
        Route::put('/{enrollmentId}/status', [EnrollmentController::class, 'updateStatus'])->middleware('permission:enrollments.edit');
        Route::put('/{enrollmentId}/grade', [EnrollmentController::class, 'setFinalGrade'])->middleware('permission:enrollments.edit');
        Route::delete('/{enrollmentId}', [EnrollmentController::class, 'destroy'])->middleware('permission:enrollments.delete');
    });

    // ====== Grade Routes (Require Permission) ======
    Route::prefix('grades')->middleware('permission:grades.view')->group(function () {
        Route::post('/', [GradeController::class, 'store'])->middleware('permission:grades.create');
        Route::get('/student/{studentId}', [GradeController::class, 'getStudentGrades']);
        Route::get('/class/{classId}', [GradeController::class, 'getClassGrades']);
        Route::get('/student/{studentId}/average', [GradeController::class, 'getStudentAverageGrade']);
        Route::get('/class/{classId}/statistics', [GradeController::class, 'getClassStatistics']);
        Route::put('/student/{studentId}/class/{classId}/midterm', [GradeController::class, 'updateMidtermGrade'])->middleware('permission:grades.edit');
        Route::put('/student/{studentId}/class/{classId}/final', [GradeController::class, 'updateFinalGrade'])->middleware('permission:grades.edit');
    });

    // ====== Attendance Routes (Require Permission) ======
    Route::prefix('attendance')->middleware('permission:attendance.view')->group(function () {
        Route::post('/', [AttendanceController::class, 'store'])->middleware('permission:attendance.create');
        Route::post('/bulk', [AttendanceController::class, 'bulkRecord'])->middleware('permission:attendance.create');
        Route::get('/student/{studentId}/class/{classId}', [AttendanceController::class, 'getStudentClassAttendance']);
        Route::get('/student/{studentId}/class/{classId}/stats', [AttendanceController::class, 'getStudentAttendanceStats']);
        Route::get('/class/{classId}/date/{date}', [AttendanceController::class, 'getClassAttendanceByDate']);
        Route::get('/class/{classId}/date/{date}/stats', [AttendanceController::class, 'getClassAttendanceStats']);
    });

    // ====== Violation Routes (Require Permission) ======
    Route::prefix('violations')->middleware('permission:violations.view')->group(function () {
        Route::post('/', [ViolationController::class, 'store'])->middleware('permission:violations.create');
        Route::get('/student/{studentId}', [ViolationController::class, 'getStudentViolations']);
        Route::get('/unresolved', [ViolationController::class, 'getUnresolved']);
        Route::get('/status/{status}', [ViolationController::class, 'getByStatus']);
        Route::get('/type/{type}', [ViolationController::class, 'getByType']);
        Route::get('/recent', [ViolationController::class, 'getRecent']);
        Route::put('/{violationId}/resolve', [ViolationController::class, 'resolve'])->middleware('permission:violations.edit');
        Route::delete('/{violationId}', [ViolationController::class, 'destroy'])->middleware('permission:violations.delete');
    });
});

// Health Check (Public)
Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'timestamp' => now()]);
});
