import { useEffect, useRef, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface Task {
  id: string
  text: string
  done: boolean
}

interface DayPlan {
  day: string
  icon: string
  tasks: Task[]
  mood: string
  energy: number
}

const DAY_ICONS: Record<string, string> = {
  Monday: '☀️',
  Tuesday: '🌸',
  Wednesday: '⭐',
  Thursday: '☁️',
  Friday: '💗',
  Saturday: '☀️',
  Sunday: '🌙',
}

const MOOD_CYCLE = ['🙂', '😊', '😌', '🥱', '😔', '✨']

const DEFAULT_WEEK: DayPlan[] = [
  { day: 'Monday', icon: DAY_ICONS.Monday, tasks: [], mood: '🙂', energy: 0 },
  { day: 'Tuesday', icon: DAY_ICONS.Tuesday, tasks: [], mood: '🙂', energy: 0 },
  { day: 'Wednesday', icon: DAY_ICONS.Wednesday, tasks: [], mood: '🙂', energy: 0 },
  { day: 'Thursday', icon: DAY_ICONS.Thursday, tasks: [], mood: '🙂', energy: 0 },
  { day: 'Friday', icon: DAY_ICONS.Friday, tasks: [], mood: '🙂', energy: 0 },
  { day: 'Saturday', icon: DAY_ICONS.Saturday, tasks: [], mood: '🙂', energy: 0 },
  { day: 'Sunday', icon: DAY_ICONS.Sunday, tasks: [], mood: '🙂', energy: 0 },
]

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function thisWeekDates() {
  const now = new Date()
  const mondayOffset = (now.getDay() + 6) % 7
  const monday = new Date(now)
  monday.setDate(now.getDate() - mondayOffset)
  const dates: Record<string, string> = {}
  DAY_ORDER.forEach((day, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    dates[day] = `${d.getMonth() + 1}/${d.getDate()}`
  })
  return dates
}

const today = new Date().toLocaleDateString(undefined, { weekday: 'long' })

export default function WeeklyRhythm() {
  const [week, setWeek] = useLocalStorage<DayPlan[]>('rhythm.weekly', DEFAULT_WEEK)
  const migratedRef = useRef(false)
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const dates = thisWeekDates()

  useEffect(() => {
    if (migratedRef.current) return
    migratedRef.current = true
    const needsMigration = week.some((d) => (d as unknown as { tasks?: Task[] }).tasks === undefined)
    if (needsMigration) {
      setWeek((prev) =>
        prev.map((d) => {
          const old = d as unknown as { focus?: string }
          return {
            day: d.day,
            icon: d.icon ?? DAY_ICONS[d.day] ?? '⭐',
            tasks: d.tasks ?? (old.focus ? [{ id: crypto.randomUUID(), text: old.focus, done: false }] : []),
            mood: d.mood ?? '🙂',
            energy: d.energy ?? 0,
          }
        }),
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function updateDay(day: string, patch: Partial<DayPlan>) {
    setWeek(week.map((d) => (d.day === day ? { ...d, ...patch } : d)))
  }

  function addTask(day: string) {
    const text = (drafts[day] ?? '').trim()
    if (!text) return
    const d = week.find((x) => x.day === day)
    if (!d) return
    updateDay(day, { tasks: [...(d.tasks ?? []), { id: crypto.randomUUID(), text, done: false }] })
    setDrafts((prev) => ({ ...prev, [day]: '' }))
  }

  function toggleTask(day: string, id: string) {
    const d = week.find((x) => x.day === day)
    if (!d) return
    updateDay(day, { tasks: (d.tasks ?? []).map((t) => (t.id === id ? { ...t, done: !t.done } : t)) })
  }

  function removeTask(day: string, id: string) {
    const d = week.find((x) => x.day === day)
    if (!d) return
    updateDay(day, { tasks: (d.tasks ?? []).filter((t) => t.id !== id) })
  }

  function cycleMood(day: string) {
    const d = week.find((x) => x.day === day)
    if (!d) return
    const next = MOOD_CYCLE[(MOOD_CYCLE.indexOf(d.mood ?? '🙂') + 1) % MOOD_CYCLE.length]
    updateDay(day, { mood: next })
  }

  return (
    <Card icon="🗓️" title="This Week's Rhythm" wide meta="Edit anytime as your weeks change">
      <div className="week-cols">
        {week.map((d) => (
          <div key={d.day} className={`week-day-col ${d.day === today ? 'today' : ''}`}>
            <div className="week-day-head">
              <span>{d.icon}</span>
              <span className="week-day-name">
                {d.day.slice(0, 3)} {dates[d.day]}
              </span>
            </div>
            <ul className="week-day-tasks">
              {(d.tasks ?? []).map((t) => (
                <li key={t.id} className={`week-task ${t.done ? 'done' : ''}`}>
                  <input type="checkbox" checked={t.done} onChange={() => toggleTask(d.day, t.id)} />
                  <span>{t.text}</span>
                  <button className="remove" onClick={() => removeTask(d.day, t.id)} aria-label="Remove task">
                    ×
                  </button>
                </li>
              ))}
            </ul>
            <input
              type="text"
              className="week-task-input"
              placeholder="+ add..."
              value={drafts[d.day] ?? ''}
              onChange={(e) => setDrafts((prev) => ({ ...prev, [d.day]: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && addTask(d.day)}
            />
            <div className="week-day-footer">
              <button className="week-mood-btn" onClick={() => cycleMood(d.day)} title="Cycle mood">
                Mood: {d.mood ?? '🙂'}
              </button>
              <span className="week-energy">
                Energy:{' '}
                {[0, 1, 2, 3, 4].map((i) => (
                  <button
                    key={i}
                    className={`week-energy-dot ${i < (d.energy ?? 0) ? 'filled' : ''}`}
                    onClick={() => updateDay(d.day, { energy: (d.energy ?? 0) === i + 1 ? i : i + 1 })}
                    aria-label={`Set energy to ${i + 1}`}
                  />
                ))}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
