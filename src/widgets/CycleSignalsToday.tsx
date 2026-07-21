import { useEffect, useRef } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { logicalDateKey } from '../lib/logicalDate'
import Card from '../components/Card'

const SIGNALS_LEFT = [
  { key: 'cramps', icon: '🎂', label: 'Cramps' },
  { key: 'breastTenderness', icon: '💗', label: 'Breast Tenderness' },
  { key: 'puffiness', icon: '💧', label: 'Puffiness / Bloating' },
  { key: 'moodiness', icon: '🌀', label: 'Moodiness' },
  { key: 'irritability', icon: '😤', label: 'Irritability' },
]

const SIGNALS_RIGHT = [
  { key: 'headache', icon: '🤕', label: 'Headache' },
  { key: 'cravings', icon: '🧁', label: 'Cravings' },
  { key: 'fatigue', icon: '😴', label: 'Fatigue' },
  { key: 'skinChanges', icon: '🌷', label: 'Skin Changes' },
]

interface SignalsRecord {
  date: string
  values: Record<string, boolean>
}

export default function CycleSignalsToday() {
  const [record, setRecord] = useLocalStorage<SignalsRecord>('bodyweather.cycle.signalsToday', { date: logicalDateKey(), values: {} })
  const resetRef = useRef(false)

  useEffect(() => {
    const today = logicalDateKey()
    if (record.date !== today && !resetRef.current) {
      resetRef.current = true
      setRecord({ date: today, values: {} })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record.date])

  function toggle(key: string) {
    setRecord({ ...record, values: { ...record.values, [key]: !record.values[key] } })
  }

  return (
    <Card icon="🎀" title="4. Cycle Signals Today" surface="pink">
      <div className="cycle-signals-cols">
        <ul className="cycle-signals-list">
          {SIGNALS_LEFT.map((s) => (
            <li key={s.key} className="cycle-signal-item">
              <input type="checkbox" checked={!!record.values[s.key]} onChange={() => toggle(s.key)} />
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </li>
          ))}
        </ul>
        <ul className="cycle-signals-list">
          {SIGNALS_RIGHT.map((s) => (
            <li key={s.key} className="cycle-signal-item">
              <input type="checkbox" checked={!!record.values[s.key]} onChange={() => toggle(s.key)} />
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="cycle-signals-footer">🎀 Check what feels true for you today ♡</p>
    </Card>
  )
}
