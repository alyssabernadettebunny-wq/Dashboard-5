import { useEffect, useState } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { weatherCodeToCondition, moonPhase } from '../lib/weather'

interface WeatherData {
  temp: string
  condition: string
  todayHigh: string
  todayLow: string
  moonPhase: string
  moonPct: string
  updatedAt: string
  locationLabel: string
}

const DEFAULT_WEATHER: WeatherData = {
  temp: '',
  condition: '',
  todayHigh: '',
  todayLow: '',
  moonPhase: '',
  moonPct: '',
  updatedAt: '',
  locationLabel: '',
}

interface Coords {
  lat: number
  lon: number
  label: string
}

const REFRESH_MS = 30 * 60 * 1000

export function useWeatherLocation() {
  return useLocalStorage<Coords | null>('dashboard.worldfeed.location', null)
}

export function useWeather() {
  const [weather, setWeather] = useLocalStorage<WeatherData>('dashboard.worldfeed.weather', DEFAULT_WEATHER)
  const [coords] = useWeatherLocation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function fetchWeather(c: Coords) {
    setLoading(true)
    setError('')
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${c.lat}&longitude=${c.lon}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&temperature_unit=fahrenheit&timezone=auto`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Weather request failed')
      const data = await res.json()
      const phase = moonPhase()
      setWeather({
        temp: `${Math.round(data.current.temperature_2m)}°F`,
        condition: weatherCodeToCondition(data.current.weather_code),
        todayHigh: `${Math.round(data.daily.temperature_2m_max[0])}°`,
        todayLow: `${Math.round(data.daily.temperature_2m_min[0])}°`,
        moonPhase: phase.name,
        moonPct: `${phase.pct}%`,
        updatedAt: new Date().toISOString(),
        locationLabel: c.label,
      })
    } catch {
      setError('Could not fetch weather right now')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!coords) return
    fetchWeather(coords)
    const id = setInterval(() => fetchWeather(coords), REFRESH_MS)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords?.lat, coords?.lon])

  return { weather, loading, error, refresh: () => coords && fetchWeather(coords) }
}
