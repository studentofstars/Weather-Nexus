-- Weather Nexus Database Schema
-- Run this in Supabase SQL Editor: Dashboard > SQL Editor > New Query

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  saved_cities JSONB DEFAULT '[]'::jsonb,
  default_city TEXT,
  temperature_unit TEXT DEFAULT 'celsius' CHECK (temperature_unit IN ('celsius', 'fahrenheit')),
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Weather Alert Settings Table
CREATE TABLE IF NOT EXISTS weather_alert_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  city TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('temperature', 'rain', 'storm', 'humidity', 'wind')),
  condition TEXT NOT NULL CHECK (condition IN ('above', 'below', 'equals')),
  threshold NUMERIC NOT NULL,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, city, alert_type)
);

-- Space Weather Alert Settings Table
CREATE TABLE IF NOT EXISTS space_weather_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  alert_types JSONB DEFAULT '["FLR", "CME", "GST"]'::jsonb, -- Solar Flare, CME, Geomagnetic Storm
  min_severity TEXT DEFAULT 'M' CHECK (min_severity IN ('C', 'M', 'X')),
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Notification History Table
CREATE TABLE IF NOT EXISTS notification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  notification_type TEXT NOT NULL CHECK (notification_type IN ('weather', 'space_weather')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  email_sent BOOLEAN DEFAULT false
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_weather_alerts_user_id ON weather_alert_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_weather_alerts_enabled ON weather_alert_settings(enabled) WHERE enabled = true;
CREATE INDEX IF NOT EXISTS idx_space_alerts_user_id ON space_weather_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_history_user_id ON notification_history(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_history_sent_at ON notification_history(sent_at DESC);

-- Row Level Security Policies

-- User Preferences RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Weather Alert Settings RLS
ALTER TABLE weather_alert_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own alert settings"
  ON weather_alert_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alert settings"
  ON weather_alert_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alert settings"
  ON weather_alert_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alert settings"
  ON weather_alert_settings FOR DELETE
  USING (auth.uid() = user_id);

-- Space Weather Alerts RLS
ALTER TABLE space_weather_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own space weather alerts"
  ON space_weather_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own space weather alerts"
  ON space_weather_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own space weather alerts"
  ON space_weather_alerts FOR UPDATE
  USING (auth.uid() = user_id);

-- Notification History RLS
ALTER TABLE notification_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notification history"
  ON notification_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification read status"
  ON notification_history FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_preferences
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
