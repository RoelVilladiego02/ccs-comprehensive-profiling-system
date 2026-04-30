# 500 Error Issues - Visual Summary

## Error Flow Diagrams

### ❌ BEFORE: Event Registration 500 Error Flow

```
Student Request: POST /api/events/8/register/3
    ↓
Route (NO auth:sanctum middleware)
    ↓
EventController::registerStudent()
    ↓
$user = $request->user()  ← Returns NULL (no auth check)
    ↓
$user->hasAnyRole(['Admin', 'Staff'])  ← Calling method on NULL
    ↓
FATAL ERROR: Call to a member function hasAnyRole() on null
    ↓
🔴 500 Internal Server Error
```

**Additional Issue**: Even if auth worked, comparing `$user->id` (User table) with `$studentId` (Student table)
- These are different ID spaces!
- Wrong authorization logic

---

### ✅ AFTER: Event Registration Fixed Flow

```
Student Request: POST /api/events/8/register/3
    ↓
Route with auth:sanctum middleware
    ↓
Middleware checks token → Valid ✓
    ↓
EventController::registerStudent()
    ↓
if (!$user) → Check NULL first
    ↓ (User is authenticated)
Get $user->student relationship
    ↓
Compare $userStudent->student_id === $studentId  ← Correct comparison
    ↓
✅ 200 OK: Student registered successfully
```

---

### ❌ BEFORE: Lessons 500 Error Flow

```
Faculty Request: GET /api/lessons
    ↓
LessonController::index()
    ↓
$user = $request->user()  ← May be NULL, no check
    ↓
if ($user->hasRole('Faculty'))  ← Calling on possibly NULL user
    ↓
$faculty = $user->faculty  ← If relationship missing = NULL
    ↓
$faculty->faculty_id  ← Accessing property on NULL
    ↓
FATAL ERROR: Call to a member function ... on null
    ↓
🔴 500 Internal Server Error
```

---

### ✅ AFTER: Lessons Fixed Flow

```
Faculty Request: GET /api/lessons
    ↓
LessonController::index() with auth:sanctum
    ↓
if (!$user) → Explicit NULL check
    ↓ (User is authenticated)
if ($user->hasRole('Faculty'))
    ↓
$faculty = $user->faculty
    ↓
if (!$faculty) → Check NULL before access
    ↓ (Relationship exists)
$lessons = $this->lessonService->getLessonsByFaculty(...)
    ↓
✅ 200 OK: Lessons returned
    
    OR if relationship missing:
    ↓
✅ 404 Not Found: "Faculty profile not found for this user"
```

---

## Code Comparison

### Issue 1: Missing Auth Middleware

```php
// ❌ BEFORE
Route::prefix('events')->group(function () {
    Route::post('/{eventId}/register/{studentId}', [EventController::class, 'registerStudent']);
});

// ✅ AFTER  
Route::prefix('events')->middleware('auth:sanctum')->group(function () {
    Route::post('/{eventId}/register/{studentId}', [EventController::class, 'registerStudent']);
});
```

**Result**: Requests without authentication token now return 401 instead of 500

---

### Issue 2: NULL User Check

```php
// ❌ BEFORE
$user = $request->user();
if ($user && !$user->hasAnyRole(['Admin', 'Staff']) && $user->id !== $studentId) {
    // Problem: Still doesn't handle NULL properly
}

// ✅ AFTER
$user = $request->user();
if (!$user) {
    return response()->json(['message' => 'Unauthorized - Please log in'], 401);
}
// Now safe to use $user
if (!$user->hasAnyRole(['Admin', 'Staff'])) {
    // ...
}
```

**Result**: Explicit NULL handling with clear error message

---

### Issue 3: Wrong ID Comparison

```php
// ❌ BEFORE
if ($user && !$user->hasAnyRole(['Admin', 'Staff']) && $user->id !== $studentId) {
    //  $user->id        = ID from 'users' table (primary key)
    //  $studentId       = ID from 'student' table (student_id)
    //  These are DIFFERENT TABLES - wrong comparison!
}

// ✅ AFTER
if (!$user->hasAnyRole(['Admin', 'Staff'])) {
    $userStudent = $user->student;  // Get associated Student record
    if (!$userStudent || $userStudent->student_id !== $studentId) {
        // Now comparing correct IDs from same table!
    }
}
```

**Result**: Correct authorization checks comparing appropriate IDs

---

### Issue 4: Missing Profile Handling

```php
// ❌ BEFORE
$faculty = $user->faculty;
if (!$faculty) {
    return response()->json(['message' => 'Faculty profile not found'], 404);
}
$lessons = $this->lessonService->getLessonsByFaculty($faculty->faculty_id, $perPage);
// No check that relationship actually exists before access

// ✅ AFTER
$faculty = $user->faculty;
if (!$faculty) {
    return response()->json([
        'success' => false,
        'message' => 'Faculty profile not found for this user',  // More helpful
    ], 404);
}
$lessons = $this->lessonService->getLessonsByFaculty($faculty->faculty_id, $perPage);
// Clear error message helps debug issues
```

**Result**: Better error messages for troubleshooting

---

## HTTP Status Codes Now Used Correctly

```
401 Unauthorized   ← User not authenticated
400 Bad Request    ← Student already registered / no capacity
403 Forbidden      ← User trying to register someone else
404 Not Found      ← Event/student doesn't exist, OR faculty/student profile missing
500 Internal Error ← Should never happen for these endpoints now
```

---

## Testing Matrix

| Scenario | Before | After |
|----------|--------|-------|
| Student registers without token | 500 ❌ | 401 ✅ |
| Student registers for own event | 500 ❌ | 200 ✅ |
| Student registers for other student | 500 ❌ | 403 ✅ |
| Faculty accesses lessons | 500 ❌ | 200/404 ✅ |
| Faculty without profile | 500 ❌ | 404 ✅ |
| No authentication token | 500 ❌ | 401 ✅ |

---

## Files Changed

| File | Changes | Lines |
|------|---------|-------|
| `backend/routes/api.php` | Added auth middleware | 1 line change |
| `backend/app/Http/Controllers/EventController.php` | Fixed registerStudent & unregisterStudent | 54 lines changed |
| `backend/app/Http/Controllers/LessonController.php` | Added auth check & better error handling | 45 lines changed |
| **Total** | **3 files** | **~100 lines** |

---

## Key Learnings

1. ✅ **Always add authentication middleware** to protected routes
2. ✅ **Check for NULL** after `$request->user()` 
3. ✅ **Use correct ID types** - User ID ≠ Student ID ≠ Faculty ID
4. ✅ **Validate relationships** before accessing their properties
5. ✅ **Provide clear error messages** for debugging

