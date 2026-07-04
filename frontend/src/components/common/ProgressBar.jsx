import React from 'react'

export default function ProgressBar({ value, max = 100, label, color = 'blue', showPercent = true }) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0

  const colors = {
    blue: 'from-sky-500 to-sky-400 shadow-sky-500/20',
    purple: 'from-violet-500 to-violet-400 shadow-violet-500/20',
    green: 'from-emerald-500 to-emerald-400 shadow-emerald-500/20',
    orange: 'from-amber-500 to-amber-400 shadow-amber-500/20',
  }

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-semibold text-gray-300">{label}</span>}
          {showPercent && <span className="text-xs font-bold text-gray-400">{percent}%</span>}
        </div>
      )}
      <div className="w-full h-2.5 bg-white/5 border border-white/5 rounded-full overflow-hidden p-0.5">
        <div 
          className={`h-full bg-gradient-to-r ${colors[color]} rounded-full transition-all duration-700 ease-out shadow-lg`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
