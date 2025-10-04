# 🚀 Weather Nexus - Quick Start

## ⚡ For Developers

### Local Development

```powershell
# Clone repository
git clone https://github.com/studentofstars/Weather-Nexus.git
cd Weather-Nexus

# Start local server (choose one):
python -m http.server 8080
# or
py -m http.server 8080
# or
npx http-server -p 8080

# Open browser: http://localhost:8080
```

### Test with Vercel Dev (Recommended)

```powershell
# Install Vercel CLI
npm install -g vercel

# Create .env file (copy from .env.example)
copy .env.example .env
# Edit .env and add your API keys

# Run local Vercel environment
vercel dev

# App runs at: http://localhost:3000
```

## 🔐 Environment Setup

### 1. Create `.env` file

```bash
OPENWEATHER_API_KEY=your_key_here
NASA_API_KEY=your_key_here
```

### 2. Get API Keys (Free)

- **OpenWeatherMap**: https://openweathermap.org/api
  - Sign up → API keys → Copy key
  - Free tier: 60 calls/min, 1M calls/month
  
- **NASA**: https://api.nasa.gov/
  - Sign up → Copy API key
  - Free tier: ~1000 requests/hour

## 📂 Project Files

### Essential Files (Must have):
- ✅ `index.html` - Main page
- ✅ `styles.css` - All styling
- ✅ `app.js` - All functionality
- ✅ `api/weather.js` - Weather API proxy
- ✅ `api/space-weather.js` - Space weather API proxy
- ✅ `vercel.json` - Vercel config
- ✅ `.gitignore` - Git ignore rules
- ✅ `.env.example` - Environment template

### Documentation:
- 📖 `README.md` - Main documentation
- 📚 `DEPLOYMENT-GUIDE.md` - Step-by-step deployment

### Optional (Can delete):
- ❌ `weather_app.py` - Old Streamlit version
- ❌ `requirements.txt` - Python dependencies (not needed)
- ❌ `.streamlit/` - Streamlit config (not needed)
- ❌ `start-server.bat` - Local batch script
- ❌ `*.md` files (except README and DEPLOYMENT-GUIDE)

## 🚀 Deployment Checklist

### Before Deploying:

- [ ] API keys obtained (OpenWeatherMap + NASA)
- [ ] `.env` file created (for local testing)
- [ ] `.env` added to `.gitignore` (security!)
- [ ] Tested locally with `vercel dev`
- [ ] GitHub repository created

### Deploy Backend (Vercel):

- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] Environment variables added in Vercel Dashboard:
  - `OPENWEATHER_API_KEY`
  - `NASA_API_KEY`
- [ ] Deployment successful
- [ ] API endpoints tested:
  - `/api/weather?q=London`
  - `/api/space-weather?type=FLR&startDate=2025-01-01&endDate=2025-01-31`

### Deploy Frontend (GitHub Pages):

- [ ] Code pushed to GitHub
- [ ] GitHub Pages enabled (Settings → Pages)
- [ ] `app.js` updated with Vercel API URL
- [ ] Changes committed and pushed
- [ ] Site live and tested

### Post-Deployment:

- [ ] Test weather search
- [ ] Test space weather fetch
- [ ] Check browser console (no errors)
- [ ] Verify API keys NOT visible in source code
- [ ] Test on mobile device
- [ ] Share your live URL! 🎉

## 🔧 Common Commands

```powershell
# Local server
py -m http.server 8080

# Vercel local dev
vercel dev

# Vercel deploy
vercel --prod

# Git commands
git status
git add .
git commit -m "message"
git push origin main

# Check if .env is ignored
git status  # Should NOT show .env in changes
```

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| API not working | Check Vercel environment variables |
| CORS errors | Verify `vercel.json` CORS headers |
| 404 on GitHub Pages | Wait 2-5 mins, check Settings→Pages |
| 500 errors | Check Vercel function logs |
| Keys visible | Check `app.js` - should only have Vercel URL |

## 📱 Test URLs

### Local:
- Frontend: `http://localhost:8080`
- API (with vercel dev): `http://localhost:3000/api`

### Production:
- Frontend: `https://studentofstars.github.io/Weather-Nexus/`
- API: `https://your-vercel-app.vercel.app/api`

## 🎯 Update app.js

Find this line (~11):
```javascript
apiBaseUrl: 'https://your-vercel-app.vercel.app/api',
```

Replace with YOUR Vercel URL:
```javascript
apiBaseUrl: 'https://weather-nexus-api.vercel.app/api',
```

## ✅ Success Indicators

You're good to go when:

- ✅ Localhost shows weather data
- ✅ Vercel API responds with JSON
- ✅ GitHub Pages site loads
- ✅ Weather search works
- ✅ Space weather fetches
- ✅ No API keys in browser source
- ✅ Browser console clean (no errors)

## 📚 More Info

- **Full deployment guide**: [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)
- **Vercel docs**: https://vercel.com/docs
- **GitHub Pages docs**: https://docs.github.com/en/pages

---

**Need help?** Open an issue: https://github.com/studentofstars/Weather-Nexus/issues

**Ready to deploy?** Follow: [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)
