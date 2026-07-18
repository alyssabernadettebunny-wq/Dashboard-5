import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface PantryItem {
  id: string
  icon: string
  text: string
  status: 'stocked' | 'low'
}

const DEFAULT_ITEMS: Omit<PantryItem, 'id'>[] = [
  { icon: '🍚', text: 'Rice', status: 'stocked' },
  { icon: '🍝', text: 'Pasta', status: 'stocked' },
  { icon: '🌾', text: 'Oats', status: 'stocked' },
  { icon: '🥫', text: 'Canned beans', status: 'stocked' },
  { icon: '🍅', text: 'Tomato sauce', status: 'stocked' },
  { icon: '🫒', text: 'Olive oil', status: 'stocked' },
  { icon: '🥜', text: 'Peanut butter', status: 'stocked' },
  { icon: '🥛', text: 'Almond milk', status: 'low' },
]

export default function PantryStaples() {
  const [items, setItems] = useLocalStorage<PantryItem[]>(
    'food.pantry',
    DEFAULT_ITEMS.map((i) => ({ ...i, id: crypto.randomUUID() })),
  )
  const [text, setText] = useState('')

  function toggleStatus(id: string) {
    setItems(items.map((i) => (i.id === id ? { ...i, status: i.status === 'stocked' ? 'low' : 'stocked' } : i)))
  }

  function addItem() {
    const trimmed = text.trim()
    if (!trimmed) return
    setItems([...items, { id: crypto.randomUUID(), icon: '🫙', text: trimmed, status: 'stocked' }])
    setText('')
  }

  function removeItem(id: string) {
    setItems(items.filter((i) => i.id !== id))
  }

  return (
    <Card icon="🗄️" title="Pantry Staples">
      {items.map((item) => (
        <div key={item.id} className="pantry-item">
          <span className="pantry-icon">{item.icon}</span>
          <span className="pantry-name">{item.text}</span>
          <button className="pantry-status" onClick={() => toggleStatus(item.id)} title="Toggle stock status">
            {item.status === 'stocked' ? '✅' : '⚠️'}
          </button>
          <button className="remove" onClick={() => removeItem(item.id)} aria-label="Remove item">
            ×
          </button>
        </div>
      ))}
      <div className="c-input-row">
        <input
          type="text"
          value={text}
          placeholder="Add a pantry staple..."
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
        />
        <button onClick={addItem}>Add</button>
      </div>
    </Card>
  )
}
