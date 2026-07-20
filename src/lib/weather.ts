const WEATHER_CODES: Record<number, string> = {
  0: 'Clear sky',
  1: 'Mostly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Fog',
  51: 'Light drizzle',
  53: 'Drizzle',
  55: 'Heavy drizzle',
  56: 'Freezing drizzle',
  57: 'Freezing drizzle',
  61: 'Light rain',
  63: 'Rain',
  65: 'Heavy rain',
  66: 'Freezing rain',
  67: 'Freezing rain',
  71: 'Light snow',
  73: 'Snow',
  75: 'Heavy snow',
  77: 'Snow grains',
  80: 'Light showers',
  81: 'Showers',
  82: 'Heavy showers',
  85: 'Snow showers',
  86: 'Snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm w/ hail',
  99: 'Thunderstorm w/ hail',
}

export function weatherCodeToCondition(code: number) {
  return WEATHER_CODES[code] ?? 'Unknown'
}

const SYNODIC_MONTH = 29.53058867
const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14)

const MOON_PHASE_NAMES = [
  'New Moon',
  'Waxing Crescent',
  'First Quarter',
  'Waxing Gibbous',
  'Full Moon',
  'Waning Gibbous',
  'Last Quarter',
  'Waning Crescent',
]

export function moonPhase(date: Date = new Date()) {
  const daysSince = (date.getTime() - KNOWN_NEW_MOON) / 86400000
  const fraction = ((daysSince % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH / SYNODIC_MONTH
  const index = Math.round(fraction * 8) % 8
  const illumination = Math.round((1 - Math.cos(fraction * 2 * Math.PI)) * 50)
  return { name: MOON_PHASE_NAMES[index], pct: illumination }
}
