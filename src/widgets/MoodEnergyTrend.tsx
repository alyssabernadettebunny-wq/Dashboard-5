import { useLocalStorage } from '../hooks/useLocalStorage'
import { localDateKey } from '../lib/logicalDate'
import Card from '../components/Card'

interface Entry {
  date: string
  mood: number
  energy: number
}

const MOOD_FACES: { emoji: string; value: number; tile: string }[] = [
  { emoji: '😄', value: 10, tile: 'gold' },
  { emoji: '😊', value: 7.5, tile: 'peach' },
  { emoji: '😐', value: 5, tile: 'pink' },
  { emoji: '😟', value: 2.5, tile: 'indigo' },
  { emoji: '😢', value: 0, tile: 'blue' },
]

function todayStr() {
  return localDateKey()
}

function dayLetter(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 1)
}

export default function MoodEnergyTrend() {
  const [history, setHistory] = useLocalStorage<Entry[]>('bodyweather.trend', [])
  const today = todayStr()
  const todayEntry = history.find((h) => h.date === today)
  const [energy, setEnergy] = useLocalStorage('bodyweather.trend.energyDraft', todayEntry?.energy ?? 5)

  function logMood(value: number) {
    const rest = history.filter((h) => h.date !== today)
    const next = [...rest, { date: today, mood: value, energy: todayEntry?.energy ?? energy }].sort((a, b) => a.date.localeCompare(b.date))
    setHistory(next.slice(-7))
  }

  function logEnergy(value: number) {
    setEnergy(value)
    const rest = history.filter((h) => h.date !== today)
    const next = [...rest, { date: today, mood: todayEntry?.mood ?? 5, energy: value }].sort((a, b) => a.date.localeCompare(b.date))
    setHistory(next.slice(-7))
  }

  const last7 = history.slice(-7)
  const w = 260
  const h = 90
  const stepX = last7.length > 1 ? w / (last7.length - 1) : 0

  function pointsFor(key: 'mood' | 'energy') {
    return last7.map((e, i) => `${i * stepX},${h - (e[key] / 10) * h}`).join(' ')
  }

  return (
    <Card icon="💗" title="Mood & Energy Trend (7 days)" variant="scrapbook" surface="lilac">
      {last7.length === 0 ? (
        <p className="c-empty">Tap a mood below to start your trend.</p>
      ) : (
        <div className="trend2-body">
          <div className="trend2-chart-area">
            <div className="trend2-axis-row">
              <div className="trend2-yaxis" style={{ height: h }}>
                <span>10</span>
                <span>5</span>
                <span>0</span>
              </div>
              <svg className="trend-chart-wrap" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ flex: 1 }}>
                <polyline points={pointsFor('mood')} fill="none" stroke="var(--pink-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points={pointsFor('energy')} fill="none" stroke="var(--purple-heading)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="trend2-daylabels">
              {last7.map((e) => (
                <span key={e.date}>{dayLetter(e.date)}</span>
              ))}
            </div>
          </div>
          <div className="trend2-legend">
            <span className="mood">♡ Mood</span>
            <span className="energy">🦋 Energy</span>
          </div>
        </div>
      )}

      <div className="mood-face-row">
        {MOOD_FACES.map((f) => (
          <button
            key={f.value}
            className={`mood-face-tile mood-face-${f.tile} ${todayEntry?.mood === f.value ? 'active' : ''}`}
            onClick={() => logMood(f.value)}
            aria-label={`Log mood ${f.value}/10`}
          >
            {f.emoji}
          </button>
        ))}
      </div>

      <div className="trend-sliders">
        <div className="stat-row">
          <span>Today's energy</span>
          <span>{energy} / 10</span>
        </div>
        <input type="range" min={0} max={10} value={energy} onChange={(e) => logEnergy(Number(e.target.value))} style={{ accentColor: 'var(--purple-heading)' }} />
      </div>
    </Card>
  )
}
