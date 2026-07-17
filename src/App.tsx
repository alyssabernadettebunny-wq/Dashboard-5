import TasksWidget from './widgets/TasksWidget'
import NotesWidget from './widgets/NotesWidget'
import LinksWidget from './widgets/LinksWidget'
import './App.css'

function App() {
  const today = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="today">{today}</p>
      </header>

      <main className="widget-grid">
        <TasksWidget />
        <NotesWidget />
        <LinksWidget />
      </main>
    </div>
  )
}

export default App
