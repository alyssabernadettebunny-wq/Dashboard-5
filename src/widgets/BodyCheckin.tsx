import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

export default function BodyCheckin() {
  const [sensory, setSensory] = useLocalStorage('dashboard.body.sensory', 5)
  const [notes, setNotes] = useLocalStorage('dashboard.body.notes', '')

  return (
    <Card icon="🌤️" title="Body Check-In">
      <div>
        <div className="stat-row">
          <span>Sensory load</span>
          <span>{sensory} / 10</span>
        </div>
        <input
          type="range"
          min={0}
          max={10}
          value={sensory}
          onChange={(e) => setSensory(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--pink-accent)' }}
        />
      </div>
      <textarea
        className="c-textarea"
        placeholder="How's your body feeling today?"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
    </Card>
  )
}
