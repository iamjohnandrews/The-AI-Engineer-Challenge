# Fix: /api/chat Route Missing in Vercel

## Solution 1: Verify Vercel Project Settings (MOST IMPORTANT)

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **General**
2. **CRITICAL**: Check these settings:
   - **Root Directory**: Must be exactly `frontend` (no trailing slash, no leading slash)
   - **Framework Preset**: Should be "Next.js" (or leave empty for auto-detect)
   - **Build Command**: Should be `npm run build` (or leave empty)
   - **Output Directory**: Should be `.next` (or leave empty)
   - **Install Command**: Should be `npm install` (or leave empty)

3. **If Root Directory is wrong:**
   - Change it to `frontend`
   - Save
   - Go to Deployments → Redeploy (uncheck "Use existing Build Cache")

## Solution 2: Check Build Logs

1. Go to **Deployments** → Latest deployment
2. Click **"View Build Logs"**
3. Look for this section:
   ```
   Route (app)                              Size     First Load JS
   └ ƒ /api/chat                            0 B                0 B
   ```
4. **If you DON'T see `/api/chat` in the build output:**
   - The route isn't being built
   - Check if there are any build errors
   - Verify the file exists at `frontend/app/api/chat/route.ts`

## Solution 3: Force Clean Rebuild

1. Go to **Settings** → **General**
2. Scroll to **"Danger Zone"**
3. Click **"Clear Build Cache"**
4. Go to **Deployments**
5. Click **"Redeploy"** on latest deployment
6. **Uncheck** "Use existing Build Cache"
7. Click **"Redeploy"**

## Solution 4: Verify File Structure

Make sure the file structure is exactly:
```
frontend/
  app/
    api/
      chat/
        route.ts
```

The `route.ts` file MUST be in `app/api/chat/route.ts` (not `app/api/chat.ts`)

## Solution 5: Check for Build Errors

1. Go to **Deployments** → Latest deployment
2. Click **"View Build Logs"**
3. Look for:
   - TypeScript errors
   - Import errors
   - Build failures
   - Any red error messages

## Solution 6: Verify Route Exports

The route file must export:
- `GET` function (optional, for testing)
- `POST` function (required)
- `runtime = 'nodejs'` (for OpenAI SDK)
- `dynamic = 'force-dynamic'`

## Solution 7: Recreate Project (Last Resort)

If nothing works:
1. Create a **new project** in Vercel
2. Import the same GitHub repository
3. **Set Root Directory to `frontend`** during setup
4. Add `OPENAI_API_KEY` environment variable
5. Deploy

## Quick Checklist

- [ ] Root Directory is set to `frontend` (exactly, no slashes)
- [ ] Route file exists at `frontend/app/api/chat/route.ts`
- [ ] Route file exports `POST` function
- [ ] Build logs show `/api/chat` in Route (app) section
- [ ] No build errors in deployment logs
- [ ] Cleared build cache and redeployed
- [ ] Environment variable `OPENAI_API_KEY` is set



