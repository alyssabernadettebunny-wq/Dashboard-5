import PetOverview from '../widgets/PetOverview'
import TrainingGoals from '../widgets/TrainingGoals'
import PetSupplies from '../widgets/PetSupplies'
import PottyTracker from '../widgets/PottyTracker'
import BehaviorNotes from '../widgets/BehaviorNotes'
import PhotoMemories from '../widgets/PhotoMemories'

export default function PetsPage() {
  return (
    <>
      <h2 className="page-title">Pets</h2>
      <div className="grid">
        <PetOverview />
        <TrainingGoals />
        <PetSupplies />
        <PottyTracker />
        <BehaviorNotes />
        <PhotoMemories />
      </div>
    </>
  )
}
