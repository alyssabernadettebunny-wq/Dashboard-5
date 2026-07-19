import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface Habit {
  id: string
  icon: string
  name: string
  days: boolean[] // 7 entries, index 6 = today, index 0 = 6 days ago
}

const DEFAULT_HABITS: Habit[] = [
  { id: 'h1', icon: '🐾', name: 'Morning dog care', days: Array(7).fill(false) },
  { id: 'h2', icon: '💧', name: 'Drink water (100oz)', days: Array(7).fill(false) },
  { id: 'h3', icon: '🌱', name: 'Move my body', days: Array(7).fill(false) },
  { id: 'h4', icon: '🚫', name: 'No spend', days: Array(7).fill(false) },
]

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

  function toggleDay(id: string, dayIndex: number) {
    setHabits(
      habits.map((h) =>
        h.id === id ? { ...h, days: h.days.map((d, i) => (i === dayIndex ? !d : d)) } : h
      )
    )
  }

  const streak = currentStreak(habits)

  return (
    <Card icon="🐣" title="Habits Today">
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
                  aria-label={`Toggle day ${i + 1}`}
                >
                  {done ? '★' : '☆'}
                </button>
              ))}
            </span>
          </div>
        ))}
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
