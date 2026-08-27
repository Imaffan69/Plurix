import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js'
import { supabaseUserToAppUser } from '@/types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

function createSafeClient(): SupabaseClient {
  if (supabaseUrl && supabaseAnonKey) {
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

// === Auth Functions ===

export async function signUp(email: string, password: string, name: string) {
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
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })
  if (error) throw error
  return data
}

export async function signInWithGitHub() {
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
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getSession(): Promise<Session | null> {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function resetPassword(email: string) {
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
  return { score, label: 'Very Strong', color: '#d9a02a' }
}

// === Centralized Auth Init ===
// Call this once at app startup. It syncs Supabase session state into the
// Zustand store so every component reads from the same source of truth.

let authListenerUnsub: (() => void) | null = null

export function initAuth() {
  // Prevent double-init
  if (authListenerUnsub) return

  // Dynamically import store to avoid circular dep
  import('@/store').then(({ useStore }) => {
    const store = useStore.getState()

    // Fetch initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      store.setUser(session?.user ? supabaseUserToAppUser(session.user) : null)
      store.setAuthLoading(false)
      store.setAuthInitialized(true)
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
  })
}

export function destroyAuth() {
  authListenerUnsub?.()
  authListenerUnsub = null
}

// Legacy hook for backward compat — reads from store
export function useAuth() {
  // This is now just a convenience wrapper over the store
  // The real auth state lives in Zustand, set by initAuth()
  const { user, authLoading, authInitialized } = useStore()
  return { user, loading: authLoading || !authInitialized, refresh: () => {} }
}

// Need to import useStore here for useAuth
import { useStore } from '@/store'
