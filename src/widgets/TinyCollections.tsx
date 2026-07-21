import { useRef, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface CollectionItem {
  id: string
  name: string
  note: string
  photo: string | null
  date: string
}

interface Category {
  id: string
  label: string
  icon: string
  surface: string
}

const CATEGORIES: Category[] = [
  { id: 'stickers', label: 'Stickers', icon: '🌸', surface: '#ffe1ec' },
  { id: 'washi', label: 'Washi', icon: '🎀', surface: '#ffd9c2' },
  { id: 'charms', label: 'Charms', icon: '🔑', surface: '#ffe6b3' },
  { id: 'plushies', label: 'Plushies', icon: '🧸', surface: '#e3d4ff' },
  { id: 'figurines', label: 'Figurines', icon: '🎎', surface: '#d8c9ee' },
]

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const size = 160
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')!
        const scale = Math.max(size / img.width, size / img.height)
        const w = img.width * scale
        const h = img.height * scale
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

export default function TinyCollections() {
  const [collections, setCollections] = useLocalStorage<Record<string, CollectionItem[]>>('spark.collections', {})
  const [activeId, setActiveId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [note, setNote] = useState('')
  const [pendingPhoto, setPendingPhoto] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const active = CATEGORIES.find((c) => c.id === activeId) ?? null
  const items = activeId ? (collections[activeId] ?? []) : []

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    const dataUrl = await resizeImage(file)
    setPendingPhoto(dataUrl)
  }

  function addItem() {
    const trimmed = name.trim()
    if (!trimmed || !activeId) return
    const date = new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })
    const item: CollectionItem = { id: crypto.randomUUID(), name: trimmed, note: note.trim(), photo: pendingPhoto, date }
    setCollections({ ...collections, [activeId]: [item, ...items] })
    setName('')
    setNote('')
    setPendingPhoto(null)
  }

  function removeItem(id: string) {
    if (!activeId) return
    setCollections({ ...collections, [activeId]: items.filter((i) => i.id !== id) })
  }

  if (active) {
    return (
      <Card icon={active.icon} title={active.label} meta={`${items.length} saved`} variant="scrapbook" surface="lilac">
        <button className="card-footer-btn" style={{ marginBottom: 10 }} onClick={() => setActiveId(null)}>
          ← All collections
        </button>

        <div className="collection-add">
          <div className="c-input-row">
            <input type="text" placeholder="Item name" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addItem()} />
            <button onClick={addItem}>Add</button>
          </div>
          <div className="c-input-row" style={{ marginTop: 6 }}>
            <input type="text" placeholder="A little note (optional)" value={note} onChange={(e) => setNote(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addItem()} />
            <button onClick={() => fileInputRef.current?.click()}>{pendingPhoto ? '📷 ✓' : '📷 Photo'}</button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
        </div>

        {items.length === 0 ? (
          <p className="c-empty">No {active.label.toLowerCase()} saved yet — add your first one above.</p>
        ) : (
          <ul className="collection-grid">
            {items.map((item) => (
              <li key={item.id} className="collection-tile">
                <button className="remove collection-tile-remove" onClick={() => removeItem(item.id)} aria-label="Remove">
                  ×
                </button>
                <div className="collection-tile-photo" style={{ background: item.photo ? undefined : active.surface }}>
                  {item.photo ? <img src={item.photo} alt={item.name} /> : <span>{active.icon}</span>}
                </div>
                <p className="collection-tile-name">{item.name}</p>
                {item.note && <p className="collection-tile-note">{item.note}</p>}
              </li>
            ))}
          </ul>
        )}
      </Card>
    )
  }

  return (
    <Card icon="🎁" title="Tiny Collections" meta="Little treasures, big joy" variant="scrapbook" surface="lilac">
      <div className="tinycollections-grid">
        {CATEGORIES.map((c) => (
          <button key={c.id} className="tinycollections-tile" onClick={() => setActiveId(c.id)}>
            <span className="tinycollections-icon" style={{ background: c.surface }}>
              {c.icon}
            </span>
            <span className="tinycollections-label">{c.label}</span>
            <span className="tinycollections-count">{(collections[c.id] ?? []).length}</span>
          </button>
        ))}
      </div>
      <p className="c-empty" style={{ marginTop: 8, textAlign: 'center' }}>
        Little treasures, big joy. ♡
      </p>
    </Card>
  )
}
