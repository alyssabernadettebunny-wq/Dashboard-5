import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface Anchor {
  id: string
  icon: string
  tile: string
  text: string
  done: boolean
}

const TILES = ['green', 'pink', 'red', 'purple', 'blue', 'indigo', 'pink']

const DEFAULT_ANCHORS: Anchor[] = [
  { id: 'a1', icon: '🐾', tile: 'green', text: "Misa: morning & evening walk", done: false },
  { id: 'a2', icon: '💊', tile: 'pink', text: 'Take meds ♡', done: false },
  { id: 'a3', icon: '🍎', tile: 'red', text: 'Eat real food (3 meals)', done: false },
  { id: 'a4', icon: '✨', tile: 'purple', text: 'Reset at 9:30 PM', done: false },
  { id: 'a5', icon: '💧', tile: 'blue', text: 'Skincare & brush teeth', done: false },
  { id: 'a6', icon: '🌙', tile: 'indigo', text: 'In bed by 10:30 PM', done: false },
  { id: 'a7', icon: '📓', tile: 'pink', text: 'Gratitude note', done: false },
]

export default function AnchorTasks() {
  const [anchors, setAnchors] = useLocalStorage<Anchor[]>('rhythm.anchortasks', DEFAULT_ANCHORS)
  const [text, setText] = useState('')

  function toggle(id: string) {
    setAnchors(anchors.map((a) => (a.id === id ? { ...a, done: !a.done } : a)))
  }

  function removeAnchor(id: string) {
    setAnchors(anchors.filter((a) => a.id !== id))
  }

  function addAnchor() {
    const trimmed = text.trim()
    if (!trimmed) return
    setAnchors([...anchors, { id: crypto.randomUUID(), icon: '⭐', tile: TILES[anchors.length % TILES.length], text: trimmed, done: false }])
    setText('')
  }

  return (
    <Card icon="🐣" title="Anchor Tasks" meta="Your non-negotiables">
      <ul className="anchor-list">
        {anchors.map((a) => (
          <li key={a.id} className={`anchor-item ${a.done ? 'done' : ''}`}>
            <input type="checkbox" checked={a.done} onChange={() => toggle(a.id)} />
            <span className={`anchor-icon-tile anchor-tile-${a.tile}`}>{a.icon}</span>
            <span className="anchor-text">{a.text}</span>
            <button className="remove" onClick={() => removeAnchor(a.id)} aria-label="Remove anchor">
              ×
            </button>
          </li>
        ))}
      </ul>
      <div className="c-input-row">
        <input
          type="text"
          value={text}
          placeholder="Add a non-negotiable..."
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addAnchor()}
        />
        <button onClick={addAnchor}>Add</button>
      </div>
      <p className="anchor-footer">Small anchors ✨ big difference ♡</p>
    </Card>
  )
}
