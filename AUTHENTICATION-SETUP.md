# Authentication & Notifications Implementation Guide

## What We've Built So Far

### Backend Infrastructure (✅ Complete)

1. **Database Schema** (`supabase/schema.sql`)
   - User preferences table
   - Weather alert settings
   - Space weather alerts
   - Notification history
   - Row Level Security policies
   - Automatic triggers

2. **API Endpoints**
   - `/api/auth.js` - User authentication & profile management
   - `/api/preferences.js` - Save cities, notification settings
   - `/api/notifications.js` - Email alerts & notification history

3. **Client Library** (`lib/supabase.js`)
   - Authentication helpers
   - Database query helpers
   - Frontend-ready Supabase client

---

## Next Steps - What YOU Need to Do

### Step 1: Apply Database Schema (5 minutes)

1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Select your `weather-nexus` project
3. Click **SQL Editor** (left sidebar)
4. Click **New Query**
5. Open `supabase/schema.sql` in VS Code
6. Copy ALL the SQL code
7. Paste into Supabase SQL Editor
8. Click **Run** (bottom right) or press Ctrl+Enter
9. Wait for "Success. No rows returned" message

**Verify it worked:**
- Go to **Database** > **Tables** in Supabase
- You should see 4 new tables:
  - user_preferences
  - weather_alert_settings
  - space_weather_alerts
  - notification_history

---

### Step 2: Get Service Role Key (2 minutes)

1. In Supabase Dashboard, go to **Project Settings** (gear icon, bottom left)
2. Click **API** in the settings menu
3. Scroll down to **Project API keys**
4. Find `service_role` key (⚠️ Keep this SECRET!)
5. Click to reveal and copy it
6. Update `.env` file:

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

---

### Step 3: Set Up Email Service (5 minutes - Optional)

For email notifications, sign up for Resend (free tier: 3000 emails/month):

1. Go to https://resend.com
2. Sign up with GitHub or email
3. Verify your email
4. Go to **API Keys** in dashboard
5. Click **Create API Key**
6. Copy the key
7. Update `.env`:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxx
```

**Skip this for now?** Email notifications will be disabled but everything else will work!

---

### Step 4: Update Vercel Environment Variables (5 minutes)

You need to add the Supabase keys to Vercel:

1. Go to https://vercel.com/dashboard
2. Select your `weather-monitor-rho` project
3. Click **Settings** > **Environment Variables**
4. Add these variables (one by one):

```
NEXT_PUBLIC_SUPABASE_URL = https://hkziikdwbmrnjzeregac.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhremlpa2R3Ym1ybmp6ZXJlZ2FjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NDM5OTQsImV4cCI6MjA3NTIxOTk5NH0.uWH_6nBxXTacx4dDci8JxDEbO0a2_s5tOz8W4ZN4cw4
SUPABASE_SERVICE_ROLE_KEY = [your service role key from Step 2]
RESEND_API_KEY = [your Resend key from Step 3 - optional]
```

5. Select **All Environments** (Production, Preview, Development)
6. Click **Save** for each variable
7. After adding all variables, click **Redeploy** (Deployments tab > ⋯ > Redeploy)

---

### Step 5: Install Dependencies (1 minute)

In your terminal, run:

```powershell
cd d:\ASTRO\Weather_Monitoring
npm install
```

This installs:
- `@supabase/supabase-js` - Supabase client library
- `resend` - Email service (for API endpoints)

---

## What's Next?

Once you complete steps 1-5 above, let me know and I'll:

1. **Add Authentication UI** - Clean, minimal login/signup modal
2. **Add User Menu** - Profile, settings, notifications
3. **Integrate Features** - Save cities, set alerts, view notifications
4. **Test Everything** - Make sure it all works
5. **Deploy** - Push to GitHub and Vercel

---

## Current Status

✅ **Backend Complete:**
- Database schema ready
- API endpoints created
- Supabase client configured
- Email templates designed

⏸️ **Waiting on YOU:**
- Apply database schema in Supabase
- Get service role key
- Set up Resend (optional)
- Update Vercel env vars
- Install npm dependencies

⏳ **Next (After Your Steps):**
- Add authentication UI
- Integrate features
- Test and deploy

---

## Need Help?

**Common Issues:**

1. **"relation does not exist" error in Supabase**
   - You didn't run the schema.sql yet
   - Go back to Step 1

2. **"unauthorized" errors in API**
   - Missing environment variables in Vercel
   - Check Step 4

3. **npm install fails**
   - Delete `node_modules` folder if it exists
   - Run `npm install` again

**Ready to continue?** Complete steps 1-5 and let me know! 🚀
