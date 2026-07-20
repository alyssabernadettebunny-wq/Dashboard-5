import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface Item {
  id: string
  text: string
  done: boolean
}

export default function ChecklistCard({
  icon,
  title,
  storageKey,
  placeholder,
}: {
  icon: string
  title: string
  storageKey: string
  placeholder: string
}) {
  const [items, setItems] = useLocalStorage<Item[]>(storageKey, [])
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

  const doneCount = items.filter((i) => i.done).length

  return (
    <Card icon={icon} title={title} meta={items.length ? `${doneCount} / ${items.length}` : undefined} variant="linedPaper">
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
    </Card>
  )
}
