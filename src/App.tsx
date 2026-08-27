import { useEffect } from 'react'
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

// OAuth callback handler — Supabase returns tokens in the URL hash fragment (#access_token=...)
// The Supabase client with detectSessionInUrl:true auto-exchanges the code on page load.
// This component just waits for the auth state to resolve and redirects.
function AuthCallback() {
  const user = useStore(s => s.user)
  const authInitialized = useStore(s => s.authInitialized)

  if (!authInitialized) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gold-400/20 border-t-gold-400 rounded-full animate-spin" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/chat" replace />
  }

  return <Navigate to="/auth" replace />
}
