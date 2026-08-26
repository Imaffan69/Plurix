import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, User, Bell, Shield, Palette, Key, Trash2, Save } from 'lucide-react'
import toast from 'react-hot-toast'
import { useStore } from '@/store'

export default function SettingsPage() {
  const { theme, toggleTheme } = useStore()
  const [name, setName] = useState('User')
  const [email, setEmail] = useState('user@plurix.app')
  const [notifications, setNotifications] = useState(true)
  const [apiKey, setApiKey] = useState('')

  const handleSave = () => {
    toast.success('Settings saved!')
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="border-b border-white/5 px-6 py-4 flex items-center gap-4">
        <Link to="/chat" className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white">
          <ChevronLeft size={18} />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
            <User size={20} className="text-white/60" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Settings</h1>
            <p className="text-xs text-white/40">Manage your account preferences</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><User size={16} /> Profile</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-white/40 mb-1 block">Name</label>
              <input value={name} onChange={e => setName(e.target.value)} className="glass-input" />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Email</label>
              <input value={email} onChange={e => setEmail(e.target.value)} className="glass-input" type="email" />
            </div>
          </div>
        </motion.div>

        {/* Preferences */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Palette size={16} /> Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Dark Mode</div>
                <div className="text-xs text-white/40">Toggle dark/light theme</div>
              </div>
              <button onClick={toggleTheme} className={`w-12 h-6 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-blue-500' : 'bg-white/20'}`}>
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Notifications</div>
                <div className="text-xs text-white/40">Email notifications</div>
              </div>
              <button onClick={() => setNotifications(!notifications)} className={`w-12 h-6 rounded-full transition-colors relative ${notifications ? 'bg-blue-500' : 'bg-white/20'}`}>
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${notifications ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* API Keys */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Key size={16} /> API Keys</h3>
          <p className="text-xs text-white/40 mb-3">Plurix works out of the box. Add your own API keys for higher rate limits.</p>
          <input 
            type="password" 
            value={apiKey} 
            onChange={e => setApiKey(e.target.value)} 
            placeholder="Enter your API key (optional)" 
            className="glass-input" 
          />
        </motion.div>

        {/* Danger Zone */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 border border-red-500/10">
          <h3 className="font-semibold mb-4 flex items-center gap-2 text-red-400"><Trash2 size={16} /> Danger Zone</h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Delete Account</div>
              <div className="text-xs text-white/40">Permanently delete your account and data</div>
            </div>
            <button className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 text-sm hover:bg-red-500/20 transition-colors">
              Delete Account
            </button>
          </div>
        </motion.div>

        <button onClick={handleSave} className="btn-primary w-full justify-center">
          <Save size={16} /> Save Settings
        </button>
      </div>
    </div>
  )
}
