import React from 'react'
import Lottie from 'lottie-react'

// Simple placeholder animation json can be replaced later
const placeholder = {
  v: "5.7.4",
  fr: 30,
  ip: 0,
  op: 60,
  w: 200,
  h: 200,
  nm: "pulse",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "circle",
      sr: 1,
      ks: { o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [100, 100, 0] }, a: { a: 0, k: [0, 0, 0] }, s: { a: 1, k: [ { t: 0, s: [90, 90, 100] }, { t: 30, s: [110, 110, 100] }, { t: 60, s: [90, 90, 100] } ] } },
      shapes: [ { ty: 'el', p: { a: 0, k: [0, 0] }, s: { a: 0, k: [120, 120] }, nm: 'ellipse' }, { ty: 'fl', c: { a: 0, k: [0.4, 0.6, 1, 1] }, o: { a: 0, k: 100 }, nm: 'fill' } ]
    }
  ]
}

const moodEmoji = (mood) => mood === 'happy' ? '😄' : mood === 'sad' ? '😔' : '🙂'

export default function Astra({ profile }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-28 h-28 rounded-full overflow-hidden glass grid place-items-center">
        <Lottie animationData={placeholder} loop autoplay />
      </div>
      <div>
        <div className="text-2xl font-semibold">Astra <span className="ml-2">{moodEmoji(profile?.mood)}</span></div>
        <div className="text-slate-400 text-sm">Welcome back, {profile?.displayName || 'Traveler'}!</div>
      </div>
    </div>
  )
}


