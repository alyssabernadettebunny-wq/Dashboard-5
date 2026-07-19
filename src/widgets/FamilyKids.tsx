import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface FamilyMember {
  id: string
  name: string
  activity: string
  action: 'call' | 'star' | 'event'
}

const ACTION_ICONS: Record<FamilyMember['action'], string> = {
  call: '📞',
  star: '⭐',
  event: '📅',
}

const ACTION_ORDER: FamilyMember['action'][] = ['call', 'star', 'event']

const DEFAULT_MEMBERS: FamilyMember[] = [
  { id: '1', name: 'Winnie', activity: "Today's activity...", action: 'star' },
  { id: '2', name: 'Amy', activity: "Today's activity...", action: 'star' },
  { id: '3', name: 'Holly', activity: "Today's activity...", action: 'star' },
  { id: '4', name: 'Mom', activity: 'Call tonight', action: 'call' },
]

export default function FamilyKids() {
  const [members, setMembers] = useLocalStorage<FamilyMember[]>('dashboard.familykids', DEFAULT_MEMBERS)

  function update(id: string, patch: Partial<FamilyMember>) {
    setMembers(members.map((m) => (m.id === id ? { ...m, ...patch } : m)))
  }

  function cycleAction(id: string) {
    const member = members.find((m) => m.id === id)
    if (!member) return
    const next = ACTION_ORDER[(ACTION_ORDER.indexOf(member.action) + 1) % ACTION_ORDER.length]
    update(id, { action: next })
  }

  function addMember() {
    const name = window.prompt('Name?')
    if (!name) return
    setMembers([...members, { id: crypto.randomUUID(), name, activity: '', action: 'star' }])
  }

  return (
    <Card icon="👨‍👩‍👧‍👦" title="Family & Kids">
      {members.map((m) => (
        <div key={m.id} className="family-row">
          <div className="family-avatar">🙂</div>
          <div className="family-info">
            <input className="family-name" value={m.name} onChange={(e) => update(m.id, { name: e.target.value })} />
            <input className="family-activity" value={m.activity} onChange={(e) => update(m.id, { activity: e.target.value })} placeholder="Today's activity..." />
          </div>
          <button className="family-action" onClick={() => cycleAction(m.id)} title="Cycle action icon">
            {ACTION_ICONS[m.action]}
          </button>
        </div>
      ))}
      <button className="card-footer-btn" onClick={addMember}>
        + Add reminder ♡
      </button>
    </Card>
  )
}
