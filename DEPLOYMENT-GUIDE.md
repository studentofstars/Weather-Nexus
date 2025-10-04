# 🚀 Secure Deployment Guide

## Architecture Overview

This project uses a **hybrid deployment approach** for maximum security:

```
┌─────────────────────┐
│   GitHub Pages      │  ← Frontend (HTML/CSS/JS)
│   (Static Hosting)  │
└──────────┬──────────┘
           │
           │ HTTPS Requests
           ▼
┌─────────────────────┐
│   Vercel Functions  │  ← Backend API (Serverless)
│   (API Endpoints)   │  ← 🔐 API Keys Hidden Here
└──────────┬──────────┘
           │
           │ Server-to-Server
           ▼
┌─────────────────────┐
│  Weather APIs       │
│  • OpenWeatherMap   │
│  • NASA DONKI       │
└─────────────────────┘
```

### Why This Approach?

✅ **Security**: API keys stay server-side, never exposed to users  
✅ **Free Hosting**: Both GitHub Pages and Vercel offer generous free tiers  
✅ **Scalability**: Serverless functions auto-scale with traffic  
✅ **Reliability**: Professional hosting with high uptime  
✅ **Simple**: No complex server management required  

---

## 📋 Prerequisites

Before you begin, ensure you have:

1. ✅ **GitHub Account** - [Sign up here](https://github.com/join)
2. ✅ **Vercel Account** - [Sign up here](https://vercel.com/signup) (use GitHub login)
3. ✅ **Git Installed** - [Download here](https://git-scm.com/downloads)
4. ✅ **Node.js Installed** (optional, for local testing) - [Download here](https://nodejs.org/)
5. ✅ **API Keys**:
   - OpenWeatherMap: [Get free key](https://openweathermap.org/api)
   - NASA: [Get free key](https://api.nasa.gov/)

---

## 🔧 Step 1: Prepare Your Repository

### 1.1 Initialize Git Repository

```powershell
# Navigate to your project directory
cd d:\ASTRO\Weather_Monitoring

# Initialize git
git init

# Add all necessary files
git add .

# Create your first commit
git commit -m "Initial commit: Secure Weather Nexus app"
```

### 1.2 Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Repository name: `Weather-Nexus`
3. Description: "Multi-planet weather monitoring with secure API architecture"
4. Visibility: **Public** (required for GitHub Pages free tier)
5. **DO NOT** initialize with README (we already have one)
6. Click "Create repository"

### 1.3 Push to GitHub

```powershell
# Add GitHub remote (replace with your username)
git remote add origin https://github.com/studentofstars/Weather-Nexus.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 🔐 Step 2: Deploy Backend API to Vercel

### 2.1 Install Vercel CLI (Optional but Recommended)

```powershell
npm install -g vercel
```

### 2.2 Deploy to Vercel

**Option A: Using Vercel CLI**

```powershell
# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts:
# ? Set up and deploy? Y
# ? Which scope? (your account)
# ? Link to existing project? N
# ? What's your project's name? weather-nexus-api
# ? In which directory is your code located? ./

# Deploy to production
vercel --prod
```

**Option B: Using Vercel Dashboard (Easier)**

1. Go to [Vercel Dashboard](https://vercel.com/new)
2. Click "Import Project"
3. Select "Import Git Repository"
4. Choose your `Weather-Nexus` repository
5. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
6. Click **"Deploy"**

### 2.3 Add Environment Variables to Vercel

**Important:** This is where your API keys will be stored securely!

1. Go to your project in [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project (`weather-nexus-api`)
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `OPENWEATHER_API_KEY` | `your_openweathermap_key` | Production, Preview, Development |
| `NASA_API_KEY` | `your_nasa_key` | Production, Preview, Development |

5. Click **"Save"**
6. **Redeploy** your project for changes to take effect:
   - Go to **Deployments** tab
   - Click ⋯ (three dots) on latest deployment
   - Click **"Redeploy"**

### 2.4 Get Your Vercel API URL

After deployment, you'll get a URL like:
```
https://weather-nexus-api.vercel.app
```

**Save this URL!** You'll need it in the next step.

---

## 🌐 Step 3: Update Frontend Configuration

### 3.1 Update app.js with Your Vercel URL

Open `app.js` and find line ~11:

```javascript
// UPDATE THIS LINE:
apiBaseUrl: 'https://your-vercel-app.vercel.app/api',

// CHANGE TO (use your actual Vercel URL):
apiBaseUrl: 'https://weather-nexus-api.vercel.app/api',
```

### 3.2 Commit and Push Changes

```powershell
git add app.js
git commit -m "Update API endpoint with Vercel URL"
git push origin main
```

---

## 📄 Step 4: Deploy Frontend to GitHub Pages

### 4.1 Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (in left sidebar)
3. Under **Source**, select:
   - Branch: `main`
   - Folder: `/ (root)`
4. Click **Save**
5. Wait 1-2 minutes for deployment

### 4.2 Get Your GitHub Pages URL

Your site will be available at:
```
https://studentofstars.github.io/Weather-Nexus/
```

---

## ✅ Step 5: Test Your Deployment

### 5.1 Test API Endpoints

Test your Vercel API endpoints directly:

**Weather API:**
```
https://weather-nexus-api.vercel.app/api/weather?q=London
```

**Space Weather API:**
```
https://weather-nexus-api.vercel.app/api/space-weather?type=FLR&startDate=2025-01-01&endDate=2025-01-31
```

You should see JSON responses. If you get errors, check your environment variables in Vercel.

### 5.2 Test Full Application

1. Open your GitHub Pages URL
2. Try searching for a city (e.g., "Delhi")
3. Check if weather data loads
4. Switch to Space Weather tab
5. Click "Fetch Data"
6. Verify space weather events display

### 5.3 Verify Security

1. Open browser Developer Tools (F12)
2. Go to **Sources** or **Debugger** tab
3. Open `app.js`
4. Search for "API_KEY" or "256156d28"
5. ✅ **If you don't find them, congratulations! Your keys are secure!**

---

## 🔄 Step 6: Making Updates

### Update Frontend (HTML/CSS/JS)

```powershell
# Make your changes to index.html, styles.css, or app.js
git add .
git commit -m "Description of changes"
git push origin main

# GitHub Pages will auto-update in 1-2 minutes
```

### Update Backend (API Functions)

```powershell
# Make changes to files in /api directory
git add .
git commit -m "Update API functions"
git push origin main

# Vercel will auto-deploy from GitHub
# Or use: vercel --prod
```

### Update Environment Variables

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Edit the variable
3. Click **Save**
4. **Important:** Redeploy for changes to take effect!

---

## 🐛 Troubleshooting

### Issue: "City not found" or API errors

**Solution:**
1. Check Vercel environment variables are set correctly
2. Verify your API keys are valid
3. Check Vercel deployment logs: Dashboard → Deployments → View Function Logs

### Issue: CORS errors in browser console

**Solution:**
1. Verify `vercel.json` has correct CORS headers
2. Check that API calls use your Vercel URL, not direct API URLs
3. Redeploy Vercel project

### Issue: GitHub Pages shows 404

**Solution:**
1. Ensure `index.html` is in root directory
2. Wait 2-5 minutes after enabling Pages
3. Check Settings → Pages shows "Your site is live at..."

### Issue: API calls returning 500 errors

**Solution:**
1. Go to Vercel Dashboard → your project → Deployments
2. Click on latest deployment
3. Click "View Function Logs"
4. Look for error messages
5. Common issues:
   - Environment variables not set
   - API key invalid or expired
   - Rate limit exceeded

---

## 💡 Pro Tips

### Local Testing with Vercel

```powershell
# Install Vercel CLI
npm install -g vercel

# Run locally (this simulates Vercel environment)
vercel dev

# Your app will run at http://localhost:3000
# Update app.js temporarily:
# apiBaseUrl: 'http://localhost:3000/api'
```

### Monitor API Usage

**OpenWeatherMap:**
- Dashboard: https://home.openweathermap.org/api_keys
- Free tier: 60 calls/minute, 1M calls/month

**NASA:**
- Rate limit: ~1000 requests/hour
- No dashboard, but errors will show rate limit info

### Custom Domain (Optional)

**For GitHub Pages:**
1. Go to Settings → Pages
2. Add custom domain
3. Update DNS settings with your domain provider

**For Vercel:**
1. Go to Settings → Domains
2. Add domain
3. Follow DNS configuration steps

---

## 📚 Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Vercel Documentation](https://vercel.com/docs)
- [OpenWeatherMap API Docs](https://openweathermap.org/api)
- [NASA API Docs](https://api.nasa.gov/)

---

## 🎉 Success!

Your Weather Nexus app is now:

✅ **Securely deployed** with hidden API keys  
✅ **Professionally hosted** on free tiers  
✅ **Automatically updated** when you push to GitHub  
✅ **Scalable** to handle traffic spikes  
✅ **Ready to showcase** in your portfolio  

**Share your live URL:**
- Frontend: `https://studentofstars.github.io/Weather-Nexus/`
- API: `https://weather-nexus-api.vercel.app`

---

## 📧 Need Help?

- Open an issue on [GitHub](https://github.com/studentofstars/Weather-Nexus/issues)
- Check [Vercel Status](https://vercel-status.com/)
- Review deployment logs in Vercel Dashboard

**Happy Deploying! 🚀**
