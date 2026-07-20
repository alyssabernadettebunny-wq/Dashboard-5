import { useEffect, useRef, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { logicalDateKey } from '../lib/logicalDate'
import Card from '../components/Card'

interface DogCare {
  id: string
  name: string
  breakfast: boolean
  dinner: boolean
  tummyIssue: boolean
  notes: string
}

const DEFAULT_DOGS: DogCare[] = [
  { id: 'd1', name: 'Misa', breakfast: false, dinner: false, tummyIssue: false, notes: '' },
  { id: 'd2', name: 'Coco', breakfast: false, dinner: false, tummyIssue: false, notes: '' },
]

const NAME_MIGRATIONS: Record<string, string> = { Frenchie: 'Misa', Maltipoo: 'Coco' }

interface DogsDayRecord {
  date: string
  care: { name: string; breakfast: boolean; dinner: boolean; tummyIssue: boolean }[]
}

export default function DogsCare() {
  const [dogs, setDogs] = useLocalStorage<DogCare[]>('dashboard.dogscare', DEFAULT_DOGS)
  const [dogsDay, setDogsDay] = useLocalStorage('dashboard.dogscare.day', logicalDateKey())
  const [dogsHistory, setDogsHistory] = useLocalStorage<DogsDayRecord[]>('dashboard.dogscare.history', [])
  const archivedRef = useRef(false)
  const migratedRef = useRef(false)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    const today = logicalDateKey()
    if (dogsDay !== today && !archivedRef.current) {
      archivedRef.current = true
      setDogsHistory((prev) => [
        { date: dogsDay, care: dogs.map((d) => ({ name: d.name, breakfast: d.breakfast, dinner: d.dinner, tummyIssue: d.tummyIssue })) },
        ...prev,
      ])
      setDogs((prevDogs) => prevDogs.map((d) => ({ ...d, breakfast: false, dinner: false, tummyIssue: false })))
      setDogsDay(today)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dogsDay])

  useEffect(() => {
    if (migratedRef.current) return
    migratedRef.current = true
    if (dogs.some((d) => NAME_MIGRATIONS[d.name])) {
      setDogs((prev) => prev.map((d) => (NAME_MIGRATIONS[d.name] ? { ...d, name: NAME_MIGRATIONS[d.name] } : d)))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function updateDog(id: string, patch: Partial<DogCare>) {
    setDogs(dogs.map((d) => (d.id === id ? { ...d, ...patch } : d)))
  }

  return (
    <Card icon="🐾" title="Dogs">
      <div className="two-col">
        {dogs.map((dog) => (
          <div key={dog.id} className="mini-profile">
            <div className="name">{dog.name}</div>
            <ul className="c-list">
              <li className="c-list-item">
                <input type="checkbox" checked={dog.breakfast} onChange={(e) => updateDog(dog.id, { breakfast: e.target.checked })} />
                Breakfast
              </li>
              <li className="c-list-item">
                <input type="checkbox" checked={dog.dinner} onChange={(e) => updateDog(dog.id, { dinner: e.target.checked })} />
                Dinner
              </li>
              <li className="c-list-item">
                <input type="checkbox" checked={dog.tummyIssue} onChange={(e) => updateDog(dog.id, { tummyIssue: e.target.checked })} />
                Tummy trouble
              </li>
            </ul>
            <input
              type="text"
              className="c-textarea"
              style={{ minHeight: 'auto', marginTop: 6 }}
              placeholder="Any notes..."
              value={dog.notes}
              onChange={(e) => updateDog(dog.id, { notes: e.target.value })}
            />
          </div>
        ))}
      </div>
      {dogsHistory.length > 0 && (
        <button className="card-footer-btn" onClick={() => setShowHistory((v) => !v)}>
          {showHistory ? 'Hide past days' : 'View past days'}
        </button>
      )}
      {showHistory && (
        <ul className="c-list" style={{ marginTop: 8 }}>
          {dogsHistory.map((h, i) => (
            <li key={i} className="c-list-item" style={{ alignItems: 'flex-start' }}>
              <div>
                <span className="sub" style={{ marginLeft: 0 }}>
                  {h.date}
                </span>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  {h.care
                    .map((c) => `${c.name}: ${[c.breakfast && 'breakfast', c.dinner && 'dinner', c.tummyIssue && 'tummy trouble'].filter(Boolean).join(', ') || 'no care logged'}`)
                    .join(' · ')}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
