import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface Recipe {
  id: string
  name: string
  notes: string
}

export default function RecipeBox() {
  const [recipes, setRecipes] = useLocalStorage<Recipe[]>('food.recipes', [])
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')

  function addRecipe() {
    const trimmed = name.trim()
    if (!trimmed) return
    setRecipes([...recipes, { id: crypto.randomUUID(), name: trimmed, notes: notes.trim() }])
    setName('')
    setNotes('')
  }

  function removeRecipe(id: string) {
    setRecipes(recipes.filter((r) => r.id !== id))
  }

  return (
    <Card icon="📖" title="Recipe Box">
      <ul className="c-list">
        {recipes.length === 0 && <li className="c-empty">No saved recipes yet</li>}
        {recipes.map((r) => (
          <li key={r.id} className="c-list-item" style={{ alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: 12.5 }}>{r.name}</strong>
              {r.notes && <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>{r.notes}</p>}
            </div>
            <button className="remove" onClick={() => removeRecipe(r.id)} aria-label="Remove recipe">
              ×
            </button>
          </li>
        ))}
      </ul>
      <div className="c-input-row" style={{ flexDirection: 'column' }}>
        <input type="text" value={name} placeholder="Recipe name..." onChange={(e) => setName(e.target.value)} />
        <input
          type="text"
          value={notes}
          placeholder="Ingredients or notes..."
          onChange={(e) => setNotes(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addRecipe()}
        />
        <button onClick={addRecipe}>Save recipe</button>
      </div>
    </Card>
  )
}
