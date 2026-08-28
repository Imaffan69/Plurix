// Vercel Serverless Function — Image generation via Pollination AI (free, no API key)
import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { prompt, width = 1024, height = 1024, model = 'flux' } = req.body || {}

  if (!prompt || typeof prompt !== 'string')
    return res.status(400).json({ error: 'prompt is required' })

  try {
    // Pollination AI — free, no key needed
    const seed = Math.floor(Math.random() * 999999)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&model=${model}`

    // Verify the image is accessible
    const checkRes = await fetch(imageUrl, { method: 'HEAD' })
    if (!checkRes.ok) {
      throw new Error(`Image generation failed: ${checkRes.status}`)
    }

    return res.status(200).json({
      url: imageUrl,
      prompt,
      width,
      height,
      model,
    })
  } catch (err: any) {
    console.error('[api/generate-image]', err.message)
    return res.status(500).json({ error: err.message || 'Image generation failed' })
  }
}
