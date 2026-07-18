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

export default function HomePage() {
  return (
    <div className="grid">
      <StatusBoard />
      <BodyCheckin />
      <WaterProtein />
      <MedsTitration />
      <DogsCare />
      <QuickCapture />
      <ChecklistCard icon="⭐" title="My Tasks" storageKey="dashboard.tasks.me" placeholder="Add a task..." />
      <ChecklistCard icon="🎀" title="Girls' To-Dos" storageKey="dashboard.tasks.girls" placeholder="Add something for the girls..." />
      <Reminders />
      <WaitingMode />
      <WorldFeed />
    </div>
  )
}
