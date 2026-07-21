import { localDateKey } from './logicalDate'

export interface Phase {
  name: string
  start: number
  end: number
  color: string
}

export function phasesFor(length: number, periodLength: number): Phase[] {
  const ovulationDay = Math.max(periodLength + 1, length - 14)
  const follicularEnd = ovulationDay - 1
  const ovulationEnd = Math.min(length, ovulationDay + 2)
  return [
    { name: 'Menstrual', start: 1, end: periodLength, color: '#F5A9C8' },
    { name: 'Follicular', start: periodLength + 1, end: follicularEnd, color: '#B79AE0' },
    { name: 'Ovulation', start: follicularEnd + 1, end: ovulationEnd, color: '#F3C77C' },
    { name: 'Luteal', start: ovulationEnd + 1, end: length, color: '#8FCB9B' },
  ]
}

export function phaseForDay(day: number, phases: Phase[]): Phase {
  return phases.find((p) => day >= p.start && day <= p.end) ?? phases[phases.length - 1]
}

export function pmddWindow(length: number): { start: number; end: number } {
  return { start: Math.max(1, length - 4), end: length }
}

function daysBetween(a: Date, b: Date) {
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate())
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate())
  return Math.floor((utcB - utcA) / 86400000)
}

export function cycleDayFor(lastPeriodStart: string, length: number, on: Date = new Date()) {
  const start = new Date(lastPeriodStart + 'T00:00:00')
  const diff = daysBetween(start, on)
  const mod = ((diff % length) + length) % length
  return mod + 1
}

export function dayOfCycleForDate(dateStr: string, lastPeriodStart: string, length: number) {
  return cycleDayFor(lastPeriodStart, length, new Date(dateStr + 'T00:00:00'))
}

export function dateForCycleDayInMonth(lastPeriodStart: string, length: number, year: number, month: number, dayOfMonth: number) {
  const d = new Date(year, month, dayOfMonth)
  return { date: localDateKey(d), cycleDay: cycleDayFor(lastPeriodStart, length, d) }
}
