import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface Favorite {
  id: string
  place: string
  order: string
}

export default function TakeoutFavorites() {
  const [favorites, setFavorites] = useLocalStorage<Favorite[]>('food.takeout', [])
  const [place, setPlace] = useState('')
  const [order, setOrder] = useState('')

  function addFavorite() {
    const trimmed = place.trim()
    if (!trimmed) return
    setFavorites([...favorites, { id: crypto.randomUUID(), place: trimmed, order: order.trim() }])
    setPlace('')
    setOrder('')
  }

  function removeFavorite(id: string) {
    setFavorites(favorites.filter((f) => f.id !== id))
  }

  return (
    <Card icon="🥡" title="Restaurant / Takeout Favorites">
      <ul className="c-list">
        {favorites.length === 0 && <li className="c-empty">No favorites saved yet</li>}
        {favorites.map((f) => (
          <li key={f.id} className="c-list-item" style={{ alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: 12.5 }}>{f.place}</strong>
              {f.order && <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>{f.order}</p>}
            </div>
            <button className="remove" onClick={() => removeFavorite(f.id)} aria-label="Remove favorite">
              ×
            </button>
          </li>
        ))}
      </ul>
      <div className="c-input-row" style={{ flexDirection: 'column' }}>
        <input type="text" value={place} placeholder="Restaurant..." onChange={(e) => setPlace(e.target.value)} />
        <input
          type="text"
          value={order}
          placeholder="Go-to order..."
          onChange={(e) => setOrder(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addFavorite()}
        />
        <button onClick={addFavorite}>Save favorite</button>
      </div>
    </Card>
  )
}
