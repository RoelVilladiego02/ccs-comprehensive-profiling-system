# Authentication & Authorization System Documentation

## Overview
A comprehensive role-based access control (RBAC) system using Laravel Sanctum tokens and middleware.

---

## Quick Start

### 1. Run Migrations & Seeders
```bash
php artisan migrate:fresh --seed
```

This creates the necessary database tables and seeds default roles and test users.

### 2. Test Users (Default Credentials)
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@ccs.edu | admin123456 |
| Faculty | faculty@ccs.edu | faculty123456 |
| Student | student@ccs.edu | student123456 |
| Staff | staff@ccs.edu | staff123456 |

---

## Authentication Endpoints

### Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123456",
  "password_confirmation": "password123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { ... },
    "token": "3|abcdef123456..."
  }
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@ccs.edu",
  "password": "admin123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Administrator",
      "email": "admin@ccs.edu",
      "roles": [
        {
          "role_id": 1,
          "role_name": "Admin",
          "permissions": [...]
        }
      ]
    },
    "token": "3|abcdef123456..."
  }
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer {token}
```

### Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "New Name",
  "email": "newemail@example.com"
}
```

### Change Password
```http
POST /api/auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "current_password": "admin123456",
  "new_password": "newpassword123456",
  "new_password_confirmation": "newpassword123456"
}
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

---

## Role & Permission Management (Admin Only)

### Get All Roles
```http
GET /api/admin/roles
Authorization: Bearer {admin-token}
```

### Get All Permissions
```http
GET /api/admin/permissions
Authorization: Bearer {admin-token}
```

### Create New Role
```http
POST /api/admin/roles
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "role_name": "Manager",
  "role_description": "Department Manager",
  "is_active": true
}
```

### Assign Permission to Role
```http
POST /api/admin/roles/{roleId}/permissions/{permissionId}
Authorization: Bearer {admin-token}
```

### Remove Permission from Role
```http
DELETE /api/admin/roles/{roleId}/permissions/{permissionId}
Authorization: Bearer {admin-token}
```

### Assign Role to User
```http
POST /api/admin/users/{userId}/roles/{roleId}
Authorization: Bearer {admin-token}
```

### Remove Role from User
```http
DELETE /api/admin/users/{userId}/roles/{roleId}
Authorization: Bearer {admin-token}
```

### Get User Roles
```http
GET /api/admin/users/{userId}/roles
Authorization: Bearer {admin-token}
```

### Get User Permissions
```http
GET /api/admin/users/{userId}/permissions
Authorization: Bearer {admin-token}
```

---

## Available Roles

### 1. Admin
- **Full Access**: All permissions granted
- **Description**: System administrator

### 2. Faculty
- **Permissions**: 
  - View students, courses, classes
  - Manage own classes
  - Record grades and attendance
  - View/report violations
- **Use Case**: Instructors managing courses and students

### 3. Student
- **Permissions**:
  - View own profile
  - View courses and classes
  - View grades and attendance records
- **Use Case**: Students accessing their academic information

### 4. Staff
- **Permissions**:
  - View/create students and faculty
  - View courses and classes
  - Manage enrollments
  - Report violations
- **Use Case**: Administrative staff managing academic records

---

## Available Permissions

### Student Management
- `students.view` - View student list
- `students.create` - Create new students
- `students.edit` - Edit student information
- `students.delete` - Delete students
- `students.view_profile` - View detailed student profile

### Course Management
- `courses.view` - View courses
- `courses.create` - Create courses
- `courses.edit` - Edit courses
- `courses.delete` - Delete courses

### Faculty Management
- `faculty.view` - View faculty list
- `faculty.create` - Create faculty
- `faculty.edit` - Edit faculty
- `faculty.delete` - Delete faculty

### Class Management
- `classes.view` - View classes
- `classes.create` - Create classes
- `classes.edit` - Edit classes
- `classes.delete` - Delete classes
- `classes.manage_own` - Manage own assigned classes

### Enrollment Management
- `enrollments.view` - View enrollments
- `enrollments.create` - Create enrollments
- `enrollments.edit` - Edit enrollments
- `enrollments.delete` - Delete enrollments

### Grades Management
- `grades.view` - View grades
- `grades.create` - Record grades
- `grades.edit` - Edit grades
- `grades.delete` - Delete grades

### Attendance Management
- `attendance.view` - View attendance records
- `attendance.create` - Record attendance
- `attendance.edit` - Edit attendance
- `attendance.delete` - Delete attendance records

### Violations Management
- `violations.view` - View violations
- `violations.create` - Report violations
- `violations.edit` - Edit violations
- `violations.delete` - Delete violations

### System Management
- `roles.manage` - Manage roles
- `permissions.manage` - Manage permissions
- `users.manage` - Manage users

---

## Middleware Usage

### Authentication Middleware
```php
// All routes in protected group require authentication
Route::middleware('auth:sanctum')->group(function () {
    // Protected routes
});
```

### Role Middleware
```php
// Check if user has specific role
Route::middleware('role:Admin')->group(function () {
    // Only Admin can access
});

// Multiple roles (OR logic)
Route::middleware('role:Admin,Faculty')->group(function () {
    // Admin OR Faculty can access
});
```

### Permission Middleware
```php
// Check if user has specific permission
Route::middleware('permission:students.view')->group(function () {
    // Users with "students.view" permission
});

// Multiple permissions (OR logic)
Route::middleware('permission:students.create,students.edit')->group(function () {
    // Users with either permission
});
```

### User Active Middleware
```php
// Ensure user is active
Route::middleware('active.user')->group(function () {
    // Only active users
});
```

---

## Using Authentication in Controllers

```php
class StudentController extends Controller
{
    public function index(Request $request)
    {
        // Get current user
        $user = $request->user();
        
        // Check role
        if ($user->hasRole('Admin')) {
            // Admin logic
        }
        
        // Check permission
        if ($user->hasPermission('students.create')) {
            // Can create students
        }
        
        // Check multiple roles
        if ($user->hasAnyRole(['Admin', 'Faculty'])) {
            // Admin or Faculty
        }
    }
}
```

---

## Using Authentication in Models/Services

```php
class StudentService
{
    public function getStudents(User $user)
    {
        if ($user->hasPermission('students.view')) {
            return Student::all();
        }
        
        throw new UnauthorizedException('No permission');
    }
}
```

---

## Token Management

### Create Token (Automatic on Login)
Tokens are automatically generated during login via Sanctum.

### Revoke All Tokens (Logout)
All user tokens are automatically revoked on logout.

### Token Format
```
Bearer {token}
```

### Example Request with Token
```bash
curl -H "Authorization: Bearer 3|abcdef123456..." \
  https://ccs.edu/api/students
```

---

## Error Responses

### 401 Unauthorized - No Token
```json
{
  "message": "Unauthenticated."
}
```

### 401 Unauthorized - Invalid Token
```json
{
  "message": "Unauthenticated."
}
```

### 401 Unauthorized - Inactive User
```json
{
  "success": false,
  "message": "User account is inactive"
}
```

### 403 Forbidden - Insufficient Role
```json
{
  "success": false,
  "message": "Forbidden - Insufficient role privileges"
}
```

### 403 Forbidden - Insufficient Permission
```json
{
  "success": false,
  "message": "Forbidden - Insufficient permissions"
}
```

---

## Security Best Practices

1. **Always Use HTTPS** in production
2. **Keep Tokens Secure** - Don't expose in URLs or logs
3. **Token Expiration** - Implement token expiration policies
4. **CSRF Protection** - Already included by Laravel
5. **Rate Limiting** - Consider adding rate limiting middleware
6. **Validate Input** - Always validate user input
7. **Log Security Events** - Monitor login attempts and role changes

---

## Database Schema

### Users Table
```sql
- id (primary key)
- name
- email (unique)
- password (hashed)
- is_active (boolean)
- email_verified_at
- timestamps
```

### Roles Table
```sql
- role_id (primary key)
- role_name (unique)
- role_description
- is_active (boolean)
- timestamps
```

### Permissions Table
```sql
- permission_id (primary key)
- permission_name (unique)
- permission_description
- module
- timestamps
```

### Role_User Junction Table (With Timestamps)
```sql
- id (primary key)
- id (foreign key → users.id)
- role_id (foreign key → roles.role_id)
- timestamps
- unique(id, role_id)
```

### Role_Permission Junction Table (With Timestamps)
```sql
- id (primary key)
- role_id (foreign key → roles.role_id)
- permission_id (foreign key → permissions.permission_id)
- timestamps
- unique(role_id, permission_id)
```

---

## Troubleshooting

### Issue: "Unauthenticated" Error
**Solution**: Ensure token is included in Authorization header
```bash
Authorization: Bearer {your_token}
```

### Issue: "Token Mismatch"
**Solution**: Clear browser cache and get new token

### Issue: User Can't Access Resource Despite Having Role
**Solution**: Verify permissions assigned to role
```bash
GET /api/admin/users/{userId}/permissions
```

### Issue: Migration Fails
**Solution**: Clear migrations and start fresh
```bash
php artisan migrate:reset
php artisan migrate:fresh --seed
```

---

## Next Steps

1. Implement token refresh mechanism
2. Add two-factor authentication (2FA)
3. Set up login attempt rate limiting
4. Add audit logging for sensitive operations
5. Implement OAuth2 for third-party integrations
6. Add JWT support if needed
