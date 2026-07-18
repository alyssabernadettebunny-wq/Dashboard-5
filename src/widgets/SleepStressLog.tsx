import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface Entry {
  date: string
  sleep: number
  stress: number
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default function SleepStressLog() {
  const [history, setHistory] = useLocalStorage<Entry[]>('bodyweather.sleepstress', [])
  const today = todayStr()
  const todayEntry = history.find((h) => h.date === today)
  const [sleep, setSleep] = useLocalStorage('bodyweather.sleepstress.sleepDraft', todayEntry?.sleep ?? 7)
  const [stress, setStress] = useLocalStorage('bodyweather.sleepstress.stressDraft', todayEntry?.stress ?? 4)

  function logToday() {
    const rest = history.filter((h) => h.date !== today)
    setHistory([...rest, { date: today, sleep, stress }].sort((a, b) => a.date.localeCompare(b.date)).slice(-7))
  }

  const last7 = history.slice(-7)
  const w = 220
  const h = 60

  function pointsFor(key: 'sleep' | 'stress', max: number) {
    const stepX = last7.length > 1 ? w / (last7.length - 1) : 0
    return last7.map((e, i) => `${i * stepX},${h - (e[key] / max) * h}`).join(' ')
  }

  return (
    <Card icon="🌙" title="Sleep & Stress">
      {last7.length > 0 && (
        <svg className="trend-chart-wrap" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
          <polyline points={pointsFor('sleep', 12)} fill="none" stroke="var(--purple-heading)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points={pointsFor('stress', 10)} fill="none" stroke="var(--pink-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      <div className="trend-legend">
        <span>
          <span className="dot" style={{ background: 'var(--purple-heading)' }} /> Sleep (hrs)
        </span>
        <span>
          <span className="dot" style={{ background: 'var(--pink-accent)' }} /> Stress
        </span>
      </div>
      <div className="trend-sliders">
        <div className="stat-row">
          <span>🌙 Sleep</span>
          <span>{sleep} hrs</span>
        </div>
        <input type="range" min={0} max={12} step={0.5} value={sleep} onChange={(e) => setSleep(Number(e.target.value))} style={{ accentColor: 'var(--purple-heading)' }} />
        <div className="stat-row">
          <span>☁️ Stress</span>
          <span>{stress} / 10</span>
        </div>
        <input type="range" min={0} max={10} value={stress} onChange={(e) => setStress(Number(e.target.value))} style={{ accentColor: 'var(--pink-accent)' }} />
      </div>
      <button className="card-footer-btn" onClick={logToday}>
        Log today ♡
      </button>
    </Card>
  )
}
