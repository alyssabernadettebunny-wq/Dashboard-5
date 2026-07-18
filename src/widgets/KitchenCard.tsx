import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface Item {
  id: string
  text: string
  done: boolean
}

type StatusColor = 'peach' | 'green' | 'pink'
interface StatusField {
  text: string
  color: StatusColor
}

interface KitchenStatus {
  dishes: StatusField
  counters: StatusField
  trash: StatusField
  fridge: StatusField
}

const DEFAULT_ITEMS = ['Dishes', 'Wipe counters', 'Empty trash', 'Fridge check', 'Meal prep']

const DEFAULT_STATUS: KitchenStatus = {
  dishes: { text: '2 in sink', color: 'peach' },
  counters: { text: 'Tidy', color: 'green' },
  trash: { text: '¾ full', color: 'peach' },
  fridge: { text: '2 items exp. soon', color: 'peach' },
}

const COLORS: StatusColor[] = ['peach', 'green', 'pink']

function nextColor(c: StatusColor) {
  return COLORS[(COLORS.indexOf(c) + 1) % COLORS.length]
}

export default function KitchenCard() {
  const [items, setItems] = useLocalStorage<Item[]>(
    'house.room.kitchen',
    DEFAULT_ITEMS.map((text) => ({ id: crypto.randomUUID(), text, done: false })),
  )
  const [text, setText] = useState('')
  const [mealPlan, setMealPlan] = useLocalStorage('house.info.kitchen', '')
  const [status, setStatus] = useLocalStorage<KitchenStatus>('house.kitchen.status', DEFAULT_STATUS)

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

  function updateStatus(key: keyof KitchenStatus, patch: Partial<StatusField>) {
    setStatus({ ...status, [key]: { ...status[key], ...patch } })
  }

  const doneCount = items.filter((i) => i.done).length
  const rows: { key: keyof KitchenStatus; icon: string; label: string }[] = [
    { key: 'dishes', icon: '🍽️', label: 'Dishes' },
    { key: 'counters', icon: '🧽', label: 'Counters' },
    { key: 'trash', icon: '🗑️', label: 'Trash' },
    { key: 'fridge', icon: '🧊', label: 'Fridge Check' },
  ]

  return (
    <Card icon="🍳" title="2. Kitchen" meta={items.length ? `${doneCount} / ${items.length}` : undefined}>
      <div className="room-body">
        <ul className="c-list" style={{ flex: 1 }}>
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
        <div className="card-illustration room-illustration">illustration</div>
      </div>
      <div className="c-input-row">
        <input
          type="text"
          value={text}
          placeholder="Add a kitchen task..."
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
        />
        <button onClick={addItem}>Add</button>
      </div>
      <div className="info-strip">
        <span className="info-label">Meal plan:</span>
        <input value={mealPlan} placeholder="Chicken bowl, salad, fruit" onChange={(e) => setMealPlan(e.target.value)} />
        <span>🍓</span>
      </div>

      <div className="subsection">
        <p className="section-label" style={{ marginTop: 0 }}>
          Quick Status
        </p>
        {rows.map((row) => {
          const field = status[row.key]
          return (
            <div key={row.key} className="status-row">
              <span className="status-icon">{row.icon}</span>
              <span className="status-label">{row.label}</span>
              <div className={`status-pill ${field.color}`}>
                <input value={field.text} onChange={(e) => updateStatus(row.key, { text: e.target.value })} />
                <button
                  className={`status-dot ${nextColor(field.color)}`}
                  onClick={() => updateStatus(row.key, { color: nextColor(field.color) })}
                  title="Change status color"
                  aria-label="Change status color"
                />
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
