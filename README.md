# 🌍 Weather Nexus - Multi-Planet Weather Monitoring System

<div align="center">

![Weather Nexus](https://img.shields.io/badge/Weather-Nexus-4A9EFF?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)

**A beautiful, secure glassmorphic web application for monitoring Earth and Space weather in real-time**

[Live Demo](https://studentofstars.github.io/Weather-Nexus/) • [API Docs](./DEPLOYMENT-GUIDE.md) • [Report Bug](https://github.com/studentofstars/Weather-Nexus/issues) • [Request Feature](https://github.com/studentofstars/Weather-Nexus/issues)

</div>

---

## 🔐 Security First

This project implements **secure API key management** using a hybrid architecture:

- ✅ **API keys hidden** on serverside (Vercel Functions)
- ✅ **Zero exposure** in client-side code
- ✅ **CORS-protected** endpoints
- ✅ **Production-ready** security practices

```
Frontend (GitHub Pages) → Secure API (Vercel) → Weather APIs
```

See [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md) for complete setup instructions.

---

## ✨ Features

### 🌍 Earth Weather Monitoring
- **Real-time Data**: Live weather updates from 200,000+ cities worldwide
- **Indian Cities Focus**: Quick access to Delhi, Mumbai, Bengaluru, Bhubaneshwar, and Kolkata
- **Comprehensive Metrics**: Temperature, humidity, wind speed, pressure, visibility, and cloud cover
- **5-Day Forecast**: Interactive temperature trend chart powered by Chart.js
- **Smart Search**: Fuzzy search with city suggestions and autocomplete
- **Weather Insights**: AI-powered weather analysis and recommendations

### ☀️ Space Weather Monitoring
- **Solar Activity Tracking**: Monitor solar flares (FLR), Coronal Mass Ejections (CME), and Geomagnetic Storms (GST)
- **NASA DONKI Integration**: Real-time space weather events from NASA's database
- **Event Timeline**: Interactive bar chart showing space weather activity over time
- **Impact Analysis**: Comprehensive insights on how space weather affects Earth
- **Beautiful Visualization**: Blue-themed design with ESA space imagery

### 🎨 Modern UI/UX
- **Glassmorphism Design**: Apple-inspired liquid glass aesthetic
- **Fully Responsive**: Optimized for mobile, tablet, and desktop (320px - 1920px+)
- **Smooth Animations**: Particle effects, slide-ups, and fade-ins
- **Dark Theme**: Easy on the eyes with elegant dark mode
- **Interactive Elements**: Hover effects, tooltips, and dynamic content

### ⚡ Interactive Features
- **Live Clock**: Real-time UTC clock in navigation
- **Keyboard Shortcuts**: Quick navigation (Q for search, H for help, Esc to close)
- **Quick Actions**: One-click city selection for major Indian cities
- **Search Suggestions**: Smart dropdown with popular cities
- **Copy to Clipboard**: Easy sharing of weather data
- **Help Modal**: Comprehensive keyboard shortcuts guide
- **About Modals**: Educational information about Earth and Space weather
- **Refresh Indicators**: Visual feedback for data updates

---

## 🚀 Quick Start

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3.x (for local testing) or any HTTP server

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/studentofstars/Weather-Nexus.git
cd Weather-Nexus
```

2. **Start a local server**

**Option A: Python HTTP Server**
```bash
python -m http.server 8080
# or
py -m http.server 8080
```

**Option B: Node.js HTTP Server**
```bash
npx http-server -p 8080
```

**Option C: VS Code Live Server**
- Install "Live Server" extension
- Right-click `index.html` → "Open with Live Server"

3. **Open in browser**
```
http://localhost:8080
```

---

## 📁 Project Structure

```
Weather-Nexus/
├── 📂 api/                    # Serverless functions (Vercel)
│   ├── weather.js            # Earth weather API proxy
│   └── space-weather.js      # Space weather API proxy
├── 📄 index.html             # Main HTML structure (590 lines)
├── 🎨 styles.css             # Complete styling (1640+ lines)
├── ⚡ app.js                  # JavaScript functionality (1020+ lines)
├── 🔐 .env.example           # Environment template
├── 🚫 .gitignore             # Git ignore rules
├── 📖 README.md              # This file
├── 📚 DEPLOYMENT-GUIDE.md    # Step-by-step deployment
└── ⚙️ vercel.json            # Vercel configuration
```

---

## 🔑 API Configuration

### Secure Architecture

**🔐 API keys are stored as environment variables on Vercel and NEVER exposed in code.**

### Setup Your Own Instance

1. **Get API Keys** (Free):
   - [OpenWeatherMap API](https://openweathermap.org/api) - 60 calls/min, 1M/month
   - [NASA API](https://api.nasa.gov/) - ~1000 requests/hour

2. **Configure Environment Variables** on Vercel:
   ```
   OPENWEATHER_API_KEY=your_key_here
   NASA_API_KEY=your_key_here
   ```

3. **Update API Base URL** in `app.js`:
   ```javascript
   apiBaseUrl: 'https://your-vercel-app.vercel.app/api'
   ```

See complete instructions in [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)

---

## 🎯 Key Technologies

| Technology | Purpose |
|------------|---------|
| **HTML5** | Semantic structure and accessibility |
| **CSS3** | Glassmorphism, animations, responsive design |
| **Vanilla JavaScript** | No frameworks - pure DOM manipulation |
| **Chart.js 4.4.0** | Interactive data visualization |
| **OpenWeatherMap API** | Real-time Earth weather data |
| **NASA DONKI API** | Space weather events and alerts |

---

## 📱 Responsive Breakpoints

- **Mobile Small**: 320px - 480px
- **Mobile**: 480px - 768px
- **Tablet**: 768px - 1200px
- **Desktop**: 1200px+

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Q` | Focus search input |
| `H` | Open/close help modal |
| `Esc` | Close any open modal |
| `1-5` | Quick select Indian cities |
| `Enter` | Fetch weather data |

---

## 🎨 Color Palette

### Earth Weather
- Primary: `#4A90E2` (Sky Blue)
- Accent: `#67B26F` (Earth Green)

### Space Weather  
- Primary: `#4A9EFF` (Space Blue)
- Secondary: `#6BB6FF` (Light Blue)
- Accent: `#8BC6FF` (Bright Blue)

### Glassmorphism
- Background: `rgba(255, 255, 255, 0.1)` - `rgba(255, 255, 255, 0.2)`
- Backdrop Blur: `20px` - `25px`
- Borders: `rgba(255, 255, 255, 0.2)` - `rgba(255, 255, 255, 0.4)`

---

## 🌟 Features in Detail

### Search Functionality
- Fuzzy search algorithm for city names
- Popular cities displayed first (Indian cities prioritized)
- Autocomplete with dropdown suggestions
- Keyboard navigation support

### Data Visualization
- **Temperature Chart**: 5-day forecast with interactive tooltips
- **Space Weather Chart**: Event timeline with color-coded categories
- **Animated Particles**: 30 floating particles for visual appeal

### Weather Insights
- Automatic weather condition analysis
- Activity recommendations based on weather
- Clothing suggestions
- Health and safety tips

### Space Weather Impact
- Satellite operations warnings
- Communication disruption alerts
- Aurora visibility predictions
- Solar cycle information

---

## 🚀 Deployment

### Prerequisites
- GitHub account
- Vercel account (free tier)
- OpenWeatherMap API key
- NASA API key

### Quick Deploy

**1. Deploy Backend API to Vercel:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/studentofstars/Weather-Nexus)

After deploying:
- Add environment variables in Vercel Dashboard:
  - `OPENWEATHER_API_KEY`
  - `NASA_API_KEY`

**2. Deploy Frontend to GitHub Pages:**

```bash
# Enable GitHub Pages in repository Settings → Pages
# Select: Branch: main, Folder: / (root)
```

**3. Connect Them:**

Update `app.js` line ~11 with your Vercel API URL:
```javascript
apiBaseUrl: 'https://your-vercel-app.vercel.app/api'
```

📚 **Detailed Instructions:** See [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)

---

## 🐛 Known Issues & Limitations

- API rate limits apply based on your API tier (free tier is generous for personal use)
- Some features require HTTPS in production
- Space weather data may have occasional delays from NASA

---

## 🔒 Security Best Practices

This project follows security best practices:

- ✅ **API keys stored server-side** (never in client code)
- ✅ **Environment variables** for sensitive data
- ✅ **CORS headers** properly configured
- ✅ **`.env` in `.gitignore`** (never committed)
- ✅ **Rate limiting** on API endpoints
- ✅ **Error handling** without exposing internals

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**Student of Stars**
- GitHub: [@studentofstars](https://github.com/studentofstars)
- Repository: [Weather-Nexus](https://github.com/studentofstars/Weather-Nexus)

---

## 🙏 Acknowledgments

- **OpenWeatherMap** for Earth weather data
- **NASA** for space weather data and APIs
- **ESA** for "Low Sun on the Horizon" background image
- **Chart.js** for beautiful data visualizations
- **Feather Icons** for SVG icons

---

## 📸 Screenshots

> Add screenshots of your application here after deployment

---

## 🔮 Future Enhancements

- [ ] Backend API proxy for secure key management
- [ ] User accounts and favorite cities
- [ ] Weather alerts and notifications
- [ ] Historical weather data analysis
- [ ] More detailed space weather predictions
- [ ] PWA support for offline functionality
- [ ] Dark/Light theme toggle
- [ ] Multi-language support
- [ ] Weather widgets for embedding

---

<div align="center">

**⭐ Star this repo if you find it useful!**

Made with ❤️ for space and weather enthusiasts

</div>
