import { describe, it, expect } from 'vitest'
import { AI_MODELS, getModelById, getFreeModels } from '@/lib/models'

describe('AI_MODELS data', () => {
  it('contains at least 10 models', () => {
    expect(AI_MODELS.length).toBeGreaterThanOrEqual(10)
  })

  it('every model has required fields', () => {
    for (const model of AI_MODELS) {
      expect(model.id).toBeTruthy()
      expect(model.name).toBeTruthy()
      expect(model.provider).toBeTruthy()
      expect(model.icon).toBeTruthy()
      expect(model.maxTokens).toBeGreaterThan(0)
      expect(['ultra-fast', 'fast', 'moderate']).toContain(model.speed)
      expect(typeof model.free).toBe('boolean')
    }
  })

  it('has no duplicate IDs', () => {
    const ids = AI_MODELS.map(m => m.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('all models are free', () => {
    expect(AI_MODELS.every(m => m.free)).toBe(true)
  })

  it('includes Groq and OpenRouter providers', () => {
    const providers = AI_MODELS.map(m => m.provider.toLowerCase())
    expect(providers.some(p => p.includes('groq'))).toBe(true)
    expect(providers.some(p => p.includes('openrouter'))).toBe(true)
  })

  it('has at least 5 Groq models', () => {
    const groqModels = AI_MODELS.filter(m => m.provider.toLowerCase().includes('groq'))
    expect(groqModels.length).toBeGreaterThanOrEqual(5)
  })

  it('has at least 5 OpenRouter models', () => {
    const orModels = AI_MODELS.filter(m => m.provider.toLowerCase().includes('openrouter'))
    expect(orModels.length).toBeGreaterThanOrEqual(5)
  })
})

describe('getModelById', () => {
  it('returns the correct model', () => {
    const model = getModelById('nemotron-ultra-550b')
    expect(model).toBeDefined()
    expect(model!.name).toBe('Nemotron Ultra 550B')
  })

  it('returns undefined for unknown id', () => {
    expect(getModelById('nonexistent-model')).toBeUndefined()
  })

  it('finds all model IDs', () => {
    for (const m of AI_MODELS) {
      expect(getModelById(m.id)).toBeDefined()
    }
  })
})

describe('getFreeModels', () => {
  it('returns only free models', () => {
    const free = getFreeModels()
    expect(free.every(m => m.free)).toBe(true)
  })

  it('returns all models (all are free)', () => {
    expect(getFreeModels().length).toBe(AI_MODELS.length)
  })
})
