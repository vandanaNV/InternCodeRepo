import React, { useEffect, useRef, useState } from 'react'
import api from '../api/client.js'

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! I\'m the EMS Assistant. Ask me about leave, WFH, attendance, salary dates, or any HR policy.' }
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bodyRef = useRef(null)

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [messages, open, sending])

  const send = async () => {
    const text = input.trim()
    if (!text || sending) return
    setMessages((m) => [...m, { role: 'user', text }])
    setInput('')
    setSending(true)
    try {
      const res = await api.post('/api/chat/ask', { message: text })
      setMessages((m) => [...m, { role: 'bot', text: res.data.reply }])
    } catch (err) {
      setMessages((m) => [...m, { role: 'bot', text: 'Sorry, I could not reach the assistant right now. Please try again in a moment.' }])
    } finally {
      setSending(false)
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter') send()
  }

  return (
    <>
      {open && (
        <div className="chat-panel">
          <div className="chat-head">
            <div>
              <div className="title">EMS Assistant</div>
              <div className="sub">HR FAQ · local AI</div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat">×</button>
          </div>
          <div className="chat-body" ref={bodyRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role}`}>{m.text}</div>
            ))}
            {sending && <div className="chat-msg bot typing">typing…</div>}
          </div>
          <div className="chat-input-row">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask about leave, WFH, salary…"
              disabled={sending}
            />
            <button onClick={send} disabled={sending || !input.trim()}>Send</button>
          </div>
        </div>
      )}
      <button className="chat-fab" onClick={() => setOpen((o) => !o)} aria-label="Toggle chat">
        {open ? '×' : '💬'}
      </button>
    </>
  )
}
