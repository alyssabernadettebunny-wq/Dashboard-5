import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

export const TODAY_WIDGETS: { key: string; label: string }[] = [
  { key: 'topPriorities', label: 'Today at a Glance' },
  { key: 'statusBoard', label: 'Household Status Board' },
  { key: 'miniCalendar', label: 'This Month' },
  { key: 'moodCheckIn', label: 'Mood Check-In' },
  { key: 'bodyCheckin', label: 'Body Check-In' },
  { key: 'waterProtein', label: 'Water & Protein' },
  { key: 'medsTitration', label: 'Meds & Titration' },
  { key: 'dogsCare', label: 'Dogs' },
  { key: 'dogFacts', label: 'Breed Facts' },
  { key: 'habitsToday', label: 'Habits Today' },
  { key: 'familyKids', label: 'Family & Kids' },
  { key: 'quickCapture', label: 'Quick Capture' },
  { key: 'gratefulFor', label: "Today I'm Grateful For" },
  { key: 'tarotPull', label: 'Tarot Pull / Intuition' },
  { key: 'myTasks', label: 'My Tasks' },
  { key: 'girlsTodos', label: "Girls' To-Dos" },
  { key: 'reminders', label: 'Reminders' },
  { key: 'waitingMode', label: 'Waiting Mode (Parking Lot)' },
  { key: 'worldFeed', label: 'World Feed' },
]

export type Visibility = Record<string, boolean>

export function useTodayVisibility() {
  return useLocalStorage<Visibility>('settings.today.widgets', {})
}

export default function DisplayPreferences() {
  const [visibility, setVisibility] = useTodayVisibility()

  function toggle(key: string) {
    setVisibility({ ...visibility, [key]: visibility[key] === false ? true : false })
  }

  return (
    <Card icon="🖼️" title="Display Preferences" meta="Choose what shows on your Today page">
      <ul className="c-list">
        {TODAY_WIDGETS.map((w) => (
          <li key={w.key} className="c-list-item">
            <input type="checkbox" checked={visibility[w.key] !== false} onChange={() => toggle(w.key)} />
            <span>{w.label}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
