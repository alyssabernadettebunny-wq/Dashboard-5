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
          defaultItems={['Dishes', 'Wipe counters', 'Empty trash', 'Fridge check', 'Meal prep']}
          infoLabel="Meal plan"
          infoIcon="🍓"
          infoStorageKey="house.info.kitchen"
          infoPlaceholder="Chicken bowl, salad, fruit"
        />
        <RoomCard
          number={3}
          icon="🧺"
          title="Laundry"
          storageKey="house.room.laundry"
          placeholder="Add a laundry task..."
          defaultItems={['1 Load wash', 'Dry / fluff', 'Fold', 'Put away', 'Bedding refresh']}
          supply={{ label: 'Detergent', storageKey: 'house.supply.detergent', max: 100, unit: '%', defaultValue: 80 }}
        />
        <RoomCard
          number={4}
          icon="🛋️"
          title="Living Room"
          location="Downstairs"
          storageKey="house.room.living"
          placeholder="Add a living room task..."
          defaultItems={['Tidy surfaces', 'Fluff pillows', 'Vacuum rugs', 'Declutter', 'Reset coffee table']}
        />
        <RoomCard
          number={5}
          icon="🛏️"
          title="Bedroom"
          location="Upstairs"
          storageKey="house.room.bedrooms"
          placeholder="Add a bedroom task..."
          defaultItems={['Make bed', 'Clear nightstand', 'Dust surfaces', 'Vacuum', 'Close blinds', 'Reset desk']}
        />
        <RoomCard
          number={6}
          icon="🛁"
          title="Bathroom"
          storageKey="house.room.bathroom"
          placeholder="Add a bathroom task..."
          defaultItems={['Wipe sink', 'Toilet clean', 'Restock', 'Towels fresh', 'Empty bin']}
          supply={{ label: 'Toilet paper', storageKey: 'house.supply.toiletpaper', max: 10, unit: ' rolls', defaultValue: 6 }}
        />
        <ChecklistCard icon="🛒" title="Supplies to Buy" storageKey="house.supplies" placeholder="Add a supply..." />
      </div>
    </>
  )
}
