import React, { useState, useEffect } from 'react'
import { codingService } from '../services/codingService'
import Badge from '../components/common/Badge'
import { Plus, Check, Loader2, Sparkles, Terminal, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'

export default function CodingPage() {
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Add problem form state
  const [name, setName] = useState('')
  const [difficulty, setDifficulty] = useState('EASY')
  const [topic, setTopic] = useState('')
  const [adding, setAdding] = useState(false)

  // AI recommendations
  const [recommendations, setRecommendations] = useState([])
  const [recsLoading, setRecsLoading] = useState(true)

  // Daily Schedule state
  const [todayPlan, setTodayPlan] = useState('')
  const [planLoading, setPlanLoading] = useState(true)

  useEffect(() => {
    fetchProblems()
    fetchRecommendations()
    fetchDailyPlan()
  }, [])

  const fetchProblems = async () => {
    try {
      const response = await codingService.getProblems()
      setProblems(response.data.data)
    } catch (error) {
      toast.error('Failed to load coding problems tracker')
    } finally {
      setLoading(false)
    }
  }

  const fetchRecommendations = async () => {
    try {
      const response = await codingService.getRecommendations()
      setRecommendations(response.data.data)
    } catch (error) {
      // Ignore recommendation fail gracefully
    } finally {
      setRecsLoading(false)
    }
  }

  const fetchDailyPlan = async () => {
    try {
      const response = await codingService.getTodaysPlan()
      setTodayPlan(response.data.data)
    } catch (error) {
      //
    } finally {
      setPlanLoading(false)
    }
  }

  const handleAddProblem = async (e) => {
    e.preventDefault()
    if (!name.trim()) return

    setAdding(true)
    try {
      const response = await codingService.addProblem({
        problemName: name.trim(),
        difficulty,
        topic: topic.trim() || 'General DSA',
        status: 'TODO'
      })
      setProblems([response.data.data, ...problems])
      setName('')
      setTopic('')
      toast.success('Problem added successfully!')
    } catch (error) {
      toast.error('Failed to add problem')
    } finally {
      setAdding(false)
    }
  }

  const handleToggleSolved = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'SOLVED' ? 'TODO' : 'SOLVED'
    try {
      const response = await codingService.updateStatus(id, nextStatus)
      setProblems(problems.map(p => p.id === id ? response.data.data : p))
      toast.success(nextStatus === 'SOLVED' ? 'Problem marked solved! 🎉' : 'Problem reverted')
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  const getDiffColor = (diff) => {
    switch (diff) {
      case 'HARD': return 'red'
      case 'MEDIUM': return 'orange'
      default: return 'green'
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-8"
    >
      {/* Left panel - Add / solved list */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Form to add solved problems */}
        <div className="bg-[#0d0d14]/40 border border-white/5 p-6 rounded-2xl backdrop-blur-xl">
          <h3 className="text-lg font-bold text-white mb-4">Manual Progress Log</h3>
          
          <form onSubmit={handleAddProblem} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-3">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500/40 text-xs font-semibold"
                placeholder="Problem name (e.g. Reverse Linked List)"
              />
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500/40 text-xs font-semibold"
                placeholder="Topic (e.g. Linked List)"
              />
            </div>
            <div className="flex flex-col justify-between gap-3">
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-300 font-medium focus:outline-none"
              >
                <option value="EASY" className="bg-[#0b0b12]">Easy</option>
                <option value="MEDIUM" className="bg-[#0b0b12]">Medium</option>
                <option value="HARD" className="bg-[#0b0b12]">Hard</option>
              </select>
              <button
                type="submit"
                disabled={adding}
                className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 font-semibold text-white transition-colors text-xs flex items-center justify-center gap-1 disabled:opacity-50"
              >
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add Problem
              </button>
            </div>
          </form>
        </div>

        {/* Tracker lists */}
        <div className="bg-[#0d0d14]/40 border border-white/5 p-6 rounded-2xl backdrop-blur-xl space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-400" /> Logged Coding Problems
          </h3>
          
          <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-gray-500" /></div>
            ) : problems.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-8">No problems added yet. Log items above!</p>
            ) : (
              problems.map((prob) => (
                <div key={prob.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-sky-500/10 transition-all">
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-white">{prob.problemName}</h4>
                    <div className="flex items-center gap-2">
                      <Badge label={prob.difficulty} color={getDiffColor(prob.difficulty)} />
                      <span className="text-[10px] text-gray-500 font-medium">#{prob.topic}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleToggleSolved(prob.id, prob.status)}
                    className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
                      prob.status === 'SOLVED'
                        ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                        : 'bg-white/5 border-white/5 text-gray-500 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Right panel - AI Mentor recommendations */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* Recommendations list */}
        <div className="bg-[#0d0d14]/40 border border-white/5 p-6 rounded-2xl backdrop-blur-xl space-y-4">
          <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" /> AI Recommendations
          </h3>
          
          <div className="space-y-3 pr-1">
            {recsLoading ? (
              <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-gray-500" /></div>
            ) : recommendations.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">No suggestions found. Map skills gap first.</p>
            ) : (
              recommendations.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-white leading-tight truncate w-32">{item.name}</h4>
                    <Badge label={item.difficulty} color={getDiffColor(item.difficulty.toUpperCase())} />
                  </div>
                  <p className="text-[10px] text-gray-400 font-semibold truncate leading-none">#{item.topic}</p>
                  <p className="text-[10px] text-gray-500 leading-relaxed font-medium">{item.reason}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Daily schedule custom */}
        <div className="bg-[#0d0d14]/40 border border-white/5 p-6 rounded-2xl backdrop-blur-xl space-y-4">
          <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase flex items-center gap-2">
            <Terminal className="w-4 h-4 text-sky-400" /> Coding Schedule
          </h3>
          <div className="max-h-[250px] overflow-y-auto pr-2">
            {planLoading ? (
              <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-gray-500" /></div>
            ) : (
              <pre className="text-[10px] text-gray-400 font-mono whitespace-pre-wrap leading-relaxed">
                {todayPlan || 'Enter skills gap profiles to unlock today\'s routine tasks.'}
              </pre>
            )}
          </div>
        </div>

      </div>
    </motion.div>
  )
}
