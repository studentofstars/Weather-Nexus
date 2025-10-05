// Authentication API Endpoint
// Handles user signup, login, profile management

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create Supabase admin client (server-side only)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Enable CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(req, res) {
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  const { method, body } = req;
  const action = body?.action;

  try {
    switch (action) {
      case 'getProfile':
        return await getProfile(req, res);
      
      case 'updateProfile':
        return await updateProfile(req, res);
      
      case 'deleteAccount':
        return await deleteAccount(req, res);
      
      default:
        return res.status(400).json({ 
          error: 'Invalid action',
          validActions: ['getProfile', 'updateProfile', 'deleteAccount']
        });
    }
  } catch (error) {
    console.error('Auth API error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Get user profile with preferences
async function getProfile(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Get user preferences
  const { data: preferences, error: prefError } = await supabaseAdmin
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single();

  // Get weather alerts
  const { data: weatherAlerts, error: weatherError } = await supabaseAdmin
    .from('weather_alert_settings')
    .select('*')
    .eq('user_id', user.id);

  // Get space weather alerts
  const { data: spaceAlerts, error: spaceError } = await supabaseAdmin
    .from('space_weather_alerts')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return res.status(200).json({
    user: {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    },
    preferences: preferences || {},
    weather_alerts: weatherAlerts || [],
    space_alerts: spaceAlerts || {},
  });
}

// Update user profile
async function updateProfile(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const { email, password } = req.body;
  const updates = {};

  if (email) updates.email = email;
  if (password) updates.password = password;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'No updates provided' });
  }

  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
    user.id,
    updates
  );

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json({ 
    message: 'Profile updated successfully',
    user: data.user
  });
}

// Delete user account
async function deleteAccount(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
  
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Delete user (cascades to all related tables due to ON DELETE CASCADE)
  const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json({ 
    message: 'Account deleted successfully'
  });
}
