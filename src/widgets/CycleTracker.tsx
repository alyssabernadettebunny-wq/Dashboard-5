import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface Phase {
  name: string
  end: number
  color: string
}

const CYCLE_LENGTH = 28
const PHASES: Phase[] = [
  { name: 'Menstrual', end: 5, color: '#F5A9C8' },
  { name: 'Follicular', end: 13, color: '#B79AE0' },
  { name: 'Ovulation', end: 16, color: '#F3C77C' },
  { name: 'Luteal', end: 28, color: '#8FCB9B' },
]

function phaseFor(day: number) {
  return PHASES.find((p) => day <= p.end) ?? PHASES[PHASES.length - 1]
}

export default function CycleTracker() {
  const [day, setDay] = useLocalStorage('bodyweather.cycle.day', 12)
  const [notes, setNotes] = useLocalStorage('bodyweather.cycle.notes', '')

  const current = phaseFor(day)
  let acc = 0
  const stops = PHASES.map((p) => {
    const start = (acc / CYCLE_LENGTH) * 100
    acc = p.end
    const end = (acc / CYCLE_LENGTH) * 100
    return `${p.color} ${start}% ${end}%`
  }).join(', ')

  return (
    <Card icon="🌸" title="Cycle / PMDD Tracker">
      <div className="donut-wrap">
        <div className="donut" style={{ background: `conic-gradient(${stops})` }}>
          <div className="donut-label">
            Day
            <br />
            {day}
          </div>
        </div>
        <div className="cycle-phases">
          {PHASES.map((p) => (
            <div key={p.name} className={`phase-row ${p.name === current.name ? 'active' : ''}`}>
              <span className="phase-dot" style={{ background: p.color }} />
              {p.name}
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="stat-row">
          <span>Cycle day</span>
          <span>
            {day} / {CYCLE_LENGTH}
          </span>
        </div>
        <input type="range" min={1} max={CYCLE_LENGTH} value={day} onChange={(e) => setDay(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--pink-accent)' }} />
      </div>
      <textarea className="c-textarea" placeholder="Symptoms or notes for today..." value={notes} onChange={(e) => setNotes(e.target.value)} />
    </Card>
  )
}
