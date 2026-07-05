import React, { useState, useEffect } from 'react'
import { codingService } from '../services/codingService'
import Badge from '../components/common/Badge'
import { Plus, Check, Loader2, Sparkles, Terminal, BookOpen, GitBranch, Github, Code2, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'

export default function CodingPage() {
  const [problems, setProblems] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Add problem form state
  const [name, setName] = useState('')
  const [difficulty, setDifficulty] = useState('EASY')
  const [topic, setTopic] = useState('')
  const [adding, setAdding] = useState(false)

  // Profile links state
  const [leetcodeUrl, setLeetcodeUrl] = useState('')
  const [gfgUrl, setGfgUrl] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [profileStats, setProfileStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)

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
    fetchProfileStats()
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
      // Ignore recommendations fail gracefully
    } finally {
      setRecsLoading(false)
    }
  }

  const fetchDailyPlan = async () => {
    try {
      const response = await codingService.getTodaysPlan()
      setTodayPlan(response.data.data)
    } catch (error) {
      // Ignore
    } finally {
      setPlanLoading(false)
    }
  }

  const fetchProfileStats = async () => {
    try {
      const response = await codingService.getProfileStats()
      const data = response.data.data
      if (data) {
        setLeetcodeUrl(data.leetcodeUrl || '')
        setGfgUrl(data.gfgUrl || '')
        setGithubUrl(data.githubUrl || '')
        setProfileStats(data)
      }
    } catch (error) {
      // Ignore
    } finally {
      setStatsLoading(false)
    }
  }

  const handleSaveProfiles = async (e) => {
    e.preventDefault()
    setSyncing(true)
    try {
      await codingService.saveProfile({
        leetcodeUrl: leetcodeUrl.trim(),
        gfgUrl: gfgUrl.trim(),
        githubUrl: githubUrl.trim()
      })
      toast.success('Coding profile links synchronized!')
      fetchProfileStats()
    } catch (error) {
      toast.error('Failed to synchronize coding profiles')
    } finally {
      setSyncing(false)
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

  // Get commit box color class based on commit density
  const getCommitColorClass = (count) => {
    if (count === 0) return 'bg-white/5 border border-white/5'
    if (count <= 2) return 'bg-emerald-800/40 border border-emerald-700/20 text-emerald-400'
    if (count <= 4) return 'bg-emerald-600/70 border border-emerald-500/20 text-emerald-300'
    return 'bg-emerald-400 border border-emerald-300/30 text-white'
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Profile Sync Header Form */}
      <div className="bg-[#0d0d14]/40 border border-white/5 p-6 rounded-2xl backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-sky-400" /> Link Performance Profiles
            </h3>
            <p className="text-[11px] text-gray-500 mt-1 font-semibold">
              Enter your public profiles to fetch real-time heatmap activities and problems solved statistics.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfiles} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">LeetCode Profile URL</label>
            <input
              type="text"
              value={leetcodeUrl}
              onChange={(e) => setLeetcodeUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500/40 text-xs font-semibold"
              placeholder="e.g. leetcode.com/shyam"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">GeeksforGeeks Profile URL</label>
            <input
              type="text"
              value={gfgUrl}
              onChange={(e) => setGfgUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500/40 text-xs font-semibold"
              placeholder="e.g. geeksforgeeks.org/user/shyam"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">GitHub Profile URL</label>
            <input
              type="text"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500/40 text-xs font-semibold"
              placeholder="e.g. github.com/shyam"
            />
          </div>

          <button
            type="submit"
            disabled={syncing}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer shadow-lg shadow-sky-500/10"
          >
            {syncing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Synchronizing...
              </>
            ) : (
              'Sync Profile Stats'
            )}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left panel - Stats & problem list */}
        <div className="lg:col-span-2 space-y-6">

          {/* Sync Stats Cards Dashboard */}
          {statsLoading ? (
            <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin text-gray-500" /></div>
          ) : profileStats && (profileStats.leetcodeStats || profileStats.gfgStats || profileStats.githubStats) ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* LeetCode stats */}
              {profileStats.leetcodeStats && (
                <div className="bg-[#0d0d14]/40 border border-white/5 p-5 rounded-2xl backdrop-blur-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-5 h-5 text-amber-500" />
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">LeetCode Stats</h4>
                      <p className="text-[9px] text-gray-500">@{profileStats.leetcodeStats.username}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-400 font-semibold">
                      <span>Total Solved:</span>
                      <span className="text-white font-bold">{profileStats.leetcodeStats.totalSolved}</span>
                    </div>

                    {/* Progress representation */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] text-gray-500 font-bold uppercase">
                        <span>Easy</span>
                        <span className="text-emerald-400">{profileStats.leetcodeStats.easySolved}</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, (profileStats.leetcodeStats.easySolved / profileStats.leetcodeStats.totalSolved) * 100)}%` }} />
                      </div>

                      <div className="flex justify-between text-[9px] text-gray-500 font-bold uppercase">
                        <span>Medium</span>
                        <span className="text-amber-400">{profileStats.leetcodeStats.mediumSolved}</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, (profileStats.leetcodeStats.mediumSolved / profileStats.leetcodeStats.totalSolved) * 100)}%` }} />
                      </div>

                      <div className="flex justify-between text-[9px] text-gray-500 font-bold uppercase">
                        <span>Hard</span>
                        <span className="text-rose-400">{profileStats.leetcodeStats.hardSolved}</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-rose-500 h-full rounded-full" style={{ width: `${Math.min(100, (profileStats.leetcodeStats.hardSolved / profileStats.leetcodeStats.totalSolved) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* GeeksforGeeks stats */}
              {profileStats.gfgStats && (
                <div className="bg-[#0d0d14]/40 border border-white/5 p-5 rounded-2xl backdrop-blur-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-500" />
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">GeeksforGeeks</h4>
                      <p className="text-[9px] text-gray-500">@{profileStats.gfgStats.username}</p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl text-center space-y-0.5">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Problems Solved</span>
                      <span className="text-xl font-black text-white">{profileStats.gfgStats.problemsSolved}</span>
                    </div>

                    <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl text-center space-y-0.5">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">Overall Score</span>
                      <span className="text-xl font-black text-white">{profileStats.gfgStats.overallScore}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* GitHub contribution activity heatmap */}
              {profileStats.githubStats && (
                <div className="bg-[#0d0d14]/40 border border-white/5 p-5 rounded-2xl backdrop-blur-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <Github className="w-5 h-5 text-sky-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">GitHub Activity</h4>
                      <p className="text-[9px] text-gray-500">@{profileStats.githubStats.username}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-400 font-semibold">
                      <span>Total Contributions:</span>
                      <span className="text-white font-bold">{profileStats.githubStats.totalContributions}</span>
                    </div>

                    {/* Heatmap grid (last 30 days) */}
                    <div>
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Last 30 Days Activity</span>
                      <div className="grid grid-cols-10 gap-1.5">
                        {profileStats.githubStats.contributions.map((c, i) => (
                          <div 
                            key={i} 
                            className={`aspect-square w-full rounded-sm ${getCommitColorClass(c.count)}`}
                            title={`${c.date}: ${c.count} contributions`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-[#0d0d14]/20 border border-white/5 border-dashed p-6 rounded-2xl flex items-center justify-center gap-3">
              <AlertCircle className="w-5 h-5 text-gray-600" />
              <p className="text-xs text-gray-500 font-medium">Link your public coding profile links above to fetch and display coding performance stats cards here.</p>
            </div>
          )}

          {/* Form to add manual solved problems */}
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
                  className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 font-semibold text-white transition-colors text-xs flex items-center justify-center gap-1 disabled:opacity-50 cursor-pointer"
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
            
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
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
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
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
      </div>
    </div>
  )
}
