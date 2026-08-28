import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight, Zap, Globe, Shield, Brain,
  MessageSquare, Code, Image, Search, ChevronRight,
  Lock, ArrowUpRight
} from 'lucide-react'

const models = [
  { name: 'Gemini 3.7 Flash', provider: 'Google' },
  { name: 'Nemotron Ultra 550B', provider: 'NVIDIA' },
  { name: 'Qwen 3.8 27B', provider: 'Alibaba' },
  { name: 'GPT-OSS 120B', provider: 'OpenAI' },
  { name: 'Gemma 4 31B', provider: 'Google' },
  { name: 'MiniMax M3', provider: 'MiniMax' },
]

const features = [
  { icon: Brain, title: '15+ AI Models', desc: 'Switch between Gemini, Nemotron, Qwen, GPT-OSS, and more.' },
  { icon: Zap, title: 'Instant', desc: 'Ultra-fast inference. No waiting, no queues.' },
  { icon: Shield, title: 'Private', desc: 'Your conversations stay yours. No data selling.' },
  { icon: Code, title: 'Code', desc: 'Write and run code. Multiple languages, syntax highlighting.' },
  { icon: Image, title: 'Image Gen', desc: 'Generate images with Pollination AI. Free, unlimited.' },
  { icon: Globe, title: 'Web Search', desc: 'Real-time search with cited sources.' },
  { icon: MessageSquare, title: 'Files', desc: 'Upload PDFs, images, docs. AI reads and analyzes them.' },
  { icon: Search, title: 'Reasoning', desc: 'Chain-of-thought for complex problems.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 dot-grid opacity-30" />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-5 py-3 backdrop-blur-md bg-[#09090b]/80 border-b border-white/[0.04]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-white text-[#09090b] flex items-center justify-center font-bold text-[11px]">P</div>
            <span className="font-semibold text-[15px]">Plurix</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-[13px] text-white/40">
            <a href="#features" className="hover:text-white/80 transition-colors">Features</a>
            <a href="#models" className="hover:text-white/80 transition-colors">Models</a>
            <Link to="/terms" className="hover:text-white/80 transition-colors">Terms</Link>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/auth" className="btn-ghost text-[13px]">Sign In</Link>
            <Link to="/auth" className="btn-primary text-[13px]">
              Get Started <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-28 pb-16 px-5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] mb-6 text-[12px] text-white/40">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            One AI. Every Model. Free.
          </div>

          <h1 className="text-[2.8rem] sm:text-[3.5rem] md:text-[4.5rem] font-black leading-[0.92] tracking-[-0.03em] mb-5">
            <span className="block text-white/90">The last AI</span>
            <span className="block text-white/40">assistant you need.</span>
          </h1>

          <p className="text-[15px] text-white/30 max-w-lg mx-auto mb-7 leading-relaxed">
            Chat with Gemini, Nemotron 550B, Qwen 3.8, GPT-OSS 120B — all free, all fast, one interface.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Link to="/auth" className="btn-primary text-[13px] px-6 py-2">
              Start Free <ArrowRight size={14} />
            </Link>
            <a href="#features" className="btn-secondary text-[13px] px-6 py-2">
              See Features <ChevronRight size={14} />
            </a>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-2">
            {models.map((m) => (
              <div key={m.name} className="px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-[11px] text-white/30">
                {m.name} <span className="text-white/15">· {m.provider}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Everything you need.</h2>
            <p className="text-white/30 text-[14px]">Nothing you don't.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {features.map((f) => (
              <div key={f.title} className="glass-card p-4 group">
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center mb-2.5 group-hover:bg-white/[0.06] transition-colors">
                  <f.icon size={16} className="text-white/30" />
                </div>
                <h3 className="font-semibold text-[13px] mb-1">{f.title}</h3>
                <p className="text-white/25 text-[12px] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Models */}
      <section id="models" className="py-16 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Pick any model.</h2>
            <p className="text-white/30 text-[14px]">They're all free.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {models.map((m) => (
              <div key={m.name} className="glass-card p-3.5 flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
                  <Brain size={14} className="text-white/30" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[12px]">{m.name}</h3>
                    <span className="text-[8px] px-1 py-0.5 rounded bg-white/[0.06] text-white/30 font-medium uppercase">Free</span>
                  </div>
                  <p className="text-white/20 text-[11px] mt-0.5">{m.provider}</p>
                </div>
                <ArrowUpRight size={12} className="text-white/10 group-hover:text-white/30 transition-colors shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="py-16 px-5">
        <div className="max-w-3xl mx-auto">
          <div className="glass-card p-8 text-center">
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
              <Lock size={18} className="text-white/30" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold mb-2">Your data, your business.</h2>
            <p className="text-white/30 text-[13px] max-w-md mx-auto mb-6">
              We don't sell your data. We don't train on your prompts. Encrypted and secure.
            </p>
            <div className="flex items-center justify-center gap-2.5">
              <Link to="/auth" className="btn-primary text-[13px] px-5 py-2">
                Start Free <ArrowRight size={14} />
              </Link>
              <Link to="/privacy" className="btn-secondary text-[13px] px-5 py-2">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-8 px-5">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-white text-[#09090b] flex items-center justify-center font-bold text-[10px]">P</div>
            <span className="font-semibold text-[13px]">Plurix</span>
            <span className="text-white/15 text-[11px]">© 2026</span>
          </div>
          <div className="flex items-center gap-5 text-[11px] text-white/25">
            <Link to="/terms" className="hover:text-white/50 transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-white/50 transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
