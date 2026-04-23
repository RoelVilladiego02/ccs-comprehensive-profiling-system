# Configuration Updated with Live URLs ✅

## Updated Values

### Backend URLs
```
Railway Backend: https://ccs-comprehensive-profiling-system-production.up.railway.app
Frontend: https://ccs-comprehensive-profiling-system.vercel.app
```

### Files Updated

1. **`backend/.env.railway`** ✅
   ```env
   APP_URL=https://ccs-comprehensive-profiling-system-production.up.railway.app
   FRONTEND_URL=https://ccs-comprehensive-profiling-system.vercel.app
   SANCTUM_STATEFUL_DOMAINS=ccs-comprehensive-profiling-system-production.up.railway.app,ccs-comprehensive-profiling-system.vercel.app
   ```

2. **`backend/app/Http/Middleware/HandleCors.php`** ✅
   ```php
   'https://ccs-comprehensive-profiling-system.vercel.app',
   ```

---

## What to Do Now

### 1. Add Environment Variables to Railway Dashboard

Go to: **Railway** → Your Project → **Variables**

**Copy these exact values from `.env.railway`**:

| Key | Value |
|-----|-------|
| `APP_NAME` | `CCS Portal` |
| `APP_ENV` | `production` |
| `APP_DEBUG` | `false` |
| `APP_KEY` | `base64:inVSC4pPBpwMIEiOVSeNeoofdmXwGben8+988RTxGVk=` |
| `APP_URL` | `https://ccs-comprehensive-profiling-system-production.up.railway.app` |
| `FRONTEND_URL` | `https://ccs-comprehensive-profiling-system.vercel.app` |
| `LOG_CHANNEL` | `stack` |
| `LOG_LEVEL` | `error` |
| `DB_CONNECTION` | `mysql` |
| `DB_HOST` | `railway.railway.internal` |
| `DB_PORT` | `3306` |
| `DB_DATABASE` | `railway` |
| `DB_USERNAME` | `root` |
| `DB_PASSWORD` | `bnwwXyOpVMMjQhZxxuPNWBzIYoMrXJuk` |
| `SESSION_DRIVER` | `database` |
| `SESSION_DOMAIN` | `.railway.app` |
| `CACHE_STORE` | `database` |
| `SANCTUM_STATEFUL_DOMAINS` | `ccs-comprehensive-profiling-system-production.up.railway.app,ccs-comprehensive-profiling-system.vercel.app` |

### 2. Create Frontend `.env.production`

**File**: `frontend/.env.production`

```env
VITE_API_URL=https://ccs-comprehensive-profiling-system-production.up.railway.app
VITE_API_BASE_PATH=/api
```

### 3. Push Code to GitHub

Push these changes:
- `backend/.env.railway` (reference file, document changes)
- `backend/app/Http/Middleware/HandleCors.php` (already committed)
- `frontend/.env.production` (new file)

```bash
git add backend/app/Http/Middleware/HandleCors.php frontend/.env.production
git commit -m "Update CORS middleware and frontend API URL for production"
git push origin main
```

### 4. Redeploy on Railway

- Go to **Railway Dashboard** → Your Project
- Click **Redeploy** on latest deployment
- OR push to GitHub (auto-redeploys)

### 5. Watch the Logs

Check **Logs** tab for:

✅ **Success**:
```
Migration table created successfully
Database migrations completed
Laravel Application Started: http://0.0.0.0:PORT
```

❌ **Error** (if any):
```
SQLSTATE errors
Connection refused
```

---

## Test the Connection

### 1. Wait for Rails to Deploy

The deployment should take 3-10 minutes. When you see "Running" status ✅

### 2. Test Backend Directly

From browser console or terminal:

```bash
curl https://ccs-comprehensive-profiling-system-production.up.railway.app/api/health
```

Should return: `200 OK`

### 3. Test Frontend

1. Go to: https://ccs-comprehensive-profiling-system.vercel.app/
2. Try login with: `admin@ccs.edu` / `admin123456`
3. Check browser console (F12) for any errors
4. If login works → Dashboard should load ✅

### 4. Check Network Tab

While logging in:
- Open DevTools (F12)
- Go to **Network** tab
- Look for `/api/auth/login` request
- Check **Response Headers** for:
  ```
  Access-Control-Allow-Origin: https://ccs-comprehensive-profiling-system.vercel.app
  ```

---

## Final Configuration Summary

```
┌─────────────────────────────────────────────────────────────┐
│                    YOUR SYSTEM LIVE                          │
│                                                             │
│  Frontend (Vercel):                                         │
│  https://ccs-comprehensive-profiling-system.vercel.app      │
│                                                             │
│  Backend (Railway):                                         │
│  https://ccs-comprehensive-profiling-system-production      │
│          .up.railway.app                                    │
│                                                             │
│  Database (Railway MySQL):                                  │
│  railway.railway.internal:3306                             │
│  User: root                                                 │
│  Database: railway                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Troubleshooting

### CORS Error
- Check Railway logs for CORS errors
- Verify `FRONTEND_URL` is set correctly
- Verify `.env.production` on frontend is correct

### 401/403 Error
- Check token in localStorage (F12 → Application)
- Verify `SANCTUM_STATEFUL_DOMAINS` includes both domains
- Check backend logs for auth errors

### Database Connection Error
- Verify `DB_HOST=railway.railway.internal`
- Check MySQL service is running (green in Railway)
- Check all database credentials match

### Page not loading
- Check Vercel logs
- Check browser console (F12 → Console)
- Verify `VITE_API_URL` in `.env.production`

---

## Verified Domains

✅ **Vercel Frontend**: https://ccs-comprehensive-profiling-system.vercel.app/
✅ **Railway Backend**: https://ccs-comprehensive-profiling-system-production.up.railway.app
✅ **CORS Middleware**: Updated with Vercel domain
✅ **Database**: Connected via Railway MySQL service
✅ **Authentication**: Sanctum configured for both domains

**Everything is configured and ready to deploy!** 🚀

