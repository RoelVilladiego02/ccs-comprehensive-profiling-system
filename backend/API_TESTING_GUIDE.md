# API Testing Guide - Authentication & Authorization

## Setup

1. **Run migrations and seeders**:
```bash
php artisan migrate:fresh --seed
```

2. **Start the development server**:
```bash
php artisan serve
```

The API will be available at `http://localhost:8000`

---

## Testing with cURL

### 1. Login as Admin
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ccs.edu",
    "password": "admin123456"
  }'
```

**Response** (save the token):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Administrator",
      "email": "admin@ccs.edu",
      "is_active": 1,
      "roles": [
        {
          "role_id": 1,
          "role_name": "Admin",
          "role_description": "Administrator with full access"
        }
      ]
    },
    "token": "2|YOUR_TOKEN_HERE"
  }
}
```

### 2. Get Current User (Authenticated)
```bash
# Replace YOUR_TOKEN with the token from login
TOKEN="2|YOUR_TOKEN_HERE"

curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Login as Different Roles

**Faculty**:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "faculty@ccs.edu",
    "password": "faculty123456"
  }'
```

**Student**:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@ccs.edu",
    "password": "student123456"
  }'
```

**Staff**:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "staff@ccs.edu",
    "password": "staff123456"
  }'
```

### 4. Test Authorization - Access Admin Endpoint as Student
```bash
# Faculty token
FACULTY_TOKEN="YOUR_FACULTY_TOKEN"

# Try to access admin roles endpoint (should fail with 403)
curl -X GET http://localhost:8000/api/admin/roles \
  -H "Authorization: Bearer $FACULTY_TOKEN"
```

**Expected Response** (403 Forbidden):
```json
{
  "success": false,
  "message": "Forbidden - Insufficient role privileges"
}
```

### 5. Register New User
```bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "password": "password123456",
    "password_confirmation": "password123456"
  }'
```

### 6. Update Profile
```bash
TOKEN="YOUR_TOKEN"

curl -X PUT http://localhost:8000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Name",
    "email": "newemail@example.com"
  }'
```

### 7. Change Password
```bash
TOKEN="YOUR_TOKEN"

curl -X POST http://localhost:8000/api/auth/change-password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "current_password": "admin123456",
    "new_password": "newpassword123456",
    "new_password_confirmation": "newpassword123456"
  }'
```

### 8. Logout
```bash
TOKEN="YOUR_TOKEN"

curl -X POST http://localhost:8000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

### 9. Get All Roles (Admin Only)
```bash
ADMIN_TOKEN="YOUR_ADMIN_TOKEN"

curl -X GET http://localhost:8000/api/admin/roles \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 10. Get All Permissions (Admin Only)
```bash
ADMIN_TOKEN="YOUR_ADMIN_TOKEN"

curl -X GET http://localhost:8000/api/admin/permissions \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 11. Assign Role to User (Admin Only)
```bash
ADMIN_TOKEN="YOUR_ADMIN_TOKEN"
USER_ID=5
ROLE_ID=2  # Faculty role

curl -X POST http://localhost:8000/api/admin/users/$USER_ID/roles/$ROLE_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 12. Get User Permissions (Admin Only)
```bash
ADMIN_TOKEN="YOUR_ADMIN_TOKEN"
USER_ID=1  # Admin user

curl -X GET http://localhost:8000/api/admin/users/$USER_ID/permissions \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## Testing with Postman

### 1. Create Collection
- New → Collection → "CCS API"

### 2. Add Environment Variables
- New Environment → "CCS Dev"
- Add variables:
  - `base_url`: `http://localhost:8000`
  - `admin_token`: (will be set after login)
  - `faculty_token`: (will be set after login)
  - `student_token`: (will be set after login)

### 3. Create Requests

#### Login Request
```
POST {{base_url}}/api/auth/login
Body (JSON):
{
  "email": "admin@ccs.edu",
  "password": "admin123456"
}

Tests tab (auto-save token):
pm.environment.set("admin_token", pm.response.json().data.token);
```

#### Get Current User
```
GET {{base_url}}/api/auth/me
Header:
Authorization: Bearer {{admin_token}}
```

#### Get All Roles
```
GET {{base_url}}/api/admin/roles
Header:
Authorization: Bearer {{admin_token}}
```

#### Test Authorization Failure
```
GET {{base_url}}/api/admin/roles
Header:
Authorization: Bearer {{student_token}}

Expected: 403 Forbidden
```

---

## Testing with Vite (Frontend Integration)

### Example Fetch Request
```javascript
// Login
const response = await fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@ccs.edu',
    password: 'admin123456'
  })
});

const data = await response.json();
const token = data.data.token;

// Store token in sessionStorage
sessionStorage.setItem('auth_token', token);

// Use token in subsequent requests
const userResponse = await fetch('http://localhost:8000/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## Testing Scenarios

### Scenario 1: Admin Full Access
1. Login as admin@ccs.edu
2. GET /api/admin/roles ✅
3. GET /api/admin/permissions ✅
4. POST /api/admin/users/{id}/roles/{roleId} ✅

### Scenario 2: Faculty Limited Access
1. Login as faculty@ccs.edu
2. GET /api/admin/roles ❌ (403 Forbidden)
3. GET /api/students ✅ (if permission granted)
4. POST /api/students ❌ (403 Forbidden)

### Scenario 3: Student Read-Only Access
1. Login as student@ccs.edu
2. GET /api/students ✅ (view own profile)
3. POST /api/students ❌ (403 Forbidden)
4. PUT /api/auth/profile ✅ (update own profile)

### Scenario 4: Inactive User Cannot Access
1. Admin disables user (is_active = 0)
2. User tries to login ❌ (401 Unauthorized)
3. Admin re-enables user (is_active = 1)
4. User can login again ✅

---

## Debugging

### Check Request Headers
```bash
curl -i -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Check Response Time
```bash
curl -w "@curl-format.txt" -o /dev/null -s \
  http://localhost:8000/api/students
```

### Enable Query Logging (Laravel)
In `.env`:
```
APP_DEBUG=true
```

Check `storage/logs/laravel.log` for SQL queries and errors.

### Verify Token Payload
```bash
# Token format: {payload}.{signature}.{hash}
# Decode payload (not secure, for debug only)
# Use https://jwt.io to decode token contents
```

---

## Performance Testing

### Load Testing Authentication
```bash
# Test 100 login requests
for i in {1..100}; do
  curl -X POST http://localhost:8000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "admin@ccs.edu",
      "password": "admin123456"
    }' &
done
```

### Benchmark Authorization Checks
Using Apache Bench:
```bash
# Get token first, then:
ab -n 1000 -c 10 -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/admin/roles
```

---

## Common Issues & Solutions

### Issue: "Unauthenticated" when token is correct
**Solution**: Ensure token is in exact format:
```
Authorization: Bearer {token}
```
(Not `Token:` or other variations)

### Issue: 419 Token Mismatch
**Solution**: Clear sessions and get new token:
```bash
php artisan tinker
# Type: DB::table('sessions')->delete();
# Type: exit
```

### Issue: CORS Errors in Frontend
**Solution**: Update `config/cors.php`:
```php
'allowed_origins' => ['http://localhost:5173'],
'supports_credentials' => true,
```

### Issue: Middleware Not Working
**Solution**: Verify middleware is registered in `bootstrap/app.php`:
```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias([
        'role' => \App\Http\Middleware\CheckRole::class,
        'permission' => \App\Http\Middleware\CheckPermission::class,
        'active.user' => \App\Http\Middleware\EnsureUserIsActive::class,
    ]);
})
```

---

## Next Steps

1. ✅ Run `php artisan migrate:fresh --seed`
2. ✅ Test login with provided credentials
3. ✅ Test role-based access with different users
4. □ Implement frontend login page integration
5. □ Add token refresh mechanism
6. □ Set up 2FA (two-factor authentication)
7. □ Implement audit logging for security events
