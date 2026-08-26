import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  return res.status(200).json({
    status: 'online',
    version: '2.0.0',
    name: 'Plurix',
    timestamp: new Date().toISOString(),
    models: {
      gemini: !!process.env.GEMINI_API_KEY,
      groq: !!process.env.GROQ_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      deepseek: !!process.env.DEEPSEEK_API_KEY,
    },
  })
}
