import React, { useState, useEffect } from 'react'
import { resumeService } from '../services/resumeService'
import Badge from '../components/common/Badge'
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, AlertCircle, Clock, Loader2, Sparkles, Briefcase } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'

export default function ResumePage() {
  const [file, setFile] = useState(null)
  const [targetRole, setTargetRole] = useState('')
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [history, setHistory] = useState([])
  const [historyLoading, setHistoryLoading] = useState(true)
  
  // Job Matcher tab state
  const [activeSubTab, setActiveSubTab] = useState('audit') // 'audit' or 'matches'
  const [jobMatches, setJobMatches] = useState([])
  const [matchesLoading, setMatchesLoading] = useState(false)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    try {
      const response = await resumeService.getAll()
      setHistory(response.data.data)
      if (response.data.data.length > 0) {
        const latest = response.data.data[response.data.data.length - 1]
        try {
          const parsed = JSON.parse(latest.feedback)
          setAnalysis({
            atsScore: latest.atsScore,
            ...parsed
          })
        } catch (e) {
          setAnalysis({
            atsScore: latest.atsScore,
            overallFeedback: latest.feedback,
            presentKeywords: [],
            missingKeywords: [],
            suggestions: []
          })
        }
      }
    } catch (error) {
      // Ignore
    } finally {
      setHistoryLoading(false)
    }
  }

  // Fetch job recommendations
  const fetchJobMatches = async () => {
    setMatchesLoading(true)
    try {
      const response = await resumeService.getJobMatches()
      setJobMatches(response.data.data || [])
    } catch (e) {
      toast.error('Failed to load job matching recommendations.')
    } finally {
      setMatchesLoading(false)
    }
  }

  useEffect(() => {
    if (activeSubTab === 'matches' && jobMatches.length === 0 && analysis) {
      fetchJobMatches()
    }
  }, [activeSubTab, analysis])

  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      toast.error('Please upload a resume file')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('targetRole', targetRole || 'Software Developer')

    setLoading(true)
    try {
      const response = await resumeService.upload(formData)
      const data = response.data.data
      toast.success('Resume analyzed successfully!')
      
      let parsed = {}
      try {
        parsed = JSON.parse(data.feedback)
      } catch (e) {
        parsed = {
          overallFeedback: data.feedback,
          presentKeywords: [],
          missingKeywords: [],
          suggestions: []
        }
      }

      setAnalysis({
        atsScore: data.atsScore,
        ...parsed
      })
      setJobMatches([]) // Reset matches so they refresh
      fetchHistory()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to analyze resume')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-400 stroke-emerald-400'
    if (score >= 60) return 'text-amber-400 stroke-amber-400'
    return 'text-rose-400 stroke-rose-400'
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 lg:grid-cols-3 gap-8"
    >
      {/* Left panel - Upload form */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-[#0d0d14]/40 border border-white/5 p-6 rounded-2xl backdrop-blur-xl">
          <h3 className="text-lg font-bold text-white mb-4">Resume Optimizer Agent</h3>
          <p className="text-gray-400 text-xs mb-6">Upload your resume PDF to receive an instant ATS score rating and keyword gap recommendations.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Target Job Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500/40 focus:ring-1 focus:ring-sky-500/20 transition-all text-sm"
                placeholder="e.g. Java Backend Developer"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Upload Resume (PDF)</label>
              <div className="relative border-2 border-dashed border-white/10 hover:border-sky-500/30 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-white/5">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-10 h-10 text-gray-500 mb-3" />
                <p className="text-sm font-semibold text-white truncate max-w-[200px]">
                  {file ? file.name : 'Select file'}
                </p>
                <p className="text-xs text-gray-500 mt-1">PDF format (Max 10MB)</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 hover:opacity-95 font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-sky-500/10 text-sm disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing Resume...
                </>
              ) : (
                'Submit for ATS Audit'
              )}
            </button>
          </form>
        </div>

        {/* History card list */}
        <div className="bg-[#0d0d14]/40 border border-white/5 p-6 rounded-2xl backdrop-blur-xl">
          <h4 className="text-sm font-semibold text-gray-300 tracking-wider uppercase mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" /> Previous Audits
          </h4>
          {historyLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-gray-500" /></div>
          ) : history.length === 0 ? (
            <p className="text-gray-500 text-xs text-center py-4">No audit logs available</p>
          ) : (
            <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
              {history.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-sky-400" />
                    <div>
                      <p className="text-xs font-semibold text-white">ATS Audit #{idx+1}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{new Date(item.uploadedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Badge label={`${item.atsScore}%`} color={item.atsScore >= 80 ? 'green' : item.atsScore >= 60 ? 'orange' : 'red'} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right panel - Audit & Matching Results */}
      <div className="lg:col-span-2 space-y-6">
        {analysis ? (
          <div className="space-y-6">
            
            {/* Sub-tab selection */}
            <div className="flex gap-2 p-1 bg-white/5 border border-white/5 rounded-xl w-fit">
              <button
                onClick={() => setActiveSubTab('audit')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeSubTab === 'audit' 
                    ? 'bg-sky-500 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" /> ATS Optimization
              </button>
              <button
                onClick={() => setActiveSubTab('matches')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeSubTab === 'matches' 
                    ? 'bg-sky-500 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Briefcase className="w-4 h-4" /> AI Job Matcher
              </button>
            </div>

            <AnimatePresence mode="wait">
              {activeSubTab === 'audit' ? (
                <motion.div
                  key="audit"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* ATS Score card */}
                  <div className="bg-[#0d0d14]/40 border border-white/5 p-6 rounded-2xl backdrop-blur-xl flex flex-col md:flex-row items-center gap-8">
                    {/* Circular Gauge */}
                    <div className="relative w-36 h-36 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="72" cy="72" r="62" stroke="rgba(255,255,255,0.03)" strokeWidth="8" fill="transparent" />
                        <circle 
                          cx="72" 
                          cy="72" 
                          r="62" 
                          stroke="currentColor" 
                          strokeWidth="8" 
                          fill="transparent" 
                          strokeDasharray={2 * Math.PI * 62}
                          strokeDashoffset={2 * Math.PI * 62 * (1 - analysis.atsScore / 100)}
                          className={`${getScoreColor(analysis.atsScore)} transition-all duration-1000 ease-out`}
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-3xl font-extrabold text-white">{analysis.atsScore}</span>
                        <span className="text-[9px] text-gray-500 font-bold tracking-wider uppercase mt-0.5">ATS SCORE</span>
                      </div>
                    </div>

                    {/* Overall Feedback */}
                    <div className="flex-grow space-y-3 text-center md:text-left">
                      <div className="flex items-center gap-2 justify-center md:justify-start">
                        <h3 className="text-xl font-bold text-white">Audit Evaluation</h3>
                        {analysis.atsScore >= 80 ? (
                          <Badge label="Strong Match" color="green" />
                        ) : analysis.atsScore >= 60 ? (
                          <Badge label="Needs Tweaks" color="orange" />
                        ) : (
                          <Badge label="Poor Match" color="red" />
                        )}
                      </div>
                      <p className="text-sm text-gray-400 leading-relaxed">{analysis.overallFeedback}</p>
                    </div>
                  </div>

                  {/* Keywords grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Present Keywords */}
                    <div className="bg-[#0d0d14]/40 border border-white/5 p-6 rounded-2xl backdrop-blur-xl space-y-4">
                      <h4 className="text-sm font-semibold text-gray-300 tracking-wider uppercase flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Present Keywords
                      </h4>
                      {analysis.presentKeywords?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {analysis.presentKeywords.map((kw, i) => (
                            <Badge key={i} label={kw} color="green" />
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 italic">No key matching elements identified</p>
                      )}
                    </div>

                    {/* Missing Keywords */}
                    <div className="bg-[#0d0d14]/40 border border-white/5 p-6 rounded-2xl backdrop-blur-xl space-y-4">
                      <h4 className="text-sm font-semibold text-gray-300 tracking-wider uppercase flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400" /> Missing Core Keywords
                      </h4>
                      {analysis.missingKeywords?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {analysis.missingKeywords.map((kw, i) => (
                            <Badge key={i} label={kw} color="red" />
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-emerald-500 italic">Your resume aligns perfectly with required keywords!</p>
                      )}
                    </div>
                  </div>

                  {/* Suggestions */}
                  <div className="bg-[#0d0d14]/40 border border-white/5 p-6 rounded-2xl backdrop-blur-xl space-y-4">
                    <h4 className="text-sm font-semibold text-gray-300 tracking-wider uppercase flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-400" /> Improvement Action Items
                    </h4>
                    {analysis.suggestions?.length > 0 ? (
                      <ul className="space-y-2.5">
                        {analysis.suggestions.map((sg, i) => (
                          <li key={i} className="text-xs text-gray-400 leading-relaxed flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                            {sg}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-gray-500 italic">No recommendations required</p>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="matches"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {matchesLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4 bg-[#0d0d14]/40 border border-white/5 rounded-2xl">
                      <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
                      <p className="text-xs text-gray-400 font-medium">Running compatibility matches for job roles...</p>
                    </div>
                  ) : jobMatches.length === 0 ? (
                    <div className="bg-[#0d0d14]/40 border border-white/5 p-12 rounded-2xl backdrop-blur-xl flex flex-col items-center justify-center text-center h-full min-h-[300px]">
                      <Briefcase className="w-12 h-12 text-gray-600 mb-4" />
                      <h3 className="text-sm font-bold text-white mb-2">No Job Matches Recommended</h3>
                      <p className="text-[10px] text-gray-500 max-w-xs mx-auto">Click evaluate or retry to query recommended career matching profiles.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {jobMatches.map((job, idx) => (
                        <div 
                          key={idx}
                          className="bg-[#0d0d14]/40 border border-white/5 p-6 rounded-2xl backdrop-blur-xl flex flex-col md:flex-row gap-6 items-start"
                        >
                          {/* Match Percent Circle */}
                          <div className="relative w-20 h-20 flex-shrink-0 flex items-center justify-center self-center md:self-start">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle cx="40" cy="40" r="34" stroke="rgba(255,255,255,0.03)" strokeWidth="5" fill="transparent" />
                              <circle 
                                cx="40" 
                                cy="40" 
                                r="34" 
                                stroke="currentColor" 
                                strokeWidth="5" 
                                fill="transparent" 
                                strokeDasharray={2 * Math.PI * 34}
                                strokeDashoffset={2 * Math.PI * 34 * (1 - job.matchPercentage / 100)}
                                className={`${getScoreColor(job.matchPercentage)} transition-all duration-1000`}
                              />
                            </svg>
                            <span className="absolute text-sm font-extrabold text-white">{job.matchPercentage}%</span>
                          </div>

                          {/* Matching Details */}
                          <div className="flex-grow space-y-3">
                            <div>
                              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                {job.role}
                              </h4>
                              <p className="text-[11px] text-gray-400 leading-relaxed mt-1">{job.reason}</p>
                            </div>

                            {/* Skills Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                              {/* Matching Skills */}
                              <div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Matched Skills</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {job.requiredSkills.map((s, i) => (
                                    <Badge key={i} label={s} color="green" />
                                  ))}
                                </div>
                              </div>

                              {/* Skills to Acquire */}
                              <div>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5">Missing Skills to Learn</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {job.skillsToAcquire.map((s, i) => (
                                    <Badge key={i} label={s} color="red" />
                                  ))}
                                </div>
                              </div>
                            </div>

                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        ) : (
          <div className="bg-[#0d0d14]/40 border border-white/5 p-12 rounded-2xl backdrop-blur-xl flex flex-col items-center justify-center text-center h-full min-h-[400px]">
            <FileText className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">No Resume Audit Active</h3>
            <p className="text-xs text-gray-500 max-w-sm">Upload your first resume on the left panel to trigger the resume analysis and job matching engine.</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
