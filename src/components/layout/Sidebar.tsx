import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Plus, MessageSquare, Settings, LogOut,
  ChevronLeft, Search, Pencil, Trash2, Cloud, CloudOff, Code, Sun, Moon
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { useStore } from '@/store'
import { signOut } from '@/lib/supabase'

const navItems = [
  { path: '/chat', icon: MessageSquare, label: 'New Chat' },
  { path: '/tools', icon: Code, label: 'Playground' },
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
  const { sidebarOpen, toggleSidebar, conversations, activeConversation, deleteConversation, updateConversationTitle, theme, toggleTheme } = useStore()
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [synced, setSynced] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => setSynced(true), 2000)
    return () => clearInterval(interval)
  }, [])

  const handleSignOut = async () => {
    try { await signOut() } catch {}
    navigate('/', { replace: true })
  }

  const handleDelete = (id: string) => {
    deleteConversation(id)
    if (location.pathname === `/chat/${id}`) navigate('/chat', { replace: true })
  }

  const handleRename = (id: string) => {
    const conv = conversations.find(c => c.id === id)
    if (conv) {
      const newTitle = prompt('Rename conversation:', conv.title)
      if (newTitle && newTitle.trim()) updateConversationTitle(id, newTitle.trim())
    }
  }

  const backdrop = isMobile && sidebarOpen && (
    <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={toggleSidebar} />
  )

  const isDark = theme === 'dark'

  const navLinkStyle = (isActive: boolean) => ({
    background: isActive ? 'var(--bg-glass-hover)' : undefined,
    color: isActive ? 'var(--text-secondary)' : 'var(--text-ghost)',
  })

  return (
    <>
      {backdrop}
      {sidebarOpen && (
        <aside className={`h-screen flex flex-col overflow-hidden shrink-0 z-50 ${isMobile ? 'fixed left-0 top-0 w-[280px] animate-slide-in' : 'relative'}`}
          style={{ width: isMobile ? 280 : 240, borderRight: '1px solid var(--border-subtle)', background: 'var(--bg-secondary)' }}>
          <div className="h-[52px] flex items-center justify-between px-4 shrink-0"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-bold text-[11px]">P</div>
              <span className="font-semibold text-[13px]">Plurix</span>
            </Link>
            <button onClick={toggleSidebar} className="p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--text-ghost)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-ghost)'}>
              <ChevronLeft size={14} />
            </button>
          </div>

          <div className="p-2.5 shrink-0">
            <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] transition-colors"
              style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', color: 'var(--text-ghost)' }}>
              <Search size={12} />
              Search conversations...
            </button>
          </div>

          <div className="px-2.5 pb-1.5 shrink-0">
            <Link to="/chat" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] transition-colors font-medium"
              style={{ background: 'rgba(139,92,246,0.1)', color: 'var(--accent-violet)', opacity: 0.8, border: '1px solid rgba(139,92,246,0.1)' }}>
              <Plus size={14} />
              New Chat
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto px-2.5 py-1">
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-[11px]" style={{ color: 'var(--text-ghost)' }}>No conversations yet</div>
            ) : (
              groupByTime(conversations).map(group => (
                <div key={group.label} className="mb-3">
                  <div className="text-[10px] uppercase tracking-wider font-semibold px-2.5 mb-1" style={{ color: 'var(--text-ghost)' }}>{group.label}</div>
                  {group.items.map(conv => (
                    <div key={conv.id} className="relative group" onMouseEnter={() => setHoveredId(conv.id)} onMouseLeave={() => setHoveredId(null)}>
                      <Link to={`/chat/${conv.id}`} className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12px] transition-colors"
                        style={navLinkStyle(activeConversation === conv.id)}>
                        <MessageSquare size={11} className="shrink-0" />
                        <span className="truncate flex-1">{conv.title}</span>
                      </Link>
                      {hoveredId === conv.id && (
                        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleRename(conv.id)} className="p-1 rounded transition-colors"
                            style={{ color: 'var(--text-ghost)' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-ghost)'}
                            title="Rename"><Pencil size={10} /></button>
                          <button onClick={() => handleDelete(conv.id)} className="p-1 rounded transition-colors"
                            style={{ color: 'var(--text-ghost)' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-red)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-ghost)'}
                            title="Delete"><Trash2 size={10} /></button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>

          <div className="p-2.5 space-y-0.5 shrink-0" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            {navItems.map(item => (
              <Link key={item.path} to={item.path} className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12px] transition-colors"
                style={navLinkStyle(location.pathname === item.path)}>
                <item.icon size={12} />
                {item.label}
              </Link>
            ))}

            {/* Theme toggle */}
            <button onClick={toggleTheme} className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12px] transition-colors w-full"
              style={{ color: 'var(--text-ghost)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.background = 'var(--bg-glass)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-ghost)'; e.currentTarget.style.background = 'transparent' }}>
              {isDark ? <Sun size={12} /> : <Moon size={12} />}
              {isDark ? 'Light mode' : 'Dark mode'}
            </button>

            <button onClick={handleSignOut} className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[12px] transition-colors w-full"
              style={{ color: 'var(--text-ghost)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-red)'; e.currentTarget.style.background = 'var(--bg-glass)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-ghost)'; e.currentTarget.style.background = 'transparent' }}>
              <LogOut size={12} />
              Sign Out
            </button>
          </div>

          <div className="px-4 py-2 flex items-center gap-1.5 text-[10px]" style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-ghost)' }}>
            {synced ? (
              <><Cloud size={10} style={{ color: 'var(--accent-emerald)', opacity: 0.5 }} /><span>HistorySync • Synced</span></>
            ) : (
              <><CloudOff size={10} className="text-yellow-400/50" /><span>HistorySync • Syncing...</span></>
            )}
          </div>
        </aside>
      )}
    </>
  )
}
