import { AIModel, Message } from '@/types'

const API_BASE = import.meta.env.VITE_API_URL || ''

export async function sendChatMessage(
  messages: Message[],
  model: AIModel,
  options?: {
    temperature?: number
    systemInstruction?: string
    webSearch?: boolean
    files?: { name: string; type: string; content: string; size?: number }[]
  }
): Promise<{ text: string; model?: string; provider?: string }> {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages,
      model,
      temperature: options?.temperature ?? 0.7,
      systemInstruction: options?.systemInstruction,
      webSearch: options?.webSearch ?? false,
      files: options?.files,
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: `HTTP ${response.status}` }))
    throw new Error(err.error || `API error: ${response.status}`)
  }

  return response.json()
}

// Which provider each model uses
export const MODEL_PROVIDERS: Partial<Record<AIModel, string>> = {
  // Groq
  'gpt-oss-120b': 'GROQ_API_KEY',
  'gpt-oss-20b': 'GROQ_API_KEY',
  'llama-3.3-70b': 'GROQ_API_KEY',
  'llama-3.1-8b': 'GROQ_API_KEY',
  'qwen-3.8-27b': 'GROQ_API_KEY',
  'qwen-3.6-27b': 'GROQ_API_KEY',
  'minimax-m2.7': 'GROQ_API_KEY',
  // Gemini
  'gemini-3.5-flash': 'GOOGLE_API_KEY',
  // OpenRouter
  'llama-4-maverick': 'OPENROUTER_API_KEY',
  'llama-4-scout': 'OPENROUTER_API_KEY',
  'nemotron-ultra-550b': 'OPENROUTER_API_KEY',
  'nemotron-3.5-lightning': 'OPENROUTER_API_KEY',
  'nemotron-super-120b': 'OPENROUTER_API_KEY',
  'deepseek-v4-flash': 'OPENROUTER_API_KEY',
  'gemma-4-31b': 'OPENROUTER_API_KEY',
  'gemma-4-26b': 'OPENROUTER_API_KEY',
  'cohere-north-mini': 'OPENROUTER_API_KEY',
  'openrouter-free': 'OPENROUTER_API_KEY',
}

// Only env vars needed
export const REQUIRED_ENV_VARS = [
  'GOOGLE_API_KEY',
  'GROQ_API_KEY',
  'OPENROUTER_API_KEY',
]
