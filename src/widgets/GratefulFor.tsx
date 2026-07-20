import { useState } from 'react'
import { useDailyArchive } from '../hooks/useDailyArchive'
import Card from '../components/Card'

export default function GratefulFor() {
  const [lines, setLines, history] = useDailyArchive('dashboard.gratefulfor', ['loving friends', 'good coffee', 'my little pups'])
  const [showHistory, setShowHistory] = useState(false)

  function updateLine(i: number, value: string) {
    setLines(lines.map((l, idx) => (idx === i ? value : l)))
  }

  function addLine() {
    setLines([...lines, ''])
  }

  return (
    <Card icon="📔" title="Today I'm Grateful For">
      <div className="grateful-list">
        {lines.map((line, i) => (
          <div key={i} className="grateful-line">
            <img className="grateful-heart-icon" src="/Dashboard-5/images/stitched-heart.png" alt="" />
            <input value={line} onChange={(e) => updateLine(i, e.target.value)} placeholder="something you're grateful for..." />
          </div>
        ))}
      </div>
      <button className="card-footer-btn" onClick={addLine}>
        + Add a line
      </button>
      {history.length > 0 && (
        <button className="card-footer-btn" style={{ marginLeft: 8 }} onClick={() => setShowHistory((v) => !v)}>
          {showHistory ? 'Hide past days' : 'View past days'}
        </button>
      )}
      {showHistory && (
        <ul className="c-list" style={{ marginTop: 8 }}>
          {history.map((h, i) => (
            <li key={i} className="c-list-item" style={{ alignItems: 'flex-start' }}>
              <div>
                <span className="sub" style={{ marginLeft: 0 }}>
                  {h.date}
                </span>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>
                  {h.value.filter(Boolean).join(', ') || 'nothing recorded'}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
