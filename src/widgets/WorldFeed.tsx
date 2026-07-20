import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useWeather, useWeatherLocation } from '../hooks/useWeather'
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

async function geocodeCity(city: string) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Geocoding failed')
  const data = await res.json()
  const first = data.results?.[0]
  if (!first) throw new Error('City not found')
  return { lat: first.latitude, lon: first.longitude, label: `${first.name}, ${first.admin1 ?? first.country ?? ''}`.replace(/, $/, '') }
}

function WeatherSection() {
  const { weather, loading, error, refresh } = useWeather()
  const [, setCoords] = useWeatherLocation()
  const [cityInput, setCityInput] = useState('')
  const [geoError, setGeoError] = useState('')

  function useMyLocation() {
    if (!navigator.geolocation) {
      setGeoError('Location not available in this browser')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude, label: 'My location' }),
      () => setGeoError('Could not get your location — try setting a city instead'),
    )
  }

  async function setCity() {
    if (!cityInput.trim()) return
    try {
      const c = await geocodeCity(cityInput.trim())
      setCoords(c)
      setGeoError('')
      setCityInput('')
    } catch {
      setGeoError('Could not find that city')
    }
  }

  return (
    <div className="subsection">
      <p className="section-label" style={{ marginTop: 0 }}>
        Weather & Moon
      </p>
      {weather.temp ? (
        <>
          <div className="stat-row">
            <span>{weather.condition}</span>
            <span style={{ fontWeight: 700, fontSize: 15 }}>{weather.temp}</span>
          </div>
          <div className="stat-row">
            <span>Today</span>
            <span>
              ↑ {weather.todayHigh} ↓ {weather.todayLow}
            </span>
          </div>
          <div className="stat-row">
            <span>Moon</span>
            <span>
              {weather.moonPhase} ({weather.moonPct})
            </span>
          </div>
          <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '4px 0 0' }}>
            {weather.locationLabel}
            {weather.updatedAt && ` · updated ${new Date(weather.updatedAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`}
          </p>
          <button className="card-footer-btn" onClick={refresh} disabled={loading} style={{ marginTop: 6 }}>
            {loading ? 'Refreshing...' : 'Refresh now'}
          </button>
        </>
      ) : (
        <>
          <p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Set your location to get automatic weather updates.</p>
          <button className="card-footer-btn" onClick={useMyLocation}>
            Use my location
          </button>
          <div className="c-input-row" style={{ marginTop: 6 }}>
            <input type="text" placeholder="Or type a city..." value={cityInput} onChange={(e) => setCityInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && setCity()} />
            <button onClick={setCity}>Set</button>
          </div>
          {geoError && <p style={{ fontSize: 10.5, color: 'var(--pink-accent)', marginTop: 4 }}>{geoError}</p>}
        </>
      )}
      {error && <p style={{ fontSize: 10.5, color: 'var(--pink-accent)', marginTop: 4 }}>{error}</p>}
    </div>
  )
}

export default function WorldFeed() {
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

  const todayStr = new Date().toISOString().slice(0, 10)
  const monthStart = todayStr.slice(0, 8) + '01'
  const thisMonthKpop = kpop.filter((k) => k.date && k.date >= monthStart && k.date <= todayStr).sort((a, b) => a.date.localeCompare(b.date))
  const upcomingKpop = kpop.filter((k) => k.date && k.date > todayStr).sort((a, b) => a.date.localeCompare(b.date))
  const undatedKpop = kpop.filter((k) => !k.date)

  return (
    <Card icon="🌐" title="World Feed" wide>
      <div className="status-cols">
        <WeatherSection />

        <div className="subsection">
          <p className="section-label" style={{ marginTop: 0 }}>
            K-pop Releases
          </p>
          <div className="c-input-row">
            <input type="text" placeholder="Artist / release" value={artist} onChange={(e) => setArtist(e.target.value)} />
            <input type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} />
            <button onClick={addKpop}>Add</button>
          </div>
          {kpop.length === 0 && <p className="c-empty">No releases tracked yet</p>}
          {thisMonthKpop.length > 0 && (
            <>
              <p className="sub" style={{ marginLeft: 0, fontWeight: 700 }}>
                This month
              </p>
              <ul className="c-list">
                {thisMonthKpop.map((k) => (
                  <li key={k.id} className="c-list-item">
                    <span>{k.artist}</span>
                    <span className="sub">{k.date}</span>
                    <button className="remove" onClick={() => removeKpop(k.id)} aria-label="Remove">
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
          {upcomingKpop.length > 0 && (
            <>
              <p className="sub" style={{ marginLeft: 0, fontWeight: 700 }}>
                Upcoming
              </p>
              <ul className="c-list">
                {upcomingKpop.map((k) => (
                  <li key={k.id} className="c-list-item">
                    <span>{k.artist}</span>
                    <span className="sub">{k.date}</span>
                    <button className="remove" onClick={() => removeKpop(k.id)} aria-label="Remove">
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
          {undatedKpop.length > 0 && (
            <ul className="c-list">
              {undatedKpop.map((k) => (
                <li key={k.id} className="c-list-item">
                  <span>{k.artist}</span>
                  <button className="remove" onClick={() => removeKpop(k.id)} aria-label="Remove">
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
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
            {youtube.slice(0, 4).map((y) => (
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
          {youtube.length > 4 && <p className="sub" style={{ marginLeft: 0 }}>+{youtube.length - 4} more saved</p>}
        </div>
      </div>
    </Card>
  )
}
