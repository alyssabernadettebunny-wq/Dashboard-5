import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface Prompt {
  type: 'reflect' | 'fact'
  text: string
}

const PROMPTS: Prompt[] = [
  { type: 'reflect', text: 'What made you smile today?' },
  { type: 'fact', text: 'Octopuses have three hearts, and two of them stop beating when they swim.' },
  { type: 'reflect', text: "What's one small thing you're proud of this week?" },
  { type: 'fact', text: 'Honey never spoils — archaeologists have found edible honey in ancient Egyptian tombs.' },
  { type: 'reflect', text: 'Who made your day a little better recently?' },
  { type: 'fact', text: 'A group of flamingos is called a "flamboyance."' },
  { type: 'reflect', text: 'What are you looking forward to?' },
  { type: 'fact', text: 'Bananas are berries, but strawberries technically are not.' },
  { type: 'reflect', text: 'What would you tell yourself from a year ago?' },
  { type: 'fact', text: 'Sea otters hold hands while sleeping so they don’t drift apart.' },
  { type: 'reflect', text: 'What does your ideal cozy evening look like?' },
  { type: 'fact', text: 'A day on Venus is longer than a year on Venus.' },
  { type: 'reflect', text: "What's a small comfort that always helps?" },
  { type: 'fact', text: 'Wombats poop in cubes so it doesn’t roll away.' },
  { type: 'reflect', text: 'What would make today feel like a win?' },
  { type: 'fact', text: 'A shrimp’s heart is located in its head.' },
  { type: 'reflect', text: 'What’s something you used to worry about that doesn’t bother you anymore?' },
  { type: 'fact', text: 'Butterflies taste with their feet.' },
  { type: 'reflect', text: 'Who do you want to check in on this week?' },
  { type: 'fact', text: 'Cows have best friends and get stressed when separated from them.' },
  { type: 'reflect', text: 'What’s a tiny luxury you could give yourself today?' },
  { type: 'fact', text: 'It rains diamonds on Neptune and Uranus.' },
]

function todayIndex() {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
  return dayOfYear % PROMPTS.length
}

const TYPE_LABEL: Record<Prompt['type'], string> = { reflect: 'Reflection', fact: 'Fun Fact' }
const TYPE_ICON: Record<Prompt['type'], string> = { reflect: '💭', fact: '✨' }

export default function FunPrompts() {
  const [index, setIndex] = useState(todayIndex())
  const [answer, setAnswer] = useLocalStorage(`spark.prompt.answer.${index}`, '')
  const prompt = PROMPTS[index]

  function shuffle() {
    setIndex((prev) => {
      let next = Math.floor(Math.random() * PROMPTS.length)
      while (next === prev && PROMPTS.length > 1) next = Math.floor(Math.random() * PROMPTS.length)
      return next
    })
  }

  return (
    <Card icon="🎲" title="Fun Prompts" meta={TYPE_LABEL[prompt.type]}>
      <div className="tarot-card">
        <div className="tarot-visual">
          <span className="star">{TYPE_ICON[prompt.type]}</span>
        </div>
        <div className="tarot-details">
          <p className="tarot-meaning" style={{ fontSize: 13 }}>
            {prompt.text}
          </p>
        </div>
      </div>
      {prompt.type === 'reflect' && (
        <textarea
          className="c-textarea"
          placeholder="Jot down your answer (optional)..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
      )}
      <button className="card-footer-btn" onClick={shuffle}>
        Surprise me again 🎲
      </button>
    </Card>
  )
}
