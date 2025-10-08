// Automated Weather Check Service
// Runs twice daily to check weather and send notifications
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openWeatherApiKey = process.env.OPENWEATHER_API_KEY;
const nasaApiKey = process.env.NASA_API_KEY;
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

  // Security: Check for cron secret
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET || 'your-secret-key';
  
  if (authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('🔍 Starting automated weather check...');
    
    // Check both weather and space weather
    const weatherResults = await checkAllUsersWeather();
    const spaceResults = await checkSpaceWeather();
    
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      weather: weatherResults,
      space_weather: spaceResults
    });
  } catch (error) {
    console.error('❌ Automated check error:', error);
    return res.status(500).json({ error: error.message });
  }
}

// Check weather for all users
async function checkAllUsersWeather() {
  try {
    // Get all users with preferences
    const { data: users, error: usersError } = await supabase
      .from('user_preferences')
      .select('user_id, saved_cities, default_city, email_notifications, notifications_enabled');

    if (usersError) throw usersError;

    console.log(`📊 Found ${users.length} users to check`);

    let totalChecks = 0;
    let totalNotifications = 0;

    for (const user of users) {
      if (!user.notifications_enabled) continue;

      // Get user's alert settings
      const { data: alerts, error: alertsError } = await supabase
        .from('weather_alert_settings')
        .select('*')
        .eq('user_id', user.user_id)
        .eq('enabled', true);

      if (alertsError || !alerts || alerts.length === 0) continue;

      // Check weather for each alert
      for (const alert of alerts) {
        totalChecks++;
        const triggered = await checkWeatherAlert(alert, user);
        if (triggered) totalNotifications++;
      }
    }

    return {
      users_checked: users.length,
      total_checks: totalChecks,
      notifications_sent: totalNotifications
    };
  } catch (error) {
    console.error('Error checking users weather:', error);
    throw error;
  }
}

// Check individual weather alert
async function checkWeatherAlert(alert, user) {
  try {
    // Fetch current weather
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${alert.city}&appid=${openWeatherApiKey}&units=metric`;
    const response = await fetch(weatherUrl);
    
    if (!response.ok) {
      console.log(`⚠️ Could not fetch weather for ${alert.city}`);
      return false;
    }

    const weatherData = await response.json();

    // Check if alert condition is met
    const shouldTrigger = evaluateAlertCondition(alert, weatherData);

    if (shouldTrigger) {
      console.log(`🔔 Alert triggered for user ${user.user_id} in ${alert.city}`);
      await sendWeatherNotification(alert, weatherData, user);
      return true;
    }

    return false;
  } catch (error) {
    console.error(`Error checking alert for ${alert.city}:`, error);
    return false;
  }
}

// Evaluate if alert condition is met
function evaluateAlertCondition(alert, weatherData) {
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

// Send weather notification
async function sendWeatherNotification(alert, weatherData, user) {
  try {
    // Get user email
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(user.user_id);
    if (authError || !authUser) {
      console.error('Could not get user email');
      return;
    }

    const userEmail = authUser.user.email;
    const { city, alert_type, threshold, condition } = alert;
    
    const currentTemp = weatherData.main.temp;
    const description = weatherData.weather[0].description;
    const feelsLike = weatherData.main.feels_like;
    const humidity = weatherData.main.humidity;
    const windSpeed = weatherData.wind.speed;

    // Create notification title and message
    const title = `Weather Alert: ${alert_type} in ${city}`;
    const message = `${alert_type} is ${condition} ${threshold} in ${city}. Current: ${currentTemp}°C`;

    // Save to notification history
    const { error: historyError } = await supabase
      .from('notification_history')
      .insert({
        user_id: user.user_id,
        notification_type: 'weather',
        title,
        message,
        data: {
          city,
          alert_type,
          weather: weatherData,
          alert_id: alert.id
        },
        email_sent: user.email_notifications
      });

    if (historyError) {
      console.error('Error saving notification history:', historyError);
    }

    // Send email if enabled
    if (user.email_notifications) {
      await sendEmail(userEmail, title, message, {
        city,
        temp: currentTemp,
        description,
        feelsLike,
        humidity,
        windSpeed,
        alert_type,
        threshold,
        condition
      });
    }

    console.log(`✅ Notification sent to ${userEmail}`);
  } catch (error) {
    console.error('Error sending weather notification:', error);
  }
}

// Check space weather
async function checkSpaceWeather() {
  try {
    // Fetch NASA space weather data
    const spaceUrl = `https://api.nasa.gov/DONKI/notifications?api_key=${nasaApiKey}&type=all`;
    const response = await fetch(spaceUrl);
    
    if (!response.ok) {
      console.log('⚠️ Could not fetch space weather data');
      return { checked: false };
    }

    const spaceData = await response.json();

    // Get users with space weather alerts enabled
    const { data: alerts, error: alertsError } = await supabase
      .from('space_weather_alerts')
      .select('*')
      .eq('enabled', true);

    if (alertsError || !alerts || alerts.length === 0) {
      return { users_checked: 0, notifications_sent: 0 };
    }

    console.log(`🌌 Checking space weather for ${alerts.length} users`);

    let notificationsSent = 0;

    // Check recent events (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentEvents = spaceData.filter(event => 
      new Date(event.messageIssueTime) > oneDayAgo
    );

    if (recentEvents.length === 0) {
      console.log('✨ No recent space weather events');
      return { users_checked: alerts.length, notifications_sent: 0 };
    }

    // Send notifications to users
    for (const alert of alerts) {
      const shouldNotify = evaluateSpaceWeatherAlert(alert, recentEvents);
      
      if (shouldNotify) {
        await sendSpaceWeatherNotification(alert, recentEvents);
        notificationsSent++;
      }
    }

    return {
      users_checked: alerts.length,
      notifications_sent: notificationsSent,
      events_found: recentEvents.length
    };
  } catch (error) {
    console.error('Error checking space weather:', error);
    return { error: error.message };
  }
}

// Evaluate space weather alert
function evaluateSpaceWeatherAlert(alert, events) {
  const { alert_types, min_severity } = alert;
  const severityLevels = { 'C': 1, 'M': 2, 'X': 3 };
  const minLevel = severityLevels[min_severity];

  return events.some(event => {
    // Check if event type matches user's alert types
    if (!alert_types.includes(event.messageType)) {
      return false;
    }

    // For solar flares, check severity
    if (event.messageType === 'FLR') {
      const eventSeverity = event.messageBody?.match(/[CMX]\d/)?.[0]?.[0];
      if (eventSeverity) {
        const eventLevel = severityLevels[eventSeverity];
        return eventLevel >= minLevel;
      }
    }

    return true;
  });
}

// Send space weather notification
async function sendSpaceWeatherNotification(alert, events) {
  try {
    // Get user email
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(alert.user_id);
    if (authError || !authUser) return;

    const userEmail = authUser.user.email;
    const title = '🌌 Space Weather Alert';
    const eventTypes = [...new Set(events.map(e => e.messageType))].join(', ');
    const message = `Space weather events detected: ${eventTypes}`;

    // Save to notification history
    await supabase
      .from('notification_history')
      .insert({
        user_id: alert.user_id,
        notification_type: 'space_weather',
        title,
        message,
        data: { events },
        email_sent: true
      });

    // Send email
    await sendSpaceWeatherEmail(userEmail, events);

    console.log(`✅ Space weather notification sent to ${userEmail}`);
  } catch (error) {
    console.error('Error sending space weather notification:', error);
  }
}

// Send email via Resend
async function sendEmail(to, subject, message, data) {
  try {
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
          .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 24px; }
          .content { padding: 30px; }
          .alert-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 5px; }
          .weather-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
          .weather-item { background: #f8f9fa; padding: 15px; border-radius: 8px; }
          .weather-item strong { display: block; color: #667eea; margin-bottom: 5px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .btn { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌍 Weather Nexus Alert</h1>
          </div>
          <div class="content">
            <div class="alert-box">
              <h2 style="margin: 0 0 10px 0;">⚠️ ${subject}</h2>
              <p style="margin: 0;">${message}</p>
            </div>
            
            <h3>Current Weather in ${data.city}</h3>
            <div class="weather-grid">
              <div class="weather-item">
                <strong>🌡️ Temperature</strong>
                ${data.temp}°C (Feels like ${data.feelsLike}°C)
              </div>
              <div class="weather-item">
                <strong>💧 Humidity</strong>
                ${data.humidity}%
              </div>
              <div class="weather-item">
                <strong>💨 Wind Speed</strong>
                ${data.windSpeed} m/s
              </div>
              <div class="weather-item">
                <strong>☁️ Condition</strong>
                ${data.description}
              </div>
            </div>
            
            <p>This alert was triggered because <strong>${data.alert_type}</strong> is <strong>${data.condition} ${data.threshold}</strong>.</p>
            
            <a href="https://studentofstars.github.io/Weather-Nexus/" class="btn">View Full Details</a>
          </div>
          <div class="footer">
            <p>Weather Nexus - Automated Weather Monitoring</p>
            <p>You're receiving this because you set up weather alerts</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Weather Nexus <onboarding@resend.dev>',
        to: to,
        subject: subject,
        html: htmlBody,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Email send error:', data);
    }
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// Send space weather email
async function sendSpaceWeatherEmail(to, events) {
  try {
    const eventsList = events.slice(0, 5).map(event => `
      <div style="background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #764ba2;">
        <strong style="color: #667eea;">${event.messageType}</strong> - ${event.messageIssueTime}
        <p style="margin: 10px 0 0 0; color: #666;">${event.messageBody?.substring(0, 200)}...</p>
      </div>
    `).join('');

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
          .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .btn { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🌌 Space Weather Alert</h1>
          </div>
          <div class="content">
            <p>New space weather events have been detected in the last 24 hours:</p>
            ${eventsList}
            <a href="https://studentofstars.github.io/Weather-Nexus/" class="btn">View Space Weather</a>
          </div>
          <div class="footer">
            <p>Weather Nexus - Space Weather Monitoring</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'Weather Nexus <onboarding@resend.dev>',
        to: to,
        subject: '🌌 Space Weather Alert',
        html: htmlBody,
      }),
    });
  } catch (error) {
    console.error('Error sending space weather email:', error);
  }
}
