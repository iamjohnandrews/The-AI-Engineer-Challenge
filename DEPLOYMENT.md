# Deployment Guide for AI Mental Coach

## Issue: Vercel Not Showing Frontend

If your Vercel deployment is not showing the frontend, it's likely because Vercel is trying to serve the Python backend instead of the Next.js frontend.

## Solution: Configure Vercel Root Directory

### Option 1: Configure in Vercel Dashboard (Recommended)

1. Go to your Vercel project dashboard: https://vercel.com/dashboard
2. Click on your project
3. Go to **Settings** → **General**
4. Under **Root Directory**, set it to: `frontend`
5. Click **Save**
6. Redeploy your project

### Option 2: Deploy from Frontend Directory

Alternatively, you can deploy directly from the frontend directory:

```bash
cd frontend
vercel
```

## Backend Configuration

The frontend needs to know where your backend is deployed. You have two options:

### Option A: Deploy Backend Separately

1. Deploy your FastAPI backend to a service like:
   - Railway (https://railway.app)
   - Render (https://render.com)
   - Fly.io (https://fly.io)
   - Or any other Python hosting service

2. In Vercel, go to **Settings** → **Environment Variables**
3. Add: `NEXT_PUBLIC_API_URL` = `https://your-backend-url.com`
4. Redeploy

### Option B: Use Vercel Serverless Functions (Advanced)

You can convert the Python backend to Vercel serverless functions, but this requires more setup.

## Current Configuration

- **Frontend**: Next.js app in `/frontend` directory
- **Backend**: FastAPI app in `/api` directory
- **Vercel Config**: `vercel.json` in root (needs root directory set to `frontend`)

## Quick Fix Steps

1. **Set Root Directory in Vercel Dashboard:**
   - Settings → General → Root Directory → `frontend`

2. **Set Environment Variable:**
   - Settings → Environment Variables
   - Add `NEXT_PUBLIC_API_URL` = your deployed backend URL
   - Or leave it unset to use the Next.js API route (which will fail without a backend)

3. **Redeploy:**
   - Go to Deployments tab
   - Click the three dots on latest deployment
   - Click "Redeploy"

## Testing Locally

Make sure it works locally first:

```bash
# Terminal 1: Start backend
uv run uvicorn api.index:app --reload

# Terminal 2: Start frontend
cd frontend
npm run dev
```

Visit http://localhost:3000 and test the chat interface.

