# Railway + Vercel Deployment Guide

## Overview
Your **frontend** (React/Vercel) needs to communicate with your **backend** (Laravel/Railway). This guide covers the complete setup.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Vercel (Frontend)                                          │
│  ├─ React App (VITE_API_URL env var)                       │
│  └─ Points to Railway Backend URL                          │
│                                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │ API Calls (JSON + Bearer Token)
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                                                             │
│  Railway (Backend)                                          │
│  ├─ Laravel API Server                                     │
│  ├─ MySQL Database                                         │
│  └─ Sanctum Authentication                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 1: Fix CORS Middleware (Backend)

The current CORS middleware only allows localhost. Update it to include your Vercel domain.

**File**: `backend/app/Http/Middleware/HandleCors.php`

Replace the `$allowedOrigins` array with dynamic configuration:

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
            // Local development
            'http://localhost:3000',
            'http://localhost:5173',
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5173',
            // Vercel frontend (add your actual domain)
            'https://your-frontend.vercel.app',
            // Allow from environment if set
            env('FRONTEND_URL', ''),
        ];

        // Filter out empty strings
        $allowedOrigins = array_filter($allowedOrigins);

        $origin = $request->header('Origin');

        if (in_array($origin, $allowedOrigins)) {
            return $next($request)
                ->header('Access-Control-Allow-Origin', $origin)
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
                ->header('Access-Control-Allow-Credentials', 'true');
        }

        if ($request->isMethod('OPTIONS')) {
            return response()->json('OK', 200)
                ->header('Access-Control-Allow-Origin', $origin)
                ->header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
                ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
                ->header('Access-Control-Allow-Credentials', 'true');
        }

        return $next($request);
    }
}
```

---

## Step 2: Backend Environment Setup for Railway

Add these variables to your `.env` file for Railway deployment:

**Key Variables**:

```env
# Railway Environment
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-railway-app.railway.app  # Update with your Railway URL

# Frontend URL (for CORS)
FRONTEND_URL=https://your-frontend.vercel.app  # Your Vercel domain

# Database (Railway provides these)
DB_CONNECTION=mysql
DB_HOST=railway.railway.internal
DB_PORT=3306
DB_DATABASE=your_database
DB_USERNAME=root
DB_PASSWORD=your_secure_password

# Cache & Sessions (use database for now)
CACHE_STORE=database
SESSION_DRIVER=database

# Sanctum configuration
SANCTUM_STATEFUL_DOMAINS=your-railway-app.railway.app,your-frontend.vercel.app
SESSION_DOMAIN=.railway.app
```

---

## Step 3: Frontend Environment Configuration

Create or update `.env.production` in the frontend directory:

**File**: `frontend/.env.production`

```env
VITE_API_URL=https://your-railway-app.railway.app
VITE_API_BASE_PATH=/api
```

For local development, create `.env.local`:

```env
VITE_API_URL=http://localhost:8000
VITE_API_BASE_PATH=/api
```

Your frontend already uses these variables in `src/services/api.js`:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const API_BASE_PATH = import.meta.env.VITE_API_BASE_PATH || '/api'
```

---

## Step 4: Deploy Backend to Railway

### 4.1 Create a `railway.json` (optional but recommended)

**File**: `backend/railway.json`

```json
{
  "build": {
    "builder": "nixpacks"
  }
}
```

### 4.2 Railway Setup Steps

1. **Create Railway Project**:
   - Go to https://railway.app
   - Click "New Project" → "Deploy from GitHub"
   - Select your repository

2. **Configure Variables in Railway Dashboard**:
   - Go to your project variables
   - Add all `.env` variables from Step 2
   - Important: DATABASE connection info will be auto-generated by Railway

3. **Set Start Command**:
   - In Railway dashboard, set start command:
   ```bash
   php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=$PORT
   ```

4. **Database Setup**:
   - Add MySQL service in Railway
   - Connect it to your app
   - Railway auto-provides: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`

---

## Step 5: Deploy Frontend to Vercel (Update)

If already deployed, just update environment variables:

### 5.1 In Vercel Dashboard:

1. Go to **Project Settings** → **Environment Variables**
2. Add/Update:
   ```
   VITE_API_URL=https://your-railway-app.railway.app
   VITE_API_BASE_PATH=/api
   ```
3. Trigger a new deployment (redeploy from Git or manual)

### 5.2 If deploying from scratch:

```bash
# From frontend directory
vercel
# Follow prompts and add environment variables when asked
```

---

## Step 6: Testing the Connection

### From Frontend Console (Browser DevTools):

```javascript
// Test API endpoint
fetch('https://your-railway-app.railway.app/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'admin@ccs.edu',
    password: 'admin123456'
  })
})
.then(r => r.json())
.then(data => console.log(data))
```

### Backend Logs:

In Railway dashboard, check **Logs** for any CORS or connection errors.

---

## Step 7: Update `package.json` Scripts

**File**: `frontend/package.json`

Add build environment variable:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "build:production": "VITE_API_URL=https://your-railway-app.railway.app vite build"
  }
}
```

---

## Troubleshooting

### CORS Errors
- **Issue**: `Access to XMLHttpRequest blocked by CORS`
- **Solution**: 
  1. Check CORS middleware includes your Vercel domain
  2. Verify `FRONTEND_URL` env var is set in Railway
  3. Check `Sanctum_STATEFUL_DOMAINS` includes both domains

### 401 Unauthorized
- **Issue**: Token not sent or invalid
- **Solution**: Check localStorage for `auth_token` in browser DevTools

### Network Errors
- **Issue**: `Cannot connect to server`
- **Solution**: 
  1. Verify Railway app is running (check logs)
  2. Verify `APP_URL` is correct in backend .env
  3. Test endpoint directly: `curl https://your-railway-app.railway.app/api/health`

### Database Connection Errors
- **Issue**: `SQLSTATE[HY000]: General error`
- **Solution**:
  1. Verify MySQL service is running in Railway
  2. Check database credentials in Railway variables
  3. Run migrations: `php artisan migrate --force`

---

## Quick Reference: Required URLs

| Component | Local | Production |
|-----------|-------|------------|
| Frontend | http://localhost:5173 | https://your-frontend.vercel.app |
| Backend API | http://localhost:8000 | https://your-railway-app.railway.app |
| API Base Path | /api | /api |
| Database | localhost:3306 | railway.railway.internal:3306 |

---

## Final Checklist

- [ ] CORS middleware updated with Vercel domain
- [ ] Backend `.env` configured for production
- [ ] Frontend `.env.production` created with Railway URL
- [ ] Railway MySQL service created and connected
- [ ] Backend migrations run on Railway
- [ ] Frontend redeployed to Vercel with new env vars
- [ ] Test login flow end-to-end
- [ ] Check console for CORS/auth errors
- [ ] Verify tokens are persisted in localStorage

---

## Useful Commands

```bash
# Test backend locally
cd backend
php artisan serve --host=0.0.0.0 --port=8000

# Test frontend locally
cd frontend
npm run dev

# Check migrations status
php artisan migrate:status

# Seed database
php artisan db:seed

# Clear cache
php artisan cache:clear
php artisan config:clear
```

