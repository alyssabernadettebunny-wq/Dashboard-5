import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

const APPETITE_LEVELS = ['Low', 'Normal', 'High']

export default function NourishmentHydration() {
  const [water, setWater] = useLocalStorage('bodyweather.water', 72)
  const [waterGoal, setWaterGoal] = useLocalStorage('bodyweather.waterGoal', 96)
  const [meals, setMeals] = useLocalStorage('bodyweather.meals', 58)
  const [appetite, setAppetite] = useLocalStorage('bodyweather.appetite', 'Low')

  function cycleAppetite() {
    const i = APPETITE_LEVELS.indexOf(appetite)
    setAppetite(APPETITE_LEVELS[(i + 1) % APPETITE_LEVELS.length])
  }

  return (
    <Card icon="💧" title="6. Nourishment / Hydration">
      <div>
        <div className="stat-row">
          <span>💧 Water</span>
          <span>
            {water} oz /{' '}
            <input
              type="number"
              value={waterGoal}
              onChange={(e) => setWaterGoal(Number(e.target.value))}
              style={{ width: 40, border: 'none', background: 'transparent', color: 'inherit', font: 'inherit', textAlign: 'right' }}
            />{' '}
            oz
          </span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${Math.min(100, (water / waterGoal) * 100)}%` }} />
        </div>
        <input type="range" min={0} max={waterGoal} value={water} onChange={(e) => setWater(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--pink-accent)' }} />
      </div>

      <div>
        <div className="stat-row">
          <span>🍽️ Meals</span>
          <span>{meals}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${meals}%` }} />
        </div>
        <input type="range" min={0} max={100} value={meals} onChange={(e) => setMeals(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--purple-heading)' }} />
      </div>

      <div className="stat-row">
        <span>♡ Appetite</span>
        <button className="appetite-pill" onClick={cycleAppetite}>
          {appetite}
        </button>
      </div>
    </Card>
  )
}
