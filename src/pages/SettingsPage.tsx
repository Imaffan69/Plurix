import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, User, Bell, Shield, Palette, Key, Trash2, Save, Mail, CheckCircle, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { useStore } from '@/store'
import { supabase } from '@/lib/supabase'

export default function SettingsPage() {
  const { theme, toggleTheme, user, setUser } = useStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [notifications, setNotifications] = useState(true)
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [saving, setSaving] = useState(false)
  const [emailVerified, setEmailVerified] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setEmail(user.email || '')
    }
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setEmailVerified(data.user.email_confirmed_at != null)
      }
    })
  }, [user])

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data: { user: sbUser } } = await supabase.auth.getUser()
      if (sbUser && name !== (sbUser.user_metadata?.name || '')) {
        const { error } = await supabase.auth.updateUser({ data: { name } })
        if (error) throw error
        if (user) setUser({ ...user, name })
      }
      toast.success('Settings saved')
    } catch (err: any) {
      toast.error(err.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return
    toast.success('Account deletion requested. Contact support for processing.')
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <div className="px-5 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
        <Link to="/chat" className="p-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--text-ghost)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-ghost)'}>
          <ChevronLeft size={16} />
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-glass)' }}>
            <User size={16} style={{ color: 'var(--text-tertiary)' }} />
          </div>
          <div>
            <h1 className="text-[15px] font-bold">Settings</h1>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Manage your account</p>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto p-5 space-y-4">
        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
          <h3 className="text-[13px] font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
            <User size={14} /> Profile
          </h3>
          <div className="space-y-2.5">
            <div>
              <label className="text-[11px] mb-1 block font-medium" style={{ color: 'var(--text-muted)' }}>Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className="glass-input text-[13px]" />
            </div>
            <div>
              <label className="text-[11px] mb-1 block font-medium" style={{ color: 'var(--text-muted)' }}>Email</label>
              <div className="relative">
                <input value={email} readOnly className="glass-input text-[13px] opacity-60 cursor-not-allowed pr-20" type="email" />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {emailVerified ? (
                    <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--accent-emerald)' }}>
                      <CheckCircle size={10} /> Verified
                    </span>
                  ) : (
                    <button className="flex items-center gap-1 text-[10px] transition-colors"
                      style={{ color: 'var(--text-tertiary)' }}>
                      <Mail size={10} /> Verify
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Preferences */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-5">
          <h3 className="text-[13px] font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
            <Palette size={14} /> Preferences
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-1">
              <div>
                <div className="text-[13px] font-medium">Theme</div>
                <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{theme === 'dark' ? 'Dark mode active' : 'Light mode active'}</div>
              </div>
              <button onClick={toggleTheme} className="w-10 h-[22px] rounded-full transition-colors relative" style={{ background: theme === 'dark' ? 'var(--accent-violet)' : 'var(--bg-glass-hover)' }}>
                <div className="w-[18px] h-[18px] rounded-full absolute top-[2px] transition-transform"
                  style={{ background: theme === 'dark' ? '#fff' : 'var(--text-ghost)', transform: theme === 'dark' ? 'translateX(20px)' : 'translateX(2px)' }} />
              </button>
            </div>
            <div className="flex items-center justify-between py-1">
              <div>
                <div className="text-[13px] font-medium">Notifications</div>
                <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Email notifications</div>
              </div>
              <button onClick={() => setNotifications(!notifications)} className="w-10 h-[22px] rounded-full transition-colors relative" style={{ background: notifications ? 'var(--accent-violet)' : 'var(--bg-glass-hover)' }}>
                <div className="w-[18px] h-[18px] rounded-full absolute top-[2px] transition-transform"
                  style={{ background: notifications ? '#fff' : 'var(--text-ghost)', transform: notifications ? 'translateX(20px)' : 'translateX(2px)' }} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* API Keys */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
          <h3 className="text-[13px] font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
            <Key size={14} /> API Keys
          </h3>
          <p className="text-[11px] mb-3" style={{ color: 'var(--text-muted)' }}>Plurix works out of the box. Add your own API keys for higher rate limits.</p>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="Enter your API key (optional)"
              className="glass-input text-[13px] pr-9"
            />
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              style={{ color: 'var(--text-ghost)' }}>
              {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-5" style={{ border: '1px solid rgba(239,68,68,0.08)' }}>
          <h3 className="text-[13px] font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--accent-red)' }}>
            <Trash2 size={14} /> Danger Zone
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[13px] font-medium">Delete Account</div>
              <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Permanently delete your account and data</div>
            </div>
            <button onClick={handleDeleteAccount} className="px-3 py-1.5 rounded-lg text-[12px] transition-colors"
              style={{ background: 'rgba(239,68,68,0.08)', color: 'var(--accent-red)' }}>
              Delete
            </button>
          </div>
        </motion.div>

        <button onClick={handleSave} className="btn-primary w-full justify-center py-2.5" disabled={saving}>
          <Save size={14} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
