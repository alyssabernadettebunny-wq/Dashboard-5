import { useCompanion } from '../hooks/useCompanion'
import Card from '../components/Card'

const MOOD_LABEL: Record<string, string> = {
  mirroring: 'feeling what you feel',
  proud: 'so proud of you',
  happy: 'happy to see you',
  calm: 'calm & content',
  content: 'cozy',
  playful: 'in a playful mood',
  sleepy: 'sleepy',
  excited: 'excited!',
}

export default function CompanionCard() {
  const { pet, mood, message } = useCompanion()

  return (
    <Card icon={pet.emoji} title={`${pet.name} says...`} meta={MOOD_LABEL[mood] ?? mood}>
      <div className="companion-row">
        <div className="companion-avatar">{pet.emoji}</div>
        <div className="companion-bubble">{message}</div>
      </div>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
        {pet.name} is {pet.personality}.
      </p>
    </Card>
  )
}
