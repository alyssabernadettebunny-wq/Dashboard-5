import { useLocalStorage } from './useLocalStorage'
import { localDateKey } from '../lib/logicalDate'

interface StreakData {
  count: number
  lastDate: string
}

function todayKey() {
  return localDateKey()
}

function yesterdayKey() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return localDateKey(d)
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
