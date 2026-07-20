import { useLocalStorage } from './useLocalStorage'
import { localDateKey } from '../lib/logicalDate'

interface TodayMood {
  date: string
  label: string
  image: string | null
}

interface Pet {
  name: 'Misa' | 'Coco'
  emoji: string
  personality: string
}

const MISA: Pet = { name: 'Misa', emoji: '🐶', personality: 'bratty, funny, observant, a bit of a crybaby' }
const COCO: Pet = { name: 'Coco', emoji: '🐩', personality: 'calm, cautious, well-behaved, a little lazy' }

function dayOfYear() {
  return Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000)
}

function todayStr() {
  return localDateKey()
}

function timeOfDayMessage(pet: Pet, hour: number) {
  if (pet.name === 'Misa') {
    if (hour < 6) return { mood: 'sleepy', message: "shh, I'm napping. wake me for breakfast." }
    if (hour < 12) return { mood: 'excited', message: 'good morning!! did somebody say breakfast??' }
    if (hour < 17) return { mood: 'playful', message: 'okay but have you thought about playing with me' }
    if (hour < 21) return { mood: 'happy', message: 'evening zoomies incoming, just so you know' }
    return { mood: 'sleepy', message: "it's bedtime. tucking in, don't disturb." }
  }
  if (hour < 6) return { mood: 'sleepy', message: 'zzz... five more minutes.' }
  if (hour < 12) return { mood: 'calm', message: 'good morning. taking it slow today.' }
  if (hour < 17) return { mood: 'calm', message: 'sunbathing. this is my job right now.' }
  if (hour < 21) return { mood: 'content', message: 'cozy evening, just how I like it.' }
  return { mood: 'sleepy', message: 'already curled up. goodnight.' }
}

export function useCompanionMode() {
  return useLocalStorage<'alternate' | 'misa' | 'coco'>('settings.companion.mode', 'alternate')
}

export function useCompanion() {
  const [mood] = useLocalStorage<TodayMood | null>('dashboard.moodToday', null)
  const [streakData] = useLocalStorage('streak.overall', { count: 0, lastDate: '' })
  const [mode] = useCompanionMode()

  const pet = mode === 'misa' ? MISA : mode === 'coco' ? COCO : dayOfYear() % 2 === 0 ? MISA : COCO
  const streak = streakData.lastDate === todayStr() ? streakData.count : 0
  const hour = new Date().getHours()

  let state: { mood: string; message: string }

  if (mood && mood.date === todayStr()) {
    state = {
      mood: 'mirroring',
      message:
        pet.name === 'Misa'
          ? `you're feeling "${mood.label}"? me too, obviously. I feel everything first.`
          : `oh, "${mood.label}"? okay. I'll just be over here feeling that quietly with you.`,
    }
  } else if (streak >= 7) {
    state = {
      mood: 'proud',
      message: pet.name === 'Misa' ? `${streak} days in a row?! okay I'm actually impressed, don't tell anyone.` : `${streak} days straight. proud of you. very proud. calmly proud.`,
    }
  } else if (streak >= 3) {
    state = {
      mood: 'happy',
      message: pet.name === 'Misa' ? `${streak} day streak, we're on a roll!! keep going!!` : `${streak} days now. nice and steady, just how I like it.`,
    }
  } else if (streak >= 1) {
    state = {
      mood: 'happy',
      message: pet.name === 'Misa' ? "you showed up today! I'm proud, even if I act bratty about it." : 'you came back today. that makes my tail wag a little.',
    }
  } else {
    state = timeOfDayMessage(pet, hour)
  }

  return { pet, ...state }
}
