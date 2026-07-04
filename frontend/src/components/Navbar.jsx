import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Bell } from 'lucide-react'

export default function Navbar() {
  const location = useLocation()
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const getPageTitle = () => {
    const path = location.pathname.substring(1)
    if (!path) return 'Dashboard'
    
    // Capitalize and format path
    return path
      .split('/')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  }

  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Resume ATS audit complete", desc: "Your ATS score improved by 12 points.", time: "10 mins ago", read: false },
    { id: 2, title: "Recommended problem unlocked", desc: "Sliding Window Maximum is queued for your practice.", time: "1 hour ago", read: false },
    { id: 3, title: "Mock interview summary generated", desc: "Spring Boot container explanation score: 8/10.", time: "2 hours ago", read: true }
  ])

  return (
    <header className="h-16 px-8 flex items-center justify-between border-b border-white/5 bg-[#08080c]/60 backdrop-blur-md sticky top-0 z-10">
      <div>
        <h2 className="text-xl font-bold text-white tracking-wide">{getPageTitle()}</h2>
      </div>

      <div className="flex items-center gap-6">
        {/* Clock */}
        <div className="text-sm font-semibold text-gray-400 bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg">
          {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-10 h-10 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
          >
            <Bell className="w-5 h-5" />
            {notifications.some(n => !n.read) && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-sky-500 ring-2 ring-[#08080c]" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-white/5 bg-[#0d0d14] backdrop-blur-xl p-4 shadow-xl z-30 space-y-3">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Notifications</span>
                <button 
                  onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
                  className="text-[10px] font-semibold text-sky-400 hover:underline"
                >
                  Mark all read
                </button>
              </div>
              <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
                {notifications.map(n => (
                  <div 
                    key={n.id} 
                    onClick={() => {
                      setNotifications(notifications.map(item => item.id === n.id ? { ...item, read: true } : item))
                    }}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      n.read 
                        ? 'bg-transparent border-transparent opacity-60' 
                        : 'bg-white/5 border-white/5 hover:border-sky-500/10'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-xs font-bold text-white leading-tight">{n.title}</h4>
                      {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-sky-500 flex-shrink-0 mt-1" />}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 leading-normal">{n.desc}</p>
                    <span className="text-[9px] text-gray-500 font-semibold mt-1.5 block">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
