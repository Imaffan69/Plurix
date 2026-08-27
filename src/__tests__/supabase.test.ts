import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the import.meta.env so supabase.ts reads empty values
vi.stubEnv('VITE_SUPABASE_URL', '')
vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')

// Mock @supabase/supabase-js to track calls
const mockCreateClient = vi.fn()
vi.mock('@supabase/supabase-js', () => ({ createClient: (...args: any[]) => mockCreateClient(...args) }))

describe('Supabase safe client', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    mockCreateClient.mockReset()
    vi.stubEnv('VITE_SUPABASE_URL', '')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')
  })

  it('does NOT call real createClient when env vars are missing', async () => {
    const { supabase } = await import('@/lib/supabase')

    expect(mockCreateClient).not.toHaveBeenCalled()

    expect(supabase).toBeDefined()
    expect(supabase.auth).toBeDefined()
    expect(typeof supabase.auth.signInWithPassword).toBe('function')
    expect(typeof supabase.auth.signUp).toBe('function')
    expect(typeof supabase.auth.signOut).toBe('function')
  })

  it('auth methods return safe no-op results', async () => {
    const { supabase } = await import('@/lib/supabase')

    const result = await supabase.auth.signInWithPassword({
      email: 'test@test.com',
      password: 'password',
    })
    expect(result).toEqual({ data: null, error: null })
  })

  it('onAuthStateChange returns an unsubscribeable subscription', async () => {
    const { supabase } = await import('@/lib/supabase')

    const { data } = supabase.auth.onAuthStateChange(() => {})
    expect(data).toBeDefined()
    expect(data.subscription).toBeDefined()
    expect(typeof data.subscription.unsubscribe).toBe('function')
    data.subscription.unsubscribe()
  })

  it('storage.from() returns safe no-op results', async () => {
    const { supabase } = await import('@/lib/supabase')

    const result = await supabase.storage.from('avatars').upload('file.png', new Blob())
    expect(result).toEqual({ data: null, error: null })
  })

  it('from() returns a safe query builder', async () => {
    const { supabase } = await import('@/lib/supabase')

    const result = await supabase.from('users').select('*')
    expect(result).toEqual({ data: [], error: null })
  })
})
