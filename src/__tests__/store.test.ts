import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from '@/store'
import type { AIModel, Message } from '@/types'

describe('Zustand store', () => {
  beforeEach(() => {
    useStore.setState({
      user: null,
      authLoading: true,
      authInitialized: false,
      conversations: [],
      activeConversation: null,
      selectedModel: 'openrouter-free',
      sidebarOpen: true,
      theme: 'dark',
      feedback: {},
    })
  })

  describe('auth state', () => {
    it('starts with user null, authLoading true, authInitialized false', () => {
      const state = useStore.getState()
      expect(state.user).toBeNull()
      expect(state.authLoading).toBe(true)
      expect(state.authInitialized).toBe(false)
    })

    it('setUser updates the user', () => {
      const user = { id: '1', email: 'test@test.com', role: 'user' as const, created_at: '2026-01-01' }
      useStore.getState().setUser(user)
      expect(useStore.getState().user).toEqual(user)
    })

    it('setUser to null clears the user', () => {
      const user = { id: '1', email: 'test@test.com', role: 'user' as const, created_at: '2026-01-01' }
      useStore.getState().setUser(user)
      useStore.getState().setUser(null)
      expect(useStore.getState().user).toBeNull()
    })

    it('setAuthLoading updates loading state', () => {
      useStore.getState().setAuthLoading(false)
      expect(useStore.getState().authLoading).toBe(false)
    })

    it('setAuthInitialized updates initialized state', () => {
      useStore.getState().setAuthInitialized(true)
      expect(useStore.getState().authInitialized).toBe(true)
    })
  })

  describe('model selection', () => {
    it('defaults to openrouter-free (Plurix V1)', () => {
      expect(useStore.getState().selectedModel).toBe('openrouter-free')
    })

    it('setSelectedModel updates the model', () => {
      useStore.getState().setSelectedModel('qwen-3.8-27b' as AIModel)
      expect(useStore.getState().selectedModel).toBe('qwen-3.8-27b')
    })

    it('setSelectedModel accepts all model types', () => {
      const models: AIModel[] = [
        'gemini-3.5-flash', 'nemotron-3.5-lightning', 'qwen-3.8-27b', 'gpt-oss-120b',
        'openrouter-free', 'mistral-medium-3.5', 'codestral',
      ]
      for (const m of models) {
        useStore.getState().setSelectedModel(m)
        expect(useStore.getState().selectedModel).toBe(m)
      }
    })
  })

  describe('sidebar', () => {
    it('defaults to open', () => {
      expect(useStore.getState().sidebarOpen).toBe(true)
    })

    it('toggleSidebar toggles', () => {
      useStore.getState().toggleSidebar()
      expect(useStore.getState().sidebarOpen).toBe(false)
      useStore.getState().toggleSidebar()
      expect(useStore.getState().sidebarOpen).toBe(true)
    })
  })

  describe('theme', () => {
    it('defaults to dark', () => {
      expect(useStore.getState().theme).toBe('dark')
    })

    it('toggleTheme toggles between dark and light', () => {
      useStore.getState().toggleTheme()
      expect(useStore.getState().theme).toBe('light')
      useStore.getState().toggleTheme()
      expect(useStore.getState().theme).toBe('dark')
    })
  })

  describe('feedback', () => {
    it('starts with empty feedback', () => {
      expect(useStore.getState().feedback).toEqual({})
    })

    it('setFeedback sets up vote', () => {
      useStore.getState().setFeedback('msg-1', 'up')
      expect(useStore.getState().feedback['msg-1']).toBe('up')
    })

    it('setFeedback overwrites with null', () => {
      useStore.getState().setFeedback('msg-1', 'up')
      useStore.getState().setFeedback('msg-1', null)
      expect(useStore.getState().feedback['msg-1']).toBeNull()
    })

    it('setFeedback switches vote direction', () => {
      useStore.getState().setFeedback('msg-1', 'up')
      useStore.getState().setFeedback('msg-1', 'down')
      expect(useStore.getState().feedback['msg-1']).toBe('down')
    })

    it('setFeedback affects only specified message', () => {
      useStore.getState().setFeedback('msg-1', 'up')
      useStore.getState().setFeedback('msg-2', 'down')
      expect(useStore.getState().feedback['msg-1']).toBe('up')
      expect(useStore.getState().feedback['msg-2']).toBe('down')
    })
  })

  describe('conversations', () => {
    it('starts with empty conversations', () => {
      expect(useStore.getState().conversations).toEqual([])
    })

    it('addConversation prepends a new conversation', () => {
      const conv1 = {
        id: '1', title: 'First', messages: [], model: 'nemotron-3.5-lightning' as AIModel,
        created_at: '2026-01-01', updated_at: '2026-01-01', user_id: 'u1',
      }
      const conv2 = {
        id: '2', title: 'Second', messages: [], model: 'qwen-3.8-27b' as AIModel,
        created_at: '2026-01-02', updated_at: '2026-01-02', user_id: 'u1',
      }
      useStore.getState().addConversation(conv1)
      useStore.getState().addConversation(conv2)
      const convs = useStore.getState().conversations
      expect(convs).toHaveLength(2)
      expect(convs[0].id).toBe('2')
      expect(convs[1].id).toBe('1')
    })

    it('addMessage appends to the correct conversation', () => {
      const conv = {
        id: 'c1', title: 'Chat', messages: [], model: 'nemotron-3.5-lightning' as AIModel,
        created_at: '2026-01-01', updated_at: '2026-01-01', user_id: 'u1',
      }
      useStore.getState().addConversation(conv)

      const msg: Message = {
        id: 'm1', role: 'user', content: 'Hello', created_at: '2026-01-01T10:00:00Z',
      }
      useStore.getState().addMessage('c1', msg)
      const messages = useStore.getState().conversations[0].messages
      expect(messages).toHaveLength(1)
      expect(messages[0].content).toBe('Hello')
    })

    it('addMessage does not affect other conversations', () => {
      const conv1 = {
        id: 'c1', title: 'Chat 1', messages: [], model: 'nemotron-3.5-lightning' as AIModel,
        created_at: '2026-01-01', updated_at: '2026-01-01', user_id: 'u1',
      }
      const conv2 = {
        id: 'c2', title: 'Chat 2', messages: [], model: 'nemotron-3.5-lightning' as AIModel,
        created_at: '2026-01-01', updated_at: '2026-01-01', user_id: 'u1',
      }
      useStore.getState().addConversation(conv1)
      useStore.getState().addConversation(conv2)

      const msg: Message = {
        id: 'm1', role: 'user', content: 'Only here', created_at: '2026-01-01T10:00:00Z',
      }
      useStore.getState().addMessage('c1', msg)

      const c1 = useStore.getState().conversations.find(c => c.id === 'c1')
      const c2 = useStore.getState().conversations.find(c => c.id === 'c2')
      expect(c1!.messages).toHaveLength(1)
      expect(c2!.messages).toHaveLength(0)
    })

    it('setActiveConversation tracks active', () => {
      useStore.getState().setActiveConversation('c1')
      expect(useStore.getState().activeConversation).toBe('c1')
      useStore.getState().setActiveConversation(null)
      expect(useStore.getState().activeConversation).toBeNull()
    })
  })
})
