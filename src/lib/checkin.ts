export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface CheckinConfig {
  workerUrl: string
  passphrase: string
}

export interface CheckinLog {
  mood: string | null
  moodScore: number | null
  energy: number | null
  symptoms: string[]
  emotions: string[]
  events: string[]
  house: string | null
  thoughts: string | null
}

export interface CheckinEntry {
  id: string
  date: string
  summary: string
  transcript: ChatMessage[]
  log: CheckinLog | null
}

export const CHECKIN_CONFIG_KEY = 'notes.checkin.config'
export const CHECKIN_ENTRIES_KEY = 'notes.checkin.entries'
