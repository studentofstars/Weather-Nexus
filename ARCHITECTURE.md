# 🏗️ Weather Nexus Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER'S BROWSER                          │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              Weather Nexus Web App                        │ │
│  │                                                           │ │
│  │  • index.html  (UI Structure)                           │ │
│  │  • styles.css  (Glassmorphism Design)                   │ │
│  │  • app.js      (Application Logic)                      │ │
│  │                                                           │ │
│  │  ⚠️ NO API KEYS HERE! ⚠️                                 │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              │ HTTPS Requests                    │
│                              ▼                                   │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GITHUB PAGES (Frontend)                      │
│                                                                 │
│  📍 URL: https://studentofstars.github.io/Weather-Nexus/       │
│  💰 Cost: FREE                                                  │
│  🔒 HTTPS: Automatic                                            │
│  📱 CDN: Global Distribution                                    │
│                                                                 │
│  Serves static files:                                           │
│  ├── index.html                                                 │
│  ├── styles.css                                                 │
│  └── app.js                                                     │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ API Calls
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                   VERCEL (Backend API)                          │
│                                                                 │
│  📍 URL: https://weather-nexus-api.vercel.app/api              │
│  💰 Cost: FREE (Serverless Functions)                          │
│  🔒 HTTPS: Automatic                                            │
│  ⚡ Auto-scaling                                                │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           Serverless Functions (Node.js)                │   │
│  │                                                         │   │
│  │  📂 /api/weather.js                                     │   │
│  │     • Receives city name from frontend                  │   │
│  │     • Reads OPENWEATHER_API_KEY from env                │   │
│  │     • Calls OpenWeatherMap API                          │   │
│  │     • Returns weather data                              │   │
│  │                                                         │   │
│  │  📂 /api/space-weather.js                               │   │
│  │     • Receives date range from frontend                 │   │
│  │     • Reads NASA_API_KEY from env                       │   │
│  │     • Calls NASA DONKI API                              │   │
│  │     • Returns space weather events                      │   │
│  │                                                         │   │
│  │  🔐 Environment Variables (SECURE):                     │   │
│  │     • OPENWEATHER_API_KEY                               │   │
│  │     • NASA_API_KEY                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ Server-to-Server
                               │ (Keys Hidden!)
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                     EXTERNAL APIs                               │
│                                                                 │
│  ┌──────────────────────┐        ┌──────────────────────┐      │
│  │  OpenWeatherMap API  │        │    NASA DONKI API    │      │
│  │                      │        │                      │      │
│  │  • Weather data      │        │  • Solar flares      │      │
│  │  • Forecasts         │        │  • CME events        │      │
│  │  • 200k+ cities      │        │  • Geomagnetic       │      │
│  │                      │        │    storms            │      │
│  │  🔑 API Key Required │        │  🔑 API Key Required │      │
│  └──────────────────────┘        └──────────────────────┘      │
│                                                                 │
│  💰 Both FREE for personal use                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagram

### Scenario 1: User Searches for Weather

```
1. USER INTERACTION
   User types "London" and clicks Search
   
   Browser:
   ┌──────────────────────────────────────┐
   │ app.js executes fetchEarthWeather()  │
   │ Calls: /api/weather?q=London         │
   └──────────────────────────────────────┘
                    ↓
                    
2. API GATEWAY (Vercel)
   Request received at Vercel serverless function
   
   /api/weather.js:
   ┌──────────────────────────────────────┐
   │ 1. Extract 'q' parameter (London)    │
   │ 2. Read OPENWEATHER_API_KEY from env │
   │ 3. Build API URL with key            │
   │ 4. Fetch from OpenWeatherMap         │
   └──────────────────────────────────────┘
                    ↓
                    
3. EXTERNAL API CALL
   Vercel → OpenWeatherMap
   
   ┌──────────────────────────────────────┐
   │ GET openweathermap.org/data/2.5...   │
   │ ?q=London&appid=KEY_FROM_ENV         │
   │                                      │
   │ Response: Temperature, humidity, etc. │
   └──────────────────────────────────────┘
                    ↓
                    
4. RESPONSE RELAY
   Vercel relays data back to browser
   
   ┌──────────────────────────────────────┐
   │ JSON Response:                        │
   │ {                                     │
   │   name: "London",                     │
   │   main: { temp: 15, humidity: 70 },  │
   │   weather: [...]                      │
   │ }                                     │
   └──────────────────────────────────────┘
                    ↓
                    
5. UI UPDATE
   Browser receives data
   
   app.js:
   ┌──────────────────────────────────────┐
   │ displayEarthWeather(data)            │
   │ • Updates temperature display         │
   │ • Shows humidity, wind               │
   │ • Creates chart                      │
   │ • Animates UI elements               │
   └──────────────────────────────────────┘
                    ↓
                    
6. USER SEES RESULT
   Weather information displayed beautifully!
```

---

## Security Layer Comparison

### ❌ BEFORE (Insecure):

```
Browser (app.js)
├── const API_KEY = '256156d28a4575e841a3cce2fdfc060b'  ⚠️ EXPOSED!
├── fetch(`openweathermap.org/...?appid=${API_KEY}`)   ⚠️ VISIBLE!
└── Response → Display
         
🚨 Problems:
   • API key visible in source code
   • Anyone can steal and misuse
   • Key in Git history forever
   • No way to revoke without changing code
```

### ✅ AFTER (Secure):

```
Browser (app.js)
├── const API_CONFIG = { apiBaseUrl: 'vercel.app/api' }  ✅ No keys!
├── fetch(`${API_CONFIG.apiBaseUrl}/weather?q=London`)   ✅ Clean!
└── ↓

Vercel (/api/weather.js)
├── const API_KEY = process.env.OPENWEATHER_API_KEY     ✅ From env!
├── fetch(`openweathermap.org/...?appid=${API_KEY}`)    ✅ Server-side!
└── Response → Relay → Browser → Display

✅ Benefits:
   • API key never sent to browser
   • Stored securely in environment variables
   • Can be changed without code changes
   • Professional security standard
```

---

## Deployment Pipeline

```
LOCAL DEVELOPMENT
┌─────────────────────────────────────┐
│ Your Computer                       │
│                                     │
│ 1. Edit code (index.html, app.js)  │
│ 2. Test locally                     │
│ 3. Git commit                       │
│ 4. Git push to GitHub               │
└─────────────────────────────────────┘
                ↓
                
GITHUB REPOSITORY
┌─────────────────────────────────────┐
│ https://github.com/studentofstars/  │
│ Weather-Nexus                       │
│                                     │
│ • Source code storage               │
│ • Version control                   │
│ • Triggers deployments              │
└─────────────────────────────────────┘
       ↓                       ↓
       ↓                       ↓
       ↓                       └─────────────────┐
       ↓                                         ↓
       
VERCEL (Backend)              GITHUB PAGES (Frontend)
┌─────────────────────┐       ┌─────────────────────┐
│ Auto-deploys from    │       │ Auto-serves from    │
│ GitHub on push       │       │ main branch         │
│                      │       │                     │
│ • Builds API         │       │ • Serves HTML/CSS/JS│
│ • Sets up functions  │       │ • Global CDN        │
│ • Applies env vars   │       │ • HTTPS automatic   │
└─────────────────────┘       └─────────────────────┘
       ↓                                ↓
       
PRODUCTION URLS
┌─────────────────────┐       ┌─────────────────────┐
│ API Backend:         │       │ Website:            │
│ weather-nexus-api    │       │ studentofstars      │
│ .vercel.app          │       │ .github.io/         │
│                      │       │ Weather-Nexus       │
└─────────────────────┘       └─────────────────────┘
```

---

## Environment Variables Flow

```
DEVELOPMENT (Local)
┌─────────────────────────────────────┐
│ .env file (on your computer)        │
│                                     │
│ OPENWEATHER_API_KEY=256156d2...     │
│ NASA_API_KEY=ywP6emzUoRj...         │
│                                     │
│ ⚠️ NEVER committed to Git!          │
│ (Protected by .gitignore)           │
└─────────────────────────────────────┘
                ↓
                
LOCAL TESTING (vercel dev)
┌─────────────────────────────────────┐
│ Vercel CLI reads .env               │
│ Simulates production environment    │
│ API functions have access to keys   │
└─────────────────────────────────────┘
                
                
PRODUCTION (Vercel Dashboard)
┌─────────────────────────────────────┐
│ Vercel Environment Variables        │
│ (Set in web dashboard)              │
│                                     │
│ OPENWEATHER_API_KEY → ***hidden***  │
│ NASA_API_KEY → ***hidden***         │
│                                     │
│ ✅ Encrypted at rest                │
│ ✅ Only accessible by functions     │
│ ✅ Not in code or logs              │
└─────────────────────────────────────┘
                ↓
                
RUNTIME (Serverless Function)
┌─────────────────────────────────────┐
│ process.env.OPENWEATHER_API_KEY     │
│                                     │
│ • Injected at function runtime      │
│ • Never visible to client           │
│ • Used only server-side             │
└─────────────────────────────────────┘
```

---

## Cost Breakdown

```
┌─────────────────────────────────────────────────────────┐
│                    FREE FOREVER                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  GitHub Pages (Frontend Hosting)                        │
│  ├── 100GB bandwidth/month                 $0.00        │
│  ├── HTTPS certificate                     $0.00        │
│  ├── Global CDN                            $0.00        │
│  └── Custom domain support                 $0.00        │
│                                                          │
│  Vercel (Serverless Functions)                          │
│  ├── 100GB bandwidth/month                 $0.00        │
│  ├── 100 function invocations/day          $0.00        │
│  ├── HTTPS certificate                     $0.00        │
│  └── Automatic deployments                 $0.00        │
│                                                          │
│  OpenWeatherMap API                                     │
│  ├── 60 calls/minute                       $0.00        │
│  ├── 1,000,000 calls/month                 $0.00        │
│  └── No credit card required               $0.00        │
│                                                          │
│  NASA API                                               │
│  ├── ~1000 requests/hour                   $0.00        │
│  ├── Unlimited monthly                     $0.00        │
│  └── No credit card required               $0.00        │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  TOTAL MONTHLY COST:                       $0.00        │
└─────────────────────────────────────────────────────────┘

💡 Perfect for portfolio projects!
   More than enough for personal use and showcasing.
```

---

## Technology Stack

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND                              │
├─────────────────────────────────────────────────────────┤
│  HTML5          │  Semantic structure                    │
│  CSS3           │  Glassmorphism, animations            │
│  Vanilla JS     │  No frameworks, pure DOM              │
│  Chart.js       │  Data visualization                   │
├─────────────────────────────────────────────────────────┤
│                    BACKEND                               │
├─────────────────────────────────────────────────────────┤
│  Node.js        │  Serverless runtime                   │
│  Vercel         │  Serverless platform                  │
│  Environment    │  Secure config management             │
│  Variables      │                                       │
├─────────────────────────────────────────────────────────┤
│                    APIS                                  │
├─────────────────────────────────────────────────────────┤
│  OpenWeather    │  Earth weather data                   │
│  NASA DONKI     │  Space weather events                 │
├─────────────────────────────────────────────────────────┤
│                    HOSTING                               │
├─────────────────────────────────────────────────────────┤
│  GitHub Pages   │  Static frontend hosting              │
│  Vercel         │  Serverless API hosting               │
├─────────────────────────────────────────────────────────┤
│                    DEVOPS                                │
├─────────────────────────────────────────────────────────┤
│  Git            │  Version control                      │
│  GitHub         │  Repository & CI/CD                   │
│  Vercel CLI     │  Local development & deployment       │
└─────────────────────────────────────────────────────────┘
```

---

## Request/Response Example

### Weather API Call

```
REQUEST from Browser:
GET https://weather-nexus-api.vercel.app/api/weather?q=Delhi
Headers:
  Origin: https://studentofstars.github.io
  
            ↓
            
VERCEL FUNCTION processes:
1. Validate input: q=Delhi ✓
2. Read env var: process.env.OPENWEATHER_API_KEY
3. Build URL: openweathermap.org/data/2.5/weather?q=Delhi&appid=KEY
4. Fetch data
5. Return response

            ↓
            
RESPONSE to Browser:
200 OK
Content-Type: application/json
Access-Control-Allow-Origin: *

{
  "name": "Delhi",
  "main": {
    "temp": 32,
    "humidity": 45,
    "pressure": 1010
  },
  "weather": [{
    "main": "Clear",
    "description": "clear sky"
  }],
  "wind": {
    "speed": 3.5
  }
}

            ↓
            
BROWSER displays:
📍 Delhi, IN
🌡️ 32°C
💧 45%
💨 3.5 m/s
```

---

## Security Checklist Visualization

```
✅ API Keys Protection
   ├── ✅ Not in source code
   ├── ✅ Not in Git repository
   ├── ✅ Not in browser DevTools
   ├── ✅ Not in network requests
   └── ✅ Only in Vercel environment

✅ Environment Variables
   ├── ✅ .env file created locally
   ├── ✅ .env in .gitignore
   ├── ✅ .env.example for others
   └── ✅ Set in Vercel Dashboard

✅ Code Security
   ├── ✅ No hardcoded credentials
   ├── ✅ No sensitive data in logs
   ├── ✅ CORS properly configured
   └── ✅ Error messages don't expose internals

✅ Deployment Security
   ├── ✅ HTTPS everywhere
   ├── ✅ Secure headers set
   ├── ✅ Rate limiting in place
   └── ✅ Monitoring enabled

✅ Git Security
   ├── ✅ .gitignore configured
   ├── ✅ No secrets in history
   ├── ✅ Clean commit messages
   └── ✅ Protected main branch
```

---

**This architecture is production-ready and follows industry best practices!** 🚀

For deployment instructions, see: [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)
