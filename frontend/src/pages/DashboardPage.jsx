import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { dashboardService } from '../services/dashboardService'
import { codingService } from '../services/codingService'
import StatCard from '../components/common/StatCard'
import ProgressBar from '../components/common/ProgressBar'
import { 
  FileText, 
  MessageSquare, 
  Code2, 
  Map, 
  Sparkles, 
  ArrowUpRight, 
  TrendingUp, 
  Terminal 
} from 'lucide-react'
import { motion } from 'framer-motion'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar 
} from 'recharts'
import { toast } from 'react-hot-toast'

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [todayPlan, setTodayPlan] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [dashRes, planRes] = await Promise.all([
        dashboardService.getDashboard(),
        codingService.getTodaysPlan()
      ])
      setStats(dashRes.data.data)
      setTodayPlan(planRes.data.data)
    } catch (error) {
      toast.error('Failed to fetch dashboard metrics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-sky-400 animate-spin" />
      </div>
    )
  }

  // Fallback / mock data for visual charts if values are 0
  const radarData = [
    { subject: 'Resume Score', A: stats?.atsScore || 70, fullMark: 100 },
    { subject: 'Coding Skill', A: (stats?.solvedProblems * 10) || 50, fullMark: 100 },
    { subject: 'Interview Prep', A: (stats?.avgInterviewScore * 10) || 60, fullMark: 100 },
    { subject: 'Roadmap Completion', A: stats?.totalRoadmapItems ? (stats.completedRoadmapItems / stats.totalRoadmapItems * 100) : 40, fullMark: 100 },
    { subject: 'Skill Index', A: (stats?.totalSkills * 15) || 45, fullMark: 100 },
  ]

  const barData = [
    { name: 'Java', Score: 8 },
    { name: 'Spring', Score: 7 },
    { name: 'SQL', Score: 9 },
    { name: 'HR Prep', Score: 8 },
  ]

  const quickActions = [
    { label: 'Analyze Resume', to: '/resume', icon: FileText, desc: 'Improve your ATS score', color: 'blue' },
    { label: 'Mock Interview', to: '/interview', icon: MessageSquare, desc: 'Practice with AI Agent', color: 'purple' },
    { label: 'Coding mentor', to: '/coding', icon: Code2, desc: 'Recommended problems', color: 'orange' },
    { label: 'View Roadmap', to: '/roadmap', icon: Map, desc: 'Follow weekly timeline', color: 'green' },
  ]

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-sky-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
            Hey, {stats?.userName || 'Scholar'}!
          </h2>
          <p className="text-gray-400 text-sm mt-1">Here is your customized learning trajectory for today.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl text-emerald-400 text-sm font-semibold">
          <Sparkles className="w-4 h-4" /> Ready for placement
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          title="Resume ATS Score" 
          value={stats?.atsScore ? `${stats.atsScore}%` : 'N/A'} 
          subtitle="Latest uploaded resume" 
          icon={FileText} 
          color="blue"
          index={0}
        />
        <StatCard 
          title="Coding Progress" 
          value={`${stats?.solvedProblems || 0}/${stats?.totalProblems || 150}`} 
          subtitle="LeetCode-style resolved" 
          icon={Code2} 
          color="orange"
          index={1}
        />
        <StatCard 
          title="Mock Interviews" 
          value={stats?.totalInterviews || 0} 
          subtitle={`Avg score: ${stats?.avgInterviewScore || 0}/10`} 
          icon={MessageSquare} 
          color="purple"
          index={2}
        />
        <StatCard 
          title="Learning Roadmap" 
          value={`${stats?.completedRoadmapItems || 0}/${stats?.totalRoadmapItems || 0}`} 
          subtitle="Weekly milestones achieved" 
          icon={Map} 
          color="green"
          index={3}
        />
      </div>

      {/* Main dashboard body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 columns - Charts & Quick Actions */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Charts card container */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#0d0d14]/40 border border-white/5 p-6 rounded-2xl backdrop-blur-xl">
            {/* Skills Radar */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-sky-400" /> Skill Competencies
              </h3>
              <div className="h-[250px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" radius="70%" data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.05)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#4b5563', fontSize: 8 }} />
                    <Radar name="Performance" dataKey="A" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Scores Bar */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-300 tracking-wider uppercase flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-violet-400" /> Topic Strengths
              </h3>
              <div className="h-[250px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 10]} tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ background: '#0d0d14', border: '1px solid rgba(255,255,255,0.08)' }} />
                    <Bar dataKey="Score" fill="url(#violetGradient)" radius={[4, 4, 0, 0]} />
                    <defs>
                      <linearGradient id="violetGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#0ea5e9" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">Quick Agent Tools</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {quickActions.map((action, i) => (
                <Link 
                  key={i}
                  to={action.to}
                  className="group block p-5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all duration-300 hover:scale-[1.01]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-white/5 border border-white/5 group-hover:border-sky-500/30 group-hover:bg-sky-500/5 transition-all">
                        <action.icon className="w-6 h-6 text-sky-400" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-white group-hover:text-sky-400 transition-colors flex items-center gap-1.5">
                          {action.label}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">{action.desc}</p>
                      </div>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* Right column - Study Plan */}
        <div className="bg-[#0d0d14]/40 border border-white/5 p-6 rounded-2xl backdrop-blur-xl h-fit space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/5 pb-4">
            <Terminal className="w-5 h-5 text-amber-400 animate-pulse" /> Today's Custom Routine
          </h3>
          
          <div className="prose prose-invert max-w-none text-sm text-gray-300 leading-relaxed font-mono whitespace-pre-wrap">
            {todayPlan || 'Ready to analyze your profile. Navigate to Skill Gap to generate roadmap items!'}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
