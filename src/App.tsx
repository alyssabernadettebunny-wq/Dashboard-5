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
  { label: 'Home', active: true },
  { label: 'Body Weather', active: false },
  { label: 'House', active: false },
  { label: 'Girls', active: false },
  { label: 'Pets', active: false },
  { label: 'Money', active: false },
  { label: 'Notes', active: false },
]

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
        <div className="sidebar-title">Alyssa</div>
        <nav>
          {NAV_ITEMS.map((item) => (
            <div key={item.label} className={`nav-item ${item.active ? 'active' : 'coming-soon'}`}>
              {item.label}
              {!item.active && <span className="soon">soon</span>}
            </div>
          ))}
        </nav>
      </aside>

      <div className="dashboard">
        <header className="dashboard-header">
          <div>
            <h1>Good day, Alyssa</h1>
            <p className="today">{today}</p>
          </div>
          <div className="time">{now}</div>
        </header>

        <main className="widget-grid">
          <StatusBoard />
          <BodyCheckin />
          <WaterProtein />
          <MedsTitration />
          <DogsCare />
          <QuickCapture />
          <ChecklistCard title="My Tasks" storageKey="dashboard.tasks.me" placeholder="Add a task..." />
          <ChecklistCard
            title="Girls' To-Dos"
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
