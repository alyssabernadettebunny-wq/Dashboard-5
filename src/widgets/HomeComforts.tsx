import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface Item {
  id: string
  text: string
  done: boolean
}

const DEFAULT_ITEMS = ['Brew coffee', 'Light candle', 'Open window', 'Play soft music', 'Cozy throw', 'Hydrate']

export default function HomeComforts() {
  const [items, setItems] = useLocalStorage<Item[]>(
    'bodyweather.homecomforts',
    DEFAULT_ITEMS.map((text) => ({ id: crypto.randomUUID(), text, done: false })),
  )
  const [text, setText] = useState('')
  const [moodNote, setMoodNote] = useLocalStorage('bodyweather.homecomforts.mood', 'peaceful & productive')

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

  const doneCount = items.filter((i) => i.done).length

  return (
    <Card icon="🎀" title="2. Home Comforts" meta={items.length ? `${doneCount} / ${items.length}` : undefined}>
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
          placeholder="Add a comfort ritual..."
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
        />
        <button onClick={addItem}>Add</button>
      </div>
      <div className="info-strip">
        <span className="info-label">Mood:</span>
        <input value={moodNote} onChange={(e) => setMoodNote(e.target.value)} />
        <span>♡</span>
      </div>
    </Card>
  )
}
