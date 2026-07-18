import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface Goal {
  id: string
  label: string
  pct: number
}

const DEFAULT_MISA_GOALS: Goal[] = [
  { id: '1', label: 'Leash manners', pct: 80 },
  { id: '2', label: 'Sit', pct: 80 },
  { id: '3', label: 'Stay', pct: 60 },
  { id: '4', label: 'Come when called', pct: 75 },
]

const DEFAULT_COCO_GOALS: Goal[] = [
  { id: '1', label: 'Come (treat recall)', pct: 60 },
  { id: '2', label: 'High five', pct: 70 },
  { id: '3', label: 'Gentle paws', pct: 50 },
]

function GoalList({ goals, setGoals }: { goals: Goal[]; setGoals: (g: Goal[]) => void }) {
  function updatePct(id: string, pct: number) {
    setGoals(goals.map((g) => (g.id === id ? { ...g, pct } : g)))
  }

  return (
    <>
      {goals.map((g) => (
        <div key={g.id} className="goal-row">
          <div className="goal-row-top">
            <span>{g.label}</span>
            <span>{g.pct}%</span>
          </div>
          <div className="goal-blocks">
            {Array.from({ length: 10 }).map((_, i) => (
              <button
                key={i}
                className={`goal-block ${i < g.pct / 10 ? 'filled' : ''}`}
                onClick={() => updatePct(g.id, (i + 1) * 10)}
                aria-label={`Set ${g.label} to ${(i + 1) * 10}%`}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  )
}

export default function TrainingGoals() {
  const [misaGoals, setMisaGoals] = useLocalStorage('pets.misa.goals', DEFAULT_MISA_GOALS)
  const [cocoGoals, setCocoGoals] = useLocalStorage('pets.coco.goals', DEFAULT_COCO_GOALS)
  const [misaNote, setMisaNote] = useLocalStorage('pets.misa.goalNote', 'practiced "Stay" for 2 mins!')
  const [cocoNote, setCocoNote] = useLocalStorage('pets.coco.goalNote', 'Came when called 3x!')

  return (
    <Card icon="🎯" title="Training Goals">
      <p className="section-label" style={{ marginTop: 0 }}>
        Misa
      </p>
      <GoalList goals={misaGoals} setGoals={setMisaGoals} />
      <div className="goal-today-note">
        🌟 Today: <input style={{ border: 'none', background: 'transparent', font: 'inherit', color: 'inherit' }} value={misaNote} onChange={(e) => setMisaNote(e.target.value)} />
      </div>

      <p className="section-label">Coco</p>
      <GoalList goals={cocoGoals} setGoals={setCocoGoals} />
      <div className="goal-today-note">
        🌸 Win! <input style={{ border: 'none', background: 'transparent', font: 'inherit', color: 'inherit' }} value={cocoNote} onChange={(e) => setCocoNote(e.target.value)} />
      </div>
    </Card>
  )
}
