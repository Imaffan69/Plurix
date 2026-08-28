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
  attachments?: { name: string; type: string; size: number }[]
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
  // Groq
  | 'gpt-oss-120b'
  | 'gpt-oss-20b'
  | 'llama-3.3-70b'
  | 'qwen-3.8-27b'
  | 'qwen-3.6-27b'
  | 'minimax-m2.7'
  // Gemini
  | 'gemini-3.5-flash'
  | 'gemini-2.5-flash'
  | 'gemini-3.7-flash'
  // Mistral
  | 'mistral-medium-3.5'
  | 'codestral'
  // Hugging Face
  | 'hf-llama-3.1-8b'
  | 'hf-qwen2.5-7b'
  // OpenRouter
  | 'llama-4-maverick'
  | 'llama-4-scout'
  | 'nemotron-ultra-550b'
  | 'nemotron-3.5-lightning'
  | 'nemotron-super-120b'
  | 'deepseek-v4-flash'
  | 'gemma-4-31b'
  | 'gemma-4-26b'
  | 'cohere-north-mini'
  | 'inclusionai-ling'
  | 'poolside-laguna'
  | 'openrouter-free'

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

// Convert Supabase User to our app User type
export function supabaseUserToAppUser(supabaseUser: any): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    name: supabaseUser.user_metadata?.name || supabaseUser.email?.split('@')[0] || '',
    avatar_url: supabaseUser.user_metadata?.avatar_url,
    role: 'user',
    created_at: supabaseUser.created_at || new Date().toISOString(),
    last_sign_in: supabaseUser.last_sign_in_at,
  }
}
