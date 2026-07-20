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

const OVERALL_OPTIONS = [
  'Feeling great, full of energy',
  'Pretty good, no real complaints',
  'Okay, just getting through it',
  'Rough, running on low reserves',
  'Struggling, need extra care today',
  'Running on empty',
]
const ENERGY_OPTIONS = [
  'Wired and ready to go',
  'Steady and capable',
  'A little drained, but managing',
  'Running low, need to pace myself',
  'Completely depleted',
]
const SENSORY_LOAD_OPTIONS = [
  'Calm, easy to be in my body',
  'A little noisy, but tolerable',
  'Getting overstimulated',
  'Sensory overload building up',
  'Fully overwhelmed, need to shut it down',
]
const PAIN_OPTIONS = [
  'No pain today',
  'Mild ache, easy to ignore',
  'Noticeable discomfort',
  'Significant pain, hard to focus through',
  'Severe, need to stop and rest',
]
const NAUSEA_OPTIONS = [
  'No nausea',
  'Slight queasiness',
  'Noticeable nausea',
  'Strong nausea, hard to eat',
  "Severe, can't keep anything down",
]

const CUSTOM = 'Custom (type your own)...'

function Field({
  label,
  options,
  value,
  customValue,
  onChange,
  onCustomChange,
}: {
  label: string
  options: string[]
  value: string
  customValue: string
  onChange: (v: string) => void
  onCustomChange: (v: string) => void
}) {
  const isCustom = value === CUSTOM
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
        <option value={CUSTOM}>{CUSTOM}</option>
      </select>
      {isCustom && (
        <input type="text" placeholder="Type your own..." value={customValue} onChange={(e) => onCustomChange(e.target.value)} />
      )}
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
  const [overallCustom, setOverallCustom] = useState('')
  const [energy, setEnergy] = useState('')
  const [energyCustom, setEnergyCustom] = useState('')
  const [sensoryLoad, setSensoryLoad] = useState('')
  const [sensoryLoadCustom, setSensoryLoadCustom] = useState('')
  const [painDiscomfort, setPainDiscomfort] = useState('')
  const [painDiscomfortCustom, setPainDiscomfortCustom] = useState('')
  const [nausea, setNausea] = useState('')
  const [nauseaCustom, setNauseaCustom] = useState('')
  const [notes, setNotes] = useState('')

  const todaysEntries = log.filter((e) => isLogicalToday(e.timestamp))
  const latest = todaysEntries[0]

  function resetForm() {
    setOverall('')
    setOverallCustom('')
    setEnergy('')
    setEnergyCustom('')
    setSensoryLoad('')
    setSensoryLoadCustom('')
    setPainDiscomfort('')
    setPainDiscomfortCustom('')
    setNausea('')
    setNauseaCustom('')
    setNotes('')
  }

  function logCheckin() {
    const entry: Entry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      overall: overall === CUSTOM ? overallCustom.trim() : overall,
      energy: energy === CUSTOM ? energyCustom.trim() : energy,
      sensoryLoad: sensoryLoad === CUSTOM ? sensoryLoadCustom.trim() : sensoryLoad,
      painDiscomfort: painDiscomfort === CUSTOM ? painDiscomfortCustom.trim() : painDiscomfort,
      nausea: nausea === CUSTOM ? nauseaCustom.trim() : nausea,
      notes: notes.trim(),
    }
    setLog([entry, ...log])
    resetForm()
    setOpen(false)
  }

  return (
    <Card
      icon="🌤️"
      title="Body Check-In"
      surface="peach"
      anchor={<img src="/Dashboard-5/images/self-illustration-avatar.png" alt="" style={{ borderRadius: '50%' }} />}
    >
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
          <Field label="Overall" options={OVERALL_OPTIONS} value={overall} customValue={overallCustom} onChange={setOverall} onCustomChange={setOverallCustom} />
          <Field label="Energy" options={ENERGY_OPTIONS} value={energy} customValue={energyCustom} onChange={setEnergy} onCustomChange={setEnergyCustom} />
          <Field
            label="Sensory load"
            options={SENSORY_LOAD_OPTIONS}
            value={sensoryLoad}
            customValue={sensoryLoadCustom}
            onChange={setSensoryLoad}
            onCustomChange={setSensoryLoadCustom}
          />
          <Field
            label="Pain / discomfort"
            options={PAIN_OPTIONS}
            value={painDiscomfort}
            customValue={painDiscomfortCustom}
            onChange={setPainDiscomfort}
            onCustomChange={setPainDiscomfortCustom}
          />
          <Field label="Nausea" options={NAUSEA_OPTIONS} value={nausea} customValue={nauseaCustom} onChange={setNausea} onCustomChange={setNauseaCustom} />
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
