import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface Project {
  id: string
  name: string
  type: string
  status: 'Idea' | 'In Progress' | 'Done'
  notes: string
}

const TYPES = ['Craft / DIY', 'Writing', 'Digital / Art', 'Other']
const STATUSES: Project['status'][] = ['Idea', 'In Progress', 'Done']
const STATUS_COLOR: Record<Project['status'], string> = {
  Idea: 'var(--warn-yellow)',
  'In Progress': 'var(--purple-pill)',
  Done: 'var(--success-green)',
}

export default function CreativeProjects() {
  const [projects, setProjects] = useLocalStorage<Project[]>('spark.projects', [])
  const [name, setName] = useState('')
  const [type, setType] = useState(TYPES[0])

  function addProject() {
    if (!name.trim()) return
    setProjects([...projects, { id: crypto.randomUUID(), name: name.trim(), type, status: 'Idea', notes: '' }])
    setName('')
  }

  function updateProject(id: string, patch: Partial<Project>) {
    setProjects(projects.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }

  function removeProject(id: string) {
    setProjects(projects.filter((p) => p.id !== id))
  }

  return (
    <Card icon="🎨" title="Creative Projects" wide>
      <div className="c-input-row">
        <input type="text" placeholder="What are you making?" value={name} onChange={(e) => setName(e.target.value)} />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          {TYPES.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        <button onClick={addProject}>Add</button>
      </div>
      <ul className="c-list">
        {projects.length === 0 && <li className="c-empty">No projects yet — add whatever you're into this week</li>}
        {projects.map((p) => (
          <li key={p.id} className="c-list-item" style={{ alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <strong style={{ fontSize: 12 }}>{p.name}</strong>
              <span className="sub" style={{ marginLeft: 8 }}>
                {p.type}
              </span>
              <input
                type="text"
                placeholder="Notes..."
                value={p.notes}
                onChange={(e) => updateProject(p.id, { notes: e.target.value })}
                style={{ display: 'block', width: '100%', marginTop: 4, border: 'none', background: 'transparent', fontSize: 11, color: 'var(--text-muted)' }}
              />
            </div>
            <select
              value={p.status}
              onChange={(e) => updateProject(p.id, { status: e.target.value as Project['status'] })}
              style={{ background: STATUS_COLOR[p.status], border: 'none', borderRadius: 8, padding: '3px 6px', fontSize: 11, fontWeight: 600 }}
            >
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <button className="remove" onClick={() => removeProject(p.id)} aria-label="Remove">
              ×
            </button>
          </li>
        ))}
      </ul>
    </Card>
  )
}
