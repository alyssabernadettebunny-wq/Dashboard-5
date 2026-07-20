import { useLocalStorage } from '../hooks/useLocalStorage'
import { useDailyArchive } from '../hooks/useDailyArchive'
import Card from '../components/Card'

const WATER_GOAL = 100

const WATER_BUTTONS = [
  { label: '12 oz', amount: 12 },
  { label: '16.9 oz', amount: 16.9 },
  { label: '20 oz', amount: 20 },
  { label: 'Bowl of ice', amount: 16 },
]

export default function WaterProtein() {
  const [water, setWater] = useDailyArchive('dashboard.water', 0)
  const [protein, setProtein] = useDailyArchive('dashboard.protein', 0)
  const [proteinGoal, setProteinGoal] = useLocalStorage('dashboard.proteinGoal', 100)

  function addWater(amount: number) {
    setWater(Math.round((water + amount) * 10) / 10)
  }

  return (
    <Card icon="💧" title="Water & Protein" meta={`${water} / ${WATER_GOAL} oz`}>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${Math.min(100, (water / WATER_GOAL) * 100)}%` }} />
      </div>
      <div className="hsb-chip-row" style={{ marginTop: 8 }}>
        {WATER_BUTTONS.map((b) => (
          <button key={b.label} className="hsb-chip" onClick={() => addWater(b.amount)} type="button">
            + {b.label}
          </button>
        ))}
        <button className="hsb-chip" onClick={() => setWater(0)} type="button">
          Reset
        </button>
      </div>
      <div style={{ marginTop: 10 }}>
        <div className="stat-row">
          <span>Protein</span>
          <span>
            {protein} / {proteinGoal}g
          </span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${Math.min(100, (protein / (proteinGoal || 1)) * 100)}%` }}
          />
        </div>
        <div className="c-input-row">
          <input type="number" min={0} value={protein} onChange={(e) => setProtein(Number(e.target.value))} />
          <input
            type="number"
            min={0}
            value={proteinGoal}
            onChange={(e) => setProteinGoal(Number(e.target.value))}
          />
        </div>
      </div>
    </Card>
  )
}
