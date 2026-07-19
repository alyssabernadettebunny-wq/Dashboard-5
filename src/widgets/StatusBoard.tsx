import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

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
  { id: 'g1', name: 'Winnie', status: 'Home' },
  { id: 'g2', name: 'Amy', status: 'Home' },
  { id: 'g3', name: 'Holly', status: 'Home' },
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
    <div>
      <h4>{title}</h4>
      {people.map((person) => (
        <div key={person.id} className="status-person">
          <input
            className="pname"
            value={person.name}
            onChange={(e) =>
              setPeople(people.map((p) => (p.id === person.id ? { ...p, name: e.target.value } : p)))
            }
          />
          <select
            value={person.status}
            onChange={(e) =>
              setPeople(people.map((p) => (p.id === person.id ? { ...p, status: e.target.value } : p)))
            }
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  )
}

export default function StatusBoard() {
  const [core, setCore] = useLocalStorage('dashboard.status.core', DEFAULT_CORE)
  const [extended, setExtended] = useLocalStorage('dashboard.status.extended', DEFAULT_EXTENDED)
  const [dogs, setDogs] = useLocalStorage('dashboard.status.dogs', DEFAULT_DOGS)

  return (
    <Card icon="📍" title="Today's Status Board" wide>
      <div className="status-cols">
        <PersonGroup title="Me & the Girls" people={core} setPeople={setCore} statuses={CORE_STATUSES} />
        <PersonGroup title="Household" people={extended} setPeople={setExtended} statuses={EXTENDED_STATUSES} />
        <PersonGroup title="Dogs" people={dogs} setPeople={setDogs} statuses={DOG_STATUSES} />
      </div>
    </Card>
  )
}
