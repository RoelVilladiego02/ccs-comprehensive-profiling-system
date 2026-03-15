# Role & Permission Matrix

## Quick Reference Table

| Permission | Admin | Faculty | Student | Staff |
|-----------|:-----:|:-------:|:-------:|:-----:|
| **Student Management** | | | | |
| students.view | ✓ | ✓ | | ✓ |
| students.create | ✓ | | | ✓ |
| students.edit | ✓ | | | ✓ |
| students.delete | ✓ | | | ✓ |
| students.view_profile | ✓ | ✓ | ✓ | ✓ |
| **Course Management** | | | | |
| courses.view | ✓ | ✓ | ✓ | ✓ |
| courses.create | ✓ | | | |
| courses.edit | ✓ | | | |
| courses.delete | ✓ | | | |
| **Faculty Management** | | | | |
| faculty.view | ✓ | ✓ | ✓ | ✓ |
| faculty.create | ✓ | | | ✓ |
| faculty.edit | ✓ | | | |
| faculty.delete | ✓ | | | |
| **Class Management** | | | | |
| classes.view | ✓ | ✓ | ✓ | ✓ |
| classes.create | ✓ | | | |
| classes.edit | ✓ | | | |
| classes.delete | ✓ | | | |
| classes.manage_own | ✓ | ✓ | | |
| **Enrollment Management** | | | | |
| enrollments.view | ✓ | ✓ | ✓ | ✓ |
| enrollments.create | ✓ | | | ✓ |
| enrollments.edit | ✓ | | | ✓ |
| enrollments.delete | ✓ | | | ✓ |
| **Grades Management** | | | | |
| grades.view | ✓ | ✓ | ✓ | ✓ |
| grades.create | ✓ | ✓ | | |
| grades.edit | ✓ | ✓ | | |
| grades.delete | ✓ | | | |
| **Attendance Management** | | | | |
| attendance.view | ✓ | ✓ | ✓ | ✓ |
| attendance.create | ✓ | ✓ | | ✓ |
| attendance.edit | ✓ | ✓ | | ✓ |
| attendance.delete | ✓ | | | |
| **Violations Management** | | | | |
| violations.view | ✓ | ✓ | ✓ | ✓ |
| violations.create | ✓ | ✓ | | ✓ |
| violations.edit | ✓ | ✓ | | ✓ |
| violations.delete | ✓ | | | |
| **System Management** | | | | |
| roles.manage | ✓ | | | |
| permissions.manage | ✓ | | | |
| users.manage | ✓ | | | |

---

## Role Descriptions

### 1. Admin (System Administrator)
**Total Permissions**: 36+ (all permissions)

**Primary Responsibilities**:
- System configuration and management
- User and role management
- Complete system access
- Permission distribution to other roles

**Cannot Be Restricted**: Admin role cannot be removed from its permissions

---

### 2. Faculty (Instructors/Professors)
**Total Permissions**: 14

**Includes**:
- Students: view, view_profile
- Courses: view
- Faculty: view
- Classes: view, manage_own (their own classes)
- Enrollment: view
- Grades: view, create, edit
- Attendance: view, create, edit
- Violations: view, create, edit

**Primary Responsibilities**:
- Manage their own class sections
- Record student grades
- Track attendance
- Report student violations
- View student profiles and information

**Example Workflow**:
1. Login with faculty@ccs.edu
2. View classes assigned to them
3. Record attendance in their class
4. Enter grades for their students
5. Report disciplinary violations

---

### 3. Student (Learners)
**Total Permissions**: 4

**Includes**:
- Students: view_profile (own profile only)
- Courses: view
- Classes: view (enrolled classes only)
- Enrollment: view (own enrollments only)
- Grades: view (own grades only)
- Attendance: view (own attendance only)
- Violations: view (own violations only)

**Primary Responsibilities**:
- View personal academic information
- Monitor grades and attendance
- Access course information
- Track enrollments

**Access Pattern**:
- Students can only see their own data
- Cannot modify any academic records
- Read-only access to system
- Cannot view other students' information

---

### 4. Staff (Administrative Staff)
**Total Permissions**: 11

**Includes**:
- Students: view, create, edit
- Courses: view
- Faculty: view, create
- Classes: view
- Enrollment: view, create, edit, delete
- Attendance: view, create, edit
- Violations: view, create, edit

**Primary Responsibilities**:
- Enroll students in courses
- Create and manage student records
- Add faculty members to system
- Track attendance (support)
- Report non-academic violations

**Example Workflow**:
1. Login with staff@ccs.edu
2. Create new student records
3. Create faculty profiles
4. Manage course enrollments
5. Support attendance tracking

---

## Permission Categories

### Student Management Category
- **Purpose**: Control access to student records and information
- **Permissions**: students.view, students.create, students.edit, students.delete, students.view_profile
- **Who Needs It**: Admin, Faculty (view), Staff (create/edit)

### Course Management Category
- **Purpose**: Control course catalog and course creation
- **Permissions**: courses.view, courses.create, courses.edit, courses.delete
- **Who Needs It**: Admin only (create/edit/delete), all roles (view)

### Faculty Management Category
- **Purpose**: Control instructor records
- **Permissions**: faculty.view, faculty.create, faculty.edit, faculty.delete
- **Who Needs It**: Admin, Staff (create)

### Class Management Category
- **Purpose**: Control class sections and scheduling
- **Permissions**: classes.view, classes.create, classes.edit, classes.delete, classes.manage_own
- **Who Needs It**: Admin, Faculty (manage_own)

### Enrollment Management Category
- **Purpose**: Control student enrollment in classes
- **Permissions**: enrollments.view, enrollments.create, enrollments.edit, enrollments.delete
- **Who Needs It**: Admin, Staff (all), Faculty (view only)

### Grades Management Category
- **Purpose**: Control grade recording and reporting
- **Permissions**: grades.view, grades.create, grades.edit, grades.delete
- **Who Needs It**: All roles for view, Admin/Faculty for create/edit

### Attendance Management Category
- **Purpose**: Control attendance tracking
- **Permissions**: attendance.view, attendance.create, attendance.edit, attendance.delete
- **Who Needs It**: All roles for view, Faculty/Staff for create/edit, Admin for delete

### Violations Management Category
- **Purpose**: Control student conduct records
- **Permissions**: violations.view, violations.create, violations.edit, violations.delete
- **Who Needs It**: Admin, Faculty, Staff for view/create/edit

### System Management Category
- **Purpose**: Control system-level configuration
- **Permissions**: roles.manage, permissions.manage, users.manage
- **Who Needs It**: Admin only

---

## API Endpoint Access by Role

### For Admin
```
GET/POST/PUT/DELETE /api/admin/* (full access)
GET/POST/PUT/DELETE /api/students/* (full access)
GET/POST/PUT/DELETE /api/courses/* (full access)
GET/POST/PUT/DELETE /api/faculty/* (full access)
GET/POST/PUT/DELETE /api/classes/* (full access)
GET/POST/PUT/DELETE /api/enrollments/* (full access)
GET/POST/PUT/DELETE /api/grades/* (full access)
GET/POST/PUT/DELETE /api/attendance/* (full access)
GET/POST/PUT/DELETE /api/violations/* (full access)
```

### For Faculty
```
GET /api/students (view list)
GET /api/students/{id} (view profile)
GET /api/courses
GET /api/classes
GET /api/classes/{id}/students (their own classes)
POST/PUT /api/grades (for their classes)
GET /api/grades
POST/PUT /api/attendance
GET /api/attendance
POST/PUT /api/violations (report student violations)
GET /api/violations
PUT /api/auth/profile (update own profile)
```

### For Student
```
GET /api/auth/me (own profile)
GET /api/courses
GET /api/classes
GET /api/enrollments (own only)
GET /api/grades (own only)
GET /api/attendance (own only)
GET /api/violations (own only)
PUT /api/auth/profile (own profile only)
POST /api/auth/change-password
```

### For Staff
```
POST /api/students (create new)
GET /api/students
PUT /api/students/{id} (edit)
GET /api/courses
GET /api/faculty
POST /api/faculty (create)
GET /api/classes
POST/PUT/DELETE /api/enrollments (manage enrollments)
GET /api/enrollments
POST/PUT /api/attendance
GET /api/attendance
POST/PUT /api/violations (report violations)
GET /api/violations
```

---

## Adding Custom Roles

To add a new role (e.g., "Department Head"):

### 1. Via API (Admin)
```bash
curl -X POST http://localhost:8000/api/admin/roles \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "role_name": "Department Head",
    "role_description": "Department Head with management capabilities",
    "is_active": true
  }'
```

### 2. Via Seeder (Development)
Edit `database/seeders/RolePermissionSeeder.php`:

```php
// Add new role
$deptHeadRole = Role::create([
    'role_name' => 'Department Head',
    'role_description' => 'Department Head with management capabilities',
    'is_active' => true,
]);

// Grant specific permissions
$deptHeadRole->grantPermission($studentViewPerm);
$deptHeadRole->grantPermission($courseViewPerm);
$deptHeadRole->grantPermission($facultyViewPerm);
// ... etc
```

### 3. Assign to User
```bash
# As Admin
curl -X POST http://localhost:8000/api/admin/users/{userId}/roles/{roleId} \
  -H "Authorization: Bearer {admin_token}"
```

---

## Permission Hierarchy

Some permissions imply others:

- **create** permission implies the resource exists (so view needed)
- **edit** permission implies viewing is necessary first
- **delete** is the most restricted and usually only for admins
- **view_profile** is special - different from standard view (personal data)
- **manage_own** allows editing only objects the user created/owns

---

## Security Considerations

1. **Never Grant All Permissions to Non-Admin Users**
   - Always use role-based assignment

2. **Regularly Audit Role Assignments**
   - Check who has admin role
   - Review permission usage

3. **Monitor Permission Changes**
   - Keep audit logs of permission grants/revokes
   - Alert on suspicious permission changes

4. **Principle of Least Privilege**
   - Give users only permissions they need
   - Remove permissions that are no longer needed

5. **Separate Admin Operations**
   - Use separate admin accounts for admin tasks
   - Don't use admin accounts for everyday work

---

## Migration Path for Users

### New User Registration
1. User registers via `/api/auth/register`
2. User has no roles initially
3. Admin assigns appropriate role
4. User permissions take effect immediately

### Changing User Role
1. Admin revokes current role: `DELETE /api/admin/users/{id}/roles/{roleId}`
2. Admin assigns new role: `POST /api/admin/users/{id}/roles/{roleId}`
3. User must re-login to get updated token with new permissions

### Deactivating User
1. Admin updates `is_active = 0`
2. User's existing tokens become invalid immediately
3. User cannot login until reactivated

---

## Testing Checklist

- [ ] Admin login works and has all permissions
- [ ] Faculty login works and cannot access admin endpoints
- [ ] Student login works and can only see own data
- [ ] Staff login works with appropriate permissions
- [ ] Inactive user cannot login
- [ ] Token expires after logout
- [ ] Adding new role works via API
- [ ] Assigning role to user works
- [ ] Permission checks enforce correctly on endpoints
