import { useLocalStorage } from '../hooks/useLocalStorage'
import './widgets.css'

interface Person {
  id: string
  name: string
  status: string
}

const CORE_STATUSES = ['Home', 'Room', 'Asleep', 'School', 'Out']
const EXTENDED_STATUSES = ['Home', 'Out', 'Asleep']
const DOG_STATUSES = ['Home', 'Out', 'Asleep']

const DEFAULT_CORE: Person[] = [
  { id: 'me', name: 'Me', status: 'Home' },
  { id: 'g1', name: 'Daughter 1', status: 'Home' },
  { id: 'g2', name: 'Daughter 2', status: 'Home' },
  { id: 'g3', name: 'Daughter 3', status: 'Home' },
]

const DEFAULT_EXTENDED: Person[] = [
  { id: 'mom', name: 'Mom', status: 'Home' },
  { id: 'dad', name: 'Dad', status: 'Home' },
  { id: 'b1', name: 'Brother 1', status: 'Home' },
  { id: 'b2', name: 'Brother 2', status: 'Home' },
]

const DEFAULT_DOGS: Person[] = [
  { id: 'd1', name: 'Frenchie', status: 'Home' },
  { id: 'd2', name: 'Maltipoo', status: 'Home' },
]

function PersonRow({
  person,
  statuses,
  onChange,
  onRename,
}: {
  person: Person
  statuses: string[]
  onChange: (status: string) => void
  onRename: (name: string) => void
}) {
  return (
    <div className="person-row">
      <input
        className="person-name"
        value={person.name}
        onChange={(e) => onRename(e.target.value)}
      />
      <select value={person.status} onChange={(e) => onChange(e.target.value)}>
        {statuses.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
    </div>
  )
}

function PersonGroup({
  title,
  people,
  setPeople,
  statuses,
}: {
  title: string
  people: Person[]
  setPeople: (people: Person[]) => void
  statuses: string[]
}) {
  return (
    <div className="status-group">
      <h3>{title}</h3>
      {people.map((person) => (
        <PersonRow
          key={person.id}
          person={person}
          statuses={statuses}
          onChange={(status) =>
            setPeople(people.map((p) => (p.id === person.id ? { ...p, status } : p)))
          }
          onRename={(name) =>
            setPeople(people.map((p) => (p.id === person.id ? { ...p, name } : p)))
          }
        />
      ))}
    </div>
  )
}

export default function StatusBoard() {
  const [core, setCore] = useLocalStorage('dashboard.status.core', DEFAULT_CORE)
  const [extended, setExtended] = useLocalStorage('dashboard.status.extended', DEFAULT_EXTENDED)
  const [dogs, setDogs] = useLocalStorage('dashboard.status.dogs', DEFAULT_DOGS)

  return (
    <section className="widget widget-wide">
      <h2>Today's Status Board</h2>
      <div className="status-columns">
        <PersonGroup title="Me & the Girls" people={core} setPeople={setCore} statuses={CORE_STATUSES} />
        <PersonGroup title="Household" people={extended} setPeople={setExtended} statuses={EXTENDED_STATUSES} />
        <PersonGroup title="Dogs" people={dogs} setPeople={setDogs} statuses={DOG_STATUSES} />
      </div>
    </section>
  )
}
