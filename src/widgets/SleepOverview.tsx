import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

const QUALITY_LABELS = ['Very poor', 'Poor', 'Fair', 'Good', 'Excellent']
const GOAL_MIN = 7
const GOAL_MAX = 9

function durationFrom(bedtime: string, waketime: string) {
  if (!bedtime || !waketime) return null
  const [bh, bm] = bedtime.split(':').map(Number)
  const [wh, wm] = waketime.split(':').map(Number)
  let minutes = wh * 60 + wm - (bh * 60 + bm)
  if (minutes <= 0) minutes += 24 * 60
  return minutes
}

export default function SleepOverview() {
  const [bedtime] = useLocalStorage('bodyweather.sleep.bedtime', '23:00')
  const [waketime] = useLocalStorage('bodyweather.sleep.waketime', '07:00')
  const [quality, setQuality] = useLocalStorage('bodyweather.sleep.quality', 4)

  const minutes = durationFrom(bedtime, waketime)
  const hours = minutes !== null ? Math.floor(minutes / 60) : 0
  const mins = minutes !== null ? minutes % 60 : 0
  const durationHrs = minutes !== null ? minutes / 60 : 0
  const progressPct = Math.min(100, (durationHrs / GOAL_MAX) * 100)

  return (
    <Card icon="🌙" title="1. Sleep Overview" surface="lilac">
      <div className="sleep-overview-cols">
        <div className="sleep-mini-panel">
          <p className="sleep-mini-label">Sleep Duration</p>
          <p className="sleep-duration-value">
            {hours}h {mins}m
          </p>
          <p className="sleep-goal-label">
            Goal: {GOAL_MIN}–{GOAL_MAX}h
          </p>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
        <div className="sleep-mini-panel">
          <p className="sleep-mini-label">Sleep Quality</p>
          <p className="sleep-quality-value">{QUALITY_LABELS[quality - 1] ?? 'Good'} ☁️</p>
          <div className="sleep-stars">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} className={`sleep-star ${n <= quality ? 'active' : ''}`} onClick={() => setQuality(n)} aria-label={`Set quality ${n}`}>
                ★
              </button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}
