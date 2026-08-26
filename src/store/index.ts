import { create } from 'zustand'
import { AIModel, Conversation, Message, User } from '@/types'

interface AppState {
  user: User | null
  setUser: (user: User | null) => void
  
  conversations: Conversation[]
  activeConversation: string | null
  setActiveConversation: (id: string | null) => void
  addConversation: (conv: Conversation) => void
  addMessage: (conversationId: string, message: Message) => void
  
  selectedModel: AIModel
  setSelectedModel: (model: AIModel) => void
  
  sidebarOpen: boolean
  toggleSidebar: () => void
  
  theme: 'dark' | 'light'
  toggleTheme: () => void
  
  commandPaletteOpen: boolean
  setCommandPaletteOpen: (open: boolean) => void
}

export const useStore = create<AppState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  
  conversations: [],
  activeConversation: null,
  setActiveConversation: (id) => set({ activeConversation: id }),
  addConversation: (conv) => set((state) => ({
    conversations: [conv, ...state.conversations],
  })),
  addMessage: (conversationId, message) => set((state) => ({
    conversations: state.conversations.map((c) =>
      c.id === conversationId
        ? { ...c, messages: [...c.messages, message], updated_at: new Date().toISOString() }
        : c
    ),
  })),
  
  selectedModel: 'gemini-2.0-flash',
  setSelectedModel: (model) => set({ selectedModel: model }),
  
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  theme: 'dark',
  toggleTheme: () => set((state) => ({
    theme: state.theme === 'dark' ? 'light' : 'dark',
  })),
  
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
}))
