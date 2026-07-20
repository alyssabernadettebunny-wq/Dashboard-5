import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface Entry {
  id: string
  timestamp: string
  peopleAway: string[]
  visitorsExtra: string
  quietWindow: string
  mainPressure: string
  boundaryNote: string
  opportunity: string
}

const PEOPLE_CHIPS = [
  'Alyssa', 'Winnie', 'Amy', 'Holly',
  'Mom / Angela', 'Dad', 'Nick', 'Vincent',
  'Nina', "Nina's kids", 'Alysson', "Alysson's kids",
  'Santi / Daycare', 'Grandma-related pressure', 'Other visitors',
  'Misa', 'Coco', 'Juno', 'Abby',
]

const QUIET_WINDOW_OPTIONS = ['Yes', 'No', 'Maybe', 'Later', 'Unknown']

const MAIN_PRESSURE_OPTIONS = [
  'Noise',
  'Being perceived',
  'People in kitchen/living room',
  'Daycare activity',
  'Kids visiting',
  'Dog chaos',
  'Waiting for pickup/dropoff',
  'Family conversation risk',
  'No clear private space',
  'Phone/video calls happening nearby',
  'Cooking smells triggering nausea',
]

const BOUNDARY_OPTIONS = [
  'Do not get trapped downstairs',
  'Use quiet window now',
  'Keep interaction brief',
  'Door closed if possible',
  'Upstairs reset allowed',
  'No explanation required',
  'Handle dogs, then leave',
  "Say you'll be back later, no more explanation needed",
  'Redirect to another family member',
]

const OPPORTUNITY_OPTIONS = [
  'Quiet time for one tiny task',
  'Good time to eat',
  'Good time to shower',
  'Good time to work on dashboard',
  'Good time to save ideas',
  'Good time to rest without being perceived',
  'Good time for a quick walk',
  'Good time to journal',
]

const CUSTOM = 'Custom (type your own)...'

function CustomSelect({
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

export default function HouseholdStatusBoard() {
  const [log, setLog] = useLocalStorage<Entry[]>('dashboard.householdstatus.log', [])
  const [open, setOpen] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const [peopleAway, setPeopleAway] = useState<string[]>([])
  const [visitorsExtra, setVisitorsExtra] = useState('')
  const [quietWindow, setQuietWindow] = useState('')
  const [mainPressure, setMainPressure] = useState('')
  const [mainPressureCustom, setMainPressureCustom] = useState('')
  const [boundaryNote, setBoundaryNote] = useState('')
  const [boundaryNoteCustom, setBoundaryNoteCustom] = useState('')
  const [opportunity, setOpportunity] = useState('')
  const [opportunityCustom, setOpportunityCustom] = useState('')

  const today = new Date().toISOString().slice(0, 10)
  const todaysEntries = log.filter((e) => e.timestamp.slice(0, 10) === today)
  const latest = todaysEntries[0]

  function togglePerson(name: string) {
    setPeopleAway((prev) => (prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]))
  }

  function resetForm() {
    setPeopleAway([])
    setVisitorsExtra('')
    setQuietWindow('')
    setMainPressure('')
    setMainPressureCustom('')
    setBoundaryNote('')
    setBoundaryNoteCustom('')
    setOpportunity('')
    setOpportunityCustom('')
  }

  function logStatus() {
    const entry: Entry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      peopleAway,
      visitorsExtra: visitorsExtra.trim(),
      quietWindow,
      mainPressure: mainPressure === CUSTOM ? mainPressureCustom.trim() : mainPressure,
      boundaryNote: boundaryNote === CUSTOM ? boundaryNoteCustom.trim() : boundaryNote,
      opportunity: opportunity === CUSTOM ? opportunityCustom.trim() : opportunity,
    }
    setLog([entry, ...log])
    resetForm()
    setOpen(false)
  }

  return (
    <Card icon="🏠" title="Household Status Board" wide>
      <p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>House pressure is context, not a character flaw.</p>

      {!open && (
        <>
          {latest ? (
            <div className="hsb-latest">
              <div className="hsb-latest-row">
                <span className="sub" style={{ marginLeft: 0 }}>
                  {timeAgo(latest.timestamp)}
                </span>
                {latest.quietWindow && <span>Quiet window: {latest.quietWindow}</span>}
              </div>
              {latest.mainPressure && (
                <p>
                  <strong>Pressure:</strong> {latest.mainPressure}
                </p>
              )}
              {latest.boundaryNote && (
                <p>
                  <strong>Boundary:</strong> {latest.boundaryNote}
                </p>
              )}
              {latest.opportunity && (
                <p>
                  <strong>Opportunity:</strong> {latest.opportunity}
                </p>
              )}
              {latest.peopleAway.length > 0 && (
                <p>
                  <strong>People/pets flagged:</strong> {latest.peopleAway.join(', ')}
                  {latest.visitorsExtra && `, ${latest.visitorsExtra}`}
                </p>
              )}
            </div>
          ) : (
            <p className="c-empty">No entry yet today.</p>
          )}
          <button className="card-footer-btn" onClick={() => setOpen(true)}>
            + Log house status
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
                      {[e.quietWindow && `Quiet: ${e.quietWindow}`, e.mainPressure, e.boundaryNote, e.opportunity].filter(Boolean).join(' · ')}
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
          <div className="hsb-field">
            <label>People away</label>
            <div className="hsb-chip-row">
              {PEOPLE_CHIPS.map((name) => (
                <button
                  key={name}
                  className={`hsb-chip ${peopleAway.includes(name) ? 'active' : ''}`}
                  onClick={() => togglePerson(name)}
                  type="button"
                >
                  {name}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Visitors / extras (optional)"
              value={visitorsExtra}
              onChange={(e) => setVisitorsExtra(e.target.value)}
            />
          </div>

          <div className="hsb-field">
            <label>Quiet window available?</label>
            <div className="hsb-chip-row">
              {QUIET_WINDOW_OPTIONS.map((o) => (
                <button
                  key={o}
                  className={`hsb-chip ${quietWindow === o ? 'active' : ''}`}
                  onClick={() => setQuietWindow(o)}
                  type="button"
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          <CustomSelect
            label="Main pressure"
            options={MAIN_PRESSURE_OPTIONS}
            value={mainPressure}
            customValue={mainPressureCustom}
            onChange={setMainPressure}
            onCustomChange={setMainPressureCustom}
          />

          <CustomSelect
            label="Boundary / extraction note"
            options={BOUNDARY_OPTIONS}
            value={boundaryNote}
            customValue={boundaryNoteCustom}
            onChange={setBoundaryNote}
            onCustomChange={setBoundaryNoteCustom}
          />

          <CustomSelect
            label="Opportunity"
            options={OPPORTUNITY_OPTIONS}
            value={opportunity}
            customValue={opportunityCustom}
            onChange={setOpportunity}
            onCustomChange={setOpportunityCustom}
          />

          <div className="c-input-row">
            <button onClick={logStatus}>Log status</button>
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

      <hr className="card-divider" />
      <p style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
        Manual — stored on this device · context, not a character flaw
      </p>
    </Card>
  )
}
