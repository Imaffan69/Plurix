import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js'
import { supabaseUserToAppUser } from '@/types'
import { useStore } from '@/store'
import { config } from '@/config'

const supabaseUrl = config.supabaseUrl
const supabaseAnonKey = config.supabaseAnonKey

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey)

function createSafeClient(): SupabaseClient {
  if (isConfigured) {
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    })
  }

  const noop = () => Promise.resolve({ data: null, error: null })
  const handler: ProxyHandler<object> = {
    get(_target, prop) {
      if (prop === 'auth') {
        return new Proxy({}, {
          get(_a, method) {
            if (method === 'onAuthStateChange') {
              return () => ({ data: { subscription: { unsubscribe: () => {} } } })
            }
            if (method === 'getUser') {
              return () => Promise.resolve({ data: { user: null }, error: null })
            }
            if (method === 'getSession') {
              return () => Promise.resolve({ data: { session: null }, error: null })
            }
            return noop
          },
        })
      }
      if (prop === 'from') return () => ({ select: () => ({ data: [], error: null }), insert: noop, update: noop, delete: noop })
      if (prop === 'storage') return { from: () => ({ upload: noop, getPublicUrl: () => ({ data: { publicUrl: '' } }) }) }
      return noop
    },
  }
  return new Proxy({}, handler) as unknown as SupabaseClient
}

export const supabase = createSafeClient()

function assertConfigured(feature: string) {
  if (!isConfigured) {
    throw new Error(
      `${feature} requires Supabase. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Settings → Environment.`
    )
  }
}

function syncSessionToStore(session: Session | null) {
  const s = useStore.getState()
  s.setUser(session?.user ? supabaseUserToAppUser(session.user) : null)
  s.setAuthLoading(false)
  s.setAuthInitialized(true)
}

// === Auth Functions ===

export async function signUp(email: string, password: string, name: string) {
  assertConfigured('Sign up')
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  })
  if (error) throw error
  return data
}

export async function signIn(email: string, password: string) {
  assertConfigured('Sign in')
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  if (data?.user) syncSessionToStore(data.session)
  return data
}

export async function sendOtp(email: string, shouldCreateUser = false) {
  assertConfigured('OTP')
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser },
  })
  if (error) throw error
  return data
}

export async function verifyOtp(email: string, token: string) {
  assertConfigured('OTP verification')
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
  if (error) throw error
  if (data?.user) syncSessionToStore(data.session)
  return data
}

/**
 * Google OAuth sign-in.
 * Redirects to Google's login page, then back to /auth/callback.
 * Requires:
 * 1. Google provider ENABLED in Supabase Dashboard → Authentication → Providers → Google
 * 2. Google Cloud OAuth Client ID + Secret pasted into Supabase
 * 3. Callback URL in Google Cloud Console: https://<project-ref>.supabase.co/auth/v1/callback
 * 4. Redirect URL in Supabase: https://plurix-ai.vercel.app/auth/callback
 */
export async function signInWithGoogle() {
  assertConfigured('Google sign-in')

  // Get the correct redirect URL based on environment
  const redirectTo = `${window.location.origin}/auth/callback`

  console.log('[Auth] Google sign-in initiating...', {
    redirectTo,
    origin: window.location.origin,
    supabaseUrl,
  })

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: false,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })

  if (error) {
    console.error('[Auth] Google sign-in error:', error.message, error)
    throw new Error(
      `Google sign-in failed: ${error.message}. ` +
      'Make sure Google provider is enabled in Supabase Dashboard → Authentication → Providers → Google, ' +
      'and your Google Cloud OAuth credentials are correctly configured.'
    )
  }

  console.log('[Auth] Google sign-in redirecting...', data)
  return data
}

export async function signInWithGitHub() {
  assertConfigured('GitHub sign-in')
  const redirectTo = `${window.location.origin}/auth/callback`

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: { redirectTo, skipBrowserRedirect: false },
  })

  if (error) {
    console.error('[Auth] GitHub sign-in error:', error.message)
    throw new Error(`GitHub sign-in failed: ${error.message}. Make sure GitHub provider is enabled in Supabase.`)
  }

  return data
}

export async function signOut() {
  try { if (isConfigured) await supabase.auth.signOut() } catch {}
  useStore.getState().setUser(null)
  useStore.getState().setAuthLoading(false)
  useStore.getState().setAuthInitialized(true)
}

export async function getCurrentUser(): Promise<User | null> {
  if (!isConfigured) return null
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getSession(): Promise<Session | null> {
  if (!isConfigured) return null
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function resetPassword(email: string) {
  assertConfigured('Password reset')
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/settings`,
  })
  if (error) throw error
}

// === Password Validation ===

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  if (password.length < 8) errors.push('At least 8 characters')
  if (!/[A-Z]/.test(password)) errors.push('One uppercase letter')
  if (!/[a-z]/.test(password)) errors.push('One lowercase letter')
  if (!/[0-9]/.test(password)) errors.push('One number')
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push('One special character')
  return { valid: errors.length === 0, errors }
}

export function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++
  if (password.length >= 16) score++
  if (score <= 2) return { score, label: 'Weak', color: '#ef4444' }
  if (score <= 4) return { score, label: 'Fair', color: '#f59e0b' }
  if (score <= 5) return { score, label: 'Strong', color: '#10b981' }
  return { score, label: 'Very Strong', color: '#8b5cf6' }
}

// === Centralized Auth Init ===

let authListenerUnsub: (() => void) | null = null

export function initAuth() {
  if (authListenerUnsub) return

  if (!isConfigured) {
    const s = useStore.getState()
    s.setUser(null)
    s.setAuthLoading(false)
    s.setAuthInitialized(true)
    console.warn('[Auth] Supabase not configured.')
    return
  }

  console.log('[Auth] Initializing...', { supabaseUrl })

  supabase.auth.getSession().then(({ data: { session }, error }) => {
    if (error) console.warn('[Auth] getSession error:', error.message)
    console.log('[Auth] Initial session:', session ? 'active' : 'none')
    syncSessionToStore(session)
  }).catch((err) => {
    console.error('[Auth] getSession failed:', err)
    syncSessionToStore(null)
  })

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      console.log('[Auth] State change:', event, session ? 'session active' : 'no session')
      syncSessionToStore(session)
    }
  )

  authListenerUnsub = () => subscription.unsubscribe()
}

export function destroyAuth() {
  authListenerUnsub?.()
  authListenerUnsub = null
}
