import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useStreak } from '../hooks/useStreak'
import { localDateKey } from '../lib/logicalDate'
import Card from '../components/Card'

interface Entry {
  id: string
  date: string
  text: string
}

function todayKey() {
  return localDateKey()
}

function formatDate(dateKey: string) {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
}

export default function JournalEntries() {
  const [entries, setEntries] = useLocalStorage<Entry[]>('notes.journal', [])
  const [draft, setDraft] = useState('')
  const { streak, markToday } = useStreak('streak.journal')

  const today = todayKey()
  const todayEntry = entries.find((e) => e.date === today)
  const pastEntries = entries.filter((e) => e.date !== today).sort((a, b) => b.date.localeCompare(a.date))

  function saveToday() {
    if (!draft.trim() && !todayEntry) return
    const text = draft.trim() || todayEntry?.text || ''
    if (!text) return
    if (todayEntry) {
      setEntries(entries.map((e) => (e.date === today ? { ...e, text } : e)))
    } else {
      setEntries([...entries, { id: crypto.randomUUID(), date: today, text }])
    }
    markToday()
    setDraft('')
  }

  function removeEntry(id: string) {
    setEntries(entries.filter((e) => e.id !== id))
  }

  return (
    <Card icon="📖" title="Journal" wide meta={`${formatDate(today)}${streak > 0 ? ` · 🔥 ${streak}d streak` : ''}`}>
      <textarea
        className="c-textarea"
        placeholder={todayEntry ? todayEntry.text : "What's on your mind today?"}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      />
      <button className="card-footer-btn" onClick={saveToday}>
        {todayEntry ? 'Update today’s entry' : 'Save entry'}
      </button>

      <div className="subsection" style={{ marginTop: 10 }}>
        <p className="section-label" style={{ marginTop: 0 }}>
          Past Entries
        </p>
        <ul className="c-list">
          {pastEntries.length === 0 && <li className="c-empty">No past entries yet</li>}
          {pastEntries.map((e) => (
            <li key={e.id} className="c-list-item" style={{ alignItems: 'flex-start' }}>
              <div>
                <strong style={{ fontSize: 12, color: 'var(--purple-heading)' }}>{formatDate(e.date)}</strong>
                <p style={{ fontSize: 11.5, color: 'var(--text-body)', margin: '2px 0 0', whiteSpace: 'pre-wrap' }}>{e.text}</p>
              </div>
              <button className="remove" onClick={() => removeEntry(e.id)} aria-label="Remove">
                ×
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  )
}
