// ========================================
// API Configuration
// ========================================

// SECURE: API endpoints now point to our serverless functions
// which keep API keys hidden on the server side
const API_CONFIG = {
    // Vercel serverless function URL (update this after deploying to Vercel)
    // For local development, use: http://localhost:3000/api
    // For production, use: https://your-vercel-app.vercel.app/api
    apiBaseUrl: 'https://your-vercel-app.vercel.app/api', // UPDATE THIS!
    
    // For local testing with Vercel CLI (vercel dev):
    // apiBaseUrl: 'http://localhost:3000/api',
};

// Popular cities for suggestions
const POPULAR_CITIES = [
    'Delhi', 'Mumbai', 'Bengaluru', 'Bhubaneshwar', 'Kolkata',
    'Chennai', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur',
    'London', 'New York', 'Paris', 'Tokyo', 'Dubai', 'Sydney',
    'Singapore', 'Hong Kong', 'Los Angeles', 'Chicago', 'Toronto',
    'Shanghai', 'Berlin', 'Rome', 'Madrid', 'Amsterdam',
    'Bangkok', 'Seoul', 'Moscow', 'Istanbul', 'São Paulo', 'Mexico City'
];

// ========================================
// DOM Elements
// ========================================

const elements = {
    // Navigation
    navLinks: document.querySelectorAll('.nav-link'),
    sections: document.querySelectorAll('.weather-section'),
    
    // Earth Weather
    cityInput: document.getElementById('city-input'),
    searchBtn: document.getElementById('search-btn'),
    earthWeatherData: document.getElementById('earth-weather-data'),
    earthLoading: document.getElementById('earth-loading'),
    earthError: document.getElementById('earth-error'),
    
    // Space Weather
    daysSelect: document.getElementById('days-select'),
    fetchSpaceBtn: document.getElementById('fetch-space-btn'),
    spaceWeatherData: document.getElementById('space-weather-data'),
    spaceLoading: document.getElementById('space-loading'),
    spaceError: document.getElementById('space-error'),
};

// ========================================
// Chart Variables
// ========================================

let tempChart = null;
let spaceChart = null;

// ========================================
// Navigation Logic
// ========================================

function initNavigation() {
    elements.navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = link.dataset.section;
            
            // Update active link
            elements.navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            // Update active section
            elements.sections.forEach(section => {
                if (section.id === targetSection) {
                    section.classList.add('active');
                } else {
                    section.classList.remove('active');
                }
            });
        });
    });
}

// ========================================
// Earth Weather Functions
// ========================================

async function fetchEarthWeather(city) {
    try {
        showLoading('earth');
        
        // Call our secure serverless function instead of OpenWeatherMap directly
        const url = `${API_CONFIG.apiBaseUrl}/weather?q=${encodeURIComponent(city)}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'City not found');
        }
        
        const data = await response.json();
        displayEarthWeather(data);
        hideLoading('earth');
        showRefreshIndicator('earth');
        
    } catch (error) {
        showError('earth', error.message);
    }
}

function displayEarthWeather(data) {
    // Update location info
    document.getElementById('location-name').textContent = data.name;
    document.getElementById('location-country').textContent = data.sys.country;
    document.getElementById('weather-description').textContent = data.weather[0].description;
    
    // Update weather icon with animation
    const iconCode = data.weather[0].icon;
    const weatherIcon = getWeatherIcon(data.weather[0].main);
    const iconEl = document.getElementById('weather-icon');
    iconEl.style.transform = 'scale(0)';
    iconEl.textContent = weatherIcon;
    setTimeout(() => {
        iconEl.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        iconEl.style.transform = 'scale(1)';
    }, 100);
    
    // Update metrics with count-up animation
    animateValue('temperature', 0, Math.round(data.main.temp), 1000, '°C');
    animateValue('humidity', 0, data.main.humidity, 1000, '%');
    animateValue('wind-speed', 0, data.wind.speed, 1000, ' m/s');
    animateValue('pressure', 0, data.main.pressure, 1000, ' hPa');
    
    document.getElementById('feels-like').textContent = `Feels like ${Math.round(data.main.feels_like)}°C`;
    
    // Update additional info
    document.getElementById('visibility').textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    document.getElementById('cloudiness').textContent = `${data.clouds.all}%`;
    
    // Generate and display insights
    const insights = analyzeWeather(data);
    displayInsights(insights, 'insights-list');
    
    // Create temperature trend chart
    createTemperatureChart(data);
    
    // Show weather data
    elements.earthWeatherData.classList.remove('hidden');
}

// Animate number count-up effect
function animateValue(id, start, end, duration, suffix = '') {
    const element = document.getElementById(id);
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        
        if (suffix === '°C' || suffix === ' hPa') {
            element.textContent = Math.round(current) + suffix;
        } else {
            element.textContent = current.toFixed(1) + suffix;
        }
    }, 16);
}

// Create interactive temperature chart
function createTemperatureChart(data) {
    const ctx = document.getElementById('temp-chart');
    
    if (!ctx) return;
    
    // Destroy existing chart
    if (tempChart) {
        tempChart.destroy();
    }
    
    // Generate mock hourly data based on current conditions
    const hours = [];
    const temps = [];
    const currentTemp = data.main.temp;
    const currentHour = new Date().getHours();
    
    for (let i = -6; i <= 6; i++) {
        const hour = (currentHour + i + 24) % 24;
        hours.push(`${hour}:00`);
        
        // Simulate temperature variation
        const variation = Math.sin(i * Math.PI / 6) * 3 + (Math.random() - 0.5) * 2;
        temps.push(currentTemp + variation);
    }
    
    tempChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: hours,
            datasets: [{
                label: 'Temperature (°C)',
                data: temps,
                borderColor: 'rgba(0, 122, 255, 1)',
                backgroundColor: 'rgba(0, 122, 255, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: 'rgba(0, 122, 255, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 1,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y.toFixed(1)}°C`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        callback: function(value) {
                            return value.toFixed(0) + '°C';
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index',
            },
            animation: {
                duration: 1500,
                easing: 'easeInOutQuart'
            }
        }
    });
}

function getWeatherIcon(condition) {
    const icons = {
        'Clear': '☀️',
        'Clouds': '☁️',
        'Rain': '🌧️',
        'Drizzle': '🌦️',
        'Thunderstorm': '⛈️',
        'Snow': '❄️',
        'Mist': '🌫️',
        'Fog': '🌫️',
        'Haze': '🌫️',
    };
    return icons[condition] || '🌤️';
}

function analyzeWeather(data) {
    const insights = [];
    const temp = data.main.temp;
    const humidity = data.main.humidity;
    const windSpeed = data.wind.speed;
    const pressure = data.main.pressure;
    
    // Temperature analysis
    if (temp > 35) {
        insights.push('⚠️ Extreme heat warning! Stay hydrated and avoid outdoor activities.');
    } else if (temp > 25) {
        insights.push('☀️ Warm weather. Light clothing recommended.');
    } else if (temp < 0) {
        insights.push('❄️ Freezing temperatures. Dress warmly!');
    } else if (temp < 10) {
        insights.push('🧥 Cold weather. Wear warm clothing.');
    } else {
        insights.push('🌤️ Pleasant temperature conditions.');
    }
    
    // Humidity analysis
    if (humidity > 80) {
        insights.push('💧 High humidity levels. May feel uncomfortable.');
    } else if (humidity < 30) {
        insights.push('🏜️ Low humidity. Keep yourself hydrated.');
    }
    
    // Wind analysis
    if (windSpeed > 15) {
        insights.push('💨 Strong winds detected. Secure loose objects.');
    } else if (windSpeed < 5) {
        insights.push('🍃 Calm wind conditions.');
    }
    
    // Pressure analysis
    if (pressure < 1000) {
        insights.push('🌧️ Low pressure system. Rain likely.');
    } else if (pressure > 1020) {
        insights.push('☀️ High pressure system. Clear skies expected.');
    }
    
    return insights;
}

function displayInsights(insights, elementId) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    
    insights.forEach((insight, index) => {
        const insightEl = document.createElement('div');
        insightEl.className = 'insight-item';
        insightEl.textContent = insight;
        insightEl.style.animationDelay = `${index * 0.1}s`;
        container.appendChild(insightEl);
    });
}

// ========================================
// Space Weather Functions
// ========================================

async function fetchSpaceWeather(days = 30) {
    try {
        showLoading('space');
        
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        const formatDate = (date) => date.toISOString().split('T')[0];
        
        // Fetch different types of space weather events
        // Call our secure serverless function instead of NASA DONKI directly
        const eventTypes = ['CME', 'GST', 'FLR'];
        const promises = eventTypes.map(type => 
            fetch(`${API_CONFIG.apiBaseUrl}/space-weather?type=${type}&startDate=${formatDate(startDate)}&endDate=${formatDate(endDate)}`)
                .then(res => res.ok ? res.json() : [])
                .then(data => data.map(item => ({ ...item, eventType: type })))
                .catch(() => [])
        );
        
        const results = await Promise.all(promises);
        const allEvents = results.flat();
        
        displaySpaceWeather(allEvents);
        hideLoading('space');
        showRefreshIndicator('space');
        
    } catch (error) {
        showError('space', 'Unable to fetch space weather data. Please try again.');
    }
}

function displaySpaceWeather(events) {
    // Count events by type
    const flrCount = events.filter(e => e.eventType === 'FLR').length;
    const cmeCount = events.filter(e => e.eventType === 'CME').length;
    const gstCount = events.filter(e => e.eventType === 'GST').length;
    
    // Update counts with animation
    animateValue('flare-count', 0, flrCount, 1000);
    animateValue('cme-count', 0, cmeCount, 1000);
    animateValue('gst-count', 0, gstCount, 1000);
    
    // Generate and display insights
    const insights = analyzeSpaceWeather(events, flrCount, cmeCount, gstCount);
    displayInsights(insights, 'space-insights-list');
    
    // Display recent events
    displayEvents(events.slice(0, 20));
    
    // Create space weather chart
    createSpaceWeatherChart(events);
    
    // Show space weather data
    elements.spaceWeatherData.classList.remove('hidden');
}

// Create interactive space weather activity chart
function createSpaceWeatherChart(events) {
    const ctx = document.getElementById('space-chart');
    
    if (!ctx) return;
    
    // Destroy existing chart
    if (spaceChart) {
        spaceChart.destroy();
    }
    
    // Group events by date
    const eventsByDate = {};
    events.forEach(event => {
        const dateStr = extractEventTime(event).substring(0, 10);
        if (!eventsByDate[dateStr]) {
            eventsByDate[dateStr] = { FLR: 0, CME: 0, GST: 0 };
        }
        eventsByDate[dateStr][event.eventType]++;
    });
    
    // Sort dates and prepare data
    const dates = Object.keys(eventsByDate).sort();
    const flrData = dates.map(date => eventsByDate[date].FLR);
    const cmeData = dates.map(date => eventsByDate[date].CME);
    const gstData = dates.map(date => eventsByDate[date].GST);
    
    // Format dates for display
    const labels = dates.map(date => {
        const d = new Date(date);
        return `${d.getMonth() + 1}/${d.getDate()}`;
    });
    
    spaceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Solar Flares',
                    data: flrData,
                    backgroundColor: 'rgba(255, 215, 0, 0.7)',
                    borderColor: 'rgba(255, 215, 0, 1)',
                    borderWidth: 2,
                },
                {
                    label: 'CME Events',
                    data: cmeData,
                    backgroundColor: 'rgba(255, 99, 71, 0.7)',
                    borderColor: 'rgba(255, 99, 71, 1)',
                    borderWidth: 2,
                },
                {
                    label: 'Geomagnetic Storms',
                    data: gstData,
                    backgroundColor: 'rgba(0, 206, 209, 0.7)',
                    borderColor: 'rgba(0, 206, 209, 1)',
                    borderWidth: 2,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        color: 'rgba(255, 255, 255, 0.9)',
                        padding: 15,
                        font: {
                            size: 12,
                            weight: '500'
                        },
                        usePointStyle: true,
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 1,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.parsed.y} events`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    stacked: false,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                        stepSize: 1,
                    }
                },
                x: {
                    stacked: false,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)',
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index',
            },
            animation: {
                duration: 1500,
                easing: 'easeInOutQuart'
            }
        }
    });
}

function analyzeSpaceWeather(events, flrCount, cmeCount, gstCount) {
    const insights = [];
    
    if (events.length === 0) {
        insights.push('✅ No significant space weather events detected in the selected period.');
        return insights;
    }
    
    if (flrCount > 0) {
        insights.push(`⚡ ${flrCount} Solar Flare(s) observed. May impact radio communications.`);
    }
    
    if (cmeCount > 0) {
        insights.push(`💥 ${cmeCount} Coronal Mass Ejection(s) detected. May affect satellites and communications.`);
    }
    
    if (gstCount > 0) {
        insights.push(`🌐 ${gstCount} Geomagnetic Storm(s) reported. Possible aurora activity and GPS disruptions.`);
    }
    
    const totalEvents = flrCount + cmeCount + gstCount;
    if (totalEvents > 10) {
        insights.push('⚠️ High solar activity period. Monitor space weather closely.');
    } else if (totalEvents > 5) {
        insights.push('📊 Moderate solar activity detected.');
    } else {
        insights.push('✨ Low to normal space weather conditions.');
    }
    
    return insights;
}

function displayEvents(events) {
    const container = document.getElementById('events-list');
    container.innerHTML = '';
    
    if (events.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 2rem;">No recent events found.</p>';
        return;
    }
    
    events.forEach((event, index) => {
        const eventEl = document.createElement('div');
        eventEl.className = `event-item ${event.eventType}`;
        eventEl.style.animationDelay = `${index * 0.05}s`;
        
        const eventTime = extractEventTime(event);
        
        eventEl.innerHTML = `
            <div class="event-header">
                <span class="event-type ${event.eventType}">${getEventTypeName(event.eventType)}</span>
                <span class="event-time">${eventTime}</span>
            </div>
        `;
        
        container.appendChild(eventEl);
    });
}

function getEventTypeName(type) {
    const names = {
        'FLR': 'Solar Flare',
        'CME': 'CME Event',
        'GST': 'Geomagnetic Storm'
    };
    return names[type] || type;
}

function extractEventTime(event) {
    const timeStr = event.beginTime || event.startTime || event.activityID || '';
    if (timeStr.length > 19) {
        return timeStr.substring(0, 19).replace('T', ' ');
    }
    return timeStr.substring(0, 10) || 'Unknown';
}

// ========================================
// UI State Management
// ========================================

function showLoading(type) {
    if (type === 'earth') {
        elements.earthWeatherData.classList.add('hidden');
        elements.earthError.classList.add('hidden');
        elements.earthLoading.classList.remove('hidden');
    } else {
        elements.spaceWeatherData.classList.add('hidden');
        elements.spaceError.classList.add('hidden');
        elements.spaceLoading.classList.remove('hidden');
    }
}

function hideLoading(type) {
    if (type === 'earth') {
        elements.earthLoading.classList.add('hidden');
    } else {
        elements.spaceLoading.classList.add('hidden');
    }
}

function showError(type, message) {
    if (type === 'earth') {
        elements.earthLoading.classList.add('hidden');
        elements.earthWeatherData.classList.add('hidden');
        document.getElementById('earth-error-message').textContent = message;
        elements.earthError.classList.remove('hidden');
    } else {
        elements.spaceLoading.classList.add('hidden');
        elements.spaceWeatherData.classList.add('hidden');
        document.getElementById('space-error-message').textContent = message;
        elements.spaceError.classList.remove('hidden');
    }
}

// ========================================
// Event Listeners
// ========================================

function initEventListeners() {
    // Earth weather search
    elements.searchBtn.addEventListener('click', () => {
        const city = elements.cityInput.value.trim();
        if (city) {
            fetchEarthWeather(city);
        }
    });
    
    elements.cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const city = elements.cityInput.value.trim();
            if (city) {
                fetchEarthWeather(city);
            }
        }
    });
    
    // Add input focus animation
    elements.cityInput.addEventListener('focus', function() {
        this.parentElement.parentElement.style.transform = 'scale(1.02)';
        this.parentElement.parentElement.style.boxShadow = '0 12px 40px 0 rgba(0, 122, 255, 0.3)';
    });
    
    elements.cityInput.addEventListener('blur', function() {
        this.parentElement.parentElement.style.transform = 'scale(1)';
        this.parentElement.parentElement.style.boxShadow = '';
    });
    
    // Space weather fetch
    elements.fetchSpaceBtn.addEventListener('click', () => {
        const days = parseInt(elements.daysSelect.value);
        fetchSpaceWeather(days);
    });
    
    // Add hover effects to metric cards
    document.querySelectorAll('.metric-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
    
    // Add click animation to buttons
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.5);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + K: Focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            elements.cityInput.focus();
            elements.cityInput.select();
        }
        
        // Ctrl/Cmd + R: Refresh current section
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            const activeSection = document.querySelector('.weather-section.active');
            if (activeSection && activeSection.id === 'earth') {
                const city = elements.cityInput.value.trim();
                if (city) fetchEarthWeather(city);
            } else if (activeSection && activeSection.id === 'space') {
                const days = parseInt(elements.daysSelect.value);
                fetchSpaceWeather(days);
            }
        }
        
        // Tab switching with numbers
        if (e.key === '1' && !e.target.matches('input, textarea')) {
            document.querySelector('[data-section="earth"]').click();
        }
        if (e.key === '2' && !e.target.matches('input, textarea')) {
            document.querySelector('[data-section="space"]').click();
        }
    });
    
    // Double-click metrics to copy value
    document.addEventListener('dblclick', function(e) {
        if (e.target.closest('.metric-value, .summary-value')) {
            const text = e.target.textContent;
            navigator.clipboard.writeText(text).then(() => {
                // Show copied feedback
                const original = e.target.textContent;
                e.target.textContent = '✓ Copied!';
                e.target.style.color = '#4CAF50';
                setTimeout(() => {
                    e.target.textContent = original;
                    e.target.style.color = '';
                }, 1000);
            });
        }
    });
}

// Add ripple animation to CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ========================================
// Initialization
// ========================================

function init() {
    initNavigation();
    initEventListeners();
    initClock();
    initQuickActions();
    initSearchSuggestions();
    initShortcutsOverlay();
    initAboutModals();
    createParticles();
    
    // Fetch default Earth weather (London)
    fetchEarthWeather('London');
}

// Real-time clock
function initClock() {
    function updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', { 
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        const earthClock = document.getElementById('live-time');
        const spaceClock = document.getElementById('live-time-space');
        
        if (earthClock) earthClock.textContent = timeString;
        if (spaceClock) spaceClock.textContent = timeString;
    }
    
    updateClock();
    setInterval(updateClock, 1000);
}

// Quick city actions
function initQuickActions() {
    const quickBtns = document.querySelectorAll('.quick-action-btn');
    quickBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const city = this.dataset.city;
            document.getElementById('city-input').value = city;
            fetchEarthWeather(city);
            
            // Visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
        });
    });
}

// Search suggestions with fuzzy matching
function initSearchSuggestions() {
    const input = document.getElementById('city-input');
    const suggestionsDiv = document.getElementById('search-suggestions');
    
    if (!input || !suggestionsDiv) return;
    
    input.addEventListener('input', function() {
        const query = this.value.trim().toLowerCase();
        
        if (query.length < 2) {
            suggestionsDiv.classList.remove('active');
            return;
        }
        
        // Filter cities
        const matches = POPULAR_CITIES.filter(city => 
            city.toLowerCase().includes(query)
        ).slice(0, 5);
        
        if (matches.length > 0) {
            suggestionsDiv.innerHTML = matches.map(city => 
                `<div class="suggestion-item" data-city="${city}">${city}</div>`
            ).join('');
            suggestionsDiv.classList.add('active');
            
            // Add click handlers
            suggestionsDiv.querySelectorAll('.suggestion-item').forEach(item => {
                item.addEventListener('click', function() {
                    const city = this.dataset.city;
                    input.value = city;
                    suggestionsDiv.classList.remove('active');
                    fetchEarthWeather(city);
                });
            });
        } else {
            suggestionsDiv.classList.remove('active');
        }
    });
    
    // Close suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (!input.contains(e.target) && !suggestionsDiv.contains(e.target)) {
            suggestionsDiv.classList.remove('active');
        }
    });
}

// Create floating particles effect
function createParticles() {
    const particleCount = 30;
    const sections = document.querySelectorAll('.weather-section');
    
    sections.forEach(section => {
        const container = document.createElement('div');
        container.className = 'particles';
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 15 + 's';
            particle.style.animationDuration = (15 + Math.random() * 10) + 's';
            container.appendChild(particle);
        }
        
        section.appendChild(container);
    });
}

// Show refresh indicator
function showRefreshIndicator(type) {
    const indicator = document.getElementById(`${type}-refresh`);
    if (indicator) {
        indicator.classList.add('active');
        setTimeout(() => {
            indicator.classList.remove('active');
        }, 3000);
    }
}

// Initialize shortcuts overlay
function initShortcutsOverlay() {
    const helpBtn = document.getElementById('helpBtn');
    const overlay = document.getElementById('shortcutsOverlay');
    const closeBtn = document.getElementById('closeShortcuts');
    
    if (helpBtn && overlay && closeBtn) {
        helpBtn.addEventListener('click', () => {
            overlay.classList.add('show');
        });
        
        closeBtn.addEventListener('click', () => {
            overlay.classList.remove('show');
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('show');
            }
        });
        
        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay.classList.contains('show')) {
                overlay.classList.remove('show');
            }
        });
    }
}

// Initialize About modals
function initAboutModals() {
    // Earth Weather About
    const aboutEarthBtn = document.getElementById('about-earth-btn');
    const aboutEarthOverlay = document.getElementById('aboutEarthOverlay');
    const closeAboutEarth = document.getElementById('closeAboutEarth');
    
    if (aboutEarthBtn && aboutEarthOverlay && closeAboutEarth) {
        aboutEarthBtn.addEventListener('click', () => {
            aboutEarthOverlay.classList.add('show');
        });
        
        closeAboutEarth.addEventListener('click', () => {
            aboutEarthOverlay.classList.remove('show');
        });
        
        aboutEarthOverlay.addEventListener('click', (e) => {
            if (e.target === aboutEarthOverlay) {
                aboutEarthOverlay.classList.remove('show');
            }
        });
    }
    
    // Space Weather About
    const aboutSpaceBtn = document.getElementById('about-space-btn');
    const aboutSpaceOverlay = document.getElementById('aboutSpaceOverlay');
    const closeAboutSpace = document.getElementById('closeAboutSpace');
    
    if (aboutSpaceBtn && aboutSpaceOverlay && closeAboutSpace) {
        aboutSpaceBtn.addEventListener('click', () => {
            aboutSpaceOverlay.classList.add('show');
        });
        
        closeAboutSpace.addEventListener('click', () => {
            aboutSpaceOverlay.classList.remove('show');
        });
        
        aboutSpaceOverlay.addEventListener('click', (e) => {
            if (e.target === aboutSpaceOverlay) {
                aboutSpaceOverlay.classList.remove('show');
            }
        });
    }
    
    // Escape key to close both About modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (aboutEarthOverlay && aboutEarthOverlay.classList.contains('show')) {
                aboutEarthOverlay.classList.remove('show');
            }
            if (aboutSpaceOverlay && aboutSpaceOverlay.classList.contains('show')) {
                aboutSpaceOverlay.classList.remove('show');
            }
        }
    });
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
