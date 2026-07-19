import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface DayPlan {
  day: string
  focus: string
}

const DEFAULT_WEEK: DayPlan[] = [
  { day: 'Monday', focus: '' },
  { day: 'Tuesday', focus: '' },
  { day: 'Wednesday', focus: '' },
  { day: 'Thursday', focus: '' },
  { day: 'Friday', focus: '' },
  { day: 'Saturday', focus: '' },
  { day: 'Sunday', focus: '' },
]

const today = new Date().toLocaleDateString(undefined, { weekday: 'long' })

export default function WeeklyRhythm() {
  const [week, setWeek] = useLocalStorage<DayPlan[]>('rhythm.weekly', DEFAULT_WEEK)

  function updateDay(day: string, focus: string) {
    setWeek(week.map((d) => (d.day === day ? { ...d, focus } : d)))
  }

  return (
    <Card icon="🗓️" title="This Week's Rhythm" wide meta="Edit anytime as your weeks change">
      <ul className="c-list" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
        {week.map((d) => (
          <li
            key={d.day}
            className="c-list-item"
            style={{
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 4,
              minWidth: 140,
              padding: '8px 10px',
              borderRadius: 12,
              background: d.day === today ? 'var(--purple-pill)' : 'var(--card-bg-tint)',
            }}
          >
            <span className="sub" style={{ marginLeft: 0, fontWeight: 700, color: 'var(--purple-heading)' }}>
              {d.day}
            </span>
            <input
              type="text"
              value={d.focus}
              placeholder="This day's focus..."
              onChange={(e) => updateDay(d.day, e.target.value)}
              style={{ width: '100%', border: 'none', background: 'transparent', font: 'inherit', color: 'inherit' }}
            />
          </li>
        ))}
      </ul>
    </Card>
  )
}
