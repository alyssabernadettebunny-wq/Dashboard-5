import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface FeedbackItem {
  id: string
  type: 'bug' | 'feature'
  text: string
  date: string
}

export function useAnnotationMode() {
  return useLocalStorage('settings.annotationMode', false)
}

export default function FeedbackAnnotation() {
  const [items, setItems] = useLocalStorage<FeedbackItem[]>('dashboard.feedback', [])
  const [annotationMode, setAnnotationMode] = useAnnotationMode()
  const [openForm, setOpenForm] = useState<'bug' | 'feature' | null>(null)
  const [text, setText] = useState('')
  const [showList, setShowList] = useState(false)

  function submit() {
    const trimmed = text.trim()
    if (!trimmed || !openForm) return
    const date = new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })
    setItems([{ id: crypto.randomUUID(), type: openForm, text: trimmed, date }, ...items])
    setText('')
    setOpenForm(null)
  }

  function removeItem(id: string) {
    setItems(items.filter((i) => i.id !== id))
  }

  return (
    <Card icon="💌" title="Feedback & Annotation Mode" meta="Help make it perfect" variant="memo" surface="pink">
      <ul className="guide-list">
        <li className="guide-item">
          <button className="guide-item-row" onClick={() => setOpenForm(openForm === 'bug' ? null : 'bug')}>
            <span>🐞 Report a bug</span>
            <span className="guide-chevron">{openForm === 'bug' ? '⌄' : '›'}</span>
          </button>
          {openForm === 'bug' && (
            <div className="c-input-row" style={{ marginTop: 6 }}>
              <input type="text" placeholder="What went wrong?" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
              <button onClick={submit}>Save</button>
            </div>
          )}
        </li>
        <li className="guide-item">
          <button className="guide-item-row" onClick={() => setOpenForm(openForm === 'feature' ? null : 'feature')}>
            <span>💡 Suggest a feature</span>
            <span className="guide-chevron">{openForm === 'feature' ? '⌄' : '›'}</span>
          </button>
          {openForm === 'feature' && (
            <div className="c-input-row" style={{ marginTop: 6 }}>
              <input type="text" placeholder="What would help?" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
              <button onClick={submit}>Save</button>
            </div>
          )}
        </li>
        <li className="guide-item">
          <button className="guide-item-row" onClick={() => setAnnotationMode(true)}>
            <span>📍 Annotate this page</span>
            <span className="guide-chevron">›</span>
          </button>
        </li>
      </ul>

      <div className="annotation-toggle-row">
        <span>Annotation Mode</span>
        <button className={`toggle-switch ${annotationMode ? 'on' : ''}`} onClick={() => setAnnotationMode(!annotationMode)} aria-label="Toggle annotation mode">
          <span className="toggle-switch-knob" />
        </button>
        <span className="toggle-switch-label">{annotationMode ? 'On' : 'Off'}</span>
      </div>
      {annotationMode && <p className="c-empty" style={{ marginTop: 4 }}>Click anywhere on the dashboard to drop a note pin.</p>}

      {items.length > 0 && (
        <button className="card-footer-btn" onClick={() => setShowList((v) => !v)}>
          {showList ? 'Hide feedback' : `View feedback (${items.length})`}
        </button>
      )}
      {showList && (
        <ul className="c-list" style={{ marginTop: 8 }}>
          {items.map((i) => (
            <li key={i.id} className="c-list-item" style={{ alignItems: 'flex-start' }}>
              <div>
                <span className="sub" style={{ marginLeft: 0 }}>
                  {i.type === 'bug' ? '🐞' : '💡'} {i.date}
                </span>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>{i.text}</p>
              </div>
              <button className="remove" onClick={() => removeItem(i.id)} aria-label="Remove">
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
