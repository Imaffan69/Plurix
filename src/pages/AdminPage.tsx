import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Shield, Users, MessageSquare, Ban, Activity, Globe,
  Search, ChevronLeft, BarChart3,
  UserX, CheckCircle
} from 'lucide-react'
import { useStore } from '@/store'

interface AdminUser {
  id: string
  email: string
  name: string
  role: 'user' | 'admin' | 'banned'
  ip: string
  lastSeen: string
  messages: number
  createdAt: string
}

interface IpEntry {
  ip: string
  count: number
  lastSeen: string
  location: string
  flagged: boolean
}

const mockUsers: AdminUser[] = [
  { id: '1', email: 'admin@plurix.app', name: 'Admin', role: 'admin', ip: '192.168.1.1', lastSeen: '2 min ago', messages: 342, createdAt: '2026-01-15' },
  { id: '2', email: 'john@example.com', name: 'John Doe', role: 'user', ip: '10.0.0.45', lastSeen: '15 min ago', messages: 89, createdAt: '2026-03-20' },
  { id: '3', email: 'spam@bad.com', name: 'Spammer', role: 'banned', ip: '45.33.12.8', lastSeen: '3 days ago', messages: 1204, createdAt: '2026-06-01' },
  { id: '4', email: 'jane@corp.io', name: 'Jane Smith', role: 'user', ip: '172.16.0.12', lastSeen: '1 hour ago', messages: 56, createdAt: '2026-07-10' },
  { id: '5', email: 'dev@startup.co', name: 'Dev User', role: 'user', ip: '192.168.2.100', lastSeen: '5 min ago', messages: 231, createdAt: '2026-02-28' },
]

const mockIps: IpEntry[] = [
  { ip: '192.168.1.1', count: 342, lastSeen: '2 min ago', location: 'New York, US', flagged: false },
  { ip: '45.33.12.8', count: 1204, lastSeen: '3 days ago', location: 'Unknown', flagged: true },
  { ip: '10.0.0.45', count: 89, lastSeen: '15 min ago', location: 'London, UK', flagged: false },
  { ip: '172.16.0.12', count: 56, lastSeen: '1 hour ago', location: 'Tokyo, JP', flagged: false },
  { ip: '192.168.2.100', count: 231, lastSeen: '5 min ago', location: 'Berlin, DE', flagged: false },
]

const stats = [
  { label: 'Total Users', value: '1,247', change: '+12%', icon: Users },
  { label: 'Active Now', value: '89', change: '+5%', icon: Activity },
  { label: 'Messages Today', value: '3,421', change: '+23%', icon: MessageSquare },
  { label: 'Banned Users', value: '7', change: '-2', icon: Ban },
]

export default function AdminPage() {
  const [tab, setTab] = useState<'overview' | 'users' | 'ips' | 'bans'>('overview')
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState(mockUsers)
  const [ips, setIps] = useState(mockIps)

  const handleBan = (userId: string) => {
    setUsers(prev => prev.map(u =>
      u.id === userId ? { ...u, role: 'banned' as const } : u
    ))
    const user = users.find(u => u.id === userId)
    if (user) {
      setIps(prev => prev.map(ip =>
        ip.ip === user.ip ? { ...ip, flagged: true } : ip
      ))
    }
  }

  const handleUnban = (userId: string) => {
    setUsers(prev => prev.map(u =>
      u.id === userId ? { ...u, role: 'user' as const } : u
    ))
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="border-b border-white/[0.04] px-5 py-3 flex items-center gap-3">
        <Link to="/chat" className="p-1.5 rounded-lg hover:bg-white/[0.05] text-white/30 hover:text-white/60">
          <ChevronLeft size={16} />
        </Link>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-red-500/[0.08] flex items-center justify-center">
            <Shield size={16} className="text-red-400/70" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold">Admin Panel</h1>
            <p className="text-[11px] text-white/25">Manage users, IPs, and security</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-5">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {stats.map((s) => (
            <div key={s.label} className="glass-card p-4">
              <div className="flex items-center justify-between mb-2.5">
                <s.icon size={16} className="text-gold-400/50" />
                <span className="text-[10px] text-emerald-400/70 font-medium">{s.change}</span>
              </div>
              <div className="text-xl font-bold">{s.value}</div>
              <div className="text-[11px] text-white/25 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 mb-5 overflow-x-auto">
          {(['overview', 'users', 'ips', 'bans'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-colors ${
                tab === t ? 'bg-white/[0.08] text-white' : 'text-white/30 hover:bg-white/[0.04] hover:text-white/50'
              }`}
            >
              {t === 'overview' ? 'Overview' : t === 'users' ? 'Users' : t === 'ips' ? 'IP Tracker' : 'Ban List'}
            </button>
          ))}
        </div>

        {tab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-4">
            <div className="glass-card p-5">
              <h3 className="text-[13px] font-semibold mb-4 flex items-center gap-2 text-white/60">
                <BarChart3 size={14} className="text-gold-400/50" /> Activity
              </h3>
              <div className="h-40 flex items-end gap-1">
                {[35, 52, 45, 67, 78, 56, 89, 92, 65, 78, 85, 95].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full rounded-t bg-gold-400/20 transition-all duration-300"
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[9px] text-white/20 mt-2">
                <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span>
              </div>
            </div>

            <div className="glass-card p-5">
              <h3 className="text-[13px] font-semibold mb-4 flex items-center gap-2 text-white/60">
                <Globe size={14} className="text-gold-400/50" /> Top IPs
              </h3>
              <div className="space-y-2">
                {ips.slice(0, 5).map(ip => (
                  <div key={ip.ip} className="flex items-center gap-2.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${ip.flagged ? 'bg-red-400' : 'bg-emerald-400/60'}`} />
                    <span className="text-[12px] font-mono text-white/50 flex-1">{ip.ip}</span>
                    <span className="text-[10px] text-white/20">{ip.location}</span>
                    <span className="text-[11px] text-white/35">{ip.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="glass-card overflow-hidden">
            <div className="p-3 border-b border-white/[0.04]">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="glass-input pl-9 text-[12px]"
                />
              </div>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {users.filter(u =>
                u.name.toLowerCase().includes(search.toLowerCase()) ||
                u.email.toLowerCase().includes(search.toLowerCase()) ||
                u.ip.includes(search)
              ).map(user => (
                <div key={user.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.02] transition-colors">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold ${
                    user.role === 'admin' ? 'bg-gold-400/10 text-gold-400' :
                    user.role === 'banned' ? 'bg-red-500/10 text-red-400/70' :
                    'bg-white/[0.04] text-white/40'
                  }`}>
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-[12px]">{user.name}</span>
                      {user.role === 'admin' && <span className="text-[9px] px-1.5 py-0.5 rounded bg-gold-400/10 text-gold-400 font-semibold">ADMIN</span>}
                      {user.role === 'banned' && <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400/70 font-semibold">BANNED</span>}
                    </div>
                    <div className="text-[11px] text-white/25">{user.email}</div>
                  </div>
                  <div className="text-right hidden md:block">
                    <div className="text-[11px] text-white/20 font-mono">{user.ip}</div>
                    <div className="text-[9px] text-white/15">{user.lastSeen}</div>
                  </div>
                  <div className="text-right hidden md:block">
                    <div className="text-[12px] font-medium">{user.messages}</div>
                    <div className="text-[9px] text-white/15">msgs</div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {user.role !== 'banned' ? (
                      <button
                        onClick={() => handleBan(user.id)}
                        className="p-1 rounded-md hover:bg-amber-500/[0.08] text-white/20 hover:text-amber-400/70 transition-colors"
                        title="Ban"
                      >
                        <Ban size={12} />
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnban(user.id)}
                        className="p-1 rounded-md hover:bg-emerald-500/[0.08] text-white/20 hover:text-emerald-400/70 transition-colors"
                        title="Unban"
                      >
                        <CheckCircle size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'ips' && (
          <div className="glass-card overflow-hidden">
            <div className="divide-y divide-white/[0.04]">
              {ips.map(ip => (
                <div key={ip.ip} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.02]">
                  <div className={`w-2 h-2 rounded-full ${ip.flagged ? 'bg-red-400 animate-pulse' : 'bg-emerald-400/60'}`} />
                  <div className="font-mono text-[12px] flex-1 text-white/60">{ip.ip}</div>
                  <div className="text-[10px] text-white/20 hidden md:block">{ip.location}</div>
                  <div className="text-[12px] font-medium">{ip.count}</div>
                  <div className="text-[9px] text-white/15 w-16 text-right">{ip.lastSeen}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'bans' && (
          <div className="glass-card p-5">
            <h3 className="text-[13px] font-semibold mb-3 text-red-400/70 flex items-center gap-2">
              <UserX size={14} /> Banned Users
            </h3>
            {users.filter(u => u.role === 'banned').length === 0 ? (
              <div className="text-center py-10 text-white/20 text-[12px]">
                <CheckCircle size={28} className="mx-auto mb-2 text-emerald-400/30" />
                No banned users
              </div>
            ) : (
              <div className="space-y-2">
                {users.filter(u => u.role === 'banned').map(user => (
                  <div key={user.id} className="flex items-center gap-3 p-3 rounded-xl bg-red-500/[0.04] border border-red-500/[0.08]">
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-[11px] font-bold text-red-400/70">
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-[12px]">{user.name}</div>
                      <div className="text-[11px] text-white/25">{user.email}</div>
                    </div>
                    <div className="text-[10px] text-white/20 font-mono">{user.ip}</div>
                    <button
                      onClick={() => handleUnban(user.id)}
                      className="px-2.5 py-1 rounded-lg text-[11px] text-emerald-400/70 hover:bg-emerald-500/[0.08] transition-colors"
                    >
                      Unban
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
