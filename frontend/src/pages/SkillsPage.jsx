import React, { useState, useEffect } from 'react'
import { skillService } from '../services/skillService'
import Badge from '../components/common/Badge'
import { Plus, Trash2, ShieldAlert, Award, Star, Compass, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'

export default function SkillsPage() {
  const [skills, setSkills] = useState([])
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillLevel, setNewSkillLevel] = useState('BEGINNER')
  const [targetRole, setTargetRole] = useState('')
  
  const [adding, setAdding] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [skillsLoading, setSkillsLoading] = useState(true)

  const [gapResult, setGapResult] = useState(null)

  useEffect(() => {
    fetchSkills()
  }, [])

  const fetchSkills = async () => {
    try {
      const response = await skillService.getSkills()
      setSkills(response.data.data)
    } catch (error) {
      toast.error('Failed to load skills')
    } finally {
      setSkillsLoading(false)
    }
  }

  const handleAddSkill = async (e) => {
    e.preventDefault()
    if (!newSkillName.trim()) return

    setAdding(true)
    try {
      const response = await skillService.addSkill({
        skillName: newSkillName.trim(),
        level: newSkillLevel
      })
      setSkills([...skills, response.data.data])
      setNewSkillName('')
      toast.success('Skill added!')
    } catch (error) {
      toast.error('Failed to add skill')
    } finally {
      setAdding(false)
    }
  }

  const handleDeleteSkill = async (id) => {
    try {
      await skillService.deleteSkill(id)
      setSkills(skills.filter(s => s.id !== id))
      toast.success('Skill deleted')
    } catch (error) {
      toast.error('Failed to delete skill')
    }
  }

  const handleAnalyzeGap = async () => {
    if (!targetRole.trim()) {
      toast.error('Please enter a target role')
      return
    }

    setAnalyzing(true)
    try {
      const response = await skillService.analyzeGap({
        targetRole: targetRole.trim(),
        currentSkills: skills.map(s => s.skillName)
      })
      setGapResult(response.data.data)
      toast.success('Gap analysis completed!')
    } catch (error) {
      toast.error('Failed to perform gap analysis')
    } finally {
      setAnalyzing(false)
    }
  }

  const getLevelColor = (level) => {
    switch (level) {
      case 'ADVANCED': return 'green'
      case 'INTERMEDIATE': return 'orange'
      default: return 'blue'
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-8"
    >
      {/* Left panel - Skill manager */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-[#0d0d14]/40 border border-white/5 p-6 rounded-2xl backdrop-blur-xl space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-sky-400" /> Skill Inventory
          </h3>
          <p className="text-gray-400 text-xs">Maintain your current set of technical and soft skill proficiencies below.</p>

          {/* Add skill form */}
          <form onSubmit={handleAddSkill} className="space-y-3">
            <div>
              <input
                type="text"
                required
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/5 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500/40 focus:ring-1 focus:ring-sky-500/20 transition-all text-xs font-medium"
                placeholder="Skill name (e.g. Java)"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={newSkillLevel}
                onChange={(e) => setNewSkillLevel(e.target.value)}
                className="flex-grow px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-300 font-medium focus:outline-none focus:border-sky-500/40"
              >
                <option value="BEGINNER" className="bg-[#0b0b12]">Beginner</option>
                <option value="INTERMEDIATE" className="bg-[#0b0b12]">Intermediate</option>
                <option value="ADVANCED" className="bg-[#0b0b12]">Advanced</option>
              </select>
              <button
                type="submit"
                disabled={adding}
                className="px-4 rounded-xl bg-sky-500 hover:bg-sky-600 transition-colors flex items-center justify-center disabled:opacity-50"
              >
                {adding ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Plus className="w-4 h-4 text-white" />}
              </button>
            </div>
          </form>

          {/* Skill List */}
          <div className="border-t border-white/5 pt-4 space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {skillsLoading ? (
              <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-gray-500" /></div>
            ) : skills.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">No skills registered yet</p>
            ) : (
              skills.map((skill) => (
                <div key={skill.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 group">
                  <div className="flex items-center gap-2.5">
                    <Star className="w-3.5 h-3.5 text-sky-400" />
                    <div>
                      <p className="text-xs font-semibold text-white">{skill.skillName}</p>
                      <span className="text-[10px] text-gray-400 font-medium mt-0.5 inline-block">
                        Level: <Badge label={skill.level} color={getLevelColor(skill.level)} />
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteSkill(skill.id)}
                    className="p-1.5 rounded-lg border border-red-500/10 hover:border-red-500/30 text-red-500/60 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Right panel - Gap analysis result */}
      <div className="lg:col-span-2 space-y-6">
        {/* target role form */}
        <div className="bg-[#0d0d14]/40 border border-white/5 p-6 rounded-2xl backdrop-blur-xl flex flex-col md:flex-row items-end gap-4">
          <div className="flex-grow space-y-2">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">Target Job Profile</label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500/40 focus:ring-1 focus:ring-sky-500/20 transition-all text-sm font-semibold"
              placeholder="e.g. Java Backend Developer"
            />
          </div>
          <button
            onClick={handleAnalyzeGap}
            disabled={analyzing}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 hover:opacity-95 font-semibold text-white transition-all text-sm disabled:opacity-50 flex items-center gap-2 whitespace-nowrap h-[46px]"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing Gap...
              </>
            ) : (
              'Run Gap Analysis'
            )}
          </button>
        </div>

        {/* Results */}
        {gapResult ? (
          <div className="space-y-6">
            {/* Split Skills comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* present */}
              <div className="bg-[#0d0d14]/40 border border-white/5 p-6 rounded-2xl backdrop-blur-xl space-y-3">
                <h4 className="text-sm font-semibold text-gray-300 tracking-wider uppercase flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" /> Current Strengths
                </h4>
                <div className="flex flex-wrap gap-2">
                  {gapResult.presentSkills?.map((s, i) => (
                    <Badge key={i} label={s} color="green" />
                  ))}
                </div>
              </div>

              {/* missing */}
              <div className="bg-[#0d0d14]/40 border border-white/5 p-6 rounded-2xl backdrop-blur-xl space-y-3">
                <h4 className="text-sm font-semibold text-gray-300 tracking-wider uppercase flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" /> Missing Competencies
                </h4>
                <div className="flex flex-wrap gap-2">
                  {gapResult.missingSkills?.map((s, i) => (
                    <Badge key={i} label={s} color="red" />
                  ))}
                </div>
              </div>
            </div>

            {/* Roadmap */}
            <div className="bg-[#0d0d14]/40 border border-white/5 p-6 rounded-2xl backdrop-blur-xl space-y-6">
              <h4 className="text-sm font-semibold text-gray-300 tracking-wider uppercase flex items-center gap-2">
                <Compass className="w-4 h-4 text-sky-400" /> Generated Weekly Roadmap
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gapResult.roadmap?.map((item, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-sky-500/20 transition-all space-y-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">Week {item.week}</span>
                      <Badge label="Queued" color="gray" />
                    </div>
                    <h5 className="font-semibold text-white text-sm">{item.topic}</h5>
                    <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#0d0d14]/40 border border-white/5 p-12 rounded-2xl backdrop-blur-xl flex flex-col items-center justify-center text-center h-full min-h-[350px]">
            <Compass className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No Analysis Active</h3>
            <p className="text-xs text-gray-500 max-w-sm">Enter your target placement job profile above and execute the analysis command to map skills roadmap.</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
