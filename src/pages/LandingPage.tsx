import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight, Zap, Globe, Shield, Brain,
  MessageSquare, Code, Image, Search, ChevronRight,
  Lock, ArrowUpRight
} from 'lucide-react'

const models = [
  { name: 'Gemini 2.5 Pro', provider: 'Google' },
  { name: 'GPT-4o Mini', provider: 'OpenAI' },
  { name: 'Claude 3.5', provider: 'Anthropic' },
  { name: 'Llama 3.3', provider: 'Meta' },
  { name: 'DeepSeek V3', provider: 'DeepSeek' },
  { name: 'Mistral Large', provider: 'Mistral' },
  { name: 'Qwen Turbo', provider: 'Alibaba' },
  { name: 'Mixtral 8x7B', provider: 'Mistral' },
]

const features = [
  { icon: Brain, title: '10+ AI Models', desc: 'Switch between GPT, Claude, Gemini, Llama, and more in one place.' },
  { icon: Zap, title: 'Instant Responses', desc: 'Ultra-fast inference via Groq and optimized APIs. No waiting.' },
  { icon: Shield, title: 'Private & Secure', desc: 'Your conversations stay yours. No data selling, ever.' },
  { icon: Code, title: 'Code Playground', desc: 'Write and run code directly in the chat. Multiple languages.' },
  { icon: Image, title: 'Image Generation', desc: 'Create images with DALL-E, Stable Diffusion, and Flux.' },
  { icon: Globe, title: 'Web Search', desc: 'Real-time web search with cited sources. Always current.' },
  { icon: MessageSquare, title: 'File Analysis', desc: 'Upload PDFs, images, and docs. Plurix reads and analyzes them.' },
  { icon: Search, title: 'Smart Reasoning', desc: 'Chain-of-thought prompting for complex problems.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gold-400/[0.02] rounded-full blur-[150px]" />
        <div className="absolute inset-0 dot-grid opacity-40" />
      </div>

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-5 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[9px] bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-black font-bold text-sm">
              P
            </div>
            <span className="text-lg font-bold tracking-tight">Plurix</span>
          </Link>
          <div className="hidden md:flex items-center gap-7 text-[13px] text-white/40">
            <a href="#features" className="hover:text-white/80 transition-colors">Features</a>
            <a href="#models" className="hover:text-white/80 transition-colors">Models</a>
            <a href="#security" className="hover:text-white/80 transition-colors">Security</a>
            <Link to="/terms" className="hover:text-white/80 transition-colors">Terms</Link>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/auth" className="btn-ghost text-[13px]">Sign In</Link>
            <Link to="/auth" className="btn-primary text-[13px]">
              Get Started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-28 pb-16 px-5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass mb-7 text-[12px] text-white/50">
            <div className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
            One AI. Every Model. Zero Cost.
          </div>

          <h1 className="text-[3.2rem] sm:text-[4rem] md:text-[5rem] font-black leading-[0.92] tracking-[-0.03em] mb-5">
            <span className="block text-white/90">The last AI</span>
            <span className="block text-gold-gradient">assistant you need.</span>
          </h1>

          <p className="text-[15px] md:text-base text-white/35 max-w-lg mx-auto mb-8 leading-relaxed">
            Chat with GPT-4o, Claude, Gemini, Llama, DeepSeek, and more —
            all from one interface. Free. Fast. Powerful.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/auth" className="btn-primary text-[14px] px-7 py-2.5 rounded-xl">
              Start Chatting Free <ArrowRight size={15} />
            </Link>
            <a href="#features" className="btn-secondary text-[14px] px-7 py-2.5 rounded-xl">
              See What's Inside <ChevronRight size={15} />
            </a>
          </div>

          {/* Model tags */}
          <div className="mt-14 flex flex-wrap justify-center gap-2">
            {models.map((m) => (
              <div
                key={m.name}
                className="glass px-3.5 py-2 flex items-center gap-2 text-[12px] rounded-full"
              >
                <span className="text-white/50">{m.name}</span>
                <span className="text-white/20">·</span>
                <span className="text-white/25">{m.provider}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
              Everything you need. <span className="text-gold-gradient">Nothing you don't.</span>
            </h2>
            <p className="text-white/35 text-[15px] max-w-md mx-auto">
              Built for power users who want the best AI tools without the bloat.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="glass-card p-5 group"
              >
                <div className="w-10 h-10 rounded-xl bg-gold-400/[0.06] flex items-center justify-center mb-3 group-hover:bg-gold-400/[0.1] transition-colors">
                  <f.icon size={18} className="text-gold-400/70" />
                </div>
                <h3 className="font-semibold text-[14px] mb-1">{f.title}</h3>
                <p className="text-white/30 text-[13px] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Models */}
      <section id="models" className="py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">
              Pick any model. <span className="text-gold-gradient">They're all free.</span>
            </h2>
            <p className="text-white/35 text-[15px] max-w-md mx-auto">
              No credits. No limits. Just pick a model and start talking.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {models.map((m) => (
              <div
                key={m.name}
                className="glass-card p-4 flex items-center gap-3.5 group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center shrink-0 group-hover:bg-white/[0.07] transition-colors">
                  <Brain size={16} className="text-white/40" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-[13px]">{m.name}</h3>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-gold-400/10 text-gold-400 font-semibold uppercase tracking-wider">
                      Free
                    </span>
                  </div>
                  <p className="text-white/25 text-[12px] mt-0.5">{m.provider}</p>
                </div>
                <ArrowUpRight size={14} className="text-white/10 group-hover:text-white/30 transition-colors shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="glass-card p-10 text-center border-glow">
            <div className="w-14 h-14 rounded-2xl bg-gold-400/[0.06] flex items-center justify-center mx-auto mb-5">
              <Lock size={24} className="text-gold-400/70" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">
              Your data, <span className="text-gold-gradient">your business.</span>
            </h2>
            <p className="text-white/35 text-[14px] max-w-lg mx-auto mb-8 leading-relaxed">
              We don't sell your data. We don't train on your prompts. We don't share your information.
              Your conversations are encrypted and stored securely.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/auth" className="btn-primary text-[14px] px-7 py-2.5 rounded-xl">
                Start Using Plurix <ArrowRight size={15} />
              </Link>
              <Link to="/privacy" className="btn-secondary text-[14px] px-7 py-2.5 rounded-xl">
                Read Our Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-10 px-5">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[7px] bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-black font-bold text-[11px]">
              P
            </div>
            <span className="font-semibold text-[14px]">Plurix</span>
            <span className="text-white/20 text-[12px]">© 2026</span>
          </div>
          <div className="flex items-center gap-6 text-[12px] text-white/30">
            <Link to="/terms" className="hover:text-white/60 transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
            <a href="mailto:hello@plurix.app" className="hover:text-white/60 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
