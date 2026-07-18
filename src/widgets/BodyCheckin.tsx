import { useLocalStorage } from '../hooks/useLocalStorage'
import './widgets.css'

const MOODS = ['😊', '🙂', '😐', '😟', '😢', '😤']

export default function BodyCheckin() {
  const [mood, setMood] = useLocalStorage('dashboard.body.mood', '')
  const [sensory, setSensory] = useLocalStorage('dashboard.body.sensory', 5)
  const [notes, setNotes] = useLocalStorage('dashboard.body.notes', '')

  return (
    <section className="widget">
      <h2><span className="icon-badge">💗</span> Body & Mood Check-In</h2>
      <div className="mood-picker">
        {MOODS.map((emoji) => (
          <button
            key={emoji}
            className={`mood-btn ${mood === emoji ? 'selected' : ''}`}
            onClick={() => setMood(emoji)}
            aria-label="Select mood"
          >
            {emoji}
          </button>
        ))}
      </div>
      <div className="slider-row">
        <label htmlFor="sensory">Sensory load: {sensory}/10</label>
        <input
          id="sensory"
          type="range"
          min={0}
          max={10}
          value={sensory}
          onChange={(e) => setSensory(Number(e.target.value))}
        />
      </div>
      <textarea
        className="notes-area small"
        placeholder="How's your body feeling today?"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
    </section>
  )
}
