# Fix: Route Builds But Returns 404 on Vercel

## Problem
- Route shows in build logs: `└ ƒ /api/chat`
- Route returns 404 when accessed: `https://your-url.vercel.app/api/chat`
- Route doesn't appear in Functions tab

## Root Cause
Vercel is building the route but not deploying it as a serverless function. This is a Vercel configuration issue.

## Solutions (Try in Order)

### Solution 1: Verify Root Directory (CRITICAL)
1. Vercel Dashboard → Your Project → Settings → General
2. **Root Directory**: Must be exactly `frontend` (no quotes, no slashes, no trailing spaces)
3. If it's wrong, change it and **Save**
4. Go to Deployments → **Redeploy** (uncheck "Use existing Build Cache")

### Solution 2: Check Build Output Directory
1. Settings → General
2. **Output Directory**: Should be empty (let Vercel auto-detect)
   - If it's set to something else, clear it
3. **Build Command**: Should be empty or `npm run build`
4. Save and redeploy

### Solution 3: Force Complete Rebuild
1. Settings → General → "Danger Zone" → **"Clear Build Cache"**
2. Deployments → Latest → **"Redeploy"**
3. **Uncheck** "Use existing Build Cache"
4. Click **"Redeploy"**
5. Wait for build to complete

### Solution 4: Check Node.js Version
1. Settings → General
2. **Node.js Version**: Should be 18.x or 20.x (Next.js 14 requires Node 18+)
3. If it's 16 or lower, change to 18 or 20
4. Save and redeploy

### Solution 5: Verify Framework Detection
1. Settings → General
2. **Framework Preset**: Should be "Next.js" (or auto-detected)
3. If it's something else, change to "Next.js"
4. Save and redeploy

### Solution 6: Check Build Logs for Errors
1. Deployments → Latest → "View Build Logs"
2. Look for:
   - Any red error messages
   - Warnings about the route
   - TypeScript compilation errors
3. The route should appear in: `Route (app)` section

### Solution 7: Recreate Project (Last Resort)
If nothing works:
1. Create a **new project** in Vercel
2. Import the same GitHub repository
3. **During setup:**
   - Set Root Directory to: `frontend`
   - Framework: Next.js (auto-detect)
   - Add `OPENAI_API_KEY` environment variable
4. Deploy

## Verification Steps

After redeploying, check:

1. **Build Logs**: Should show `└ ƒ /api/chat`
2. **Functions Tab**: Should show `/api/chat` in the list
3. **Direct URL Test**: `https://your-url.vercel.app/api/chat` should return JSON (not 404)

## Expected Behavior

✅ **Working**: 
- GET `https://your-url.vercel.app/api/chat` → `{"status":"ok","message":"Chat API is working..."}`
- Functions tab shows `/api/chat`
- Chat interface works

❌ **Not Working**:
- GET returns 404
- Functions tab is empty or doesn't show `/api/chat`
- Chat shows "fetch failed"

## Most Common Fix

**90% of the time**, the issue is:
- Root Directory is wrong (not exactly `frontend`)
- Build cache needs to be cleared
- Need to redeploy after clearing cache

Try Solution 1 + Solution 3 first!

