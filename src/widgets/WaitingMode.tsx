import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface ParkedItem {
  id: string
  text: string
}

export default function WaitingMode() {
  const [items, setItems] = useLocalStorage<ParkedItem[]>('dashboard.waitingmode', [])
  const [text, setText] = useState('')
  const [adding, setAdding] = useState(false)

  function addItem() {
    const trimmed = text.trim()
    if (!trimmed) return
    setItems([...items, { id: crypto.randomUUID(), text: trimmed }])
    setText('')
    setAdding(false)
  }

  function removeItem(id: string) {
    setItems(items.filter((i) => i.id !== id))
  }

  return (
    <Card icon="☁️" title="Waiting Mode (Parking Lot)">
      <p className="waiting-subtitle">For now, not the focus.</p>
      <ul className="waiting-list">
        {items.length === 0 && <li className="c-empty">Nothing parked right now</li>}
        {items.map((item) => (
          <li key={item.id} className="waiting-item">
            <span className="waiting-bullet">•</span>
            <span className="waiting-text">{item.text}</span>
            <button className="med-remove" onClick={() => removeItem(item.id)} aria-label="Remove item">
              ×
            </button>
          </li>
        ))}
      </ul>
      {adding ? (
        <div className="c-input-row">
          <input
            type="text"
            value={text}
            placeholder="What can wait for later..."
            autoFocus
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
          />
          <button onClick={addItem}>Add</button>
        </div>
      ) : (
        <button className="card-footer-btn waiting-btn" onClick={() => setAdding(true)}>
          Brain dump it here ✨
        </button>
      )}
    </Card>
  )
}
