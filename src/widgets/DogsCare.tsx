import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import './widgets.css'

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
  'French Bulldogs can\'t swim well due to their heavy heads and short snouts — always supervise water time.',
  'Frenchies are prone to overheating because of their short snouts (brachycephalic) — keep them cool in summer.',
  'French Bulldog "bat ears" are a breed hallmark and help with their expressive communication.',
  'Maltipoos are a Maltese x Poodle mix, bred to be small, affectionate companion dogs.',
  'Maltipoos often inherit the Poodle\'s low-shedding coat, making them popular with allergy-sensitive owners.',
  'Both Frenchies and Maltipoos are prone to separation anxiety and do best with lots of companionship.',
  'French Bulldogs are one of the only breeds that can\'t naturally give birth without assistance most of the time.',
  'Maltipoos are highly food-motivated, which makes training easier but overfeeding easy too.',
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
      while (next === prev && FACTS.length > 1) {
        next = Math.floor(Math.random() * FACTS.length)
      }
      return next
    })
  }

  return (
    <section className="widget">
      <h2>Dogs</h2>
      {dogs.map((dog) => (
        <div key={dog.id} className="subcard">
          <h3>{dog.name}</h3>
          <div className="dog-checks">
            <label>
              <input
                type="checkbox"
                checked={dog.breakfast}
                onChange={(e) => updateDog(dog.id, { breakfast: e.target.checked })}
              />
              Breakfast
            </label>
            <label>
              <input
                type="checkbox"
                checked={dog.dinner}
                onChange={(e) => updateDog(dog.id, { dinner: e.target.checked })}
              />
              Dinner
            </label>
            <label className="tummy-flag">
              <input
                type="checkbox"
                checked={dog.tummyIssue}
                onChange={(e) => updateDog(dog.id, { tummyIssue: e.target.checked })}
              />
              Tummy trouble / threw up
            </label>
          </div>
          <input
            type="text"
            className="dog-notes"
            placeholder="Any notes..."
            value={dog.notes}
            onChange={(e) => updateDog(dog.id, { notes: e.target.value })}
          />
        </div>
      ))}
      <div className="fun-fact">
        <p>🐾 {FACTS[factIndex]}</p>
        <button onClick={newFact}>New fact</button>
      </div>
    </section>
  )
}
