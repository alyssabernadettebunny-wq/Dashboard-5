import { useLocalStorage } from '../hooks/useLocalStorage'
import { isLogicalToday, logicalDateKey } from '../lib/logicalDate'
import Card from '../components/Card'

interface TarotCard {
  roman: string
  name: string
  meaning: string
  affirmation: string
}

interface QuickNote {
  id: string
  text: string
  time: string
}

interface PulledCard {
  date: string
  index: number
}

const DECK: TarotCard[] = [
  { roman: 'XVII', name: 'The Star', meaning: 'Hope, healing, and dreams are aligning.', affirmation: "I trust the path I'm on." },
  { roman: 'VI', name: 'The Lovers', meaning: 'A choice made from the heart, in alignment with your values.', affirmation: 'I choose what feels true to me.' },
  { roman: 'X', name: 'Wheel of Fortune', meaning: 'A turning point. Change is already in motion.', affirmation: 'I flow with what changes.' },
  { roman: 'IX', name: 'The Hermit', meaning: 'A quiet moment of reflection is calling you inward.', affirmation: 'I trust my own guidance.' },
  { roman: 'III', name: 'The Empress', meaning: 'Nurture yourself the way you nurture everyone else.', affirmation: 'I deserve softness too.' },
  { roman: 'XIX', name: 'The Sun', meaning: 'Joy, warmth, and clarity are close by today.', affirmation: 'I let myself feel good.' },
  { roman: 'XIV', name: 'Temperance', meaning: 'Balance is the answer, not extremes.', affirmation: 'I find my middle ground.' },
  { roman: 'XI', name: 'Justice', meaning: 'A fair, honest look at where you stand.', affirmation: 'I see clearly and act fairly.' },
  { roman: 'XVIII', name: 'The Moon', meaning: 'Trust your intuition even when things feel unclear.', affirmation: 'I honor what I feel, even unexplained.' },
  { roman: 'XXI', name: 'The World', meaning: 'A cycle completing. Give yourself credit.', affirmation: 'I have come so far.' },
  { roman: 'I', name: 'The Magician', meaning: 'You have everything you need to start right now.', affirmation: 'I have what it takes.' },
  { roman: 'II', name: 'The High Priestess', meaning: 'Sit with the quiet knowing before you speak or act.', affirmation: 'I trust my inner voice.' },
  { roman: 'VII', name: 'The Chariot', meaning: 'Steady focus will carry you through today.', affirmation: 'I move forward with purpose.' },
  { roman: 'VIII', name: 'Strength', meaning: 'Gentleness is its own kind of powerful today.', affirmation: 'I am soft and strong at once.' },
  { roman: 'XII', name: 'The Hanged Man', meaning: 'A pause is not a setback — let yourself wait.', affirmation: 'I am at peace with pausing.' },
  { roman: 'ACE', name: 'Ace of Cups', meaning: 'A fresh wave of feeling or connection is opening up.', affirmation: 'I welcome new tenderness.' },
]

export default function TarotPull() {
  const [pulled, setPulled] = useLocalStorage<PulledCard | null>('dashboard.tarot.pulled', null)
  const [notes, setNotes] = useLocalStorage<QuickNote[]>('dashboard.quickcapture', [])

  const pulledToday = pulled && isLogicalToday(pulled.date + 'T12:00:00') ? pulled : null
  const card = pulledToday ? DECK[pulledToday.index] : null

  function pullToday() {
    if (pulledToday) return
    const index = Math.floor(Math.random() * DECK.length)
    setPulled({ date: logicalDateKey(), index })
  }

  function journalAboutIt() {
    if (!card) return
    const time = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    setNotes([{ id: crypto.randomUUID(), text: `Tarot pull: ${card.name} — `, time }, ...notes])
  }

  return (
    <Card icon="🔮" title="Tarot Pull / Intuition">
      {card ? (
        <>
          <div className="tarot-card">
            <div className="tarot-visual">
              <span className="roman">{card.roman}</span>
              <span className="star">✦</span>
              <span>{card.name.toUpperCase()}</span>
            </div>
            <div className="tarot-details">
              <p className="tarot-name">Today's Pull: {card.name}</p>
              <p className="tarot-meaning">{card.meaning}</p>
              <p className="tarot-affirmation">Affirmation: {card.affirmation}</p>
            </div>
          </div>
          <div className="c-input-row">
            <button onClick={journalAboutIt}>Journal about it ♡</button>
          </div>
          <p style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 4 }}>Come back tomorrow for a new pull.</p>
        </>
      ) : (
        <>
          <div className="tarot-card">
            <div className="tarot-visual tarot-visual-facedown">
              <span className="star">✦</span>
            </div>
            <div className="tarot-details">
              <p className="tarot-name">You haven't pulled today's card yet.</p>
              <p className="tarot-meaning">One pull a day — make it count.</p>
            </div>
          </div>
          <div className="c-input-row">
            <button onClick={pullToday}>Pull today's card 🔮</button>
          </div>
        </>
      )}
    </Card>
  )
}
