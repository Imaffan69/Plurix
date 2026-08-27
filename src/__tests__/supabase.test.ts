import { describe, it, expect, beforeEach } from 'vitest'
import {
  validatePassword,
  getPasswordStrength,
  supabase,
} from '@/lib/supabase'
import { useStore } from '@/store'

describe('validatePassword', () => {
  it('rejects passwords shorter than 8 characters', () => {
    const result = validatePassword('Ab1!')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('At least 8 characters')
  })

  it('rejects passwords without uppercase', () => {
    const result = validatePassword('alllower1!')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('One uppercase letter')
  })

  it('rejects passwords without lowercase', () => {
    const result = validatePassword('ALLUPPER1!')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('One lowercase letter')
  })

  it('rejects passwords without a number', () => {
    const result = validatePassword('NoNumber!!')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('One number')
  })

  it('rejects passwords without a special character', () => {
    const result = validatePassword('NoSpecial1')
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('One special character')
  })

  it('accepts a fully valid password', () => {
    const result = validatePassword('Str0ng!Pass')
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('collects all errors for a completely invalid password', () => {
    const result = validatePassword('12')
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThanOrEqual(3)
  })
})

describe('getPasswordStrength', () => {
  it('returns Weak for a short password', () => {
    const result = getPasswordStrength('ab1!')
    expect(result.label).toBe('Weak')
    expect(result.score).toBeLessThanOrEqual(2)
    expect(result.color).toBe('#ef4444')
  })

  it('returns Fair for a moderate password', () => {
    const result = getPasswordStrength('Ab1!xyz')
    expect(result.label).toBe('Fair')
    expect(result.score).toBeGreaterThan(2)
  })

  it('returns Strong for a good password', () => {
    const result = getPasswordStrength('MyP@ssw0rd!!')
    expect(result.label).toBe('Strong')
    expect(result.score).toBeGreaterThanOrEqual(5)
  })

  it('returns Very Strong for a long, complex password', () => {
    const result = getPasswordStrength('V3ry!Str0ng&P@ssw0rd!')
    expect(result.label).toBe('Very Strong')
    expect(result.score).toBeGreaterThanOrEqual(6)
  })
})

describe('supabase proxy client (no env vars)', () => {
  beforeEach(() => {
    // Reset the store
    useStore.setState({
      user: null,
      authLoading: true,
      authInitialized: false,
    })
  })

  it('auth.getUser returns null user when no credentials', async () => {
    const { data, error } = await supabase.auth.getUser()
    expect(error).toBeNull()
    expect(data.user).toBeNull()
  })

  it('auth.getSession returns null session when no credentials', async () => {
    const { data, error } = await supabase.auth.getSession()
    expect(error).toBeNull()
    expect(data.session).toBeNull()
  })

  it('auth.onAuthStateChange returns a subscription with unsubscribe', () => {
    const { data } = supabase.auth.onAuthStateChange(() => {})
    expect(data.subscription).toBeDefined()
    expect(typeof data.subscription.unsubscribe).toBe('function')
  })

  it('from() returns a queryable chain', async () => {
    const result = await supabase.from('test').select('*')
    expect(result.data).toEqual([])
    expect(result.error).toBeNull()
  })

  it('storage.from() returns upload and getPublicUrl', () => {
    const bucket = supabase.storage.from('test')
    expect(typeof bucket.upload).toBe('function')
    const { data } = bucket.getPublicUrl('file.png')
    expect(data.publicUrl).toBe('')
  })
})
