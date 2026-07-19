import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface Goal {
  id: string
  name: string
  target: number
  current: number
}

const DEFAULT_GOALS: Goal[] = [{ id: 'emergency', name: 'Emergency Fund', target: 1000, current: 0 }]

export default function SavingsGoals() {
  const [goals, setGoals] = useLocalStorage<Goal[]>('money.savings', DEFAULT_GOALS)
  const [addAmount, setAddAmount] = useState<Record<string, string>>({})
  const [newName, setNewName] = useState('')
  const [newTarget, setNewTarget] = useState('')

  function addToGoal(id: string) {
    const amount = Number(addAmount[id])
    if (!amount) return
    setGoals(goals.map((g) => (g.id === id ? { ...g, current: g.current + amount } : g)))
    setAddAmount({ ...addAmount, [id]: '' })
  }

  function updateTarget(id: string, target: number) {
    setGoals(goals.map((g) => (g.id === id ? { ...g, target } : g)))
  }

  function removeGoal(id: string) {
    setGoals(goals.filter((g) => g.id !== id))
  }

  function addGoal() {
    if (!newName.trim()) return
    setGoals([...goals, { id: crypto.randomUUID(), name: newName.trim(), target: Number(newTarget) || 0, current: 0 }])
    setNewName('')
    setNewTarget('')
  }

  return (
    <Card icon="🎯" title="Savings Goals" wide>
      <div className="two-col">
        {goals.map((g) => {
          const pct = g.target ? Math.min(100, (g.current / g.target) * 100) : 0
          const reached = g.current >= g.target && g.target > 0
          return (
            <div key={g.id} className="mini-profile">
              <div className="name">
                {g.name} {reached && '🎉'}
              </div>
              <div className="stat-row">
                <span>Progress</span>
                <span>
                  ${g.current} / ${g.target}
                </span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${pct}%` }} />
              </div>
              <div className="c-input-row" style={{ marginTop: 6 }}>
                <input
                  type="number"
                  placeholder="Add $"
                  value={addAmount[g.id] ?? ''}
                  onChange={(e) => setAddAmount({ ...addAmount, [g.id]: e.target.value })}
                  style={{ maxWidth: 90 }}
                />
                <button onClick={() => addToGoal(g.id)}>Add</button>
              </div>
              <div className="c-input-row" style={{ marginTop: 4 }}>
                <span className="sub" style={{ marginLeft: 0 }}>
                  Target
                </span>
                <input
                  type="number"
                  value={g.target}
                  onChange={(e) => updateTarget(g.id, Number(e.target.value))}
                  style={{ maxWidth: 90 }}
                />
                <button className="remove" onClick={() => removeGoal(g.id)} aria-label="Remove goal">
                  ×
                </button>
              </div>
            </div>
          )
        })}
      </div>
      <div className="c-input-row" style={{ marginTop: 8 }}>
        <input type="text" placeholder="New goal" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <input type="number" placeholder="Target $" value={newTarget} onChange={(e) => setNewTarget(e.target.value)} style={{ maxWidth: 90 }} />
        <button onClick={addGoal}>Add goal</button>
      </div>
    </Card>
  )
}
