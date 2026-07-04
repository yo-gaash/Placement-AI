import React, { useState, useEffect, useRef } from 'react'
import { interviewService } from '../services/interviewService'
import Badge from '../components/common/Badge'
import { MessageSquare, Send, CheckCircle2, Award, Star, History, PlayCircle, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'

export default function InterviewPage() {
  const [activeType, setActiveType] = useState('JAVA')
  const [session, setSession] = useState(null) // Holds current active question
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  const [chatLog, setChatLog] = useState([]) // Chats in session

  const chatEndRef = useRef(null)

  useEffect(() => {
    fetchHistory()
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatLog])

  const fetchHistory = async () => {
    try {
      const response = await interviewService.getHistory()
      setHistory(response.data.data)
    } catch (error) {
      toast.error('Failed to load history')
    } finally {
      setHistoryLoading(false)
    }
  }

  const handleStartSession = async () => {
    setChatLog([])
    setSession(null)
    setAnswer('')
    
    setSubmitting(true)
    try {
      const response = await interviewService.start({ interviewType: activeType })
      const data = response.data.data
      setSession(data)
      setChatLog([
        { role: 'ai', text: data.question }
      ])
      toast.success('Interview started!')
    } catch (error) {
      toast.error('Failed to start interview session')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitAnswer = async (e) => {
    e.preventDefault()
    if (!answer.trim() || !session) return

    const userText = answer.trim()
    setAnswer('')
    
    // Add user answer to log
    setChatLog(prev => [...prev, { role: 'user', text: userText }])

    setSubmitting(true)
    try {
      const response = await interviewService.submitAnswer({
        interviewHistoryId: session.id,
        answer: userText
      })
      const data = response.data.data
      
      // Add feedback to chat log
      setChatLog(prev => [
        ...prev, 
        { 
          role: 'ai_feedback', 
          score: data.score, 
          feedback: data.feedback 
        }
      ])
      
      // Reset session as completed
      setSession(null)
      fetchHistory()
    } catch (error) {
      toast.error('Failed to evaluate answer')
    } finally {
      setSubmitting(false)
    }
  }

  const interviewTypes = [
    { key: 'JAVA', label: 'Java', icon: '☕' },
    { key: 'SPRING_BOOT', label: 'Spring Boot', icon: '🍃' },
    { key: 'SQL', label: 'SQL Database', icon: '🗄️' },
    { key: 'HR', label: 'HR / Behavioral', icon: '🤝' },
  ]

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-140px)]"
    >
      {/* Middle column - Chat session */}
      <div className="lg:col-span-3 flex flex-col h-full bg-[#0d0d14]/40 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl">
        {/* Type select */}
        <div className="p-4 border-b border-white/5 flex gap-2 overflow-x-auto">
          {interviewTypes.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveType(t.key)}
              disabled={session !== null}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                activeType === t.key 
                  ? 'bg-sky-500/10 border-sky-500/30 text-sky-400 shadow-md shadow-sky-500/5' 
                  : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              } disabled:opacity-50`}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
          
          {session === null && (
            <button
              onClick={handleStartSession}
              disabled={submitting}
              className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-xs font-bold text-white transition-colors"
            >
              <PlayCircle className="w-4 h-4" /> Start Session
            </button>
          )}
        </div>

        {/* Chat log list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {chatLog.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <MessageSquare className="w-16 h-16 text-gray-700 mb-3" />
              <h4 className="text-white font-bold text-base">Placement Mock Interviewer</h4>
              <p className="text-xs text-gray-500 max-w-sm mt-1">Select an interview category and click Start Session to begin preparing your answers with AI feedback.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {chatLog.map((chat, i) => (
                <div key={i} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {chat.role === 'ai' && (
                    <div className="max-w-[75%] p-4 rounded-2xl bg-white/5 border border-white/5 text-sm leading-relaxed text-gray-200">
                      {chat.text}
                    </div>
                  )}

                  {chat.role === 'user' && (
                    <div className="max-w-[75%] p-4 rounded-2xl bg-gradient-to-tr from-sky-500 to-sky-600 text-sm leading-relaxed text-white font-medium shadow-md shadow-sky-500/10">
                      {chat.text}
                    </div>
                  )}

                  {chat.role === 'ai_feedback' && (
                    <div className="w-full max-w-2xl p-5 rounded-2xl bg-violet-500/5 border border-violet-500/20 space-y-3">
                      <div className="flex items-center justify-between border-b border-white/5 pb-3">
                        <span className="text-xs font-bold text-violet-400 flex items-center gap-1">
                          <Award className="w-4 h-4" /> AI Evaluation Feedback
                        </span>
                        <div className="flex gap-1">
                          {[...Array(10)].map((_, idx) => (
                            <Star 
                              key={idx} 
                              className={`w-3.5 h-3.5 ${idx < chat.score ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">{chat.feedback}</p>
                    </div>
                  )}
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Input box */}
        {session && (
          <form onSubmit={handleSubmitAnswer} className="p-4 border-t border-white/5 bg-[#0b0b12]/60 flex gap-3">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="flex-grow px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500/40 focus:ring-1 focus:ring-sky-500/20 transition-all text-xs font-medium resize-none h-12"
              placeholder="Type your answer here..."
            />
            <button
              type="submit"
              disabled={submitting || !answer.trim()}
              className="px-5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" /> Submit
            </button>
          </form>
        )}
      </div>

      {/* Right panel - History logs */}
      <div className="lg:col-span-1 bg-[#0d0d14]/40 border border-white/5 p-6 rounded-2xl backdrop-blur-xl h-full flex flex-col overflow-hidden">
        <h4 className="text-sm font-semibold text-gray-300 tracking-wider uppercase mb-4 flex items-center gap-2 border-b border-white/5 pb-3">
          <History className="w-4 h-4 text-sky-400" /> Practice Logs
        </h4>
        
        <div className="flex-grow overflow-y-auto space-y-3 pr-2">
          {historyLoading ? (
            <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-gray-500" /></div>
          ) : history.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-6">No practice logs completed</p>
          ) : (
            history.map((item, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                  <Badge label={item.interviewType} color="blue" />
                  <span className="text-[10px] font-bold text-amber-400 flex items-center gap-0.5"><Star className="w-3 h-3 fill-amber-400" /> {item.score}/10</span>
                </div>
                <p className="text-[10px] text-gray-300 font-semibold truncate leading-none">Q: {item.question}</p>
                <p className="text-[9px] text-gray-500 truncate leading-none mt-1">Ans: {item.answer}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  )
}
