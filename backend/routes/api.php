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
use App\Http\Controllers\MedicalRecordsController;
use App\Http\Controllers\AffiliationController;
use App\Http\Controllers\AcademicHistoryController;
use App\Http\Controllers\NonAcademicHistoryController;
use App\Http\Controllers\SkillsController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\CurriculumController;

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
        // Specific filter and search routes MUST come before the catch-all /{id} route
        Route::get('/search', [StudentController::class, 'search']);
        Route::get('/filter/skills', [StudentController::class, 'getBySkill']);
        Route::get('/filter/affiliations', [StudentController::class, 'getByAffiliation']);
        Route::get('/filter/skills-list', [StudentController::class, 'getAvailableSkills']);
        Route::get('/filter/affiliations-list', [StudentController::class, 'getAvailableAffiliationTypes']);
        Route::get('/filter/skills-by-category', [StudentController::class, 'getSkillsByCategory']);
        Route::get('/filter/affiliations-by-type', [StudentController::class, 'getAffiliationsByType']);
        Route::get('/status/{status}', [StudentController::class, 'getByStatus']);
        
        // General routes
        Route::get('/', [StudentController::class, 'index']);
        Route::post('/', [StudentController::class, 'store'])->middleware('permission:students.create');
        Route::get('/{id}', [StudentController::class, 'show']);
        Route::put('/{id}', [StudentController::class, 'update'])->middleware('permission:students.edit');
        Route::delete('/{id}', [StudentController::class, 'destroy'])->middleware('permission:students.delete');

        // Student Profile Routes
        Route::get('/{studentId}/profile', [StudentProfileController::class, 'getProfile'])->middleware('permission:students.view_profile');
        Route::get('/{studentId}/academic-performance', [StudentProfileController::class, 'getAcademicPerformance'])->middleware('permission:students.view_profile');
        Route::get('/{studentId}/current-courses', [StudentProfileController::class, 'getCurrentCourses'])->middleware('permission:students.view_profile');

        // ====== Medical Records Routes (Nested under Students) ======
        Route::post('/{studentId}/medical-records', [MedicalRecordsController::class, 'store'])->middleware('permission:students.create');
        Route::get('/{studentId}/medical-records', [MedicalRecordsController::class, 'show'])->middleware('permission:students.view_profile');
        Route::put('/{studentId}/medical-records', [MedicalRecordsController::class, 'update'])->middleware('permission:students.edit');
        Route::delete('/{studentId}/medical-records', [MedicalRecordsController::class, 'destroy'])->middleware('permission:students.delete');

        // ====== Affiliations Routes (Nested under Students) ======
        Route::get('/{studentId}/affiliations', [AffiliationController::class, 'index'])->middleware('permission:students.view_profile');
        Route::post('/{studentId}/affiliations', [AffiliationController::class, 'store'])->middleware('permission:students.create');
        Route::get('/{studentId}/affiliations/{affiliationId}', [AffiliationController::class, 'show'])->middleware('permission:students.view_profile');
        Route::put('/{studentId}/affiliations/{affiliationId}', [AffiliationController::class, 'update'])->middleware('permission:students.edit');
        Route::delete('/{studentId}/affiliations/{affiliationId}', [AffiliationController::class, 'destroy'])->middleware('permission:students.delete');

        // ====== Academic History Routes (Nested under Students) ======
        Route::get('/{studentId}/academic-history', [AcademicHistoryController::class, 'index'])->middleware('permission:students.view_profile');
        Route::post('/{studentId}/academic-history', [AcademicHistoryController::class, 'store'])->middleware('permission:students.create');
        Route::get('/{studentId}/academic-history/{historyId}', [AcademicHistoryController::class, 'show'])->middleware('permission:students.view_profile');
        Route::put('/{studentId}/academic-history/{historyId}', [AcademicHistoryController::class, 'update'])->middleware('permission:students.edit');
        Route::delete('/{studentId}/academic-history/{historyId}', [AcademicHistoryController::class, 'destroy'])->middleware('permission:students.delete');

        // ====== Non-Academic History Routes (Nested under Students) ======
        Route::get('/{studentId}/non-academic-history', [NonAcademicHistoryController::class, 'index'])->middleware('permission:students.view_profile');
        Route::post('/{studentId}/non-academic-history', [NonAcademicHistoryController::class, 'store'])->middleware('permission:students.create');
        Route::get('/{studentId}/non-academic-history/{historyId}', [NonAcademicHistoryController::class, 'show'])->middleware('permission:students.view_profile');
        Route::put('/{studentId}/non-academic-history/{historyId}', [NonAcademicHistoryController::class, 'update'])->middleware('permission:students.edit');
        Route::delete('/{studentId}/non-academic-history/{historyId}', [NonAcademicHistoryController::class, 'destroy'])->middleware('permission:students.delete');

        // ====== Skills Routes (Nested under Students) ======
        Route::get('/{studentId}/skills', [SkillsController::class, 'index'])->middleware('permission:students.view_profile');
        Route::post('/{studentId}/skills', [SkillsController::class, 'store'])->middleware('permission:students.create');
        Route::get('/{studentId}/skills/{skillId}', [SkillsController::class, 'show'])->middleware('permission:students.view_profile');
        Route::put('/{studentId}/skills/{skillId}', [SkillsController::class, 'update'])->middleware('permission:students.edit');
        Route::delete('/{studentId}/skills/{skillId}', [SkillsController::class, 'destroy'])->middleware('permission:students.delete');
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

    // ====== Events Routes (Require Authentication) ======
    Route::prefix('events')->middleware('auth:sanctum')->group(function () {
        // Public/View endpoints - accessible to all authenticated users
        Route::get('/', [EventController::class, 'index']);
        Route::get('/search', [EventController::class, 'search']);
        Route::get('/upcoming', [EventController::class, 'getUpcoming']);
        Route::get('/past', [EventController::class, 'getPast']);
        Route::get('/type/{type}', [EventController::class, 'getByType']);
        Route::get('/status/{status}', [EventController::class, 'getByStatus']);
        Route::get('/{eventId}', [EventController::class, 'show']);
        Route::get('/{eventId}/statistics', [EventController::class, 'getStatistics']);
        Route::get('/{eventId}/top-performers', [EventController::class, 'getTopPerformers']);
        
        // Admin/Staff management endpoints
        Route::post('/', [EventController::class, 'store'])->middleware('permission:events.create');
        Route::put('/{eventId}', [EventController::class, 'update'])->middleware('permission:events.edit');
        Route::delete('/{eventId}', [EventController::class, 'destroy'])->middleware('permission:events.delete');
        
        // Event Student Management - Admin/Staff only
        Route::get('/{eventId}/students', [EventController::class, 'getEventStudents'])->middleware('permission:events.manage_students');
        Route::get('/{eventId}/students/{status}', [EventController::class, 'getStudentsByStatus'])->middleware('permission:events.manage_students');
        Route::put('/{eventId}/students/{studentId}/participation-status', [EventController::class, 'updateParticipationStatus'])->middleware('permission:events.manage_students');
        Route::put('/{eventId}/students/{studentId}/points', [EventController::class, 'recordPoints'])->middleware('permission:events.manage_students');
        
        // Student self-registration - allow students to register themselves
        Route::post('/{eventId}/register/{studentId}', [EventController::class, 'registerStudent']);
        Route::delete('/{eventId}/unregister/{studentId}', [EventController::class, 'unregisterStudent']);
    });

    // ====== Lessons Routes (Require Permission) ======
    Route::prefix('lessons')->middleware('permission:courses.view')->group(function () {
        Route::get('/', [LessonController::class, 'index']);
        Route::get('/search', [LessonController::class, 'search']);
        Route::get('/active', [LessonController::class, 'getActive']);
        Route::post('/', [LessonController::class, 'store'])->middleware('permission:courses.create');
        Route::get('/{id}', [LessonController::class, 'show']);
        Route::put('/{id}', [LessonController::class, 'update'])->middleware('permission:courses.edit');
        Route::delete('/{id}', [LessonController::class, 'destroy'])->middleware('permission:courses.delete');
        Route::get('/syllabus/{syllabusId}', [LessonController::class, 'getBySyllabus']);
    });

    // ====== Curriculum Routes (Require Permission) ======
    Route::prefix('curriculum')->middleware('permission:courses.view')->group(function () {
        Route::get('/', [CurriculumController::class, 'index']);
        Route::get('/search', [CurriculumController::class, 'search']);
        Route::get('/active', [CurriculumController::class, 'getActive']);
        Route::post('/', [CurriculumController::class, 'store'])->middleware('permission:courses.create');
        Route::get('/{id}', [CurriculumController::class, 'show']);
        Route::put('/{id}', [CurriculumController::class, 'update'])->middleware('permission:courses.edit');
        Route::delete('/{id}', [CurriculumController::class, 'destroy'])->middleware('permission:courses.delete');
        Route::get('/department/{department}', [CurriculumController::class, 'getByDepartment']);
    });
});

// Health Check (Public)
Route::get('/health', function () {
    return response()->json(['status' => 'ok', 'timestamp' => now()]);
});
