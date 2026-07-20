import { useEffect, useRef, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

function last7DayLetters() {
  const today = new Date().getDay()
  return Array.from({ length: 7 }, (_, i) => WEEKDAY_LETTERS[(today - 6 + i + 70) % 7])
}

interface Habit {
  id: string
  icon: string
  name: string
  days: boolean[] // 7 entries, index 6 = today, index 0 = 6 days ago
}

const DEFAULT_HABITS: Habit[] = [
  { id: 'h1', icon: '🐾', name: 'Morning dog care', days: Array(7).fill(false) },
  { id: 'h2', icon: '💧', name: 'Drink water (100oz)', days: Array(7).fill(false) },
]

const REMOVED_HABITS = ['Move my body', 'No spend']

function currentStreak(habits: Habit[]) {
  if (habits.length === 0) return 0
  let streak = 0
  for (let i = 6; i >= 0; i--) {
    const allDone = habits.every((h) => h.days[i])
    if (!allDone) break
    streak++
  }
  return streak
}

export default function HabitsToday() {
  const [habits, setHabits] = useLocalStorage<Habit[]>('dashboard.habitstoday', DEFAULT_HABITS)
  const cleanedRef = useRef(false)
  const [newHabit, setNewHabit] = useState('')
  const dayLetters = last7DayLetters()

  useEffect(() => {
    if (cleanedRef.current) return
    cleanedRef.current = true
    if (habits.some((h) => REMOVED_HABITS.includes(h.name))) {
      setHabits((prev) => prev.filter((h) => !REMOVED_HABITS.includes(h.name)))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toggleDay(id: string, dayIndex: number) {
    setHabits(
      habits.map((h) =>
        h.id === id ? { ...h, days: h.days.map((d, i) => (i === dayIndex ? !d : d)) } : h
      )
    )
  }

  function addHabit() {
    const trimmed = newHabit.trim()
    if (!trimmed) return
    setHabits([...habits, { id: crypto.randomUUID(), icon: '✨', name: trimmed, days: Array(7).fill(false) }])
    setNewHabit('')
  }

  function removeHabit(id: string) {
    setHabits(habits.filter((h) => h.id !== id))
  }

  const streak = currentStreak(habits)

  return (
    <Card icon="🐣" title="Habits Today" variant="gingham" surface="mint">
      <p className="section-label" style={{ marginTop: 0 }}>
        Tap a star for each day you kept it up
      </p>
      {habits.length > 0 && (
        <div className="habit-day-letters">
          <span className="habit-day-letters-spacer" />
          {dayLetters.map((letter, i) => (
            <span key={i}>{letter}</span>
          ))}
        </div>
      )}
      <div className="habit-rows">
        {habits.map((habit) => (
          <div key={habit.id} className="habit-row">
            <span className="habit-label">
              {habit.icon} {habit.name}
            </span>
            <span className="habit-stars">
              {habit.days.map((done, i) => (
                <button
                  key={i}
                  className={`habit-star ${done ? 'active' : ''}`}
                  onClick={() => toggleDay(habit.id, i)}
                  aria-label={`Toggle ${dayLetters[i]}`}
                  title={i === 6 ? 'Today' : undefined}
                >
                  {done ? '★' : '☆'}
                </button>
              ))}
            </span>
            <button className="remove" onClick={() => removeHabit(habit.id)} aria-label="Remove habit">
              ×
            </button>
          </div>
        ))}
      </div>
      <div className="c-input-row" style={{ marginTop: 4 }}>
        <input
          type="text"
          placeholder="Add a habit to track..."
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addHabit()}
        />
        <button onClick={addHabit}>Add</button>
      </div>
      <div className="habit-streak-row">
        <p className="habit-streak-text">Keep the streak going! ✨</p>
        {streak > 0 && (
          <span className="habit-streak-ribbon">
            {streak}
            <br />
            day streak
          </span>
        )}
      </div>
    </Card>
  )
}
