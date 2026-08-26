import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Shield, Users, MessageSquare, Ban, Activity, Globe,
  Search, ChevronLeft, Eye, Clock, BarChart3, AlertTriangle,
  UserX, CheckCircle, XCircle, RefreshCw
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
  { label: 'Total Users', value: '1,247', change: '+12%', icon: Users, color: 'blue' },
  { label: 'Active Now', value: '89', change: '+5%', icon: Activity, color: 'emerald' },
  { label: 'Messages Today', value: '3,421', change: '+23%', icon: MessageSquare, color: 'purple' },
  { label: 'Banned Users', value: '7', change: '-2', icon: Ban, color: 'red' },
]

export default function AdminPage() {
  const [tab, setTab] = useState<'overview' | 'users' | 'ips' | 'bans'>('overview')
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState(mockUsers)
  const [ips, setIps] = useState(mockIps)

  const handleBan = (userId: string, type: 'temporary' | 'permanent') => {
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
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header */}
      <div className="border-b border-white/5 px-6 py-4 flex items-center gap-4">
        <Link to="/chat" className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white">
          <ChevronLeft size={18} />
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
            <Shield size={20} className="text-red-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Admin Panel</h1>
            <p className="text-xs text-white/40">Manage users, IPs, and security</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <s.icon size={20} className={`text-${s.color}-400`} />
                <span className="text-xs text-emerald-400 font-medium">{s.change}</span>
              </div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-white/40 mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {(['overview', 'users', 'ips', 'bans'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                tab === t ? 'bg-white/10 text-white' : 'text-white/40 hover:bg-white/5 hover:text-white/60'
              }`}
            >
              {t === 'overview' ? 'Overview' : t === 'users' ? 'Users' : t === 'ips' ? 'IP Tracker' : 'Ban List'}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {tab === 'overview' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <BarChart3 size={18} className="text-blue-400" /> Activity Chart
              </h3>
              <div className="h-48 flex items-end gap-1">
                {[35, 52, 45, 67, 78, 56, 89, 92, 65, 78, 85, 95].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div 
                      className="w-full rounded-t-md bg-gradient-to-t from-blue-500/30 to-purple-500/30"
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] text-white/30 mt-2">
                <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Globe size={18} className="text-purple-400" /> Top IPs
              </h3>
              <div className="space-y-3">
                {ips.slice(0, 5).map(ip => (
                  <div key={ip.ip} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${ip.flagged ? 'bg-red-400' : 'bg-emerald-400'}`} />
                    <span className="text-sm font-mono text-white/70 flex-1">{ip.ip}</span>
                    <span className="text-xs text-white/30">{ip.location}</span>
                    <span className="text-xs text-white/50">{ip.count} msgs</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="text"
                  placeholder="Search users by name, email, or IP..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="glass-input pl-10"
                />
              </div>
            </div>
            <div className="divide-y divide-white/5">
              {users.filter(u => 
                u.name.toLowerCase().includes(search.toLowerCase()) ||
                u.email.toLowerCase().includes(search.toLowerCase()) ||
                u.ip.includes(search)
              ).map(user => (
                <div key={user.id} className="flex items-center gap-4 px-4 py-3 hover:bg-white/[0.02] transition-colors">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${
                    user.role === 'admin' ? 'bg-blue-500/20 text-blue-400' :
                    user.role === 'banned' ? 'bg-red-500/20 text-red-400' :
                    'bg-white/10 text-white/60'
                  }`}>
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{user.name}</span>
                      {user.role === 'admin' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">ADMIN</span>}
                      {user.role === 'banned' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400">BANNED</span>}
                    </div>
                    <div className="text-xs text-white/40">{user.email}</div>
                  </div>
                  <div className="text-right hidden md:block">
                    <div className="text-xs text-white/30 font-mono">{user.ip}</div>
                    <div className="text-[10px] text-white/20">{user.lastSeen}</div>
                  </div>
                  <div className="text-right hidden md:block">
                    <div className="text-sm font-medium">{user.messages}</div>
                    <div className="text-[10px] text-white/20">messages</div>
                  </div>
                  <div className="flex items-center gap-1">
                    {user.role !== 'banned' ? (
                      <>
                        <button 
                          onClick={() => handleBan(user.id, 'temporary')}
                          className="p-1.5 rounded-lg hover:bg-amber-500/10 text-white/30 hover:text-amber-400 transition-colors"
                          title="Temp Ban"
                        >
                          <AlertTriangle size={14} />
                        </button>
                        <button 
                          onClick={() => handleBan(user.id, 'permanent')}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/30 hover:text-red-400 transition-colors"
                          title="Perma Ban"
                        >
                          <Ban size={14} />
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => handleUnban(user.id)}
                        className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-white/30 hover:text-emerald-400 transition-colors"
                        title="Unban"
                      >
                        <CheckCircle size={14} />
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
            <div className="divide-y divide-white/5">
              {ips.map(ip => (
                <div key={ip.ip} className="flex items-center gap-4 px-4 py-3 hover:bg-white/[0.02]">
                  <div className={`w-3 h-3 rounded-full ${ip.flagged ? 'bg-red-400 animate-pulse' : 'bg-emerald-400'}`} />
                  <div className="font-mono text-sm flex-1">{ip.ip}</div>
                  <div className="text-xs text-white/40 hidden md:block">{ip.location}</div>
                  <div className="text-sm font-medium">{ip.count}</div>
                  <div className="text-[10px] text-white/20 w-20 text-right">{ip.lastSeen}</div>
                  <button className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60">
                    <Eye size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'bans' && (
          <div className="glass-card p-6">
            <h3 className="font-semibold mb-4 text-red-400 flex items-center gap-2">
              <UserX size={18} /> Banned Users
            </h3>
            {users.filter(u => u.role === 'banned').length === 0 ? (
              <div className="text-center py-12 text-white/30">
                <CheckCircle size={32} className="mx-auto mb-3 text-emerald-400/50" />
                No banned users
              </div>
            ) : (
              <div className="space-y-3">
                {users.filter(u => u.role === 'banned').map(user => (
                  <div key={user.id} className="flex items-center gap-4 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                    <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-sm font-bold text-red-400">
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{user.name}</div>
                      <div className="text-xs text-white/40">{user.email}</div>
                    </div>
                    <div className="text-xs text-white/30 font-mono">{user.ip}</div>
                    <button 
                      onClick={() => handleUnban(user.id)}
                      className="btn-ghost text-xs text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10"
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
