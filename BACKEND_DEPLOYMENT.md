# Backend Deployment Guide

This guide will help you deploy your FastAPI backend to a cloud platform. We'll cover two popular options: **Railway** (easiest) and **Render** (also easy with free tier).

## Prerequisites

- Your code pushed to GitHub
- An OpenAI API key
- A GitHub account

---

## Option 1: Deploy to Railway (Recommended - Easiest)

Railway is the easiest option with a generous free tier.

### Steps:

1. **Sign up for Railway**
   - Go to https://railway.app
   - Sign up with your GitHub account

2. **Create a New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository: `The-AI-Engineer-Challenge`

3. **Configure the Service**
   - Railway will auto-detect it's a Python project
   - It should detect `pyproject.toml` or `requirements.txt`
   - If it doesn't auto-detect, set:
     - **Build Command**: `uv sync` (or `pip install -r requirements.txt`)
     - **Start Command**: `uvicorn api.index:app --host 0.0.0.0 --port $PORT`

4. **Set Environment Variables**
   - Click on your service
   - Go to the "Variables" tab
   - Add: `OPENAI_API_KEY` = `your-api-key-here`
   - Railway will automatically redeploy

5. **Get Your Backend URL**
   - Railway will generate a URL like: `https://your-app-name.up.railway.app`
   - Copy this URL - you'll need it for your frontend!

6. **Update Frontend**
   - In Vercel, go to Settings → Environment Variables
   - Add: `NEXT_PUBLIC_API_URL` = `https://your-app-name.up.railway.app`
   - Redeploy your frontend

### Railway Free Tier:
- $5 free credit per month
- Auto-sleeps after inactivity (wakes on request)
- Perfect for development and small projects

---

## Option 2: Deploy to Render

Render offers a free tier with some limitations.

### Steps:

1. **Sign up for Render**
   - Go to https://render.com
   - Sign up with your GitHub account

2. **Create a New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository: `The-AI-Engineer-Challenge`

3. **Configure the Service**
   - **Name**: `ai-mental-coach-backend` (or any name)
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn api.index:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free (or paid if you want)

4. **Set Environment Variables**
   - Scroll down to "Environment Variables"
   - Add: `OPENAI_API_KEY` = `your-api-key-here`

5. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy your app
   - Wait for deployment to complete (5-10 minutes)

6. **Get Your Backend URL**
   - Render will provide a URL like: `https://your-app-name.onrender.com`
   - Copy this URL

7. **Update Frontend**
   - In Vercel, go to Settings → Environment Variables
   - Add: `NEXT_PUBLIC_API_URL` = `https://your-app-name.onrender.com`
   - Redeploy your frontend

### Render Free Tier:
- Free tier available
- Spins down after 15 minutes of inactivity (takes ~30 seconds to wake up)
- Good for development

---

## Option 3: Deploy to Fly.io

Fly.io is another great option with a free tier.

### Steps:

1. **Install Fly CLI**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Sign up and Login**
   ```bash
   fly auth signup
   fly auth login
   ```

3. **Create a Fly App**
   ```bash
   cd /path/to/your/project
   fly launch
   ```
   - Follow the prompts
   - Don't deploy yet (we need to configure first)

4. **Create `fly.toml`** (if not auto-generated)
   ```toml
   app = "your-app-name"
   primary_region = "iad"

   [build]

   [http_service]
     internal_port = 8000
     force_https = true
     auto_stop_machines = true
     auto_start_machines = true
     min_machines_running = 0

   [[services]]
     internal_port = 8000
     protocol = "tcp"
   ```

5. **Set Environment Variables**
   ```bash
   fly secrets set OPENAI_API_KEY=your-api-key-here
   ```

6. **Deploy**
   ```bash
   fly deploy
   ```

7. **Get Your URL**
   - Your app will be at: `https://your-app-name.fly.dev`

---

## Testing Your Deployed Backend

Once deployed, test your backend:

```bash
# Test the root endpoint
curl https://your-backend-url.com/

# Test the chat endpoint
curl -X POST https://your-backend-url.com/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'
```

You should get a response from the AI!

---

## Troubleshooting

### Backend not responding?
- Check the deployment logs in your platform's dashboard
- Verify `OPENAI_API_KEY` is set correctly
- Make sure the start command is correct

### CORS errors?
- The backend already has CORS configured to allow all origins (`*`)
- If you still see CORS errors, check that the backend is actually running

### Slow responses on free tier?
- Free tiers often "sleep" after inactivity
- First request after sleep can take 30-60 seconds
- Consider upgrading to a paid plan for production

---

## Recommended: Railway

For this project, I recommend **Railway** because:
- ✅ Easiest setup
- ✅ Good free tier
- ✅ Auto-detects Python projects
- ✅ Simple environment variable management
- ✅ Good documentation

---

## Next Steps

After deploying your backend:

1. ✅ Copy your backend URL
2. ✅ Add `NEXT_PUBLIC_API_URL` to Vercel environment variables
3. ✅ Redeploy your frontend
4. ✅ Test the full application!

Your mental coach app should now work end-to-end! 🎉



