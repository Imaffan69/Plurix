import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ChevronLeft, Code, Image, FileText, Search, Calculator,
  Globe, Brain, Music, Video, Palette, Wrench, Terminal, ArrowUpRight
} from 'lucide-react'

const tools = [
  { id: 'code', icon: Code, name: 'Code Playground', desc: 'Write, run, and debug code in-browser', available: true },
  { id: 'image', icon: Image, name: 'Image Generator', desc: 'Create images with AI models', available: false },
  { id: 'files', icon: FileText, name: 'File Analyzer', desc: 'Upload and analyze documents, PDFs, images', available: false },
  { id: 'search', icon: Search, name: 'Web Search', desc: 'Search the web with AI-powered results', available: true },
  { id: 'translate', icon: Globe, name: 'Translator', desc: 'Translate between 50+ languages', available: false },
  { id: 'math', icon: Calculator, name: 'Math Solver', desc: 'Solve equations and math problems', available: false },
  { id: 'video', icon: Video, name: 'Video Generator', desc: 'Generate videos with AI', available: false },
  { id: 'music', icon: Music, name: 'Music Generator', desc: 'Create music with AI', available: false },
  { id: 'design', icon: Palette, name: 'Design Assistant', desc: 'AI-powered design help', available: false },
]

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
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.04]">
        <Terminal size={14} className="text-gold-400/60" />
        <span className="text-[12px] font-medium">Code Playground</span>
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-gold-400/10 text-gold-400 font-semibold uppercase ml-auto">JavaScript</span>
      </div>
      <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/[0.04]">
        <div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-60 bg-transparent p-4 text-[12px] font-mono text-emerald-400/70 outline-none resize-none"
            spellCheck={false}
          />
        </div>
        <div className="bg-black/40 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-white/20">Output</span>
            <button onClick={runCode} className="text-[11px] px-2.5 py-1 rounded-lg bg-gold-400/10 text-gold-400/80 hover:bg-gold-400/15 transition-colors font-medium">
              ▶ Run
            </button>
          </div>
          <pre className="text-[12px] font-mono text-white/50 whitespace-pre-wrap">{output || 'Click Run to see output...'}</pre>
        </div>
      </div>
    </div>
  )
}

export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-black">
      <div className="border-b border-white/[0.04] px-5 py-3 flex items-center gap-3">
        <Link to="/chat" className="p-1.5 rounded-lg hover:bg-white/[0.05] text-white/30 hover:text-white/60">
          <ChevronLeft size={16} />
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gold-400/[0.06] flex items-center justify-center">
            <Wrench size={16} className="text-gold-400/50" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold">Tools</h1>
            <p className="text-[11px] text-white/25">AI-powered utilities</p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-5">
        {activeTool === 'code' ? (
          <div>
            <button onClick={() => setActiveTool(null)} className="btn-ghost text-[12px] mb-3">
              <ChevronLeft size={12} /> Back
            </button>
            <CodePlayground />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {tools.map((tool, i) => (
              <motion.button
                key={tool.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => tool.available && setActiveTool(tool.id)}
                className={`glass-card p-5 text-left group relative overflow-hidden ${!tool.available ? 'opacity-50' : 'cursor-pointer'}`}
                whileHover={tool.available ? { y: -2 } : {}}
              >
                <div className="w-10 h-10 rounded-xl bg-gold-400/[0.06] flex items-center justify-center mb-3 group-hover:bg-gold-400/[0.1] transition-colors">
                  <tool.icon size={18} className="text-gold-400/50" />
                </div>
                <h3 className="font-semibold text-[13px] mb-0.5">{tool.name}</h3>
                <p className="text-[12px] text-white/25">{tool.desc}</p>
                {!tool.available && (
                  <span className="absolute top-3 right-3 text-[9px] px-2 py-0.5 rounded-full bg-white/[0.04] text-white/20 font-medium uppercase tracking-wider">
                    Soon
                  </span>
                )}
                {tool.available && (
                  <ArrowUpRight size={12} className="absolute top-3 right-3 text-white/10 group-hover:text-white/30 transition-colors" />
                )}
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
