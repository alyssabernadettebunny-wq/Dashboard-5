import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import './widgets.css'

interface Link {
  id: string
  label: string
  url: string
}

function normalizeUrl(url: string) {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}

export default function LinksWidget() {
  const [links, setLinks] = useLocalStorage<Link[]>('dashboard.links', [])
  const [label, setLabel] = useState('')
  const [url, setUrl] = useState('')

  function addLink() {
    const trimmedLabel = label.trim()
    const trimmedUrl = url.trim()
    if (!trimmedLabel || !trimmedUrl) return
    setLinks([
      ...links,
      { id: crypto.randomUUID(), label: trimmedLabel, url: normalizeUrl(trimmedUrl) },
    ])
    setLabel('')
    setUrl('')
  }

  function removeLink(id: string) {
    setLinks(links.filter((l) => l.id !== id))
  }

  return (
    <section className="widget">
      <h2>Quick Links</h2>
      <div className="link-input">
        <input
          type="text"
          value={label}
          placeholder="Label"
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addLink()}
        />
        <input
          type="text"
          value={url}
          placeholder="URL"
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addLink()}
        />
        <button onClick={addLink}>Add</button>
      </div>
      <ul className="link-list">
        {links.length === 0 && <li className="empty">No links yet</li>}
        {links.map((link) => (
          <li key={link.id}>
            <a href={link.url} target="_blank" rel="noreferrer">
              {link.label}
            </a>
            <button className="remove" onClick={() => removeLink(link.id)} aria-label="Remove link">
              ×
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
