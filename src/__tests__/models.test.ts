import { describe, it, expect } from 'vitest'
import { AI_MODELS, getModelById, getFreeModels } from '@/lib/models'

describe('AI_MODELS config', () => {
  it('contains 12 models', () => {
    expect(AI_MODELS.length).toBe(12)
  })

  it('each model has required fields', () => {
    AI_MODELS.forEach((model) => {
      expect(model.id).toBeTruthy()
      expect(model.name).toBeTruthy()
      expect(model.provider).toBeTruthy()
      expect(model.description).toBeTruthy()
      expect(model.icon).toBeTruthy()
      expect(model.color).toBeTruthy()
      expect(model.maxTokens).toBeGreaterThan(0)
    })
  })

  it('has unique model IDs', () => {
    const ids = AI_MODELS.map((m) => m.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('includes expected key models', () => {
    const ids = AI_MODELS.map((m) => m.id)
    expect(ids).toContain('gemini-2.0-flash')
    expect(ids).toContain('gemini-2.5-pro')
    expect(ids).toContain('llama-3.3-70b')
    expect(ids).toContain('gpt-4o')
    expect(ids).toContain('gpt-4o-mini')
    expect(ids).toContain('claude-3.5-sonnet')
    expect(ids).toContain('deepseek-chat')
    expect(ids).toContain('mimo-v2-flash')
    expect(ids).toContain('mixtral-8x7b')
    expect(ids).toContain('qwen-turbo')
    expect(ids).toContain('mistral-large')
  })
})

describe('getModelById', () => {
  it('returns the correct model', () => {
    const model = getModelById('gemini-2.0-flash')
    expect(model).toBeDefined()
    expect(model!.name).toBe('Gemini 2.0 Flash')
    expect(model!.provider).toBe('Google')
  })

  it('returns undefined for unknown ID', () => {
    expect(getModelById('nonexistent')).toBeUndefined()
  })
})

describe('getFreeModels', () => {
  it('returns only models with free: true', () => {
    const freeModels = getFreeModels()
    freeModels.forEach((m) => expect(m.free).toBe(true))
  })

  it('excludes paid models', () => {
    const freeModels = getFreeModels()
    const ids = freeModels.map((m) => m.id)
    expect(ids).not.toContain('gpt-4o')
  })

  it('returns at least 10 free models', () => {
    expect(getFreeModels().length).toBeGreaterThanOrEqual(10)
  })
})
