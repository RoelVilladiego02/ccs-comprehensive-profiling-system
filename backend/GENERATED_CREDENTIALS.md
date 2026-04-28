# Generated Login Credentials

## 📚 System Overview
After running `php artisan migrate:fresh --seed`, the database is populated with:
- **1 Admin account** (test)
- **1 Staff account** (test)
- **15 Faculty members** (with login accounts)
- **1003 Students** (with login accounts)
- **30 Classes** with ~34 students each
- **2000+ Grade records** (midterm and final)

---

## 🔐 Test Accounts (Pre-configured)

Use these credentials to test different roles immediately:

| Email | Password | Role |
|---|---|---|
| `admin@ccs.edu` | `admin123456` | Admin |
| `faculty@ccs.edu` | `faculty123456` | Faculty |
| `student@ccs.edu` | `student123456` | Student |
| `staff@ccs.edu` | `staff123456` | Staff |

---

## 👨‍🏫 Faculty Accounts (15 total)

### Named Faculty (with User Accounts)
All named faculty can login with:
- **Password**: `faculty123456`
- **Email**: Their `@ccs.edu` email address

**Available Faculty Emails:**
- `faculty@ccs.edu` (Dr. Faculty) ← Also matches test user
- `prof.smith@ccs.edu` (James Smith)
- `prof.johnson@ccs.edu` (Maria Johnson)
- ... plus 12 randomly generated faculty

> **Tip**: Query the database to see all faculty:
> ```sql
> SELECT faculty_id, first_name, last_name, email FROM faculty;
> ```

---

## 👨‍🎓 Student Accounts (1003 total)

All students can login with:
- **Password**: `student123456`
- **Email**: Their `@ccs.edu` email address

### Sample Student Emails:
- `student@ccs.edu` (John Student) ← Also matches test user
- `jane.doe@ccs.edu` (Jane Doe)
- `michael.smith@ccs.edu` (Michael Smith)
- ... plus 1000 randomly generated students

> **Tip**: Query the database to see all students:
> ```sql
> SELECT student_id, student_number, first_name, last_name, email FROM student ORDER BY student_id LIMIT 20;
> ```

---

## 🎯 How to Login

### 1. Go to the Login Page
Navigate to your frontend URL (e.g., `http://localhost:5173/login`)

### 2. Enter Credentials
- **Email/Username**: Any email from the faculty or student list above
- **Password**: `faculty123456` (for faculty) or `student123456` (for students)

### 3. Click Login
You'll be authenticated and redirected to the appropriate dashboard.

---

## 📊 Database Queries to Find Specific Users

### Find a specific faculty member:
```sql
SELECT u.email, u.name, f.faculty_number, f.department
FROM users u
JOIN faculty f ON LOWER(u.email) = LOWER(f.email)
WHERE f.department = 'Computer Science'
LIMIT 5;
```

### Find a student with classes:
```sql
SELECT s.email, s.student_number, s.first_name, s.last_name,
       COUNT(scs.class_id) as enrolled_classes
FROM users u
JOIN student s ON LOWER(u.email) = LOWER(s.email)
LEFT JOIN student_class_status scs ON s.student_id = scs.student_id
GROUP BY s.student_id
LIMIT 10;
```

### Find a student's grades:
```sql
SELECT s.first_name, s.last_name, c.course_id, co.course_title,
       g.assessment_type, g.score, g.final_grade
FROM student s
JOIN student_class_status scs ON s.student_id = scs.student_id
JOIN class c ON scs.class_id = c.class_id
JOIN course co ON c.course_id = co.course_id
JOIN grades g ON g.student_id = s.student_id AND g.class_id = c.class_id
WHERE s.email = 'student@ccs.edu'
ORDER BY c.class_id, g.assessment_type;
```

---

## 🔄 Password Reset

If you need to reset a password in the database:

```php
// In Laravel Tinker or Seeder
$user = User::where('email', 'student@ccs.edu')->first();
$user->password = Hash::make('newpassword123');
$user->save();
```

---

## ⚠️ Security Notes

- ⚠️ These are **test credentials only** for development/testing
- 🔒 Change all passwords before deploying to production
- 🔐 Use strong, unique passwords in production
- 💾 Store credentials securely (password manager, environment variables)

---

## 🚀 Next Steps

1. ✅ Run seeding: `php artisan migrate:fresh --seed`
2. ✅ Start your frontend: `npm run dev`
3. ✅ Login with any test account
4. ✅ Explore the dashboard and features

---

**Generated on**: {{ date('Y-m-d H:i:s') }}
**Total Users Created**: 1019 (15 faculty + 1003 students + 1 extra test account)
