# ☀️ Sunny — Weather App

A minimal, aesthetic weather app with a warm orange theme.

## 🚀 How to Run

Just open `index.html` in any modern browser. No build step needed.

> **Tip:** For geolocation to work, serve via a local server or open from a file system that supports it.  
> You can use VS Code Live Server, or run: `npx serve .`

## 📁 File Structure

```
weather-app/
├── index.html   → App structure & markup
├── style.css    → Orange theme, animations, responsive layout
├── app.js       → Weather logic, API calls, rendering
└── README.md    → This file
```

## ✨ Features

- 🔍 Search weather by city name
- 📍 Auto-detect & use current location
- 🌡 Current temperature, feels like, high/low
- 💧 Humidity, wind speed, visibility
- 🌅 Sunrise & sunset times
- 📅 5-Day forecast
- ⏱ Hourly forecast (next 24 hours)
- ⚡ Smooth animations & loading states
- ❌ Error handling (city not found, network errors)
- 📱 Fully responsive, mobile-first design

## 🎨 Design

- Primary: `#FFA500` (warm orange)
- Accent:  `#FF8C00` (deep orange)
- Light:   `#FFD8A8` (pale orange)
- Font: Poppins (Google Fonts)

## 🔑 API

Uses [OpenWeatherMap](https://openweathermap.org/api) free tier.  
API key is set in `app.js` → `const API_KEY = '...'`

To use your own key, replace the value in `app.js`.

![image alt]()
