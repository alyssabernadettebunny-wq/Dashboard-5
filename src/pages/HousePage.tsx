import ChoreRhythm from '../widgets/ChoreRhythm'
import ResetTimer from '../widgets/ResetTimer'
import ChecklistCard from '../widgets/ChecklistCard'

export default function HousePage() {
  return (
    <>
      <h2 className="page-title">House</h2>
      <div className="grid">
        <ChoreRhythm />
        <ResetTimer />
        <ChecklistCard icon="🍳" title="Kitchen" storageKey="house.room.kitchen" placeholder="Add a kitchen task..." />
        <ChecklistCard icon="🛁" title="Bathroom" storageKey="house.room.bathroom" placeholder="Add a bathroom task..." />
        <ChecklistCard icon="🛋️" title="Living Room" storageKey="house.room.living" placeholder="Add a living room task..." />
        <ChecklistCard icon="🛏️" title="Bedrooms" storageKey="house.room.bedrooms" placeholder="Add a bedroom task..." />
        <ChecklistCard icon="🧺" title="Laundry" storageKey="house.room.laundry" placeholder="Add a laundry task..." />
        <ChecklistCard icon="🛒" title="Supplies to Buy" storageKey="house.supplies" placeholder="Add a supply..." />
      </div>
    </>
  )
}
