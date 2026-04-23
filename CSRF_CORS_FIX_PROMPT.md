# CSRF Token & CORS Policy Fix - Deployment Issue Resolution

## Problem Statement

When deploying a Laravel 12 backend (Railway) with a React + Vite frontend (Vercel), the login endpoint (`/api/auth/login`) returns **HTTP 419 CSRF token mismatch** errors followed by **CORS policy violations**.

**Error Details:**
```
419 UNKNOWN
CSRF token mismatch.

Access to XMLHttpRequest at 'https://ccs-comprehensive-profiling-system-production.up.railway.app/sanctum/csrf-cookie' 
from origin 'https://ccs-comprehensive-profiling-system.vercel.app' has been blocked by CORS policy: 
The value of the 'Access-Control-Allow-Origin' header in the response must not be the wildcard '*' 
when the request's credentials mode is 'include'.
```

**Root Causes:**
1. Stateful CSRF token validation not working across domains
2. CORS middleware returning `*` (wildcard) with credentials mode enabled
3. CORS headers not allowing CSRF-related headers
4. CORS middleware not handling preflight (OPTIONS) requests correctly
5. `/sanctum/csrf-cookie` endpoint not properly configured for SPA authentication

---

## Solution Overview

The fix involves proper CORS configuration, Sanctum stateful domain setup, and frontend CSRF token handling.

---

## Files Involved (with context)

### Backend Configuration Files

#### 1. **backend/config/sanctum.php**
**Purpose:** Configure Sanctum's stateful domains for CSRF protection  
**Key Change:** Use environment variable for stateful domains instead of hardcoded values  
**Content:**
```php
'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 
    'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1'
)),
```
**Environment Variable Required:**
```
SANCTUM_STATEFUL_DOMAINS=ccs-comprehensive-profiling-system-production.up.railway.app,ccs-comprehensive-profiling-system.vercel.app
```

#### 2. **backend/config/session.php**
**Purpose:** Configure session cookie domain for cross-domain sharing  
**Key Change:** Set domain to `.railway.app` for subdomain cookie sharing  
**Content:**
```php
'domain' => env('SESSION_DOMAIN', '.railway.app'),
```
**Environment Variable Required:**
```
SESSION_DOMAIN=.railway.app
```

#### 3. **backend/bootstrap/app.php**
**Purpose:** Register middleware stack in correct order  
**Key Change:** Use `prepend()` instead of `append()` for CORS middleware to run FIRST  
**Critical Lines:**
```php
->withMiddleware(function (Middleware $middleware): void {
    // Add CORS middleware BEFORE everything else
    $middleware->prepend(\App\Http\Middleware\HandleCors::class);

    // Sanctum middleware for API routes
    $middleware->api(prepend: [
        \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    ]);
    
    // Route middleware aliases
    $middleware->alias([
        'role' => \App\Http\Middleware\CheckRole::class,
        'permission' => \App\Http\Middleware\CheckPermission::class,
        'active.user' => \App\Http\Middleware\EnsureUserIsActive::class,
    ]);
})
```

#### 4. **backend/app/Http/Middleware/HandleCors.php**
**Purpose:** Implement CORS policy with proper credential handling  
**Key Changes:**
- Never return `*` (wildcard) when credentials are included
- Return specific origin from whitelist
- Handle preflight (OPTIONS) requests with 204 status
- Include CSRF-related headers in Access-Control-Allow-Headers
- Set Access-Control-Max-Age for preflight caching

**Full Implementation:**
```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class HandleCors
{
    public function handle(Request $request, Closure $next): Response
    {
        $allowedOrigins = [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5173',
            'https://ccs-comprehensive-profiling-system.vercel.app',
            env('FRONTEND_URL', ''),
        ];

        $allowedOrigins = array_filter($allowedOrigins);
        $origin = $request->header('Origin');
        $originAllowed = in_array($origin, $allowedOrigins);

        // Handle preflight requests (OPTIONS)
        if ($request->isMethod('OPTIONS')) {
            return response()->json('OK', 204)
                ->header('Access-Control-Allow-Origin', $originAllowed ? $origin : 'null')
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-TOKEN, X-XSRF-TOKEN')
                ->header('Access-Control-Allow-Credentials', 'true')
                ->header('Access-Control-Max-Age', '86400');
        }

        // Handle actual requests
        $response = $next($request);

        if ($originAllowed) {
            $response->header('Access-Control-Allow-Origin', $origin)
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-TOKEN, X-XSRF-TOKEN')
                ->header('Access-Control-Allow-Credentials', 'true')
                ->header('Access-Control-Expose-Headers', 'Content-Length, X-CSRF-TOKEN');
        }

        return $response;
    }
}
```

#### 5. **backend/routes/web.php**
**Purpose:** Provide CSRF cookie endpoint for SPA  
**Key Addition:**
```php
// CSRF Cookie endpoint for SPA authentication
Route::post('/sanctum/csrf-cookie', function () {
    return response()->json(['message' => 'CSRF cookie set'], 204);
});

Route::get('/sanctum/csrf-cookie', function () {
    return response()->json(['message' => 'CSRF cookie set'], 204);
});
```

#### 6. **backend/routes/api.php**
**Purpose:** API routes configuration (context file)  
**Relevant Section:**
```php
// PUBLIC AUTHENTICATION ROUTES
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// PROTECTED ROUTES (Require Authentication)
Route::middleware(['auth:sanctum', 'active.user'])->group(function () {
    Route::prefix('auth')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::put('/profile', [AuthController::class, 'updateProfile']);
        Route::post('/change-password', [AuthController::class, 'changePassword']);
    });
    // ... more protected routes
});
```

### Frontend Configuration Files

#### 7. **frontend/src/services/api.js**
**Purpose:** Axios client with CSRF token handling and interceptors  
**Key Changes:**
- Add `withCredentials: true` to enable cookie sending
- Implement CSRF token interceptor
- Add `getCsrfToken()` function that calls endpoint
- Update login to fetch CSRF token before sending credentials

**Full Implementation:**
```javascript
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const API_BASE_PATH = import.meta.env.VITE_API_BASE_PATH || '/api'

// Create axios instance with credentials
const apiClient = axios.create({
  baseURL: `${API_URL}${API_BASE_PATH}`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Add token to requests and CSRF token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    // Add CSRF token from meta tag or cookies
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || 
                      document.cookie.split('; ').find(row => row.startsWith('XSRF-TOKEN='))?.split('=')[1]
    if (csrfToken) {
      config.headers['X-CSRF-TOKEN'] = csrfToken
      config.headers['X-XSRF-TOKEN'] = csrfToken
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle responses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('student_session')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Get CSRF token for SPA authentication
export const getCsrfToken = async () => {
  try {
    await axios.post(`${API_URL}/sanctum/csrf-cookie`, {}, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
  } catch (error) {
    console.warn('CSRF token fetch warning:', error.message)
  }
}

// Authentication endpoints
export const authAPI = {
  login: async (email, password) => {
    await getCsrfToken()
    return apiClient.post('/auth/login', { email, password })
  },
  register: (data) => apiClient.post('/auth/register', data),
  logout: () => apiClient.post('/auth/logout'),
  getMe: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
  changePassword: (data) => apiClient.post('/auth/change-password', data)
}

// ... other API endpoints
```

#### 8. **frontend/.env.production**
**Purpose:** Production environment variables for Vercel  
**Content:**
```
VITE_API_URL=https://ccs-comprehensive-profiling-system-production.up.railway.app
VITE_API_BASE_PATH=/api
```

### Deployment Configuration Files

#### 9. **backend/.env.railway** (or Railway Variables in Dashboard)
**Purpose:** Production environment variables  
**Critical Variables:**
```
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:...
APP_URL=https://ccs-comprehensive-profiling-system-production.up.railway.app
FRONTEND_URL=https://ccs-comprehensive-profiling-system.vercel.app

DB_CONNECTION=mysql
DB_HOST=mysql.railway.internal
DB_PORT=3306
DB_DATABASE=railway
DB_USERNAME=root
DB_PASSWORD=bnwwXyOpVMMjQhZxxuPNWBzIYoMrXJuk
DATABASE_URL=mysql://root:bnwwXyOpVMMjQhZxxuPNWBzIYoMrXJuk@mysql.railway.internal:3306/railway

SESSION_DRIVER=database
SESSION_DOMAIN=.railway.app
SANCTUM_STATEFUL_DOMAINS=ccs-comprehensive-profiling-system-production.up.railway.app,ccs-comprehensive-profiling-system.vercel.app
```

---

## Authentication Flow (How It Works)

```
1. Frontend (Vercel) → GET /sanctum/csrf-cookie from Backend (Railway)
   └─ Backend sets XSRF-TOKEN cookie (httpOnly)

2. Frontend → POST /api/auth/login with:
   ├─ Body: { email, password }
   ├─ Header: X-CSRF-TOKEN: <token from cookies>
   └─ withCredentials: true (sends cookies)

3. Backend validates:
   ├─ CSRF token matches
   ├─ Origin is in SANCTUM_STATEFUL_DOMAINS
   ├─ Credentials are correct

4. Backend → Response with:
   ├─ Status: 200 OK
   ├─ Body: { token, user }
   └─ Set-Cookie: XSRF-TOKEN (renewed)

5. Frontend stores token and continues authenticated requests
```

---

## Deployment Steps

### Step 1: Update Backend Environment Variables in Railway

In Railway Dashboard → Backend Service → Variables:
```
SESSION_DOMAIN=.railway.app
SANCTUM_STATEFUL_DOMAINS=ccs-comprehensive-profiling-system-production.up.railway.app,ccs-comprehensive-profiling-system.vercel.app
```

### Step 2: Ensure Pre-Deploy Command

In Railway Dashboard → Backend Service → Settings → Deploy → Pre-deploy step:
```bash
php artisan migrate --force
```

### Step 3: Push Changes to GitHub

```bash
git add .
git commit -m "fix: CSRF and CORS configuration for production deployment"
git push origin main
```

### Step 4: Auto-Deploy

- Railway auto-deploys backend (watches main branch)
- Vercel auto-deploys frontend (if connected)
- Wait for both to finish ("Running" status)

### Step 5: Run Migrations (First Time Only)

After successful deployment:
- Railway → Backend Service → Logs/Console
- Run: `php artisan migrate --fresh --seed`

---

## Verification Checklist

- [ ] Backend deployed successfully to Railway
- [ ] Frontend deployed successfully to Vercel
- [ ] All environment variables set in Railway dashboard
- [ ] Database migrations completed
- [ ] POST to `/sanctum/csrf-cookie` returns 204 with CORS headers
- [ ] POST to `/api/auth/login` includes CSRF token
- [ ] Login works at `https://ccs-comprehensive-profiling-system.vercel.app/login`
- [ ] Dashboard loads with student data
- [ ] No CORS errors in browser console
- [ ] No CSRF token mismatch errors

---

## Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 419 CSRF token mismatch | Stateful domain not configured | Update `SANCTUM_STATEFUL_DOMAINS` |
| CORS policy wildcard error | CORS middleware returning `*` | Change to return specific origin |
| Preflight OPTIONS fails | No OPTIONS handler in middleware | Add `if ($request->isMethod('OPTIONS'))` |
| Cookies not sent | `withCredentials` not set | Add to axios config |
| XSRF-TOKEN not in cookies | Not calling `/sanctum/csrf-cookie` | Call before login |
| Database not found | Wrong DB_HOST or connection | Verify `mysql.railway.internal` |

---

## References

- [Laravel Sanctum Documentation](https://laravel.com/docs/sanctum)
- [Axios Request Config](https://axios-http.com/docs/req_config)
- [MDN CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Railway Documentation](https://docs.railway.app/)
- [Vercel Deployment](https://vercel.com/docs)
