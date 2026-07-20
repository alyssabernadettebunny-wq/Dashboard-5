const RESET_HOUR = 5

export function localDateKey(d: Date = new Date()) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function logicalDateKey(d: Date = new Date()) {
  const shifted = new Date(d)
  if (shifted.getHours() < RESET_HOUR) shifted.setDate(shifted.getDate() - 1)
  return localDateKey(shifted)
}

export function isLogicalToday(iso: string) {
  return logicalDateKey(new Date(iso)) === logicalDateKey()
}
