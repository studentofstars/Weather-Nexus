# 🚀 Production Deployment Guide

## ✅ What's Been Done

- ✅ Backend authentication APIs created
- ✅ Database schema ready
- ✅ Notification service configured
- ✅ Code pushed to GitHub
- ✅ `.env` secured (not in git)

---

## 📋 Next Steps (Do These Now)

### **Step 1: Create Database Tables in Supabase** (5 minutes)

1. **Go to Supabase Dashboard:**
   - https://supabase.com/dashboard
   - Select your `weather-nexus` project

2. **Open SQL Editor:**
   - Click **"SQL Editor"** in left sidebar
   - Click **"New query"**

3. **Copy & Paste Schema:**
   - Open: `supabase/schema.sql`
   - Copy ALL the SQL code
   - Paste into Supabase SQL Editor

4. **Run the SQL:**
   - Click **"Run"** button (or press Ctrl+Enter)
   - You should see: "Success. No rows returned"
   - This creates 3 tables: `user_preferences`, `weather_alerts`, `notification_settings`

5. **Verify Tables Created:**
   - Click **"Table Editor"** in left sidebar
   - You should see: `user_preferences`, `weather_alerts`, `notification_settings`

---

### **Step 2: Add Environment Variables to Vercel** (10 minutes)

1. **Go to Vercel Dashboard:**
   - https://vercel.com/dashboard
   - Click on your **`weather-monitor-rho`** project

2. **Open Settings:**
   - Click **"Settings"** tab
   - Click **"Environment Variables"** in left menu

3. **Add Supabase Variables:**
   
   **Variable 1:**
   - Name: `SUPABASE_URL`
   - Value: `https://hkziikdwbmrnjzeregac.supabase.co`
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Click **"Save"**
   
   **Variable 2:**
   - Name: `SUPABASE_ANON_KEY`
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhremlpa2R3Ym1ybmp6ZXJlZ2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NDM5OTQsImV4cCI6MjA3NTIxOTk5NH0.uWH_6nBxXTacx4dDci8JxDEbO0a2_s5tOz8W4ZN4cw4`
   - Environments: ✅ Production, ✅ Preview, ✅ Development
   - Click **"Save"**

4. **Keep Existing Variables:**
   - `OPENWEATHER_API_KEY` (already set)
   - `NASA_API_KEY` (already set)

---

### **Step 3: Redeploy Vercel** (2 minutes)

After adding environment variables, you MUST redeploy:

1. **In Vercel Dashboard:**
   - Go to **"Deployments"** tab
   - Find the latest deployment
   - Click **"⋯"** (three dots)
   - Click **"Redeploy"**
   - Click **"Redeploy"** again to confirm

2. **Wait for Deployment:**
   - Takes 1-2 minutes
   - Status will change to **"Ready"**

3. **Verify:**
   - Visit: https://weather-monitor-rho.vercel.app
   - Should work normally (no visual changes yet)

---

### **Step 4: Test API Endpoints** (Optional - 5 minutes)

Test that authentication backend is working:

**Test Auth Endpoint:**
```bash
# Open browser console on your site
# Go to: https://studentofstars.github.io/Weather-Nexus/
# Press F12, go to Console tab, paste:

fetch('https://weather-monitor-rho.vercel.app/api/auth?action=test')
  .then(r => r.json())
  .then(d => console.log(d))
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Auth API is ready",
  "supabase": "connected"
}
```

---

## 🎨 **Next Phase: Add UI** (After Deployment Works)

Once backend is deployed and working, we'll add:

1. **Sign In button** (top-right, minimal)
2. **Login/Signup modal** (clean overlay)
3. **User menu** (when logged in)
4. **Notification bell** (for alerts)
5. **Save locations** (star icon)

**All will match your glassmorphism design!**

---

## ⚠️ **Important Notes**

- **`.env` file:** Local only, NOT in git (secure!)
- **Vercel auto-deploys:** When you push to GitHub, Vercel redeploys automatically
- **GitHub Pages:** Only serves static files (HTML/CSS/JS)
- **Vercel Functions:** Handle authentication and API calls

---

## 📞 **What to Do Now:**

1. ✅ **Run SQL schema** in Supabase (Step 1)
2. ✅ **Add env variables** to Vercel (Step 2)
3. ✅ **Redeploy** Vercel (Step 3)
4. ✅ **Tell me when done** - I'll add the UI next!

---

## 🆘 **If You Get Stuck:**

**Problem:** SQL schema won't run
- Make sure you copied the ENTIRE `schema.sql` file
- Check for error messages in Supabase console

**Problem:** Can't find environment variables in Vercel
- Make sure you're in the right project (`weather-monitor-rho`)
- Look under Settings → Environment Variables

**Problem:** Deployment fails
- Check Vercel deployment logs for errors
- Make sure all environment variables are saved

Let me know when Steps 1-3 are complete! 🚀
