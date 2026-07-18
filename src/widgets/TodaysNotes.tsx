import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

export default function TodaysNotes() {
  const [notes, setNotes] = useLocalStorage(
    'bodyweather.todaysnotes',
    'Felt extra tired this morning and had a mild headache.\n\nTook things slow, drank tea, and rested.\n\nLooking forward to a cozy evening.',
  )

  return (
    <Card icon="🎀" title="9. Today's Notes">
      <div className="notes-paper">
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="How was today?" />
      </div>
    </Card>
  )
}
