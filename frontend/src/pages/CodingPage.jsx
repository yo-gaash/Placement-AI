import React, { useState, useEffect } from 'react'
import { codingService } from '../services/codingService'
import Badge from '../components/common/Badge'
import { Sparkles, Terminal, BookOpen, GitBranch, Github, Code2, AlertCircle, ExternalLink, Star, Compass, Loader2, Search, Check, Circle, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'

export default function CodingPage() {
  // Profile links state
  const [leetcodeUrl, setLeetcodeUrl] = useState('')
  const [gfgUrl, setGfgUrl] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [syncing, setSyncing] = useState(false)
  const [profileStats, setProfileStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)

  // Curated workspace tab selection
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState('leetcode') // 'leetcode' | 'gfg' | 'github'

  // Dynamic Problems list states
  const [leetcodeProblems, setLeetcodeProblems] = useState([])
  const [gfgProblems, setGfgProblems] = useState([])
  const [problemsLoading, setProblemsLoading] = useState(true)

  // Filter & Search states
  const [selectedTopic, setSelectedTopic] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('All') // 'All' | 'EASY' | 'MEDIUM' | 'HARD'

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 50

  // Interactive Checklist (State loaded from localStorage)
  const [solvedProblems, setSolvedProblems] = useState(() => {
    const saved = localStorage.getItem('user_solved_problems_checklist')
    return saved ? JSON.parse(saved) : {}
  })

  // AI recommendations
  const [recommendations, setRecommendations] = useState([])
  const [recsLoading, setRecsLoading] = useState(true)

  // Daily Schedule state
  const [todayPlan, setTodayPlan] = useState('')
  const [planLoading, setPlanLoading] = useState(true)

  useEffect(() => {
    fetchRecommendations()
    fetchDailyPlan()
    fetchProfileStats()
    fetchAllProblems()
  }, [])

  // Reset page number on filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedTopic, searchQuery, difficultyFilter, activeWorkspaceTab])

  const fetchRecommendations = async () => {
    try {
      const response = await codingService.getRecommendations()
      setRecommendations(response.data.data)
    } catch (error) {
      // Ignore
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

  const fetchAllProblems = async () => {
    setProblemsLoading(true)
    try {
      const [lcRes, gfgRes] = await Promise.all([
        codingService.getLeetCodeProblems(),
        codingService.getGfgProblems()
      ])
      setLeetcodeProblems(lcRes.data.data || [])
      setGfgProblems(gfgRes.data.data || [])
    } catch (error) {
      toast.error('Failed to load complete problems set from backend')
    } finally {
      setProblemsLoading(false)
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

  const toggleProblemSolved = (platform, id) => {
    const key = `${platform}_${id}`
    const updated = { ...solvedProblems, [key]: !solvedProblems[key] }
    setSolvedProblems(updated)
    localStorage.setItem('user_solved_problems_checklist', JSON.stringify(updated))
  }

  const getDiffColorClass = (diff) => {
    switch (diff) {
      case 'HARD': return 'text-rose-500 font-bold'
      case 'MEDIUM': return 'text-amber-500 font-bold'
      default: return 'text-emerald-500 font-bold'
    }
  }

  const getDiffBadgeColor = (diff) => {
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

  // Active list based on selected workspace tab
  const currentProblems = activeWorkspaceTab === 'leetcode' ? leetcodeProblems : gfgProblems

  // Filter problems based on query inputs
  const filteredProblems = currentProblems.filter(prob => {
    const matchesSearch = prob.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          prob.id.toString().includes(searchQuery)
    const matchesTopic = selectedTopic === 'All' || prob.topic === selectedTopic
    const matchesDiff = difficultyFilter === 'All' || prob.diff === difficultyFilter
    return matchesSearch && matchesTopic && matchesDiff
  })

  // Dynamic pagination helpers
  const totalProblemsCount = filteredProblems.length
  const totalPages = Math.max(1, Math.ceil(totalProblemsCount / pageSize))
  const paginatedProblems = filteredProblems.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // Get topics list with counts for display
  const getTopicCounts = () => {
    const counts = {}
    currentProblems.forEach(p => {
      counts[p.topic] = (counts[p.topic] || 0) + 1
    })
    return counts
  }

  const topicCounts = getTopicCounts()
  const topicsList = ['All', ...Object.keys(topicCounts)]

  // Calculate local solved count for the active list
  const localSolvedCount = currentProblems.filter(p => solvedProblems[`${activeWorkspaceTab}_${p.id}`]).length

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
        
        {/* Left panel - Stats & Dynamic problem workspaces */}
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

          {/* Curated workspace direct portals */}
          <div className="bg-[#0d0d14]/40 border border-white/5 p-6 rounded-2xl backdrop-blur-xl space-y-6">
            
            {/* Nav selection */}
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-sky-400" /> Workspace Practice Portals
              </h3>

              <div className="flex gap-1.5 bg-white/5 border border-white/5 rounded-xl p-1">
                <button
                  onClick={() => { setActiveWorkspaceTab('leetcode'); setSelectedTopic('All'); }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeWorkspaceTab === 'leetcode' ? 'bg-sky-500 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  LeetCode
                </button>
                <button
                  onClick={() => { setActiveWorkspaceTab('gfg'); setSelectedTopic('All'); }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeWorkspaceTab === 'gfg' ? 'bg-sky-500 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  GeeksforGeeks
                </button>
                <button
                  onClick={() => { setActiveWorkspaceTab('github'); setSelectedTopic('All'); }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    activeWorkspaceTab === 'github' ? 'bg-sky-500 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  GitHub
                </button>
              </div>
            </div>

            {/* Inner workspaces content mapping */}
            {problemsLoading && activeWorkspaceTab !== 'github' ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Syncing full problem sets database from backend...</p>
              </div>
            ) : activeWorkspaceTab !== 'github' ? (
              <div className="space-y-6">
                
                {/* Topic/Pattern tag list */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Topic Patterns / Categories</span>
                  <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto pr-2">
                    {topicsList.map((topic, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedTopic(topic)}
                        className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          selectedTopic === topic
                            ? 'bg-sky-500/10 border-sky-500/40 text-sky-400'
                            : 'bg-white/5 border-white/5 text-gray-400 hover:text-white'
                        }`}
                      >
                        <span>{topic}</span>
                        <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-extrabold ${
                          selectedTopic === topic ? 'bg-sky-500/20 text-sky-300' : 'bg-white/5 text-gray-500'
                        }`}>
                          {topic === 'All' ? currentProblems.length : topicCounts[topic]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filter and Search Bar row */}
                <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                  
                  {/* Left: Search input */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search questions by title or number..."
                      className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/5 rounded-xl text-xs font-semibold text-white placeholder-gray-500 focus:outline-none focus:border-sky-500/40"
                    />
                  </div>

                  {/* Center: Difficulty Dropdown */}
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                      value={difficultyFilter}
                      onChange={(e) => setDifficultyFilter(e.target.value)}
                      className="px-3.5 py-2.5 bg-white/5 border border-white/5 rounded-xl text-xs font-semibold text-gray-400 focus:outline-none focus:border-sky-500/40"
                    >
                      <option value="All" className="bg-[#09090e]">All Difficulties</option>
                      <option value="EASY" className="bg-[#09090e]">Easy</option>
                      <option value="MEDIUM" className="bg-[#09090e]">Medium</option>
                      <option value="HARD" className="bg-[#09090e]">Hard</option>
                    </select>
                  </div>

                  {/* Right: Solved Progress indicator */}
                  <div className="text-right">
                    <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block">Checklist Progress</span>
                    <span className="text-xs font-bold text-sky-400">
                      {localSolvedCount} / {currentProblems.length} Solved
                    </span>
                  </div>

                </div>

                {/* Problem table grid */}
                <div className="border border-white/5 rounded-xl overflow-hidden bg-white/[0.01]">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02] text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        <th className="py-3 px-4 w-12 text-center">Solved</th>
                        <th className="py-3 px-4">Title</th>
                        <th className="py-3 px-4 w-28">Acceptance</th>
                        <th className="py-3 px-4 w-28">Difficulty</th>
                        <th className="py-3 px-4 w-16 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedProblems.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="py-12 text-center text-xs text-gray-500 font-medium">
                            No matching problems found. Try adjusting search or tag filters.
                          </td>
                        </tr>
                      ) : (
                        paginatedProblems.map((prob) => {
                          const isSolved = solvedProblems[`${activeWorkspaceTab}_${prob.id}`]
                          return (
                            <tr 
                              key={prob.id}
                              className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group"
                            >
                              <td className="py-3.5 px-4 text-center">
                                <button
                                  onClick={() => toggleProblemSolved(activeWorkspaceTab, prob.id)}
                                  className="focus:outline-none cursor-pointer"
                                >
                                  {isSolved ? (
                                    <Check className="w-4 h-4 text-emerald-500 fill-emerald-500/10 stroke-[3]" />
                                  ) : (
                                    <Circle className="w-4 h-4 text-gray-600 hover:text-sky-500 transition-colors" />
                                  )}
                                </button>
                              </td>
                              <td className="py-3.5 px-4">
                                <a
                                  href={
                                    activeWorkspaceTab === 'leetcode'
                                      ? `https://leetcode.com/problems/${prob.slug}/`
                                      : `https://practice.geeksforgeeks.org/problems/${prob.slug}/1`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs font-bold text-gray-200 hover:text-sky-400 transition-colors flex items-center gap-1.5"
                                >
                                  <span>{prob.id}. {prob.name}</span>
                                  <span className="text-[9px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-md font-bold block md:inline border border-white/5">
                                    {prob.topic}
                                  </span>
                                </a>
                              </td>
                              <td className="py-3.5 px-4 text-xs font-semibold text-gray-400">
                                {prob.acceptance}
                              </td>
                              <td className="py-3.5 px-4 text-xs font-bold">
                                <span className={getDiffColorClass(prob.diff)}>
                                  {prob.diff === 'MEDIUM' ? 'Medium' : prob.diff === 'HARD' ? 'Hard' : 'Easy'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <a
                                  href={
                                    activeWorkspaceTab === 'leetcode'
                                      ? `https://leetcode.com/problems/${prob.slug}/`
                                      : `https://practice.geeksforgeeks.org/problems/${prob.slug}/1`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center justify-center p-1 rounded-md text-gray-500 hover:text-white transition-colors"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </td>
                            </tr>
                          )
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-between items-center bg-white/[0.02] border border-white/5 px-4 py-3 rounded-xl">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">
                      Showing {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalProblemsCount)} of {totalProblemsCount}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-all cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      <span className="text-xs font-bold text-white px-2">
                        Page {currentPage} of {totalPages}
                      </span>

                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-gray-400 hover:text-white disabled:opacity-30 disabled:hover:text-gray-400 transition-all cursor-pointer"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              // GitHub Projects Workspace (showing ALL fetched repositories)
              <div className="space-y-4">
                {!profileStats?.githubStats?.repos || profileStats.githubStats.repos.length === 0 ? (
                  <div className="text-center py-12 bg-white/[0.02] border border-white/5 rounded-xl text-gray-500 text-xs font-medium">
                    <Github className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    Add a GitHub Profile URL above to fetch your repositories listing dynamically.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profileStats.githubStats.repos.map((repo, idx) => (
                      <a
                        key={idx}
                        href={repo.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-sky-500/30 flex flex-col justify-between transition-all group cursor-pointer text-left space-y-3"
                      >
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-white group-hover:text-sky-400 transition-colors flex items-center justify-between">
                            <span className="truncate w-40">{repo.name}</span>
                            <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-white" />
                          </h4>
                          <p className="text-[10px] text-gray-400 leading-normal line-clamp-2">
                            {repo.description}
                          </p>
                        </div>

                        <div className="flex justify-between items-center pt-1 border-t border-white/[0.03]">
                          <span className="text-[9px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/10 px-2 py-0.5 rounded-md">
                            {repo.language}
                          </span>
                          <div className="flex items-center gap-1 text-[9px] font-bold text-gray-400 group-hover:text-amber-400 transition-colors">
                            <Star className="w-3 h-3 fill-current" />
                            <span>{repo.stars}</span>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            )}

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
                      <Badge label={item.difficulty} color={getDiffBadgeColor(item.difficulty.toUpperCase())} />
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
