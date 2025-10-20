import React, { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Astra from './components/Astra.jsx'
import ChatPane from './components/ChatPane.jsx'
import HabitList from './components/HabitList.jsx'
import XPBar from './components/XPBar.jsx'
import { auth, db, messaging } from './utils/firebase.js'
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { doc, onSnapshot, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'

function SignIn() {
  const login = async () => {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }
  return (
    <div className="min-h-screen grid place-items-center">
      <button onClick={login} className="px-5 py-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 font-semibold">Sign in with Google</button>
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        const ref = doc(db, 'users', u.uid)
        await setDoc(ref, {
          displayName: u.displayName || 'Traveler',
          xp: 0,
          level: 0,
          streak: 0,
          mood: 'neutral',
          lastActive: serverTimestamp(),
        }, { merge: true })
        return onSnapshot(ref, (snap) => setProfile({ id: snap.id, ...snap.data() }))
      } else {
        setProfile(null)
      }
    })
  }, [])

  const handleSignOut = async () => {
    await signOut(auth)
  }

  if (!user) return <SignIn />

  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold">Astra</span>
          {profile && <span className="text-sm text-slate-400">Lv {profile.level}</span>}
        </div>
        <button onClick={handleSignOut} className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700">Sign out</button>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        <section className="glass rounded-xl p-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <Astra profile={profile} />
            <div className="w-1/2">
              <XPBar xp={profile?.xp || 0} level={profile?.level || 0} />
            </div>
          </div>
          <div className="mt-4">
            <HabitList user={user} profile={profile} />
          </div>
        </section>
        <section className="glass rounded-xl p-4">
          <ChatPane user={user} />
        </section>
      </main>
    </div>
  )
}


