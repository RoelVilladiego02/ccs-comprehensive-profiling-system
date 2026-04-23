# Complete Deployment Flow Diagram

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          YOUR CODEBASE (GitHub)                             │
│                                                                             │
│  ├─ backend/                                                               │
│  │  ├─ .env.railway (production config template)                          │
│  │  ├─ app/Http/Middleware/HandleCors.php ✅ (UPDATED)                    │
│  │  ├─ routes/api.php (50+ endpoints)                                     │
│  │  └─ composer.json (Laravel 12 + Sanctum)                              │
│  │                                                                         │
│  └─ frontend/                                                              │
│     ├─ .env.production (points to Railway backend)                        │
│     ├─ src/services/api.js (uses VITE_API_URL env var)                   │
│     └─ package.json (React + Vite)                                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
          ↓ Push to GitHub ↓              ↓ Push to GitHub ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DEPLOYMENT PLATFORMS                               │
│                                                                             │
│  ┌───────────────────────────────────┬───────────────────────────────────┐ │
│  │         VERCEL                    │          RAILWAY                  │ │
│  │   (Frontend Hosting)              │    (Backend Hosting)              │ │
│  │                                   │                                   │ │
│  │  1. Auto-deploys from GitHub      │  1. Auto-deploys from GitHub     │ │
│  │  2. Reads .env.production         │  2. Creates Docker container     │ │
│  │  3. Builds React + Vite           │  3. Installs PHP dependencies    │ │
│  │  4. Serves static files           │  4. Connects to MySQL service    │ │
│  │  5. Points to Railway API         │  5. Runs migrations              │ │
│  │                                   │  6. Serves Laravel API           │ │
│  │  URL:                             │                                   │ │
│  │  https://your-frontend.vercel.app │  URL:                            │ │
│  │                                   │  https://your-app.railway.app    │ │
│  │                                   │                                   │ │
│  │  Environment:                     │  Environment:                    │ │
│  │  - VITE_API_URL = Railway URL ✓  │  - APP_ENV = production ✓       │ │
│  │  - VITE_API_BASE_PATH = /api ✓   │  - DB_HOST = railway.*.internal  │ │
│  │                                   │  - DB_USER, DB_PASS (auto) ✓     │ │
│  │                                   │  - FRONTEND_URL = Vercel URL ✓  │ │
│  └───────────────────────────────────┴───────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
          ↓                                            ↓
   Browser requests                              Server responses
   to Vercel                                      from Railway
```

---

## User Request Flow

```
User Action → Frontend (Vercel) → Backend (Railway) → Database (Railway MySQL) → Response
    ↓
User opens:
https://your-frontend.vercel.app

    ↓
React app loads ✓

    ↓
User clicks "Sign In"

    ↓
Frontend collects: email, password
Uses API_URL from .env.production

    ↓
Makes HTTP POST request to:
https://your-app.railway.app/api/auth/login

    ↓ (Network request + CORS check)

Backend receives request

    ↓
CORS Middleware checks:
- Origin header matches FRONTEND_URL? ✓

    ↓
Auth Controller validates:
- Email exists? ✓
- Password correct? ✓

    ↓
Queries MySQL database

    ↓
Generates Sanctum token

    ↓
Returns: { user, token }

    ↓ (Response with CORS headers)

Frontend receives token

    ↓
Stores in localStorage

    ↓
Redirects to /dashboard

    ↓
All future requests include:
Authorization: Bearer {token}

    ↓ (Backend verifies token with each request)

User sees authenticated content ✓
```

---

## Configuration Points

```
┌─────────────────────────────────────────────────────────────────┐
│                 Configuration Touchpoints                        │
└─────────────────────────────────────────────────────────────────┘

POINT 1: Backend CORS Middleware
├─ File: backend/app/Http/Middleware/HandleCors.php
├─ Update: Add Vercel domain to allowedOrigins
└─ Status: ✅ DONE - Just update domain placeholder

POINT 2: Backend Environment Variables (Railway Dashboard)
├─ Set: APP_ENV, APP_DEBUG, APP_URL, FRONTEND_URL, etc.
├─ Railway provides: DB_HOST, DB_USER, DB_PASSWORD
└─ Status: 🔄 DO THIS DURING RAILWAY SETUP

POINT 3: Frontend Environment File
├─ File: frontend/.env.production
├─ Set: VITE_API_URL = Railway URL
└─ Status: 🔄 DO THIS BEFORE VERCEL REDEPLOY

POINT 4: Vercel Environment Variables (Optional)
├─ If not using .env.production file
├─ Set same variables in Vercel dashboard
└─ Status: ℹ️ ONLY IF NEEDED

POINT 5: Railway Start Command
├─ Set: php artisan migrate --force && php artisan serve
└─ Status: 🔄 DO THIS DURING RAILWAY SETUP

POINT 6: Railway Database Service
├─ Create: MySQL service
├─ Railway auto-connects and provides credentials
└─ Status: 🔄 CREATE DURING RAILWAY SETUP
```

---

## Decision Tree

```
START: Deploy Backend to Railway?
│
├─ Do you have a Railway account?
│  ├─ NO → Create at https://railway.app
│  └─ YES → Continue
│
├─ Create new Railway project
│  ├─ Click: "New Project"
│  ├─ Select: "Deploy from GitHub"
│  └─ Choose: Your ccs-comprehensive-profiling-system repo
│
├─ Add MySQL Database Service
│  ├─ Click: "+ Add Service"
│  ├─ Select: "Database" → "MySQL"
│  └─ Railway auto-configures ✓
│
├─ Configure Environment Variables
│  ├─ Copy from: backend/.env.railway
│  ├─ Update: APP_URL (Railway gives you this)
│  ├─ Update: FRONTEND_URL (your Vercel domain)
│  └─ Paste into: Railway dashboard
│
├─ Set Start Command
│  ├─ Copy: php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=$PORT
│  ├─ Paste into: Railway settings
│  └─ Deploy! ✓
│
├─ Wait for deployment
│  ├─ Check: Railway Logs
│  ├─ Success indicator: "Laravel Application Started"
│  └─ Get: Your Railway URL (https://your-app.railway.app)
│
├─ Update Frontend
│  ├─ Create: frontend/.env.production
│  ├─ Add: VITE_API_URL = your Railway URL
│  └─ Push to GitHub (auto-redeploys to Vercel)
│
├─ Test Connection
│  ├─ Go to: https://your-frontend.vercel.app
│  ├─ Try: Login with demo credentials
│  └─ Check: Browser console for errors
│
└─ SUCCESS! ✓
   Frontend ↔ Backend connected and working
```

---

## Timeline Estimate

```
Activity                          Time      Total
─────────────────────────────────────────────────

1. Update CORS middleware         5 min    ✓ 5 min
2. Prepare env variables          5 min     10 min
3. Create Railway project         5 min     15 min
4. Add MySQL service              2 min     17 min
5. Set environment variables     10 min     27 min
6. Deploy backend                 5 min     32 min
7. Wait for deployment           10 min     42 min
8. Get Railway URL & test         5 min     47 min
9. Update frontend .env           5 min     52 min
10. Vercel redeploy & test       10 min     62 min
                                           ─────────
                                Total:    ~62 minutes
                                      (1 hour max)
```

---

## Success Indicators

```
✓ Backend Deployment Success:
  - Railway shows "Running" status
  - Logs show "Laravel Application Started"
  - Can curl: https://your-app.railway.app/api/health
  - No 5xx errors in logs

✓ Frontend Deployment Success:
  - Vercel shows "Deployed" status
  - Page loads without console errors
  - .env.production has correct Railway URL
  - No CORS errors when making API calls

✓ Connection Success:
  - Login page loads
  - Can submit login form
  - No 401/403/CORS errors
  - Token appears in localStorage
  - Dashboard loads with user data

✓ Full System Success:
  - Can navigate all pages
  - Can create/update/delete data
  - Can logout and re-login
  - All API endpoints working
  - No errors in browser console
```

---

## File Structure After Deployment

```
GitHub Repository
├─ backend/
│  ├─ .env.railway ← Reference file (don't commit .env)
│  ├─ app/Http/Middleware/HandleCors.php ← UPDATED ✓
│  ├─ routes/api.php
│  ├─ composer.json
│  └─ ... (rest of Laravel files)
│
└─ frontend/
   ├─ .env.production ← CREATE THIS
   ├─ .env.production.example ← Reference
   ├─ src/services/api.js ← Uses VITE_API_URL
   ├─ vite.config.js
   ├─ package.json
   └─ ... (rest of React files)

Railway Platform
├─ Variables ← All .env values set here
├─ Database ← MySQL connected
├─ Deployments ← Code deployed
└─ Logs ← Check here for errors

Vercel Platform  
├─ Environment ← Can set variables here
├─ Deployments ← Frontend deployed
└─ Logs ← Check here for errors
```

---

## Troubleshooting Decision Tree

```
START: Something isn't working?
│
├─ Frontend won't load?
│  ├─ Check Vercel logs for build errors
│  ├─ Verify .env.production syntax
│  └─ Redeploy from Vercel dashboard
│
├─ Backend won't start?
│  ├─ Check Railway logs for errors
│  ├─ Verify all env variables set
│  ├─ Check MySQL is running
│  └─ Verify start command correct
│
├─ CORS error when logging in?
│  ├─ Check CORS middleware has Vercel domain
│  ├─ Verify FRONTEND_URL set in Railway
│  ├─ Restart Railway deployment
│  └─ Check browser console for exact error
│
├─ 401/403 errors after login?
│  ├─ Check token in localStorage
│  ├─ Verify token sent in Authorization header
│  ├─ Check backend logs for middleware errors
│  └─ Verify Sanctum config in bootstrap/app.php
│
├─ Cannot connect to database?
│  ├─ Verify MySQL service running in Railway
│  ├─ Verify DB credentials in environment
│  ├─ Check DB_HOST = railway.railway.internal
│  └─ Run migrations: php artisan migrate
│
└─ Still not working?
   ├─ Review: RAILWAY_VERCEL_DEPLOYMENT_GUIDE.md
   ├─ Check: All logs (Railway + Vercel + Browser)
   └─ Compare: Your setup with Configuration Mapping
```

---

**You have everything you need. Start with RAILWAY_IMPLEMENTATION_CHECKLIST.md!** 🚀
