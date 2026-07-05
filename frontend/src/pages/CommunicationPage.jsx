import React, { useState } from 'react'
import { communicationService } from '../services/communicationService'
import { MessageSquare, Sparkles, AlertCircle, RefreshCw, Send, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'

export default function CommunicationPage() {
  const [speechText, setSpeechText] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)

  // Real-time filler word highlighting helper
  const fillerWordList = ['like', 'um', 'ah', 'you know', 'so', 'actually', 'basically', 'literally']
  
  const getFillerCounts = () => {
    if (!speechText.trim()) return {}
    const words = speechText.toLowerCase().split(/\s+/)
    const counts = {}
    fillerWordList.forEach(filler => {
      const matchCount = words.filter(w => {
        // Remove basic punctuation
        const cleanWord = w.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"")
        return cleanWord === filler
      }).length
      if (matchCount > 0) counts[filler] = matchCount
    })
    return counts
  }

  const fillerCounts = getFillerCounts()
  const totalFillers = Object.values(fillerCounts).reduce((a, b) => a + b, 0)

  const handleAnalyze = async (e) => {
    e.preventDefault()
    if (!speechText.trim()) return

    setAnalyzing(true)
    try {
      const response = await communicationService.evaluateSpeech(speechText.trim())
      setResult(response.data.data)
      toast.success('Speech analyzed successfully! 🎉')
    } catch (error) {
      toast.error('Failed to analyze speech. Please check connection.')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleReset = () => {
    setSpeechText('')
    setResult(null)
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-sky-400" /> AI Communication Coach
        </h1>
        <p className="text-xs text-gray-400 mt-1 font-medium">
          Paste or type your verbal responses below to check grammatical correctness, fluency, and identify unnecessary filler words.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Speech Input */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0d0d14]/40 border border-white/5 p-6 rounded-2xl backdrop-blur-xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-white">Your Spoken Response</h3>
              {speechText.trim() && (
                <button
                  onClick={handleReset}
                  className="text-[10px] text-gray-500 hover:text-white flex items-center gap-1 font-medium transition-colors"
                >
                  <RefreshCw className="w-3 h-3" /> Clear Text
                </button>
              )}
            </div>

            <form onSubmit={handleAnalyze} className="space-y-4">
              <textarea
                value={speechText}
                onChange={(e) => setSpeechText(e.target.value)}
                rows={8}
                required
                className="w-full p-4 rounded-xl bg-white/5 border border-white/5 text-white placeholder-gray-500 focus:outline-none focus:border-sky-500/40 text-xs font-semibold leading-relaxed"
                placeholder="Type or paste your response here (e.g., your answer to 'Tell me about yourself')..."
              />

              {/* Real-time Filler indicators */}
              {speechText.trim() && (
                <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    <span>Detected Filler Words</span>
                    <span className={totalFillers > 5 ? 'text-amber-400' : 'text-emerald-400'}>
                      Total: {totalFillers}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {fillerWordList.map(filler => {
                      const count = fillerCounts[filler] || 0;
                      return (
                        <span 
                          key={filler}
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition-all ${
                            count > 0 
                              ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' 
                              : 'bg-white/5 border border-white/5 text-gray-500'
                          }`}
                        >
                          {filler} {count > 0 && `(${count})`}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={analyzing || !speechText.trim()}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-sky-500/10 cursor-pointer"
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing Speech Delivery...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Run Performance Evaluation
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Analysis Results */}
        <div className="lg:col-span-1">
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-[#0d0d14]/20 border border-white/5 border-dashed p-8 rounded-2xl text-center h-full flex flex-col justify-center items-center space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-gray-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Analysis Pending</h4>
                  <p className="text-[10px] text-gray-500 mt-1 max-w-[200px] leading-relaxed mx-auto font-medium">
                    Submit your response on the left. The AI coach will generate scorecards, filler indexes, and recommendations.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Scorecards */}
                <div className="bg-[#0d0d14]/40 border border-white/5 p-6 rounded-2xl backdrop-blur-xl space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-sky-400" /> Delivery Scores
                  </h3>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {/* Grammar Score */}
                    <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl text-center space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Grammar</span>
                      <span className="text-lg font-black text-white">{result.grammarScore}</span>
                      <span className="text-[9px] text-gray-500 block font-medium">/10</span>
                    </div>

                    {/* Fluency Score */}
                    <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl text-center space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Fluency</span>
                      <span className="text-lg font-black text-white">{result.fluencyScore}</span>
                      <span className="text-[9px] text-gray-500 block font-medium">/10</span>
                    </div>

                    {/* Confidence Score */}
                    <div className="p-3.5 bg-white/5 border border-white/5 rounded-xl text-center space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Confidence</span>
                      <span className="text-lg font-black text-white">{result.confidenceScore}</span>
                      <span className="text-[9px] text-gray-500 block font-medium">/10</span>
                    </div>
                  </div>
                </div>

                {/* Suggestions List */}
                <div className="bg-[#0d0d14]/40 border border-white/5 p-6 rounded-2xl backdrop-blur-xl space-y-4">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-400" /> Coach Suggestions
                  </h3>

                  <ul className="space-y-3 pr-1">
                    {result.suggestions.length === 0 ? (
                      <p className="text-[10px] text-gray-500 font-medium">Excellent delivery. No suggestions.</p>
                    ) : (
                      result.suggestions.map((sug, idx) => (
                        <li key={idx} className="flex gap-2 text-[10px] font-medium text-gray-400 leading-relaxed">
                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-1.5 flex-shrink-0" />
                          <span>{sug}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>

                {/* Overall Feedback */}
                <div className="bg-[#0d0d14]/40 border border-white/5 p-6 rounded-2xl backdrop-blur-xl space-y-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Coach Verdict</h3>
                  <p className="text-[10px] leading-relaxed text-gray-400 font-medium">
                    {result.feedback}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>

    </div>
  )
}
