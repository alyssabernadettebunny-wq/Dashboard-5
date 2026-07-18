import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface Meal {
  dish: string
  details: string
}

const DEFAULT_MEALS: Record<string, Meal> = {
  Breakfast: { dish: 'yogurt + berries', details: 'honey + granola' },
  Lunch: { dish: 'salmon bowl', details: 'avocado, edamame, rice' },
  Dinner: { dish: 'turkey tacos', details: 'slaw, salsa, feta' },
  'Night Snack': { dish: 'warm coconut drink', details: 'dark chocolate' },
}

const SLOTS: { key: string; icon: string }[] = [
  { key: 'Breakfast', icon: '🍓' },
  { key: 'Lunch', icon: '🥑' },
  { key: 'Dinner', icon: '🌙' },
  { key: 'Night Snack', icon: '🌸' },
]

export default function TodaysMeals() {
  const [meals, setMeals] = useLocalStorage<Record<string, Meal>>('food.today.meals', DEFAULT_MEALS)
  const [note, setNote] = useLocalStorage('food.today.note', 'Nourish your body, love your body 🤍')

  function updateMeal(key: string, patch: Partial<Meal>) {
    setMeals({ ...meals, [key]: { ...meals[key], ...patch } })
  }

  return (
    <Card icon="⭐" title="Today's Meals">
      {SLOTS.map((slot) => (
        <div key={slot.key} className="meal-slot">
          <span className="meal-slot-label">
            {slot.icon} {slot.key}
          </span>
          <input
            className="meal-dish-input"
            value={meals[slot.key]?.dish ?? ''}
            onChange={(e) => updateMeal(slot.key, { dish: e.target.value })}
            placeholder="Dish..."
          />
          <input
            className="meal-details-input"
            value={meals[slot.key]?.details ?? ''}
            onChange={(e) => updateMeal(slot.key, { details: e.target.value })}
            placeholder="Details..."
          />
        </div>
      ))}
      <div className="card-aphorism">
        <input value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
    </Card>
  )
}
