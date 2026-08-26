export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  role: 'user' | 'admin' | 'banned'
  created_at: string
  last_sign_in?: string
  ip_address?: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  model?: AIModel
  created_at: string
  tokens_used?: number
  sources?: Source[]
}

export interface Source {
  title: string
  url: string
  snippet: string
}

export interface Conversation {
  id: string
  title: string
  messages: Message[]
  model: AIModel
  created_at: string
  updated_at: string
  user_id: string
}

export type AIModel = 
  | 'gemini-2.0-flash'
  | 'gemini-2.5-pro'
  | 'llama-3.3-70b'
  | 'llama-3.1-8b'
  | 'mixtral-8x7b'
  | 'gpt-4o-mini'
  | 'gpt-4o'
  | 'claude-3.5-sonnet'
  | 'deepseek-chat'
  | 'qwen-turbo'
  | 'mistral-large'
  | 'mimo-v2-flash'

export interface AIModelInfo {
  id: AIModel
  name: string
  provider: string
  description: string
  icon: string
  color: string
  speed: 'ultra-fast' | 'fast' | 'moderate'
  free: boolean
  maxTokens: number
}

export interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalMessages: number
  bannedUsers: number
  recentIps: { ip: string; count: number; lastSeen: string }[]
}

export interface BannedUser {
  user_id: string
  email: string
  reason: string
  banned_at: string
  expires_at?: string
  type: 'temporary' | 'permanent'
}
