import React, { useState, useEffect, useRef } from 'react'
import { chatService } from '../services/chatService'
import Badge from '../components/common/Badge'
import { Bot, Send, User, Sparkles, Loader2, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'

export default function ChatPage() {
  const [activeTab, setActiveTab] = useState('GENERAL')
  const [message, setMessage] = useState('')
  const [chatLog, setChatLog] = useState([])
  const [loading, setLoading] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)

  const chatEndRef = useRef(null)

  useEffect(() => {
    fetchHistory()
  }, [activeTab])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatLog])

  const fetchHistory = async () => {
    setHistoryLoading(true)
    try {
      const response = await chatService.getHistory(activeTab)
      const data = response.data.data
      
      const formatted = []
      data.forEach(item => {
        formatted.push({ role: 'user', text: item.prompt })
        formatted.push({ role: 'ai', text: item.response })
      })
      
      setChatLog(formatted)
    } catch (error) {
      toast.error('Failed to load conversation logs')
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!message.trim() || loading) return

    const userText = message.trim()
    setMessage('')
    
    // Add message to local log first
    setChatLog(prev => [...prev, { role: 'user', text: userText }])
    
    setLoading(true)
    try {
      const response = await chatService.sendMessage({
        prompt: userText,
        agentType: activeTab
      })
      const data = response.data.data
      
      setChatLog(prev => [...prev, { role: 'ai', text: data.response }])
    } catch (error) {
      toast.error('Failed to get response from agent')
    } finally {
      setLoading(false)
    }
  }

  const agents = [
    { key: 'GENERAL', label: 'General AI Coach', desc: 'Placement helper', icon: '🤖', color: 'blue' },
    { key: 'RESUME_COACH', label: 'Resume Expert', desc: 'ATS suggestions', icon: '📄', color: 'purple' },
    { key: 'INTERVIEW_COACH', label: 'Mock Interviewer', desc: 'Q&A prep coach', icon: '🎤', color: 'green' },
    { key: 'CODING_MENTOR', label: 'Coding Mentor', desc: 'DSA & algorithm advice', icon: '💻', color: 'orange' },
  ]

  const getAgentColor = (key) => {
    switch (key) {
      case 'RESUME_COACH': return 'border-violet-500/20 text-violet-400 bg-violet-500/5'
      case 'INTERVIEW_COACH': return 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5'
      case 'CODING_MENTOR': return 'border-amber-500/20 text-amber-400 bg-amber-500/5'
      default: return 'border-sky-500/20 text-sky-400 bg-sky-500/5'
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-140px)]"
    >
      {/* Left panel - Agent selectors */}
      <div className="lg:col-span-1 space-y-4 h-full flex flex-col overflow-y-auto pr-1">
        <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase mb-2">Available Experts</h3>
        {agents.map((agent) => (
          <button
            key={agent.key}
            onClick={() => setActiveTab(agent.key)}
            className={`w-full p-4 rounded-xl border flex items-start gap-4 transition-all text-left ${
              activeTab === agent.key
                ? getAgentColor(agent.key) + ' shadow-md shadow-sky-500/5 scale-[1.02]'
                : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <span className="text-2xl mt-0.5">{agent.icon}</span>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                {agent.label} {activeTab === agent.key && <Sparkles className="w-3.5 h-3.5 animate-pulse" />}
              </h4>
              <p className="text-[10px] text-gray-500 mt-1 font-medium leading-normal">{agent.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Right panel - Chat board */}
      <div className="lg:col-span-3 flex flex-col h-full bg-[#0d0d14]/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl">
        
        {/* Chat window messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {historyLoading ? (
            <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-500" /></div>
          ) : chatLog.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <Bot className="w-16 h-16 text-gray-700 mb-3" />
              <h4 className="text-white font-bold text-base">Chat with {agents.find(a=>a.key===activeTab)?.label}</h4>
              <p className="text-xs text-gray-500 max-w-sm mt-1">Start chatting by typing your career, interview, or resume preparation questions below.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {chatLog.map((chat, i) => (
                <div key={i} className={`flex gap-3 ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {chat.role === 'ai' && (
                    <div className="flex gap-3 max-w-[80%]">
                      <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mt-1 flex-shrink-0">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs leading-relaxed text-gray-200 whitespace-pre-wrap font-medium">
                        {chat.text}
                      </div>
                    </div>
                  )}

                  {chat.role === 'user' && (
                    <div className="flex gap-3 max-w-[80%] justify-end">
                      <div className="p-4 rounded-2xl bg-gradient-to-tr from-sky-500 to-sky-600 text-xs leading-relaxed text-white font-medium shadow-md shadow-sky-500/10">
                        {chat.text}
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-gray-400 mt-1 flex-shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mt-1 flex-shrink-0 animate-pulse">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Sticky Input Bar */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-[#0b0b12]/60 flex gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={loading || historyLoading}
            className="flex-grow px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500/40 text-xs font-medium"
            placeholder={`Ask the ${agents.find(a=>a.key===activeTab)?.label} anything...`}
          />
          <button
            type="submit"
            disabled={loading || historyLoading || !message.trim()}
            className="px-5 rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" /> Send
          </button>
        </form>

      </div>
    </motion.div>
  )
}
