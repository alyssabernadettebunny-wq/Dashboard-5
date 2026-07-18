import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const ROWS = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Drink']

const DEFAULTS: Record<string, string> = {
  'Breakfast-Mon': 'oats & banana',
  'Breakfast-Tue': 'yogurt & berries',
  'Breakfast-Wed': 'avocado toast',
  'Breakfast-Thu': 'smoothie bowl',
  'Breakfast-Fri': 'scrambled eggs',
  'Breakfast-Sat': 'pancakes & fruit',
  'Breakfast-Sun': 'overnight oats',
  'Lunch-Mon': 'chicken salad',
  'Lunch-Tue': 'salmon bowl',
  'Lunch-Wed': 'quinoa bowl',
  'Lunch-Thu': 'tuna wrap',
  'Lunch-Fri': 'veggie soup',
  'Lunch-Sat': 'soba noodles',
  'Lunch-Sun': 'caprese sandwich',
  'Dinner-Mon': 'pasta alfredo',
  'Dinner-Tue': 'turkey tacos',
  'Dinner-Wed': 'miso soup + rice',
  'Dinner-Thu': 'stir fry veggies',
  'Dinner-Fri': 'coconut curry',
  'Dinner-Sat': 'pizza night',
  'Dinner-Sun': 'lemon garlic fish',
  'Snack-Mon': 'cherries',
  'Snack-Tue': 'mango cup',
  'Snack-Wed': 'nuts',
  'Snack-Thu': 'yogurt cup',
  'Snack-Fri': 'seaweed snacks',
  'Snack-Sat': 'popcorn',
  'Snack-Sun': 'dark choc',
  'Drink-Mon': 'iced latte',
  'Drink-Tue': 'matcha latte',
  'Drink-Wed': 'coconut water',
  'Drink-Thu': 'pink lemonade',
  'Drink-Fri': 'green smoothie',
  'Drink-Sat': 'iced coffee',
  'Drink-Sun': 'herbal tea',
}

export default function WeeklyMealPlan() {
  const [plan, setPlan] = useLocalStorage<Record<string, string>>('food.weeklyplan', DEFAULTS)

  function update(row: string, day: string, value: string) {
    setPlan({ ...plan, [`${row}-${day}`]: value })
  }

  return (
    <Card icon="🗓️" title="Weekly Meal Plan" wide>
      <div className="week-table-wrap">
        <table className="week-table">
          <thead>
            <tr>
              <th />
              {DAYS.map((d) => (
                <th key={d}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row}>
                <td className="row-label">{row}</td>
                {DAYS.map((day) => (
                  <td key={day}>
                    <input value={plan[`${row}-${day}`] ?? ''} onChange={(e) => update(row, day, e.target.value)} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
