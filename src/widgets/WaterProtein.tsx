import { useLocalStorage } from '../hooks/useLocalStorage'
import './widgets.css'

const WATER_GOAL = 8

export default function WaterProtein() {
  const [water, setWater] = useLocalStorage('dashboard.water', 0)
  const [protein, setProtein] = useLocalStorage('dashboard.protein', 0)
  const [proteinGoal, setProteinGoal] = useLocalStorage('dashboard.proteinGoal', 100)

  return (
    <section className="widget">
      <h2><span className="icon-badge">💧</span> Water & Protein</h2>
      <div className="hydration">
        <div className="cups">
          {Array.from({ length: WATER_GOAL }).map((_, i) => (
            <button
              key={i}
              className={`cup ${i < water ? 'filled' : ''}`}
              onClick={() => setWater(i + 1 === water ? i : i + 1)}
              aria-label={`Cup ${i + 1}`}
            >
              💧
            </button>
          ))}
        </div>
        <p className="hydration-count">
          {water} / {WATER_GOAL} cups
        </p>
      </div>
      <div className="protein-tracker">
        <label>
          Protein (g):
          <input
            type="number"
            min={0}
            value={protein}
            onChange={(e) => setProtein(Number(e.target.value))}
          />
          <span className="goal-of"> / </span>
          <input
            type="number"
            min={0}
            value={proteinGoal}
            onChange={(e) => setProteinGoal(Number(e.target.value))}
          />
          <span> g goal</span>
        </label>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${Math.min(100, (protein / (proteinGoal || 1)) * 100)}%` }}
          />
        </div>
      </div>
    </section>
  )
}
