import { useEffect, useRef, useState } from 'react'

type Listener = () => void
const listeners = new Map<string, Set<Listener>>()

function subscribe(key: string, listener: Listener) {
  if (!listeners.has(key)) listeners.set(key, new Set())
  listeners.get(key)!.add(listener)
  return () => {
    listeners.get(key)?.delete(listener)
  }
}

function emit(key: string) {
  listeners.get(key)?.forEach((l) => l())
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key)
    return stored ? (JSON.parse(stored) as T) : initialValue
  })
  const serializedRef = useRef<string>(JSON.stringify(value))

  // Pick up changes written by other components/hook instances sharing this key.
  useEffect(() => {
    const unsubscribe = subscribe(key, () => {
      const stored = localStorage.getItem(key)
      if (stored !== null && stored !== serializedRef.current) {
        serializedRef.current = stored
        setValue(JSON.parse(stored) as T)
      }
    })
    return unsubscribe
  }, [key])

  // Persist our own changes and notify other instances, without re-triggering
  // ourselves for changes that originated from the subscription above.
  useEffect(() => {
    const serialized = JSON.stringify(value)
    if (serialized !== serializedRef.current) {
      serializedRef.current = serialized
      localStorage.setItem(key, serialized)
      emit(key)
    }
  }, [key, value])

  return [value, setValue] as const
}
