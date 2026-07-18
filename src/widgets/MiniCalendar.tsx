import { useState } from 'react'
import Card from '../components/Card'

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export default function MiniCalendar() {
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  function changeMonth(delta: number) {
    setViewDate(new Date(year, month + delta, 1))
  }

  return (
    <Card icon="📅" title="This Month">
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
          const cellDate = day ? new Date(year, month, day) : null
          const isToday = cellDate && isSameDay(cellDate, today)
          return (
            <span key={i} className={`mini-cal-day ${isToday ? 'today' : ''}`}>
              {isToday ? '🌸' : day ?? ''}
            </span>
          )
        })}
      </div>
    </Card>
  )
}
