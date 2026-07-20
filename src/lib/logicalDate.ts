const RESET_HOUR = 5

export function logicalDateKey(d: Date = new Date()) {
  const shifted = new Date(d)
  if (shifted.getHours() < RESET_HOUR) shifted.setDate(shifted.getDate() - 1)
  return shifted.toISOString().slice(0, 10)
}

export function isLogicalToday(iso: string) {
  return logicalDateKey(new Date(iso)) === logicalDateKey()
}
