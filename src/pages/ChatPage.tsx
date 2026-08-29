import React, { useState, useRef, useEffect, useCallback, memo } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  Send, ChevronDown, Copy, Paperclip, Loader2, StopCircle,
  PanelLeftClose, PanelLeft, Brain, Code, Search,
  Check, X, FileText, Mic, Image as ImageIcon, Zap, ExternalLink,
  RotateCcw, ThumbsUp, ThumbsDown, Download, Sun, Moon
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import toast from 'react-hot-toast'
import { useStore } from '@/store'
import { AI_MODELS, getModelById } from '@/lib/models'
import { AIModel, Message, Conversation } from '@/types'
import Sidebar from '@/components/layout/Sidebar'

const LazySyntaxHighlighter = React.lazy(() =>
  import('react-syntax-highlighter').then(mod => ({ default: mod.Prism }))
)

const MessageContent = memo(function MessageContent({ content, role }: { content: string; role: string }) {
  if (role !== 'assistant') return <p className="whitespace-pre-wrap">{content}</p>
  return (
    <ReactMarkdown
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          return match ? (
            <div className="relative my-2 rounded-lg overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center justify-between px-3 py-1" style={{ background: 'var(--bg-glass)', color: 'var(--text-ghost)' }}>
                <span className="text-[10px]">{match[1]}</span>
                <button onClick={() => { navigator.clipboard.writeText(String(children)); toast.success('Copied!') }} style={{ color: 'var(--text-ghost)' }} className="hover:opacity-60 transition-opacity">
                  <Copy size={11} />
                </button>
              </div>
              <React.Suspense fallback={<pre className="p-3 text-[12px] font-mono overflow-x-auto" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>{String(children).replace(/\n$/, '')}</pre>}>
                <LazySyntaxHighlighter language={match[1]} PreTag="div" customStyle={{ margin: 0, borderRadius: 0, fontSize: '12px', background: 'var(--bg-secondary)' }}>
                  {String(children).replace(/\n$/, '')}
                </LazySyntaxHighlighter>
              </React.Suspense>
            </div>
          ) : (
            <code className="px-1 py-0.5 rounded text-[12px] font-mono" style={{ background: 'var(--bg-glass)', color: 'var(--accent-violet)' }} {...props}>{children}</code>
          )
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
})

// Copy button with check feedback
function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success(label || 'Copied!')
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button onClick={handleCopy} className="p-1.5 rounded-md transition-all" style={{ color: 'var(--text-ghost)' }}
      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-ghost)'}>
      {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
    </button>
  )
}

// Feedback buttons
function FeedbackButtons({ messageId }: { messageId: string }) {
  const { feedback, setFeedback } = useStore()
  const current = feedback[messageId] || null

  return (
    <div className="flex items-center gap-0.5 mt-1 opacity-0 group-hover/msg:opacity-100 transition-opacity">
      <button onClick={() => setFeedback(messageId, current === 'up' ? null : 'up')}
        className="p-1.5 rounded-md transition-all"
        style={{ color: current === 'up' ? 'var(--accent-emerald)' : 'var(--text-ghost)' }}
        title="Good response">
        <ThumbsUp size={13} fill={current === 'up' ? 'currentColor' : 'none'} />
      </button>
      <button onClick={() => setFeedback(messageId, current === 'down' ? null : 'down')}
        className="p-1.5 rounded-md transition-all"
        style={{ color: current === 'down' ? 'var(--accent-red)' : 'var(--text-ghost)' }}
        title="Bad response">
        <ThumbsDown size={13} fill={current === 'down' ? 'currentColor' : 'none'} />
      </button>
      <CopyButton text={messages.find(m => m.id === messageId)?.content || ''} label="Response copied" />
    </div>
  )
}

// File attachment chip with hover tooltip
function FileChip({ file, onOpen }: { file: { name: string; type: string; size: number }; onOpen?: () => void }) {
  const [hovered, setHovered] = useState(false)
  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  const isImage = file.type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)
  const isCode = ['js', 'ts', 'tsx', 'jsx', 'py', 'html', 'css', 'json', 'xml', 'yaml', 'yml', 'md', 'sql', 'sh'].includes(ext)
  const isData = ['csv', 'tsv', 'xls', 'xlsx'].includes(ext)

  const iconColor = isImage ? 'text-pink-400/60' : isCode ? 'text-emerald-400/60' : isData ? 'text-blue-400/60' : 'var(--text-ghost)'

  return (
    <div className="relative inline-flex"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] cursor-default transition-colors"
        style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', color: 'var(--text-tertiary)' }}>
        <FileText size={11} className={iconColor} />
        <span className="truncate max-w-[120px]">{file.name}</span>
        <span className="text-[9px]" style={{ color: 'var(--text-ghost)' }}>{Math.round(file.size / 1024)}KB</span>
      </div>

      {hovered && (
        <div className="absolute bottom-full left-0 mb-2 z-50 pointer-events-auto">
          <div className="rounded-xl p-3 shadow-xl min-w-[220px] backdrop-blur-md"
            style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)' }}>
                <FileText size={14} className={iconColor} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-medium truncate" style={{ color: 'var(--text-secondary)' }}>{file.name}</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{file.type || 'unknown'} • {Math.round(file.size / 1024)}KB</div>
              </div>
            </div>
            <div className="flex gap-1.5">
              {onOpen && (
                <button onClick={onOpen}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-colors"
                  style={{ background: 'rgba(139,92,246,0.15)', color: 'var(--accent-violet)' }}>
                  <ExternalLink size={10} />
                  Open
                </button>
              )}
              <button onClick={() => { navigator.clipboard.writeText(file.name); toast.success('Copied filename') }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] transition-colors"
                style={{ background: 'var(--bg-glass)', color: 'var(--text-tertiary)' }}>
                <Copy size={10} />
                Copy name
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Read file as text
function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}

// Read file as base64 data URL (for images/PDFs)
function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

// Check if file is an image or binary that should be sent as base64
function isBinaryFile(file: File): boolean {
  return file.type.startsWith('image/') ||
    file.type === 'application/pdf' ||
    file.name.endsWith('.png') || file.name.endsWith('.jpg') || file.name.endsWith('.jpeg') ||
    file.name.endsWith('.gif') || file.name.endsWith('.webp') || file.name.endsWith('.pdf')
}

// Export chat as markdown
function exportChat(messages: Message[], title: string) {
  let md = `# ${title}\n\n`
  for (const m of messages) {
    const name = m.role === 'user' ? 'You' : 'AI'
    const model = m.model ? ` (${getModelById(m.model)?.name || m.model})` : ''
    md += `## ${name}${model}\n\n${m.content}\n\n---\n\n`
  }
  const blob = new Blob([md], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`
  a.click()
  URL.revokeObjectURL(url)
  toast.success('Chat exported as Markdown')
}

// Messages ref needs to be accessible in FeedbackButtons - we'll lift it up
let messages: Message[] = []

export default function ChatPage() {
  const { id: conversationId } = useParams()
  const navigate = useNavigate()
  const { selectedModel, setSelectedModel, sidebarOpen, toggleSidebar, conversations, activeConversation, setActiveConversation, addConversation, addMessage, theme, toggleTheme } = useStore()
  const [localMessages, setLocalMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [modelDropdown, setModelDropdown] = useState(false)
  const [attachments, setAttachments] = useState<Array<{ name: string; type: string; size: number; content?: string }>>([])
  const [streamSpeed, setStreamSpeed] = useState<number | null>(null)
  const [contextUsed, setContextUsed] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const conversationIdRef = useRef<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Expose messages for FeedbackButtons
  messages = localMessages

  const currentModel = getModelById(selectedModel)

  // Load existing conversation
  useEffect(() => {
    if (conversationId) {
      const conv = conversations.find(c => c.id === conversationId)
      if (conv) {
        setLocalMessages(conv.messages)
        setActiveConversation(conversationId)
        conversationIdRef.current = conversationId
      }
    } else {
      setLocalMessages([])
      conversationIdRef.current = null
      setActiveConversation(null)
    }
  }, [conversationId, conversations, setActiveConversation])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [localMessages])

  // Stream speed simulation
  useEffect(() => {
    if (!loading) { setStreamSpeed(null); return }
    const interval = setInterval(() => setStreamSpeed(Math.floor(Math.random() * 40) + 55), 800)
    return () => clearInterval(interval)
  }, [loading])

  // Context usage
  useEffect(() => {
    const totalChars = localMessages.reduce((sum, m) => sum + m.content.length, 0)
    const maxContext = currentModel?.maxTokens ? currentModel.maxTokens * 4 : 32000
    setContextUsed(Math.min(100, Math.round((totalChars / maxContext) * 100)))
  }, [localMessages, currentModel])

  // Stop generation
  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setLoading(false)
    toast('Generation stopped', { icon: '⏹️' })
  }, [])

  // Regenerate last assistant message
  const handleRegenerate = useCallback(async () => {
    if (loading || localMessages.length === 0) return

    // Find last assistant message
    const lastAssistantIdx = [...localMessages].reverse().findIndex(m => m.role === 'assistant')
    if (lastAssistantIdx === -1) return

    const realIdx = localMessages.length - 1 - lastAssistantIdx
    const msgsBefore = localMessages.slice(0, realIdx)
    let userMsgBefore: Message | undefined
    for (let i = msgsBefore.length - 1; i >= 0; i--) {
      if (msgsBefore[i].role === 'user') { userMsgBefore = msgsBefore[i]; break }
    }
    if (!userMsgBefore) return

    // Remove last assistant message from local state
    const trimmed = localMessages.slice(0, realIdx)
    setLocalMessages(trimmed)

    setLoading(true)
    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const apiMessages = trimmed.map(m => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: apiMessages,
          model: selectedModel,
          temperature: 0.7,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `HTTP ${res.status}`)
      }

      const data = await res.json()
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.text || 'No response.',
        model: data.model || selectedModel,
        created_at: new Date().toISOString(),
      }

      if (conversationIdRef.current) {
        addMessage(conversationIdRef.current, assistantMsg)
      }
      setLocalMessages(prev => [...prev, assistantMsg])
    } catch (err: any) {
      if (err.name === 'AbortError') {
        toast('Generation stopped', { icon: '⏹️' })
        return
      }
      toast.error(err.message || 'Failed to regenerate')
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }, [loading, localMessages, selectedModel, addMessage])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newAttachments: Array<{ name: string; type: string; size: number; content?: string }> = []

    for (const f of files) {
      try {
        if (isBinaryFile(f)) {
          const base64 = await readFileAsBase64(f)
          newAttachments.push({ name: f.name, type: f.type, size: f.size, content: base64 })
        } else {
          const content = await readFileAsText(f)
          newAttachments.push({ name: f.name, type: f.type, size: f.size, content })
        }
      } catch {
        newAttachments.push({ name: f.name, type: f.type, size: f.size })
      }
    }

    setAttachments(prev => [...prev, ...newAttachments])
    e.target.value = ''
  }, [])

  const removeAttachment = useCallback((index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handleSend = useCallback(async () => {
    if ((!input.trim() && attachments.length === 0) || loading) return

    const currentAttachments = attachments.map(a => ({ name: a.name, type: a.type, size: a.size }))

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim() || (attachments.length > 0 ? `Analyzing ${attachments.length} file(s)` : ''),
      model: selectedModel,
      created_at: new Date().toISOString(),
      attachments: currentAttachments.length > 0 ? currentAttachments : undefined,
    }

    // Create or get conversation
    if (!conversationIdRef.current) {
      const newConv: Conversation = {
        id: crypto.randomUUID(),
        title: input.trim().substring(0, 50) || 'New conversation',
        messages: [],
        model: selectedModel,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'local',
      }
      addConversation(newConv)
      conversationIdRef.current = newConv.id
      navigate(`/chat/${newConv.id}`, { replace: true })
    }

    const convId = conversationIdRef.current!

    addMessage(convId, userMsg)
    setLocalMessages(prev => [...prev, userMsg])
    setInput('')
    setAttachments([])
    setLoading(true)

    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const apiMessages = [...localMessages, userMsg].map(m => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: apiMessages,
          model: selectedModel,
          temperature: 0.7,
          files: attachments.filter(a => a.content).map(a => ({
            name: a.name,
            type: a.type,
            content: a.content,
            size: a.size,
          })),
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `HTTP ${res.status}`)
      }

      const data = await res.json()
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.text || 'No response.',
        model: data.model || selectedModel,
        created_at: new Date().toISOString(),
      }

      addMessage(convId, assistantMsg)
      setLocalMessages(prev => [...prev, assistantMsg])
    } catch (err: any) {
      if (err.name === 'AbortError') {
        const stoppedMsg: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: '⏹️ Generation stopped by user.',
          model: selectedModel,
          created_at: new Date().toISOString(),
        }
        addMessage(convId, stoppedMsg)
        setLocalMessages(prev => [...prev, stoppedMsg])
        return
      }
      toast.error(err.message || 'Failed')
      const errMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '⚠️ Something went wrong. Please try again.',
        model: selectedModel,
        created_at: new Date().toISOString(),
      }
      addMessage(convId, errMsg)
      setLocalMessages(prev => [...prev, errMsg])
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }, [input, loading, localMessages, selectedModel, attachments, addConversation, addMessage, navigate])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleNewChat = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setLocalMessages([])
    conversationIdRef.current = null
    setActiveConversation(null)
    navigate('/chat', { replace: true })
  }

  const getModelName = (modelId?: string) => {
    if (!modelId) return currentModel?.name || 'AI'
    const m = getModelById(modelId)
    return m?.name || modelId
  }

  const isDark = theme === 'dark'

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-[48px] flex items-center px-3 gap-2 shrink-0 backdrop-blur-md"
          style={{ borderBottom: '1px solid var(--border-subtle)', background: `var(--bg-primary)cc` }}>
          <button onClick={toggleSidebar} className="p-1.5 rounded-lg transition-colors md:hidden"
            style={{ color: 'var(--text-ghost)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-ghost)'}>
            <PanelLeft size={16} />
          </button>
          <button onClick={toggleSidebar} className="p-1.5 rounded-lg transition-colors hidden md:block"
            style={{ color: 'var(--text-ghost)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-ghost)'}>
            {sidebarOpen ? <PanelLeftClose size={15} /> : <PanelLeft size={15} />}
          </button>
          <button onClick={handleNewChat} className="text-[12px] transition-colors ml-1"
            style={{ color: 'var(--text-ghost)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-ghost)'}>
            + New Chat
          </button>

          {/* PlurixSense badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.15)' }}>
            <Zap size={11} style={{ color: 'var(--accent-violet)' }} />
            <span className="text-[11px] font-semibold" style={{ color: 'var(--accent-violet)', opacity: 0.8 }}>PlurixSense</span>
            <span className="text-[10px]" style={{ color: 'var(--text-ghost)' }}>•</span>
            <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{currentModel?.name || 'Select'}</span>
          </div>

          {/* ContextLock */}
          <div className="hidden sm:flex items-center gap-2 ml-2">
            <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-glass)' }}>
              <div className="h-full rounded-full transition-all duration-500" style={{
                width: `${contextUsed}%`,
                background: contextUsed > 80 ? 'linear-gradient(90deg, #ef4444, #f59e0b)' : 'linear-gradient(90deg, #7c3aed, #3b82f6)',
              }} />
            </div>
            <span className="text-[9px]" style={{ color: 'var(--text-ghost)' }}>ContextLock {contextUsed}%</span>
          </div>

          {/* StreamRender */}
          {loading && streamSpeed && (
            <div className="hidden sm:flex items-center gap-1 ml-auto px-2 py-0.5 rounded" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono" style={{ color: 'var(--accent-emerald)', opacity: 0.7 }}>{streamSpeed} t/s</span>
              <span className="text-[9px]" style={{ color: 'var(--text-ghost)' }}>StreamRender</span>
            </div>
          )}

          {/* Theme toggle */}
          <button onClick={toggleTheme} className="p-1.5 rounded-lg transition-colors ml-auto"
            style={{ color: 'var(--text-ghost)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-ghost)'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {localMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-5 text-center">
              <div className="max-w-md">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-4" style={{ border: '1px solid rgba(139,92,246,0.1)' }}>
                  <Brain size={22} style={{ color: 'var(--accent-violet)', opacity: 0.6 }} />
                </div>
                <h2 className="text-lg font-semibold mb-1">What can I help with?</h2>
                <p className="text-[13px] mb-6" style={{ color: 'var(--text-muted)' }}>Powered by <span style={{ color: 'var(--accent-violet)', opacity: 0.7 }}>{currentModel?.name}</span></p>
                <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
                  {[
                    { icon: Code, text: 'Write code', color: 'violet' },
                    { icon: Search, text: 'Research', color: 'blue' },
                    { icon: FileText, text: 'Analyze files', color: 'violet' },
                    { icon: ImageIcon, text: 'Generate image', color: 'blue' },
                  ].map(s => (
                    <button key={s.text} onClick={() => { setInput(s.text + ' '); inputRef.current?.focus() }}
                      className="glass-card p-3 text-left text-[12px] transition-colors group"
                      style={{ color: 'var(--text-tertiary)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}>
                      <s.icon size={14} className={`mb-1.5 ${s.color === 'violet' ? 'text-violet-400/40 group-hover:text-violet-400/60' : 'text-blue-400/40 group-hover:text-blue-400/60'} transition-colors`} />
                      <div>{s.text}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto py-5 px-4">
              {localMessages.map((msg) => (
                <div key={msg.id} className="mb-5 group/msg">
                  <div className="text-[14px] leading-relaxed">
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-1.5 mb-1 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        <span style={{ color: 'var(--accent-violet)', opacity: 0.5 }}>✦</span>
                        <span>{getModelName(msg.model)}</span>
                      </div>
                    )}
                    <MessageContent content={msg.content} role={msg.role} />

                    {/* Show attached files on user messages */}
                    {msg.role === 'user' && msg.attachments && msg.attachments.length > 0 && (
                      <div className="flex gap-1.5 mt-2 flex-wrap">
                        {msg.attachments.map((file, i) => (
                          <FileChip key={i} file={file} />
                        ))}
                      </div>
                    )}

                    {/* Assistant message actions */}
                    {msg.role === 'assistant' && !msg.content.startsWith('⚠️') && !msg.content.startsWith('⏹️') && (
                      <FeedbackButtons messageId={msg.id} />
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-[12px] streaming-cursor" style={{ color: 'var(--text-muted)' }}>
                  <div className="flex gap-0.5">
                    <span className="w-1 h-1 rounded-full animate-bounce" style={{ background: 'var(--accent-violet)', opacity: 0.4, animationDelay: '0ms' }} />
                    <span className="w-1 h-1 rounded-full animate-bounce" style={{ background: 'var(--accent-violet)', opacity: 0.4, animationDelay: '150ms' }} />
                    <span className="w-1 h-1 rounded-full animate-bounce" style={{ background: 'var(--accent-violet)', opacity: 0.4, animationDelay: '300ms' }} />
                  </div>
                  <span>{currentModel?.name} is thinking</span>
                  <button onClick={handleStop}
                    className="ml-2 px-2 py-0.5 rounded-md text-[10px] flex items-center gap-1 transition-colors"
                    style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--accent-red)' }}>
                    <StopCircle size={10} />
                    Stop
                  </button>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-3 md:p-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div className="max-w-3xl mx-auto">
            {attachments.length > 0 && (
              <div className="flex gap-2 mb-2 flex-wrap">
                {attachments.map((a, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] group/chip"
                    style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-subtle)', color: 'var(--text-tertiary)' }}>
                    <FileText size={11} />
                    <span className="truncate max-w-[100px]">{a.name}</span>
                    <span className="text-[9px]" style={{ color: 'var(--text-ghost)' }}>({Math.round(a.size / 1024)}KB)</span>
                    <button onClick={() => removeAttachment(i)} style={{ color: 'var(--text-ghost)' }} className="hover:opacity-60 transition-opacity"><X size={10} /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="rounded-2xl flex items-end gap-1 p-1.5 shadow-lg" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
              <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-xl transition-colors shrink-0"
                style={{ color: 'var(--text-ghost)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-ghost)'}
                title="VisionScan — Upload files">
                <Paperclip size={16} />
              </button>
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect}
                accept=".txt,.csv,.json,.md,.ts,.tsx,.js,.jsx,.py,.html,.css,.xml,.yaml,.yml,.log,.sql,.sh,.env,.config,.tsv,.pdf,.png,.jpg,.jpeg,.gif,.webp" />
              <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                placeholder={`Message ${currentModel?.name || 'Plurix'}...`}
                className="flex-1 bg-transparent resize-none outline-none py-2 px-1 max-h-36 min-h-[32px]"
                style={{ color: 'var(--text-primary)', fontSize: '0.82em' }}
                rows={1}
                onInput={(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 144) + 'px' }} />
              <button className="p-2 rounded-xl transition-colors shrink-0"
                style={{ color: 'var(--text-ghost)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-ghost)'}
                title="AudioCapture">
                <Mic size={16} />
              </button>

              {loading ? (
                <button onClick={handleStop}
                  className="p-2 rounded-xl text-white hover:opacity-90 transition-all shrink-0"
                  style={{ background: 'var(--accent-red)' }}
                  title="Stop generating">
                  <StopCircle size={15} />
                </button>
              ) : (
                <button onClick={handleSend} disabled={!input.trim() && attachments.length === 0}
                  className="p-2 rounded-xl text-white disabled:opacity-20 disabled:cursor-not-allowed hover:opacity-90 transition-all shrink-0"
                  style={{ background: 'var(--accent-violet)' }}>
                  <Send size={15} />
                </button>
              )}
            </div>
            <div className="flex items-center justify-between mt-2 px-1">
              <div className="relative">
                <button onClick={() => setModelDropdown(!modelDropdown)} className="flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors"
                  style={{ color: 'var(--text-ghost)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-ghost)'}>
                  <span style={{ color: 'var(--accent-violet)', opacity: 0.5 }}>{currentModel?.icon}</span>
                  <span>{currentModel?.name || 'Model'}</span>
                  <ChevronDown size={10} className={`transition-transform ${modelDropdown ? 'rotate-180' : ''}`} />
                </button>
                {modelDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setModelDropdown(false)} />
                    <div className="absolute bottom-full left-0 mb-2 w-[280px] glass-elevated p-1.5 z-50 max-h-[320px] overflow-y-auto">
                      <div className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold" style={{ color: 'var(--text-muted)' }}>Models</div>
                      {AI_MODELS.map(model => (
                        <button key={model.id} onClick={() => { setSelectedModel(model.id as AIModel); setModelDropdown(false) }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors"
                          style={{
                            background: selectedModel === model.id ? 'rgba(139,92,246,0.1)' : undefined,
                            color: selectedModel === model.id ? 'var(--text-primary)' : 'var(--text-tertiary)',
                          }}
                          onMouseEnter={(e) => { if (selectedModel !== model.id) e.currentTarget.style.background = 'var(--bg-glass-hover)' }}
                          onMouseLeave={(e) => { if (selectedModel !== model.id) e.currentTarget.style.background = 'transparent' }}>
                          <span className="text-[12px] shrink-0">{model.icon}</span>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-[12px]">{model.name}</div>
                            <div className="text-[10px]" style={{ color: 'var(--text-ghost)' }}>{model.provider}</div>
                          </div>
                          {model.free && <span className="text-[8px] px-1 py-0.5 rounded font-medium uppercase shrink-0" style={{ background: 'rgba(139,92,246,0.1)', color: 'var(--accent-violet)', opacity: 0.6 }}>Free</span>}
                          {model.id === 'gpt-oss-120b' && <span className="text-[8px] px-1 py-0.5 rounded font-medium uppercase shrink-0" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--accent-emerald)', opacity: 0.6 }}>Rec</span>}
                          {model.id === 'openrouter-free' && <span className="text-[8px] px-1 py-0.5 rounded font-medium uppercase shrink-0" style={{ background: 'rgba(139,92,246,0.1)', color: 'var(--accent-violet)', opacity: 0.6 }}>✦</span>}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                {localMessages.length > 0 && (
                  <button onClick={() => exportChat(localMessages, conversations.find(c => c.id === conversationId)?.title || 'Chat')}
                    className="flex items-center gap-1 text-[10px] transition-colors px-2 py-1 rounded-md"
                    style={{ color: 'var(--text-ghost)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-ghost)'}>
                    <Download size={10} />
                    Export
                  </button>
                )}
                <span className="text-[10px]" style={{ color: 'var(--text-ghost)' }}>Plurix can make mistakes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
