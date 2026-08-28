// Vercel Serverless Function — routes chat to Groq + OpenRouter + Gemini
import type { VercelRequest, VercelResponse } from '@vercel/node'

type Provider = 'groq' | 'openrouter' | 'gemini'

const MODELS: Record<string, { provider: Provider; modelName: string }> = {
  'gemini-3.5-flash':       { provider: 'gemini', modelName: 'gemini-3.5-flash' },
  'qwen-3.8-27b':           { provider: 'groq', modelName: 'qwen/qwen3.8-27b' },
  'qwen-3.6-27b':           { provider: 'groq', modelName: 'qwen/qwen3.6-27b' },
  'gpt-oss-120b':           { provider: 'groq', modelName: 'openai/gpt-oss-120b' },
  'gpt-oss-20b':            { provider: 'groq', modelName: 'openai/gpt-oss-20b' },
  'allam-2-7b':             { provider: 'groq', modelName: 'allam-2-7b' },
  'nemotron-ultra-550b':    { provider: 'openrouter', modelName: 'nvidia/nemotron-3-ultra-550b-a55b:free' },
  'nemotron-3.5-lightning': { provider: 'openrouter', modelName: 'nvidia/nemotron-3.5-lightning:free' },
  'nemotron-super-120b':    { provider: 'openrouter', modelName: 'nvidia/nemotron-3-super-120b-a12b:free' },
  'gemma-4-31b':            { provider: 'openrouter', modelName: 'google/gemma-4-31b-it:free' },
  'gemma-4-26b':            { provider: 'openrouter', modelName: 'google/gemma-4-26b-a4b-it:free' },
  'minimax-m3':             { provider: 'openrouter', modelName: 'minimax/minimax-m3:free' },
  'cohere-north-mini':      { provider: 'openrouter', modelName: 'cohere/north-mini-code:free' },
  'inkling':                { provider: 'openrouter', modelName: 'thinkingmachines/inkling:free' },
  'openrouter-free':        { provider: 'openrouter', modelName: 'openrouter/free' },
}

function getKey(provider: Provider): string {
  const map: Record<Provider, string> = {
    groq: 'GROQ_API_KEY',
    openrouter: 'OPENROUTER_API_KEY',
    gemini: 'GOOGLE_API_KEY',
  }
  return process.env[map[provider]] || ''
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { messages, model, temperature = 0.7, files } = req.body || {}

  if (!messages || !Array.isArray(messages))
    return res.status(400).json({ error: 'messages array is required' })

  if (!model || !MODELS[model])
    return res.status(400).json({ error: `Unknown model: ${model}`, available: Object.keys(MODELS) })

  const config = MODELS[model]
  const apiKey = getKey(config.provider)
  if (!apiKey)
    return res.status(503).json({ error: `${config.provider.toUpperCase()}_API_KEY not configured.` })

  // Inject file context into the last user message if files are attached
  let processedMessages = [...messages]
  if (files && Array.isArray(files) && files.length > 0) {
    const fileContext = files.map((f: any) => {
      const name = f.name || 'unknown'
      const content = f.content || '(no content available)'
      const type = f.type || 'unknown'
      return `[File: ${name} (${type})]\n${content}`
    }).join('\n\n')

    // Add file context as a system message or prepend to last user message
    const lastUserIdx = processedMessages.findLastIndex((m: any) => m.role === 'user')
    if (lastUserIdx >= 0) {
      processedMessages[lastUserIdx] = {
        ...processedMessages[lastUserIdx],
        content: `The user has attached the following files:\n\n${fileContext}\n\n---\n\nUser message: ${processedMessages[lastUserIdx].content}`,
      }
    }
  }

  try {
    let responseText = ''

    if (config.provider === 'gemini') {
      const contents = processedMessages
        .filter((m: any) => m.role !== 'system')
        .map((m: any) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }))

      const systemMsg = processedMessages.find((m: any) => m.role === 'system')
      const payload: any = {
        contents,
        generationConfig: { temperature, maxOutputTokens: 4096 },
      }
      if (systemMsg) {
        payload.systemInstruction = { parts: [{ text: systemMsg.content }] }
      }

      const apiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${config.modelName}:generateContent?key=${apiKey}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
      )
      if (!apiRes.ok) {
        const err = await apiRes.text()
        throw new Error(`Gemini error ${apiRes.status}: ${err.substring(0, 200)}`)
      }
      const data = await apiRes.json()
      responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    } else {
      const endpoint = config.provider === 'groq'
        ? 'https://api.groq.com/openai/v1/chat/completions'
        : 'https://openrouter.ai/api/v1/chat/completions'

      const apiRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          ...(config.provider === 'openrouter' ? { 'HTTP-Referer': 'https://plurix.app', 'X-Title': 'Plurix' } : {}),
        },
        body: JSON.stringify({ model: config.modelName, messages: processedMessages, temperature, max_tokens: 4096 }),
      })
      if (!apiRes.ok) {
        const err = await apiRes.text()
        throw new Error(`${config.provider} error ${apiRes.status}: ${err.substring(0, 200)}`)
      }
      const data = await apiRes.json()
      responseText = data.choices?.[0]?.message?.content || ''
    }

    if (!responseText) responseText = 'No response received. Please try again.'

    return res.status(200).json({ text: responseText, model: config.modelName, provider: config.provider })

  } catch (err: any) {
    console.error(`[api/chat] ${model}:`, err.message)
    return res.status(500).json({ error: err.message || 'Failed to generate response' })
  }
}
