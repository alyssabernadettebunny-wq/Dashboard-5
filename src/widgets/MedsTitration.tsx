import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
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
  return new Date().toISOString().slice(0, 10)
}

export default function MedsTitration() {
  const [meds, setMeds] = useLocalStorage<Med[]>('dashboard.meds', [])
  const [medName, setMedName] = useState('')

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
      <p className="section-label">Daily Meds</p>
      <div className="c-input-row">
        <input
          type="text"
          value={medName}
          placeholder="Add a medication..."
          onChange={(e) => setMedName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addMed()}
        />
        <button onClick={addMed}>Add</button>
      </div>
      <ul className="c-list">
        {meds.length === 0 && <li className="c-empty">No meds added yet</li>}
        {meds.map((med) => (
          <li key={med.id} className="c-list-item">
            <input type="checkbox" checked={med.takenToday} onChange={(e) => updateMed(med.id, { takenToday: e.target.checked })} />
            <span>{med.name}</span>
            <span className="sub">{med.refillNeeded ? 'refill needed' : 'stocked'}</span>
            <button
              className="remove"
              onClick={() => updateMed(med.id, { refillNeeded: !med.refillNeeded })}
              aria-label="Toggle refill needed"
              title="Toggle refill needed"
            >
              ⟳
            </button>
            <button className="remove" onClick={() => removeMed(med.id)} aria-label="Remove med">
              ×
            </button>
          </li>
        ))}
      </ul>

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
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {t.currentDose ? `${t.currentDose} since ${t.sinceDate}` : 'No dose logged yet'}
          </p>
          <div className="c-input-row">
            <button onClick={() => logDoseChange(t.id)}>Log dose change</button>
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
                    {h.dose} — {h.date}
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
