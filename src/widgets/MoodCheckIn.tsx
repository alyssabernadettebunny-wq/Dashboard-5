import { useRef, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useStreak } from '../hooks/useStreak'
import { isLogicalToday, localDateKey, logicalDateKey } from '../lib/logicalDate'
import Card from '../components/Card'

interface MoodNode {
  id: string
  label: string
  image: string | null
  children: MoodNode[]
}

interface TodayMood {
  date: string
  label: string
  image: string | null
}

interface MoodLogEntry {
  id: string
  timestamp: string
  label: string
  image: string | null
}

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function last7Days() {
  const days: { key: string; label: string }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = localDateKey(d)
    days.push({ key, label: `${WEEKDAY_SHORT[d.getDay()]} ${d.getDate()}` })
  }
  return days
}

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const size = 96
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')
        if (!ctx) return resolve(reader.result as string)
        const scale = Math.max(size / img.width, size / img.height)
        const w = img.width * scale
        const h = img.height * scale
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h)
        resolve(canvas.toDataURL('image/png'))
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

function findNode(nodes: MoodNode[], path: string[]): MoodNode[] {
  let level = nodes
  for (const id of path) {
    const found = level.find((n) => n.id === id)
    if (!found) return []
    level = found.children
  }
  return level
}

function updateTree(nodes: MoodNode[], path: string[], updater: (level: MoodNode[]) => MoodNode[]): MoodNode[] {
  if (path.length === 0) return updater(nodes)
  const [head, ...rest] = path
  return nodes.map((n) => (n.id === head ? { ...n, children: updateTree(n.children, rest, updater) } : n))
}

export default function MoodCheckIn() {
  const [tree, setTree] = useLocalStorage<MoodNode[]>('dashboard.moodTree', [])
  const [path, setPath] = useState<string[]>([])
  const [editMode, setEditMode] = useState(false)
  const [today, setToday] = useLocalStorage<TodayMood | null>('dashboard.moodToday', null)
  const [moodLog, setMoodLog] = useLocalStorage<MoodLogEntry[]>('dashboard.moodHistory', [])
  const [showHistory, setShowHistory] = useState(false)
  const { streak, markToday } = useStreak('streak.mood')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const pendingUpload = useRef<{ path: string[]; nodeId: string | null } | null>(null)

  const todayIsCurrent = today && isLogicalToday(today.date + 'T12:00:00')

  const currentLevel = findNode(tree, path)
  const parentLabel = path.length > 0 ? findParentLabel() : null

  function findParentLabel() {
    let level = tree
    let label = ''
    for (const id of path) {
      const node = level.find((n) => n.id === id)
      if (!node) break
      label = node.label
      level = node.children
    }
    return label
  }

  function addSlot() {
    const id = crypto.randomUUID()
    setTree(updateTree(tree, path, (level) => [...level, { id, label: 'New mood', image: null, children: [] }]))
    pendingUpload.current = { path, nodeId: id }
    fileInputRef.current?.click()
  }

  function triggerUpload(nodeId: string) {
    pendingUpload.current = { path, nodeId }
    fileInputRef.current?.click()
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    const pending = pendingUpload.current
    if (!file || !pending) return
    const dataUrl = await resizeImage(file)
    const label = window.prompt('Label for this mood?', 'Mood') ?? 'Mood'
    setTree(
      updateTree(tree, pending.path, (level) =>
        level.map((n) => (n.id === pending.nodeId ? { ...n, image: dataUrl, label } : n)),
      ),
    )
  }

  function removeSlot(nodeId: string) {
    if (!window.confirm('Remove this mood (and any sub-moods under it)?')) return
    setTree(updateTree(tree, path, (level) => level.filter((n) => n.id !== nodeId)))
  }

  function selectSlot(node: MoodNode) {
    if (editMode) {
      triggerUpload(node.id)
      return
    }
    if (node.children.length > 0) {
      setPath([...path, node.id])
    } else {
      setToday({ date: logicalDateKey(), label: node.label, image: node.image })
      setMoodLog([{ id: crypto.randomUUID(), timestamp: new Date().toISOString(), label: node.label, image: node.image }, ...moodLog])
      markToday()
      setPath([])
    }
  }

  return (
    <Card icon="💗" title="Mood Check-In" meta={streak > 0 ? `🔥 ${streak}d streak` : undefined}>
      <div className="mood2-header-row">
        <p className="waiting-subtitle" style={{ margin: 0 }}>
          How are you feeling?
        </p>
        <button className="mood2-edit-toggle" onClick={() => setEditMode((v) => !v)}>
          {editMode ? 'Done' : '✎ Edit'}
        </button>
      </div>

      {path.length > 0 && (
        <button className="mood2-back" onClick={() => setPath(path.slice(0, -1))}>
          ‹ Back {parentLabel && `from ${parentLabel}`}
        </button>
      )}

      <div className="mood2-grid">
        {currentLevel.length === 0 && !editMode && (
          <p className="c-empty">No moods set up yet — tap Edit to add some.</p>
        )}
        {currentLevel.map((node) => (
          <div key={node.id} className="mood2-slot-wrap">
            <button className="mood2-slot" onClick={() => selectSlot(node)} title={node.label}>
              {node.image ? <img src={node.image} alt={node.label} /> : <span className="mood2-placeholder">?</span>}
            </button>
            {editMode && (
              <div className="mood2-controls">
                {node.children.length > 0 && (
                  <button onClick={() => setPath([...path, node.id])} title="Edit sub-moods">
                    ▸
                  </button>
                )}
                {node.image && node.children.length === 0 && (
                  <button
                    onClick={() => {
                      const id = crypto.randomUUID()
                      setTree(
                        updateTree(tree, path, (level) =>
                          level.map((n) => (n.id === node.id ? { ...n, children: [{ id, label: 'New mood', image: null, children: [] }] } : n)),
                        ),
                      )
                      setPath([...path, node.id])
                      pendingUpload.current = { path: [...path, node.id], nodeId: id }
                      fileInputRef.current?.click()
                    }}
                    title="Add sub-moods"
                  >
                    +
                  </button>
                )}
                <button onClick={() => removeSlot(node.id)} title="Remove">
                  ×
                </button>
              </div>
            )}
          </div>
        ))}
        {editMode && (
          <button className="mood2-slot mood2-add" onClick={addSlot} title="Add a mood">
            +
          </button>
        )}
      </div>

      {!editMode && <p className="mood2-footer">It's okay to feel it all. ♡</p>}

      {today && todayIsCurrent && !editMode && (
        <p className="mood2-today">
          Today: {today.image && <img className="mood2-today-img" src={today.image} alt="" />} {today.label}
        </p>
      )}

      {!editMode && (
        <div className="mood-week-list">
          {last7Days().map((day) => {
            const dayEntries = moodLog
              .filter((m) => localDateKey(new Date(m.timestamp)) === day.key)
              .slice()
              .reverse() // chronological, oldest to newest
            return (
              <div key={day.key} className="mood-week-day-row">
                <span className="mood-week-date">{day.label}</span>
                <div className="mood-week-strip">
                  {dayEntries.length === 0 && <span className="mood-week-empty" />}
                  {dayEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="mood-week-slot"
                      title={`${entry.label} — ${new Date(entry.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`}
                    >
                      {entry.image ? <img src={entry.image} alt={entry.label} /> : <span className="mood2-placeholder">?</span>}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {moodLog.length > 0 && !editMode && (
        <button className="card-footer-btn" onClick={() => setShowHistory((v) => !v)}>
          {showHistory ? 'Hide history' : 'View history'}
        </button>
      )}
      {showHistory && !editMode && (
        <ul className="c-list" style={{ marginTop: 8 }}>
          {moodLog.map((m) => (
            <li key={m.id} className="c-list-item">
              <span className="sub" style={{ marginLeft: 0 }}>
                {new Date(m.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
              </span>
              <span>{m.label}</span>
              <button className="remove" onClick={() => setMoodLog(moodLog.filter((x) => x.id !== m.id))} aria-label="Remove">
                ×
              </button>
            </li>
          ))}
        </ul>
      )}

      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
    </Card>
  )
}
