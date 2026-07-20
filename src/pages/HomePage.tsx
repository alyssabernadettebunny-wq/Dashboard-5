import HouseholdStatusBoard from '../widgets/HouseholdStatusBoard'
import BodyCheckin from '../widgets/BodyCheckin'
import WaterProtein from '../widgets/WaterProtein'
import MedsTitration from '../widgets/MedsTitration'
import DogsCare from '../widgets/DogsCare'
import QuickCapture from '../widgets/QuickCapture'
import ChecklistCard from '../widgets/ChecklistCard'
import Reminders from '../widgets/Reminders'
import WorldFeed from '../widgets/WorldFeed'
import WaitingMode from '../widgets/WaitingMode'
import MiniCalendar from '../widgets/MiniCalendar'
import MoodCheckIn from '../widgets/MoodCheckIn'
import FamilyKids from '../widgets/FamilyKids'
import GratefulFor from '../widgets/GratefulFor'
import TarotPull from '../widgets/TarotPull'
import TopPriorities from '../widgets/TopPriorities'
import HabitsToday from '../widgets/HabitsToday'
import DogFacts from '../widgets/DogFacts'
import { useTodayVisibility } from '../widgets/DisplayPreferences'

export default function HomePage() {
  const [visibility] = useTodayVisibility()
  const show = (key: string) => visibility[key] !== false

  return (
    <>
      {/* independent masonry columns: each column stacks tightly on its own content
          height, instead of a CSS-grid row that stretches to match its tallest
          sibling. keeps the two widgets most likely to grow tall with real data
          (Household Status Board, Meds & Titration) in separate columns. */}
      <div className="home-grid">
        <div className="home-grid-col">
          {show('topPriorities') && <TopPriorities />}
          {show('moodCheckIn') && <MoodCheckIn />}
          {show('medsTitration') && <MedsTitration />}
          {show('familyKids') && <FamilyKids />}
          {show('tarotPull') && <TarotPull />}
          {show('reminders') && <Reminders />}
        </div>
        <div className="home-grid-col">
          {show('statusBoard') && <HouseholdStatusBoard />}
          {show('bodyCheckin') && <BodyCheckin />}
          {show('dogsCare') && <DogsCare />}
          {show('quickCapture') && <QuickCapture />}
          {show('myTasks') && <ChecklistCard icon="⭐" title="My Tasks" storageKey="dashboard.tasks.me" placeholder="Add a task..." />}
          {show('waitingMode') && <WaitingMode />}
        </div>
        <div className="home-grid-col">
          {show('miniCalendar') && <MiniCalendar />}
          {show('waterProtein') && <WaterProtein />}
          {show('dogFacts') && <DogFacts />}
          {show('habitsToday') && <HabitsToday />}
          {show('gratefulFor') && <GratefulFor />}
        </div>
      </div>
      {show('worldFeed') && <WorldFeed />}
    </>
  )
}
