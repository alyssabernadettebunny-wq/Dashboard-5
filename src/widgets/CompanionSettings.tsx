import { useCompanionMode } from '../hooks/useCompanion'
import Card from '../components/Card'

const OPTIONS: { id: 'alternate' | 'misa' | 'coco'; label: string; icon: string }[] = [
  { id: 'alternate', label: 'Alternate daily', icon: '🔀' },
  { id: 'misa', label: 'Always Misa', icon: '🐶' },
  { id: 'coco', label: 'Always Coco', icon: '🐩' },
]

export default function CompanionSettings() {
  const [mode, setMode] = useCompanionMode()

  return (
    <Card icon="🐾" title="Companion" meta="Who greets you in the header">
      <div className="theme-row">
        {OPTIONS.map((o) => (
          <button key={o.id} className={`theme-swatch ${mode === o.id ? 'active' : ''}`} onClick={() => setMode(o.id)}>
            <span style={{ fontSize: 20 }}>{o.icon}</span>
            {o.label}
          </button>
        ))}
      </div>
    </Card>
  )
}
