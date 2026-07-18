import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface GroceryItem {
  id: string
  text: string
  done: boolean
  starred: boolean
}

const DEFAULT_ITEMS: Omit<GroceryItem, 'id'>[] = [
  { text: 'Eggs', done: false, starred: false },
  { text: 'Chicken breasts', done: false, starred: false },
  { text: 'Mangoes', done: false, starred: true },
  { text: 'Avocados', done: false, starred: false },
  { text: 'Almond milk', done: false, starred: false },
  { text: 'Spinach', done: false, starred: false },
  { text: 'Cherry tomatoes', done: false, starred: false },
  { text: 'Boba / matcha', done: false, starred: true },
]

export default function GroceryList() {
  const [items, setItems] = useLocalStorage<GroceryItem[]>(
    'food.grocerylist',
    DEFAULT_ITEMS.map((i) => ({ ...i, id: crypto.randomUUID() })),
  )
  const [text, setText] = useState('')

  function toggleDone(id: string) {
    setItems(items.map((i) => (i.id === id ? { ...i, done: !i.done } : i)))
  }

  function toggleStar(id: string) {
    setItems(items.map((i) => (i.id === id ? { ...i, starred: !i.starred } : i)))
  }

  function addItem() {
    const trimmed = text.trim()
    if (!trimmed) return
    setItems([...items, { id: crypto.randomUUID(), text: trimmed, done: false, starred: false }])
    setText('')
  }

  function removeItem(id: string) {
    setItems(items.filter((i) => i.id !== id))
  }

  return (
    <Card icon="🛒" title="Grocery List">
      <ul className="c-list">
        {items.map((item) => (
          <li key={item.id} className={`c-list-item ${item.done ? 'struck' : ''}`}>
            <input type="checkbox" checked={item.done} onChange={() => toggleDone(item.id)} />
            <span>{item.text}</span>
            <button className={`grocery-star ${item.starred ? 'active' : ''}`} onClick={() => toggleStar(item.id)} aria-label="Toggle favorite">
              ★
            </button>
            <button className="remove" onClick={() => removeItem(item.id)} aria-label="Remove item">
              ×
            </button>
          </li>
        ))}
      </ul>
      <div className="c-input-row">
        <input
          type="text"
          value={text}
          placeholder="Add item..."
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
        />
        <button onClick={addItem}>Add</button>
      </div>
    </Card>
  )
}
