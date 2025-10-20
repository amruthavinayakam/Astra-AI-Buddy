import React from 'react'
import { motion } from 'framer-motion'

function xpToProgress(xp) {
  const within = xp % 100
  return Math.min(100, Math.max(0, within))
}

export default function XPBar({ xp = 0, level = 0 }) {
  const progress = xpToProgress(xp)
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm">Level {level}</span>
        <span className="text-xs text-slate-400">{progress}%</span>
      </div>
      <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ type: 'spring', stiffness: 120 }} className="h-full bg-indigo-500" />
      </div>
    </div>
  )
}


