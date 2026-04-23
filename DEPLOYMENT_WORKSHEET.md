# Deployment Worksheet - Fill In As You Go

**Instructions**: Print this or fill in as you deploy. Keep this document open while setting up.

---

## SECTION 1: Pre-Deployment Gathering

### A. Vercel Frontend Information

```
Vercel Project Name: _________________________________

Vercel Project URL: 
https://_______________________________.vercel.app

Vercel Account: _________________________________

GitHub Branch to deploy: _________________________________
                         (usually: main or master)

✓ Frontend currently deployed? YES / NO

```

### B. Railway Account Setup

```
Railway Account Email: _________________________________

Railway Project Name: _________________________________
                     (e.g., ccs-backend-production)

Expected Railway URL:
https://_______________________________.railway.app

✓ Railway account created? YES / NO

```

---

## SECTION 2: Code Updates

### Update 1: Backend CORS Middleware

**File**: `backend/app/Http/Middleware/HandleCors.php`

```
Current line 25 has:
  'https://your-frontend.vercel.app',

Change to:
  'https://_______________________________.vercel.app',

Your Vercel domain (from Section 1A): ___________________________________

Status: [ ] NOT STARTED  [ ] IN PROGRESS  [ ] DONE ✓

```

### Update 2: Frontend Environment

**File**: Create `frontend/.env.production`

```
Content to add:

VITE_API_URL=https://_______________________________.railway.app
VITE_API_BASE_PATH=/api

Your Railway domain (from Section 1B): ___________________________________

Syntax check:
  - No quotes around values ✓
  - VITE_ prefix correct ✓
  - No trailing slashes ✓

Status: [ ] NOT STARTED  [ ] IN PROGRESS  [ ] DONE ✓

```

---

## SECTION 3: Railway Setup

### Step 1: Create Railway Project

```
Date started: _______________

Steps:
  1. Go to https://railway.app
  2. Sign in or create account
  3. Click "New Project"
  4. Select "Deploy from GitHub"
  5. Choose repository: ccs-comprehensive-profiling-system
  6. Select branch: main (or your branch)

Status: [ ] NOT STARTED  [ ] IN PROGRESS  [ ] DONE ✓
Result: Successfully created Railway project

```

### Step 2: Add MySQL Database

```
Steps:
  1. In Railway dashboard, click "+ Add Service"
  2. Select "Database"
  3. Choose "MySQL"
  4. Click "Create"
  5. Wait for MySQL to be ready (look for green checkmark)

Auto-provided credentials:
  (These appear in Environment Variables automatically)
  
  DB_HOST: railway.railway.internal
  DB_PORT: 3306
  DB_USERNAME: _________________________ (Railway generates)
  DB_PASSWORD: _________________________ (Railway generates)
  DB_DATABASE: _________________________ (Railway generates)

Status: [ ] NOT STARTED  [ ] IN PROGRESS  [ ] DONE ✓

```

### Step 3: Set Environment Variables in Railway

**Location**: Railway Dashboard → Your Project → Variables

```
Copy each line below and paste into Railway dashboard:

[ ] APP_NAME=CCS Portal

[ ] APP_ENV=production

[ ] APP_DEBUG=false

[ ] APP_URL=https://______________________.railway.app
    (Your Railway URL from Section 1B)

[ ] FRONTEND_URL=https://______________________.vercel.app
    (Your Vercel URL from Section 1A)

[ ] SANCTUM_STATEFUL_DOMAINS=______________________.railway.app,______________________.vercel.app
    (Both domains, comma-separated)

[ ] LOG_LEVEL=error

[ ] SESSION_DOMAIN=.railway.app

[ ] CACHE_STORE=database

[ ] SESSION_DRIVER=database

[ ] QUEUE_CONNECTION=database

✓ Don't change these (already set):
  - APP_KEY (keep as is)
  - LOG_CHANNEL (keep as is)
  - DB_CONNECTION=mysql

Status: [ ] NOT STARTED  [ ] IN PROGRESS  [ ] DONE ✓

```

### Step 4: Set Start Command

**Location**: Railway Dashboard → Your Project → Deploy → Settings

```
Set this command in Railway:

php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=$PORT

What it does:
  - Runs database migrations
  - Starts Laravel server on Railway's port

Status: [ ] NOT STARTED  [ ] IN PROGRESS  [ ] DONE ✓

```

### Step 5: Trigger Deployment

```
Methods to deploy:

[ ] Method 1: Redeploy from GitHub
    - Railway → Project → Deployments → Latest → "Redeploy"

[ ] Method 2: Push to GitHub (auto-triggers)
    - After env vars are set

[ ] Method 3: Manual trigger
    - Railway → Project → Settings → "Deploy"

Deployment date/time: _______________

Status: [ ] NOT STARTED  [ ] IN PROGRESS  [ ] WAITING FOR DEPLOY [ ] DONE ✓

```

### Step 6: Wait for Railway Deployment

```
Deployment progress:

Estimated time: 3-10 minutes

What to look for:
  1. Railway shows "In Progress" → "Building" → "Deploying" → "Running"
  2. Check logs for: "Laravel Application Started"
  3. Look for error messages (database, migrations, PHP errors)

While waiting, check:
  - Railway Logs (click "Logs" in dashboard)
  - Watch for the green "Running" status

Date/time deployment started: _______________
Date/time deployment completed: _______________

Status: [ ] DEPLOYING  [ ] DEPLOYED  [ ] FAILED ✓

If failed, check:
  - [ ] All environment variables set correctly
  - [ ] MySQL service is running (green checkmark)
  - [ ] Database credentials are correct
  - [ ] Start command has no typos

```

---

## SECTION 4: Get Your Railway URL

```
After deployment, Railway gives you a live URL:

Navigate to: Railway Dashboard → Your Project → Environment

Look for: "Domains" section or the "Public URL"

Your Railway Backend URL:
https://_______________________________.railway.app

Save this - you'll need it for testing!

Also update in .env.production if not already done:
VITE_API_URL=https://_______________________________.railway.app

Status: [ ] FOUND  [ ] SAVED ✓

```

---

## SECTION 5: Frontend Redeploy

```
Now update and redeploy your frontend:

Option 1: Using Git (Recommended)
  1. Make sure frontend/.env.production is created
  2. Run: git add frontend/.env.production
  3. Run: git commit -m "Add production API URL"
  4. Run: git push origin main
  5. Vercel auto-deploys automatically ✓

Option 2: Manual redeploy in Vercel
  1. Go to Vercel dashboard
  2. Select your project
  3. Click "Deployments"
  4. Click on latest deployment
  5. Click "Redeploy"

Option 3: Set in Vercel dashboard
  1. Project Settings → Environment Variables
  2. Add: VITE_API_URL = your Railway URL
  3. Click "Deployments" → Latest → "Redeploy"

Frontend redeploy date/time: _______________

Status: [ ] NOT STARTED  [ ] IN PROGRESS  [ ] DONE ✓

```

---

## SECTION 6: Testing

### Test 1: Backend Health Check

```
Command to run in terminal:
curl https://_______________________________.railway.app/api/health

Expected result: 200 OK (or JSON response)

Actual result: _________________________________

Status: [ ] SUCCESS ✓  [ ] FAILED

```

### Test 2: CORS Test (Browser Console)

```
Steps:
  1. Open browser DevTools (F12)
  2. Go to "Console" tab
  3. Paste this code:

fetch('https://_______________________________.railway.app/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    email: 'admin@ccs.edu',
    password: 'admin123456'
  })
})
.then(r => r.json())
.then(d => console.log('Success!', d))
.catch(e => console.error('Error:', e))

Expected: Success message with token
Actual result: _________________________________

Status: [ ] SUCCESS ✓  [ ] FAILED (check console for CORS error)

```

### Test 3: Frontend Login

```
Steps:
  1. Go to: https://_______________________________.vercel.app
  2. Log in with: admin@ccs.edu / admin123456
  3. You should see dashboard

Result: _________________________________

Status: [ ] SUCCESS ✓ (login worked, see dashboard)
        [ ] FAILED (check browser console)

If failed, check for:
  [ ] CORS errors in console
  [ ] Network errors
  [ ] Wrong URL in .env.production
  [ ] Token in localStorage (F12 → Application → Local Storage)

```

### Test 4: Full Workflow Test

```
Steps:
  1. Go to frontend URL
  2. Login with demo credentials
  3. Navigate to different pages
  4. Try creating/editing/deleting something
  5. Logout and re-login
  6. Check Rails logs for no errors

Issues found:
  [ ] None - Everything works!
  [ ] CORS errors
  [ ] 401/403 errors
  [ ] Database errors
  [ ] Page not loading

Status: [ ] ALL WORKING ✓  [ ] SOME ISSUES (list above)

```

---

## SECTION 7: Final Verification Checklist

```
Backend (Railway):
  [ ] MySQL service running (green checkmark)
  [ ] App status is "Running"
  [ ] No error messages in logs
  [ ] curl command returns 200
  [ ] Can connect from frontend

Frontend (Vercel):
  [ ] Deployment shows "Ready"
  [ ] No build errors
  [ ] .env.production has correct URL
  [ ] App loads without console errors

Connection:
  [ ] No CORS errors
  [ ] Login works from Vercel domain
  [ ] Token persists in localStorage
  [ ] Dashboard loads with data
  [ ] API calls successful
  [ ] No 401/403/404 errors

Data:
  [ ] Database connected
  [ ] Can query data
  [ ] Can create records
  [ ] Can update records
  [ ] Can delete records

```

---

## SECTION 8: Documentation & Handoff

```
Deployment completed on: _______________

Team members notified:
  [ ] Project manager
  [ ] Other developers
  [ ] QA team
  [ ] Product owner

Documentation created:
  [ ] README updated with production URLs
  [ ] Team notified of new URLs
  [ ] Credentials shared securely
  [ ] Deployment steps documented

URLs shared with team:
  Frontend: https://_______________________________.vercel.app
  Backend: https://_______________________________.railway.app
  
Shared with: _________________________________

Status: [ ] NOT STARTED  [ ] IN PROGRESS  [ ] DONE ✓

```

---

## NOTES SECTION

Use this space to note any issues or changes:

```
Issue: _________________________________________________________________

Resolution: ____________________________________________________________

Date resolved: __________________________________________________________

Issue: _________________________________________________________________

Resolution: ____________________________________________________________

Date resolved: __________________________________________________________

General notes: _________________________________________________________

_______________________________________________________________________

_______________________________________________________________________

```

---

## TROUBLESHOOTING QUICK REFERENCE

**If X happens, do Y:**

| Problem | Solution |
|---------|----------|
| CORS error | Check CORS middleware has Vercel domain; verify FRONTEND_URL in Railway |
| 401 Unauthorized | Check token in localStorage; verify Sanctum config |
| Cannot connect | Check if Railway app is running; verify VITE_API_URL in frontend |
| Database error | Verify MySQL service running; check DB credentials; run migrations |
| Page won't load | Check Vercel logs; verify env variables; check JavaScript errors |

---

**Print this sheet and keep it handy during deployment!** 📋

