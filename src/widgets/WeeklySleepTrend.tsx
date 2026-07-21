import { useLocalStorage } from '../hooks/useLocalStorage'
import { localDateKey } from '../lib/logicalDate'
import Card from '../components/Card'

interface SleepEntry {
  date: string
  hours: number
  quality: number
}

const GOAL_HOURS = 8
const MAX_SCALE = 10

function dayLabel(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return {
    weekday: d.toLocaleDateString(undefined, { weekday: 'short' }),
    date: `${d.getMonth() + 1}/${d.getDate()}`,
  }
}

export default function WeeklySleepTrend() {
  const [history] = useLocalStorage<SleepEntry[]>('bodyweather.sleep.history', [])
  const today = localDateKey()
  const last7 = history.slice(-7)

  return (
    <Card icon="☁️" title="3. Weekly Sleep Trend" surface="blue">
      <div className="sleep-trend-header">
        <span>Hours Slept</span>
        <span>Goal: 7–9h</span>
      </div>
      {last7.length === 0 ? (
        <p className="c-empty">Log a few nights to see your trend.</p>
      ) : (
        <div className="sleep-bar-chart">
          <div className="sleep-bar-goal-line" style={{ bottom: `${(GOAL_HOURS / MAX_SCALE) * 100}%` }} />
          {last7.map((h) => {
            const label = dayLabel(h.date)
            const isToday = h.date === today
            return (
              <div key={h.date} className="sleep-bar-col">
                <div className="sleep-bar-track">
                  <div className={`sleep-bar-fill ${isToday ? 'today' : ''}`} style={{ height: `${Math.min(100, (h.hours / MAX_SCALE) * 100)}%` }} />
                </div>
                <span className={`sleep-bar-label ${isToday ? 'today' : ''}`}>
                  {label.weekday}
                  <br />
                  {label.date}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
