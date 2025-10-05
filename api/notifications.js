// Notification Service API
// Sends email notifications for weather alerts

import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendApiKey = process.env.RESEND_API_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  // This endpoint can only be called from server-side (not from frontend)
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    switch (req.body.action) {
      case 'sendWeatherAlert':
        return await sendWeatherAlert(req.body, res);
      
      case 'sendSpaceWeatherAlert':
        return await sendSpaceWeatherAlert(req.body, res);
      
      case 'checkAlerts':
        return await checkAlerts(req.body, res);
      
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Notification API error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Send weather alert to user
async function sendWeatherAlert(body, res) {
  const { userId, city, weatherData, alertType } = body;

  // Get user email and preferences
  const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (userError || !user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { data: prefs } = await supabaseAdmin
    .from('user_preferences')
    .select('email_notifications')
    .eq('user_id', userId)
    .single();

  if (!prefs?.email_notifications) {
    return res.status(200).json({ message: 'Email notifications disabled' });
  }

  // Create notification title and message
  let title, message;
  
  switch (alertType) {
    case 'temperature':
      title = `Temperature Alert: ${city}`;
      message = `Current temperature in ${city} is ${weatherData.temp}°C`;
      break;
    case 'rain':
      title = `Rain Alert: ${city}`;
      message = `Rain detected in ${city}. Current conditions: ${weatherData.description}`;
      break;
    case 'storm':
      title = `Storm Warning: ${city}`;
      message = `Storm conditions in ${city}. Wind speed: ${weatherData.windSpeed} m/s`;
      break;
    default:
      title = `Weather Alert: ${city}`;
      message = `Weather conditions in ${city} have changed significantly`;
  }

  // Send email if Resend is configured
  if (resend) {
    try {
      await resend.emails.send({
        from: 'Weather Nexus <alerts@weathernexus.com>',
        to: user.email,
        subject: title,
        html: createEmailTemplate(title, message, weatherData),
      });
    } catch (emailError) {
      console.error('Email send error:', emailError);
    }
  }

  // Save notification to history
  const { data: notification, error: notifError } = await supabaseAdmin
    .from('notification_history')
    .insert([{
      user_id: userId,
      notification_type: 'weather',
      title,
      message,
      data: { city, weatherData, alertType },
      email_sent: resend ? true : false,
    }])
    .select()
    .single();

  if (notifError) {
    return res.status(400).json({ error: notifError.message });
  }

  return res.status(200).json({ 
    message: 'Alert sent',
    notification 
  });
}

// Send space weather alert
async function sendSpaceWeatherAlert(body, res) {
  const { userId, eventData } = body;

  // Get user email and preferences
  const { data: { user }, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (userError || !user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { data: prefs } = await supabaseAdmin
    .from('user_preferences')
    .select('email_notifications')
    .eq('user_id', userId)
    .single();

  if (!prefs?.email_notifications) {
    return res.status(200).json({ message: 'Email notifications disabled' });
  }

  const title = `Space Weather Alert: ${eventData.type}`;
  const message = `A ${eventData.type} event has been detected. ${eventData.description || ''}`;

  // Send email if Resend is configured
  if (resend) {
    try {
      await resend.emails.send({
        from: 'Weather Nexus <alerts@weathernexus.com>',
        to: user.email,
        subject: title,
        html: createSpaceWeatherEmailTemplate(title, message, eventData),
      });
    } catch (emailError) {
      console.error('Email send error:', emailError);
    }
  }

  // Save notification to history
  const { data: notification, error: notifError } = await supabaseAdmin
    .from('notification_history')
    .insert([{
      user_id: userId,
      notification_type: 'space_weather',
      title,
      message,
      data: { eventData },
      email_sent: resend ? true : false,
    }])
    .select()
    .single();

  if (notifError) {
    return res.status(400).json({ error: notifError.message });
  }

  return res.status(200).json({ 
    message: 'Alert sent',
    notification 
  });
}

// Check and trigger alerts (called periodically)
async function checkAlerts(body, res) {
  // This would be called by a cron job to check weather conditions
  // and trigger alerts for users who have enabled them
  
  return res.status(200).json({ 
    message: 'Alert check completed',
    note: 'Implement cron job logic here'
  });
}

// Email template for weather alerts
function createEmailTemplate(title, message, weatherData) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #007AFF, #00C7BE); padding: 40px 20px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 40px 20px; }
        .weather-data { background: #f8f9fa; padding: 20px; border-radius: 12px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${title}</h1>
        </div>
        <div class="content">
          <p>${message}</p>
          ${weatherData ? `
            <div class="weather-data">
              <p><strong>Temperature:</strong> ${weatherData.temp}°C</p>
              <p><strong>Feels Like:</strong> ${weatherData.feelsLike}°C</p>
              <p><strong>Humidity:</strong> ${weatherData.humidity}%</p>
              <p><strong>Conditions:</strong> ${weatherData.description}</p>
            </div>
          ` : ''}
          <p>Stay safe and check Weather Nexus for more details.</p>
        </div>
        <div class="footer">
          <p>Weather Nexus - Your weather monitoring companion</p>
          <p><a href="https://studentofstars.github.io/Weather-Nexus/">Visit Website</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Email template for space weather alerts
function createSpaceWeatherEmailTemplate(title, message, eventData) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #0a0e27; }
        .container { max-width: 600px; margin: 40px auto; background: #1a1e3a; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.3); }
        .header { background: linear-gradient(135deg, #4A9EFF, #6BB6FF); padding: 40px 20px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { padding: 40px 20px; color: #e0e0e0; }
        .event-data { background: rgba(74, 158, 255, 0.1); padding: 20px; border-radius: 12px; margin: 20px 0; border-left: 4px solid #4A9EFF; }
        .footer { background: rgba(255,255,255,0.05); padding: 20px; text-align: center; font-size: 12px; color: #999; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${title}</h1>
        </div>
        <div class="content">
          <p>${message}</p>
          ${eventData ? `
            <div class="event-data">
              <p><strong>Event Type:</strong> ${eventData.type}</p>
              <p><strong>Time:</strong> ${eventData.time || 'Recent'}</p>
              ${eventData.severity ? `<p><strong>Severity:</strong> ${eventData.severity}</p>` : ''}
            </div>
          ` : ''}
          <p>Check Weather Nexus for detailed space weather information.</p>
        </div>
        <div class="footer">
          <p>Weather Nexus - Space Weather Monitoring</p>
          <p><a href="https://studentofstars.github.io/Weather-Nexus/" style="color: #4A9EFF;">Visit Website</a></p>
        </div>
      </div>
    </body>
    </html>
  `;
}
