import type { VercelRequest, VercelResponse } from '@vercel/node'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GROQ_API_KEY = process.env.GROQ_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { messages, model, temperature = 0.7, systemInstruction, webSearch } = req.body

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages format' })
  }

  try {
    let text = ''

    // Route to appropriate provider based on model
    if (model?.startsWith('gemini')) {
      text = await callGemini(messages, model, temperature, systemInstruction)
    } else if (['llama-3.3-70b', 'llama-3.1-8b', 'mixtral-8x7b'].includes(model)) {
      text = await callGroq(messages, model, temperature, systemInstruction)
    } else if (model === 'gpt-4o-mini') {
      text = await callOpenAI(messages, temperature, systemInstruction)
    } else if (model === 'claude-3.5-sonnet') {
      text = await callAnthropic(messages, temperature, systemInstruction)
    } else if (model === 'deepseek-chat') {
      text = await callDeepSeek(messages, temperature, systemInstruction)
    } else if (model === 'mimo-v2-flash') {
      text = await callOpenRouter(messages, 'xiaomi/mimo-v2-flash:free', temperature, systemInstruction)
    } else if (model === 'gpt-4o') {
      text = await callOpenAI(messages, temperature, systemInstruction, 'gpt-4o')
    } else {
      text = await callGemini(messages, 'gemini-2.0-flash', temperature, systemInstruction)
    }

    return res.status(200).json({ text })
  } catch (error: any) {
    console.error('Chat API error:', error)
    return res.status(500).json({ error: error.message || 'Internal server error' })
  }
}

async function callGemini(messages: any[], model: string, temperature: number, systemInstruction?: string) {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured')
  
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))

  const config: any = { temperature }
  if (systemInstruction) config.systemInstruction = systemInstruction

  const modelName = model === 'gemini-2.5-pro' ? 'gemini-2.5-pro' : 'gemini-2.0-flash'
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents, generationConfig: config }),
    }
  )

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Gemini error: ${err}`)
  }

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response'
}

async function callGroq(messages: any[], model: string, temperature: number, systemInstruction?: string) {
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY not configured')

  const modelMap: Record<string, string> = {
    'llama-3.3-70b': 'llama-3.3-70b-versatile',
    'llama-3.1-8b': 'llama-3.1-8b-instant',
    'mixtral-8x7b': 'mixtral-8x7b-32768',
  }

  const formattedMessages = []
  if (systemInstruction) formattedMessages.push({ role: 'system', content: systemInstruction })
  formattedMessages.push(...messages.map(m => ({ role: m.role, content: m.content })))

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: modelMap[model] || 'llama-3.3-70b-versatile',
      messages: formattedMessages,
      temperature,
      max_tokens: 4096,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Groq error: ${err}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || 'No response'
}

async function callOpenAI(messages: any[], temperature: number, systemInstruction?: string, modelOverride?: string) {
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not configured')

  const formattedMessages = []
  if (systemInstruction) formattedMessages.push({ role: 'system', content: systemInstruction })
  formattedMessages.push(...messages.map(m => ({ role: m.role, content: m.content })))

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: modelOverride || 'gpt-4o-mini',
      messages: formattedMessages,
      temperature,
      max_tokens: 4096,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`OpenAI error: ${err}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || 'No response'
}

async function callAnthropic(messages: any[], temperature: number, systemInstruction?: string) {
  if (!ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not configured')

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      temperature,
      system: systemInstruction || 'You are a helpful assistant.',
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Anthropic error: ${err}`)
  }

  const data = await response.json()
  return data.content?.[0]?.text || 'No response'
}

async function callOpenRouter(messages: any[], model: string, temperature: number, systemInstruction?: string) {
  if (!OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY not configured')

  const formattedMessages = []
  if (systemInstruction) formattedMessages.push({ role: 'system', content: systemInstruction })
  formattedMessages.push(...messages.map(m => ({ role: m.role, content: m.content })))

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: formattedMessages,
      temperature,
      max_tokens: 4096,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`OpenRouter error: ${err}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || 'No response'
}

async function callDeepSeek(messages: any[], temperature: number, systemInstruction?: string) {
  if (!DEEPSEEK_API_KEY) throw new Error('DEEPSEEK_API_KEY not configured')

  const formattedMessages = []
  if (systemInstruction) formattedMessages.push({ role: 'system', content: systemInstruction })
  formattedMessages.push(...messages.map(m => ({ role: m.role, content: m.content })))

  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: formattedMessages,
      temperature,
      max_tokens: 4096,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`DeepSeek error: ${err}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || 'No response'
}
