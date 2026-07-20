import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface Pet {
  name: string
  nickname: string
  breed: string
  birthdate: string
  weight: string
  personality: string
}

const DEFAULT_MISA: Pet = {
  name: 'Misa',
  nickname: '',
  breed: 'French Bulldog',
  birthdate: '2026-01-10',
  weight: '21 lbs',
  personality: 'Bratty, funny, observant, crybaby',
}

const DEFAULT_COCO: Pet = {
  name: 'Coco',
  nickname: '',
  breed: 'Maltipoo',
  birthdate: '2023-01-06',
  weight: '15 lbs',
  personality: 'Calm, anxious, cautious, well-behaved, a bit lazy',
}

function ageFromBirthdate(birthdate: string) {
  const birth = new Date(birthdate + 'T00:00:00')
  const now = new Date()
  if (birth > now) return 'not born yet'
  let years = now.getFullYear() - birth.getFullYear()
  let months = now.getMonth() - birth.getMonth()
  if (now.getDate() < birth.getDate()) months -= 1
  if (months < 0) {
    years -= 1
    months += 12
  }
  const parts = []
  if (years > 0) parts.push(`${years} yr${years !== 1 ? 's' : ''}`)
  parts.push(`${months} mo`)
  return parts.join(' ')
}

function PetProfile({ pet, setPet, image }: { pet: Pet; setPet: (p: Pet) => void; image?: string }) {
  return (
    <div className="pet-profile">
      {image ? <img className="pet-portrait" src={image} alt={pet.name} /> : <div className="card-illustration">illustration</div>}
      <input className="pet-name-input" value={pet.name} onChange={(e) => setPet({ ...pet, name: e.target.value })} /> ♡
      <input
        className="pet-nickname-input"
        value={pet.nickname}
        placeholder="add a nickname..."
        onChange={(e) => setPet({ ...pet, nickname: e.target.value })}
      />
      <div className="pet-facts">
        <div>
          <b>Breed:</b> {pet.breed}
        </div>
        <div>
          <b>Age:</b> {ageFromBirthdate(pet.birthdate)}
        </div>
        <div>
          <b>Weight:</b> {pet.weight}
        </div>
        <div>
          <b>Personality:</b> {pet.personality}
        </div>
      </div>
    </div>
  )
}

export default function PetOverview() {
  const [misa, setMisa] = useLocalStorage<Pet>('pets.misa.overview', DEFAULT_MISA)
  const [coco, setCoco] = useLocalStorage<Pet>('pets.coco.overview', DEFAULT_COCO)
  const [vaccines, setVaccines] = useLocalStorage('pets.vaccinesUpToDate', true)

  return (
    <Card icon="🐾" title="Pet Overview" wide>
      <div className="pet-cols">
        <PetProfile pet={misa} setPet={setMisa} image="/Dashboard-5/images/misa-portrait.png" />
        <PetProfile pet={coco} setPet={setCoco} image="/Dashboard-5/images/coco-portrait.png" />
      </div>
      <label className="card-aphorism" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer' }}>
        <input type="checkbox" checked={vaccines} onChange={(e) => setVaccines(e.target.checked)} />
        Both pets are up to date on vaccines!
      </label>
    </Card>
  )
}
