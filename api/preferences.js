// User Preferences API
// Handles saving cities, notification settings, alert configurations

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  try {
    switch (req.body.action) {
      case 'updateCities':
        return await updateCities(user.id, req.body.cities, res);
      
      case 'updateNotificationSettings':
        return await updateNotificationSettings(user.id, req.body.settings, res);
      
      case 'createWeatherAlert':
        return await createWeatherAlert(user.id, req.body.alert, res);
      
      case 'deleteWeatherAlert':
        return await deleteWeatherAlert(user.id, req.body.alertId, res);
      
      case 'toggleWeatherAlert':
        return await toggleWeatherAlert(user.id, req.body.alertId, req.body.enabled, res);
      
      case 'updateSpaceWeatherAlerts':
        return await updateSpaceWeatherAlerts(user.id, req.body.settings, res);
      
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Preferences API error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Update saved cities
async function updateCities(userId, cities, res) {
  const { data, error } = await supabaseAdmin
    .from('user_preferences')
    .update({ 
      saved_cities: cities,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json({ data });
}

// Update notification settings
async function updateNotificationSettings(userId, settings, res) {
  const { data, error } = await supabaseAdmin
    .from('user_preferences')
    .update({ 
      ...settings,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json({ data });
}

// Create weather alert
async function createWeatherAlert(userId, alert, res) {
  const { data, error } = await supabaseAdmin
    .from('weather_alert_settings')
    .insert([{ user_id: userId, ...alert }])
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(201).json({ data });
}

// Delete weather alert
async function deleteWeatherAlert(userId, alertId, res) {
  const { error } = await supabaseAdmin
    .from('weather_alert_settings')
    .delete()
    .eq('id', alertId)
    .eq('user_id', userId);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json({ message: 'Alert deleted' });
}

// Toggle weather alert
async function toggleWeatherAlert(userId, alertId, enabled, res) {
  const { data, error } = await supabaseAdmin
    .from('weather_alert_settings')
    .update({ enabled })
    .eq('id', alertId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json({ data });
}

// Update space weather alerts
async function updateSpaceWeatherAlerts(userId, settings, res) {
  const { data, error } = await supabaseAdmin
    .from('space_weather_alerts')
    .upsert([{ user_id: userId, ...settings }])
    .select()
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json({ data });
}
