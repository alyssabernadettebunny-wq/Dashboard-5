import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

export default function BehaviorNotes() {
  const [misaNotes, setMisaNotes] = useLocalStorage(
    'pets.misa.behavior',
    'Playful & curious! Loves tug & puzzle toys. Still mouthy when excited—redirecting helps.',
  )
  const [cocoNotes, setCocoNotes] = useLocalStorage(
    'pets.coco.behavior',
    'Calm & affectionate. Enjoys short walks and sunbathing. Gets excited for treat time!',
  )
  const [footer, setFooter] = useLocalStorage('pets.behavior.footer', 'Both happiest when they\'re together. 😽')

  return (
    <Card icon="💗" title="Behavior Notes">
      <div className="behavior-cols">
        <div className="behavior-card">
          <p className="section-label" style={{ marginTop: 0 }}>
            🐾 Misa
          </p>
          <textarea value={misaNotes} onChange={(e) => setMisaNotes(e.target.value)} />
        </div>
        <div className="behavior-card">
          <p className="section-label" style={{ marginTop: 0 }}>
            🐾 Coco
          </p>
          <textarea value={cocoNotes} onChange={(e) => setCocoNotes(e.target.value)} />
        </div>
      </div>
      <div className="card-aphorism">
        <input value={footer} onChange={(e) => setFooter(e.target.value)} />
      </div>
    </Card>
  )
}
