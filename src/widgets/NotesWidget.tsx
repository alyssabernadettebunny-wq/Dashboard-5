import { useLocalStorage } from '../hooks/useLocalStorage'
import './widgets.css'

export default function NotesWidget() {
  const [notes, setNotes] = useLocalStorage('dashboard.notes', '')

  return (
    <section className="widget">
      <h2>Notes</h2>
      <textarea
        className="notes-area"
        value={notes}
        placeholder="Jot something down..."
        onChange={(e) => setNotes(e.target.value)}
      />
    </section>
  )
}
