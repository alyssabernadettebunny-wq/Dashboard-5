import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { CHECKIN_CONFIG_KEY, CHECKIN_ENTRIES_KEY, type CheckinConfig, type CheckinEntry } from '../lib/checkin'
import Card from '../components/Card'

interface CachedReport {
  generatedAt: string
  text: string
  entryCount: number
}

function dayLetter(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 1)
}

function tallyBy(entries: CheckinEntry[], pick: (log: NonNullable<CheckinEntry['log']>) => string[]) {
  const counts = new Map<string, number>()
  for (const e of entries) {
    if (!e.log) continue
    for (const item of pick(e.log)) {
      const key = item.trim()
      if (!key) continue
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
  }
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])
}

export default function WellbeingReport() {
  const [config] = useLocalStorage<CheckinConfig>(CHECKIN_CONFIG_KEY, { workerUrl: '', passphrase: '' })
  const [entries] = useLocalStorage<CheckinEntry[]>(CHECKIN_ENTRIES_KEY, [])
  const [report, setReport] = useLocalStorage<CachedReport | null>('notes.checkin.report', null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const configured = config.workerUrl.trim() !== '' && config.passphrase.trim() !== ''
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date))
  const withLogs = sorted.filter((e) => e.log)
  const recent = sorted.slice(-14)

  const symptomTally = tallyBy(entries, (log) => log.symptoms)
  const emotionTally = tallyBy(entries, (log) => log.emotions)

  const w = 280
  const h = 90
  const chartable = recent.filter((e) => e.log && (e.log.moodScore != null || e.log.energy != null))
  const stepX = chartable.length > 1 ? w / (chartable.length - 1) : 0

  function pointsFor(key: 'moodScore' | 'energy') {
    return chartable
      .map((e, i) => {
        const v = e.log?.[key]
        const y = v == null ? h / 2 : h - (v / 5) * h
        return `${i * stepX},${y}`
      })
      .join(' ')
  }

  async function generateReport() {
    if (!configured || withLogs.length === 0) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(config.workerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passphrase: config.passphrase,
          mode: 'report',
          logs: withLogs.slice(-30).map((e) => ({ date: e.date, ...e.log })),
        }),
      })
      if (res.status === 401) throw new Error('Passphrase rejected by worker — check Check-in settings')
      if (!res.ok) throw new Error('Report service error — try again in a moment')
      const data = await res.json()
      setReport({ generatedAt: new Date().toISOString(), text: data.report, entryCount: withLogs.length })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card icon="📊" title="Wellbeing Report" wide meta={withLogs.length > 0 ? `${withLogs.length} logged day${withLogs.length !== 1 ? 's' : ''}` : undefined}>
      {withLogs.length === 0 ? (
        <p className="c-empty">Complete a few guided check-ins to start seeing trends and reports here.</p>
      ) : (
        <div className="status-cols">
          <div className="subsection">
            <p className="section-label" style={{ marginTop: 0 }}>
              Mood & Energy (last {chartable.length} logged days)
            </p>
            {chartable.length < 2 ? (
              <p className="c-empty">Log a few more days to see a trend line.</p>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', height: h }}>
                    <span>5</span>
                    <span>3</span>
                    <span>1</span>
                  </div>
                  <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ flex: 1, height: h }}>
                    <polyline points={pointsFor('moodScore')} fill="none" stroke="var(--pink-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <polyline points={pointsFor('energy')} fill="none" stroke="var(--purple-heading)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginLeft: 22 }}>
                  {chartable.map((e) => (
                    <span key={e.date}>{dayLetter(e.date)}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 12, fontSize: 11, marginTop: 6 }}>
                  <span style={{ color: 'var(--pink-accent)', fontWeight: 700 }}>♡ Mood</span>
                  <span style={{ color: 'var(--purple-heading)', fontWeight: 700 }}>🦋 Energy</span>
                </div>
              </>
            )}
          </div>

          <div className="subsection">
            <p className="section-label" style={{ marginTop: 0 }}>
              Most logged symptoms
            </p>
            {symptomTally.length === 0 && <p className="c-empty">None logged yet</p>}
            <ul className="c-list">
              {symptomTally.slice(0, 6).map(([name, count]) => (
                <li key={name} className="c-list-item">
                  <span>{name}</span>
                  <span className="sub">{count}×</span>
                </li>
              ))}
            </ul>
            <p className="section-label">Most logged emotions</p>
            {emotionTally.length === 0 && <p className="c-empty">None logged yet</p>}
            <ul className="c-list">
              {emotionTally.slice(0, 6).map(([name, count]) => (
                <li key={name} className="c-list-item">
                  <span>{name}</span>
                  <span className="sub">{count}×</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="subsection" style={{ marginTop: 10 }}>
        <p className="section-label" style={{ marginTop: 0 }}>
          AI Pattern Report
        </p>
        {!configured && <p className="c-empty">Set up your check-in worker (in Guided Check-In settings) to generate reports.</p>}
        {configured && (
          <>
            <button className="card-footer-btn" onClick={generateReport} disabled={loading || withLogs.length === 0}>
              {loading ? 'Thinking…' : report ? 'Regenerate report' : 'Generate report'}
            </button>
            {error && <p style={{ fontSize: 11.5, color: 'var(--pink-accent)', marginTop: 6 }}>{error}</p>}
            {report && (
              <>
                <p style={{ fontSize: 13, color: 'var(--text-body)', whiteSpace: 'pre-wrap', marginTop: 8 }}>{report.text}</p>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 4 }}>
                  Generated {new Date(report.generatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} from {report.entryCount} logged days
                </p>
              </>
            )}
          </>
        )}
      </div>
    </Card>
  )
}
