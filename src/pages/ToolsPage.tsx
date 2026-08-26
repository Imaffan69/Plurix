import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChevronLeft, Code, Image, FileText, Search, Calculator,
  Globe, Brain, Music, Video, Palette, Wrench, Sparkles, Terminal
} from 'lucide-react'

const tools = [
  { id: 'code', icon: Code, name: 'Code Playground', desc: 'Write, run, and debug code in-browser', color: 'blue', coming: false },
  { id: 'image', icon: Image, name: 'Image Generator', desc: 'Create images with AI models', color: 'purple', coming: true },
  { id: 'files', icon: FileText, name: 'File Analyzer', desc: 'Upload and analyze documents, PDFs, images', color: 'cyan', coming: true },
  { id: 'search', icon: Search, name: 'Web Search', desc: 'Search the web with AI-powered results', color: 'emerald', coming: false },
  { id: 'translate', icon: Globe, name: 'Translator', desc: 'Translate between 50+ languages', color: 'amber', coming: true },
  { id: 'math', icon: Calculator, name: 'Math Solver', desc: 'Solve equations and math problems', color: 'rose', coming: true },
  { id: 'video', icon: Video, name: 'Video Generator', desc: 'Generate videos with AI', color: 'violet', coming: true },
  { id: 'music', icon: Music, name: 'Music Generator', desc: 'Create music with AI', color: 'pink', coming: true },
  { id: 'design', icon: Palette, name: 'Design Assistant', desc: 'AI-powered design help', color: 'orange', coming: true },
]

const colorMap: Record<string, string> = {
  blue: 'from-blue-500/20 to-blue-600/10 text-blue-400',
  purple: 'from-purple-500/20 to-purple-600/10 text-purple-400',
  cyan: 'from-cyan-500/20 to-cyan-600/10 text-cyan-400',
  emerald: 'from-emerald-500/20 to-emerald-600/10 text-emerald-400',
  amber: 'from-amber-500/20 to-amber-600/10 text-amber-400',
  rose: 'from-rose-500/20 to-rose-600/10 text-rose-400',
  violet: 'from-violet-500/20 to-violet-600/10 text-violet-400',
  pink: 'from-pink-500/20 to-pink-600/10 text-pink-400',
  orange: 'from-orange-500/20 to-orange-600/10 text-orange-400',
}

function CodePlayground() {
  const [code, setCode] = useState(`// Welcome to Plurix Code Playground!\nconsole.log("Hello, World!");`)
  const [output, setOutput] = useState('')

  const runCode = () => {
    try {
      const logs: string[] = []
      const fakeConsole = { log: (...args: any[]) => logs.push(args.join(' ')) }
      const fn = new Function('console', code)
      fn(fakeConsole)
      setOutput(logs.join('\n') || '(no output)')
    } catch (err: any) {
      setOutput(`Error: ${err.message}`)
    }
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
        <Terminal size={16} className="text-emerald-400" />
        <span className="text-sm font-medium">Code Playground</span>
        <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 ml-auto">JavaScript</span>
      </div>
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5">
        <div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-64 bg-transparent p-4 text-sm font-mono text-emerald-300 outline-none resize-none"
            spellCheck={false}
          />
        </div>
        <div className="bg-black/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/30">Output</span>
            <button onClick={runCode} className="text-xs px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors">
              ▶ Run
            </button>
          </div>
          <pre className="text-sm font-mono text-white/70 whitespace-pre-wrap">{output || 'Click Run to see output...'}</pre>
        </div>
      </div>
    </div>
  )
}

export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 px-6 py-4 flex items-center gap-4">
        <Link to="/chat" className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white">
          <ChevronLeft size={18} />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
            <Wrench size={20} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Tools</h1>
            <p className="text-xs text-white/40">AI-powered utilities and playgrounds</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {activeTool === 'code' ? (
          <div>
            <button onClick={() => setActiveTool(null)} className="btn-ghost text-sm mb-4">
              <ChevronLeft size={14} /> Back to Tools
            </button>
            <CodePlayground />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool, i) => (
              <motion.button
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => !tool.coming && setActiveTool(tool.id)}
                className={`glass-card p-6 text-left relative overflow-hidden group ${tool.coming ? 'opacity-60' : 'cursor-pointer'}`}
                whileHover={!tool.coming ? { y: -4 } : {}}
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${colorMap[tool.color]} flex items-center justify-center mb-4`}>
                  <tool.icon size={22} />
                </div>
                <h3 className="font-semibold mb-1">{tool.name}</h3>
                <p className="text-sm text-white/40">{tool.desc}</p>
                {tool.coming && (
                  <span className="absolute top-4 right-4 text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/30">
                    Coming Soon
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
