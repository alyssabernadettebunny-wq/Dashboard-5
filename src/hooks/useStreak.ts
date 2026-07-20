import { useLocalStorage } from './useLocalStorage'

interface StreakData {
  count: number
  lastDate: string
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function yesterdayKey() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

export function useStreak(storageKey: string) {
  const [data, setData] = useLocalStorage<StreakData>(storageKey, { count: 0, lastDate: '' })

  function markToday() {
    const today = todayKey()
    if (data.lastDate === today) return
    const isConsecutive = data.lastDate === yesterdayKey()
    setData({ count: isConsecutive ? data.count + 1 : 1, lastDate: today })
  }

  const active = data.lastDate === todayKey()

  return { streak: data.count, active, markToday }
}
