import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface PottyState {
  lastOutside: string
  streak: number
}

function PottyCard({
  icon,
  name,
  state,
  setState,
}: {
  icon: string
  name: string
  state: PottyState
  setState: (s: PottyState) => void
}) {
  function markOutsideNow() {
    const now = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    setState({ ...state, lastOutside: now })
  }

  return (
    <div className="potty-card">
      <div>
        {icon} {name}
      </div>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '4px 0' }}>Last outside:</p>
      <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--purple-heading)', margin: 0 }}>{state.lastOutside} ☀️</p>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '8px 0 0' }}>Potty success streak</p>
      <p className="potty-streak">✨ {state.streak} 💧</p>
      <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0 }}>days!</p>
      <button className="card-footer-btn" style={{ marginTop: 8 }} onClick={markOutsideNow}>
        Mark outside now
      </button>
    </div>
  )
}

export default function PottyTracker() {
  const [misa, setMisa] = useLocalStorage<PottyState>('pets.misa.potty', { lastOutside: '9:55 AM', streak: 22 })
  const [coco, setCoco] = useLocalStorage<PottyState>('pets.coco.potty', { lastOutside: '10:05 AM', streak: 68 })

  return (
    <Card icon="💩" title="Last Outside / Potty Tracker">
      <div className="potty-cols">
        <PottyCard icon="🐾" name="Misa" state={misa} setState={setMisa} />
        <PottyCard icon="🐾" name="Coco" state={coco} setState={setCoco} />
      </div>
      <p className="card-aphorism">Keep it up, good girls! 💗</p>
    </Card>
  )
}
