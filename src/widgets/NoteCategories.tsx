import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface Note {
  id: string
  text: string
}

interface Category {
  id: string
  name: string
  notes: Note[]
}

const DEFAULT_CATEGORIES: Category[] = [{ id: 'ideas', name: 'Ideas / Random Thoughts', notes: [] }]

function CategoryBlock({ category, onChange, onRemove }: { category: Category; onChange: (c: Category) => void; onRemove: () => void }) {
  const [text, setText] = useState('')

  function addNote() {
    if (!text.trim()) return
    onChange({ ...category, notes: [{ id: crypto.randomUUID(), text: text.trim() }, ...category.notes] })
    setText('')
  }

  function removeNote(id: string) {
    onChange({ ...category, notes: category.notes.filter((n) => n.id !== id) })
  }

  return (
    <div className="subsection">
      <p className="section-label" style={{ marginTop: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {category.name}
        <button className="remove" onClick={onRemove} aria-label="Remove category">
          ×
        </button>
      </p>
      <div className="c-input-row">
        <input type="text" placeholder="Add a note..." value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addNote()} />
        <button onClick={addNote}>Add</button>
      </div>
      <ul className="c-list">
        {category.notes.length === 0 && <li className="c-empty">Nothing here yet</li>}
        {category.notes.map((n) => (
          <li key={n.id} className="c-list-item">
            <span>{n.text}</span>
            <button className="remove" onClick={() => removeNote(n.id)} aria-label="Remove note">
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function NoteCategories() {
  const [categories, setCategories] = useLocalStorage<Category[]>('notes.categories', DEFAULT_CATEGORIES)
  const [newCategory, setNewCategory] = useState('')

  function addCategory() {
    if (!newCategory.trim()) return
    setCategories([...categories, { id: crypto.randomUUID(), name: newCategory.trim(), notes: [] }])
    setNewCategory('')
  }

  return (
    <Card icon="📂" title="Note Categories" wide>
      <div className="status-cols">
        {categories.map((c) => (
          <CategoryBlock
            key={c.id}
            category={c}
            onChange={(updated) => setCategories(categories.map((cat) => (cat.id === updated.id ? updated : cat)))}
            onRemove={() => setCategories(categories.filter((cat) => cat.id !== c.id))}
          />
        ))}
      </div>
      <div className="c-input-row" style={{ marginTop: 10 }}>
        <input type="text" placeholder="New category name..." value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
        <button onClick={addCategory}>Add category</button>
      </div>
    </Card>
  )
}
