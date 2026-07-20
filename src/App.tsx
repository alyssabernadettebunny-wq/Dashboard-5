import { useEffect, useState } from 'react'
import HomePage from './pages/HomePage'
import HousePage from './pages/HousePage'
import BodyWeatherPage from './pages/BodyWeatherPage'
import FoodPage from './pages/FoodPage'
import PetsPage from './pages/PetsPage'
import RhythmPage from './pages/RhythmPage'
import GirlsPage from './pages/GirlsPage'
import MoneyPage from './pages/MoneyPage'
import NotesPage from './pages/NotesPage'
import SparkPage from './pages/SparkPage'
import MorePage from './pages/MorePage'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useStreak } from './hooks/useStreak'
import { useCompanion } from './hooks/useCompanion'
import { useAppTheme } from './widgets/ThemePicker'
import './App.css'

const NAV_ITEMS = [
  { key: 'home', label: 'Today', icon: '🏠', enabled: true },
  { key: 'rhythm', label: 'Rhythm', icon: '🗓️', enabled: true },
  { key: 'body-weather', label: 'Body Weather', icon: '☁️', enabled: true },
  { key: 'house', label: 'Home', icon: '🏡', enabled: true },
  { key: 'girls', label: 'Girls', icon: '💗', enabled: true },
  { key: 'pets', label: 'Pets', icon: '🐾', enabled: true },
  { key: 'food', label: 'Food', icon: '🍡', enabled: true },
  { key: 'money', label: 'Money', icon: '💰', enabled: true },
  { key: 'notes', label: 'Notes', icon: '⭐', enabled: true },
  { key: 'spark', label: 'Spark', icon: '✨', enabled: true },
  { key: 'more', label: 'More', icon: '⋯', enabled: true },
]

const AFFIRMATIONS = [
  'you are enough ✦',
  "you're allowed to take up space",
  'soft plans, kind days',
  "you don't have to have it all figured out",
  'one step at a time, you got this',
  'proud of you for showing up today',
  'rest is productive too',
  "you're doing better than you think",
  'small wins still count',
  'be gentle with yourself today',
  "it's okay to go slow",
  'you get to change your mind',
  'today can be simple',
  "you're allowed to ask for help",
  'progress, not perfection ♡',
]

function todaysAffirmation() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  return AFFIRMATIONS[dayOfYear % AFFIRMATIONS.length]
}

const SPARKLES = [
  'today’s color is soft lavender ♡',
  'plant a tiny treat for yourself somewhere in today',
  'you’re allowed to do the bare minimum today, and that’s enough',
  'today is a good day for a favorite song on repeat',
  'somewhere today, a small good thing is waiting for you',
  'today’s mood: main character energy, but cozy',
  'a little sparkle for you: you’re doing great',
  'today, let something be easy',
  'bonus points today for drinking water and being kind to yourself',
  'today’s vibe: soft, slow, and a little sparkly',
]

function todaysSparkle() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  return SPARKLES[dayOfYear % SPARKLES.length]
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
  const { streak: overallStreak, markToday: markOverallToday } = useStreak('streak.overall')
  const companion = useCompanion()
  const [theme] = useAppTheme()
  const [coffeeOrder, setCoffeeOrder] = useLocalStorage('dashboard.coffeeOrder', 'Iced vanilla latte')
  const [currentBook, setCurrentBook] = useLocalStorage('dashboard.currentBook', 'Currently reading')
  const [dogsCare] = useLocalStorage('dashboard.dogscare', [] as { breakfast: boolean; dinner: boolean }[])
  const dogsStatus = dogsCare.length > 0 && dogsCare.every((d) => d.breakfast && d.dinner) ? 'Good pups today ♡' : 'Care needed today'

  function editCoffee() {
    const next = window.prompt('What are you drinking today?', coffeeOrder)
    if (next !== null) setCoffeeOrder(next)
  }

  function editBook() {
    const next = window.prompt("What are you reading?", currentBook)
    if (next !== null) setCurrentBook(next)
  }

  function scrollToWorldFeed() {
    const el = Array.from(document.querySelectorAll('.card-title')).find((n) => n.textContent?.includes('World Feed'))
    el?.closest('.card')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    const id = setInterval(() => setClock(new Date()), 30000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    markOverallToday()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (theme === 'default') document.documentElement.removeAttribute('data-theme')
    else document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

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
            <div className="sidebar-charm">
              <img src="/Dashboard-5/images/stitched-heart.png" alt="" />
              <span>be soft with yourself</span>
            </div>
          </nav>

          <main className="main">
            <div className="header">
              <div className="header-left">
                <img className="avatar-slot" src="/Dashboard-5/images/self-illustration-avatar.png" alt="Alyssa" />
                <div className="greeting-block">
                  <img className="greeting-banner" src="/Dashboard-5/images/greeting-banner.png" alt="Good morning, Alyssa!" />
                  <span className="affirmation-pill">{todaysAffirmation()}</span>
                  {overallStreak > 0 && <span className="streak-pill">🔥 {overallStreak} day{overallStreak !== 1 ? 's' : ''}</span>}
                </div>
              </div>

              <div className="header-center">
                <span className="header-motif motif-star-left" aria-hidden="true">✦</span>
                <span className="header-motif motif-heart-left" aria-hidden="true">♡</span>
                <img className="title-banner" src="/Dashboard-5/images/title-banner.png" alt="Alyssa Daily Dashboard" />
                <span className="header-motif motif-butterfly-right" aria-hidden="true">🦋</span>
                <span className="header-motif motif-star-right" aria-hidden="true">✧</span>
                <div className="tagline">plan softly, live kindly, chase little joys ♡</div>
                <div className="sparkle-of-day">✨ {todaysSparkle()}</div>
              </div>

              <div className="header-right">
                <div className="illustration-slot mascot-slot" title={companion.pet.name}>
                  {companion.pet.image ? (
                    <img className="mascot-portrait" src={companion.pet.image} alt={companion.pet.name} />
                  ) : (
                    companion.pet.emoji
                  )}
                </div>
                <div className="speech-bubble">{companion.message}</div>
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
            {page === 'rhythm' && <RhythmPage />}
            {page === 'girls' && <GirlsPage />}
            {page === 'money' && <MoneyPage />}
            {page === 'notes' && <NotesPage />}
            {page === 'spark' && <SparkPage />}
            {page === 'more' && <MorePage />}
            {page === 'house' && <HousePage />}
            {page === 'body-weather' && <BodyWeatherPage />}
            {page === 'food' && <FoodPage />}
            {page === 'pets' && <PetsPage />}

            {page === 'home' && (
              <div className="bottom-strip">
                <button className="chip" onClick={editCoffee} type="button">
                  <span className="icon">☕</span>
                  <span className="txt">
                    <b>Coffee fix</b>
                    {coffeeOrder}
                  </span>
                </button>
                <button className="chip" onClick={editBook} type="button">
                  <span className="icon">📖</span>
                  <span className="txt">
                    <b>Book nook</b>
                    {currentBook}
                  </span>
                </button>
                <button className="chip" onClick={scrollToWorldFeed} type="button">
                  <span className="icon">💿</span>
                  <span className="txt">
                    <b>K-pop radar</b>See releases below
                  </span>
                </button>
                <button className="chip" onClick={() => setPage('notes')} type="button">
                  <span className="icon">📓</span>
                  <span className="txt">
                    <b>Notebook</b>Open Notes
                  </span>
                </button>
                <button className="chip" onClick={() => setPage('pets')} type="button">
                  <span className="icon">🐾</span>
                  <span className="txt">
                    <b>Misa &amp; Coco</b>
                    {dogsStatus}
                  </span>
                </button>
              </div>
            )}

            <div className="charm-strand" aria-hidden="true">
              ⋆ ˚｡⋆
            </div>
          </main>
        </div>

        <div className="scallop bottom" />
      </div>
    </div>
  )
}

export default App
