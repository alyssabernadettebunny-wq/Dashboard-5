import { useEffect, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface AutoDeal {
  category: string
  type: string
  store: string
  title: string
  description: string
  link: string
}

interface AutoDealsData {
  updatedAt: string
  deals: AutoDeal[]
}

interface TrackedDeal extends AutoDeal {
  id: string
  addedAt: string
  claimed: boolean
}

const CATEGORIES = [
  { key: 'all', label: 'All', icon: '✨' },
  { key: 'skin', label: 'Skin care', icon: '🧴' },
  { key: 'kbeauty', label: 'K-beauty', icon: '🎎' },
  { key: 'hair', label: 'Hair care', icon: '💇‍♀️' },
  { key: 'makeup', label: 'Makeup', icon: '💄' },
  { key: 'body', label: 'Body care', icon: '🛁' },
]

const TYPES: Record<string, { label: string; icon: string }> = {
  'free-trial': { label: 'Free trial', icon: '🎁' },
  'free-sample': { label: 'Free sample', icon: '🧪' },
  deal: { label: 'Deal', icon: '🏷️' },
  'sale-event': { label: 'Sale event', icon: '📣' },
  clearance: { label: 'Clearance', icon: '🔥' },
}

function useAutoDeals() {
  const [data, setData] = useState<AutoDealsData | null>(null)
  useEffect(() => {
    fetch('/Dashboard-5/data/beauty-deals.json')
      .then((r) => (r.ok ? r.json() : null))
      .then(setData)
      .catch(() => setData(null))
  }, [])
  return data
}

export default function BeautyDeals() {
  const autoDeals = useAutoDeals()
  const [tracked, setTracked] = useLocalStorage<TrackedDeal[]>('spark.beautydeals.tracked', [])
  const [category, setCategory] = useState('all')

  const [store, setStore] = useState('')
  const [title, setTitle] = useState('')
  const [link, setLink] = useState('')
  const [manualCategory, setManualCategory] = useState('skin')
  const [manualType, setManualType] = useState('deal')

  function addManual() {
    if (!store.trim() && !title.trim()) return
    setTracked([
      ...tracked,
      {
        id: crypto.randomUUID(),
        category: manualCategory,
        type: manualType,
        store: store.trim(),
        title: title.trim(),
        description: '',
        link: link.trim(),
        addedAt: new Date().toISOString(),
        claimed: false,
      },
    ])
    setStore('')
    setTitle('')
    setLink('')
  }

  function trackAuto(d: AutoDeal) {
    if (tracked.some((t) => t.store === d.store && t.title === d.title)) return
    setTracked([
      ...tracked,
      { ...d, id: crypto.randomUUID(), addedAt: new Date().toISOString(), claimed: false },
    ])
  }

  function toggleClaimed(id: string) {
    setTracked(tracked.map((t) => (t.id === id ? { ...t, claimed: !t.claimed } : t)))
  }

  function removeTracked(id: string) {
    setTracked(tracked.filter((t) => t.id !== id))
  }

  const filteredAuto = (autoDeals?.deals ?? []).filter((d) => category === 'all' || d.category === category)
  const filteredTracked = tracked.filter((t) => category === 'all' || t.category === category)

  return (
    <Card
      icon="💄"
      title="Beauty Deals & Freebies"
      meta={autoDeals ? `Updated ${new Date(autoDeals.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}` : undefined}
      wide
    >
      <p style={{ fontSize: 11.5, color: 'var(--text-body)', margin: '0 0 8px' }}>
        Free trials, free samples, deals & steep sales across hair, skin, K-beauty, body & makeup — ask me to refresh this list anytime for the latest finds.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            className="card-footer-btn"
            onClick={() => setCategory(c.key)}
            type="button"
            style={
              category === c.key
                ? { background: 'var(--pink-accent)', color: '#fff', borderColor: 'var(--pink-accent)' }
                : undefined
            }
          >
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      <div className="status-cols">
        <div className="subsection">
          <p className="section-label" style={{ marginTop: 0 }}>
            Found for you
          </p>
          {filteredAuto.length === 0 && <p className="c-empty">No deals loaded for this category yet</p>}
          <ul className="c-list">
            {filteredAuto.map((d, i) => (
              <li key={i} className="c-list-item" style={{ alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div>
                    <b>{TYPES[d.type]?.icon ?? '🏷️'} {d.store}</b> — {d.title}
                  </div>
                  {d.description && (
                    <div style={{ color: 'var(--text-body)', fontSize: 11, whiteSpace: 'normal' }}>{d.description}</div>
                  )}
                  {d.link && (
                    <a href={d.link} target="_blank" rel="noreferrer" style={{ color: 'var(--purple-heading)', fontSize: 11, fontWeight: 600 }}>
                      View offer ↗
                    </a>
                  )}
                </div>
                <button className="card-footer-btn" style={{ flexShrink: 0 }} onClick={() => trackAuto(d)}>
                  + Track
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="subsection">
          <p className="section-label" style={{ marginTop: 0 }}>
            My tracked deals
          </p>
          <div className="c-input-row">
            <select value={manualCategory} onChange={(e) => setManualCategory(e.target.value)}>
              {CATEGORIES.filter((c) => c.key !== 'all').map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </select>
            <select value={manualType} onChange={(e) => setManualType(e.target.value)}>
              {Object.entries(TYPES).map(([key, t]) => (
                <option key={key} value={key}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="c-input-row" style={{ marginTop: 4 }}>
            <input type="text" placeholder="Store / brand" value={store} onChange={(e) => setStore(e.target.value)} />
            <input type="text" placeholder="What's the deal?" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="c-input-row" style={{ marginTop: 4 }}>
            <input type="text" placeholder="Link (optional)" value={link} onChange={(e) => setLink(e.target.value)} />
            <button onClick={addManual}>Add</button>
          </div>

          {filteredTracked.length === 0 && <p className="c-empty">Nothing tracked in this category yet</p>}
          <ul className="c-list">
            {filteredTracked.map((t) => (
              <li key={t.id} className={`c-list-item ${t.claimed ? 'struck' : ''}`} style={{ alignItems: 'flex-start' }}>
                <input type="checkbox" checked={t.claimed} onChange={() => toggleClaimed(t.id)} title="Mark as claimed" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div>
                    <b>{TYPES[t.type]?.icon ?? '🏷️'} {t.store}</b>
                    {t.title && ` — ${t.title}`}
                  </div>
                  {t.link && (
                    <a href={t.link} target="_blank" rel="noreferrer" style={{ color: 'var(--purple-heading)', fontSize: 11, fontWeight: 600 }}>
                      View offer ↗
                    </a>
                  )}
                </div>
                <button className="remove" style={{ flexShrink: 0 }} onClick={() => removeTracked(t.id)} aria-label="Remove">
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  )
}
