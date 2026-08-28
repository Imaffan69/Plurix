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
    try { await signOut() } catch {}
    navigate('/', { replace: true })
  }

  if (!sidebarOpen) return null

  return (
    <aside
      className="h-screen border-r border-white/[0.06] bg-[#0c0c0e] flex flex-col overflow-hidden shrink-0"
      style={{ width: 240 }}
    >
      {/* Header */}
      <div className="h-[44px] flex items-center justify-between px-3 border-b border-white/[0.06] shrink-0">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-white text-[#09090b] flex items-center justify-center font-bold text-[10px]">
            P
          </div>
          <span className="font-semibold text-[13px]">Plurix</span>
        </Link>
        <button onClick={toggleSidebar} className="p-1 rounded hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition-colors">
          <ChevronLeft size={13} />
        </button>
      </div>

      {/* Search */}
      <div className="p-2 shrink-0">
        <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] text-[12px] text-white/25 transition-colors">
          <Search size={12} />
          Search
        </button>
      </div>

      {/* New Chat */}
      <div className="px-2 pb-1 shrink-0">
        <Link
          to="/chat"
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.08] text-[12px] text-white/60 transition-colors font-medium"
        >
          <Plus size={13} />
          New Chat
        </Link>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        <div className="text-[10px] uppercase tracking-wider text-white/15 font-semibold px-2 mb-1">
          Recent
        </div>
        {conversations.length === 0 ? (
          <div className="text-center py-6 text-white/15 text-[11px]">
            No conversations yet
          </div>
        ) : (
          conversations.slice(0, 20).map(conv => (
            <Link
              key={conv.id}
              to={`/chat/${conv.id}`}
              className={`flex items-center gap-2 px-2 py-1 rounded-md text-[12px] transition-colors mb-0.5 ${
                activeConversation === conv.id
                  ? 'bg-white/[0.06] text-white/70'
                  : 'text-white/30 hover:bg-white/[0.03] hover:text-white/50'
              }`}
            >
              <MessageSquare size={11} className="shrink-0" />
              <span className="truncate">{conv.title}</span>
            </Link>
          ))
        )}
      </div>

      {/* Footer Nav */}
      <div className="border-t border-white/[0.06] p-2 space-y-0.5 shrink-0">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] transition-colors ${
              location.pathname === item.path
                ? 'bg-white/[0.06] text-white/70'
                : 'text-white/25 hover:bg-white/[0.03] hover:text-white/50'
            }`}
          >
            <item.icon size={12} />
            {item.label}
          </Link>
        ))}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-2 py-1.5 rounded-md text-[12px] text-white/20 hover:bg-white/[0.03] hover:text-red-400/60 transition-colors w-full"
        >
          <LogOut size={12} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
