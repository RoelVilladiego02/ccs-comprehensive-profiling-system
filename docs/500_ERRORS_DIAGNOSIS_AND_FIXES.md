# 500 Error Diagnosis and Fixes

## Overview
Two critical 500 errors were occurring in production:
1. **Event Registration Error**: `POST /api/events/8/register/3:1` 
2. **Lessons Access Error**: `GET /api/lessons:1` 

Both errors prevented students from registering for events and faculty from accessing lessons.

---

## Issue 1: Event Registration 500 Error

### Error Message
```
Failed to load resource: the server responded with a status of 500 ()
Error registering for event: AxiosError: Request failed with status code 500
```

### Root Causes

#### **Problem A: Missing Authentication Middleware**
- **File**: `backend/routes/api.php`
- **Issue**: The event registration routes did NOT have the `auth:sanctum` middleware requirement
- **Impact**: When `$request->user()` was called in `EventController::registerStudent()`, it could return NULL for unauthenticated requests, but the code didn't check for this before calling methods on the user object
- **Line 226**: Event routes were defined without authentication middleware

#### **Problem B: Null User Exception**
- **File**: `backend/app/Http/Controllers/EventController.php`
- **Issue**: Line 254 had `$user->hasAnyRole()` but `$user` could be NULL
- **Code**:
  ```php
  if ($user && !$user->hasAnyRole(['Admin', 'Staff']) && $user->id !== $studentId) {
      // This would throw an error if $user is NULL
  }
  ```
- **Impact**: When no authentication token was provided, `$request->user()` returned NULL, causing a fatal error when calling methods on NULL

#### **Problem C: User ID vs Student ID Mismatch**
- **File**: `backend/app/Http/Controllers/EventController.php`
- **Issue**: Line 254 compared `$user->id` (User model ID) with `$studentId` (Student model ID) - these are completely different IDs!
- **Code**:
  ```php
  if ($user && !$user->hasAnyRole(['Admin', 'Staff']) && $user->id !== $studentId) {
      // $user->id is from the users table
      // $studentId is from the student table - they don't match!
  }
  ```
- **Impact**: Authorization checks would fail incorrectly, or access incorrect student records

### Solutions Applied

#### **Fix 1: Add auth:sanctum middleware (lines 211-238 in api.php)**
```php
Route::prefix('events')->middleware('auth:sanctum')->group(function () {
    // All event routes now require authentication
    Route::post('/{eventId}/register/{studentId}', [EventController::class, 'registerStudent']);
    // ... other routes
});
```
**Result**: All unauthenticated requests will be rejected with a 401 error instead of causing a 500

#### **Fix 2: Proper user validation and error handling (EventController.php)**
```php
public function registerStudent(Request $request, int $eventId, int $studentId): JsonResponse
{
    $user = $request->user();
    
    // Explicit NULL check - auth:sanctum middleware ensures this, but good practice
    if (!$user) {
        return response()->json([
            'success' => false,
            'message' => 'Unauthorized - Please log in',
        ], 401);
    }
    
    // Correct authorization logic - compare student IDs, not user IDs
    if (!$user->hasAnyRole(['Admin', 'Staff'])) {
        $userStudent = $user->student;  // Get the associated student
        if (!$userStudent || $userStudent->student_id !== $studentId) {
            return response()->json([
                'success' => false,
                'message' => 'Forbidden - You can only register yourself for events',
            ], 403);
        }
    }
    
    // ... rest of method
}
```
**Result**: 
- Proper authentication enforcement
- Correct authorization checks comparing student IDs
- Clear error messages for troubleshooting

---

## Issue 2: Lessons 500 Error

### Error Message
```
Failed to load resource: the server responded with a status of 500 ()
Failed to fetch lessons: AxiosError: Request failed with status code 500
```

### Root Causes

#### **Problem A: Missing Authentication Check**
- **File**: `backend/app/Http/Controllers/LessonController.php`
- **Issue**: Line 18 called `$request->user()->hasAnyRole()` but never checked if `$request->user()` was NULL
- **Impact**: Could cause a fatal error when user wasn't authenticated

#### **Problem B: Missing Faculty/Student Profile**
- **File**: `backend/app/Http/Controllers/LessonController.php`
- **Issue**: The code accessed `$user->faculty` and `$user->student` relationships
- **Seeder Issue**: If faculty/student records weren't created or linked properly in the seeding process, the relationship would return NULL
- **Lines 33-35**: For Faculty role users, if no Faculty record existed, the method returned a 404, but could also throw other errors

#### **Problem C: Insufficient NULL Checks**
- **File**: `backend/app/Http/Controllers/LessonController.php`
- **Lines 43-45**: Similar issue for Student role - if relationship didn't exist, the call would fail
- **Impact**: Any mismatch between seeded data and user relationships would cause a 500 error

### Solutions Applied

#### **Fix 1: Add explicit authentication check (LessonController.php)**
```php
public function index(Request $request): JsonResponse
{
    $user = $request->user();
    
    // Explicit check for authentication
    if (!$user) {
        return response()->json([
            'success' => false,
            'message' => 'Unauthorized - Please log in',
        ], 401);
    }
    
    // Now safe to use $user in method calls
    if ($user->hasAnyRole(['Admin', 'Staff'])) {
        // ...
    }
}
```

#### **Fix 2: Improved error messages for missing profiles (LessonController.php)**
```php
elseif ($user->hasRole('Faculty')) {
    $faculty = $user->faculty;
    if (!$faculty) {
        return response()->json([
            'success' => false,
            'message' => 'Faculty profile not found for this user',  // More descriptive
        ], 404);
    }
    $lessons = $this->lessonService->getLessonsByFaculty($faculty->faculty_id, $perPage);
}

elseif ($user->hasRole('Student')) {
    $student = $user->student;
    if (!$student) {
        return response()->json([
            'success' => false,
            'message' => 'Student profile not found for this user',  // More descriptive
        ], 404);
    }
    $lessons = $this->lessonService->getLessonsForStudent($student->student_id, $perPage);
}
```

#### **Fix 3: Better role checking (LessonController.php)**
```php
else {
    return response()->json([
        'success' => false,
        'message' => 'Unauthorized role - User must have Admin, Staff, Faculty, or Student role',
    ], 403);
}
```

---

## Root Cause Summary

| Error | Root Cause | Type | Severity |
|-------|-----------|------|----------|
| Event Registration 500 | Missing `auth:sanctum` middleware + NULL user check | Auth/Code Logic | Critical |
| Event Registration 500 | Comparing User ID with Student ID | Logic Error | Critical |
| Lessons 500 | No authentication check before using user | Auth/Code Logic | Critical |
| Lessons 500 | Missing/broken Faculty/Student relationships | Data Inconsistency | High |

---

## Changes Made

### Files Modified
1. **backend/routes/api.php**
   - Line 211: Changed `Route::prefix('events')->group(function () {` to `Route::prefix('events')->middleware('auth:sanctum')->group(function () {`
   - Effect: All event routes now require authentication

2. **backend/app/Http/Controllers/EventController.php**
   - Lines 250-277: Complete rewrite of `registerStudent()` method
   - Lines 290-317: Complete rewrite of `unregisterStudent()` method
   - Effects: 
     - Added explicit NULL checks for user
     - Fixed authorization logic to compare student IDs instead of user IDs
     - Added 401 error for missing authentication

3. **backend/app/Http/Controllers/LessonController.php**
   - Lines 15-59: Improved `index()` method with explicit NULL checks
   - Effects:
     - Added authentication check at start
     - Improved error messages for missing profiles
     - Better role validation

---

## How to Verify the Fixes

### Test Event Registration
```bash
# With authentication token
curl -X POST \
  "https://ccs-comprehensive-profiling-system-production.up.railway.app/api/events/8/register/3" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Expected response: Success or 400 with descriptive message
# No more 500 errors
```

### Test Lessons Access
```bash
# With authentication token
curl -X GET \
  "https://ccs-comprehensive-profiling-system-production.up.railway.app/api/lessons" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"

# Expected response: Success with lessons list or 404 with profile not found message
# No more 500 errors
```

---

## Prevention for Future

1. **Always add authentication middleware** to protected routes
2. **Always check for NULL values** after `$request->user()` calls
3. **Use proper ID mappings** - understand which IDs belong to which models (User ID vs Student ID vs Faculty ID)
4. **Ensure seeder consistency** - verify that relationships are properly established during seeding
5. **Add explicit error handling** - use try-catch blocks and return proper HTTP status codes
6. **Test with real data** - test authorization scenarios with actual user/student relationships

---

## Testing Checklist

- [ ] Test student self-registration for event (should work with their own student ID)
- [ ] Test student trying to register for another student (should get 403)
- [ ] Test admin registering student (should work for any student ID)
- [ ] Test unauthenticated event registration request (should get 401)
- [ ] Test faculty accessing lessons (should see only their lessons or get 404 if profile missing)
- [ ] Test student accessing lessons (should see lessons for enrolled classes or get 404 if profile missing)
- [ ] Test admin accessing lessons (should see all lessons)
- [ ] Test unauthenticated lessons request (should get 401)
