import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface Memory {
  caption: string
}

export default function PhotoMemories() {
  const [misaMemory, setMisaMemory] = useLocalStorage<Memory>('pets.misa.memory', { caption: 'Tug time! 🐾' })
  const [cocoMemory, setCocoMemory] = useLocalStorage<Memory>('pets.coco.memory', { caption: 'Sunshine girl ☀️' })
  const [date, setDate] = useLocalStorage('pets.memory.date', new Date().toISOString().slice(0, 10))

  return (
    <Card icon="📷" title="Photo Moments / Memory">
      <div className="memory-cols">
        <div className="memory-card">
          <div className="card-illustration" style={{ width: '100%', height: 100 }}>
            illustration
          </div>
          <input value={misaMemory.caption} onChange={(e) => setMisaMemory({ caption: e.target.value })} />
        </div>
        <div className="memory-card">
          <div className="card-illustration" style={{ width: '100%', height: 100 }}>
            illustration
          </div>
          <input value={cocoMemory.caption} onChange={(e) => setCocoMemory({ caption: e.target.value })} />
        </div>
      </div>
      <div className="stat-row" style={{ justifyContent: 'center', gap: 8 }}>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', font: 'inherit' }} />
        <span>♡</span>
      </div>
    </Card>
  )
}
