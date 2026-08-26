import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Mail, Lock, User, Eye, EyeOff, ArrowRight, 
  Github, Chrome, Loader2, Shield, CheckCircle2 
} from 'lucide-react'
import toast from 'react-hot-toast'
import { signUp, signIn, signInWithGoogle, signInWithGitHub } from '@/lib/supabase'

type AuthMode = 'signin' | 'signup' | 'otp'

export default function AuthPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'signup') {
        await signUp(email, password, name)
        toast.success('Account created! Check your email for verification.')
        setMode('otp')
        setOtpSent(true)
      } else {
        await signIn(email, password)
        toast.success('Welcome back!')
        navigate('/chat')
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuth = async (provider: 'google' | 'github') => {
    try {
      if (provider === 'google') await signInWithGoogle()
      else await signInWithGitHub()
    } catch (err: any) {
      toast.error(err.message || 'OAuth failed')
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 dot-grid opacity-20" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-xl">
            P
          </div>
          <span className="text-2xl font-bold">Plurix</span>
        </Link>

        <div className="glass-card p-8">
          <AnimatePresence mode="wait">
            {otpSent ? (
              <motion.div
                key="otp"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold mb-2">Check your email</h2>
                <p className="text-white/50 text-sm mb-6">
                  We sent a verification link to <span className="text-white/80">{email}</span>
                </p>
                <button 
                  onClick={() => navigate('/chat')} 
                  className="btn-primary w-full justify-center"
                >
                  Continue to Plurix <ArrowRight size={16} />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: mode === 'signin' ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === 'signin' ? 20 : -20 }}
              >
                <h2 className="text-2xl font-bold mb-1">
                  {mode === 'signin' ? 'Welcome back' : 'Create your account'}
                </h2>
                <p className="text-white/40 text-sm mb-6">
                  {mode === 'signin' 
                    ? 'Sign in to continue to Plurix' 
                    : 'Get started with Plurix for free'}
                </p>

                {/* OAuth Buttons */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button onClick={() => handleOAuth('google')} className="btn-ghost justify-center text-sm">
                    <Chrome size={16} /> Google
                  </button>
                  <button onClick={() => handleOAuth('github')} className="btn-ghost justify-center text-sm">
                    <Github size={16} /> GitHub
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-xs text-white/30">or continue with email</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  {mode === 'signup' && (
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                      <input
                        type="text"
                        placeholder="Full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="glass-input pl-11"
                        required
                      />
                    </div>
                  )}
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="glass-input pl-11"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="glass-input pl-11 pr-11"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  <button 
                    type="submit" 
                    className="btn-primary w-full justify-center py-3"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <>
                        {mode === 'signin' ? 'Sign In' : 'Create Account'}
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center text-sm text-white/40">
                  {mode === 'signin' ? (
                    <>
                      Don't have an account?{' '}
                      <button onClick={() => setMode('signup')} className="text-blue-400 hover:text-blue-300">
                        Sign up free
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{' '}
                      <button onClick={() => setMode('signin')} className="text-blue-400 hover:text-blue-300">
                        Sign in
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-center gap-2 mt-4 text-xs text-white/30">
          <Shield size={12} />
          <span>Secured with end-to-end encryption</span>
        </div>
      </motion.div>
    </div>
  )
}
