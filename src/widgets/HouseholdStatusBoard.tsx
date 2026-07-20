import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { isLogicalToday } from '../lib/logicalDate'
import Card from '../components/Card'

interface Entry {
  id: string
  timestamp: string
  householdStatus: Record<string, string>
  visitorsHere: string[]
  visitorsExtra: string
  dogStatuses: Record<string, string>
  quietWindow: string
  mainPressure: string
  boundaryNote: string
  opportunity: string
  daysVibe: string
}

const HOUSEHOLD_MEMBERS = ['Alyssa', 'Winnie', 'Amy', 'Holly', 'Mom / Angela', 'Dad', 'Nick', 'Vincent']
const HOUSEHOLD_STATUS_OPTIONS = ['Home', 'Out', 'Away', 'In room', 'Sleeping']

const VISITOR_CHIPS = ['Nina', "Nina's kids", 'Alysson', "Alysson's kids", 'Grandma', 'Santi / Daycare', 'Other visitors']

const DOG_STATUS_OPTIONS = ['Quiet and settled', 'Put away inside', 'Put outside', 'Walking around / out and about']
const OWN_DOGS = ['Misa', 'Coco']
const OTHER_DOGS = [
  { name: 'Juno', owner: "Dad's" },
  { name: 'Hades', owner: "Mom's" },
  { name: 'Zeno', owner: "Mom's" },
  { name: 'Abby', owner: "Mom's" },
  { name: 'Dottie', owner: "Vince's" },
  { name: 'Brutus', owner: "Vince's" },
]
const OWN_DOG_STATUS_OPTIONS = [...DOG_STATUS_OPTIONS, 'Sleeping']

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
  'Multiple people talking at once',
  'Someone hovering nearby',
  'Unexpected guest arrival',
  'Cleaning/organizing chaos',
  'TV or screen noise',
  'Too many requests at once',
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
  'Politely decline extra tasks right now',
  'Text instead of talk',
  "It's okay to not respond right away",
  'One task at a time only',
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
  'Good time to nap',
  'Good time to call a friend',
  'Good time to tidy one small area',
  'Good time to do nothing at all',
]

const DAYS_VIBE_OPTIONS = [
  'Calm',
  'Chaotic',
  'Tense',
  'Busy but manageable',
  'Low energy',
  'High energy',
  'Recovery day',
  'Celebratory',
  'Unpredictable',
  'Heavy',
  'Light & easy',
  'Overstimulating',
  'Peaceful',
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

function statusClass(status: string) {
  return `status-${status.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`
}

export default function HouseholdStatusBoard() {
  const [log, setLog] = useLocalStorage<Entry[]>('dashboard.householdstatus.log', [])
  const [open, setOpen] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const [householdStatus, setHouseholdStatus] = useState<Record<string, string>>({})
  const [visitorsHere, setVisitorsHere] = useState<string[]>([])
  const [visitorsExtra, setVisitorsExtra] = useState('')
  const [dogStatuses, setDogStatuses] = useState<Record<string, string>>({})
  const [quietWindow, setQuietWindow] = useState('')
  const [mainPressure, setMainPressure] = useState('')
  const [mainPressureCustom, setMainPressureCustom] = useState('')
  const [boundaryNote, setBoundaryNote] = useState('')
  const [boundaryNoteCustom, setBoundaryNoteCustom] = useState('')
  const [opportunity, setOpportunity] = useState('')
  const [opportunityCustom, setOpportunityCustom] = useState('')
  const [daysVibe, setDaysVibe] = useState('')

  const todaysEntries = log.filter((e) => isLogicalToday(e.timestamp))
  const latest = todaysEntries[0]

  function setMemberStatus(name: string, status: string) {
    setHouseholdStatus((prev) => {
      const next = { ...prev }
      if (status) next[name] = status
      else delete next[name]
      return next
    })
  }

  function toggleVisitor(name: string) {
    setVisitorsHere((prev) => (prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]))
  }

  function setDogStatus(dog: string, status: string) {
    setDogStatuses((prev) => {
      const next = { ...prev }
      if (status) next[dog] = status
      else delete next[dog]
      return next
    })
  }

  function resetForm() {
    setHouseholdStatus({})
    setVisitorsHere([])
    setVisitorsExtra('')
    setDogStatuses({})
    setQuietWindow('')
    setMainPressure('')
    setMainPressureCustom('')
    setBoundaryNote('')
    setBoundaryNoteCustom('')
    setOpportunity('')
    setOpportunityCustom('')
    setDaysVibe('')
  }

  function logStatus() {
    const entry: Entry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      householdStatus,
      visitorsHere,
      visitorsExtra: visitorsExtra.trim(),
      dogStatuses,
      quietWindow,
      mainPressure: mainPressure === CUSTOM ? mainPressureCustom.trim() : mainPressure,
      boundaryNote: boundaryNote === CUSTOM ? boundaryNoteCustom.trim() : boundaryNote,
      opportunity: opportunity === CUSTOM ? opportunityCustom.trim() : opportunity,
      daysVibe,
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
              {latest.daysVibe && (
                <p>
                  <strong>Day's vibe:</strong> {latest.daysVibe}
                </p>
              )}
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
              {Object.keys(latest.householdStatus ?? {}).length > 0 && (
                <div className="hsb-summary-block">
                  <strong>Household</strong>
                  <div className="hsb-summary-chips">
                    {Object.entries(latest.householdStatus).map(([name, status]) => (
                      <span key={name} className={`hsb-summary-chip ${statusClass(status)}`}>
                        {name} <span className="hsb-summary-chip-status">{status}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {(latest.visitorsHere?.length > 0 || latest.visitorsExtra) && (
                <div className="hsb-summary-block">
                  <strong>Here from outside</strong>
                  <div className="hsb-summary-chips">
                    {latest.visitorsHere.map((name) => (
                      <span key={name} className="hsb-summary-chip">
                        {name}
                      </span>
                    ))}
                    {latest.visitorsExtra && <span className="hsb-summary-chip">{latest.visitorsExtra}</span>}
                  </div>
                </div>
              )}
              {Object.keys(latest.dogStatuses ?? {}).length > 0 && (
                <div className="hsb-summary-block">
                  <strong>Dogs</strong>
                  <div className="hsb-summary-chips">
                    {Object.entries(latest.dogStatuses).map(([dog, status]) => (
                      <span key={dog} className={`hsb-summary-chip ${statusClass(status)}`}>
                        {dog} <span className="hsb-summary-chip-status">{status}</span>
                      </span>
                    ))}
                  </div>
                </div>
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
                      {[e.daysVibe, e.quietWindow && `Quiet: ${e.quietWindow}`, e.mainPressure, e.boundaryNote, e.opportunity]
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
          <div className="hsb-field">
            <label>Household</label>
            <div className="hsb-dog-grid">
              {HOUSEHOLD_MEMBERS.map((name) => (
                <div key={name} className="hsb-dog-row">
                  <span>{name}</span>
                  <select value={householdStatus[name] ?? ''} onChange={(e) => setMemberStatus(name, e.target.value)}>
                    <option value="">—</option>
                    {HOUSEHOLD_STATUS_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          <div className="hsb-field">
            <label>Here from outside the house</label>
            <div className="hsb-chip-row">
              {VISITOR_CHIPS.map((name) => (
                <button
                  key={name}
                  className={`hsb-chip ${visitorsHere.includes(name) ? 'active' : ''}`}
                  onClick={() => toggleVisitor(name)}
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
            <label>Dogs</label>
            <div className="hsb-dog-grid">
              {OWN_DOGS.map((dog) => (
                <div key={dog} className="hsb-dog-row">
                  <span>{dog}</span>
                  <select value={dogStatuses[dog] ?? ''} onChange={(e) => setDogStatus(dog, e.target.value)}>
                    <option value="">—</option>
                    {OWN_DOG_STATUS_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              {OTHER_DOGS.map(({ name: dog, owner }) => (
                <div key={dog} className="hsb-dog-row">
                  <span>
                    {dog} <span className="sub" style={{ marginLeft: 3 }}>{owner}</span>
                  </span>
                  <select value={dogStatuses[dog] ?? ''} onChange={(e) => setDogStatus(dog, e.target.value)}>
                    <option value="">—</option>
                    {DOG_STATUS_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
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

          <div className="hsb-field">
            <label>Day's vibe</label>
            <select value={daysVibe} onChange={(e) => setDaysVibe(e.target.value)}>
              <option value="">—</option>
              {DAYS_VIBE_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

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
