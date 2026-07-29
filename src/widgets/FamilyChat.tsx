import { useEffect, useRef, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import Card from '../components/Card'

interface ChatMessage {
  id: string
  sender: string
  text: string
  time: number
}

const MEMBERS = [
  { key: 'mom', name: 'Mom', icon: '💗' },
  { key: 'winnie', name: 'Winnie', icon: '🎀' },
  { key: 'amy', name: 'Amy', icon: '⭐' },
  { key: 'holly', name: 'Holly', icon: '🌸' },
]

function memberOf(key: string) {
  return MEMBERS.find((m) => m.key === key) ?? MEMBERS[0]
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export default function FamilyChat() {
  const [messages, setMessages] = useLocalStorage<ChatMessage[]>('messages.familyChat', [])
  const [activeSender, setActiveSender] = useLocalStorage('messages.activeSender', 'mom')
  const [text, setText] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages.length])

  function sendMessage() {
    const trimmed = text.trim()
    if (!trimmed) return
    setMessages([...messages, { id: crypto.randomUUID(), sender: activeSender, text: trimmed, time: Date.now() }])
    setText('')
  }

  function removeMessage(id: string) {
    setMessages(messages.filter((m) => m.id !== id))
  }

  return (
    <Card icon="💬" title="Family Group Chat" meta={messages.length ? `${messages.length} message${messages.length !== 1 ? 's' : ''}` : undefined} wide variant="miniWindow">
      <p className="card-subtitle">Pick whose phone you're on, then chat as them — everyone lands in the same thread.</p>

      <div className="chat-sender-row">
        {MEMBERS.map((m) => (
          <button
            key={m.key}
            className={`chat-sender-pill ${activeSender === m.key ? 'active' : ''}`}
            onClick={() => setActiveSender(m.key)}
            type="button"
          >
            <span>{m.icon}</span> {m.name}
          </button>
        ))}
      </div>

      <div className="chat-thread" ref={listRef}>
        {messages.length === 0 && <p className="c-empty">No messages yet — say hi ♡</p>}
        {messages.map((m, i) => {
          const sender = memberOf(m.sender)
          const mine = m.sender === activeSender
          const prev = messages[i - 1]
          const showName = !prev || prev.sender !== m.sender
          return (
            <div key={m.id} className={`chat-row ${mine ? 'mine' : ''}`}>
              {showName && <div className="chat-sender-label">{sender.icon} {sender.name}</div>}
              <div className="chat-bubble-wrap">
                <div className="chat-bubble">{m.text}</div>
                <button className="chat-remove" onClick={() => removeMessage(m.id)} aria-label="Delete message">
                  ×
                </button>
              </div>
              <div className="chat-time">{formatTime(m.time)}</div>
            </div>
          )
        })}
      </div>

      <div className="c-input-row">
        <input
          type="text"
          value={text}
          placeholder={`Message as ${memberOf(activeSender).name}...`}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </Card>
  )
}
