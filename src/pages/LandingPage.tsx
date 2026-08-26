import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Sparkles, ArrowRight, Zap, Globe, Shield, Brain,
  MessageSquare, Code, Image, Search, ChevronRight, Star
} from 'lucide-react'

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
}

const models = [
  { name: 'Gemini 2.5 Pro', icon: '✦', color: '#4285f4' },
  { name: 'GPT-4o Mini', icon: '⚡', color: '#10b981' },
  { name: 'Claude 3.5', icon: '🧠', color: '#d97706' },
  { name: 'Llama 3.3', icon: '🦙', color: '#7c3aed' },
  { name: 'DeepSeek V3', icon: '🔍', color: '#06b6d4' },
  { name: 'Mistral', icon: '💨', color: '#ef4444' },
  { name: 'Qwen Turbo', icon: '🌊', color: '#6366f1' },
  { name: 'Mixtral', icon: '🌀', color: '#f97316' },
]

const features = [
  { icon: Brain, title: '10+ AI Models', desc: 'Switch between GPT, Claude, Gemini, Llama, and more — all in one place.' },
  { icon: Zap, title: 'Instant Responses', desc: 'Ultra-fast inference via Groq and optimized APIs. No waiting.' },
  { icon: Shield, title: 'Private & Secure', desc: 'Your conversations stay yours. End-to-end encryption, no data selling.' },
  { icon: Code, title: 'Code Playground', desc: 'Write, run, and debug code directly in the chat. Multiple languages.' },
  { icon: Image, title: 'Image Generation', desc: 'Create stunning images with DALL-E, Stable Diffusion, and Flux.' },
  { icon: Globe, title: 'Web Search', desc: 'Real-time web search with cited sources. Always up to date.' },
  { icon: MessageSquare, title: 'File Analysis', desc: 'Upload PDFs, images, and docs. Plurix reads and analyzes them.' },
  { icon: Search, title: 'Smart Reasoning', desc: 'Chain-of-thought prompting for complex problems and research.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-t from-cyan-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute inset-0 dot-grid opacity-30" />
      </div>

      {/* Navbar */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-lg">
              P
            </div>
            <span className="text-xl font-bold tracking-tight">Plurix</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#models" className="hover:text-white transition-colors">Models</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth" className="btn-ghost text-sm">Sign In</Link>
            <Link to="/auth" className="btn-primary text-sm">
              Get Started Free <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 text-sm text-white/70">
              <Sparkles size={14} className="text-purple-400" />
              One AI. Every Model. Zero Cost.
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight mb-6">
              <span className="block">The last AI</span>
              <span className="block gradient-text">assistant you'll need.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed">
              Chat with GPT-4o, Claude, Gemini, Llama, DeepSeek, and more — 
              all from one beautiful interface. Free. Fast. Powerful.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth" className="btn-primary text-base px-8 py-4 rounded-2xl">
                Start Chatting Free <ArrowRight size={18} />
              </Link>
              <a href="#features" className="btn-ghost text-base px-8 py-4 rounded-2xl">
                See What's Inside <ChevronRight size={18} />
              </a>
            </div>
          </motion.div>

          {/* Floating Model Cards */}
          <motion.div 
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="mt-20 flex flex-wrap justify-center gap-3"
          >
            {models.map((m, i) => (
              <motion.div
                key={m.name}
                variants={fadeIn}
                className="glass-card px-4 py-3 flex items-center gap-2 text-sm"
                whileHover={{ scale: 1.05, borderColor: m.color + '40' }}
              >
                <span className="text-lg">{m.icon}</span>
                <span className="text-white/70">{m.name}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything you need. <span className="gradient-text">Nothing you don't.</span>
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              Built for power users who want the best AI tools without the bloat.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6 group cursor-default"
                whileHover={{ y: -4 }}
              >
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <f.icon size={22} className="text-blue-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Models Section */}
      <section id="models" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Pick any model. <span className="gradient-text">They're all free.</span>
            </h2>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              No credits. No limits. Just pick a model and start talking.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4">
            {models.map((m, i) => (
              <motion.div
                key={m.name}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card p-5 flex items-center gap-4 group cursor-default"
                whileHover={{ borderColor: m.color + '30' }}
              >
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0"
                  style={{ background: m.color + '15' }}
                >
                  {m.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{m.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">
                      FREE
                    </span>
                  </div>
                  <p className="text-white/40 text-sm mt-0.5">{m.name.split(' ')[0]} — {m.name}</p>
                </div>
                <div 
                  className="w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: m.color }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing / CTA */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-12 text-center gradient-border"
          >
            <div className="inline-flex items-center gap-1 text-amber-400 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Completely free. <span className="gradient-text">Seriously.</span>
            </h2>
            <p className="text-white/50 text-lg max-w-lg mx-auto mb-8">
              No hidden fees. No premium tier. No data selling. Just a free AI assistant 
              that happens to be better than paid ones.
            </p>
            <Link to="/auth" className="btn-primary text-lg px-10 py-4 rounded-2xl">
              Start Using Plurix <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-sm">
              P
            </div>
            <span className="font-semibold">Plurix</span>
            <span className="text-white/30 text-sm">© 2026</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-white/40">
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <a href="mailto:hello@plurix.app" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
