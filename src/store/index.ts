import { create } from 'zustand'
import { AIModel, Conversation, Message, User } from '@/types'

// localStorage helpers (offline cache)
function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem('plurix_conversations')
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveConversations(convs: Conversation[]) {
  try { localStorage.setItem('plurix_conversations', JSON.stringify(convs.slice(0, 100))) } catch {}
}

function loadActiveConversation(): string | null {
  try { return localStorage.getItem('plurix_active_conversation') } catch { return null }
}

function saveActiveConversation(id: string | null) {
  try { if (id) localStorage.setItem('plurix_active_conversation', id); else localStorage.removeItem('plurix_active_conversation') } catch {}
}

function loadSelectedModel(): AIModel {
  try { return (localStorage.getItem('plurix_model') as AIModel) || 'gpt-oss-120b' } catch { return 'gpt-oss-120b' }
}

// Lazy-import cloud storage to avoid circular deps
async function getCloudStorage() {
  return await import('@/lib/cloudStorage')
}

interface AppState {
  user: User | null
  setUser: (user: User | null) => void

  authLoading: boolean
  setAuthLoading: (loading: boolean) => void

  authInitialized: boolean
  setAuthInitialized: (initialized: boolean) => void

  conversations: Conversation[]
  activeConversation: string | null
  setActiveConversation: (id: string | null) => void
  addConversation: (conv: Conversation) => void
  addMessage: (conversationId: string, message: Message) => void
  deleteConversation: (id: string) => void
  updateConversationTitle: (id: string, title: string) => void

  /** Load conversations from Supabase cloud (called on login) */
  loadCloudConversations: (convs: Conversation[]) => void

  selectedModel: AIModel
  setSelectedModel: (model: AIModel) => void

  sidebarOpen: boolean
  toggleSidebar: () => void

  theme: 'dark' | 'light'
  toggleTheme: () => void
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  setUser: (user) => set({ user }),

  authLoading: true,
  setAuthLoading: (authLoading) => set({ authLoading }),

  authInitialized: false,
  setAuthInitialized: (authInitialized) => set({ authInitialized }),

  conversations: loadConversations(),
  activeConversation: loadActiveConversation(),
  setActiveConversation: (id) => {
    saveActiveConversation(id)
    set({ activeConversation: id })
  },

  addConversation: (conv) => {
    const updated = [conv, ...get().conversations]
    saveConversations(updated)
    set({ conversations: updated, activeConversation: conv.id })
    saveActiveConversation(conv.id)

    // Sync to cloud if logged in
    const user = get().user
    if (user) {
      getCloudStorage().then(cs => cs.saveCloudConversation(conv))
    }
  },

  addMessage: (conversationId, message) => {
    const updated = get().conversations.map(c =>
      c.id === conversationId
        ? { ...c, messages: [...c.messages, message], updated_at: new Date().toISOString() }
        : c
    )
    saveConversations(updated)
    set({ conversations: updated })

    // Sync to cloud if logged in
    const user = get().user
    if (user) {
      getCloudStorage().then(cs => cs.saveCloudMessage(conversationId, message))
    }
  },

  deleteConversation: (id) => {
    const updated = get().conversations.filter(c => c.id !== id)
    saveConversations(updated)
    const newActive = get().activeConversation === id ? null : get().activeConversation
    saveActiveConversation(newActive)
    set({ conversations: updated, activeConversation: newActive })

    // Sync to cloud if logged in
    const user = get().user
    if (user) {
      getCloudStorage().then(cs => cs.deleteCloudConversation(id))
    }
  },

  updateConversationTitle: (id, title) => {
    const updated = get().conversations.map(c =>
      c.id === id ? { ...c, title, updated_at: new Date().toISOString() } : c
    )
    saveConversations(updated)
    set({ conversations: updated })

    // Sync to cloud if logged in
    const user = get().user
    if (user) {
      getCloudStorage().then(cs => cs.renameCloudConversation(id, title))
    }
  },

  loadCloudConversations: (cloudConvs) => {
    // Merge cloud conversations with local ones
    const localConvs = get().conversations
    const cloudIds = new Set(cloudConvs.map(c => c.id))
    const localOnly = localConvs.filter(c => !cloudIds.has(c.id))
    const merged = [...cloudConvs, ...localOnly]
    saveConversations(merged)
    set({ conversations: merged })
  },

  selectedModel: loadSelectedModel(),
  setSelectedModel: (model) => {
    try { localStorage.setItem('plurix_model', model) } catch {}
    set({ selectedModel: model })
  },

  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  theme: 'dark',
  toggleTheme: () => set((state) => ({
    theme: state.theme === 'dark' ? 'light' : 'dark',
  })),
}))
