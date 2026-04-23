# Configuration Values Mapping

## 📋 Values You'll Need to Gather & Input

Before you start deployment, collect and write down these values:

### A. Your Vercel Frontend Domain

```
What is your Vercel frontend URL?

Example: https://ccs-portal.vercel.app

Your value: _________________________________

✓ Find it at: https://vercel.com/dashboard → Select project → Look at domain at top
```

### B. Railway App Name (you'll create this during deployment)

```
What will you name your Railway app?

Example: ccs-backend-production
         ccs-api
         ccs-profiling-api

Your value: _________________________________

ℹ️ Railway will give you a URL like: https://YOUR-NAME.railway.app
```

---

## 🔄 Configuration Mapping

### Step 1: Backend CORS Middleware

**File**: `backend/app/Http/Middleware/HandleCors.php`

```php
// Line 25 - Update this:
'https://your-frontend.vercel.app',

// To your actual Vercel domain:
'https://ccs-portal.vercel.app',
```

**Status**: ✅ Already updated in `app/Http/Middleware/HandleCors.php`

---

### Step 2: Railway Dashboard Environment Variables

**Location**: Railway Dashboard → Your Project → Variables

**Input these values** (substitute YOUR values):

```
KEY: APP_NAME
VALUE: CCS Portal

KEY: APP_ENV
VALUE: production

KEY: APP_DEBUG
VALUE: false

KEY: APP_URL
VALUE: https://YOUR-RAILWAY-APP-NAME.railway.app
(Railway gives you this URL after creation)

KEY: FRONTEND_URL
VALUE: https://ccs-portal.vercel.app
(Your Vercel domain)

KEY: SANCTUM_STATEFUL_DOMAINS
VALUE: YOUR-RAILWAY-APP-NAME.railway.app,ccs-portal.vercel.app

KEY: LOG_LEVEL
VALUE: error

KEY: SESSION_DOMAIN
VALUE: .railway.app

KEY: DB_CONNECTION
VALUE: mysql
(Railway MySQL auto-provides: DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE)
```

**Don't change**: `APP_KEY`, `LOG_CHANNEL`, `CACHE_STORE`, `QUEUE_CONNECTION`

---

### Step 3: Railway MySQL Database Service

**Location**: Railway Dashboard → Your Project → Add Service

1. Click **+ New** → **Database** → **MySQL**
2. Railway automatically sets:
   - `DB_HOST` → `railway.railway.internal`
   - `DB_PORT` → `3306`
   - `DB_USERNAME` → Generated
   - `DB_PASSWORD` → Generated
   - `DB_DATABASE` → `railway`

3. These auto-appear in Environment Variables ✓

---

### Step 4: Railway Start Command

**Location**: Railway Dashboard → Your Project → Deploy → Settings

```
Start Command:

php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=$PORT
```

This:
- Runs database migrations ✓
- Starts Laravel server on Railway's assigned port ✓

---

### Step 5: Frontend Environment (.env.production)

**File**: `frontend/.env.production`

```env
VITE_API_URL=https://YOUR-RAILWAY-APP-NAME.railway.app
VITE_API_BASE_PATH=/api
```

**Example**:
```env
VITE_API_URL=https://ccs-backend-prod.railway.app
VITE_API_BASE_PATH=/api
```

---

### Step 6: Vercel Environment Variables (if already deployed)

**Location**: Vercel Dashboard → Your Project → Settings → Environment Variables

1. **If .env.production exists**:
   - Redeploy (push to GitHub)
   - Vercel auto-reads .env.production ✓

2. **If setting in Dashboard**:
   - Add Variable:
     ```
     Name: VITE_API_URL
     Value: https://YOUR-RAILWAY-APP-NAME.railway.app
     Environments: Production
     ```
   - Add Variable:
     ```
     Name: VITE_API_BASE_PATH
     Value: /api
     Environments: Production
     ```
   - Trigger redeploy

---

## 🔍 Configuration Checklist

### Backend (Railway)

- [ ] CORS middleware has correct Vercel domain
- [ ] Railway MySQL service created
- [ ] All environment variables set in Railway dashboard
- [ ] Start command configured
- [ ] Initial deploy triggered
- [ ] Railway logs show ✓ no errors

**Check status**: Go to Railway → Logs → Look for:
```
Laravel Application Started: http://0.0.0.0:PORT
```

### Frontend (Vercel)

- [ ] `.env.production` created with correct Railway URL
- [ ] OR environment variables set in Vercel dashboard
- [ ] Redeployed to Vercel
- [ ] Vercel logs show ✓ no errors

**Check status**: Go to Vercel → Deployments → Latest deployment → Logs

---

## 🧪 Testing After Deployment

### Test 1: Check Backend is Running

```bash
# From terminal or Postman
curl https://YOUR-RAILWAY-APP-NAME.railway.app/api/health

# Should return 200 OK
```

### Test 2: Check CORS

```bash
# From browser console (F12)
fetch('https://YOUR-RAILWAY-APP-NAME.railway.app/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'admin@ccs.edu',
    password: 'admin123456'
  })
})
.then(r => r.json())
.then(d => console.log('Success:', d))
.catch(e => console.error('Error:', e))

# Check for CORS errors or success response
```

### Test 3: Check Frontend

1. Go to `https://your-frontend.vercel.app`
2. Try login with `admin@ccs.edu` / `admin123456`
3. Should redirect to dashboard
4. Check DevTools → Network → Should see successful `/api/auth/login` request

---

## 📝 Final Values Document

**Save this after deployment**:

```
Project Name: CCS Portal
Status: Production

Frontend:
  - URL: https://___________________________
  - Platform: Vercel
  - Status: _____ (working/testing/failed)

Backend:
  - URL: https://___________________________
  - Platform: Railway
  - Status: _____ (working/testing/failed)

Database:
  - Host: railway.railway.internal
  - Port: 3306
  - Status: _____ (connected/error)

Created Date: ______________
Last Updated: ______________
```

---

## 🚨 If Something Goes Wrong

### Check in this order:

1. **Railway Logs** → Railway Dashboard → Logs
   - Look for PHP/Laravel errors
   - Look for database connection errors

2. **Vercel Logs** → Vercel Dashboard → Deployments → Latest → Logs
   - Look for build errors
   - Look for missing environment variables

3. **Browser Console** → F12 → Console tab
   - Look for CORS errors
   - Look for network errors
   - Look for JavaScript errors

4. **Network Tab** → F12 → Network tab
   - Make request to backend
   - Check Response Headers for `Access-Control-Allow-Origin`
   - Should match your frontend domain

---

**All set! Use the values above and you're ready to deploy.** ✅
