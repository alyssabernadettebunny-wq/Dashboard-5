import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface Symptom {
  id: string
  text: string
  active: boolean
}

const DEFAULT_SYMPTOMS = ['Headache', 'Puffiness', 'Allergies', 'Nausea', 'Heat Sensitivity', 'Low Focus', 'Body Tension']

export default function SymptomsCheck() {
  const [symptoms, setSymptoms] = useLocalStorage<Symptom[]>(
    'bodyweather.symptoms',
    DEFAULT_SYMPTOMS.map((text) => ({ id: crypto.randomUUID(), text, active: false })),
  )
  const [text, setText] = useState('')

  function toggle(id: string) {
    setSymptoms(symptoms.map((s) => (s.id === id ? { ...s, active: !s.active } : s)))
  }

  function addSymptom() {
    const trimmed = text.trim()
    if (!trimmed) return
    setSymptoms([...symptoms, { id: crypto.randomUUID(), text: trimmed, active: false }])
    setText('')
  }

  function removeSymptom(id: string) {
    setSymptoms(symptoms.filter((s) => s.id !== id))
  }

  const activeCount = symptoms.filter((s) => s.active).length

  return (
    <Card icon="🩺" title="Symptoms Check" meta={activeCount ? `${activeCount} today` : undefined}>
      <ul className="c-list">
        {symptoms.map((s) => (
          <li key={s.id} className="c-list-item">
            <input type="checkbox" checked={s.active} onChange={() => toggle(s.id)} />
            <span>{s.text}</span>
            <button className="remove" onClick={() => removeSymptom(s.id)} aria-label="Remove symptom">
              ×
            </button>
          </li>
        ))}
      </ul>
      <div className="c-input-row">
        <input
          type="text"
          value={text}
          placeholder="Add custom symptom..."
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addSymptom()}
        />
        <button onClick={addSymptom}>Add</button>
      </div>
    </Card>
  )
}
