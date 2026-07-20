import { useEffect, useRef, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { logicalDateKey } from '../lib/logicalDate'
import Card from '../components/Card'

interface DogCare {
  id: string
  name: string
  hasLunch: boolean
  breakfast: boolean
  lunch: boolean
  dinner: boolean
  tummyIssue: boolean
  tummyIssueType: string
  notes: string
}

const TUMMY_ISSUE_TYPES = [
  'Loose stool',
  'Diarrhea',
  'Vomiting',
  'Gas',
  'Not eating / low appetite',
  'Constipation',
  'Excessive drooling',
  'Other (see notes)',
]

const DEFAULT_DOGS: DogCare[] = [
  { id: 'd1', name: 'Misa', hasLunch: true, breakfast: false, lunch: false, dinner: false, tummyIssue: false, tummyIssueType: '', notes: '' },
  { id: 'd2', name: 'Coco', hasLunch: false, breakfast: false, lunch: false, dinner: false, tummyIssue: false, tummyIssueType: '', notes: '' },
  { id: 'd3', name: 'Juno', hasLunch: false, breakfast: false, lunch: false, dinner: false, tummyIssue: false, tummyIssueType: '', notes: '' },
]

const NAME_MIGRATIONS: Record<string, string> = { Frenchie: 'Misa', Maltipoo: 'Coco' }

const PORTRAITS: Record<string, string> = {
  Misa: '/Dashboard-5/images/misa-portrait.png',
  Juno: '/Dashboard-5/images/juno-portrait.png',
}

interface DogsDayRecord {
  date: string
  care: { name: string; breakfast: boolean; lunch: boolean; dinner: boolean; tummyIssue: boolean; tummyIssueType: string }[]
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
        {
          date: dogsDay,
          care: dogs.map((d) => ({ name: d.name, breakfast: d.breakfast, lunch: d.lunch, dinner: d.dinner, tummyIssue: d.tummyIssue, tummyIssueType: d.tummyIssueType })),
        },
        ...prev,
      ])
      setDogs((prevDogs) => prevDogs.map((d) => ({ ...d, breakfast: false, lunch: false, dinner: false, tummyIssue: false, tummyIssueType: '' })))
      setDogsDay(today)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dogsDay])

  useEffect(() => {
    if (migratedRef.current) return
    migratedRef.current = true
    const needsFieldMigration = dogs.some((d) => NAME_MIGRATIONS[d.name] || d.hasLunch === undefined || d.lunch === undefined || d.tummyIssueType === undefined)
    const needsJuno = !dogs.some((d) => d.name === 'Juno')
    if (needsFieldMigration || needsJuno) {
      setDogs((prev) => {
        const migrated = prev.map((d) => ({
          ...d,
          name: NAME_MIGRATIONS[d.name] ?? d.name,
          hasLunch: d.hasLunch ?? d.name === 'Misa',
          lunch: d.lunch ?? false,
          tummyIssueType: d.tummyIssueType ?? '',
        }))
        if (needsJuno) {
          migrated.push({ id: crypto.randomUUID(), name: 'Juno', hasLunch: false, breakfast: false, lunch: false, dinner: false, tummyIssue: false, tummyIssueType: '', notes: '' })
        }
        return migrated
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function updateDog(id: string, patch: Partial<DogCare>) {
    setDogs(dogs.map((d) => (d.id === id ? { ...d, ...patch } : d)))
  }

  function removeDog(id: string) {
    setDogs(dogs.filter((d) => d.id !== id))
  }

  return (
    <Card icon="🐾" title="Dogs" variant="gingham">
      <div className="dog-portrait-row">
        {dogs.map((dog) => (
          <div key={dog.id} className="dog-portrait" title={dog.name}>
            {PORTRAITS[dog.name] ? <img src={PORTRAITS[dog.name]} alt={dog.name} /> : <span className="dog-portrait-placeholder">🐾</span>}
            <span className="dog-portrait-name">{dog.name}</span>
          </div>
        ))}
      </div>
      <div className="two-col">
        {dogs.map((dog) => (
          <div key={dog.id} className="mini-profile">
            <div className="name">
              {dog.name}
              {dogs.length > 1 && (
                <button className="remove" onClick={() => removeDog(dog.id)} aria-label={`Remove ${dog.name}`} style={{ float: 'right' }}>
                  ×
                </button>
              )}
            </div>
            <ul className="c-list">
              <li className="c-list-item">
                <input type="checkbox" checked={dog.breakfast} onChange={(e) => updateDog(dog.id, { breakfast: e.target.checked })} />
                Breakfast
              </li>
              {dog.hasLunch && (
                <li className="c-list-item">
                  <input type="checkbox" checked={dog.lunch} onChange={(e) => updateDog(dog.id, { lunch: e.target.checked })} />
                  Lunch
                </li>
              )}
              <li className="c-list-item">
                <input type="checkbox" checked={dog.dinner} onChange={(e) => updateDog(dog.id, { dinner: e.target.checked })} />
                Dinner
              </li>
              <li className="c-list-item">
                <input
                  type="checkbox"
                  checked={dog.tummyIssue}
                  onChange={(e) => updateDog(dog.id, { tummyIssue: e.target.checked, tummyIssueType: e.target.checked ? dog.tummyIssueType : '' })}
                />
                Tummy trouble
              </li>
            </ul>
            {dog.tummyIssue && (
              <select
                value={dog.tummyIssueType}
                onChange={(e) => updateDog(dog.id, { tummyIssueType: e.target.value })}
                style={{ width: '100%', marginTop: 4, marginBottom: 6 }}
              >
                <option value="">What kind?</option>
                {TUMMY_ISSUE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            )}
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
                    .map(
                      (c) =>
                        `${c.name}: ${
                          [c.breakfast && 'breakfast', c.lunch && 'lunch', c.dinner && 'dinner', c.tummyIssue && `tummy trouble${c.tummyIssueType ? ` (${c.tummyIssueType})` : ''}`]
                            .filter(Boolean)
                            .join(', ') || 'no care logged'
                        }`,
                    )
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
