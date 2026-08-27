import { describe, it, expect } from 'vitest'
import { supabaseUserToAppUser } from '@/types'

describe('supabaseUserToAppUser', () => {
  it('maps basic fields correctly', () => {
    const sbUser = {
      id: 'uuid-123',
      email: 'alice@example.com',
      user_metadata: {},
      created_at: '2026-01-15T00:00:00Z',
      last_sign_in_at: '2026-08-20T10:00:00Z',
    }
    const user = supabaseUserToAppUser(sbUser)
    expect(user.id).toBe('uuid-123')
    expect(user.email).toBe('alice@example.com')
    expect(user.role).toBe('user')
    expect(user.created_at).toBe('2026-01-15T00:00:00Z')
    expect(user.last_sign_in).toBe('2026-08-20T10:00:00Z')
  })

  it('extracts name from user_metadata', () => {
    const sbUser = {
      id: 'id-1',
      email: 'bob@test.com',
      user_metadata: { name: 'Bob Smith' },
      created_at: '2026-01-01',
    }
    const user = supabaseUserToAppUser(sbUser)
    expect(user.name).toBe('Bob Smith')
  })

  it('falls back to email prefix when no name in metadata', () => {
    const sbUser = {
      id: 'id-2',
      email: 'charlie@example.com',
      user_metadata: {},
      created_at: '2026-01-01',
    }
    const user = supabaseUserToAppUser(sbUser)
    expect(user.name).toBe('charlie')
  })

  it('falls back to empty string when no email', () => {
    const sbUser = {
      id: 'id-3',
      email: null,
      user_metadata: {},
      created_at: '2026-01-01',
    }
    const user = supabaseUserToAppUser(sbUser)
    expect(user.email).toBe('')
    expect(user.name).toBe('')
  })

  it('maps avatar_url from metadata', () => {
    const sbUser = {
      id: 'id-4',
      email: 'd@test.com',
      user_metadata: { avatar_url: 'https://example.com/avatar.png' },
      created_at: '2026-01-01',
    }
    const user = supabaseUserToAppUser(sbUser)
    expect(user.avatar_url).toBe('https://example.com/avatar.png')
  })

  it('handles missing created_at by using current time', () => {
    const before = Date.now()
    const sbUser = {
      id: 'id-5',
      email: 'e@test.com',
      user_metadata: {},
    }
    const user = supabaseUserToAppUser(sbUser)
    const createdTime = new Date(user.created_at).getTime()
    expect(createdTime).toBeGreaterThanOrEqual(before - 1000)
    expect(createdTime).toBeLessThanOrEqual(Date.now() + 1000)
  })

  it('always sets role to user', () => {
    const sbUser = {
      id: 'id-6',
      email: 'f@test.com',
      user_metadata: { role: 'admin' }, // should be ignored
      created_at: '2026-01-01',
    }
    const user = supabaseUserToAppUser(sbUser)
    expect(user.role).toBe('user')
  })
})
