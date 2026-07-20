import { useLocalStorage } from '../hooks/useLocalStorage'
import { useDailyArchive } from '../hooks/useDailyArchive'
import Card from '../components/Card'

const WATER_GOAL = 8

export default function WaterProtein() {
  const [water, setWater] = useDailyArchive('dashboard.water', 0)
  const [protein, setProtein] = useDailyArchive('dashboard.protein', 0)
  const [proteinGoal, setProteinGoal] = useLocalStorage('dashboard.proteinGoal', 100)

  return (
    <Card icon="💧" title="Water & Protein" meta={`${water} / ${WATER_GOAL} cups`}>
      <div className="cup-row">
        {Array.from({ length: WATER_GOAL }).map((_, i) => (
          <button
            key={i}
            className={`cup ${i < water ? 'filled' : ''}`}
            onClick={() => setWater(i + 1 === water ? i : i + 1)}
            aria-label={`Cup ${i + 1}`}
          />
        ))}
      </div>
      <div>
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
