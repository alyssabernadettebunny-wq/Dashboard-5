import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface Note {
  id: string
  text: string
  time: string
  date: string
}

export default function QuickCapture() {
  const [notes, setNotes] = useLocalStorage<Note[]>('dashboard.quickcapture', [])
  const [text, setText] = useState('')

  function addNote() {
    const trimmed = text.trim()
    if (!trimmed) return
    const now = new Date()
    const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    const date = now.toLocaleDateString([], { month: 'short', day: 'numeric' })
    setNotes([{ id: crypto.randomUUID(), text: trimmed, time, date }, ...notes])
    setText('')
  }

  function removeNote(id: string) {
    setNotes(notes.filter((n) => n.id !== id))
  }

  return (
    <Card icon="📝" title="Quick Capture" variant="memo" surface="blue">
      <div className="c-input-row">
        <input
          type="text"
          value={text}
          placeholder="Jot it down before you forget..."
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addNote()}
        />
        <button onClick={addNote}>Save</button>
      </div>
      <ul className="c-list">
        {notes.length === 0 && <li className="c-empty">Nothing captured yet</li>}
        {notes.map((note) => (
          <li key={note.id} className="c-list-item">
            <span className="sub" style={{ marginLeft: 0 }}>
              {note.date ?? ''} {note.time}
            </span>
            <span>{note.text}</span>
            <button className="remove" onClick={() => removeNote(note.id)} aria-label="Remove note">
              ×
            </button>
          </li>
        ))}
      </ul>
    </Card>
  )
}
