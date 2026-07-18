import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface Item {
  id: string
  text: string
  done: boolean
}

const DEFAULT_ITEMS = ['Power nap (20m)', 'Herbal tea + K-drama', 'Bath + epsom soak', 'Silent Hill 2 cozy watch', 'Fatal Frame photo time']

export default function RestRewardPockets() {
  const [items, setItems] = useLocalStorage<Item[]>(
    'bodyweather.restpockets',
    DEFAULT_ITEMS.map((text) => ({ id: crypto.randomUUID(), text, done: false })),
  )
  const [text, setText] = useState('')
  const [note, setNote] = useLocalStorage('bodyweather.restpockets.note', 'Rest is productive too 💗')

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
    <Card icon="☕" title="Rest & Reward Pockets">
      <div className="room-body">
        <ul className="c-list" style={{ flex: 1 }}>
          {items.map((item) => (
            <li key={item.id} className="heart-check-item">
              <button
                className={`heart-checkbox ${item.done ? 'checked' : ''}`}
                onClick={() => toggleItem(item.id)}
                aria-label="Toggle done"
              >
                {item.done ? '♥' : '♡'}
              </button>
              <span style={{ flex: 1 }}>{item.text}</span>
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
          placeholder="Add a rest idea..."
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
        />
        <button onClick={addItem}>Add</button>
      </div>
      <div className="card-aphorism">
        <input value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
    </Card>
  )
}
