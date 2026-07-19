import TodaysRhythm from '../widgets/TodaysRhythm'
import WeeklyRhythm from '../widgets/WeeklyRhythm'
import ChecklistCard from '../widgets/ChecklistCard'

export default function RhythmPage() {
  return (
    <>
      <h2 className="page-title">Rhythm</h2>
      <div className="grid">
        <TodaysRhythm />
        <WeeklyRhythm />
        <ChecklistCard icon="🌅" title="Morning Ritual" storageKey="rhythm.morningritual" placeholder="Add a morning step..." />
        <ChecklistCard icon="🌙" title="Evening Ritual" storageKey="rhythm.eveningritual" placeholder="Add a wind-down step..." />
      </div>
    </>
  )
}
