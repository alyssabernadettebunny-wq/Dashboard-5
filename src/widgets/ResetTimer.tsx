import { useEffect, useRef, useState } from 'react'
import Card from '../components/Card'

const START_SECONDS = 15 * 60

export default function ResetTimer() {
  const [seconds, setSeconds] = useState(START_SECONDS)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s <= 1) {
            setRunning(false)
            return 0
          }
          return s - 1
        })
      }, 1000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [running])

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const label = `${mins}:${secs.toString().padStart(2, '0')}`

  return (
    <Card icon="⏱️" title="Home Reset Timer">
      <p style={{ fontSize: 32, fontWeight: 700, color: 'var(--purple-deep)', textAlign: 'center', margin: '6px 0' }}>
        {label}
      </p>
      <div className="c-input-row">
        <button
          onClick={() => setRunning((r) => !r)}
          style={{ flex: 1, background: running ? 'var(--pink-accent)' : 'var(--pink-pale)', color: running ? 'white' : 'var(--purple-heading)' }}
        >
          {running ? 'Pause' : seconds === 0 ? 'Done!' : 'Start'}
        </button>
        <button
          onClick={() => {
            setRunning(false)
            setSeconds(START_SECONDS)
          }}
        >
          Reset
        </button>
      </div>
    </Card>
  )
}
