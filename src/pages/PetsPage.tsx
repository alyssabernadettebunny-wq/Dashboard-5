import PetOverview from '../widgets/PetOverview'
import TrainingGoals from '../widgets/TrainingGoals'
import PetSupplies from '../widgets/PetSupplies'
import PottyTracker from '../widgets/PottyTracker'
import BehaviorNotes from '../widgets/BehaviorNotes'
import PhotoMemories from '../widgets/PhotoMemories'
import SubTabs from '../components/SubTabs'

export default function PetsPage() {
  return (
    <>
      <img className="page-title-img" src="/Dashboard-5/images/tab-titles/pets.png" alt="Pets" />
      <SubTabs
        storageKey="pets.subtab"
        tabs={[
          {
            key: 'overview',
            label: 'Overview',
            icon: '🐾',
            content: (
              <div className="grid">
                <PetOverview />
              </div>
            ),
          },
          {
            key: 'training',
            label: 'Training & Behavior',
            icon: '🎯',
            content: (
              <div className="grid">
                <TrainingGoals />
                <BehaviorNotes />
              </div>
            ),
          },
          {
            key: 'supplies',
            label: 'Supplies & Potty',
            icon: '🧺',
            content: (
              <div className="grid">
                <PetSupplies />
                <PottyTracker />
              </div>
            ),
          },
          {
            key: 'memories',
            label: 'Memories',
            icon: '📸',
            content: (
              <div className="grid">
                <PhotoMemories />
              </div>
            ),
          },
        ]}
      />
    </>
  )
}
