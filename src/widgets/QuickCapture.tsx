import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import './widgets.css'

interface Note {
  id: string
  text: string
  time: string
}

export default function QuickCapture() {
  const [notes, setNotes] = useLocalStorage<Note[]>('dashboard.quickcapture', [])
  const [text, setText] = useState('')

  function addNote() {
    const trimmed = text.trim()
    if (!trimmed) return
    const time = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    setNotes([{ id: crypto.randomUUID(), text: trimmed, time }, ...notes])
    setText('')
  }

  function removeNote(id: string) {
    setNotes(notes.filter((n) => n.id !== id))
  }

  return (
    <section className="widget">
      <h2><span className="icon-badge">📝</span> Quick Capture</h2>
      <div className="task-input">
        <input
          type="text"
          value={text}
          placeholder="Jot it down before you forget..."
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addNote()}
        />
        <button onClick={addNote}>Save</button>
      </div>
      <ul className="capture-list">
        {notes.length === 0 && <li className="empty">Nothing captured yet</li>}
        {notes.map((note) => (
          <li key={note.id}>
            <span className="capture-time">{note.time}</span>
            <span className="capture-text">{note.text}</span>
            <button className="remove" onClick={() => removeNote(note.id)} aria-label="Remove note">
              ×
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
