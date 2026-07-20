import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function MiniCalendar() {
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [marks, setMarks] = useLocalStorage<Record<string, string>>('dashboard.calendarMarks', {})

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

  function markDay(cellDate: Date) {
    const key = dateKey(cellDate)
    const existing = marks[key] ?? ''
    const label = window.prompt('What\'s marked on this day? (leave blank to remove)', existing)
    if (label === null) return
    const trimmed = label.trim()
    const next = { ...marks }
    if (trimmed) next[key] = trimmed
    else delete next[key]
    setMarks(next)
  }

  const upcoming = Object.entries(marks)
    .map(([key, label]) => ({ key, label, date: new Date(`${key}T00:00:00`) }))
    .filter((m) => m.date >= new Date(today.getFullYear(), today.getMonth(), today.getDate()))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 4)

  return (
    <Card icon="📅" title="This Month" variant="scrapbook" surface="pink">
      {upcoming.length > 0 && (
        <div className="coming-up">
          <p className="section-label" style={{ marginTop: 0 }}>
            🎗️ Coming Up
          </p>
          <ul className="c-list">
            {upcoming.map((u) => (
              <li key={u.key} className="c-list-item coming-up-item">
                <span className="coming-up-date">
                  {MONTH_LABELS[u.date.getMonth()].slice(0, 3)} {u.date.getDate()}
                </span>
                <span>{u.label}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
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
          const isToday = isSameDay(cellDate, today)
          const key = dateKey(cellDate)
          const mark = marks[key]
          return (
            <button
              key={i}
              className={`mini-cal-day ${isToday ? 'today' : ''} ${mark ? 'marked' : ''}`}
              onClick={() => markDay(cellDate)}
              title={mark || 'Click to mark this day'}
            >
              {isToday ? '🌸' : day}
              {mark && <span className="mini-cal-dot" />}
            </button>
          )
        })}
      </div>
      <hr className="mini-cal-divider" />
      <div className="card-illustration mini-cal-charm">seasonal sticker</div>
    </Card>
  )
}
