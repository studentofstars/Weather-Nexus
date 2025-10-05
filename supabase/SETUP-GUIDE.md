# Supabase Setup Guide

## Step 1: Apply Database Schema

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your `weather-nexus` project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the entire contents of `supabase/schema.sql`
6. Paste into the query editor
7. Click **Run** (or press Ctrl+Enter)
8. You should see "Success. No rows returned"

This creates:
- ✅ `user_preferences` - User settings and saved cities
- ✅ `weather_alert_settings` - Custom weather alerts
- ✅ `space_weather_alerts` - Space weather notifications
- ✅ `notification_history` - Alert history
- ✅ Row Level Security (RLS) policies for data protection
- ✅ Automatic triggers for user creation

## Step 2: Configure Authentication

1. In Supabase Dashboard, click **Authentication** > **Providers**
2. **Email** provider is enabled by default
3. Configure email settings:
   - Go to **Authentication** > **Settings**
   - Under **Email Templates**, customize if desired
   - Default templates work fine for now

### Optional: Enable Social Login

If you want Google/GitHub login:
1. **Authentication** > **Providers**
2. Enable **Google** or **GitHub**
3. Follow provider-specific setup instructions

## Step 3: Get Service Role Key (for server-side operations)

1. Go to **Project Settings** > **API**
2. Scroll down to **Project API keys**
3. Copy the `service_role` key (keep this SECRET!)
4. This key is needed for sending notifications server-side

**You'll need:**
- ✅ `NEXT_PUBLIC_SUPABASE_URL` (already have)
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` (already have)
- 🔑 `SUPABASE_SERVICE_ROLE_KEY` (copy this now)

## Step 4: Verify Setup

1. Go to **Database** > **Tables**
2. You should see:
   - user_preferences
   - weather_alert_settings
   - space_weather_alerts
   - notification_history

## Step 5: Test Authentication (Optional)

1. Go to **Authentication** > **Users**
2. Click **Add user**
3. Create a test user with email/password
4. Verify user appears in the list

## Next Steps

After completing these steps, I'll add the Supabase keys to your `.env` file and create the API endpoints.

**Ready?** Let me know when you've applied the schema!
