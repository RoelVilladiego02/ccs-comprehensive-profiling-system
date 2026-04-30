# Railway + Vercel Connection: Quick Implementation Steps

## Summary
Your backend (Laravel) will run on Railway, frontend (React) on Vercel. They communicate via REST API.

---

## STEP-BY-STEP IMPLEMENTATION

### 1️⃣ Update Backend CORS Middleware (5 minutes)

**File to modify**: `backend/app/Http/Middleware/HandleCors.php`

**Action**: Replace with the updated version that includes environment variable support
- Copy from: `backend/CORS_MIDDLEWARE_UPDATED.php`
- Update `'https://your-frontend.vercel.app'` with your actual Vercel domain

**Why**: Current version only allows localhost. Production needs your Vercel domain.

---

### 2️⃣ Prepare Backend .env for Railway (5 minutes)

**File reference**: `backend/.env.railway` (already created)

**Key changes from local to production**:
```
APP_ENV=production              # Was: local
APP_DEBUG=false                 # Was: true
APP_URL=https://...railway.app  # Was: http://localhost
FRONTEND_URL=https://...vercel.app
DB_HOST=railway.railway.internal  # Was: 127.0.0.1
SANCTUM_STATEFUL_DOMAINS=both-domains
```

**Save this list - you'll input it into Railway dashboard**

---

### 3️⃣ Deploy Backend to Railway (20 minutes)

**Steps**:

1. Go to https://railway.app
2. Click **New Project** → **Deploy from GitHub**
3. Select your repository
4. Railway auto-detects Laravel ✓
5. Add service: **Add Database** → **MySQL**
6. Railway auto-generates:
   - `DB_HOST`
   - `DB_PORT` 
   - `DB_USERNAME`
   - `DB_PASSWORD`
   - `DB_DATABASE`

7. Add environment variables from `.env.railway` in Railway dashboard:
   - `APP_ENV=production`
   - `APP_DEBUG=false`
   - `APP_URL=` (your Railway app URL - you'll see this after deployment)
   - `FRONTEND_URL=` (your Vercel domain)
   - `SANCTUM_STATEFUL_DOMAINS=` (both domains)

8. Set start command in Railway:
   ```
   php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=$PORT
   ```

9. Deploy and wait for logs to show ✓

**Result**: Your backend API is live at `https://your-app.railway.app`

---

### 4️⃣ Update Frontend Environment (5 minutes)

**Option A: Create .env.production file**

Create `frontend/.env.production`:
```env
VITE_API_URL=https://your-railway-app.railway.app
VITE_API_BASE_PATH=/api
```

**Option B: Set in Vercel Dashboard (if already deployed)**

1. Go to Vercel project settings
2. **Environment Variables**
3. Add:
   - Name: `VITE_API_URL` 
   - Value: `https://your-railway-app.railway.app`
   - Name: `VITE_API_BASE_PATH`
   - Value: `/api`
4. Trigger redeploy

**Result**: Frontend knows where to find the backend

---

### 5️⃣ Deploy Frontend to Vercel (5 minutes)

**If not already deployed**:
```bash
cd frontend
vercel
# Follow prompts
# Add environment variables when asked
```

**If already deployed**:
1. Just redeploy from Vercel dashboard after updating env vars
2. Or push to GitHub → auto-deploys

**Result**: Frontend is live and knows backend URL

---

### 6️⃣ Test Connection (10 minutes)

**Test 1: Direct API Call**

```bash
# Test backend health
curl https://your-railway-app.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ccs.edu","password":"admin123456"}'

# Should return success response
```

**Test 2: Frontend Login**

1. Go to https://your-frontend.vercel.app
2. Try login with: `admin@ccs.edu` / `admin123456`
3. Check browser console (F12 → Console)
4. Should see successful API response

**Test 3: Check CORS**

1. Open DevTools (F12)
2. Go to Network tab
3. Try login
4. Click on `/auth/login` request
5. Check Response Headers for:
   ```
   Access-Control-Allow-Origin: https://your-frontend.vercel.app
   ```

**Common Issues**:
- ❌ CORS error → Update CORS middleware + redeploy
- ❌ 404 error → Check API_URL is correct
- ❌ 500 error → Check Railway logs for database/config errors
- ❌ 401 error → Check credentials in backend

---

## 📋 Checklist

- [ ] Updated CORS middleware with Vercel domain
- [ ] Created `.env.railway` with all production values
- [ ] Railway MySQL service added
- [ ] Railway app deployed and URL obtained
- [ ] All Railway environment variables set
- [ ] Backend migrations running (`php artisan migrate`)
- [ ] Created/updated `.env.production` in frontend
- [ ] Frontend redeployed to Vercel
- [ ] Tested login from Vercel domain
- [ ] Checked CORS headers in Network tab
- [ ] Backend logs show no errors

---

## 🔍 Your URLs (Update these)

| What | URL |
|-----|-----|
| Backend API | `https://YOUR-RAILWAY-APP.railway.app` |
| Frontend | `https://YOUR-FRONTEND.vercel.app` |
| Railway Project | `https://railway.app/project/YOUR-PROJECT-ID` |
| Vercel Project | `https://vercel.com/YOUR-ACCOUNT/YOUR-PROJECT` |

---

## 📚 Reference Files

- Full guide: `RAILWAY_VERCEL_DEPLOYMENT_GUIDE.md`
- Updated middleware: `backend/CORS_MIDDLEWARE_UPDATED.php`
- Backend env template: `backend/.env.railway`
- Frontend env example: `frontend/.env.production.example`

---

## 🆘 Need Help?

1. **Check Railway Logs**: Dashboard → Logs → Look for errors
2. **Check Vercel Logs**: Dashboard → Deployments → Logs
3. **Browser Console**: F12 → Console → Look for CORS/network errors
4. **Test endpoints directly**: Use curl or Postman
5. **Verify all URLs match**: No typos in FRONTEND_URL or API_URL

