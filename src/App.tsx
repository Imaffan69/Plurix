import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import LandingPage from '@/pages/LandingPage'
import AuthPage from '@/pages/AuthPage'
import ChatPage from '@/pages/ChatPage'
import AdminPage from '@/pages/AdminPage'
import ToolsPage from '@/pages/ToolsPage'
import SettingsPage from '@/pages/SettingsPage'
import TermsPage from '@/pages/TermsPage'
import PrivacyPage from '@/pages/PrivacyPage'
import NotFoundPage from '@/pages/NotFoundPage'
import { initAuth } from '@/lib/supabase'
import { useStore } from '@/store'
import { X } from 'lucide-react'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useStore(s => s.user)
  const authLoading = useStore(s => s.authLoading)
  const authInitialized = useStore(s => s.authInitialized)
  const location = useLocation()

  // Still loading auth state — show minimal spinner
  if (authLoading || !authInitialized) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gold-400/20 border-t-gold-400 rounded-full animate-spin" />
      </div>
    )
  }

  // Auth checked, no user — redirect to login
  if (!user) {
    return <Navigate to={`/auth?returnTo=${encodeURIComponent(location.pathname)}`} replace />
  }

  return <>{children}</>
}

export default function App() {
  // Initialize Supabase auth listener once on app mount
  useEffect(() => {
    initAuth()
  }, [])

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="/chat/:id" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
      <Route path="/tools" element={<ProtectedRoute><ToolsPage /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

// OAuth callback handler
// Supabase redirects here after Google/GitHub auth with tokens in the URL hash fragment.
// The Supabase client (detectSessionInUrl:true) auto-exchanges the code on page load.
// This component waits for the auth state to resolve and redirects accordingly.
function AuthCallback() {
  const user = useStore(s => s.user)
  const authInitialized = useStore(s => s.authInitialized)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check for OAuth error in URL params (e.g. ?error=access_denied)
    const params = new URLSearchParams(window.location.search)
    const errParam = params.get('error')
    const errDesc = params.get('error_description')
    if (errParam) {
      setError(errDesc || `OAuth error: ${errParam}`)
    }

    // Also check hash fragment for errors (some providers put errors there)
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const hashError = hashParams.get('error')
    if (hashError && !errParam) {
      setError(hashParams.get('error_description') || `OAuth error: ${hashError}`)
    }
  }, [])

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <X size={28} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">Authentication failed</h2>
          <p className="text-white/40 text-sm mb-6">{error}</p>
          <a href="/auth" className="btn-primary inline-flex justify-center">
            Back to Sign In
          </a>
        </div>
      </div>
    )
  }

  if (!authInitialized) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-gold-400/20 border-t-gold-400 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-white/30 text-sm">Signing you in...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/chat" replace />
  }

  // No user after auth initialized — OAuth failed or was cancelled
  return <Navigate to="/auth" replace />
}
