# Quick Fix Reference - 500 Errors

## Problems Fixed

### ❌ Event Registration: POST /api/events/8/register/3:1
- **Error**: 500 Internal Server Error
- **Root Cause**: No authentication middleware + NULL user check + wrong ID comparison
- **Fixed**: ✅

### ❌ Lessons Access: GET /api/lessons:1  
- **Error**: 500 Internal Server Error
- **Root Cause**: No authentication check + missing faculty/student profile handling
- **Fixed**: ✅

---

## What Changed

### 1. API Routes (backend/routes/api.php)
```diff
- Route::prefix('events')->group(function () {
+ Route::prefix('events')->middleware('auth:sanctum')->group(function () {
```
**Impact**: Events routes now require authentication

### 2. Event Controller - registerStudent() (backend/app/Http/Controllers/EventController.php)
```diff
- if ($user && !$user->hasAnyRole(['Admin', 'Staff']) && $user->id !== $studentId) {
+ if (!$user) {
+     return response()->json(['message' => 'Unauthorized - Please log in'], 401);
+ }
+ if (!$user->hasAnyRole(['Admin', 'Staff'])) {
+     $userStudent = $user->student;
+     if (!$userStudent || $userStudent->student_id !== $studentId) {
```
**Impact**: 
- Proper authentication validation
- Correct student ID comparison
- Clear error messages

### 3. Event Controller - unregisterStudent() (backend/app/Http/Controllers/EventController.php)
Similar fixes as registerStudent()

### 4. Lesson Controller - index() (backend/app/Http/Controllers/LessonController.php)
```diff
+ if (!$user) {
+     return response()->json(['message' => 'Unauthorized - Please log in'], 401);
+ }

- if (!$faculty) {
-     return response()->json(['message' => 'Faculty profile not found'], 404);
- }
+ if (!$faculty) {
+     return response()->json(['message' => 'Faculty profile not found for this user'], 404);
+ }
```
**Impact**: 
- Authentication check before using user
- Better error messages
- Prevents NULL reference errors

---

## Deployment Steps

1. **Backup current files** (if needed)
2. **Update files**:
   - `backend/routes/api.php`
   - `backend/app/Http/Controllers/EventController.php`
   - `backend/app/Http/Controllers/LessonController.php`
3. **Clear Laravel cache**:
   ```bash
   php artisan config:clear
   php artisan route:clear
   php artisan cache:clear
   ```
4. **Test endpoints** with authentication token

---

## Key Takeaways

| Issue | Solution |
|-------|----------|
| Missing auth check | Add `auth:sanctum` middleware |
| NULL user access | Check `if (!$user)` before using |
| Wrong ID comparison | Use `$user->student->student_id` not `$user->id` |
| Missing profiles | Verify seeder creates relationships |
| Unclear errors | Return specific HTTP status codes |

---

## Common Error Scenarios Now Fixed

### Before ❌
- Event registration → 500 error (no auth check, NULL user)
- Lessons access → 500 error (no profile handling)

### After ✅
- Event registration without token → 401 Unauthorized
- Event registration with wrong student ID → 403 Forbidden  
- Event registration success → 200 OK
- Lessons without faculty profile → 404 Not Found (with message)
- Lessons success → 200 OK with data

