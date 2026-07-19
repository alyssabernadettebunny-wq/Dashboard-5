import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface Category {
  id: string
  name: string
  limit: number
  spent: number
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'groceries', name: 'Groceries', limit: 400, spent: 0 },
  { id: 'kids', name: 'Kids', limit: 200, spent: 0 },
  { id: 'personal', name: 'Personal', limit: 100, spent: 0 },
  { id: 'pets', name: 'Pets', limit: 100, spent: 0 },
]

export default function BudgetCategories() {
  const [categories, setCategories] = useLocalStorage<Category[]>('money.budget', DEFAULT_CATEGORIES)
  const [expenseAmount, setExpenseAmount] = useState<Record<string, string>>({})
  const [newName, setNewName] = useState('')
  const [newLimit, setNewLimit] = useState('')

  function logExpense(id: string) {
    const amount = Number(expenseAmount[id])
    if (!amount) return
    setCategories(categories.map((c) => (c.id === id ? { ...c, spent: c.spent + amount } : c)))
    setExpenseAmount({ ...expenseAmount, [id]: '' })
  }

  function updateLimit(id: string, limit: number) {
    setCategories(categories.map((c) => (c.id === id ? { ...c, limit } : c)))
  }

  function resetSpent(id: string) {
    setCategories(categories.map((c) => (c.id === id ? { ...c, spent: 0 } : c)))
  }

  function removeCategory(id: string) {
    setCategories(categories.filter((c) => c.id !== id))
  }

  function addCategory() {
    if (!newName.trim()) return
    setCategories([...categories, { id: crypto.randomUUID(), name: newName.trim(), limit: Number(newLimit) || 0, spent: 0 }])
    setNewName('')
    setNewLimit('')
  }

  return (
    <Card icon="💸" title="Budget by Category" wide meta="Resets whenever you're ready for a new month">
      <div className="two-col">
        {categories.map((c) => {
          const pct = c.limit ? Math.min(100, (c.spent / c.limit) * 100) : 0
          const over = c.spent > c.limit
          return (
            <div key={c.id} className="mini-profile">
              <div className="name">{c.name}</div>
              <div className="stat-row">
                <span>Spent</span>
                <span style={{ color: over ? 'var(--pink-accent)' : 'inherit' }}>
                  ${c.spent} / ${c.limit}
                </span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${pct}%`, background: over ? 'var(--pink-accent)' : undefined }}
                />
              </div>
              <div className="c-input-row" style={{ marginTop: 6 }}>
                <input
                  type="number"
                  placeholder="Log $ spent"
                  value={expenseAmount[c.id] ?? ''}
                  onChange={(e) => setExpenseAmount({ ...expenseAmount, [c.id]: e.target.value })}
                  style={{ maxWidth: 90 }}
                />
                <button onClick={() => logExpense(c.id)}>Add</button>
                <button className="card-footer-btn" onClick={() => resetSpent(c.id)}>
                  Reset
                </button>
              </div>
              <div className="c-input-row" style={{ marginTop: 4 }}>
                <span className="sub" style={{ marginLeft: 0 }}>
                  Limit
                </span>
                <input
                  type="number"
                  value={c.limit}
                  onChange={(e) => updateLimit(c.id, Number(e.target.value))}
                  style={{ maxWidth: 80 }}
                />
                <button className="remove" onClick={() => removeCategory(c.id)} aria-label="Remove category">
                  ×
                </button>
              </div>
            </div>
          )
        })}
      </div>
      <div className="c-input-row" style={{ marginTop: 8 }}>
        <input type="text" placeholder="New category" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <input type="number" placeholder="Limit $" value={newLimit} onChange={(e) => setNewLimit(e.target.value)} style={{ maxWidth: 90 }} />
        <button onClick={addCategory}>Add category</button>
      </div>
    </Card>
  )
}
