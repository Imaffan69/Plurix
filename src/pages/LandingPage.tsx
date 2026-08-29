import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, Globe, Shield, Brain, MessageSquare, Code, Image, Search, Lock, Sun, Moon } from 'lucide-react'
import { useStore } from '@/store'

const models = [
  { name: 'GPT-OSS 120B', provider: 'OpenAI via Groq • Recommended' },
  { name: 'Llama 4 Maverick', provider: 'Meta via OpenRouter' },
  { name: 'Nemotron Ultra 550B', provider: 'NVIDIA via OpenRouter' },
  { name: 'Gemini 3.5 Flash', provider: 'Google' },
  { name: 'Mistral Medium 3.5', provider: 'Mistral AI' },
  { name: 'Qwen 3.8 27B', provider: 'Alibaba via Groq' },
]

const features = [
  { icon: Brain, title: '28+ AI Models', desc: 'Switch between Gemini, Nemotron, Qwen, GPT-OSS, Mistral, and more.', color: 'violet' },
  { icon: Zap, title: 'Instant', desc: 'Ultra-fast inference. No waiting, no queues.', color: 'blue' },
  { icon: Shield, title: 'Private', desc: 'Your conversations stay yours. No data selling.', color: 'violet' },
  { icon: Code, title: 'Code Playground', desc: 'Write and run code in 6+ languages with AI generation.', color: 'blue' },
  { icon: Image, title: 'Image Gen', desc: 'Generate images with Pollination AI. Free.', color: 'violet' },
  { icon: Globe, title: 'Web Search', desc: 'Real-time search with cited sources.', color: 'blue' },
  { icon: MessageSquare, title: 'Files', desc: 'Upload PDFs, images, docs. AI analyzes them.', color: 'violet' },
  { icon: Search, title: 'Reasoning', desc: 'Chain-of-thought for complex problems.', color: 'blue' },
]

export default function LandingPage() {
  const user = useStore(s => s.user)
  const theme = useStore(s => s.theme)
  const toggleTheme = useStore(s => s.toggleTheme)
  const isDark = theme === 'dark'

  return (
    <div className="min-h-screen text-white overflow-hidden" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 dot-grid opacity-30" />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-5 py-3 backdrop-blur-md" style={{ background: `${isDark ? '#0A0A0A' : '#ffffff'}cc`, borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-bold text-[11px]">P</div>
            <span className="font-semibold text-[15px]">Plurix</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-[13px]" style={{ color: 'var(--text-tertiary)' }}>
            <a href="#features" className="hover:text-white/80 transition-colors">Features</a>
            <a href="#models" className="hover:text-white/80 transition-colors">Models</a>
            <Link to="/terms" className="hover:text-white/80 transition-colors">Terms</Link>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--text-ghost)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-ghost)'}>
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            {user ? (
              <Link to="/chat" className="btn-primary text-[13px]">Start Chatting <ArrowRight size={13} /></Link>
            ) : (
              <>
                <Link to="/auth" className="btn-ghost text-[13px]">Sign In</Link>
                <Link to="/auth" className="btn-primary text-[13px]">Get Started <ArrowRight size={13} /></Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-5 relative">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-6" style={{ border: '1px solid rgba(139,92,246,0.1)' }}>
              <Brain size={28} style={{ color: 'var(--accent-violet)' }} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Intelligence, <span className="text-gold-gradient">unlimited</span>.
            </h1>
            <p className="text-lg max-w-xl mx-auto mb-8" style={{ color: 'var(--text-tertiary)' }}>
              28+ free AI models. Code playground. Image generation. Data analysis.
              <br className="hidden sm:block" />All in one workspace.
            </p>
            <div className="flex items-center justify-center gap-3">
              {user ? (
                <Link to="/chat" className="btn-primary text-[14px] px-6 py-2.5">
                  Start Chatting <ArrowRight size={14} />
                </Link>
              ) : (
                <>
                  <Link to="/auth" className="btn-primary text-[14px] px-6 py-2.5">
                    Get Started Free <ArrowRight size={14} />
                  </Link>
                  <Link to="/auth" className="btn-secondary text-[14px] px-6 py-2.5">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-2">Built for power users</h2>
            <p style={{ color: 'var(--text-muted)' }}>Everything you need, nothing you don't.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4">
                <f.icon size={18} className={`mb-2 ${f.color === 'violet' ? 'text-violet-400/60' : 'text-blue-400/60'}`} />
                <h3 className="font-semibold text-[13px] mb-1">{f.title}</h3>
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Models */}
      <section id="models" className="py-20 px-5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-2">28+ models, zero cost</h2>
            <p style={{ color: 'var(--text-muted)' }}>Groq, Gemini, Mistral, OpenRouter — all free.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {models.map((m, i) => (
              <motion.div key={m.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-card p-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)' }}>
                  <Zap size={14} style={{ color: 'var(--accent-violet)' }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-[13px]">{m.name}</div>
                  <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{m.provider}</div>
                </div>
                {m.name === 'GPT-OSS 120B' && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded font-medium uppercase" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--accent-emerald)' }}>Rec</span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-5">
        <div className="max-w-2xl mx-auto text-center">
          <div className="glass-card p-10">
            <h2 className="text-2xl font-bold mb-3">Ready to build?</h2>
            <p className="text-[14px] mb-6" style={{ color: 'var(--text-muted)' }}>Free forever. No credit card. No limits.</p>
            {user ? (
              <Link to="/chat" className="btn-primary text-[14px] px-8 py-2.5">
                Open Workspace <ArrowRight size={14} />
              </Link>
            ) : (
              <Link to="/auth" className="btn-primary text-[14px] px-8 py-2.5">
                Get Started Free <ArrowRight size={14} />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[12px]" style={{ color: 'var(--text-ghost)' }}>
            <div className="w-5 h-5 rounded bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-bold text-[8px]">P</div>
            <span>Plurix AI</span>
          </div>
          <div className="flex items-center gap-5 text-[12px]" style={{ color: 'var(--text-ghost)' }}>
            <Link to="/terms" className="hover:opacity-70 transition-opacity">Terms</Link>
            <Link to="/privacy" className="hover:opacity-70 transition-opacity">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
