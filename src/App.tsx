import { useEffect, useState } from 'react'
import HomePage from './pages/HomePage'
import HousePage from './pages/HousePage'
import { useLocalStorage } from './hooks/useLocalStorage'
import './App.css'

const NAV_ITEMS = [
  { key: 'home', label: 'Today', icon: '🏠', enabled: true },
  { key: 'rhythm', label: 'Rhythm', icon: '🗓️', enabled: false },
  { key: 'body-weather', label: 'Body Weather', icon: '☁️', enabled: false },
  { key: 'house', label: 'Home', icon: '🏡', enabled: true },
  { key: 'girls', label: 'Girls', icon: '💗', enabled: false },
  { key: 'pets', label: 'Pets', icon: '🐾', enabled: false },
  { key: 'food', label: 'Food', icon: '🍡', enabled: false },
  { key: 'money', label: 'Money', icon: '💰', enabled: false },
  { key: 'notes', label: 'Notes', icon: '⭐', enabled: false },
  { key: 'spark', label: 'Spark', icon: '✨', enabled: false },
  { key: 'more', label: 'More', icon: '⋯', enabled: false },
]

const AFFIRMATIONS = [
  'you are enough ✦',
  "you're allowed to take up space",
  'soft plans, kind days',
  "you don't have to have it all figured out",
  'one step at a time, you got this',
  'proud of you for showing up today',
]

function todaysAffirmation() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  return AFFIRMATIONS[dayOfYear % AFFIRMATIONS.length]
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatDate(d: Date) {
  return `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function formatTime(d: Date) {
  let hours = d.getHours()
  const minutes = d.getMinutes().toString().padStart(2, '0')
  const meridiem = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  if (hours === 0) hours = 12
  return { value: `${hours}:${minutes}`, meridiem }
}

function weatherIcon(condition: string) {
  const c = condition.toLowerCase()
  if (c.includes('storm') || c.includes('thunder')) return '⛈️'
  if (c.includes('snow')) return '❄️'
  if (c.includes('rain') || c.includes('shower') || c.includes('drizzle')) return '🌧️'
  if (c.includes('partly') || c.includes('mostly sunny') || c.includes('mostly cloudy')) return '⛅'
  if (c.includes('cloud') || c.includes('overcast')) return '☁️'
  if (c.includes('sun') || c.includes('clear')) return '☀️'
  if (c.includes('wind')) return '🌬️'
  if (c.includes('fog') || c.includes('mist') || c.includes('haze')) return '🌫️'
  return '🌤️'
}

function App() {
  const [page, setPage] = useState('home')
  const [clock, setClock] = useState(() => new Date())
  const [weather] = useLocalStorage('dashboard.worldfeed.weather', { temp: '', condition: '' })

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 30000)
    return () => clearInterval(id)
  }, [])

  const today = formatDate(clock)
  const { value: timeValue, meridiem } = formatTime(clock)

  return (
    <div className="page-wrap">
      <div className="window">
        <div className="titlebar">
          <div className="titlebar-left">
            <span className="dot" /> Alyssa Daily Dashboard
          </div>
          <div className="titlebar-controls">
            <span className="min" />
            <span className="max" />
            <span className="close" />
          </div>
        </div>

        <div className="scallop top" />

        <div className="app-body">
          <nav className="sidebar">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                className={`nav-item ${page === item.key ? 'active' : ''}`}
                disabled={!item.enabled}
                onClick={() => item.enabled && setPage(item.key)}
                title={item.enabled ? undefined : 'Coming soon'}
              >
                <span className="badge">{item.icon}</span> {item.label}
              </button>
            ))}
          </nav>

          <main className="main">
            <div className="header">
              <div className="header-left">
                <div className="illustration-slot avatar-slot">character illustration</div>
                <div className="greeting-block">
                  <h1>
                    Good day,
                    <br />
                    Alyssa! ♡
                  </h1>
                  <span className="affirmation-pill">{todaysAffirmation()}</span>
                </div>
              </div>

              <div className="header-center">
                <img className="title-banner" src="/Dashboard-5/images/title-banner.png" alt="Alyssa Daily Dashboard" />
                <div className="tagline">plan softly, live kindly, chase little joys ♡</div>
              </div>

              <div className="header-right">
                <div className="illustration-slot mascot-slot">mascot illust.</div>
                <div className="speech-bubble">be kind to your future self.</div>
                <div className="datetime-card">
                  <div className="time">
                    {timeValue}
                    <span className="meridiem">{meridiem}</span>
                  </div>
                  <div className="date">{today}</div>
                  {(weather.temp || weather.condition) && (
                    <div className="weather-row">
                      <span>{weatherIcon(weather.condition)}</span>
                      {weather.temp && <span>{weather.temp}</span>}
                      {weather.condition && <span>{weather.condition}</span>}
                    </div>
                  )}
                  <span className="datetime-flower" aria-hidden="true">
                    🌸
                  </span>
                </div>
              </div>
            </div>

            {page === 'home' && <HomePage />}
            {page === 'house' && <HousePage />}

            {page === 'home' && (
              <div className="bottom-strip">
                <div className="chip">
                  <span className="icon">☕</span>
                  <span className="txt">
                    <b>Coffee fix</b>Iced vanilla latte
                  </span>
                </div>
                <div className="chip">
                  <span className="icon">📖</span>
                  <span className="txt">
                    <b>Book nook</b>Currently reading
                  </span>
                </div>
                <div className="chip">
                  <span className="icon">💿</span>
                  <span className="txt">
                    <b>K-pop radar</b>New drops this week
                  </span>
                </div>
                <div className="chip">
                  <span className="icon">📓</span>
                  <span className="txt">
                    <b>Notebook</b>Brain dump open
                  </span>
                </div>
                <div className="chip">
                  <span className="icon">🐾</span>
                  <span className="txt">
                    <b>Frenchie &amp; Maltipoo</b>Good pups today
                  </span>
                </div>
              </div>
            )}

            <div className="charm-strand">illustration charm strand</div>
          </main>
        </div>

        <div className="scallop bottom" />
      </div>
    </div>
  )
}

export default App
