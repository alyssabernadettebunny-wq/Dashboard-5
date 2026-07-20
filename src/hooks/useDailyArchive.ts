import { useEffect, useRef } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { logicalDateKey } from '../lib/logicalDate'

interface ArchiveEntry<T> {
  date: string
  value: T
}

export function useDailyArchive<T>(key: string, defaultValue: T) {
  const [value, setValue] = useLocalStorage<T>(key, defaultValue)
  const [day, setDay] = useLocalStorage(`${key}.day`, logicalDateKey())
  const [history, setHistory] = useLocalStorage<ArchiveEntry<T>[]>(`${key}.history`, [])
  const archivedRef = useRef(false)

  useEffect(() => {
    const today = logicalDateKey()
    if (day !== today && !archivedRef.current) {
      archivedRef.current = true
      setHistory((prev) => [{ date: day, value }, ...prev])
      setValue(defaultValue)
      setDay(today)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day])

  return [value, setValue, history] as const
}
