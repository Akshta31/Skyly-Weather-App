// =====================
//  CONFIG
// =====================
const API_KEY = '//Add your API Key here';
const BASE    = '';

// =====================
//  WEATHER ICON MAP
// =====================
const ICONS = {
  Clear:        '☀️',
  Clouds:       '☁️',
  Rain:         '🌧️',
  Drizzle:      '🌦️',
  Thunderstorm: '⛈️',
  Snow:         '❄️',
  Mist:         '🌫️',
  Fog:          '🌫️',
  Haze:         '🌤️',
  Smoke:        '🌫️',
  Dust:         '🌪️',
  Sand:         '🌪️',
  Tornado:      '🌪️',
  Squall:       '💨',
};
function getIcon(main) { return ICONS[main] || '🌡️'; }

// =====================
//  DATE HELPERS
// =====================
function fmtDate(ts) {
  return new Date(ts * 1000).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  });
}
function fmtDay(ts) {
  return new Date(ts * 1000).toLocaleDateString('en-US', { weekday: 'short' });
}
function fmtHour(ts) {
  return new Date(ts * 1000).toLocaleTimeString('en-US', {
    hour: 'numeric', hour12: true
  });
}
function fmtTime(ts, tz) {
  return new Date((ts + tz) * 1000).toUTCString().match(/\d{2}:\d{2}/)?.[0] || '—';
}

// =====================
//  DOM HELPERS
// =====================
function $(id) { return document.getElementById(id); }
function show(id) { $(id).style.display = ''; }
function hide(id) { $(id).style.display = 'none'; }
function setText(id, val) { $(id).textContent = val; }

// =====================
//  RENDER WEATHER
// =====================
function renderWeather(cur, fc) {
  // Hero
  setText('cityName',      `${cur.name}, ${cur.sys.country}`);
  setText('dateStr',       fmtDate(cur.dt));
  setText('weatherIcon',   getIcon(cur.weather[0].main));
  setText('tempVal',       Math.round(cur.main.temp));
  setText('conditionText', cur.weather[0].description.replace(/\b\w/g, c => c.toUpperCase()));
  setText('tempMax',       Math.round(cur.main.temp_max));
  setText('tempMin',       Math.round(cur.main.temp_min));

  // Stats
  setText('humVal',    cur.main.humidity);
  setText('windVal',   Math.round(cur.wind.speed * 3.6));
  setText('feelsVal',  Math.round(cur.main.feels_like));
  setText('visVal',    (cur.visibility / 1000).toFixed(1));
  setText('sunriseVal', fmtTime(cur.sys.sunrise, cur.timezone));
  setText('sunsetVal',  fmtTime(cur.sys.sunset,  cur.timezone));

  // 5-Day Forecast (one item per day, skip today)
  const days = {};
  const todayStr = new Date().toDateString();
  fc.list.forEach(item => {
    const d = new Date(item.dt * 1000).toDateString();
    if (d !== todayStr && !days[d]) days[d] = item;
  });
  const dayArr = Object.values(days).slice(0, 5);
  $('forecastRow').innerHTML = dayArr.map(d => `
    <div class="day-card">
      <div class="day-name">${fmtDay(d.dt)}</div>
      <div class="day-icon">${getIcon(d.weather[0].main)}</div>
      <div class="day-high">${Math.round(d.main.temp_max)}°</div>
      <div class="day-low">${Math.round(d.main.temp_min)}°</div>
    </div>`).join('');

  // Hourly (next 8 slots = 24 hrs)
  const hourly = fc.list.slice(0, 8);
  $('hourlyRow').innerHTML = hourly.map((h, i) => `
    <div class="hour-card${i === 0 ? ' today' : ''}">
      <div class="hour-time">${i === 0 ? 'Now' : fmtHour(h.dt)}</div>
      <div class="hour-icon">${getIcon(h.weather[0].main)}</div>
      <div class="hour-temp">${Math.round(h.main.temp)}°</div>
    </div>`).join('');

  hide('errorMsg');
  hide('loadingState');
  show('weatherContent');
}

// =====================
//  FETCH BY COORDS
// =====================
async function fetchByCoords(lat, lon) {
  hide('errorMsg');
  hide('weatherContent');
  show('loadingState');
  try {
    const [curRes, fcRes] = await Promise.all([
      fetch(`${BASE}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`),
      fetch(`${BASE}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
    ]);
    if (!curRes.ok) throw new Error('not_found');
    const cur = await curRes.json();
    const fc  = await fcRes.json();
    renderWeather(cur, fc);
  } catch (e) {
    hide('loadingState');
    showError(e.message);
  }
}

// =====================
//  FETCH BY CITY NAME
// =====================
async function fetchByCity(city) {
  hide('errorMsg');
  hide('weatherContent');
  show('loadingState');
  try {
    const [curRes, fcRes] = await Promise.all([
      fetch(`${BASE}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`),
      fetch(`${BASE}/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`)
    ]);
    if (!curRes.ok) throw new Error('not_found');
    const cur = await curRes.json();
    const fc  = await fcRes.json();
    renderWeather(cur, fc);
  } catch (e) {
    hide('loadingState');
    showError(e.message);
  }
}

// =====================
//  ERROR
// =====================
function showError(msg) {
  const friendly = msg === 'not_found'
    ? '🔍 City not found. Please check the spelling and try again.'
    : '⚠️ Something went wrong. Please check your connection and try again.';
  $('errorMsg').textContent = friendly;
  show('errorMsg');
}

// =====================
//  SEARCH (called from HTML)
// =====================
function searchWeather() {
  const city = $('cityInput').value.trim();
  if (!city) return;
  fetchByCity(city);
}

// =====================
//  LOCATE ME (called from HTML)
// =====================
function locateMe() {
  if (!navigator.geolocation) {
    showError('Geolocation is not supported by your browser.');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos => fetchByCoords(pos.coords.latitude, pos.coords.longitude),
    ()  => showError('Location access denied. Please search by city name.')
  );
}

// =====================
//  ENTER KEY SUPPORT
// =====================
document.addEventListener('DOMContentLoaded', () => {
  $('cityInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') searchWeather();
  });

  // Auto-load location on startup
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => fetchByCoords(pos.coords.latitude, pos.coords.longitude),
      ()  => {} // silently skip if denied
    );
  }
});
