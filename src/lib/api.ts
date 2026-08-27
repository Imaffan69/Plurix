import { AIModel, Message } from '@/types'

const API_BASE = import.meta.env.VITE_API_URL || ''

export async function sendChatMessage(
  messages: Message[],
  model: AIModel,
  options?: {
    temperature?: number
    systemInstruction?: string
    webSearch?: boolean
  }
): Promise<{ text: string; sources?: { title: string; url: string; snippet: string }[] }> {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      model,
      temperature: options?.temperature ?? 0.7,
      systemInstruction: options?.systemInstruction,
      webSearch: options?.webSearch ?? false,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
    throw new Error(err.error || `API error: ${response.status}`)
  }

  return response.json()
}

// Only 2 env vars needed
export const REQUIRED_ENV_VARS = [
  'GOOGLE_API_KEY',
  'GROQ_API_KEY',
  'OPENROUTER_API_KEY',
]

// Which provider each model uses
export const MODEL_PROVIDERS: Partial<Record<AIModel, string>> = {
  'gemini-3.7-flash': 'GOOGLE_API_KEY',
  'gemini-3.6-flash': 'GOOGLE_API_KEY',
  'gemini-3.5-flash': 'GOOGLE_API_KEY',
  'qwen-3.8-27b': 'GROQ_API_KEY',
  'qwen-3.6-27b': 'GROQ_API_KEY',
  'gpt-oss-120b': 'GROQ_API_KEY',
  'gpt-oss-20b': 'GROQ_API_KEY',
  'allam-2-7b': 'GROQ_API_KEY',
  'nemotron-ultra-550b': 'OPENROUTER_API_KEY',
  'nemotron-3.5-lightning': 'OPENROUTER_API_KEY',
  'nemotron-super-120b': 'OPENROUTER_API_KEY',
  'gemma-4-31b': 'OPENROUTER_API_KEY',
  'gemma-4-26b': 'OPENROUTER_API_KEY',
  'minimax-m3': 'OPENROUTER_API_KEY',
  'glm-5.2': 'OPENROUTER_API_KEY',
  'cohere-north-mini': 'OPENROUTER_API_KEY',
  'inkling': 'OPENROUTER_API_KEY',
  'openrouter-free': 'OPENROUTER_API_KEY',
}
