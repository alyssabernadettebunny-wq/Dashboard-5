import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import './widgets.css'

interface Reminder {
  id: string
  text: string
  date: string
}

export default function Reminders() {
  const [reminders, setReminders] = useLocalStorage<Reminder[]>('dashboard.reminders', [])
  const [text, setText] = useState('')
  const [date, setDate] = useState('')

  function addReminder() {
    const trimmed = text.trim()
    if (!trimmed) return
    setReminders(
      [...reminders, { id: crypto.randomUUID(), text: trimmed, date }].sort((a, b) => {
        if (!a.date) return 1
        if (!b.date) return -1
        return a.date.localeCompare(b.date)
      }),
    )
    setText('')
    setDate('')
  }

  function removeReminder(id: string) {
    setReminders(reminders.filter((r) => r.id !== id))
  }

  return (
    <section className="widget">
      <h2>Reminders</h2>
      <div className="reminder-input">
        <input
          type="text"
          value={text}
          placeholder="Don't let me forget..."
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addReminder()}
        />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <button onClick={addReminder}>Add</button>
      </div>
      <ul className="reminder-list">
        {reminders.length === 0 && <li className="empty">No reminders set</li>}
        {reminders.map((r) => (
          <li key={r.id}>
            <span>🔔 {r.text}</span>
            {r.date && <span className="reminder-date">{r.date}</span>}
            <button className="remove" onClick={() => removeReminder(r.id)} aria-label="Remove reminder">
              ×
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
