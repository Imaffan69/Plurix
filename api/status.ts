// Vercel Serverless Function — returns which AI providers have API keys configured
import type { VercelRequest, VercelResponse } from '@vercel/node'

const PROVIDERS = [
  { key: 'GOOGLE_API_KEY', name: 'Google Gemini', models: ['gemini-2.0-flash', 'gemini-2.5-pro'] },
  { key: 'GROQ_API_KEY', name: 'Groq', models: ['llama-3.3-70b', 'llama-3.1-8b', 'mixtral-8x7b', 'mimo-v2-flash'] },
  { key: 'OPENAI_API_KEY', name: 'OpenAI', models: ['gpt-4o-mini', 'gpt-4o'] },
  { key: 'ANTHROPIC_API_KEY', name: 'Anthropic', models: ['claude-3.5-sonnet'] },
  { key: 'DEEPSEEK_API_KEY', name: 'DeepSeek', models: ['deepseek-chat'] },
  { key: 'QWEN_API_KEY', name: 'Alibaba Qwen', models: ['qwen-turbo'] },
  { key: 'MISTRAL_API_KEY', name: 'Mistral', models: ['mistral-large'] },
]

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 'public, max-age=60')

  const status = PROVIDERS.map(p => ({
    provider: p.name,
    configured: !!process.env[p.key],
    models: p.models,
  }))

  const totalConfigured = status.filter(s => s.configured).length
  const availableModels = status.filter(s => s.configured).flatMap(s => s.models)

  return res.status(200).json({
    status: totalConfigured > 0 ? 'ok' : 'no_keys',
    configuredProviders: totalConfigured,
    totalProviders: PROVIDERS.length,
    providers: status,
    availableModels,
  })
}
