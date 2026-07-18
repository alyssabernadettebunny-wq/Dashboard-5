import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface Item {
  id: string
  text: string
  done: boolean
}

interface SupplyConfig {
  label: string
  storageKey: string
  max: number
  unit: string
  defaultValue: number
}

export default function RoomCard({
  number,
  icon,
  title,
  location,
  storageKey,
  placeholder,
  defaultItems = [],
  infoLabel,
  infoIcon,
  infoStorageKey,
  infoPlaceholder,
  supply,
}: {
  number: number
  icon: string
  title: string
  location?: string
  storageKey: string
  placeholder: string
  defaultItems?: string[]
  infoLabel?: string
  infoIcon?: string
  infoStorageKey?: string
  infoPlaceholder?: string
  supply?: SupplyConfig
}) {
  const [items, setItems] = useLocalStorage<Item[]>(
    storageKey,
    defaultItems.map((text) => ({ id: crypto.randomUUID(), text, done: false })),
  )
  const [text, setText] = useState('')
  const [info, setInfo] = useLocalStorage(infoStorageKey ?? `${storageKey}.info`, '')
  const [supplyValue, setSupplyValue] = useLocalStorage(supply?.storageKey ?? `${storageKey}.supply`, supply?.defaultValue ?? 0)

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
  const fullTitle = `${number}. ${title}${location ? ` (${location})` : ''}`

  return (
    <Card icon={icon} title={fullTitle} meta={items.length ? `${doneCount} / ${items.length}` : undefined}>
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
      {supply && (
        <div className="supply-strip">
          <span className="info-label">
            {supply.label}: {supplyValue}
            {supply.unit}
          </span>
          <div className="progress-track supply-track">
            <div className="progress-fill" style={{ width: `${Math.min(100, (supplyValue / supply.max) * 100)}%` }} />
          </div>
          <input
            type="number"
            min={0}
            max={supply.max}
            value={supplyValue}
            onChange={(e) => setSupplyValue(Number(e.target.value))}
            className="supply-input"
          />
        </div>
      )}
      {!supply && infoLabel && (
        <div className="info-strip">
          <span className="info-label">{infoLabel}:</span>
          <input value={info} placeholder={infoPlaceholder} onChange={(e) => setInfo(e.target.value)} />
          {infoIcon && <span>{infoIcon}</span>}
        </div>
      )}
    </Card>
  )
}
