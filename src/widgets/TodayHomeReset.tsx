import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface Item {
  id: string
  text: string
  done: boolean
}

const ZONES = ['Kitchen', 'Bathroom', 'Living Room', 'Bedrooms', 'Laundry']

export default function TodayHomeReset() {
  const [items, setItems] = useLocalStorage<Item[]>('house.today.priorities', [])
  const [text, setText] = useState('')
  const [zone, setZone] = useLocalStorage('house.today.zone', ZONES[0])

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
    <Card icon="🎀" title="1. Today's Home Reset">
      <p className="card-subtitle">Top priorities</p>
      <div className="room-body">
        <ul className="c-list" style={{ flex: 1 }}>
          {items.length === 0 && <li className="c-empty">Nothing prioritized yet</li>}
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
        <div className="sticky-note">You got this! ♡</div>
      </div>
      <div className="c-input-row">
        <input
          type="text"
          value={text}
          placeholder="Add a top priority..."
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
        />
        <button onClick={addItem}>Add</button>
      </div>
      <div className="focus-zone-row">
        <span>Focus zone:</span>
        <select value={zone} onChange={(e) => setZone(e.target.value)}>
          {ZONES.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </select>
      </div>
    </Card>
  )
}
