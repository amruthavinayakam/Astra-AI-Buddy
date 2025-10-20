import React, { useEffect, useRef, useState } from 'react'
import { collection, addDoc, onSnapshot, query, where, serverTimestamp } from 'firebase/firestore'
import { db } from '../utils/firebase.js'
import { triggerAgentLoop } from '../utils/agentAPI.js'

export default function ChatPane({ user }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const endRef = useRef(null)

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'messages'), where('userId', '==', user.uid))
    return onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      docs.sort((a, b) => (a.timestamp?.toMillis?.() || 0) - (b.timestamp?.toMillis?.() || 0))
      setMessages(docs)
      endRef.current?.scrollIntoView({ behavior: 'smooth' })
    })
  }, [user])

  const send = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    await addDoc(collection(db, 'messages'), {
      userId: user.uid,
      sender: 'user',
      text,
      timestamp: serverTimestamp(),
    })
    setInput('')

    // Try to trigger backend agent loop if configured; otherwise fallback with a local simulated reply
    try {
      const res = await triggerAgentLoop()
      if (!res.ok) {
        await addDoc(collection(db, 'messages'), {
          userId: user.uid,
          sender: 'astra',
          text: generateLocalReply(text),
          timestamp: serverTimestamp(),
        })
      }
    } catch (_) {
      await addDoc(collection(db, 'messages'), {
        userId: user.uid,
        sender: 'astra',
        text: generateLocalReply(text),
        timestamp: serverTimestamp(),
      })
    }
  }

  function generateLocalReply(userText) {
    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
    if (userText.length <= 3) return 'I’m here. What’s on your mind?'
    if (/habit|task|todo/i.test(userText)) return 'Let’s pick one small task and do it in 5 minutes.'
    if (/hello|hi|hey/i.test(userText)) return `${greeting}! Ready for a tiny win?`
    return 'Noted. I’ll plan a small quest for you.'
  }

  return (
    <div className="flex flex-col h-[70vh]">
      {!import.meta.env.VITE_AGENT_LOOP_URL && (
        <div className="mb-2 text-xs text-amber-400">Agent not deployed yet; using local replies. Set VITE_AGENT_LOOP_URL to enable backend.</div>
      )}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {messages.map(m => (
          <div key={m.id} className={m.sender === 'user' ? 'text-right' : 'text-left'}>
            <div className={`inline-block px-3 py-2 rounded-lg ${m.sender === 'user' ? 'bg-indigo-600' : 'bg-slate-800'}`}>
              {m.text}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form onSubmit={send} className="mt-2 flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Message Astra" className="flex-1 rounded-md bg-slate-900 px-3 py-2 outline-none" />
        <button className="px-3 py-2 rounded-md bg-indigo-600">Send</button>
      </form>
    </div>
  )
}


