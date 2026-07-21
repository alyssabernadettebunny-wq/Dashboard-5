import Card from '../components/Card'

interface Release {
  version: string
  items: string[]
}

const RELEASES: Release[] = [
  {
    version: '2.6.0',
    items: [
      'Full Cycle & Symptoms tracker: calendar, current phase, PMDD window, daily signals, symptoms-by-phase chart',
      'Sleep Overview, Sleep Details, and Weekly Sleep Trend widgets',
      'Mood & Energy Trend chart with tap-to-log mood faces',
    ],
  },
  {
    version: '2.5.0',
    items: [
      "Today's Rhythm rebuilt as a vertical timeline with icons",
      'New Anchor Tasks and upgraded This Week\'s Rhythm (checklists + mood + energy per day)',
      'Page now remembers where you were after a refresh',
    ],
  },
  {
    version: '2.4.0',
    items: [
      'Illustrated-planner visual pass: sticky-note, taped-paper, gingham, and scrapbook card styles',
      'Real pet portraits added throughout (Misa, Coco, Juno)',
      'Sparkle animation when checking things off',
    ],
  },
  {
    version: '2.3.0',
    items: [
      'Density & layout refactor: compact shell, masonry columns, deeper contrast',
      'Household Status Board colors and dropdown options overhauled',
    ],
  },
  {
    version: '2.0.0',
    items: [
      'Meds & Titration timezone fix and editable dose log',
      'Mood Check-In redesigned as an emoji timeline',
      'Weather and moon phase auto-updates added to World Feed',
    ],
  },
]

export default function WhatsNew() {
  return (
    <Card icon="🌀" title="What's New" meta={`Version ${RELEASES[0].version}`} variant="scrapbook" surface="lilac">
      <ul className="guide-list">
        {RELEASES.map((r) => (
          <li key={r.version} className="whatsnew-item">
            <p className="whatsnew-version">v{r.version}</p>
            <ul className="whatsnew-sublist">
              {r.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </Card>
  )
}
