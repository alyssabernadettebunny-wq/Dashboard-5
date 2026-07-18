import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import './widgets.css'

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

export default function WorldFeed() {
  const [weather, setWeather] = useLocalStorage('dashboard.worldfeed.weather', {
    temp: '',
    condition: '',
  })

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
    setYoutube([
      { id: crypto.randomUUID(), channel, title: ytTitle.trim(), summary: ytSummary.trim() },
      ...youtube,
    ])
    setYtTitle('')
    setYtSummary('')
  }

  function removeYoutube(id: string) {
    setYoutube(youtube.filter((y) => y.id !== id))
  }

  return (
    <section className="widget widget-wide">
      <h2>World Feed</h2>
      <p className="feed-note">
        Manual for now — weather, K-pop releases, and YouTube updates will sync automatically once
        we wire up live data sources.
      </p>

      <div className="feed-columns">
        <div className="subcard">
          <h3>Weather</h3>
          <div className="weather-input">
            <input
              type="text"
              placeholder="Temp"
              value={weather.temp}
              onChange={(e) => setWeather({ ...weather, temp: e.target.value })}
            />
            <input
              type="text"
              placeholder="Condition"
              value={weather.condition}
              onChange={(e) => setWeather({ ...weather, condition: e.target.value })}
            />
          </div>
        </div>

        <div className="subcard">
          <h3>K-pop Releases</h3>
          <div className="task-input">
            <input
              type="text"
              placeholder="Artist / release"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
            />
            <input type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} />
            <button onClick={addKpop}>Add</button>
          </div>
          <ul className="feed-list">
            {kpop.length === 0 && <li className="empty">No releases tracked yet</li>}
            {kpop.map((k) => (
              <li key={k.id}>
                <span>{k.artist}</span>
                {k.date && <span className="reminder-date">{k.date}</span>}
                <button className="remove" onClick={() => removeKpop(k.id)} aria-label="Remove">
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="subcard">
          <h3>YouTube Updates</h3>
          <div className="youtube-input">
            <select value={channel} onChange={(e) => setChannel(e.target.value)}>
              <option>Dhar Mann</option>
              <option>Dhar Mann Bonus</option>
            </select>
            <input
              type="text"
              placeholder="Video title"
              value={ytTitle}
              onChange={(e) => setYtTitle(e.target.value)}
            />
            <input
              type="text"
              placeholder="1-2 line summary"
              value={ytSummary}
              onChange={(e) => setYtSummary(e.target.value)}
            />
            <button onClick={addYoutube}>Add</button>
          </div>
          <ul className="feed-list">
            {youtube.length === 0 && <li className="empty">No updates yet</li>}
            {youtube.map((y) => (
              <li key={y.id} className="youtube-item">
                <div>
                  <strong>{y.channel}</strong>: {y.title}
                  {y.summary && <p className="youtube-summary">{y.summary}</p>}
                </div>
                <button className="remove" onClick={() => removeYoutube(y.id)} aria-label="Remove">
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
