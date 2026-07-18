import ChoreRhythm from '../widgets/ChoreRhythm'
import ResetTimer from '../widgets/ResetTimer'
import ChecklistCard from '../widgets/ChecklistCard'
import TodayHomeReset from '../widgets/TodayHomeReset'
import RoomCard from '../widgets/RoomCard'

export default function HousePage() {
  return (
    <>
      <h2 className="page-title">Home</h2>
      <div className="grid">
        <TodayHomeReset />
        <ChoreRhythm />
        <ResetTimer />
        <RoomCard
          number={2}
          icon="🍳"
          title="Kitchen"
          storageKey="house.room.kitchen"
          placeholder="Add a kitchen task..."
          infoLabel="Meal plan"
          infoIcon="🍓"
          infoStorageKey="house.info.kitchen"
          infoPlaceholder="Chicken bowl, salad, fruit"
        />
        <RoomCard
          number={3}
          icon="🛁"
          title="Bathroom"
          storageKey="house.room.bathroom"
          placeholder="Add a bathroom task..."
          infoLabel="Restock"
          infoIcon="🧻"
          infoStorageKey="house.info.bathroom"
          infoPlaceholder="Toilet paper, soap"
        />
        <RoomCard
          number={4}
          icon="🛋️"
          title="Living Room"
          storageKey="house.room.living"
          placeholder="Add a living room task..."
          infoLabel="Tidy note"
          infoIcon="🕯️"
          infoStorageKey="house.info.living"
          infoPlaceholder="Fluff cushions, light a candle"
        />
        <RoomCard
          number={5}
          icon="🛏️"
          title="Bedrooms"
          storageKey="house.room.bedrooms"
          placeholder="Add a bedroom task..."
          infoLabel="Linens"
          infoIcon="🛏️"
          infoStorageKey="house.info.bedrooms"
          infoPlaceholder="Change sheets Sunday"
        />
        <RoomCard
          number={6}
          icon="🧺"
          title="Laundry"
          storageKey="house.room.laundry"
          placeholder="Add a laundry task..."
          infoLabel="Loads today"
          infoIcon="🧺"
          infoStorageKey="house.info.laundry"
          infoPlaceholder="Darks + towels"
        />
        <ChecklistCard icon="🛒" title="Supplies to Buy" storageKey="house.supplies" placeholder="Add a supply..." />
      </div>
    </>
  )
}
