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
import type { ReactNode } from 'react'

function Span({ n, children }: { n: number; children: ReactNode }) {
  return <div className={`span-${n}`}>{children}</div>
}

export default function HomePage() {
  const [visibility] = useTodayVisibility()
  const show = (key: string) => visibility[key] !== false

  return (
    <div className="grid">
      {show('topPriorities') && (
        <Span n={5}>
          <TopPriorities />
        </Span>
      )}
      {show('statusBoard') && (
        <Span n={7}>
          <HouseholdStatusBoard />
        </Span>
      )}
      {show('miniCalendar') && (
        <Span n={4}>
          <MiniCalendar />
        </Span>
      )}
      {show('moodCheckIn') && (
        <Span n={4}>
          <MoodCheckIn />
        </Span>
      )}
      {show('bodyCheckin') && (
        <Span n={4}>
          <BodyCheckin />
        </Span>
      )}
      {show('waterProtein') && (
        <Span n={4}>
          <WaterProtein />
        </Span>
      )}
      {show('medsTitration') && (
        <Span n={5}>
          <MedsTitration />
        </Span>
      )}
      {show('dogsCare') && (
        <Span n={3}>
          <DogsCare />
        </Span>
      )}
      {show('dogFacts') && (
        <Span n={6}>
          <DogFacts />
        </Span>
      )}
      {show('habitsToday') && (
        <Span n={3}>
          <HabitsToday />
        </Span>
      )}
      {show('familyKids') && (
        <Span n={3}>
          <FamilyKids />
        </Span>
      )}
      {show('quickCapture') && (
        <Span n={4}>
          <QuickCapture />
        </Span>
      )}
      {show('gratefulFor') && (
        <Span n={4}>
          <GratefulFor />
        </Span>
      )}
      {show('tarotPull') && (
        <Span n={4}>
          <TarotPull />
        </Span>
      )}
      {show('myTasks') && (
        <Span n={4}>
          <ChecklistCard icon="⭐" title="My Tasks" storageKey="dashboard.tasks.me" placeholder="Add a task..." />
        </Span>
      )}
      {show('girlsTodos') && (
        <Span n={4}>
          <ChecklistCard icon="🎀" title="Girls' To-Dos" storageKey="dashboard.tasks.girls" placeholder="Add something for the girls..." />
        </Span>
      )}
      {show('reminders') && (
        <Span n={4}>
          <Reminders />
        </Span>
      )}
      {show('waitingMode') && (
        <Span n={6}>
          <WaitingMode />
        </Span>
      )}
      {show('worldFeed') && (
        <Span n={12}>
          <WorldFeed />
        </Span>
      )}
    </div>
  )
}
