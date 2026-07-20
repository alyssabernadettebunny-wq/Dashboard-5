import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useStreak } from '../hooks/useStreak'
import Card from '../components/Card'

interface Item {
  id: string
  text: string
  done: boolean
}

const ZONES = ['Kitchen', 'Bathroom', 'Living Room', 'Bedroom', 'Laundry']

const DEFAULT_ITEMS = [
  'Make beds',
  'Tidy living room',
  'Clear kitchen counters',
  'Start a load of laundry',
  'Wipe bathroom surfaces',
  'Take out trash',
  'Vacuum high-traffic areas',
  'Water plants',
  '5-minute evening reset',
]

export default function TodayHomeReset() {
  const [items, setItems] = useLocalStorage<Item[]>(
    'house.today.priorities',
    DEFAULT_ITEMS.map((text) => ({ id: crypto.randomUUID(), text, done: false })),
  )
  const [text, setText] = useState('')
  const [zone, setZone] = useLocalStorage('house.today.zone', ZONES[0])
  const { streak, markToday } = useStreak('streak.homereset')

  function addItem() {
    const trimmed = text.trim()
    if (!trimmed) return
    setItems([...items, { id: crypto.randomUUID(), text: trimmed, done: false }])
    setText('')
  }

  function toggleItem(id: string) {
    const updated = items.map((i) => (i.id === id ? { ...i, done: !i.done } : i))
    setItems(updated)
    if (updated.length > 0 && updated.every((i) => i.done)) markToday()
  }

  function removeItem(id: string) {
    setItems(items.filter((i) => i.id !== id))
  }

  const doneCount = items.filter((i) => i.done).length
  const mid = Math.ceil(items.length / 2)
  const colA = items.slice(0, mid)
  const colB = items.slice(mid)

  return (
    <Card
      icon="✨"
      title="1. Today's Home Reset"
      meta={items.length ? `${doneCount} / ${items.length} done${streak > 0 ? ` · 🔥 ${streak}d` : ''}` : undefined}
    >
      <hr className="card-divider" />
      <div className="two-col-list">
        {[colA, colB].map((col, ci) => (
          <ul key={ci} className="c-list">
            {col.map((item) => (
              <li key={item.id} className={`pink-check-item ${item.done ? 'done' : ''}`}>
                <button
                  className={`pink-checkbox ${item.done ? 'checked' : ''}`}
                  onClick={() => toggleItem(item.id)}
                  aria-label="Toggle done"
                >
                  {item.done && '✓'}
                </button>
                <span className="item-text">{item.text}</span>
                <button className="remove" onClick={() => removeItem(item.id)} aria-label="Remove item">
                  ×
                </button>
              </li>
            ))}
          </ul>
        ))}
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
