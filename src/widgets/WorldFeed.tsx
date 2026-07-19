import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface KpopRelease {
  id: string
  artist: string
  date: string
}

interface YoutubeUpdate {
  id: string
  channel: string
  title: string
  summary: string
}

interface Weather {
  temp: string
  condition: string
  todayHigh: string
  todayLow: string
  tonightHigh: string
  tonightLow: string
  moonPhase: string
  moonPct: string
}

const DEFAULT_WEATHER: Weather = {
  temp: '',
  condition: '',
  todayHigh: '',
  todayLow: '',
  tonightHigh: '',
  tonightLow: '',
  moonPhase: '',
  moonPct: '',
}

export default function WorldFeed() {
  const [weather, setWeather] = useLocalStorage<Weather>('dashboard.worldfeed.weather', DEFAULT_WEATHER)

  const [kpop, setKpop] = useLocalStorage<KpopRelease[]>('dashboard.worldfeed.kpop', [])
  const [artist, setArtist] = useState('')
  const [releaseDate, setReleaseDate] = useState('')

  const [youtube, setYoutube] = useLocalStorage<YoutubeUpdate[]>('dashboard.worldfeed.youtube', [])
  const [channel, setChannel] = useState('Dhar Mann')
  const [ytTitle, setYtTitle] = useState('')
  const [ytSummary, setYtSummary] = useState('')

  function addKpop() {
    if (!artist.trim()) return
    setKpop([...kpop, { id: crypto.randomUUID(), artist: artist.trim(), date: releaseDate }])
    setArtist('')
    setReleaseDate('')
  }

  function removeKpop(id: string) {
    setKpop(kpop.filter((k) => k.id !== id))
  }

  function addYoutube() {
    if (!ytTitle.trim()) return
    setYoutube([{ id: crypto.randomUUID(), channel, title: ytTitle.trim(), summary: ytSummary.trim() }, ...youtube])
    setYtTitle('')
    setYtSummary('')
  }

  function removeYoutube(id: string) {
    setYoutube(youtube.filter((y) => y.id !== id))
  }

  return (
    <Card icon="🌐" title="World Feed" wide>
      <p style={{ fontSize: 11.5, color: 'var(--text-muted)', fontStyle: 'italic' }}>
        Manual for now — weather, K-pop releases, and YouTube updates will sync automatically once we wire up
        live data sources.
      </p>

      <div className="status-cols">
        <div className="subsection">
          <p className="section-label" style={{ marginTop: 0 }}>
            Weather & Moon
          </p>
          <div className="c-input-row">
            <input type="text" placeholder="Temp" value={weather.temp} onChange={(e) => setWeather({ ...weather, temp: e.target.value })} />
            <input
              type="text"
              placeholder="Condition"
              value={weather.condition}
              onChange={(e) => setWeather({ ...weather, condition: e.target.value })}
            />
          </div>
          <div className="stat-row">
            <span>Today</span>
            <span style={{ display: 'flex', gap: 6 }}>
              ↑
              <input
                type="text"
                placeholder="24°"
                value={weather.todayHigh}
                onChange={(e) => setWeather({ ...weather, todayHigh: e.target.value })}
                style={{ width: 36, border: 'none', background: 'transparent', font: 'inherit', color: 'inherit' }}
              />
              ↓
              <input
                type="text"
                placeholder="14°"
                value={weather.todayLow}
                onChange={(e) => setWeather({ ...weather, todayLow: e.target.value })}
                style={{ width: 36, border: 'none', background: 'transparent', font: 'inherit', color: 'inherit' }}
              />
            </span>
          </div>
          <div className="stat-row">
            <span>Tonight</span>
            <span style={{ display: 'flex', gap: 6 }}>
              ↑
              <input
                type="text"
                placeholder="17°"
                value={weather.tonightHigh}
                onChange={(e) => setWeather({ ...weather, tonightHigh: e.target.value })}
                style={{ width: 36, border: 'none', background: 'transparent', font: 'inherit', color: 'inherit' }}
              />
              ↓
              <input
                type="text"
                placeholder="12°"
                value={weather.tonightLow}
                onChange={(e) => setWeather({ ...weather, tonightLow: e.target.value })}
                style={{ width: 36, border: 'none', background: 'transparent', font: 'inherit', color: 'inherit' }}
              />
            </span>
          </div>
          <div className="c-input-row">
            <input type="text" placeholder="Moon phase (e.g. Waning Crescent)" value={weather.moonPhase} onChange={(e) => setWeather({ ...weather, moonPhase: e.target.value })} />
            <input
              type="text"
              placeholder="18%"
              value={weather.moonPct}
              onChange={(e) => setWeather({ ...weather, moonPct: e.target.value })}
              style={{ maxWidth: 60 }}
            />
          </div>
        </div>

        <div className="subsection">
          <p className="section-label" style={{ marginTop: 0 }}>
            K-pop Releases
          </p>
          <div className="c-input-row">
            <input type="text" placeholder="Artist / release" value={artist} onChange={(e) => setArtist(e.target.value)} />
            <input type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} />
            <button onClick={addKpop}>Add</button>
          </div>
          <ul className="c-list">
            {kpop.length === 0 && <li className="c-empty">No releases tracked yet</li>}
            {kpop.map((k) => (
              <li key={k.id} className="c-list-item">
                <span>{k.artist}</span>
                {k.date && <span className="sub">{k.date}</span>}
                <button className="remove" onClick={() => removeKpop(k.id)} aria-label="Remove">
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="subsection">
          <p className="section-label" style={{ marginTop: 0 }}>
            YouTube Updates
          </p>
          <div className="c-input-row" style={{ flexDirection: 'column' }}>
            <select value={channel} onChange={(e) => setChannel(e.target.value)}>
              <option>Dhar Mann</option>
              <option>Dhar Mann Bonus</option>
            </select>
            <input type="text" placeholder="Video title" value={ytTitle} onChange={(e) => setYtTitle(e.target.value)} />
            <input type="text" placeholder="1-2 line summary" value={ytSummary} onChange={(e) => setYtSummary(e.target.value)} />
            <button onClick={addYoutube}>Add</button>
          </div>
          <ul className="c-list">
            {youtube.length === 0 && <li className="c-empty">No updates yet</li>}
            {youtube.map((y) => (
              <li key={y.id} className="c-list-item" style={{ alignItems: 'flex-start' }}>
                <div>
                  <strong style={{ fontSize: 12 }}>{y.channel}</strong>: {y.title}
                  {y.summary && <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>{y.summary}</p>}
                </div>
                <button className="remove" onClick={() => removeYoutube(y.id)} aria-label="Remove">
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
