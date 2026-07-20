import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface Goal {
  id: string
  text: string
  done: boolean
}

function GoalList({
  items,
  setItems,
  placeholder,
}: {
  items: Goal[]
  setItems: (items: Goal[]) => void
  placeholder: string
}) {
  const [text, setText] = useState('')

  function add() {
    if (!text.trim()) return
    setItems([...items, { id: crypto.randomUUID(), text: text.trim(), done: false }])
    setText('')
  }

  function toggle(id: string) {
    setItems(items.map((i) => (i.id === id ? { ...i, done: !i.done } : i)))
  }

  function remove(id: string) {
    setItems(items.filter((i) => i.id !== id))
  }

  return (
    <>
      <div className="c-input-row">
        <input type="text" placeholder={placeholder} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} />
        <button onClick={add}>Add</button>
      </div>
      <ul className="c-list">
        {items.length === 0 && <li className="c-empty">Nothing here yet</li>}
        {items.map((i) => (
          <li key={i.id} className={`c-list-item ${i.done ? 'struck' : ''}`}>
            <input type="checkbox" checked={i.done} onChange={() => toggle(i.id)} />
            <span>{i.text}</span>
            <button className="remove" onClick={() => remove(i.id)} aria-label="Remove">
              ×
            </button>
          </li>
        ))}
      </ul>
    </>
  )
}

export default function GoalsDreams() {
  const [yearGoals, setYearGoals] = useLocalStorage<Goal[]>('spark.goals.year', [])
  const [bucketList, setBucketList] = useLocalStorage<Goal[]>('spark.goals.bucket', [])

  return (
    <Card icon="🌟" title="Goals & Dreams" wide>
      <div className="status-cols">
        <div className="subsection">
          <p className="section-label" style={{ marginTop: 0 }}>
            This Year's Goals
          </p>
          <GoalList items={yearGoals} setItems={setYearGoals} placeholder="A goal for this year..." />
        </div>
        <div className="subsection">
          <p className="section-label" style={{ marginTop: 0 }}>
            Someday / Bucket List
          </p>
          <GoalList items={bucketList} setItems={setBucketList} placeholder="A someday dream..." />
        </div>
      </div>
    </Card>
  )
}
