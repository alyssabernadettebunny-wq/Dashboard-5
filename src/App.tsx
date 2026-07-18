import StatusBoard from './widgets/StatusBoard'
import BodyCheckin from './widgets/BodyCheckin'
import WaterProtein from './widgets/WaterProtein'
import MedsTitration from './widgets/MedsTitration'
import DogsCare from './widgets/DogsCare'
import QuickCapture from './widgets/QuickCapture'
import ChecklistCard from './widgets/ChecklistCard'
import Reminders from './widgets/Reminders'
import WorldFeed from './widgets/WorldFeed'
import './App.css'

const NAV_ITEMS = [
  { label: 'Home', icon: '🏠', active: true },
  { label: 'Body Weather', icon: '🌤️', active: false },
  { label: 'House', icon: '🏡', active: false },
  { label: 'Girls', icon: '💕', active: false },
  { label: 'Pets', icon: '🐾', active: false },
  { label: 'Money', icon: '💸', active: false },
  { label: 'Notes', icon: '📓', active: false },
]

const AFFIRMATIONS = [
  "you're allowed to take up space",
  'soft plans, kind days',
  "you don't have to have it all figured out",
  'one step at a time, you got this',
  'plan softly, live kindly',
  'proud of you for showing up today',
]

function todaysAffirmation() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000,
  )
  return AFFIRMATIONS[dayOfYear % AFFIRMATIONS.length]
}

function App() {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
  const now = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="sidebar-title">
          <span className="bow">🎀</span> Alyssa
        </div>
        <nav>
          {NAV_ITEMS.map((item) => (
            <div key={item.label} className={`nav-item ${item.active ? 'active' : 'coming-soon'}`}>
              <span className="nav-icon">{item.icon}</span>
              {item.label}
              {item.active ? <span className="nav-heart">♡</span> : <span className="soon">soon</span>}
            </div>
          ))}
        </nav>
        <div className="vibe-note">
          <p className="vibe-label">today's vibe</p>
          <p className="vibe-text">{todaysAffirmation()}</p>
        </div>
      </aside>

      <div className="dashboard">
        <header className="dashboard-header">
          <div className="header-greeting">
            <span className="bow small">🎀</span>
            <p>
              Good day, <span className="greeting-name">Alyssa!</span> <span className="heart">♡</span>
            </p>
          </div>

          <div className="header-center">
            <h1 className="dashboard-title">Alyssa's Dashboard</h1>
            <p className="tagline">plan softly, live kindly, chase little joys ♡</p>
          </div>

          <div className="time-badge">
            <span className="time">{now}</span>
            <span className="date-sub">{today}</span>
          </div>
        </header>

        <p className="affirmation-pill">💗 {todaysAffirmation()}</p>

        <main className="widget-grid">
          <StatusBoard />
          <BodyCheckin />
          <WaterProtein />
          <MedsTitration />
          <DogsCare />
          <QuickCapture />
          <ChecklistCard title="⭐ My Tasks" storageKey="dashboard.tasks.me" placeholder="Add a task..." />
          <ChecklistCard
            title="🎀 Girls' To-Dos"
            storageKey="dashboard.tasks.girls"
            placeholder="Add something for the girls..."
          />
          <Reminders />
          <WorldFeed />
        </main>
      </div>
    </div>
  )
}

export default App
