import { useLocalStorage } from '../hooks/useLocalStorage'
import { localDateKey } from '../lib/logicalDate'
import { cycleDayFor, phaseForDay, phasesFor } from '../lib/cycle'
import Card from '../components/Card'

const PHASE_BLURBS: Record<string, string> = {
  Menstrual: 'Rest is productive. Be gentle and let your energy be low today.',
  Follicular: "A fresh start — your energy is rising! Perfect time for new ideas & goals.",
  Ovulation: "You're likely feeling social and confident. Great time to connect with others.",
  Luteal: 'Energy may be winding down. Good time to wrap up projects and slow down.',
}

export default function CurrentPhase() {
  const [lastPeriodStart] = useLocalStorage('bodyweather.cycle.lastPeriodStart', localDateKey(new Date(Date.now() - 11 * 86400000)))
  const [length] = useLocalStorage('bodyweather.cycle.length', 28)
  const [periodLength] = useLocalStorage('bodyweather.cycle.periodLength', 5)

  const day = cycleDayFor(lastPeriodStart, length)
  const phases = phasesFor(length, periodLength)
  const phase = phaseForDay(day, phases)

  return (
    <Card icon="🌸" title="2. Current Phase" surface="lilac">
      <div className="phase-hero">
        <p className="phase-hero-name">{phase.name} Phase</p>
        <p className="phase-hero-day">
          Day {day} of {length}
        </p>
        <p className="phase-hero-blurb">{PHASE_BLURBS[phase.name]}</p>
      </div>
    </Card>
  )
}
