import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js'
import { supabaseUserToAppUser } from '@/types'
import { useStore } from '@/store'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

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

// === Auth Functions ===

export async function signUp(email: string, password: string, name: string) {
  assertConfigured('Sign up')
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${window.location.origin}/chat`,
    },
  })
  if (error) throw error
  return data
}

export async function signIn(email: string, password: string) {
  assertConfigured('Sign in')
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  // Immediately update the store so the caller can navigate
  if (data?.user) {
    const s = useStore.getState()
    s.setUser(supabaseUserToAppUser(data.user))
    s.setAuthLoading(false)
    s.setAuthInitialized(true)
  }
  return data
}

export async function signInWithGoogle() {
  assertConfigured('Google sign-in')
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  if (error) throw error
  return data
}

export async function signInWithGitHub() {
  assertConfigured('GitHub sign-in')
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  if (error) throw error
  return data
}

export async function signOut() {
  try {
    if (isConfigured) await supabase.auth.signOut()
  } catch {
    // Ignore signOut errors — just clear local state
  }
  // Always clear store state even if API call fails
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
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\\/?]/.test(password)) errors.push('One special character')
  return { valid: errors.length === 0, errors }
}

export function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\\/?]/.test(password)) score++
  if (password.length >= 16) score++

  if (score <= 2) return { score, label: 'Weak', color: '#ef4444' }
  if (score <= 4) return { score, label: 'Fair', color: '#f59e0b' }
  if (score <= 5) return { score, label: 'Strong', color: '#10b981' }
  return { score, label: 'Very Strong', color: '#d9a02a' }
}

// === Centralized Auth Init ===
// Call this once at app startup. Syncs Supabase session into the Zustand store.

let authListenerUnsub: (() => void) | null = null

export function initAuth() {
  // Prevent double-init
  if (authListenerUnsub) return

  if (!isConfigured) {
    // No Supabase — mark auth as initialized with no user
    const s = useStore.getState()
    s.setUser(null)
    s.setAuthLoading(false)
    s.setAuthInitialized(true)
    console.warn('Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
    return
  }

  // Fetch initial session
  supabase.auth.getSession().then(({ data: { session } }) => {
    const s = useStore.getState()
    s.setUser(session?.user ? supabaseUserToAppUser(session.user) : null)
    s.setAuthLoading(false)
    s.setAuthInitialized(true)
  }).catch(() => {
    const s = useStore.getState()
    s.setAuthLoading(false)
    s.setAuthInitialized(true)
  })

  // Listen for auth state changes
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      const s = useStore.getState()
      s.setUser(session?.user ? supabaseUserToAppUser(session.user) : null)
      s.setAuthLoading(false)
      s.setAuthInitialized(true)
    }
  )

  authListenerUnsub = () => subscription.unsubscribe()
}

export function destroyAuth() {
  authListenerUnsub?.()
  authListenerUnsub = null
}
