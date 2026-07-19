import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface Milestone {
  id: string
  date: string
  label: string
}

interface Note {
  id: string
  date: string
  text: string
}

export default function GirlMemories({ name, storageKey }: { name: string; storageKey: string }) {
  const [photoCaption, setPhotoCaption] = useLocalStorage(`${storageKey}.photo`, '')
  const [milestones, setMilestones] = useLocalStorage<Milestone[]>(`${storageKey}.milestones`, [])
  const [notes, setNotes] = useLocalStorage<Note[]>(`${storageKey}.notes`, [])

  const [milestoneDate, setMilestoneDate] = useState('')
  const [milestoneLabel, setMilestoneLabel] = useState('')
  const [noteText, setNoteText] = useState('')

  function addMilestone() {
    if (!milestoneLabel.trim()) return
    const entry = { id: crypto.randomUUID(), date: milestoneDate || new Date().toISOString().slice(0, 10), label: milestoneLabel.trim() }
    setMilestones([entry, ...milestones].sort((a, b) => b.date.localeCompare(a.date)))
    setMilestoneDate('')
    setMilestoneLabel('')
  }

  function removeMilestone(id: string) {
    setMilestones(milestones.filter((m) => m.id !== id))
  }

  function addNote() {
    if (!noteText.trim()) return
    setNotes([{ id: crypto.randomUUID(), date: new Date().toISOString().slice(0, 10), text: noteText.trim() }, ...notes])
    setNoteText('')
  }

  function removeNote(id: string) {
    setNotes(notes.filter((n) => n.id !== id))
  }

  return (
    <Card icon="💕" title={`${name}'s Memories`} wide>
      <div className="status-cols">
        <div className="subsection">
          <p className="section-label" style={{ marginTop: 0 }}>
            Photo Moment
          </p>
          <div className="card-illustration" style={{ width: '100%', height: 100 }}>
            illustration
          </div>
          <input
            type="text"
            placeholder="Caption this memory..."
            value={photoCaption}
            onChange={(e) => setPhotoCaption(e.target.value)}
            style={{ marginTop: 6 }}
          />
        </div>

        <div className="subsection">
          <p className="section-label" style={{ marginTop: 0 }}>
            Milestones
          </p>
          <div className="c-input-row">
            <input type="date" value={milestoneDate} onChange={(e) => setMilestoneDate(e.target.value)} />
            <input
              type="text"
              placeholder="First day of school, lost a tooth..."
              value={milestoneLabel}
              onChange={(e) => setMilestoneLabel(e.target.value)}
            />
            <button onClick={addMilestone}>Add</button>
          </div>
          <ul className="c-list">
            {milestones.length === 0 && <li className="c-empty">No milestones logged yet</li>}
            {milestones.map((m) => (
              <li key={m.id} className="c-list-item">
                <span className="sub" style={{ marginLeft: 0 }}>
                  {m.date}
                </span>
                <span>{m.label}</span>
                <button className="remove" onClick={() => removeMilestone(m.id)} aria-label="Remove">
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="subsection">
          <p className="section-label" style={{ marginTop: 0 }}>
            Notes Timeline
          </p>
          <div className="c-input-row">
            <input type="text" placeholder="Something she said or did..." value={noteText} onChange={(e) => setNoteText(e.target.value)} />
            <button onClick={addNote}>Add</button>
          </div>
          <ul className="c-list">
            {notes.length === 0 && <li className="c-empty">Nothing captured yet</li>}
            {notes.map((n) => (
              <li key={n.id} className="c-list-item" style={{ alignItems: 'flex-start' }}>
                <div>
                  <span className="sub" style={{ marginLeft: 0 }}>
                    {n.date}
                  </span>
                  <p style={{ fontSize: 11.5, color: 'var(--text-body)', margin: '2px 0 0' }}>{n.text}</p>
                </div>
                <button className="remove" onClick={() => removeNote(n.id)} aria-label="Remove">
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  )
}
