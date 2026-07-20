import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface Priority {
  id: string
  text: string
  starred: boolean
}

const DEFAULT_PRIORITIES: Priority[] = [
  { id: 'p1', text: '', starred: false },
  { id: 'p2', text: '', starred: false },
  { id: 'p3', text: '', starred: false },
]

export default function TopPriorities() {
  const [priorities, setPriorities] = useLocalStorage<Priority[]>('dashboard.toppriorities', DEFAULT_PRIORITIES)

  function updateText(id: string, text: string) {
    setPriorities(priorities.map((p) => (p.id === id ? { ...p, text } : p)))
  }

  function toggleStar(id: string) {
    setPriorities(priorities.map((p) => (p.id === id ? { ...p, starred: !p.starred } : p)))
  }

  return (
    <Card
      icon="🎀"
      title="Today at a Glance"
      variant="tapedPaper"
      surface="cream"
      anchor={<img src="/Dashboard-5/images/pink-star.png" alt="" />}
    >
      <p className="section-label" style={{ marginTop: 0 }}>
        Top 3 Priorities
      </p>
      <ul className="c-list">
        {priorities.map((p, i) => (
          <li key={p.id} className="c-list-item priority-row">
            <span className="priority-num">{i + 1}</span>
            <input
              type="text"
              value={p.text}
              placeholder="What matters most today?"
              onChange={(e) => updateText(p.id, e.target.value)}
            />
            <button
              className={`priority-star ${p.starred ? 'active' : ''}`}
              onClick={() => toggleStar(p.id)}
              aria-label="Toggle important"
            >
              {p.starred ? '★' : '☆'}
            </button>
          </li>
        ))}
      </ul>
    </Card>
  )
}
