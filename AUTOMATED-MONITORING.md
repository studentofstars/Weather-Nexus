# 🤖 Automated Weather Monitoring Setup

Your Weather Nexus now has **automated weather checking** that runs twice daily!

## ✨ Features

- ✅ Checks weather **2 times per day** (10 AM & 4 PM IST)
- ✅ Monitors user's saved cities and alert settings
- ✅ Sends email notifications when conditions are met
- ✅ Tracks space weather events (solar flares, CMEs)
- ✅ Saves all notifications to database (viewable in notification panel)
- ✅ Completely automated - no manual intervention needed

## 🔧 Setup Steps

### 1. Add Secret to GitHub Repository

1. Go to your GitHub repository: https://github.com/studentofstars/Weather-Nexus
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Add this secret:
   - **Name:** `CRON_SECRET`
   - **Value:** `weather-nexus-cron-2024-secure-key` (or any random string)
5. Click **"Add secret"**

### 2. Add Secret to Vercel

1. Go to Vercel Dashboard: https://vercel.com/dashboard
2. Select your **weather-monitor-rho** project
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Key:** `CRON_SECRET`
   - **Value:** `weather-nexus-cron-2024-secure-key` (same as GitHub)
   - **Environment:** All (Production, Preview, Development)
5. Click **Save**
6. **Redeploy** your project for changes to take effect

### 3. Test the Automation

#### Option A: Manual GitHub Actions Trigger
1. Go to **Actions** tab in your GitHub repository
2. Click **"Automated Weather Checks"** workflow
3. Click **"Run workflow"** → **"Run workflow"**
4. Wait 30-60 seconds
5. Click on the workflow run to see logs

#### Option B: Test via API
Run this in your terminal:
```bash
curl -X POST https://weather-monitor-rho.vercel.app/api/check-weather \
  -H "Authorization: Bearer weather-nexus-cron-2024-secure-key" \
  -H "Content-Type: application/json"
```

Expected response:
```json
{
  "success": true,
  "timestamp": "2025-10-08T...",
  "weather": {
    "users_checked": 1,
    "total_checks": 0,
    "notifications_sent": 0
  },
  "space_weather": {
    "users_checked": 0,
    "notifications_sent": 0
  }
}
```

## 📅 Schedule

The automated checks run at:
- **10:00 AM IST** (4:30 AM UTC)
- **4:00 PM IST** (10:30 AM UTC)

To change the schedule, edit `.github/workflows/weather-check.yml`:
```yaml
schedule:
  - cron: '30 4 * * *'  # 10 AM IST
  - cron: '30 10 * * *' # 4 PM IST
```

Cron format: `minute hour day month weekday`

## 🔔 How Notifications Work

### For Weather Alerts:

1. **System checks** all users' `weather_alert_settings`
2. **Fetches current weather** for each city
3. **Evaluates conditions**:
   - Temperature above/below threshold
   - Humidity levels
   - Wind speed
   - Rain detected
   - Storm warnings
4. **Sends notification** if condition is met:
   - Email (if `email_notifications` enabled)
   - Saves to `notification_history` table
   - Shows in notification bell dropdown

### For Space Weather:

1. **Fetches NASA DONKI data** (last 24 hours)
2. **Checks for events**: Solar Flares (FLR), CMEs, Geomagnetic Storms
3. **Filters by severity**: C-class, M-class, X-class
4. **Sends alerts** to users with space weather alerts enabled

## 🎯 User Experience

### What Users See:

1. **Email notification** arrives in inbox with:
   - Alert title (e.g., "Weather Alert: temperature in London")
   - Current weather conditions
   - Reason for alert
   - Link to view full details

2. **Notification bell** badge shows unread count

3. **Notification panel** displays:
   - Alert history
   - Timestamp
   - Weather/space weather details
   - Email sent confirmation

### What Users Need to Do:

**Nothing!** Once they:
1. Sign up and log in
2. Set up weather alerts (optional - coming soon)
3. Enable email notifications in Settings

The system automatically monitors and notifies them!

## 🐛 Troubleshooting

### No Notifications Received?

**Check these:**

1. **Do users have alert settings?**
   - Query Supabase: `SELECT * FROM weather_alert_settings WHERE user_id = '...'`
   - If empty, users haven't set up alerts yet

2. **Are notifications enabled?**
   - Check `user_preferences`: `notifications_enabled` and `email_notifications` should be `true`

3. **Is the condition met?**
   - The system only sends alerts when weather crosses thresholds
   - Not every check will trigger an alert

4. **Check logs:**
   - Vercel: Go to project → **Logs** → Filter by `/api/check-weather`
   - GitHub Actions: Click on workflow run → View logs

5. **Email delivery:**
   - Remember: Resend test domain only sends to verified emails
   - See `NOTIFICATION-SETUP.md` for domain verification

### GitHub Actions Not Running?

1. **Check workflow file:** Must be in `.github/workflows/` folder
2. **Check Actions tab:** Should see workflow listed
3. **Check permissions:** Actions must be enabled in repository settings
4. **Manual trigger:** Use "Run workflow" button to test

### 401 Unauthorized Error?

- Check `CRON_SECRET` matches in both GitHub and Vercel
- Ensure you added `Authorization: Bearer <secret>` header

## 📊 Monitoring

### View Automation Results:

1. **GitHub Actions:**
   - Go to **Actions** tab
   - Click on latest "Automated Weather Checks" run
   - View detailed logs

2. **Vercel Logs:**
   - Go to project → **Logs**
   - Filter by `/api/check-weather`
   - See which users were checked and notifications sent

3. **Supabase:**
   - Check `notification_history` table for saved notifications
   - Verify `email_sent` field

## 🎓 How It Works Technically

```
GitHub Actions (Cron)
    ↓ (triggers at 10 AM & 4 PM)
Vercel API Endpoint (/api/check-weather)
    ↓ (authenticated with CRON_SECRET)
    ├─→ Query Supabase (get all users + preferences)
    ├─→ Fetch OpenWeather API (current conditions)
    ├─→ Fetch NASA API (space weather)
    ├─→ Evaluate alert conditions
    └─→ Send notifications:
        ├─→ Email (via Resend)
        └─→ Save to notification_history
            ↓
Users see notifications:
    ├─→ Email inbox
    └─→ Notification bell in app
```

## ✅ What's Automated

- ✅ **Weather checks** for all users' cities
- ✅ **Space weather monitoring**
- ✅ **Email delivery**
- ✅ **Notification history tracking**
- ✅ **No manual intervention needed**

## ❌ What's NOT Automated (Yet)

- ❌ **Alert setup** - Users must manually create weather alerts
  - *Coming soon:* UI for setting up custom alerts
- ❌ **Push notifications** - Only email notifications work
  - *Future:* Browser push notification support

## 🚀 Next Steps

1. **Set up GitHub secret** (`CRON_SECRET`)
2. **Set up Vercel secret** (same `CRON_SECRET`)
3. **Test with manual trigger**
4. **Wait for scheduled runs** (10 AM & 4 PM IST)
5. **Monitor logs** to ensure it's working

**Your automated weather monitoring is ready!** 🎉

---

## 📝 Notes

- Free tier limits: GitHub Actions gives 2,000 minutes/month (more than enough for 2 daily checks)
- Vercel free tier: No limits on serverless function invocations
- OpenWeather free tier: 1,000 calls/day (plenty for daily checks)
- NASA API: No rate limits

**Everything runs on free tiers!** 💯
