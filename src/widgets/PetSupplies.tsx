import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'
import { DEFAULT_GROCERY_ITEMS, type GroceryItem } from './GroceryList'

interface Supply {
  id: string
  icon: string
  text: string
  stock: number
  needByDays: number
}

const DEFAULT_SUPPLIES: Omit<Supply, 'id'>[] = [
  { icon: '🥫', text: 'Kibble (Coco)', stock: 3, needByDays: 7 },
  { icon: '🥫', text: 'Wet food (Misa)', stock: 3, needByDays: 5 },
  { icon: '🐾', text: 'Litter', stock: 2, needByDays: 4 },
  { icon: '🧷', text: 'Pee pads', stock: 2, needByDays: 3 },
  { icon: '🦴', text: 'Treats', stock: 5, needByDays: 14 },
  { icon: '💩', text: 'Poop bags', stock: 3, needByDays: 12 },
  { icon: '🧸', text: 'Chew toys', stock: 3, needByDays: 6 },
  { icon: '🧴', text: 'Shampoo', stock: 3, needByDays: 15 },
]

export default function PetSupplies() {
  const [supplies, setSupplies] = useLocalStorage<Supply[]>(
    'pets.supplies',
    DEFAULT_SUPPLIES.map((s) => ({ ...s, id: crypto.randomUUID() })),
  )
  const [groceryList, setGroceryList] = useLocalStorage<GroceryItem[]>(
    'food.grocerylist',
    DEFAULT_GROCERY_ITEMS.map((i) => ({ ...i, id: crypto.randomUUID() })),
  )
  const [added, setAdded] = useState(false)

  function setStock(id: string, stock: number) {
    setSupplies(supplies.map((s) => (s.id === id ? { ...s, stock } : s)))
  }

  function addLowStockToGroceryList() {
    const low = supplies.filter((s) => s.stock <= 2)
    const existingTexts = new Set(groceryList.map((g) => g.text.toLowerCase()))
    const toAdd = low
      .filter((s) => !existingTexts.has(s.text.toLowerCase()))
      .map((s) => ({ id: crypto.randomUUID(), text: s.text, done: false, starred: false }))
    if (toAdd.length) setGroceryList([...groceryList, ...toAdd])
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <Card icon="🛒" title="Supplies & Stock-Up">
      <div className="stock-table-row" style={{ fontWeight: 700, color: 'var(--purple-heading)' }}>
        <span>Item</span>
        <span>Stock</span>
        <span>Need by</span>
      </div>
      {supplies.map((s) => (
        <div key={s.id} className="stock-table-row">
          <span>
            {s.icon} {s.text}
          </span>
          <span className="stock-dots">
            {Array.from({ length: 5 }).map((_, i) => (
              <button key={i} className={`stock-dot ${i < s.stock ? 'filled' : ''}`} onClick={() => setStock(s.id, i + 1)} aria-label={`Set stock to ${i + 1}`} />
            ))}
          </span>
          <span>{s.needByDays} days</span>
        </div>
      ))}
      <button className="card-footer-btn" style={{ alignSelf: 'center' }} onClick={addLowStockToGroceryList}>
        {added ? 'Added! ♡' : 'Add low stock to shopping list 🛒'}
      </button>
    </Card>
  )
}
