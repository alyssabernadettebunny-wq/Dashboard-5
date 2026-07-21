import { useState } from 'react'
import Card from '../components/Card'

interface GuideSection {
  icon: string
  title: string
  body: string[]
}

const SECTIONS: GuideSection[] = [
  {
    icon: '🌱',
    title: 'Getting Started',
    body: [
      "This dashboard is organized into pages along the left sidebar: Today, Rhythm, Body Weather, Home, Girls, Pets, Food, Money, Notes, Spark, and More.",
      'Everything you type is saved automatically to your browser as you go — there\'s no save button, and nothing is sent anywhere.',
      "Most widgets that reset daily (habits, meds, mood, dogs' care) roll over at 5am, so late-night entries still count as \"today.\"",
    ],
  },
  {
    icon: '🧩',
    title: 'How to Use Modules',
    body: [
      'Cards with a "+ Add" row let you add new items — habits, tasks, notes, dogs, family reminders, and more.',
      'A small × next to an item removes it. There\'s no confirmation step, so double-check before removing something you want to keep.',
      'Widgets that log history (Meds & Titration, Dogs, Sleep, Mood) have a "View past days" button to see what you logged before.',
      'On the Today page, use Display Preferences (More → Settings) to hide any widget you don\'t want to see.',
    ],
  },
  {
    icon: '✨',
    title: 'Tips & Tricks',
    body: [
      'The header mascot alternates between Misa and Coco each day — or set it to always show one in More → Settings → Companion.',
      'Checking off any box gives a little sparkle ✦ pop, just for fun.',
      'The Tarot Pull locks once you\'ve pulled for the day, so the card stays the same until tomorrow.',
      'The Cycle Calendar lets you tap any day to mark it "logged" (heart icon) separately from the automatic period/fertile/ovulation coloring.',
    ],
  },
  {
    icon: '⌨️',
    title: 'Keyboard Shortcuts',
    body: [
      'Press Enter inside most "add" text fields to submit, instead of clicking the Add button.',
      'There are no other global keyboard shortcuts yet — this dashboard is built for clicking and tapping.',
    ],
  },
]

export default function AppGuide() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <Card icon="📘" title="App Guide" meta="Learn & explore" variant="tapedPaper" surface="cream">
      <ul className="guide-list">
        {SECTIONS.map((s, i) => (
          <li key={s.title} className="guide-item">
            <button className="guide-item-row" onClick={() => setOpenIndex(openIndex === i ? null : i)}>
              <span>
                {s.icon} {s.title}
              </span>
              <span className="guide-chevron">{openIndex === i ? '⌄' : '›'}</span>
            </button>
            {openIndex === i && (
              <div className="guide-body">
                {s.body.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
      <button className="card-footer-btn" onClick={() => setOpenIndex(openIndex === null ? 0 : null)}>
        {openIndex === null ? 'Open guide →' : 'Close guide'}
      </button>
    </Card>
  )
}
