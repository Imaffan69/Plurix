import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail, Lock, User, Eye, EyeOff, ArrowRight,
  Github, Chrome, Loader2, CheckCircle2,
  Check, X, Shield, KeyRound, ArrowLeft
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

  // If already logged in, redirect immediately
  useEffect(() => {
    if (authInitialized && user) {
      navigate(returnTo, { replace: true })
    }
  }, [user, authInitialized, navigate, returnTo])

  // OTP countdown timer
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
      if (msg.includes('Invalid login credentials')) {
        toast.error('Invalid email or password')
      } else if (msg.includes('Email not confirmed')) {
        // Email not verified — send OTP instead
        toast.loading('Sending verification code...', { id: 'otp' })
        try {
          await sendOtp(email)
          toast.success('Verification code sent! Check your email.', { id: 'otp' })
          setMode('otp-verify')
          setOtpSent(true)
          setOtpCountdown(60)
        } catch {
          toast.error('Could not send verification code. Try again.', { id: 'otp' })
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

    if (!passwordCheck.valid) {
      toast.error('Please meet all password requirements')
      return
    }

    setLoading(true)
    try {
      const data = await signUp(email, password, name)
      // Supabase may auto-sign-in or may require email confirmation
      if (data?.session) {
        toast.success('Account created! Welcome to Plurix.')
        navigate(returnTo, { replace: true })
      } else {
        // Need email verification — send OTP
        toast.loading('Sending verification code...', { id: 'otp' })
        try {
          await sendOtp(email)
          toast.success('Verification code sent! Check your email.', { id: 'otp' })
        } catch {
          toast.success('Account created! Check your email for verification.', { id: 'otp' })
        }
        setMode('otp-verify')
        setOtpSent(true)
        setOtpCountdown(60)
      }
    } catch (err: any) {
      const msg = err?.message || 'Sign up failed'
      if (msg.includes('already registered')) {
        // Already registered — try sending OTP for existing user
        toast.loading('Account exists. Sending verification code...', { id: 'otp' })
        try {
          await sendOtp(email)
          toast.success('Verification code sent! Check your email.', { id: 'otp' })
          setMode('otp-verify')
          setOtpSent(true)
          setOtpCountdown(60)
        } catch {
          toast.error('Account exists but could not send code. Try password sign-in.')
        }
      } else {
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }, [loading, email, password, name, passwordCheck.valid, navigate, returnTo])

  const handleOtpVerify = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading || otpCode.length !== 6) return

    setLoading(true)
    try {
      await verifyOtp(email, otpCode)
      toast.success('Verified! Welcome to Plurix.')
      navigate(returnTo, { replace: true })
    } catch (err: any) {
      const msg = err?.message || 'Invalid code'
      if (msg.includes('expired')) {
        toast.error('Code expired. Request a new one.')
      } else {
        toast.error('Invalid verification code')
      }
    } finally {
      setLoading(false)
    }
  }, [loading, otpCode, email, navigate, returnTo])

  const handleResendOtp = useCallback(async () => {
    if (otpCountdown > 0) return
    try {
      await sendOtp(email)
      toast.success('New code sent!')
      setOtpCountdown(60)
    } catch {
      toast.error('Could not send code. Try again.')
    }
  }, [otpCountdown, email])

  const handleOAuth = async (provider: 'google' | 'github') => {
    try {
      if (provider === 'google') await signInWithGoogle()
      else await signInWithGitHub()
    } catch (err: any) {
      const msg = err?.message || ''
      if (msg.includes('not configured')) {
        toast.error(msg, { duration: 6000 })
      } else {
        toast.error(`${provider} sign-in failed. Make sure ${provider} is enabled in your Supabase dashboard.`, { duration: 6000 })
      }
    }
  }

  const passwordRequirements = mode === 'signup' ? [
    { met: password.length >= 8, label: 'At least 8 characters' },
    { met: /[A-Z]/.test(password), label: 'Uppercase letter' },
    { met: /[a-z]/.test(password), label: 'Lowercase letter' },
    { met: /[0-9]/.test(password), label: 'Number' },
    { met: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password), label: 'Special character' },
  ] : []

  // Don't render form if already logged in
  if (authInitialized && user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gold-400/20 border-t-gold-400 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-gold-400/[0.03] rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[380px] relative z-10"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-10">
          <div className="w-10 h-10 rounded-[10px] bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-black font-bold text-lg">
            P
          </div>
          <span className="text-xl font-bold tracking-tight">Plurix</span>
        </Link>

        <div className="glass-card p-7">
          <AnimatePresence mode="wait">
            {mode === 'otp-verify' ? (
              /* ===== OTP VERIFICATION ===== */
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.25 }}
              >
                <button
                  onClick={() => { setMode('signin'); setOtpCode(''); setOtpSent(false) }}
                  className="flex items-center gap-1.5 text-white/30 hover:text-white/60 text-xs mb-4 transition-colors"
                >
                  <ArrowLeft size={13} />
                  Back to sign in
                </button>

                <div className="w-14 h-14 rounded-2xl bg-gold-400/10 flex items-center justify-center mx-auto mb-4">
                  <KeyRound size={28} className="text-gold-400" />
                </div>
                <h2 className="text-xl font-bold text-center mb-1">Enter verification code</h2>
                <p className="text-white/35 text-sm text-center mb-6">
                  We sent a 6-digit code to<br />
                  <span className="text-white/70 font-medium">{email}</span>
                </p>

                <form onSubmit={handleOtpVerify} className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="glass-input text-center text-2xl tracking-[0.5em] font-mono py-4"
                      autoFocus
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn-primary w-full justify-center py-2.5"
                    disabled={loading || otpCode.length !== 6}
                  >
                    {loading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <>
                        Verify & Sign In
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-4 text-center">
                  {otpCountdown > 0 ? (
                    <p className="text-white/25 text-xs">
                      Resend code in {otpCountdown}s
                    </p>
                  ) : (
                    <button
                      onClick={handleResendOtp}
                      className="text-gold-400 hover:text-gold-300 text-xs transition-colors font-medium"
                    >
                      Resend code
                    </button>
                  )}
                </div>
              </motion.div>
            ) : (
              /* ===== SIGN IN / SIGN UP ===== */
              <motion.div
                key={mode}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.25 }}
              >
                <h2 className="text-xl font-bold mb-1">
                  {mode === 'signin' ? 'Welcome back' : 'Create your account'}
                </h2>
                <p className="text-white/35 text-sm mb-6">
                  {mode === 'signin'
                    ? 'Sign in to continue to Plurix'
                    : 'Get started with Plurix for free'}
                </p>

                {/* OAuth */}
                {isConfigured && (
                  <div className="grid grid-cols-2 gap-2.5 mb-5">
                    <button onClick={() => handleOAuth('google')} className="btn-secondary justify-center text-[13px]">
                      <Chrome size={15} /> Google
                    </button>
                    <button onClick={() => handleOAuth('github')} className="btn-secondary justify-center text-[13px]">
                      <Github size={15} /> GitHub
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px bg-white/[0.06]" />
                  <span className="text-[11px] text-white/25 uppercase tracking-wider font-medium">or</span>
                  <div className="flex-1 h-px bg-white/[0.06]" />
                </div>

                <form onSubmit={mode === 'signup' ? handleSignUp : handleEmailSignIn} className="space-y-2.5">
                  {mode === 'signup' && (
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                      <input
                        type="text"
                        placeholder="Full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="glass-input pl-10"
                        required
                      />
                    </div>
                  )}
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="glass-input pl-10"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="glass-input pl-10 pr-10"
                      required
                      minLength={mode === 'signup' ? 8 : 6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>

                  {/* Password Strength */}
                  {mode === 'signup' && password.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="overflow-hidden"
                    >
                      <div className="pt-1">
                        <div className="flex gap-1 mb-2">
                          {[0, 1, 2, 3, 4].map(i => (
                            <div
                              key={i}
                              className="h-0.5 flex-1 rounded-full transition-colors duration-300"
                              style={{
                                background: passwordStrength && i < Math.ceil(passwordStrength.score * 5 / 6)
                                  ? passwordStrength.color
                                  : 'rgba(255,255,255,0.06)',
                              }}
                            />
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1">
                          {passwordRequirements.map(req => (
                            <div key={req.label} className="flex items-center gap-1 text-[11px]">
                              {req.met ? (
                                <Check size={10} className="text-emerald-400" />
                              ) : (
                                <X size={10} className="text-white/20" />
                              )}
                              <span className={req.met ? 'text-white/50' : 'text-white/20'}>
                                {req.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="pt-1">
                    <button
                      type="submit"
                      className="btn-primary w-full justify-center py-2.5"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <>
                          {mode === 'signin' ? 'Sign In' : 'Create Account'}
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-5 text-center text-sm text-white/35">
                  {mode === 'signin' ? (
                    <>
                      Don't have an account?{' '}
                      <button onClick={() => setMode('signup')} className="text-gold-400 hover:text-gold-300 transition-colors font-medium">
                        Sign up
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{' '}
                      <button onClick={() => setMode('signin')} className="text-gold-400 hover:text-gold-300 transition-colors font-medium">
                        Sign in
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-center gap-1.5 mt-4 text-[11px] text-white/20">
          <Shield size={10} />
          <span>End-to-end encrypted</span>
        </div>
      </motion.div>
    </div>
  )
}
