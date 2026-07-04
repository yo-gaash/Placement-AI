import React from 'react'

export default function Badge({ label, color = 'blue' }) {
  const colors = {
    blue: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    purple: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    red: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    orange: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    gray: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  }

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${colors[color]} tracking-wide shadow-sm`}>
      {label}
    </span>
  )
}
