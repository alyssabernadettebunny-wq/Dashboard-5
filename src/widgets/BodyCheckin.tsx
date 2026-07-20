import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { isLogicalToday } from '../lib/logicalDate'
import Card from '../components/Card'

interface Entry {
  id: string
  timestamp: string
  overall: string
  energy: string
  sensoryLoad: string
  painDiscomfort: string
  nausea: string
  notes: string
}

const OVERALL_OPTIONS = ['Great', 'Good', 'Okay', 'Rough', 'Struggling']
const ENERGY_OPTIONS = ['Very low', 'Low', 'Moderate', 'Good', 'High']
const SENSORY_LOAD_OPTIONS = ['Calm', 'Mild', 'Noticeable', 'High', 'Overwhelmed']
const PAIN_OPTIONS = ['None', 'Mild', 'Moderate', 'Severe']
const NAUSEA_OPTIONS = ['None', 'Mild', 'Moderate', 'Severe']

function Field({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="hsb-field">
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">—</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  )
}

function timeAgo(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export default function BodyCheckin() {
  const [log, setLog] = useLocalStorage<Entry[]>('dashboard.body.log', [])
  const [open, setOpen] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const [overall, setOverall] = useState('')
  const [energy, setEnergy] = useState('')
  const [sensoryLoad, setSensoryLoad] = useState('')
  const [painDiscomfort, setPainDiscomfort] = useState('')
  const [nausea, setNausea] = useState('')
  const [notes, setNotes] = useState('')

  const todaysEntries = log.filter((e) => isLogicalToday(e.timestamp))
  const latest = todaysEntries[0]

  function resetForm() {
    setOverall('')
    setEnergy('')
    setSensoryLoad('')
    setPainDiscomfort('')
    setNausea('')
    setNotes('')
  }

  function logCheckin() {
    const entry: Entry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      overall,
      energy,
      sensoryLoad,
      painDiscomfort,
      nausea,
      notes: notes.trim(),
    }
    setLog([entry, ...log])
    resetForm()
    setOpen(false)
  }

  return (
    <Card icon="🌤️" title="Body Check-In">
      {!open && (
        <>
          {latest ? (
            <div className="hsb-latest">
              <div className="hsb-latest-row">
                <span className="sub" style={{ marginLeft: 0 }}>
                  {timeAgo(latest.timestamp)}
                </span>
                {latest.overall && <span>{latest.overall}</span>}
              </div>
              {latest.energy && (
                <p>
                  <strong>Energy:</strong> {latest.energy}
                </p>
              )}
              {latest.sensoryLoad && (
                <p>
                  <strong>Sensory load:</strong> {latest.sensoryLoad}
                </p>
              )}
              {latest.painDiscomfort && latest.painDiscomfort !== 'None' && (
                <p>
                  <strong>Pain/discomfort:</strong> {latest.painDiscomfort}
                </p>
              )}
              {latest.nausea && latest.nausea !== 'None' && (
                <p>
                  <strong>Nausea:</strong> {latest.nausea}
                </p>
              )}
              {latest.notes && <p>{latest.notes}</p>}
            </div>
          ) : (
            <p className="c-empty">No check-in yet today.</p>
          )}
          <button className="card-footer-btn" onClick={() => setOpen(true)}>
            + Add check-in
          </button>
          {log.length > 0 && (
            <button className="card-footer-btn" style={{ marginLeft: 8 }} onClick={() => setShowHistory((v) => !v)}>
              {showHistory ? 'Hide history' : 'View history'}
            </button>
          )}
          {showHistory && (
            <ul className="c-list" style={{ marginTop: 8 }}>
              {log.map((e) => (
                <li key={e.id} className="c-list-item" style={{ alignItems: 'flex-start' }}>
                  <div>
                    <span className="sub" style={{ marginLeft: 0 }}>
                      {new Date(e.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </span>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                      {[e.overall, e.energy && `Energy: ${e.energy}`, e.sensoryLoad && `Sensory: ${e.sensoryLoad}`]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                  <button className="remove" onClick={() => setLog(log.filter((x) => x.id !== e.id))} aria-label="Remove">
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {open && (
        <div className="hsb-form">
          <Field label="Overall" options={OVERALL_OPTIONS} value={overall} onChange={setOverall} />
          <Field label="Energy" options={ENERGY_OPTIONS} value={energy} onChange={setEnergy} />
          <Field label="Sensory load" options={SENSORY_LOAD_OPTIONS} value={sensoryLoad} onChange={setSensoryLoad} />
          <Field label="Pain / discomfort" options={PAIN_OPTIONS} value={painDiscomfort} onChange={setPainDiscomfort} />
          <Field label="Nausea" options={NAUSEA_OPTIONS} value={nausea} onChange={setNausea} />
          <div className="hsb-field">
            <label>Notes</label>
            <textarea className="c-textarea" placeholder="Anything else..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="c-input-row">
            <button onClick={logCheckin}>Log check-in</button>
            <button
              className="card-footer-btn"
              onClick={() => {
                resetForm()
                setOpen(false)
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </Card>
  )
}
