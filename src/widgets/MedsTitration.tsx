import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import './widgets.css'

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
      {
        id: crypto.randomUUID(),
        name: trimmed,
        currentDose: '',
        sinceDate: todayStr(),
        nextReview: '',
        history: [],
      },
    ])
    setTitrationName('')
  }

  function logDoseChange(id: string) {
    const newDose = window.prompt('New dose (e.g. "10mg")')
    if (!newDose) return
    setTitrationMeds(
      titrationMeds.map((t) => {
        if (t.id !== id) return t
        const history = t.currentDose
          ? [...t.history, { dose: t.currentDose, date: t.sinceDate }]
          : t.history
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

  return (
    <section className="widget">
      <h2>
        <span className="icon-badge">💊</span> Meds & Titration
        {meds.length > 0 && (
          <span className="widget-count">
            {meds.filter((m) => m.takenToday).length} / {meds.length}
          </span>
        )}
      </h2>

      <div className="subcard">
        <h3>Daily Meds</h3>
        <div className="task-input">
          <input
            type="text"
            value={medName}
            placeholder="Add a medication..."
            onChange={(e) => setMedName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addMed()}
          />
          <button onClick={addMed}>Add</button>
        </div>
        <ul className="med-list">
          {meds.length === 0 && <li className="empty">No meds added yet</li>}
          {meds.map((med) => (
            <li key={med.id}>
              <label>
                <input
                  type="checkbox"
                  checked={med.takenToday}
                  onChange={(e) => updateMed(med.id, { takenToday: e.target.checked })}
                />
                <span>{med.name}</span>
              </label>
              <label className="refill-toggle">
                <input
                  type="checkbox"
                  checked={med.refillNeeded}
                  onChange={(e) => updateMed(med.id, { refillNeeded: e.target.checked })}
                />
                refill needed
              </label>
              <button className="remove" onClick={() => removeMed(med.id)} aria-label="Remove med">
                ×
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="subcard">
        <h3>Titration Tracking</h3>
        <div className="task-input">
          <input
            type="text"
            value={titrationName}
            placeholder="Add a med being titrated..."
            onChange={(e) => setTitrationName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTitrationMed()}
          />
          <button onClick={addTitrationMed}>Add</button>
        </div>
        <ul className="titration-list">
          {titrationMeds.length === 0 && <li className="empty">Nothing being titrated right now</li>}
          {titrationMeds.map((t) => (
            <li key={t.id} className="titration-item">
              <div className="titration-header">
                <strong>{t.name}</strong>
                <button className="remove" onClick={() => removeTitration(t.id)} aria-label="Remove">
                  ×
                </button>
              </div>
              <p className="titration-dose">
                {t.currentDose ? `${t.currentDose} since ${t.sinceDate}` : 'No dose logged yet'}
              </p>
              <div className="titration-controls">
                <button onClick={() => logDoseChange(t.id)}>Log dose change</button>
                <label>
                  Next review:
                  <input
                    type="date"
                    value={t.nextReview}
                    onChange={(e) => updateTitration(t.id, { nextReview: e.target.value })}
                  />
                </label>
              </div>
              {t.history.length > 0 && (
                <details className="titration-history">
                  <summary>Dose history ({t.history.length})</summary>
                  <ul>
                    {t.history.map((h, i) => (
                      <li key={i}>
                        {h.dose} — {h.date}
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
