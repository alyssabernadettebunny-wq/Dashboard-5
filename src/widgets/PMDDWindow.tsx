import { useLocalStorage } from '../hooks/useLocalStorage'
import { localDateKey } from '../lib/logicalDate'
import { cycleDayFor, pmddWindow } from '../lib/cycle'
import Card from '../components/Card'

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function PMDDWindow() {
  const [lastPeriodStart] = useLocalStorage('bodyweather.cycle.lastPeriodStart', localDateKey(new Date(Date.now() - 11 * 86400000)))
  const [length] = useLocalStorage('bodyweather.cycle.length', 28)

  const day = cycleDayFor(lastPeriodStart, length)
  const { start, end } = pmddWindow(length)
  const inWindow = day >= start && day <= end

  const today = new Date()
  const windowStartDate = new Date(today)
  windowStartDate.setDate(today.getDate() - (day - start))
  const windowEndDate = new Date(today)
  windowEndDate.setDate(today.getDate() + (end - day))

  const fmt = (d: Date) => `${MONTH_SHORT[d.getMonth()]} ${d.getDate()}`

  return (
    <Card icon="🌙" title="3. PMDD Sensitivity Window" surface="blue">
      <p className="pmdd-range">
        {fmt(windowStartDate)} — {fmt(windowEndDate)}
      </p>
      <div className="pmdd-dots">
        {Array.from({ length: end - start + 1 }, (_, i) => {
          const dayNum = start + i
          return <span key={i} className={`pmdd-dot ${dayNum === day ? 'today' : dayNum < day ? 'past' : ''}`} />
        })}
      </div>
      <p className="pmdd-blurb">You may feel more sensitive physically & emotionally during this window.</p>
      {inWindow && <span className="pmdd-pill">♡ Be extra gentle with yourself</span>}
    </Card>
  )
}
