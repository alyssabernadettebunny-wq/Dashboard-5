import { useEffect, useRef, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface Item {
  id: string
  text: string
  done: boolean
}

type Stage = 'Washing' | 'Drying' | 'Done'

interface LoadState {
  stage: Stage
  remaining: number
  label: string
}

const STAGE_SECONDS: Record<Stage, number> = {
  Washing: 45 * 60,
  Drying: 60 * 60,
  Done: 0,
}

const DEFAULT_ITEMS = ['1 Load wash', 'Dry / fluff', 'Fold', 'Put away', 'Bedding refresh']

export default function LaundryCard() {
  const [items, setItems] = useLocalStorage<Item[]>(
    'house.room.laundry',
    DEFAULT_ITEMS.map((text) => ({ id: crypto.randomUUID(), text, done: false })),
  )
  const [text, setText] = useState('')
  const [detergent, setDetergent] = useLocalStorage('house.supply.detergent', 80)
  const [load, setLoad] = useLocalStorage<LoadState>('house.laundry.load', {
    stage: 'Washing',
    remaining: STAGE_SECONDS.Washing,
    label: 'Whites & towels',
  })
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (load.stage === 'Done') return
    intervalRef.current = setInterval(() => {
      setLoad((prev) => (prev.remaining <= 1 ? { ...prev, remaining: 0 } : { ...prev, remaining: prev.remaining - 1 }))
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load.stage])

  function addItem() {
    const trimmed = text.trim()
    if (!trimmed) return
    setItems([...items, { id: crypto.randomUUID(), text: trimmed, done: false }])
    setText('')
  }

  function toggleItem(id: string) {
    setItems(items.map((i) => (i.id === id ? { ...i, done: !i.done } : i)))
  }

  function removeItem(id: string) {
    setItems(items.filter((i) => i.id !== id))
  }

  function advanceStage() {
    const next: Stage = load.stage === 'Washing' ? 'Drying' : load.stage === 'Drying' ? 'Done' : 'Washing'
    setLoad({ stage: next, remaining: STAGE_SECONDS[next], label: next === 'Washing' ? 'New load' : load.label })
  }

  const doneCount = items.filter((i) => i.done).length
  const mins = Math.floor(load.remaining / 60)
  const progressPct = load.stage === 'Done' ? 100 : 100 - (load.remaining / STAGE_SECONDS[load.stage]) * 100

  return (
    <Card icon="🧺" title="3. Laundry" meta={items.length ? `${doneCount} / ${items.length}` : undefined}>
      <div className="room-body">
        <ul className="c-list" style={{ flex: 1 }}>
          {items.map((item) => (
            <li key={item.id} className={`c-list-item ${item.done ? 'struck' : ''}`}>
              <input type="checkbox" checked={item.done} onChange={() => toggleItem(item.id)} />
              <span>{item.text}</span>
              <button className="remove" onClick={() => removeItem(item.id)} aria-label="Remove item">
                ×
              </button>
            </li>
          ))}
        </ul>
        <div className="card-illustration room-illustration">illustration</div>
      </div>
      <div className="c-input-row">
        <input
          type="text"
          value={text}
          placeholder="Add a laundry task..."
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
        />
        <button onClick={addItem}>Add</button>
      </div>
      <div className="supply-strip">
        <span className="info-label">Detergent: {detergent}%</span>
        <div className="progress-track supply-track">
          <div className="progress-fill" style={{ width: `${Math.min(100, detergent)}%` }} />
        </div>
        <input type="number" min={0} max={100} value={detergent} onChange={(e) => setDetergent(Number(e.target.value))} className="supply-input" />
      </div>

      <div className="subsection">
        <p className="section-label" style={{ marginTop: 0 }}>
          Current Load
        </p>
        <p className="load-status">{load.stage === 'Done' ? 'Load done! ✓' : `${load.stage} load`}</p>
        {load.stage !== 'Done' && (
          <input
            className="load-label-input"
            value={load.label}
            onChange={(e) => setLoad({ ...load, label: e.target.value })}
            placeholder="What's in this load?"
          />
        )}
        {load.stage !== 'Done' && (
          <>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <p className="load-remaining">{mins} min remaining</p>
          </>
        )}
        <button className="card-footer-btn" onClick={advanceStage}>
          {load.stage === 'Done' ? 'Start new load ♡' : 'Switch / Move ♡'}
        </button>
      </div>
    </Card>
  )
}
