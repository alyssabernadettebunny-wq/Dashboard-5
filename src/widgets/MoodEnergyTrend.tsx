import { useLocalStorage } from '../hooks/useLocalStorage'
import { localDateKey } from '../lib/logicalDate'
import Card from '../components/Card'

interface Entry {
  date: string
  mood: number
  energy: number
}

function todayStr() {
  return localDateKey()
}

function dayLabel(dateStr: string, isToday: boolean) {
  if (isToday) return 'Today'
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short' })
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
  const w = 260
  const h = 80
  const stepX = last7.length > 1 ? w / (last7.length - 1) : 0

  function pointsFor(key: 'mood' | 'energy') {
    return last7.map((e, i) => `${i * stepX},${h - (e[key] / 10) * h}`).join(' ')
  }

  const moodPoints = pointsFor('mood')
  const areaPoints = last7.length > 1 ? `0,${h} ${moodPoints} ${(last7.length - 1) * stepX},${h}` : ''

  return (
    <Card icon="📈" title="Trend This Week" meta="Mood & Energy">
      {last7.length === 0 ? (
        <p className="c-empty">Log a few days to see your trend.</p>
      ) : (
        <div className="trend2-body">
          <div className="trend2-legend">
            <span className="mood">● Mood ♡</span>
            <span className="energy">● Energy ✦</span>
          </div>
          <div className="trend2-chart-area">
            <div className="trend2-axis-row">
              <div className="trend2-yaxis" style={{ height: h }}>
                <span>10</span>
                <span>5</span>
                <span>0</span>
              </div>
              <svg className="trend-chart-wrap" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ flex: 1 }}>
                {areaPoints && <polygon points={areaPoints} fill="var(--pink-pale)" opacity="0.6" />}
                <polyline points={pointsFor('energy')} fill="none" stroke="var(--purple-heading)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points={moodPoints} fill="none" stroke="var(--pink-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="trend2-daylabels">
              {last7.map((e, i) => (
                <span key={e.date} className={i === last7.length - 1 ? 'today' : ''}>
                  {dayLabel(e.date, i === last7.length - 1)}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
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
