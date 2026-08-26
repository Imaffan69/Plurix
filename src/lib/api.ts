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
    const err = await response.json().catch(() => ({ error: 'Unknown error' }))
    throw new Error(err.error || `API error: ${response.status}`)
  }

  return response.json()
}

export async function checkApiStatus(): Promise<{ status: string; models: string[] }> {
  const response = await fetch(`${API_BASE}/api/status`)
  return response.json()
}
