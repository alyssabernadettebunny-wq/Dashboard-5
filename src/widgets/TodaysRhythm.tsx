import { useEffect, useRef } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface Block {
  id: string
  icon: string
  title: string
  startHour: number
  endHour: number
  hoursLabel: string
  tags: string
  deco: string
  color: string
}

const COLORS = ['lavender', 'mint', 'blue', 'pink', 'gold']

const DEFAULT_BLOCKS: Block[] = [
  { id: 'morning', icon: '☀️', title: 'Morning Launch', startHour: 6, endHour: 8.5, hoursLabel: '6:30 – 8:30 AM', tags: 'Hydrate • stretch • plan • coffee • set mood', deco: '☕', color: 'lavender' },
  { id: 'focus', icon: '⭐', title: 'Focus Block', startHour: 8.5, endHour: 11.5, hoursLabel: '8:30 – 11:30 AM', tags: 'Deep work • study • projects', deco: '💻', color: 'mint' },
  { id: 'lunch', icon: '♡', title: 'Lunch / Reset', startHour: 11.5, endHour: 12.5, hoursLabel: '11:30 AM – 12:30 PM', tags: 'Nourish • reset • short walk', deco: '🥣', color: 'mint' },
  { id: 'afternoon', icon: '✨', title: 'Afternoon Flow', startHour: 12.5, endHour: 15.5, hoursLabel: '12:30 – 3:30 PM', tags: 'Admin • errands • creative progress', deco: '✨', color: 'blue' },
  { id: 'pickup', icon: '🎀', title: 'Girls Pick-Up', startHour: 15.5, endHour: 16, hoursLabel: '3:30 – 4:00 PM', tags: 'Pick up • snack • chat', deco: '🚗', color: 'lavender' },
  { id: 'evening', icon: '🌙', title: 'Evening Wind-Down', startHour: 18, endHour: 20, hoursLabel: '6:00 – 8:00 PM', tags: 'Dinner • family time • unwind', deco: '🌙', color: 'lavender' },
  { id: 'cozy', icon: '♡', title: 'Cozy Time', startHour: 20, endHour: 21.5, hoursLabel: '8:00 – 9:30 PM', tags: 'Hobby • journal • skincare • relax', deco: '🧶', color: 'lavender' },
  { id: 'bedtime', icon: '🌙', title: 'Bedtime', startHour: 21.5, endHour: 22, hoursLabel: '9:30 – 10:00 PM', tags: 'Unplug • read • sleepy time', deco: '☁️', color: 'gold' },
]

function currentBlockId(blocks: Block[]) {
  const hour = new Date().getHours() + new Date().getMinutes() / 60
  const match = blocks.find((b) => hour >= b.startHour && hour < b.endHour)
  return match?.id ?? null
}

export default function TodaysRhythm() {
  const [blocks, setBlocks] = useLocalStorage<Block[]>('rhythm.blocks', DEFAULT_BLOCKS)
  const migratedRef = useRef(false)
  const activeId = currentBlockId(blocks)

  useEffect(() => {
    if (migratedRef.current) return
    migratedRef.current = true
    const needsMigration = blocks.some((b) => (b as unknown as { title?: string }).title === undefined)
    if (needsMigration) {
      setBlocks((prev) =>
        prev.map((b, i) => {
          const old = b as unknown as { label?: string; hours?: string; focus?: string; energy?: string }
          return {
            id: b.id,
            icon: b.icon ?? (old.energy === 'Low' ? '🌙' : old.energy === 'Medium' ? '⛅' : '☀️'),
            title: b.title ?? old.label ?? 'Untitled block',
            startHour: b.startHour,
            endHour: b.endHour,
            hoursLabel: b.hoursLabel ?? old.hours ?? '',
            tags: b.tags ?? old.focus ?? '',
            deco: b.deco ?? '✨',
            color: b.color ?? COLORS[i % COLORS.length],
          }
        }),
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function updateBlock(id: string, patch: Partial<Block>) {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  }

  function removeBlock(id: string) {
    setBlocks(blocks.filter((b) => b.id !== id))
  }

  function addBlock() {
    setBlocks([
      ...blocks,
      { id: crypto.randomUUID(), icon: '⭐', title: '', startHour: 12, endHour: 13, hoursLabel: '', tags: '', deco: '✨', color: COLORS[blocks.length % COLORS.length] },
    ])
  }

  return (
    <Card icon="🎀" title="Today's Rhythm" meta="A gentle flow for today ♡">
      <div className="rhythm-timeline">
        {blocks.map((b) => (
          <div key={b.id} className="rhythm-row">
            <div className="rhythm-row-marker">
              <span className={`rhythm-dot rhythm-dot-${b.color}`} />
            </div>
            <div className="rhythm-row-body">
              <div className="rhythm-row-head">
                <span className="rhythm-row-icon">{b.icon}</span>
                <input
                  className="rhythm-row-title"
                  value={b.title}
                  onChange={(e) => updateBlock(b.id, { title: e.target.value })}
                  placeholder="Block name"
                />
                {b.id === activeId && <span className="rhythm-now-tag">now</span>}
                <button className="remove" onClick={() => removeBlock(b.id)} aria-label="Remove block">
                  ×
                </button>
              </div>
              <input
                className="rhythm-row-hours"
                value={b.hoursLabel}
                onChange={(e) => updateBlock(b.id, { hoursLabel: e.target.value })}
                placeholder="Time range"
              />
              <input
                className="rhythm-row-tags"
                value={b.tags}
                onChange={(e) => updateBlock(b.id, { tags: e.target.value })}
                placeholder="What happens in this block..."
              />
            </div>
            <div className="rhythm-row-deco">{b.deco}</div>
          </div>
        ))}
      </div>
      <button className="card-footer-btn" onClick={addBlock}>
        + Add block
      </button>
    </Card>
  )
}
