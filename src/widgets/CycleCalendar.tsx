import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { localDateKey } from '../lib/logicalDate'
import { cycleDayFor, phasesFor } from '../lib/cycle'
import Card from '../components/Card'

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export default function CycleCalendar() {
  const [lastPeriodStart] = useLocalStorage('bodyweather.cycle.lastPeriodStart', localDateKey(new Date(Date.now() - 11 * 86400000)))
  const [length] = useLocalStorage('bodyweather.cycle.length', 28)
  const [periodLength] = useLocalStorage('bodyweather.cycle.periodLength', 5)
  const [loggedDays, setLoggedDays] = useLocalStorage<string[]>('bodyweather.cycle.loggedDays', [])

  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const phases = phasesFor(length, periodLength)
  const ovulationPhase = phases.find((p) => p.name === 'Ovulation')!
  const fertileStart = Math.max(1, ovulationPhase.start - 5)
  const fertileEnd = ovulationPhase.end

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  function changeMonth(delta: number) {
    setViewDate(new Date(year, month + delta, 1))
  }

  function toggleLogged(dateStr: string) {
    setLoggedDays(loggedDays.includes(dateStr) ? loggedDays.filter((d) => d !== dateStr) : [...loggedDays, dateStr])
  }

  return (
    <Card icon="📅" title="1. Your Cycle Calendar" surface="pink">
      <div className="mini-cal-header">
        <button className="mini-cal-nav" onClick={() => changeMonth(-1)} aria-label="Previous month">
          ‹
        </button>
        <span className="mini-cal-label">
          {MONTH_LABELS[month]} {year}
        </span>
        <button className="mini-cal-nav" onClick={() => changeMonth(1)} aria-label="Next month">
          ›
        </button>
      </div>
      <div className="mini-cal-grid">
        {WEEKDAY_LABELS.map((d, i) => (
          <span key={i} className="mini-cal-weekday">
            {d}
          </span>
        ))}
        {cells.map((day, i) => {
          if (!day) return <span key={i} className="mini-cal-day empty" />
          const cellDate = new Date(year, month, day)
          const dateStr = localDateKey(cellDate)
          const cycleDay = cycleDayFor(lastPeriodStart, length, cellDate)
          const isToday = isSameDay(cellDate, today)
          const isPeriod = cycleDay <= periodLength
          const isFertile = cycleDay >= fertileStart && cycleDay <= fertileEnd
          const isOvulation = cycleDay === ovulationPhase.start || cycleDay === ovulationPhase.end
          const isLogged = loggedDays.includes(dateStr)
          return (
            <button
              key={i}
              className={`mini-cal-day cycle-cal-day ${isToday ? 'today' : ''} ${isPeriod ? 'period' : ''} ${isFertile ? 'fertile' : ''}`}
              onClick={() => toggleLogged(dateStr)}
              title={`Cycle day ${cycleDay}`}
            >
              {day}
              {isOvulation && <span className="cycle-cal-mark ovulation">✦</span>}
              {isLogged && <span className="cycle-cal-mark logged">♡</span>}
            </button>
          )
        })}
      </div>
      <div className="cycle-cal-legend">
        <span>
          <span className="cycle-cal-dot period" /> Period
        </span>
        <span>
          <span className="cycle-cal-dot fertile" /> Fertile Window
        </span>
        <span>✦ Ovulation</span>
        <span>♡ Logged</span>
      </div>
    </Card>
  )
}
