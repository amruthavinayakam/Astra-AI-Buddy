import React, { useEffect, useState } from 'react'
import { collection, addDoc, onSnapshot, query, where, orderBy, serverTimestamp, updateDoc, doc } from 'firebase/firestore'
import { db } from '../utils/firebase.js'
import { calculateXP, getLevel, getStage } from '../utils/gameLogic.js'

export default function HabitList({ user, profile }) {
  const [habits, setHabits] = useState([])
  const [input, setInput] = useState('')

  useEffect(() => {
    if (!user) return
    const q = query(collection(db, 'habits'), where('userId', '==', user.uid))
    return onSnapshot(q, (snap) => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      docs.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0))
      setHabits(docs)
    })
  }, [user])

  const addHabit = async (e) => {
    e.preventDefault()
    if (!input.trim()) return
    await addDoc(collection(db, 'habits'), {
      userId: user.uid,
      text: input.trim(),
      doneToday: false,
      createdAt: serverTimestamp(),
    })
    setInput('')
  }

  const toggleDone = async (h) => {
    const ref = doc(db, 'habits', h.id)
    await updateDoc(ref, { doneToday: !h.doneToday })
  }

  return (
    <div>
      <form onSubmit={addHabit} className="flex gap-2 mb-3">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Add a habit" className="flex-1 rounded-md bg-slate-900 px-3 py-2 outline-none" />
        <button className="px-3 py-2 rounded-md bg-indigo-600">Add</button>
      </form>
      <ul className="space-y-2">
        {habits.map(h => (
          <li key={h.id} className="flex items-center gap-2 p-2 rounded-md bg-slate-900">
            <input type="checkbox" checked={!!h.doneToday} onChange={() => toggleDone(h)} />
            <span className={h.doneToday ? 'line-through text-slate-500' : ''}>{h.text}</span>
          </li>
        ))}
        {habits.length === 0 && <div className="text-slate-500 text-sm">No habits yet. Add one!</div>}
      </ul>
    </div>
  )
}


