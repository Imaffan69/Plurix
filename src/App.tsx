import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import LandingPage from '@/pages/LandingPage'
import AuthPage from '@/pages/AuthPage'
import ChatPage from '@/pages/ChatPage'
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

  if (authLoading || !authInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border-subtle)', borderTopColor: 'var(--text-tertiary)' }} />
      </div>
    )
  }

  if (!user) {
    return <Navigate to={`/auth?returnTo=${encodeURIComponent(location.pathname)}`} replace />
  }

  return <>{children}</>
}

export default function App() {
  const user = useStore(s => s.user)
  const theme = useStore(s => s.theme)
  const loadCloudConversations = useStore(s => s.loadCloudConversations)

  // Apply theme class on mount and when theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  // Initialize Supabase auth listener once on app mount
  useEffect(() => {
    initAuth()
  }, [])

  // When user signs in, load their cloud conversations
  useEffect(() => {
    if (user) {
      import('@/lib/cloudStorage').then(({ syncOnLogin }) => {
        syncOnLogin().then(cloudConvs => {
          if (cloudConvs.length > 0) loadCloudConversations(cloudConvs)
        })
      })
    }
  }, [user, loadCloudConversations])

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
      <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

function AuthCallback() {
  const user = useStore(s => s.user)
  const authInitialized = useStore(s => s.authInitialized)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const errParam = params.get('error')
    const errDesc = params.get('error_description')
    if (errParam) {
      setError(errDesc || `OAuth error: ${errParam}`)
    }

    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const hashError = hashParams.get('error')
    if (hashError && !errParam) {
      setError(hashParams.get('error_description') || `OAuth error: ${hashError}`)
    }
  }, [])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg-primary)' }}>
        <div className="max-w-sm w-full text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <X size={28} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">Authentication failed</h2>
          <p style={{ color: 'var(--text-tertiary)' }} className="text-sm mb-6">{error}</p>
          <a href="/auth" className="btn-primary inline-flex justify-center">
            Back to Sign In
          </a>
        </div>
      </div>
    )
  }

  if (!authInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="text-center">
          <div className="w-6 h-6 border-2 rounded-full animate-spin mx-auto mb-3" style={{ borderColor: 'var(--border-subtle)', borderTopColor: 'var(--text-tertiary)' }} />
          <p style={{ color: 'var(--text-muted)' }} className="text-sm">Signing you in...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return <Navigate to="/chat" replace />
  }

  return <Navigate to="/auth" replace />
}
