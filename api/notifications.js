// Weather & Space Weather Notification Service
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const resendApiKey = process.env.RESEND_API_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  const { action } = req.query;

  try {
    switch (action) {
      case 'checkWeatherAlerts':
        return await checkWeatherAlerts(req, res);
      
      case 'checkSpaceWeatherAlerts':
        return await checkSpaceWeatherAlerts(req, res);
      
      case 'sendTestNotification':
        return await sendTestNotification(req, res);
      
      case 'getNotificationHistory':
        return await getNotificationHistory(req, res);
      
      case 'markAsRead':
        return await markAsRead(req, res);
      
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Notification error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Check weather alerts for all users
async function checkWeatherAlerts(req, res) {
  const { city, weatherData } = req.body;

  if (!city || !weatherData) {
    return res.status(400).json({ error: 'Missing city or weatherData' });
  }

  // Get all users with alerts for this city
  const { data: alerts, error: alertError } = await supabase
    .from('weather_alert_settings')
    .select('*, user_preferences!inner(user_id)')
    .eq('city', city)
    .eq('enabled', true);

  if (alertError) {
    console.error('Error fetching alerts:', alertError);
    return res.status(500).json({ error: alertError.message });
  }

  const triggeredAlerts = [];

  for (const alert of alerts) {
    const shouldTrigger = evaluateWeatherCondition(alert, weatherData);
    
    if (shouldTrigger) {
      // Send notification
      await sendWeatherNotification(alert, weatherData);
      triggeredAlerts.push(alert);
    }
  }

  return res.status(200).json({
    message: `Checked ${alerts.length} alerts, triggered ${triggeredAlerts.length}`,
    triggered: triggeredAlerts.length,
  });
}

// Evaluate if weather condition meets alert criteria
function evaluateWeatherCondition(alert, weatherData) {
  const { alert_type, condition, threshold } = alert;
  let currentValue;

  switch (alert_type) {
    case 'temperature':
      currentValue = weatherData.main.temp;
      break;
    case 'humidity':
      currentValue = weatherData.main.humidity;
      break;
    case 'wind':
      currentValue = weatherData.wind.speed;
      break;
    case 'rain':
      currentValue = weatherData.rain?.['1h'] || 0;
      break;
    case 'storm':
      return weatherData.weather.some(w => 
        w.main === 'Thunderstorm' || w.main === 'Squall'
      );
    default:
      return false;
  }

  switch (condition) {
    case 'above':
      return currentValue > threshold;
    case 'below':
      return currentValue < threshold;
    case 'equals':
      return Math.abs(currentValue - threshold) < 1;
    default:
      return false;
  }
}

// Send weather notification via email
async function sendWeatherNotification(alert, weatherData) {
  // Get user email
  const { data: user, error: userError } = await supabase.auth.admin.getUserById(
    alert.user_preferences.user_id
  );

  if (userError || !user) {
    console.error('Error fetching user:', userError);
    return;
  }

  const { city, alert_type, threshold, condition } = alert;
  const emailSubject = `Weather Alert: ${alert_type} in ${city}`;
  const emailBody = generateWeatherEmailBody(alert, weatherData);

  try {
    // Send email via Resend using fetch
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Weather Nexus <onboarding@resend.dev>',
        to: user.user.email,
        subject: emailSubject,
        html: emailBody,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend error:', data);
      return;
    }

    // Save to notification history
    await supabase.from('notification_history').insert({
      user_id: alert.user_preferences.user_id,
      notification_type: 'weather',
      title: emailSubject,
      message: `${alert_type} is ${condition} ${threshold} in ${city}`,
      data: {
        city,
        alert_type,
        weather: weatherData,
      },
      email_sent: true,
    });

    console.log('Weather notification sent to:', user.user.email);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

// Generate HTML email body
function generateWeatherEmailBody(alert, weatherData) {
  const { city, alert_type, threshold, condition } = alert;
  const temp = weatherData.main.temp;
  const description = weatherData.weather[0].description;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                  color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .alert-box { background: #fff3cd; border-left: 4px solid #ffc107; 
                     padding: 15px; margin: 20px 0; border-radius: 5px; }
        .weather-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .btn { background: #667eea; color: white; padding: 12px 30px; 
               text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌍 Weather Nexus Alert</h1>
          <p>Weather condition triggered in ${city}</p>
        </div>
        <div class="content">
          <div class="alert-box">
            <h2>⚠️ Alert Triggered</h2>
            <p><strong>${alert_type}</strong> is <strong>${condition} ${threshold}</strong></p>
          </div>
          
          <div class="weather-details">
            <h3>Current Weather in ${city}</h3>
            <p><strong>Temperature:</strong> ${temp}°C</p>
            <p><strong>Condition:</strong> ${description}</p>
            <p><strong>Humidity:</strong> ${weatherData.main.humidity}%</p>
            <p><strong>Wind Speed:</strong> ${weatherData.wind.speed} m/s</p>
          </div>
          
          <p>This alert was triggered based on your notification preferences.</p>
          
          <a href="https://studentofstars.github.io/Weather-Nexus/" class="btn">
            View Full Weather Details
          </a>
        </div>
        <div class="footer">
          <p>Weather Nexus - Real-time Weather Monitoring</p>
          <p>To manage your alerts, visit your dashboard settings</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Check space weather alerts
async function checkSpaceWeatherAlerts(req, res) {
  const { spaceWeatherData } = req.body;

  if (!spaceWeatherData) {
    return res.status(400).json({ error: 'Missing spaceWeatherData' });
  }

  // Get all users with space weather alerts enabled
  const { data: alerts, error } = await supabase
    .from('space_weather_alerts')
    .select('*')
    .eq('enabled', true);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const triggeredAlerts = [];

  for (const alert of alerts) {
    const shouldTrigger = evaluateSpaceWeatherCondition(alert, spaceWeatherData);
    
    if (shouldTrigger) {
      await sendSpaceWeatherNotification(alert, spaceWeatherData);
      triggeredAlerts.push(alert);
    }
  }

  return res.status(200).json({
    message: `Checked ${alerts.length} alerts, triggered ${triggeredAlerts.length}`,
    triggered: triggeredAlerts.length,
  });
}

// Evaluate space weather conditions
function evaluateSpaceWeatherCondition(alert, data) {
  const { alert_types, min_severity } = alert;
  const severityLevels = { 'C': 1, 'M': 2, 'X': 3 };
  const minLevel = severityLevels[min_severity];

  // Check each alert type
  return data.some(event => {
    if (!alert_types.includes(event.messageType)) {
      return false;
    }

    // For solar flares, check severity
    if (event.messageType === 'FLR') {
      const eventSeverity = event.messageBody?.match(/[CMX]\d/)?.[0]?.[0];
      const eventLevel = severityLevels[eventSeverity];
      return eventLevel >= minLevel;
    }

    return true;
  });
}

// Send space weather notification
async function sendSpaceWeatherNotification(alert, data) {
  const { data: user, error: userError } = await supabase.auth.admin.getUserById(
    alert.user_id
  );

  if (userError || !user) {
    console.error('Error fetching user:', userError);
    return;
  }

  const emailSubject = '🌌 Space Weather Alert';
  const emailBody = generateSpaceWeatherEmailBody(data);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Weather Nexus <onboarding@resend.dev>',
        to: user.user.email,
        subject: emailSubject,
        html: emailBody,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Resend error:', responseData);
      return;
    }

    // Save to notification history
    await supabase.from('notification_history').insert({
      user_id: alert.user_id,
      notification_type: 'space_weather',
      title: emailSubject,
      message: 'Space weather event detected',
      data: { events: data },
      email_sent: true,
    });

    console.log('Space weather notification sent to:', user.user.email);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

// Generate space weather email body
function generateSpaceWeatherEmailBody(events) {
  const eventsList = events.map(event => `
    <div style="background: white; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #764ba2;">
      <h4>${event.messageType} - ${event.messageIssueTime}</h4>
      <p>${event.messageBody?.substring(0, 200)}...</p>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                  color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .btn { background: #667eea; color: white; padding: 12px 30px; 
               text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌌 Space Weather Alert</h1>
          <p>New space weather events detected</p>
        </div>
        <div class="content">
          <p>The following space weather events have been detected:</p>
          ${eventsList}
          
          <a href="https://studentofstars.github.io/Weather-Nexus/" class="btn">
            View Space Weather Details
          </a>
        </div>
        <div class="footer">
          <p>Weather Nexus - Real-time Weather Monitoring</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Send test notification
async function sendTestNotification(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Weather Nexus <onboarding@resend.dev>',
        to: user.email,
        subject: 'Test Notification from Weather Nexus',
        html: '<p>This is a test notification. Your alert system is working!</p>',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data.message || 'Failed to send email' });
    }

    return res.status(200).json({ 
      message: 'Test notification sent successfully',
      emailId: data.id 
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// Get notification history
async function getNotificationHistory(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const { data: notifications, error } = await supabase
    .from('notification_history')
    .select('*')
    .eq('user_id', user.id)
    .order('sent_at', { ascending: false })
    .limit(50);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ notifications });
}

// Mark notification as read
async function markAsRead(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const { notificationId } = req.body;

  const { error } = await supabase
    .from('notification_history')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', user.id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json({ message: 'Marked as read' });
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
