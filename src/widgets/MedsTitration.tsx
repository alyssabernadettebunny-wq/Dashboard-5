import { useEffect, useRef, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { localDateKey, logicalDateKey } from '../lib/logicalDate'
import Card from '../components/Card'

interface Med {
  id: string
  name: string
  takenToday: boolean
  refillNeeded: boolean
}

interface DoseChange {
  dose: string
  date: string
}

interface TitrationMed {
  id: string
  name: string
  currentDose: string
  sinceDate: string
  nextReview: string
  history: DoseChange[]
}

function todayStr() {
  return localDateKey()
}

interface MedsDayRecord {
  date: string
  taken: string[]
}

export default function MedsTitration() {
  const [meds, setMeds] = useLocalStorage<Med[]>('dashboard.meds', [])
  const [medsDay, setMedsDay] = useLocalStorage('dashboard.meds.day', logicalDateKey())
  const [medsHistory, setMedsHistory] = useLocalStorage<MedsDayRecord[]>('dashboard.meds.history', [])
  const archivedRef = useRef(false)
  const [medName, setMedName] = useState('')
  const [addingMed, setAddingMed] = useState(false)
  const [showMedsHistory, setShowMedsHistory] = useState(false)

  useEffect(() => {
    const today = logicalDateKey()
    if (medsDay !== today && !archivedRef.current) {
      archivedRef.current = true
      setMedsHistory((prev) => [{ date: medsDay, taken: meds.filter((m) => m.takenToday).map((m) => m.name) }, ...prev])
      setMeds((prevMeds) => prevMeds.map((m) => ({ ...m, takenToday: false })))
      setMedsDay(today)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [medsDay])

  const [titrationMeds, setTitrationMeds] = useLocalStorage<TitrationMed[]>(
    'dashboard.titration',
    [],
  )
  const [titrationName, setTitrationName] = useState('')

  function addMed() {
    const trimmed = medName.trim()
    if (!trimmed) return
    setMeds([...meds, { id: crypto.randomUUID(), name: trimmed, takenToday: false, refillNeeded: false }])
    setMedName('')
    setAddingMed(false)
  }

  function updateMed(id: string, patch: Partial<Med>) {
    setMeds(meds.map((m) => (m.id === id ? { ...m, ...patch } : m)))
  }

  function removeMed(id: string) {
    setMeds(meds.filter((m) => m.id !== id))
  }

  function addTitrationMed() {
    const trimmed = titrationName.trim()
    if (!trimmed) return
    setTitrationMeds([
      ...titrationMeds,
      { id: crypto.randomUUID(), name: trimmed, currentDose: '', sinceDate: todayStr(), nextReview: '', history: [] },
    ])
    setTitrationName('')
  }

  function logDoseChange(id: string) {
    const newDose = window.prompt('New dose (e.g. "10mg")')
    if (!newDose) return
    setTitrationMeds(
      titrationMeds.map((t) => {
        if (t.id !== id) return t
        const history = t.currentDose ? [...t.history, { dose: t.currentDose, date: t.sinceDate }] : t.history
        return { ...t, currentDose: newDose, sinceDate: todayStr(), history }
      }),
    )
  }

  function updateTitration(id: string, patch: Partial<TitrationMed>) {
    setTitrationMeds(titrationMeds.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }

  function removeTitration(id: string) {
    setTitrationMeds(titrationMeds.filter((t) => t.id !== id))
  }

  const takenCount = meds.filter((m) => m.takenToday).length

  return (
    <Card icon="💊" title="Meds & Titration" meta={meds.length ? `${takenCount} / ${meds.length}` : undefined}>
      <div className="med-section-header">
        <span className="section-label" style={{ margin: 0 }}>
          💊 Medication (Daily Check)
        </span>
        {meds.length > 0 && (
          <span className="card-meta">
            {takenCount} / {meds.length}
          </span>
        )}
      </div>
      <ul className="med-list">
        {meds.length === 0 && <li className="c-empty">No meds added yet</li>}
        {meds.map((med) => (
          <li key={med.id} className="med-row">
            <input
              type="checkbox"
              checked={med.takenToday}
              onChange={(e) => updateMed(med.id, { takenToday: e.target.checked })}
            />
            <span className="med-name">{med.name}</span>
            <span className={`med-status ${med.takenToday ? 'taken' : 'missed'}`}>
              {med.takenToday ? 'Taken' : 'Missed'}
            </span>
            <span className={`med-circle ${med.takenToday ? 'filled' : ''}`}>{med.takenToday && '✓'}</span>
            <button className="med-remove" onClick={() => removeMed(med.id)} aria-label="Remove med">
              ×
            </button>
          </li>
        ))}
      </ul>
      {medsHistory.length > 0 && (
        <button className="card-footer-btn" onClick={() => setShowMedsHistory((v) => !v)}>
          {showMedsHistory ? 'Hide past days' : 'View past days'}
        </button>
      )}
      {showMedsHistory && (
        <ul className="c-list" style={{ marginTop: 8, marginBottom: 8 }}>
          {medsHistory.map((h, i) => (
            <li key={i} className="c-list-item" style={{ alignItems: 'flex-start' }}>
              <div>
                <span className="sub" style={{ marginLeft: 0 }}>
                  {h.date}
                </span>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  {h.taken.length > 0 ? `Taken: ${h.taken.join(', ')}` : 'Nothing marked taken'}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
      {addingMed ? (
        <div className="c-input-row">
          <input
            type="text"
            value={medName}
            placeholder="Add a medication..."
            autoFocus
            onChange={(e) => setMedName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addMed()}
          />
          <button onClick={addMed}>Add</button>
        </div>
      ) : (
        <button className="card-footer-btn" onClick={() => setAddingMed(true)}>
          + Add / Edit meds 💊
        </button>
      )}

      <p className="section-label">Titration Tracking</p>
      <div className="c-input-row">
        <input
          type="text"
          value={titrationName}
          placeholder="Add a med being titrated..."
          onChange={(e) => setTitrationName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTitrationMed()}
        />
        <button onClick={addTitrationMed}>Add</button>
      </div>
      {titrationMeds.length === 0 && <p className="c-empty">Nothing being titrated right now</p>}
      {titrationMeds.map((t) => (
        <div key={t.id} className="subsection">
          <div className="card-header">
            <strong style={{ fontSize: 12.5, color: 'var(--text-heading)' }}>{t.name}</strong>
            <button className="remove" onClick={() => removeTitration(t.id)} aria-label="Remove">
              ×
            </button>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
            {t.currentDose ? `${t.currentDose} since ${t.sinceDate}` : 'No dose logged yet'}
            {t.currentDose && (
              <button className="remove" onClick={() => updateTitration(t.id, { currentDose: '', sinceDate: '' })} aria-label="Clear current dose">
                ×
              </button>
            )}
          </p>
          <div className="c-input-row">
            <button onClick={() => logDoseChange(t.id)}>Log dose change</button>
          </div>
          <div className="c-input-row" style={{ marginTop: 4 }}>
            <span className="sub" style={{ marginLeft: 0 }}>
              Next review date
            </span>
            <input type="date" value={t.nextReview} onChange={(e) => updateTitration(t.id, { nextReview: e.target.value })} />
          </div>
          {t.history.length > 0 && (
            <details>
              <summary style={{ fontSize: 11, color: 'var(--purple-heading)', cursor: 'pointer' }}>
                Dose history ({t.history.length})
              </summary>
              <ul className="c-list" style={{ marginTop: 6 }}>
                {t.history.map((h, i) => (
                  <li key={i} className="c-list-item">
                    <span>
                      {h.dose} — {h.date}
                    </span>
                    <button
                      className="remove"
                      onClick={() => updateTitration(t.id, { history: t.history.filter((_, idx) => idx !== i) })}
                      aria-label="Remove dose history entry"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </div>
      ))}
    </Card>
  )
}
