import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Plus, MessageSquare, Settings, Shield, LogOut,
  Wrench, ChevronLeft, Search
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
  const navigate = useNavigate()
  const { sidebarOpen, toggleSidebar, conversations, activeConversation } = useStore()

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch {
      // signOut already handles store cleanup
    }
    navigate('/', { replace: true })
  }

  if (!sidebarOpen) return null

  return (
    <aside
      className="h-screen border-r border-white/[0.04] bg-surface-800 flex flex-col overflow-hidden shrink-0"
      style={{ width: 260 }}
    >
      {/* Header */}
      <div className="h-[52px] flex items-center justify-between px-4 border-b border-white/[0.04] shrink-0">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-[7px] bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-black font-bold text-[11px]">
            P
          </div>
          <span className="font-semibold text-[13px]">Plurix</span>
        </Link>
        <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-white/[0.05] text-white/30 hover:text-white/60 transition-colors">
          <ChevronLeft size={14} />
        </button>
      </div>

      {/* Search */}
      <div className="p-2.5 shrink-0">
        <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-[12px] text-white/30 transition-colors">
          <Search size={13} />
          Search conversations...
        </button>
      </div>

      {/* New Chat */}
      <div className="px-2.5 pb-1 shrink-0">
        <Link
          to="/chat"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-gold-400/[0.08] hover:bg-gold-400/[0.12] text-[12px] text-gold-400/80 transition-colors font-medium"
        >
          <Plus size={14} />
          New Chat
        </Link>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto px-2.5 py-2">
        <div className="text-[10px] uppercase tracking-wider text-white/15 font-semibold px-2.5 mb-1.5">
          Recent
        </div>
        {conversations.length === 0 ? (
          <div className="text-center py-8 text-white/15 text-[11px]">
            No conversations yet
          </div>
        ) : (
          conversations.slice(0, 20).map(conv => (
            <Link
              key={conv.id}
              to={`/chat/${conv.id}`}
              className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12px] transition-colors mb-0.5 ${
                activeConversation === conv.id
                  ? 'bg-white/[0.06] text-white/80'
                  : 'text-white/35 hover:bg-white/[0.03] hover:text-white/60'
              }`}
            >
              <MessageSquare size={12} className="shrink-0" />
              <span className="truncate">{conv.title}</span>
            </Link>
          ))
        )}
      </div>

      {/* Footer Nav */}
      <div className="border-t border-white/[0.04] p-2.5 space-y-0.5 shrink-0">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12px] transition-colors ${
              location.pathname === item.path
                ? 'bg-white/[0.06] text-white/80'
                : 'text-white/30 hover:bg-white/[0.03] hover:text-white/60'
            }`}
          >
            <item.icon size={13} />
            {item.label}
          </Link>
        ))}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12px] text-white/20 hover:bg-white/[0.03] hover:text-red-400/70 transition-colors w-full"
        >
          <LogOut size={13} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
