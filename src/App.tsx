import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import LandingPage from '@/pages/LandingPage'
import AuthPage from '@/pages/AuthPage'
import ChatPage from '@/pages/ChatPage'
import AdminPage from '@/pages/AdminPage'
import ToolsPage from '@/pages/ToolsPage'
import SettingsPage from '@/pages/SettingsPage'
import TermsPage from '@/pages/TermsPage'
import PrivacyPage from '@/pages/PrivacyPage'
import NotFoundPage from '@/pages/NotFoundPage'

export default function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/chat/:id" element={<ChatPage />} />
        <Route path="/tools" element={<ToolsPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  )
}
