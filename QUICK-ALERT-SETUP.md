# 🎯 Quick Start: Setting Up Your First Weather Alert

Since the automated system needs weather alerts to monitor, here's how to create them manually using Supabase for now.

## 📝 Create Weather Alerts (Temporary Manual Method)

Until we build the UI for alert creation, you can add alerts directly in Supabase:

### Step 1: Open Supabase SQL Editor

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your **weather-nexus** project
3. Click **SQL Editor** in the left sidebar
4. Click **"New query"**

### Step 2: Create Your First Alert

Copy and paste this SQL (replace `YOUR_USER_ID` with your actual user ID):

```sql
-- Get your user ID first
SELECT id, email FROM auth.users;

-- Create a temperature alert for London
INSERT INTO weather_alert_settings (user_id, city, alert_type, condition, threshold, enabled)
VALUES (
  'YOUR_USER_ID_HERE',  -- Replace with your actual user ID
  'London',              -- City to monitor
  'temperature',         -- Alert type
  'above',              -- Condition (above/below/equals)
  30,                   -- Threshold (30°C)
  true                  -- Enabled
);
```

### Step 3: Create More Alerts

Here are example alerts you can create:

#### High Temperature Alert (Heat Wave)
```sql
INSERT INTO weather_alert_settings (user_id, city, alert_type, condition, threshold, enabled)
VALUES ('YOUR_USER_ID', 'Delhi', 'temperature', 'above', 40, true);
```

#### Low Temperature Alert (Cold Wave)
```sql
INSERT INTO weather_alert_settings (user_id, city, alert_type, condition, threshold, enabled)
VALUES ('YOUR_USER_ID', 'Delhi', 'temperature', 'below', 10, true);
```

#### High Humidity Alert
```sql
INSERT INTO weather_alert_settings (user_id, city, alert_type, condition, threshold, enabled)
VALUES ('YOUR_USER_ID', 'Mumbai', 'humidity', 'above', 80, true);
```

#### Strong Wind Alert
```sql
INSERT INTO weather_alert_settings (user_id, city, alert_type, condition, threshold, enabled)
VALUES ('YOUR_USER_ID', 'Kolkata', 'wind', 'above', 15, true);
```

#### Storm Alert
```sql
INSERT INTO weather_alert_settings (user_id, city, alert_type, condition, threshold, enabled)
VALUES ('YOUR_USER_ID', 'Bengaluru', 'storm', 'equals', 0, true);
-- Note: storm alerts ignore threshold, just set to 0
```

### Step 4: Enable Space Weather Alerts

```sql
-- Check if you already have space weather alerts
SELECT * FROM space_weather_alerts WHERE user_id = 'YOUR_USER_ID';

-- If no results, create one:
INSERT INTO space_weather_alerts (user_id, alert_types, min_severity, enabled)
VALUES (
  'YOUR_USER_ID',
  '["FLR", "CME", "GST"]'::jsonb,  -- Monitor solar flares, CMEs, and geomagnetic storms
  'M',                               -- Minimum severity (C, M, or X)
  true
);
```

### Step 5: Verify Your Alerts

```sql
-- Check your weather alerts
SELECT * FROM weather_alert_settings WHERE user_id = 'YOUR_USER_ID';

-- Check your space weather alerts
SELECT * FROM space_weather_alerts WHERE user_id = 'YOUR_USER_ID';

-- Check your notification preferences
SELECT * FROM user_preferences WHERE user_id = 'YOUR_USER_ID';
```

## 🧪 Test the System

### Option 1: Set Low Thresholds for Immediate Testing

Create an alert that will definitely trigger:

```sql
-- Alert if temperature is above 0°C (will always trigger)
INSERT INTO weather_alert_settings (user_id, city, alert_type, condition, threshold, enabled)
VALUES ('YOUR_USER_ID', 'London', 'temperature', 'above', 0, true);
```

Then trigger the check manually (see AUTOMATED-MONITORING.md).

### Option 2: Wait for Scheduled Run

The system runs at:
- 10:00 AM IST
- 4:00 PM IST

If current conditions meet your thresholds, you'll get notified!

## 📊 Alert Types Reference

| Type | Condition | Threshold | Example |
|------|-----------|-----------|---------|
| temperature | above/below/equals | Degrees Celsius | temp > 35°C |
| humidity | above/below/equals | Percentage | humidity > 80% |
| wind | above/below/equals | Meters/second | wind > 20 m/s |
| rain | above/below/equals | mm per hour | rain > 5mm |
| storm | equals | 0 (ignored) | storm detected |

## 🎨 Coming Soon: Alert Setup UI

We'll be building a user-friendly interface where you can:
- ✅ Add/edit/delete alerts visually
- ✅ Select cities from a dropdown
- ✅ Set thresholds with sliders
- ✅ Toggle alerts on/off
- ✅ See alert history

For now, use the SQL method above!

## ✅ Checklist

Before the automated system works, make sure:

- [ ] You've created at least one weather alert
- [ ] `enabled = true` in `weather_alert_settings`
- [ ] `notifications_enabled = true` in `user_preferences`
- [ ] `email_notifications = true` in `user_preferences`
- [ ] GitHub Secret `CRON_SECRET` is set
- [ ] Vercel Secret `CRON_SECRET` is set
- [ ] Vercel project is redeployed

## 🚀 That's It!

Once you've created alerts and set up the secrets, your automated weather monitoring will start working!

**Next scheduled checks:**
- Today at 10:00 AM IST
- Today at 4:00 PM IST

---

**Need help?** Check `AUTOMATED-MONITORING.md` for detailed setup instructions!
