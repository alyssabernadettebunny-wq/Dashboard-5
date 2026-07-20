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
import { useTodayVisibility } from '../widgets/DisplayPreferences'

export default function HomePage() {
  const [visibility] = useTodayVisibility()
  const show = (key: string) => visibility[key] !== false

  return (
    <div className="grid">
      {show('topPriorities') && <TopPriorities />}
      {show('statusBoard') && <StatusBoard />}
      {show('miniCalendar') && <MiniCalendar />}
      {show('moodCheckIn') && <MoodCheckIn />}
      {show('bodyCheckin') && <BodyCheckin />}
      {show('waterProtein') && <WaterProtein />}
      {show('medsTitration') && <MedsTitration />}
      {show('dogsCare') && <DogsCare />}
      {show('habitsToday') && <HabitsToday />}
      {show('familyKids') && <FamilyKids />}
      {show('quickCapture') && <QuickCapture />}
      {show('gratefulFor') && <GratefulFor />}
      {show('tarotPull') && <TarotPull />}
      {show('myTasks') && <ChecklistCard icon="⭐" title="My Tasks" storageKey="dashboard.tasks.me" placeholder="Add a task..." />}
      {show('girlsTodos') && (
        <ChecklistCard icon="🎀" title="Girls' To-Dos" storageKey="dashboard.tasks.girls" placeholder="Add something for the girls..." />
      )}
      {show('reminders') && <Reminders />}
      {show('waitingMode') && <WaitingMode />}
      {show('worldFeed') && <WorldFeed />}
    </div>
  )
}
