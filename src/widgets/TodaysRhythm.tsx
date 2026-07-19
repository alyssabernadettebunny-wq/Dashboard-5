import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface Block {
  id: string
  label: string
  hours: string
  startHour: number
  endHour: number
  energy: 'High' | 'Medium' | 'Low'
  focus: string
}

const DEFAULT_BLOCKS: Block[] = [
  { id: 'morning', label: 'Morning', hours: '6 AM – 12 PM', startHour: 6, endHour: 12, energy: 'High', focus: 'Deep work, classes, hard tasks' },
  { id: 'afternoon', label: 'Afternoon', hours: '12 PM – 5 PM', startHour: 12, endHour: 17, energy: 'Medium', focus: 'Admin, errands, lighter study' },
  { id: 'evening', label: 'Evening', hours: '5 PM – 10 PM', startHour: 17, endHour: 22, energy: 'Low', focus: 'Review, cozy tasks, wind-down' },
]

const ENERGY_ICON: Record<Block['energy'], string> = { High: '☀️', Medium: '⛅', Low: '🌙' }

function currentBlockId(blocks: Block[]) {
  const hour = new Date().getHours()
  const match = blocks.find((b) => hour >= b.startHour && hour < b.endHour)
  return match?.id ?? blocks[0].id
}

export default function TodaysRhythm() {
  const [blocks, setBlocks] = useLocalStorage<Block[]>('rhythm.blocks', DEFAULT_BLOCKS)
  const activeId = currentBlockId(blocks)

  function updateBlock(id: string, patch: Partial<Block>) {
    setBlocks(blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)))
  }

  return (
    <Card icon="☀️" title="Today's Rhythm" wide meta="Honor your energy — it's data, not drama ♡">
      <div className="rhythm-blocks">
        {blocks.map((b) => (
          <div key={b.id} className={`rhythm-block ${b.id === activeId ? 'active' : ''}`}>
            {b.id === activeId && <span className="rhythm-now-tag">now</span>}
            <div className="rhythm-block-header">
              <span>{ENERGY_ICON[b.energy]}</span>
              <span className="rhythm-block-label">{b.label}</span>
            </div>
            <span className="rhythm-block-hours">{b.hours}</span>
            <select
              className="rhythm-energy-select"
              value={b.energy}
              onChange={(e) => updateBlock(b.id, { energy: e.target.value as Block['energy'] })}
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
            <input
              type="text"
              className="rhythm-focus-input"
              value={b.focus}
              onChange={(e) => updateBlock(b.id, { focus: e.target.value })}
              placeholder="What's this block for?"
            />
          </div>
        ))}
      </div>
    </Card>
  )
}
