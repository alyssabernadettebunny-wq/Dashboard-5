import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import './widgets.css'

interface Task {
  id: string
  text: string
  done: boolean
}

export default function TasksWidget() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('dashboard.tasks', [])
  const [text, setText] = useState('')

  function addTask() {
    const trimmed = text.trim()
    if (!trimmed) return
    setTasks([...tasks, { id: crypto.randomUUID(), text: trimmed, done: false }])
    setText('')
  }

  function toggleTask(id: string) {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  }

  function removeTask(id: string) {
    setTasks(tasks.filter((t) => t.id !== id))
  }

  return (
    <section className="widget">
      <h2>Tasks</h2>
      <div className="task-input">
        <input
          type="text"
          value={text}
          placeholder="Add a task..."
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
        />
        <button onClick={addTask}>Add</button>
      </div>
      <ul className="task-list">
        {tasks.length === 0 && <li className="empty">No tasks yet</li>}
        {tasks.map((task) => (
          <li key={task.id} className={task.done ? 'done' : ''}>
            <label>
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => toggleTask(task.id)}
              />
              <span>{task.text}</span>
            </label>
            <button className="remove" onClick={() => removeTask(task.id)} aria-label="Remove task">
              ×
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
