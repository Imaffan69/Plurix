import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, MessageSquare, Settings, Shield, LogOut, 
  Wrench, ChevronLeft, User, HelpCircle 
} from 'lucide-react'
import { useStore } from '@/store'
import { signOut } from '@/lib/supabase'

const navItems = [
  { path: '/chat', icon: MessageSquare, label: 'New Chat' },
  { path: '/tools', icon: Wrench, label: 'Tools' },
  { path: '/admin', icon: Shield, label: 'Admin' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  const location = useLocation()
  const { sidebarOpen, toggleSidebar, conversations, activeConversation } = useStore()

  return (
    <AnimatePresence mode="wait">
      {sidebarOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 280, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="h-screen border-r border-white/5 bg-[#0c0c14] flex flex-col overflow-hidden shrink-0"
        >
          {/* Header */}
          <div className="h-14 flex items-center justify-between px-4 border-b border-white/5 shrink-0">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-black text-sm">
                P
              </div>
              <span className="font-semibold text-sm">Plurix</span>
            </Link>
            <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-white/5 text-white/40">
              <ChevronLeft size={16} />
            </button>
          </div>

          {/* New Chat */}
          <div className="p-3 shrink-0">
            <Link 
              to="/chat"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm text-white/80 transition-colors"
            >
              <Plus size={16} />
              New Chat
            </Link>
          </div>

          {/* Conversation History */}
          <div className="flex-1 overflow-y-auto px-3 pb-3">
            <div className="text-[10px] uppercase tracking-wider text-white/20 font-medium px-3 mb-2">
              Recent
            </div>
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-white/20 text-xs">
                No conversations yet
              </div>
            ) : (
              conversations.slice(0, 20).map(conv => (
                <Link
                  key={conv.id}
                  to={`/chat/${conv.id}`}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors mb-0.5 ${
                    activeConversation === conv.id
                      ? 'bg-white/10 text-white'
                      : 'text-white/50 hover:bg-white/5 hover:text-white/70'
                  }`}
                >
                  <MessageSquare size={14} className="shrink-0" />
                  <span className="truncate">{conv.title}</span>
                </Link>
              ))
            )}
          </div>

          {/* Footer Nav */}
          <div className="border-t border-white/5 p-3 space-y-1 shrink-0">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${
                  location.pathname === item.path
                    ? 'bg-white/10 text-white'
                    : 'text-white/40 hover:bg-white/5 hover:text-white/70'
                }`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => { signOut(); window.location.href = '/' }}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-white/30 hover:bg-white/5 hover:text-red-400 transition-colors w-full"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
