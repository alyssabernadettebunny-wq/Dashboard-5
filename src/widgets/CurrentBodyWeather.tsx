import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

export default function CurrentBodyWeather() {
  const [mood, setMood] = useLocalStorage('bodyweather.current.mood', 'Cloudy, low energy 💗')
  const [notes, setNotes] = useLocalStorage(
    'bodyweather.current.notes',
    'Heavy head, mild nausea, need rest + gentle care.',
  )
  const [energy, setEnergy] = useLocalStorage('bodyweather.current.energy', 4)

  return (
    <Card icon="🌥️" title="1. Current Body Weather">
      <div className="room-body">
        <div className="card-illustration room-illustration">illustration</div>
        <div style={{ flex: 1 }}>
          <input className="weather-mood-text" value={mood} onChange={(e) => setMood(e.target.value)} />
          <textarea className="weather-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </div>
      <div>
        <div className="stat-row">
          <span>Energy</span>
          <span>{energy} / 10</span>
        </div>
        <input
          type="range"
          min={0}
          max={10}
          value={energy}
          onChange={(e) => setEnergy(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--pink-accent)' }}
        />
      </div>
    </Card>
  )
}
