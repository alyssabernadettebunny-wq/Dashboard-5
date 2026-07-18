import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface Entry {
  date: string
  mood: number
  energy: number
}

const FACES = ['😊', '🙂', '😐', '😟', '😢']

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function dayLabel(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'narrow' })
}

export default function MoodEnergyTrend() {
  const [history, setHistory] = useLocalStorage<Entry[]>('bodyweather.trend', [])
  const today = todayStr()
  const todayEntry = history.find((h) => h.date === today)
  const [mood, setMood] = useLocalStorage('bodyweather.trend.moodDraft', todayEntry?.mood ?? 5)
  const [energy, setEnergy] = useLocalStorage('bodyweather.trend.energyDraft', todayEntry?.energy ?? 5)

  function logToday() {
    const rest = history.filter((h) => h.date !== today)
    const next = [...rest, { date: today, mood, energy }].sort((a, b) => a.date.localeCompare(b.date))
    setHistory(next.slice(-7))
  }

  const last7 = history.slice(-7)
  const w = 220
  const h = 70
  const stepX = last7.length > 1 ? w / (last7.length - 1) : 0

  function pointsFor(key: 'mood' | 'energy') {
    return last7.map((e, i) => `${i * stepX},${h - (e[key] / 10) * h}`).join(' ')
  }

  return (
    <Card icon="💗" title="Mood & Energy Trend (7 days)">
      {last7.length === 0 ? (
        <p className="c-empty">Log a few days to see your trend.</p>
      ) : (
        <>
          <svg className="trend-chart-wrap" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
            <polyline points={pointsFor('mood')} fill="none" stroke="var(--pink-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points={pointsFor('energy')} fill="none" stroke="var(--purple-heading)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)' }}>
            {last7.map((e) => (
              <span key={e.date}>{dayLabel(e.date)}</span>
            ))}
          </div>
        </>
      )}
      <div className="trend-legend">
        <span>
          <span className="dot" style={{ background: 'var(--pink-accent)' }} /> Mood
        </span>
        <span>
          <span className="dot" style={{ background: 'var(--purple-heading)' }} /> Energy
        </span>
      </div>
      <div className="trend-face-row">
        {FACES.map((f) => (
          <span key={f}>{f}</span>
        ))}
      </div>
      <div className="trend-sliders">
        <div className="stat-row">
          <span>Today's mood</span>
          <span>{mood} / 10</span>
        </div>
        <input type="range" min={0} max={10} value={mood} onChange={(e) => setMood(Number(e.target.value))} style={{ accentColor: 'var(--pink-accent)' }} />
        <div className="stat-row">
          <span>Today's energy</span>
          <span>{energy} / 10</span>
        </div>
        <input type="range" min={0} max={10} value={energy} onChange={(e) => setEnergy(Number(e.target.value))} style={{ accentColor: 'var(--purple-heading)' }} />
      </div>
      <button className="card-footer-btn" onClick={logToday}>
        Log today ♡
      </button>
    </Card>
  )
}
