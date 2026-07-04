import React, { useState, useEffect } from 'react'
import { roadmapService } from '../services/roadmapService'
import ProgressBar from '../components/common/ProgressBar'
import Badge from '../components/common/Badge'
import { CheckSquare, Square, Calendar, Plus, Map, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'

export default function RoadmapPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [week, setWeek] = useState(1)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    fetchRoadmap()
  }, [])

  const fetchRoadmap = async () => {
    try {
      const response = await roadmapService.getRoadmap()
      setItems(response.data.data)
    } catch (error) {
      toast.error('Failed to load learning roadmap items')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleCompleted = async (id, currentVal) => {
    const nextVal = !currentVal
    try {
      const response = await roadmapService.markComplete(id, nextVal)
      setItems(items.map(item => item.id === id ? response.data.data : item))
      toast.success(nextVal ? 'Milestone achieved! 🏆' : 'Milestone status updated')
    } catch (error) {
      toast.error('Failed to update completion status')
    }
  }

  const handleAddItemSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return

    setAdding(true)
    try {
      const response = await roadmapService.addItem({
        title: title.trim(),
        description: description.trim(),
        weekNumber: week
      })
      setItems([...items, response.data.data].sort((a,b) => a.weekNumber - b.weekNumber))
      setTitle('')
      setDescription('')
      toast.success('Custom roadmap item added!')
    } catch (error) {
      toast.error('Failed to add custom roadmap item')
    } finally {
      setAdding(false)
    }
  }

  const completedCount = items.filter(i => i.completed).length
  const totalCount = items.length

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-8"
    >
      {/* Left panel - Progress & custom add */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* Progress status card */}
        <div className="bg-[#0d0d14]/40 border border-white/5 p-6 rounded-2xl backdrop-blur-xl space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Map className="w-5 h-5 text-sky-400" /> Roadmap Progression
          </h3>
          <p className="text-gray-400 text-xs">Analyze overall weekly roadmap milestones and schedule completion tracker.</p>
          
          <div className="pt-2">
            <ProgressBar 
              value={completedCount} 
              max={totalCount} 
              label="Overall Completion" 
              color="green" 
            />
          </div>

          <div className="border-t border-white/5 pt-4 flex justify-between text-xs font-semibold text-gray-400">
            <span>Completed weeks:</span>
            <span className="text-white">{completedCount} / {totalCount}</span>
          </div>
        </div>

        {/* Add custom item form */}
        <div className="bg-[#0d0d14]/40 border border-white/5 p-6 rounded-2xl backdrop-blur-xl">
          <h4 className="text-sm font-semibold text-gray-300 tracking-wider uppercase mb-4">Add Custom Target</h4>
          
          <form onSubmit={handleAddItemSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Goal Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500/40 text-xs font-medium"
                placeholder="e.g. Master Kafka Basics"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Short Details</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500/40 text-xs font-medium resize-none h-16"
                placeholder="Key things to cover..."
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Week number</label>
              <input
                type="number"
                min="1"
                value={week}
                onChange={(e) => setWeek(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-white focus:outline-none focus:border-sky-500/40 text-xs font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={adding}
              className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 font-semibold text-white transition-colors text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Add to Timeline
            </button>
          </form>
        </div>

      </div>

      {/* Right panel - Roadmap timeline list */}
      <div className="lg:col-span-2 bg-[#0d0d14]/40 border border-white/5 p-6 rounded-2xl backdrop-blur-xl h-fit">
        <h3 className="text-lg font-bold text-white mb-6">Learning Milestones Timeline</h3>
        
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-10 h-10 animate-spin text-gray-500" /></div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 flex flex-col items-center justify-center">
            <Map className="w-12 h-12 text-gray-600 mb-3" />
            <p className="text-xs text-gray-500">Your roadmap is currently empty. Run a Skill Gap analysis to populate it with recommendations.</p>
          </div>
        ) : (
          <div className="relative border-l border-white/5 ml-3 pl-6 space-y-6">
            {items.map((item) => (
              <div key={item.id} className="relative group">
                {/* Timeline node */}
                <button 
                  onClick={() => handleToggleCompleted(item.id, item.completed)}
                  className={`absolute -left-[37px] top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all bg-[#0a0a0f] hover:scale-110 z-10 ${
                    item.completed 
                      ? 'border-emerald-500 text-emerald-400' 
                      : 'border-white/10 text-gray-600 hover:border-sky-500/50'
                  }`}
                >
                  {item.completed ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
                </button>

                {/* Content card */}
                <div className={`p-4 rounded-xl border transition-all ${
                  item.completed 
                    ? 'bg-emerald-500/5 border-emerald-500/10 opacity-75' 
                    : 'bg-white/5 border-white/5 hover:border-sky-500/20'
                }`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">Week {item.weekNumber}</span>
                    <Badge 
                      label={item.completed ? 'Completed' : 'In Progress'} 
                      color={item.completed ? 'green' : 'blue'} 
                    />
                  </div>
                  <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                  <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{item.description}</p>
                  
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mt-3 font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    Target: {new Date(item.deadline).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
