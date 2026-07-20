import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

const THEMES = [
  { id: 'default', label: 'Pink & Lavender', swatch: ['#f5a9c8', '#e9d5f5'] },
  { id: 'mint', label: 'Mint & Sky', swatch: ['#7fc9c1', '#cdeee6'] },
  { id: 'peach', label: 'Sunset Peach', swatch: ['#f2977a', '#ffe0cc'] },
]

export function useAppTheme() {
  return useLocalStorage('settings.theme', 'default')
}

export default function ThemePicker() {
  const [theme, setTheme] = useAppTheme()

  return (
    <Card icon="🎨" title="Accent Theme" meta="Changes the whole app's colors">
      <div className="theme-row">
        {THEMES.map((t) => (
          <button key={t.id} className={`theme-swatch ${theme === t.id ? 'active' : ''}`} onClick={() => setTheme(t.id)}>
            <span className="theme-swatch-colors">
              <span style={{ background: t.swatch[0] }} />
              <span style={{ background: t.swatch[1] }} />
            </span>
            {t.label}
          </button>
        ))}
      </div>
    </Card>
  )
}
