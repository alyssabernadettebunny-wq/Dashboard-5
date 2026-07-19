import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

export default function GratefulFor() {
  const [lines, setLines] = useLocalStorage('dashboard.gratefulfor', ['loving friends', 'good coffee', 'my little pups'])

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
            <span>♡</span>
            <input value={line} onChange={(e) => updateLine(i, e.target.value)} placeholder="something you're grateful for..." />
          </div>
        ))}
      </div>
      <button className="card-footer-btn" onClick={addLine}>
        + Add a line
      </button>
    </Card>
  )
}
