import { useLocalStorage } from '../hooks/useLocalStorage'
import { localDateKey } from '../lib/logicalDate'
import Card from '../components/Card'

interface SleepEntry {
  date: string
  hours: number
  quality: number
}

function to12Hour(t: string) {
  if (!t) return ''
  const [h, m] = t.split(':').map(Number)
  const meridiem = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${hour}:${String(m).padStart(2, '0')} ${meridiem}`
}

function durationHoursFrom(bedtime: string, waketime: string) {
  if (!bedtime || !waketime) return 0
  const [bh, bm] = bedtime.split(':').map(Number)
  const [wh, wm] = waketime.split(':').map(Number)
  let minutes = wh * 60 + wm - (bh * 60 + bm)
  if (minutes <= 0) minutes += 24 * 60
  return Math.round((minutes / 60) * 100) / 100
}

export default function SleepDetails() {
  const [bedtime, setBedtime] = useLocalStorage('bodyweather.sleep.bedtime', '23:00')
  const [waketime, setWaketime] = useLocalStorage('bodyweather.sleep.waketime', '07:00')
  const [wakeups, setWakeups] = useLocalStorage('bodyweather.sleep.wakeups', 0)
  const [notes, setNotes] = useLocalStorage('bodyweather.sleep.notes', '')
  const [quality] = useLocalStorage('bodyweather.sleep.quality', 4)
  const [history, setHistory] = useLocalStorage<SleepEntry[]>('bodyweather.sleep.history', [])

  function logNight() {
    const today = localDateKey()
    const hours = durationHoursFrom(bedtime, waketime)
    const rest = history.filter((h) => h.date !== today)
    setHistory([...rest, { date: today, hours, quality }].sort((a, b) => a.date.localeCompare(b.date)).slice(-7))
  }

  return (
    <Card icon="🎀" title="2. Sleep Details" surface="pink">
      <div className="sleep-detail-row">
        <div className="sleep-detail-item">
          <p className="sleep-mini-label">🌙 Bedtime</p>
          <input type="time" className="sleep-time-input" value={bedtime} onChange={(e) => setBedtime(e.target.value)} />
          <p className="sleep-detail-sub">Last night</p>
        </div>
        <div className="sleep-detail-item">
          <p className="sleep-mini-label">☀️ Wake Time</p>
          <input type="time" className="sleep-time-input" value={waketime} onChange={(e) => setWaketime(e.target.value)} />
          <p className="sleep-detail-sub">This morning</p>
        </div>
        <div className="sleep-detail-item">
          <p className="sleep-mini-label">☁️ Wake-Ups</p>
          <div className="sleep-wakeups-stepper">
            <button onClick={() => setWakeups(Math.max(0, wakeups - 1))} aria-label="Decrease">
              −
            </button>
            <span>{wakeups}</span>
            <button onClick={() => setWakeups(wakeups + 1)} aria-label="Increase">
              +
            </button>
          </div>
          <p className="sleep-detail-sub">Total</p>
        </div>
      </div>
      <p className="sleep-summary-line">
        🌙 Bedtime {to12Hour(bedtime)} · Wake {to12Hour(waketime)}
      </p>
      <textarea
        className="c-textarea sleep-notes"
        placeholder="How did last night go? A little interrupted, but overall a good night... ♡"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      <button className="card-footer-btn" onClick={logNight}>
        Log last night ♡
      </button>
    </Card>
  )
}
