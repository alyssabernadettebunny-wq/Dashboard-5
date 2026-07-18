import ChoreRhythm from '../widgets/ChoreRhythm'
import ResetTimer from '../widgets/ResetTimer'
import TodayHomeReset from '../widgets/TodayHomeReset'
import RoomCard from '../widgets/RoomCard'
import KitchenCard from '../widgets/KitchenCard'
import LaundryCard from '../widgets/LaundryCard'
import ShoppingList from '../widgets/ShoppingList'

export default function HousePage() {
  return (
    <>
      <h2 className="page-title">Home</h2>
      <div className="grid">
        <TodayHomeReset />
        <ChoreRhythm />
        <ResetTimer />
        <KitchenCard />
        <LaundryCard />
        <RoomCard
          number={4}
          icon="🛋️"
          title="Living Room"
          storageKey="house.room.living"
          placeholder="Add a living room task..."
          defaultItems={['Tidy surfaces', 'Fluff pillows', 'Vacuum rugs', 'Declutter', 'Reset coffee table']}
        />
        <RoomCard
          number={5}
          icon="🛏️"
          title="Bedroom"
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
        <ShoppingList />
      </div>
    </>
  )
}
