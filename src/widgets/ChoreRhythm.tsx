import Card from '../components/Card'

const SCHEDULE = [
  { day: 'Monday', task: 'Kitchen deep clean' },
  { day: 'Tuesday', task: 'Laundry' },
  { day: 'Wednesday', task: 'Bathrooms' },
  { day: 'Thursday', task: 'Vacuum + dust' },
  { day: 'Friday', task: 'Declutter + reset' },
  { day: 'Saturday', task: 'Grocery run' },
  { day: 'Sunday', task: 'Rest / light tidy' },
]

const today = new Date().toLocaleDateString(undefined, { weekday: 'long' })

export default function ChoreRhythm() {
  return (
    <Card icon="🗓️" title="Weekly Chore Rhythm" wide>
      <ul className="c-list" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
        {SCHEDULE.map((s) => (
          <li
            key={s.day}
            className="c-list-item"
            style={{
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 2,
              minWidth: 110,
              padding: '8px 10px',
              borderRadius: 12,
              background: s.day === today ? 'var(--purple-pill)' : 'var(--card-bg-tint)',
            }}
          >
            <span className="sub" style={{ marginLeft: 0, fontWeight: 700, color: 'var(--purple-heading)' }}>
              {s.day}
            </span>
            <span>{s.task}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
