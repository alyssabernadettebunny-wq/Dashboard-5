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

interface DoseEntry {
  id: string
  date: string
  dose: string
}

interface TitrationMed {
  id: string
  name: string
  nextReview: string
  entries: DoseEntry[]
}

function todayStr() {
  return localDateKey()
}

function sortEntries(entries: DoseEntry[]) {
  return [...entries].sort((a, b) => b.date.localeCompare(a.date))
}

interface MedsDayRecord {
  date: string
  taken: string[]
}

function TitrationCard({
  med,
  onUpdate,
  onRemove,
}: {
  med: TitrationMed
  onUpdate: (patch: Partial<TitrationMed>) => void
  onRemove: () => void
}) {
  const [newDate, setNewDate] = useState(todayStr())
  const [newDose, setNewDose] = useState('')
  const medEntries = med.entries ?? []
  const sorted = sortEntries(medEntries)
  const current = sorted[0]

  function logDose() {
    if (!newDose.trim()) return
    onUpdate({ entries: [...medEntries, { id: crypto.randomUUID(), date: newDate, dose: newDose.trim() }] })
    setNewDose('')
  }

  function updateEntry(id: string, patch: Partial<DoseEntry>) {
    onUpdate({ entries: medEntries.map((e) => (e.id === id ? { ...e, ...patch } : e)) })
  }

  function removeEntry(id: string) {
    onUpdate({ entries: medEntries.filter((e) => e.id !== id) })
  }

  return (
    <div className="subsection">
      <div className="card-header">
        <strong style={{ fontSize: 12.5, color: 'var(--text-heading)' }}>{med.name}</strong>
        <button className="remove" onClick={onRemove} aria-label="Remove">
          ×
        </button>
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
        {current ? `Current: ${current.dose} (since ${current.date})` : 'No dose logged yet'}
      </p>

      <div className="c-input-row">
        <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
        <input type="text" placeholder="Dose (e.g. 10mg)" value={newDose} onChange={(e) => setNewDose(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && logDose()} />
        <button onClick={logDose}>Log</button>
      </div>

      <div className="c-input-row" style={{ marginTop: 6 }}>
        <span className="sub" style={{ marginLeft: 0 }}>
          Next review date
        </span>
        <input type="date" value={med.nextReview} onChange={(e) => onUpdate({ nextReview: e.target.value })} />
      </div>

      {sorted.length > 0 && (
        <ul className="c-list" style={{ marginTop: 8 }}>
          {sorted.map((e) => (
            <li key={e.id} className="c-list-item">
              <input type="date" value={e.date} onChange={(ev) => updateEntry(e.id, { date: ev.target.value })} style={{ maxWidth: 130 }} />
              <input type="text" value={e.dose} onChange={(ev) => updateEntry(e.id, { dose: ev.target.value })} />
              <button className="remove" onClick={() => removeEntry(e.id)} aria-label="Remove dose entry">
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
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

  const [titrationMeds, setTitrationMeds] = useLocalStorage<TitrationMed[]>('dashboard.titration', [])
  const [titrationName, setTitrationName] = useState('')
  const migratedRef = useRef(false)

  // One-time migration from the old currentDose/sinceDate/history shape to entries[]
  useEffect(() => {
    if (migratedRef.current) return
    migratedRef.current = true
    const needsMigration = titrationMeds.some((t) => !Array.isArray(t.entries))
    if (!needsMigration) return
    setTitrationMeds((prev) =>
      prev.map((t) => {
        const anyT = t as unknown as { currentDose?: string; sinceDate?: string; history?: { dose: string; date: string }[]; entries?: DoseEntry[] }
        if (Array.isArray(anyT.entries)) return t
        const entries: DoseEntry[] = [
          ...(anyT.history ?? []).map((h) => ({ id: crypto.randomUUID(), date: h.date, dose: h.dose })),
          ...(anyT.currentDose ? [{ id: crypto.randomUUID(), date: anyT.sinceDate || todayStr(), dose: anyT.currentDose }] : []),
        ]
        return { id: t.id, name: t.name, nextReview: t.nextReview ?? '', entries }
      }),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    setTitrationMeds([...titrationMeds, { id: crypto.randomUUID(), name: trimmed, nextReview: '', entries: [] }])
    setTitrationName('')
  }

  function updateTitration(id: string, patch: Partial<TitrationMed>) {
    setTitrationMeds(titrationMeds.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }

  function removeTitration(id: string) {
    setTitrationMeds(titrationMeds.filter((t) => t.id !== id))
  }

  const takenCount = meds.filter((m) => m.takenToday).length

  return (
    <Card icon="💊" title="Meds & Titration" meta={meds.length ? `${takenCount} / ${meds.length}` : undefined} variant="memo" surface="cream">
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
        <TitrationCard
          key={t.id}
          med={t}
          onUpdate={(patch) => updateTitration(t.id, patch)}
          onRemove={() => removeTitration(t.id)}
        />
      ))}
    </Card>
  )
}
