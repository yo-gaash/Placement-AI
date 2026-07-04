import React from 'react'
import { motion } from 'framer-motion'

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', index = 0 }) {
  const colors = {
    blue: 'from-sky-500/10 to-sky-600/5 border-sky-500/20 text-sky-400',
    purple: 'from-violet-500/10 to-violet-600/5 border-violet-500/20 text-violet-400',
    green: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 text-emerald-400',
    orange: 'from-amber-500/10 to-amber-600/5 border-amber-500/20 text-amber-400',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`bg-gradient-to-br ${colors[color]} backdrop-blur-xl border rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 shadow-lg`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-400 text-sm font-semibold tracking-wide uppercase">{title}</span>
        {Icon && (
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 shadow-inner">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-white mb-2">{value}</div>
      {subtitle && <p className="text-xs text-gray-500 font-medium">{subtitle}</p>}
    </motion.div>
  )
}
