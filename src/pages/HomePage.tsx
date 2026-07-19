import StatusBoard from '../widgets/StatusBoard'
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

export default function HomePage() {
  return (
    <div className="grid">
      <TopPriorities />
      <StatusBoard />
      <MiniCalendar />
      <MoodCheckIn />
      <BodyCheckin />
      <WaterProtein />
      <MedsTitration />
      <DogsCare />
      <HabitsToday />
      <FamilyKids />
      <QuickCapture />
      <GratefulFor />
      <TarotPull />
      <ChecklistCard icon="⭐" title="My Tasks" storageKey="dashboard.tasks.me" placeholder="Add a task..." />
      <ChecklistCard icon="🎀" title="Girls' To-Dos" storageKey="dashboard.tasks.girls" placeholder="Add something for the girls..." />
      <Reminders />
      <WaitingMode />
      <WorldFeed />
    </div>
  )
}
