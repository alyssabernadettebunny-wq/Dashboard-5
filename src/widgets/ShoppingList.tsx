import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface Item {
  id: string
  text: string
  done: boolean
}

function ShoppingColumn({
  icon,
  label,
  storageKey,
  defaultItems,
}: {
  icon: string
  label: string
  storageKey: string
  defaultItems: string[]
}) {
  const [items, setItems] = useLocalStorage<Item[]>(
    storageKey,
    defaultItems.map((text) => ({ id: crypto.randomUUID(), text, done: false })),
  )
  const [text, setText] = useState('')

  function addItem() {
    const trimmed = text.trim()
    if (!trimmed) return
    setItems([...items, { id: crypto.randomUUID(), text: trimmed, done: false }])
    setText('')
  }

  function toggleItem(id: string) {
    setItems(items.map((i) => (i.id === id ? { ...i, done: !i.done } : i)))
  }

  function removeItem(id: string) {
    setItems(items.filter((i) => i.id !== id))
  }

  return (
    <div className="shopping-col">
      <h4>
        {icon} {label}
      </h4>
      <ul className="c-list">
        {items.length === 0 && <li className="c-empty">Nothing here yet</li>}
        {items.map((item) => (
          <li key={item.id} className={`c-list-item ${item.done ? 'struck' : ''}`}>
            <input type="checkbox" checked={item.done} onChange={() => toggleItem(item.id)} />
            <span>{item.text}</span>
            <button className="remove" onClick={() => removeItem(item.id)} aria-label="Remove item">
              ×
            </button>
          </li>
        ))}
      </ul>
      <div className="shopping-add">
        <input
          type="text"
          value={text}
          placeholder="Add..."
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
        />
        <button onClick={addItem}>+</button>
      </div>
    </div>
  )
}

export default function ShoppingList() {
  const [pickup, setPickup] = useLocalStorage('house.shopping.pickup', '')

  return (
    <Card icon="🛒" title="7. Shopping List" wide>
      <div className="shopping-cols">
        <ShoppingColumn icon="🍓" label="Kitchen" storageKey="house.shopping.kitchen" defaultItems={['Almond milk', 'Eggs', 'Garlic', 'Strawberries']} />
        <ShoppingColumn icon="🏠" label="Home" storageKey="house.shopping.home" defaultItems={['Dish soap', 'Trash bags', 'Toilet paper', 'Paper towels']} />
        <ShoppingColumn icon="🎀" label="Personal" storageKey="house.shopping.personal" defaultItems={['Face masks', 'Body wash', 'Hair clips', 'Nail polish']} />
      </div>
      <div className="info-strip">
        <span className="info-label">Order pickup:</span>
        <input value={pickup} placeholder="Sat 12:00 PM" onChange={(e) => setPickup(e.target.value)} />
        <span>🚗</span>
      </div>
    </Card>
  )
}
