import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useStreak } from '../hooks/useStreak'
import { localDateKey } from '../lib/logicalDate'
import { CHECKIN_CONFIG_KEY, CHECKIN_ENTRIES_KEY, type ChatMessage, type CheckinConfig, type CheckinEntry, type CheckinLog } from '../lib/checkin'
import Card from '../components/Card'

interface AiResponse {
  message: string
  options: string[]
  done: boolean
  summary: string | null
  log: CheckinLog | null
}

function formatDate(dateKey: string) {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
}

export default function GuidedCheckIn() {
  const [config, setConfig] = useLocalStorage<CheckinConfig>(CHECKIN_CONFIG_KEY, { workerUrl: '', passphrase: '' })
  const [entries, setEntries] = useLocalStorage<CheckinEntry[]>(CHECKIN_ENTRIES_KEY, [])
  const [editingConfig, setEditingConfig] = useState(false)
  const [urlInput, setUrlInput] = useState(config.workerUrl)
  const [passInput, setPassInput] = useState(config.passphrase)

  const [transcript, setTranscript] = useState<ChatMessage[]>([])
  const [options, setOptions] = useState<string[]>([])
  const [freeText, setFreeText] = useState('')
  const [active, setActive] = useState(false)
  const [finished, setFinished] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastAssistantMsg, setLastAssistantMsg] = useState('')

  const { streak, markToday } = useStreak('streak.checkin')

  const today = localDateKey()
  const todayEntry = entries.find((e) => e.date === today)
  const pastEntries = entries.filter((e) => e.date !== today).sort((a, b) => b.date.localeCompare(a.date))

  const configured = config.workerUrl.trim() !== '' && config.passphrase.trim() !== ''

  function saveConfig() {
    setConfig({ workerUrl: urlInput.trim(), passphrase: passInput })
    setEditingConfig(false)
  }

  async function callWorker(nextTranscript: ChatMessage[]) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(config.workerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passphrase: config.passphrase, messages: nextTranscript }),
      })
      if (res.status === 401) throw new Error('Passphrase rejected by worker — check your settings')
      if (!res.ok) throw new Error('Check-in service error — try again in a moment')
      const data: AiResponse = await res.json()
      setLastAssistantMsg(data.message)
      setOptions(data.options ?? [])
      setTranscript([...nextTranscript, { role: 'assistant', content: data.message }])
      if (data.done) {
        const summary = data.summary || data.message
        const entry: CheckinEntry = {
          id: crypto.randomUUID(),
          date: today,
          summary,
          transcript: [...nextTranscript, { role: 'assistant', content: data.message }],
          log: data.log,
        }
        setEntries([...entries.filter((e) => e.date !== today), entry])
        markToday()
        setFinished(true)
        setOptions([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function start() {
    setActive(true)
    setFinished(false)
    setTranscript([])
    setLastAssistantMsg('')
    callWorker([])
  }

  function closeConversation() {
    setActive(false)
    setFinished(false)
  }

  function answer(text: string) {
    if (!text.trim() || loading) return
    const next = [...transcript, { role: 'user' as const, content: text.trim() }]
    setTranscript(next)
    setFreeText('')
    setOptions([])
    callWorker(next)
  }

  function removeEntry(id: string) {
    setEntries(entries.filter((e) => e.id !== id))
  }

  return (
    <Card
      icon="🩵"
      title="Guided Check-In"
      wide
      meta={`${formatDate(today)}${streak > 0 ? ` · 🔥 ${streak}d streak` : ''}`}
      footer={
        <button className="card-footer-btn" style={{ marginTop: 10 }} onClick={() => setEditingConfig((v) => !v)}>
          {editingConfig ? 'Close settings' : configured ? '⚙ Check-in settings' : '⚙ Set up check-in'}
        </button>
      }
    >
      {editingConfig && (
        <div className="subsection" style={{ marginBottom: 10 }}>
          <p className="section-label" style={{ marginTop: 0 }}>
            Connect your check-in worker
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-body)', margin: '0 0 8px' }}>
            Deploy the Cloudflare Worker in <code>worker/</code> of this repo, then paste its URL and the passphrase you set as{' '}
            <code>CHECKIN_SECRET</code> below.
          </p>
          <div className="c-input-row">
            <input type="text" placeholder="https://your-worker.workers.dev" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} />
          </div>
          <div className="c-input-row" style={{ marginTop: 4 }}>
            <input type="password" placeholder="Passphrase" value={passInput} onChange={(e) => setPassInput(e.target.value)} />
            <button onClick={saveConfig}>Save</button>
          </div>
        </div>
      )}

      {!configured && !editingConfig && (
        <p className="c-empty">Set up your check-in worker to start using this — tap the settings button below.</p>
      )}

      {configured && !active && (
        <>
          {todayEntry ? (
            <div className="subsection">
              <p className="section-label" style={{ marginTop: 0 }}>
                Today's check-in
              </p>
              <p style={{ fontSize: 13.5, color: 'var(--text-body)', whiteSpace: 'pre-wrap' }}>{todayEntry.summary}</p>
              <button className="card-footer-btn" onClick={start}>
                Redo today's check-in
              </button>
            </div>
          ) : (
            <button className="card-footer-btn" onClick={start}>
              Start today's check-in
            </button>
          )}
        </>
      )}

      {active && (
        <div className="subsection">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
            {transcript.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === 'assistant' ? 'flex-start' : 'flex-end',
                  background: m.role === 'assistant' ? 'var(--pink-pale)' : 'var(--purple-heading)',
                  color: m.role === 'assistant' ? 'var(--text-body)' : '#fff',
                  borderRadius: 12,
                  padding: '6px 12px',
                  fontSize: 13.5,
                  maxWidth: '80%',
                }}
              >
                {m.content}
              </div>
            ))}
            {loading && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>thinking…</div>}
          </div>

          {!loading && !finished && options.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
              {options.map((opt) => (
                <button key={opt} className="card-footer-btn" onClick={() => answer(opt)}>
                  {opt}
                </button>
              ))}
            </div>
          )}

          {!loading && !finished && lastAssistantMsg && (
            <div className="c-input-row">
              <input
                type="text"
                placeholder="Or type your own answer..."
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && answer(freeText)}
              />
              <button onClick={() => answer(freeText)}>Send</button>
            </div>
          )}

          {!loading && finished && (
            <button className="card-footer-btn" onClick={closeConversation}>
              Done — save to today's check-ins
            </button>
          )}
        </div>
      )}

      {error && <p style={{ fontSize: 11.5, color: 'var(--pink-accent)', marginTop: 6 }}>{error}</p>}

      <div className="subsection" style={{ marginTop: 10 }}>
        <p className="section-label" style={{ marginTop: 0 }}>
          Past check-ins
        </p>
        <ul className="c-list">
          {pastEntries.length === 0 && <li className="c-empty">No past check-ins yet</li>}
          {pastEntries.map((e) => (
            <li key={e.id} className="c-list-item" style={{ alignItems: 'flex-start' }}>
              <div>
                <strong style={{ fontSize: 12, color: 'var(--purple-heading)' }}>{formatDate(e.date)}</strong>
                <p style={{ fontSize: 12, color: 'var(--text-body)', margin: '2px 0 0', whiteSpace: 'pre-wrap' }}>{e.summary}</p>
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
