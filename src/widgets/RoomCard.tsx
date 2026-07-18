import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface Item {
  id: string
  text: string
  done: boolean
}

export default function RoomCard({
  number,
  icon,
  title,
  storageKey,
  placeholder,
  infoLabel,
  infoIcon,
  infoStorageKey,
  infoPlaceholder,
}: {
  number: number
  icon: string
  title: string
  storageKey: string
  placeholder: string
  infoLabel: string
  infoIcon: string
  infoStorageKey: string
  infoPlaceholder: string
}) {
  const [items, setItems] = useLocalStorage<Item[]>(storageKey, [])
  const [text, setText] = useState('')
  const [info, setInfo] = useLocalStorage(infoStorageKey, '')

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
    <Card icon={icon} title={`${number}. ${title}`} meta={items.length ? `${doneCount} / ${items.length}` : undefined}>
      <div className="room-body">
        <ul className="c-list" style={{ flex: 1 }}>
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
        <div className="card-illustration room-illustration">illustration</div>
      </div>
      <div className="c-input-row">
        <input
          type="text"
          value={text}
          placeholder={placeholder}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
        />
        <button onClick={addItem}>Add</button>
      </div>
      <div className="info-strip">
        <span className="info-label">{infoLabel}:</span>
        <input value={info} placeholder={infoPlaceholder} onChange={(e) => setInfo(e.target.value)} />
        <span>{infoIcon}</span>
      </div>
    </Card>
  )
}
