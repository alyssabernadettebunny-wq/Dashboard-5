import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
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
  { id: 'd1', name: 'Frenchie', breakfast: false, dinner: false, tummyIssue: false, notes: '' },
  { id: 'd2', name: 'Maltipoo', breakfast: false, dinner: false, tummyIssue: false, notes: '' },
]

const FACTS = [
  "French Bulldogs can't swim well due to their heavy heads and short snouts — always supervise water time.",
  'Frenchies are prone to overheating because of their short snouts (brachycephalic) — keep them cool in summer.',
  'French Bulldog "bat ears" are a breed hallmark and help with their expressive communication.',
  'Maltipoos are a Maltese x Poodle mix, bred to be small, affectionate companion dogs.',
  "Maltipoos often inherit the Poodle's low-shedding coat, making them popular with allergy-sensitive owners.",
  'Both Frenchies and Maltipoos are prone to separation anxiety and do best with lots of companionship.',
  "French Bulldogs are one of the only breeds that can't naturally give birth without assistance most of the time.",
  'Maltipoos are highly food-motivated, which makes training easier but overfeeding easy too.',
  'French Bulldogs snore, snort, and grunt more than most breeds because of their short airways — it’s normal, but worth mentioning to the vet if it gets worse.',
  'Puppies like Misa need extra nap time — up to 18-20 hours a day is normal for young pups.',
  'Maltipoos are quick learners and tend to pick up on their owner’s emotional state easily.',
  'A Frenchie’s "bratty" streak often comes from being smart and stubborn — mental enrichment helps burn that energy.',
  'Both breeds do best with consistent, gentle routines rather than big schedule changes.',
]

export default function DogsCare() {
  const [dogs, setDogs] = useLocalStorage<DogCare[]>('dashboard.dogscare', DEFAULT_DOGS)
  const [factIndex, setFactIndex] = useState(() => Math.floor(Math.random() * FACTS.length))

  function updateDog(id: string, patch: Partial<DogCare>) {
    setDogs(dogs.map((d) => (d.id === id ? { ...d, ...patch } : d)))
  }

  function newFact() {
    setFactIndex((prev) => {
      let next = Math.floor(Math.random() * FACTS.length)
      while (next === prev && FACTS.length > 1) next = Math.floor(Math.random() * FACTS.length)
      return next
    })
  }

  return (
    <Card
      icon="🐾"
      title="Dogs"
      footer={
        <div className="subsection" style={{ marginTop: 4 }}>
          <p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>🐚 {FACTS[factIndex]}</p>
          <button className="card-footer-btn" onClick={newFact}>
            New fact
          </button>
        </div>
      }
    >
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
    </Card>
  )
}
