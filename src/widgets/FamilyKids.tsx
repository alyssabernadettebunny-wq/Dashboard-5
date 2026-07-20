import { useEffect, useRef, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { logicalDateKey } from '../lib/logicalDate'
import Card from '../components/Card'

interface FamilyMember {
  id: string
  name: string
  emoji: string
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
  { id: '1', name: 'Winnie', emoji: '🐰', activity: "Today's activity...", action: 'star' },
  { id: '2', name: 'Amy', emoji: '🌺', activity: "Today's activity...", action: 'star' },
  { id: '3', name: 'Holly', emoji: '🌼', activity: "Today's activity...", action: 'star' },
]

const EMOJI_MIGRATIONS: Record<string, string> = { Winnie: '🐰', Amy: '🌺', Holly: '🌼' }

interface FamilyDayRecord {
  date: string
  activities: { name: string; activity: string }[]
}

export default function FamilyKids() {
  const [members, setMembers] = useLocalStorage<FamilyMember[]>('dashboard.familykids', DEFAULT_MEMBERS)
  const [familyDay, setFamilyDay] = useLocalStorage('dashboard.familykids.day', logicalDateKey())
  const [familyHistory, setFamilyHistory] = useLocalStorage<FamilyDayRecord[]>('dashboard.familykids.history', [])
  const archivedRef = useRef(false)
  const migratedRef = useRef(false)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    if (migratedRef.current) return
    migratedRef.current = true
    const needsMigration = members.some((m) => m.name === 'Mom' || !m.emoji)
    if (needsMigration) {
      setMembers((prev) =>
        prev.filter((m) => m.name !== 'Mom').map((m) => ({ ...m, emoji: EMOJI_MIGRATIONS[m.name] ?? m.emoji ?? '🙂' }))
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const today = logicalDateKey()
    if (familyDay !== today && !archivedRef.current) {
      archivedRef.current = true
      setFamilyHistory((prev) => [
        { date: familyDay, activities: members.filter((m) => m.activity.trim()).map((m) => ({ name: m.name, activity: m.activity })) },
        ...prev,
      ])
      setMembers((prevMembers) => prevMembers.map((m) => ({ ...m, activity: '' })))
      setFamilyDay(today)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [familyDay])

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
    setMembers([...members, { id: crypto.randomUUID(), name, emoji: '🙂', activity: '', action: 'star' }])
  }

  return (
    <Card icon="👨‍👩‍👧‍👦" title="Family & Kids">
      {members.map((m) => (
        <div key={m.id} className="family-row">
          <div className="family-avatar">{m.emoji}</div>
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
      {familyHistory.length > 0 && (
        <button className="card-footer-btn" style={{ marginLeft: 8 }} onClick={() => setShowHistory((v) => !v)}>
          {showHistory ? 'Hide past days' : 'View past days'}
        </button>
      )}
      {showHistory && (
        <ul className="c-list" style={{ marginTop: 8 }}>
          {familyHistory.map((h, i) => (
            <li key={i} className="c-list-item" style={{ alignItems: 'flex-start' }}>
              <div>
                <span className="sub" style={{ marginLeft: 0 }}>
                  {h.date}
                </span>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  {h.activities.length > 0 ? h.activities.map((a) => `${a.name}: ${a.activity}`).join(' · ') : 'nothing recorded'}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
