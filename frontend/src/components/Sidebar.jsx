import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { 
  LayoutDashboard, 
  FileText, 
  Zap, 
  MessageSquare, 
  Code2, 
  Map, 
  Bot, 
  LogOut 
} from 'lucide-react'

export default function Sidebar() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/resume', label: 'Resume Coach', icon: FileText },
    { to: '/skills', label: 'Skill Gap', icon: Zap },
    { to: '/interview', label: 'Mock Interview', icon: MessageSquare },
    { to: '/coding', label: 'Coding Practice', icon: Code2 },
    { to: '/roadmap', label: 'Learning Roadmap', icon: Map },
    { to: '/chat', label: 'AI Chat', icon: Bot },
  ]

  const getInitials = (name) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
  }

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 bg-[#0b0b12] border-r border-white/5 flex flex-col justify-between z-20">
      <div>
        {/* Logo Section */}
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-400 to-violet-500 flex items-center justify-center shadow-lg shadow-sky-500/10">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">PlacementAI</h1>
            <p className="text-[10px] text-gray-500 font-medium tracking-wide uppercase">AI Career Agent</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 flex flex-col gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-sky-500/10 to-violet-500/10 text-sky-400 border border-sky-500/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User Info / Logout Section */}
      <div className="p-4 border-t border-white/5 flex flex-col gap-3">
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400 to-violet-500 flex items-center justify-center font-bold text-white shadow-md shadow-violet-500/15">
            {getInitials(user?.name)}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold text-white truncate">{user?.name || 'User'}</h4>
            <p className="text-xs text-gray-500 truncate">{user?.email || 'user@placementai.com'}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/5 text-sm font-semibold transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
