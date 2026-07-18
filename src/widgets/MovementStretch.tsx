import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface Tile {
  id: string
  icon: string
  label: string
}

const DEFAULT_TILES: Tile[] = [
  { id: '1', icon: '🧘', label: 'Morning Stretch' },
  { id: '2', icon: '🚶', label: 'Walk Outside' },
  { id: '3', icon: '🧎', label: 'Yoga Flow' },
  { id: '4', icon: '💃', label: 'Dance Break' },
]

export default function MovementStretch() {
  const [tiles] = useLocalStorage<Tile[]>('bodyweather.movement.tiles', DEFAULT_TILES)
  const [done, setDone] = useLocalStorage<string[]>('bodyweather.movement.done', [])
  const [totalMoved, setTotalMoved] = useLocalStorage('bodyweather.movement.total', 0)
  const [input, setInput] = useState('')

  function toggle(id: string) {
    setDone(done.includes(id) ? done.filter((x) => x !== id) : [...done, id])
  }

  function addMinutes() {
    const n = Number(input)
    if (!n) return
    setTotalMoved(totalMoved + n)
    setInput('')
  }

  return (
    <Card icon="🧘" title="Movement / Stretch">
      <div className="movement-grid">
        {tiles.map((tile) => (
          <button key={tile.id} className={`movement-tile ${done.includes(tile.id) ? 'done' : ''}`} onClick={() => toggle(tile.id)}>
            <span>{tile.icon}</span>
            <span>{tile.label}</span>
          </button>
        ))}
      </div>
      <div className="info-strip">
        <span className="info-label">Total moved:</span>
        <span style={{ flex: 1 }}>{totalMoved} min</span>
        <input
          type="number"
          value={input}
          placeholder="+min"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addMinutes()}
          style={{ width: 44, background: 'var(--card-bg)', borderRadius: 8, padding: '2px 6px', border: '1px solid var(--border-hairline)' }}
        />
        <button className="card-footer-btn" style={{ margin: 0 }} onClick={addMinutes}>
          Add
        </button>
      </div>
    </Card>
  )
}
