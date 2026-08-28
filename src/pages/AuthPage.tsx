import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail, Lock, User, Eye, EyeOff, ArrowRight,
  Github, Chrome, Loader2, Check, X, Shield, KeyRound, ArrowLeft
} from 'lucide-react'
import toast from 'react-hot-toast'
import { signUp, signIn, signInWithGoogle, signInWithGitHub, validatePassword, getPasswordStrength, sendOtp, verifyOtp } from '@/lib/supabase'
import { useStore } from '@/store'
import { config } from '@/config'

type AuthMode = 'signin' | 'signup' | 'otp-verify'

export default function AuthPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnTo = searchParams.get('returnTo') || '/chat'
  const user = useStore(s => s.user)
  const authInitialized = useStore(s => s.authInitialized)
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [otpCode, setOtpCode] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpCountdown, setOtpCountdown] = useState(0)

  const isConfigured = Boolean(config.supabaseUrl && config.supabaseAnonKey)

  useEffect(() => {
    if (authInitialized && user) navigate(returnTo, { replace: true })
  }, [user, authInitialized, navigate, returnTo])

  useEffect(() => {
    if (otpCountdown <= 0) return
    const t = setInterval(() => setOtpCountdown(c => c - 1), 1000)
    return () => clearInterval(t)
  }, [otpCountdown])

  const passwordCheck = mode === 'signup' ? validatePassword(password) : { valid: true, errors: [] }
  const passwordStrength = mode === 'signup' ? getPasswordStrength(password) : null

  const handleEmailSignIn = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    try {
      await signIn(email, password)
      toast.success('Welcome back!')
      navigate(returnTo, { replace: true })
    } catch (err: any) {
      const msg = err?.message || 'Authentication failed'
      if (msg.includes('Invalid login credentials') || msg.includes('not confirmed')) {
        toast('Sending verification code...', { icon: '📧' })
        try {
          await sendOtp(email, false)
          toast.success('Check your email for a 6-digit code!')
          setMode('otp-verify')
          setOtpSent(true)
          setOtpCountdown(60)
        } catch {
          toast.error('Invalid email or password')
        }
      } else {
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }, [loading, email, password, navigate, returnTo])

  const handleSignUp = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading) return
    if (!passwordCheck.valid) { toast.error('Password requirements not met'); return }
    setLoading(true)
    try {
      const data = await signUp(email, password, name)
      if (data?.session) {
        toast.success('Welcome to Plurix!')
        navigate(returnTo, { replace: true })
      } else {
        toast('Sending verification code...', { icon: '📧' })
        try { await sendOtp(email, false); toast.success('Check your email!') } catch {}
        setMode('otp-verify')
        setOtpSent(true)
        setOtpCountdown(60)
      }
    } catch (err: any) {
      const msg = err?.message || 'Sign up failed'
      if (msg.includes('already') || msg.includes('exists')) {
        try {
          await sendOtp(email, false)
          toast.success('Check your email for a code!')
          setMode('otp-verify')
          setOtpSent(true)
          setOtpCountdown(60)
        } catch { toast.error('Account exists. Try signing in.') }
      } else { toast.error(msg) }
    } finally { setLoading(false) }
  }, [loading, email, password, name, passwordCheck.valid, navigate, returnTo])

  const handleOtpVerify = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading || otpCode.length !== 6) return
    setLoading(true)
    try {
      await verifyOtp(email, otpCode)
      toast.success('Welcome to Plurix!')
      navigate(returnTo, { replace: true })
    } catch (err: any) {
      toast.error(err?.message?.includes('expired') ? 'Code expired' : 'Invalid code')
    } finally { setLoading(false) }
  }, [loading, otpCode, email, navigate, returnTo])

  const handleResendOtp = useCallback(async () => {
    if (otpCountdown > 0) return
    try { await sendOtp(email, false); toast.success('New code sent!'); setOtpCountdown(60) }
    catch { toast.error('Could not send code') }
  }, [otpCountdown, email])

  const handleOAuth = async (provider: 'google' | 'github') => {
    if (!isConfigured) { toast.error('Auth not configured'); return }
    try {
      if (provider === 'google') await signInWithGoogle()
      else await signInWithGitHub()
    } catch (err: any) {
      toast.error(err?.message?.includes('not enabled')
        ? `${provider} not enabled in Supabase`
        : `${provider} sign-in failed`)
    }
  }

  const passwordReqs = mode === 'signup' ? [
    { met: password.length >= 8, label: '8+ characters' },
    { met: /[A-Z]/.test(password), label: 'Uppercase' },
    { met: /[a-z]/.test(password), label: 'Lowercase' },
    { met: /[0-9]/.test(password), label: 'Number' },
    { met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password), label: 'Special' },
  ] : []

  if (authInitialized && user) return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
      <div className="w-5 h-5 border-2 border-white/10 border-t-white/40 rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="w-full max-w-[360px]">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-md bg-white text-[#09090b] flex items-center justify-center font-bold text-sm">P</div>
          <span className="text-lg font-bold">Plurix</span>
        </Link>

        <div className="bg-white/[0.025] border border-white/[0.06] rounded-xl p-6">
          <AnimatePresence mode="wait">
            {mode === 'otp-verify' ? (
              <motion.div key="otp" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.2 }}>
                <button onClick={() => { setMode('signin'); setOtpCode(''); setOtpSent(false) }} className="flex items-center gap-1 text-white/25 hover:text-white/50 text-[11px] mb-4 transition-colors">
                  <ArrowLeft size={12} /> Back
                </button>
                <div className="text-center mb-5">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
                    <KeyRound size={18} className="text-white/40" />
                  </div>
                  <h2 className="text-lg font-bold mb-1">Enter code</h2>
                  <p className="text-white/30 text-[12px]">Sent to <span className="text-white/50">{email}</span></p>
                </div>
                <form onSubmit={handleOtpVerify} className="space-y-3">
                  <input type="text" inputMode="numeric" maxLength={6} placeholder="000000" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))} className="glass-input text-center text-xl tracking-[0.4em] font-mono py-3" autoFocus required />
                  <button type="submit" className="btn-primary w-full justify-center py-2" disabled={loading || otpCode.length !== 6}>
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <>Verify & Sign In <ArrowRight size={13} /></>}
                  </button>
                </form>
                <div className="mt-3 text-center">
                  {otpCountdown > 0 ? (
                    <p className="text-white/20 text-[11px]">Resend in {otpCountdown}s</p>
                  ) : (
                    <button onClick={handleResendOtp} className="text-white/40 hover:text-white/60 text-[11px] font-medium">Resend code</button>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div key={mode} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 8 }} transition={{ duration: 0.2 }}>
                <h2 className="text-lg font-bold mb-0.5">{mode === 'signin' ? 'Welcome back' : 'Create account'}</h2>
                <p className="text-white/30 text-[12px] mb-5">{mode === 'signin' ? 'Sign in to Plurix' : 'Get started free'}</p>

                {isConfigured && (
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button onClick={() => handleOAuth('google')} className="btn-secondary justify-center text-[12px] py-2">
                      <Chrome size={14} /> Google
                    </button>
                    <button onClick={() => handleOAuth('github')} className="btn-secondary justify-center text-[12px] py-2">
                      <Github size={14} /> GitHub
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-white/[0.06]" />
                  <span className="text-[10px] text-white/20 uppercase tracking-wider">or</span>
                  <div className="flex-1 h-px bg-white/[0.06]" />
                </div>

                <form onSubmit={mode === 'signup' ? handleSignUp : handleEmailSignIn} className="space-y-2">
                  {mode === 'signup' && (
                    <div className="relative">
                      <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                      <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="glass-input pl-9 py-2 text-[13px]" required />
                    </div>
                  )}
                  <div className="relative">
                    <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                    <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="glass-input pl-9 py-2 text-[13px]" required />
                  </div>
                  <div className="relative">
                    <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                    <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="glass-input pl-9 pr-9 py-2 text-[13px]" required minLength={mode === 'signup' ? 8 : 6} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40">
                      {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>

                  {mode === 'signup' && password.length > 0 && (
                    <div className="pt-1">
                      <div className="flex gap-1 mb-1.5">
                        {[0, 1, 2, 3, 4].map(i => (
                          <div key={i} className="h-0.5 flex-1 rounded-full transition-colors" style={{ background: passwordStrength && i < Math.ceil(passwordStrength.score * 5 / 6) ? passwordStrength.color : 'rgba(255,255,255,0.06)' }} />
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                        {passwordReqs.map(req => (
                          <div key={req.label} className="flex items-center gap-1 text-[10px]">
                            {req.met ? <Check size={8} className="text-emerald-400" /> : <X size={8} className="text-white/15" />}
                            <span className={req.met ? 'text-white/40' : 'text-white/15'}>{req.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button type="submit" className="btn-primary w-full justify-center py-2 mt-2" disabled={loading}>
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <>{mode === 'signin' ? 'Sign In' : 'Create Account'} <ArrowRight size={13} /></>}
                  </button>
                </form>

                {mode === 'signin' && (
                  <div className="mt-2.5 text-center">
                    <button onClick={async () => {
                      if (!email) { toast.error('Enter email first'); return }
                      setLoading(true)
                      try { await sendOtp(email, true); toast.success('Code sent!'); setMode('otp-verify'); setOtpSent(true); setOtpCountdown(60) }
                      catch (err: any) { toast.error(err?.message || 'Failed') }
                      finally { setLoading(false) }
                    }} className="text-white/30 hover:text-white/50 text-[11px] font-medium">
                      Sign in with code instead
                    </button>
                  </div>
                )}

                <div className="mt-4 text-center text-[12px] text-white/30">
                  {mode === 'signin' ? (
                    <>No account? <button onClick={() => setMode('signup')} className="text-white/60 hover:text-white/80 font-medium">Sign up</button></>
                  ) : (
                    <>Have account? <button onClick={() => setMode('signin')} className="text-white/60 hover:text-white/80 font-medium">Sign in</button></>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-center gap-1.5 mt-3 text-[10px] text-white/15">
          <Shield size={9} />
          <span>Encrypted</span>
        </div>
      </motion.div>
    </div>
  )
}
