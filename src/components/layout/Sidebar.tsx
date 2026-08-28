import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Plus, MessageSquare, Settings, LogOut,
  Wrench, ChevronLeft, Search, Pencil, Trash2, Cloud, CloudOff
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useStore } from '@/store'
import { signOut } from '@/lib/supabase'

const navItems = [
  { path: '/chat', icon: MessageSquare, label: 'New Chat' },
  { path: '/tools', icon: Wrench, label: 'Tools' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

function groupByTime(conversations: any[]) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 86400000)
  const weekAgo = new Date(today.getTime() - 7 * 86400000)

  const groups: { label: string; items: any[] }[] = [
    { label: 'Today', items: [] },
    { label: 'Yesterday', items: [] },
    { label: 'Previous 7 Days', items: [] },
    { label: 'Older', items: [] },
  ]

  for (const conv of conversations) {
    const d = new Date(conv.updated_at || conv.created_at)
    if (d >= today) groups[0].items.push(conv)
    else if (d >= yesterday) groups[1].items.push(conv)
    else if (d >= weekAgo) groups[2].items.push(conv)
    else groups[3].items.push(conv)
  }

  return groups.filter(g => g.items.length > 0)
}

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { sidebarOpen, toggleSidebar, conversations, activeConversation } = useStore()
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [synced, setSynced] = useState(true)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  // Simulate sync status
  useEffect(() => {
    const interval = setInterval(() => setSynced(true), 2000)
    return () => clearInterval(interval)
  }, [])

  const handleSignOut = async () => {
    try { await signOut() } catch {}
    navigate('/', { replace: true })
  }

  // Mobile: backdrop overlay
  const backdrop = isMobile && sidebarOpen && (
    <div
      className="fixed inset-0 bg-black/60 z-40 md:hidden"
      onClick={toggleSidebar}
    />
  )

  return (
    <>
      {backdrop}
      {sidebarOpen && (
        <aside
          className={`h-screen border-r border-white/[0.05] bg-[#0E0E0E] flex flex-col overflow-hidden shrink-0 z-50 ${
            isMobile ? 'fixed left-0 top-0 w-[280px] animate-slide-in' : 'relative'
          }`}
          style={{ width: isMobile ? 280 : 240 }}
        >
          {/* Header */}
          <div className="h-[52px] flex items-center justify-between px-4 border-b border-white/[0.05] shrink-0">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-bold text-[11px]">P</div>
              <span className="font-semibold text-[13px]">Plurix</span>
            </Link>
            <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-white/[0.05] text-white/30 hover:text-white/60 transition-colors">
              <ChevronLeft size={14} />
            </button>
          </div>

          {/* Search */}
          <div className="p-2.5 shrink-0">
            <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-[12px] text-white/25 transition-colors border border-white/[0.04]">
              <Search size={12} />
              Search conversations...
            </button>
          </div>

          {/* New Chat */}
          <div className="px-2.5 pb-1.5 shrink-0">
            <Link
              to="/chat"
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-violet-500/10 hover:bg-violet-500/15 text-[12px] text-violet-400/80 transition-colors font-medium border border-violet-500/10"
            >
              <Plus size={14} />
              New Chat
            </Link>
          </div>

          {/* Conversations grouped by time */}
          <div className="flex-1 overflow-y-auto px-2.5 py-1">
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-white/15 text-[11px]">
                No conversations yet
              </div>
            ) : (
              groupByTime(conversations).map(group => (
                <div key={group.label} className="mb-3">
                  <div className="text-[10px] uppercase tracking-wider text-white/15 font-semibold px-2.5 mb-1">
                    {group.label}
                  </div>
                  {group.items.map(conv => (
                    <div
                      key={conv.id}
                      className="relative group"
                      onMouseEnter={() => setHoveredId(conv.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    >
                      <Link
                        to={`/chat/${conv.id}`}
                        className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12px] transition-colors ${
                          activeConversation === conv.id
                            ? 'bg-white/[0.06] text-white/70'
                            : 'text-white/30 hover:bg-white/[0.03] hover:text-white/50'
                        }`}
                      >
                        <MessageSquare size={11} className="shrink-0" />
                        <span className="truncate flex-1">{conv.title}</span>
                      </Link>
                      {/* Hover actions */}
                      {hoveredId === conv.id && (
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1 rounded hover:bg-white/[0.08] text-white/25 hover:text-white/60 transition-colors" title="Rename">
                            <Pencil size={10} />
                          </button>
                          <button className="p-1 rounded hover:bg-red-500/10 text-white/25 hover:text-red-400 transition-colors" title="Delete">
                            <Trash2 size={10} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>

          {/* Footer Nav */}
          <div className="border-t border-white/[0.05] p-2.5 space-y-0.5 shrink-0">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12px] transition-colors ${
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
              className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12px] text-white/20 hover:bg-white/[0.03] hover:text-red-400/60 transition-colors w-full"
            >
              <LogOut size={12} />
              Sign Out
            </button>
          </div>

          {/* HistorySync indicator */}
          <div className="px-4 py-2 border-t border-white/[0.05] flex items-center gap-1.5 text-[10px] text-white/20">
            {synced ? (
              <>
                <Cloud size={10} className="text-emerald-400/50" />
                <span>HistorySync • Synced</span>
              </>
            ) : (
              <>
                <CloudOff size={10} className="text-yellow-400/50" />
                <span>HistorySync • Syncing...</span>
              </>
            )}
          </div>
        </aside>
      )}
    </>
  )
}
