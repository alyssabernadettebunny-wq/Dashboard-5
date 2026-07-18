import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface Tool {
  id: string
  icon: string
  label: string
}

const DEFAULT_TOOLS: Tool[] = [
  { id: '1', icon: '🍃', label: 'Grounding' },
  { id: '2', icon: '🍵', label: 'Peppermint Tea' },
  { id: '3', icon: '🚿', label: 'Warm Shower' },
  { id: '4', icon: '🎧', label: 'Quiet / Alone Time' },
]

export default function RegulationTools() {
  const [tools, setTools] = useLocalStorage<Tool[]>('bodyweather.tools', DEFAULT_TOOLS)
  const [usedToday, setUsedToday] = useLocalStorage<string[]>('bodyweather.tools.usedToday', [])
  const [editMode, setEditMode] = useLocalStorage('bodyweather.tools.edit', false)

  function toggleUsed(id: string) {
    if (editMode) return
    setUsedToday(usedToday.includes(id) ? usedToday.filter((x) => x !== id) : [...usedToday, id])
  }

  function addTool() {
    const label = window.prompt('New tool name?')
    if (!label) return
    const icon = window.prompt('An emoji for it?', '✨') ?? '✨'
    setTools([...tools, { id: crypto.randomUUID(), icon, label }])
  }

  function removeTool(id: string) {
    setTools(tools.filter((t) => t.id !== id))
  }

  return (
    <Card icon="🫧" title="7. Regulation Tools">
      <p className="tools-subtitle">Today's Comforts ♡</p>
      <div className="tools-grid">
        {tools.map((tool) => (
          <button key={tool.id} className={`tool-tile ${usedToday.includes(tool.id) ? 'active' : ''}`} onClick={() => toggleUsed(tool.id)}>
            {editMode && (
              <span
                className="tool-remove"
                onClick={(e) => {
                  e.stopPropagation()
                  removeTool(tool.id)
                }}
              >
                ×
              </span>
            )}
            <span className="tool-icon">{tool.icon}</span>
            <span>{tool.label}</span>
          </button>
        ))}
      </div>
      <button
        className="tools-add-link"
        onClick={() => {
          if (editMode) addTool()
          else setEditMode(true)
        }}
      >
        {editMode ? '+ Add a tool' : 'Add or edit tools →'}
      </button>
      {editMode && (
        <button className="tools-add-link" onClick={() => setEditMode(false)}>
          Done editing
        </button>
      )}
    </Card>
  )
}
