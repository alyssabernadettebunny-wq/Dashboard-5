import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
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
]

function todayIndex() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  return dayOfYear % DECK.length
}

export default function TarotPull() {
  const [index, setIndex] = useState(todayIndex())
  const [notes, setNotes] = useLocalStorage<QuickNote[]>('dashboard.quickcapture', [])
  const card = DECK[index]

  function pullNew() {
    setIndex((prev) => {
      let next = Math.floor(Math.random() * DECK.length)
      while (next === prev && DECK.length > 1) next = Math.floor(Math.random() * DECK.length)
      return next
    })
  }

  function journalAboutIt() {
    const time = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    setNotes([{ id: crypto.randomUUID(), text: `Tarot pull: ${card.name} — `, time }, ...notes])
  }

  return (
    <Card icon="🔮" title="Tarot Pull / Intuition">
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
        <button onClick={pullNew}>Pull a new card 🔮</button>
        <button onClick={journalAboutIt}>Journal about it ♡</button>
      </div>
    </Card>
  )
}
