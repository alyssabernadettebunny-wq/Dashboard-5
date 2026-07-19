import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface Appointment {
  id: string
  date: string
  title: string
  notes: string
}

export default function GirlAppointments({ name, storageKey, birthdate }: { name: string; storageKey: string; birthdate: string }) {
  const [appointments, setAppointments] = useLocalStorage<Appointment[]>(storageKey, [])
  const [date, setDate] = useState('')
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')

  function add() {
    if (!date || !title.trim()) return
    setAppointments(
      [...appointments, { id: crypto.randomUUID(), date, title: title.trim(), notes: notes.trim() }].sort((a, b) =>
        a.date.localeCompare(b.date)
      )
    )
    setDate('')
    setTitle('')
    setNotes('')
  }

  function remove(id: string) {
    setAppointments(appointments.filter((a) => a.id !== id))
  }

  const age = ageInYears(birthdate)

  return (
    <Card icon="🗓️" title={`${name}'s Appointments & Events`} meta={age !== null ? `${age} yrs old` : undefined}>
      <div className="c-input-row" style={{ flexDirection: 'column' }}>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <input type="text" placeholder="What's coming up?" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input type="text" placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <button onClick={add}>Add</button>
      </div>
      <ul className="c-list">
        {appointments.length === 0 && <li className="c-empty">Nothing scheduled yet</li>}
        {appointments.map((a) => (
          <li key={a.id} className="c-list-item" style={{ alignItems: 'flex-start' }}>
            <div>
              <strong style={{ fontSize: 12 }}>{a.title}</strong>
              <span className="sub" style={{ marginLeft: 8 }}>
                {a.date}
              </span>
              {a.notes && <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>{a.notes}</p>}
            </div>
            <button className="remove" onClick={() => remove(a.id)} aria-label="Remove">
              ×
            </button>
          </li>
        ))}
      </ul>
    </Card>
  )
}

function ageInYears(birthdate: string) {
  if (!birthdate) return null
  const birth = new Date(birthdate + 'T00:00:00')
  const now = new Date()
  let years = now.getFullYear() - birth.getFullYear()
  const hadBirthdayThisYear = now.getMonth() > birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() >= birth.getDate())
  if (!hadBirthdayThisYear) years -= 1
  return years
}
