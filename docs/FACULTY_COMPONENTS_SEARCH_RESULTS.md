# Faculty Components & Architecture - Search Results

## 1. "My Classes" Text References

| Location | Type | Details |
|----------|------|---------|
| [frontend/src/components/FacultyDashboard.jsx](frontend/src/components/FacultyDashboard.jsx#L83) | Component | Line 83: Stat card header `<h3>My Classes</h3>` |
| [frontend/src/components/FacultyDashboard.jsx](frontend/src/components/FacultyDashboard.jsx#L108) | Component | Line 108: Section header `<h2>My Classes</h2>` |
| [frontend/src/components/Sidebar.jsx](frontend/src/components/Sidebar.jsx#L21) | Navigation | Line 21: Sidebar menu item with icon `{ id: 'classes', label: 'My Classes', icon: '👥' }` |

---

## 2. Faculty Sidebar Component

**File:** [frontend/src/components/Sidebar.jsx](frontend/src/components/Sidebar.jsx)

**Faculty Navigation Items:**
```javascript
faculty: [
  { id: 'dashboard', label: 'Dashboard', icon: '📱' },
  { id: 'students', label: 'Students', icon: '👤', description: 'View & Filter Students' },
  { id: 'classes', label: 'My Classes', icon: '👥' },
  { id: 'grades', label: 'Grades', icon: '✏️' },
  { id: 'attendance', label: 'Attendance', icon: '✓' },
]
```

**Features:**
- ✅ Dynamic role-based navigation
- ✅ Collapsible sidebar with toggle
- ✅ User info display with avatar
- ✅ Logout button
- ✅ CSS variable integration for responsive layout

---

## 3. Faculty Dashboard Components

### A. FacultyDashboard.jsx
**Path:** [frontend/src/components/FacultyDashboard.jsx](frontend/src/components/FacultyDashboard.jsx)

**Status:** ❌ Mock Data (uses test data, not fully functional)

**Current Implementation:**
- Fetches classes using `classAPI.getByFaculty(userData.id)`
- Displays stat cards showing:
  - My Classes (count)
  - Total Students (enrolled)
  - Capacity Used (percentage)
  - Active Classes (count)
- Sections implemented:
  - Dashboard
  - Classes (with table view)
  - Grades (placeholder)
  - Attendance (placeholder)

**Class Fetch Logic:**
```javascript
const fetchClasses = async () => {
  try {
    setClassesLoading(true)
    const response = await classAPI.getByFaculty(userData.id)
    if (response.data.success) {
      setClasses(response.data.data || [])
    }
  } catch (err) {
    // Error handling
  }
}
```

**Styling:** [frontend/src/styles/FacultyDashboard.css](frontend/src/styles/FacultyDashboard.css)

---

### B. FacultyStudentDashboard.jsx
**Path:** [frontend/src/components/FacultyStudentDashboard.jsx](frontend/src/components/FacultyStudentDashboard.jsx)

**Status:** ✅ Working

**Purpose:** Show students from faculty's classes with filtering capabilities

**Features:**
- View student list from enrolled classes
- Search students
- Filter by skills and affiliations
- Cannot create/edit/delete (read-only for faculty)
- Permission-aware UI

---

## 4. Faculty Class Display

### FacultyClassTable.jsx
**Path:** [frontend/src/components/FacultyClassTable.jsx](frontend/src/components/FacultyClassTable.jsx)

**Displays:**
- Course code
- Section
- Academic year & semester
- Schedule (day/time)
- Room
- Enrollment (current/max)
- Class status

---

## 5. Faculty Authentication Structure

### How Faculty ID is Accessed

**Frontend User Data Object (userData):**
```javascript
{
  id: <USER_ID>,          // User table primary key
  name: string,
  email: string,
  roles: array,
  // Faculty ID NOT currently included in auth response
}
```

**⚠️ ISSUE IDENTIFIED:**
- Frontend uses `userData.id` (User ID)
- Backend expects `faculty_id` (Faculty table ID)
- These are different database IDs

### Backend User Model
**File:** [backend/app/Models/User.php](backend/app/Models/User.php)

**Faculty Relationship:**
```php
public function faculty(): HasOne
{
    return $this->hasOne(Faculty::class, 'email', 'email');
}
```

**Relationship Details:**
- User is matched to Faculty by email (not by direct foreign key)
- Faculty table has no `user_id` field
- Faculty identified by `faculty_id` primary key

### Backend AuthController
**File:** [backend/app/Http/Controllers/AuthController.php](backend/app/Http/Controllers/AuthController.php)

**Login Response (line 65-86):**
- ✅ Loads student data if email matches
- ❌ **DOES NOT load faculty data** (potential bug)

```php
$userData = $user->load('roles')->toArray();

// Tries to find associated student record by email
$student = Student::where('email', $user->email)->first();
if ($student) {
    $userData['student_id'] = $student->student_id;
    $userData['student_number'] = $student->student_number;
}
// Missing: Faculty data loading
```

---

## 6. Backend Database & API Relationships

### Faculty Model
**File:** [backend/app/Models/Faculty.php](backend/app/Models/Faculty.php)

```php
class Faculty extends Model
{
    protected $table = 'faculty';
    protected $primaryKey = 'faculty_id';
    
    public function classes(): HasMany
    {
        return $this->hasMany(SchoolClass::class, 'faculty_id', 'faculty_id');
    }
}
```

**Faculty Table Structure:**
- `faculty_id` (PK)
- `faculty_number`
- `first_name`, `middle_name`, `last_name`, `suffix`
- `gender`, `email`, `phone_number`
- `employment_status`, `department`
- Timestamps: `created_at`, `updated_at`

---

### SchoolClass Model
**File:** [backend/app/Models/SchoolClass.php](backend/app/Models/SchoolClass.php)

```php
class SchoolClass extends Model
{
    protected $table = 'class';
    protected $primaryKey = 'class_id';
    
    public function faculty(): BelongsTo
    {
        return $this->belongsTo(Faculty::class, 'faculty_id', 'faculty_id');
    }
    
    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id', 'course_id');
    }
    
    public function students()
    {
        return $this->hasManyThrough(
            Student::class,
            StudentClassStatus::class,
            'class_id',
            'student_id',
            'class_id',
            'student_id'
        );
    }
}
```

**Class Table Structure:**
- `class_id` (PK)
- `course_id` (FK → Course)
- **`faculty_id` (FK → Faculty)** ← KEY RELATIONSHIP
- `section`, `academic_year`, `semester`
- `schedule_day`, `schedule_time`, `schedule_end_time`
- `room`, `max_students`, `enrolled_students`, `class_status`

---

### Faculty → Classes Relationship Flow

```
User (email) 
  ↓ (matches by email)
Faculty (faculty_id)
  ↓ (one-to-many via faculty_id)
SchoolClass (class_id, faculty_id)
  ↓ (many-to-many through StudentClassStatus)
Student
```

---

## 7. Backend API Endpoints

### Classes API Routes
**File:** [backend/routes/api.php](backend/routes/api.php#L120)

```php
Route::prefix('classes')->middleware('permission:classes.view')->group(function () {
    Route::get('/', [ClassController::class, 'index']);
    Route::get('/open', [ClassController::class, 'getOpen']);
    Route::post('/', [ClassController::class, 'store'])->middleware('permission:classes.create');
    Route::get('/{id}', [ClassController::class, 'show']);
    Route::put('/{id}', [ClassController::class, 'update'])->middleware('permission:classes.edit');
    Route::delete('/{id}', [ClassController::class, 'destroy'])->middleware('permission:classes.delete');
    Route::get('/faculty/{facultyId}', [ClassController::class, 'getByFaculty']); // KEY ENDPOINT
});
```

### Faculty Classes Endpoint
**Controller:** [backend/app/Http/Controllers/ClassController.php](backend/app/Http/Controllers/ClassController.php#L159-L168)

```php
/**
 * GET /api/classes/faculty/{facultyId}
 * Get classes by faculty
 */
public function getByFaculty(int $facultyId): JsonResponse
{
    $classes = $this->classService->getClassesByFaculty($facultyId);
    
    return response()->json([
        'success' => true,
        'data' => $classes,
    ]);
}
```

### ClassService Implementation
**File:** [backend/app/Services/ClassService.php](backend/app/Services/ClassService.php#L46-L51)

```php
public function getClassesByFaculty(int $facultyId): Collection
{
    return SchoolClass::where('faculty_id', $facultyId)
        ->with(['course'])
        ->get();
}
```

---

## 8. Frontend API Service

**File:** [frontend/src/services/api.js](frontend/src/services/api.js#L98-L107)

```javascript
export const classAPI = {
  getAll: (perPage = 15) => apiClient.get('/classes', { params: { per_page: perPage } }),
  getById: (id) => apiClient.get(`/classes/${id}`),
  getOpen: () => apiClient.get('/classes/open'),
  getByFaculty: (facultyId) => apiClient.get(`/classes/faculty/${facultyId}`),
  create: (data) => apiClient.post('/classes', data),
  update: (id, data) => apiClient.put(`/classes/${id}`, data),
  delete: (id) => apiClient.delete(`/classes/${id}`)
}
```

---

## 9. Student Filtering by Faculty

### StudentService Faculty Filtering
**File:** [backend/app/Services/StudentService.php](backend/app/Services/StudentService.php#L155-L165)

**Pattern Used:**
Faculty can only see students enrolled in their classes via nested relationships:

```php
Student::whereHas('classStatuses', function ($query) use ($facultyId) {
    $query->whereHas('class', function ($classQuery) use ($facultyId) {
        $classQuery->where('faculty_id', $facultyId);
    });
})
```

**This pattern appears in multiple methods:**
- Line 159-161: Base student list
- Line 171-173: Search students
- Line 191-193: Get by skill
- Line 209-211: Get by affiliation
- Line 227-229: Get by violation status
- Line 246-248: Get by year level

---

## 10. Known Issues & Gaps

| Issue | Severity | Details |
|-------|----------|---------|
| **Faculty ID Not in Auth Response** | HIGH | AuthController doesn't load faculty data like it does for students. Frontend must derive faculty_id from email or implement workaround |
| **Frontend Uses Wrong ID** | HIGH | FacultyDashboard uses `userData.id` (User ID) instead of `faculty_id` for API calls |
| **Mock Data** | MEDIUM | FacultyDashboard.jsx marked as "Mock Data" in component analysis |
| **Incomplete Sections** | LOW | Grades and Attendance sections are placeholders |

---

## 11. Summary Table

| Component | Status | File | Purpose |
|-----------|--------|------|---------|
| **Sidebar** | ✅ Working | [Sidebar.jsx](frontend/src/components/Sidebar.jsx) | Navigation menu with "My Classes" item |
| **FacultyDashboard** | ⚠️ Partial | [FacultyDashboard.jsx](frontend/src/components/FacultyDashboard.jsx) | Main dashboard with class list |
| **FacultyStudentDashboard** | ✅ Working | [FacultyStudentDashboard.jsx](frontend/src/components/FacultyStudentDashboard.jsx) | Student viewing/filtering |
| **FacultyClassTable** | ✅ Working | [FacultyClassTable.jsx](frontend/src/components/FacultyClassTable.jsx) | Displays faculty's classes |
| **Faculty Model** | ✅ Complete | [Faculty.php](backend/app/Models/Faculty.php) | Faculty database model |
| **SchoolClass Model** | ✅ Complete | [SchoolClass.php](backend/app/Models/SchoolClass.php) | Class model with faculty FK |
| **ClassService** | ✅ Complete | [ClassService.php](backend/app/Services/ClassService.php) | Business logic for class retrieval |
| **ClassController** | ✅ Complete | [ClassController.php](backend/app/Http/Controllers/ClassController.php) | API endpoints |
| **API Routes** | ✅ Complete | [api.php](backend/routes/api.php#L120) | Faculty class endpoint configured |

---

## 12. Recommended Fixes

### Fix 1: Add Faculty Data to Auth Response
**File:** [backend/app/Http/Controllers/AuthController.php](backend/app/Http/Controllers/AuthController.php)

After loading student data, also load faculty data:
```php
$faculty = Faculty::where('email', $user->email)->first();
if ($faculty) {
    $userData['faculty_id'] = $faculty->faculty_id;
    $userData['faculty_number'] = $faculty->faculty_number;
}
```

### Fix 2: Update Frontend to Use faculty_id
**File:** [frontend/src/components/FacultyDashboard.jsx](frontend/src/components/FacultyDashboard.jsx#L27)

```javascript
const fetchClasses = async () => {
    if (!userData?.faculty_id) {  // Use faculty_id instead of id
      setError('Faculty information not available')
      setLoading(false)
      return
    }
    
    const response = await classAPI.getByFaculty(userData.faculty_id)
    // ...
}
```
