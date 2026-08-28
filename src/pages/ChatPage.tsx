import React, { useState, useRef, useEffect, useCallback, memo } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  Send, ChevronDown, Copy, Paperclip, Loader2, StopCircle,
  PanelLeftClose, PanelLeft, Brain, Code, Search,
  Check, X, FileText, Mic, Image as ImageIcon, Zap, ExternalLink
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
            <div className="relative my-2 rounded-lg overflow-hidden border border-white/[0.05]">
              <div className="flex items-center justify-between px-3 py-1 bg-white/[0.03] text-[10px] text-white/25">
                <span>{match[1]}</span>
                <button onClick={() => { navigator.clipboard.writeText(String(children)); toast.success('Copied!') }} className="hover:text-white/50 transition-colors">
                  <Copy size={11} />
                </button>
              </div>
              <React.Suspense fallback={<pre className="p-3 bg-black/30 text-[12px] font-mono text-white/40 overflow-x-auto">{String(children).replace(/\n$/, '')}</pre>}>
                <LazySyntaxHighlighter language={match[1]} PreTag="div" customStyle={{ margin: 0, borderRadius: 0, fontSize: '12px', background: 'rgba(0,0,0,0.3)' }}>
                  {String(children).replace(/\n$/, '')}
                </LazySyntaxHighlighter>
              </React.Suspense>
            </div>
          ) : (
            <code className="px-1 py-0.5 rounded bg-white/[0.06] text-violet-400/80 text-[12px] font-mono" {...props}>{children}</code>
          )
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
})

// File attachment chip with hover tooltip
function FileChip({ file, onOpen }: { file: { name: string; type: string; size: number }; onOpen?: () => void }) {
  const [hovered, setHovered] = useState(false)
  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  const isImage = file.type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)
  const isCode = ['js', 'ts', 'tsx', 'jsx', 'py', 'html', 'css', 'json', 'xml', 'yaml', 'yml', 'md', 'sql', 'sh'].includes(ext)
  const isData = ['csv', 'tsv', 'xls', 'xlsx'].includes(ext)

  const iconColor = isImage ? 'text-pink-400/60' : isCode ? 'text-emerald-400/60' : isData ? 'text-blue-400/60' : 'text-white/25'
  const bgColor = isImage ? 'bg-pink-500/8' : isCode ? 'bg-emerald-500/8' : isData ? 'bg-blue-500/8' : 'bg-white/[0.03]'

  return (
    <div className="relative inline-flex"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${bgColor} border border-white/[0.05] text-[11px] text-white/40 cursor-default transition-colors hover:border-white/[0.1]`}>
        <FileText size={11} className={iconColor} />
        <span className="truncate max-w-[120px]">{file.name}</span>
        <span className="text-[9px] text-white/15">{Math.round(file.size / 1024)}KB</span>
      </div>

      {/* Hover tooltip */}
      {hovered && (
        <div className="absolute bottom-full left-0 mb-2 z-50 pointer-events-auto">
          <div className="bg-[#1a1a1a] border border-white/[0.08] rounded-xl p-3 shadow-xl shadow-black/40 min-w-[220px] backdrop-blur-md">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center border border-white/[0.05]`}>
                <FileText size={14} className={iconColor} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-medium text-white/70 truncate">{file.name}</div>
                <div className="text-[10px] text-white/25">{file.type || 'unknown'} • {Math.round(file.size / 1024)}KB</div>
              </div>
            </div>
            <div className="flex gap-1.5">
              {onOpen && (
                <button onClick={onOpen}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-500/15 text-violet-400 text-[10px] font-medium hover:bg-violet-500/25 transition-colors">
                  <ExternalLink size={10} />
                  Open
                </button>
              )}
              <button onClick={() => { navigator.clipboard.writeText(file.name); toast.success('Copied filename') }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] text-white/35 text-[10px] hover:bg-white/[0.08] transition-colors">
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

export default function ChatPage() {
  const { id: conversationId } = useParams()
  const navigate = useNavigate()
  const { selectedModel, setSelectedModel, sidebarOpen, toggleSidebar, conversations, activeConversation, setActiveConversation, addConversation, addMessage } = useStore()
  const [messages, setMessages] = useState<Message[]>([])
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

  const currentModel = getModelById(selectedModel)

  // Load existing conversation
  useEffect(() => {
    if (conversationId) {
      const conv = conversations.find(c => c.id === conversationId)
      if (conv) {
        setMessages(conv.messages)
        setActiveConversation(conversationId)
        conversationIdRef.current = conversationId
      }
    } else {
      setMessages([])
      conversationIdRef.current = null
      setActiveConversation(null)
    }
  }, [conversationId, conversations, setActiveConversation])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Stream speed simulation
  useEffect(() => {
    if (!loading) { setStreamSpeed(null); return }
    const interval = setInterval(() => setStreamSpeed(Math.floor(Math.random() * 40) + 55), 800)
    return () => clearInterval(interval)
  }, [loading])

  // Context usage
  useEffect(() => {
    const totalChars = messages.reduce((sum, m) => sum + m.content.length, 0)
    const maxContext = currentModel?.maxTokens ? currentModel.maxTokens * 4 : 32000
    setContextUsed(Math.min(100, Math.round((totalChars / maxContext) * 100)))
  }, [messages, currentModel])

  // Stop generation
  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setLoading(false)
    toast('Generation stopped', { icon: '⏹️' })
  }, [])

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const MAX_FILE_SIZE = 5 * 1024 * 1024  // 5MB per file
    const MAX_TOTAL_SIZE = 10 * 1024 * 1024  // 10MB total
    const newAttachments: Array<{ name: string; type: string; size: number; content?: string }> = []
    const currentTotal = attachments.reduce((sum, a) => sum + a.size, 0)
    let runningTotal = currentTotal

    for (const f of files) {
      if (f.size > MAX_FILE_SIZE) {
        toast.error(`${f.name} is too large (${Math.round(f.size / 1024)}KB). Max 5MB per file.`)
        continue
      }
      runningTotal += f.size
      if (runningTotal > MAX_TOTAL_SIZE) {
        toast.error('Total file size exceeds 10MB. Remove some files first.')
        break
      }
      try {
        const content = await readFileAsText(f)
        newAttachments.push({ name: f.name, type: f.type, size: f.size, content })
      } catch {
        newAttachments.push({ name: f.name, type: f.type, size: f.size })
      }
    }

    setAttachments(prev => [...prev, ...newAttachments])
    e.target.value = ''
  }, [attachments])

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
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setAttachments([])
    setLoading(true)

    // Create abort controller for this request
    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const apiMessages = [...messages, userMsg].map(m => ({
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
      setMessages(prev => [...prev, assistantMsg])
    } catch (err: any) {
      // Don't show error toast for aborted requests
      if (err.name === 'AbortError') {
        const stoppedMsg: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: '⏹️ Generation stopped by user.',
          model: selectedModel,
          created_at: new Date().toISOString(),
        }
        addMessage(convId, stoppedMsg)
        setMessages(prev => [...prev, stoppedMsg])
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
      setMessages(prev => [...prev, errMsg])
    } finally {
      setLoading(false)
      abortControllerRef.current = null
    }
  }, [input, loading, messages, selectedModel, attachments, addConversation, addMessage, navigate])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleNewChat = () => {
    // Abort any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setMessages([])
    conversationIdRef.current = null
    setActiveConversation(null)
    navigate('/chat', { replace: true })
  }

  // Get display name for a message's model
  const getModelName = (modelId?: string) => {
    if (!modelId) return currentModel?.name || 'AI'
    const m = getModelById(modelId)
    return m?.name || modelId
  }

  return (
    <div className="flex h-screen bg-[#0A0A0A] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="h-[48px] border-b border-white/[0.05] flex items-center px-3 gap-2 shrink-0 bg-[#0A0A0A]/80 backdrop-blur-md">
          <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-white/[0.05] text-white/30 hover:text-white/60 transition-colors md:hidden">
            <PanelLeft size={16} />
          </button>
          <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-white/[0.05] text-white/30 hover:text-white/60 transition-colors hidden md:block">
            {sidebarOpen ? <PanelLeftClose size={15} /> : <PanelLeft size={15} />}
          </button>
          <button onClick={handleNewChat} className="text-[12px] text-white/30 hover:text-white/50 transition-colors ml-1">+ New Chat</button>

          {/* PlurixSense badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/15">
            <Zap size={11} className="text-violet-400" />
            <span className="text-[11px] font-semibold text-violet-400/80">PlurixSense</span>
            <span className="text-[10px] text-white/25">•</span>
            <span className="text-[10px] text-white/35">{currentModel?.name || 'Select'}</span>
          </div>

          {/* ContextLock */}
          <div className="hidden sm:flex items-center gap-2 ml-2">
            <div className="w-20 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{
                width: `${contextUsed}%`,
                background: contextUsed > 80 ? 'linear-gradient(90deg, #ef4444, #f59e0b)' : 'linear-gradient(90deg, #7c3aed, #3b82f6)',
              }} />
            </div>
            <span className="text-[9px] text-white/20">ContextLock {contextUsed}%</span>
          </div>

          {/* StreamRender */}
          {loading && streamSpeed && (
            <div className="hidden sm:flex items-center gap-1 ml-auto px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/15">
              <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono text-emerald-400/70">{streamSpeed} t/s</span>
              <span className="text-[9px] text-white/20">StreamRender</span>
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-5 text-center">
              <div className="max-w-md">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-blue-500/20 flex items-center justify-center mx-auto mb-4 border border-violet-500/10">
                  <Brain size={22} className="text-violet-400/60" />
                </div>
                <h2 className="text-lg font-semibold mb-1">What can I help with?</h2>
                <p className="text-white/25 text-[13px] mb-6">Powered by <span className="text-violet-400/70">{currentModel?.name}</span></p>
                <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
                  {[
                    { icon: Code, text: 'Write code', color: 'violet' },
                    { icon: Search, text: 'Research', color: 'blue' },
                    { icon: FileText, text: 'Analyze files', color: 'violet' },
                    { icon: ImageIcon, text: 'Generate image', color: 'blue' },
                  ].map(s => (
                    <button key={s.text} onClick={() => { setInput(s.text + ' '); inputRef.current?.focus() }} className="glass-card p-3 text-left text-[12px] text-white/35 hover:text-white/60 transition-colors group">
                      <s.icon size={14} className={`mb-1.5 ${s.color === 'violet' ? 'text-violet-400/40 group-hover:text-violet-400/60' : 'text-blue-400/40 group-hover:text-blue-400/60'} transition-colors`} />
                      <div>{s.text}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto py-5 px-4">
              {messages.map((msg) => (
                <div key={msg.id} className="mb-5 group/msg">
                  <div className={`text-[13px] leading-relaxed ${msg.role === 'user' ? 'text-white/80' : 'text-white/70'}`}>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-1.5 mb-1 text-[11px] text-white/20">
                        <span className="text-violet-400/50">✦</span>
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
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-[12px] text-white/25 streaming-cursor">
                  <div className="flex gap-0.5">
                    <span className="w-1 h-1 rounded-full bg-violet-400/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1 h-1 rounded-full bg-violet-400/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1 h-1 rounded-full bg-violet-400/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span>{currentModel?.name} is thinking</span>
                  <button onClick={handleStop}
                    className="ml-2 px-2 py-0.5 rounded-md bg-red-500/10 text-red-400/70 text-[10px] hover:bg-red-500/20 hover:text-red-400 transition-colors flex items-center gap-1">
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
        <div className="border-t border-white/[0.05] p-3 md:p-4">
          <div className="max-w-3xl mx-auto">
            {attachments.length > 0 && (
              <div className="flex gap-2 mb-2 flex-wrap">
                {attachments.map((a, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-[11px] text-white/35 group/chip">
                    <FileText size={11} />
                    <span className="truncate max-w-[100px]">{a.name}</span>
                    <span className="text-[9px] text-white/15">({Math.round(a.size / 1024)}KB)</span>
                    <button onClick={() => removeAttachment(i)} className="text-white/15 hover:text-white/40 transition-colors"><X size={10} /></button>
                  </div>
                ))}
              </div>
            )}
            <div className="bg-[#121212] border border-white/[0.06] rounded-2xl flex items-end gap-1 p-1.5 shadow-lg shadow-black/20">
              <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-xl hover:bg-white/[0.05] text-white/20 hover:text-white/40 transition-colors shrink-0" title="VisionScan — Upload files">
                <Paperclip size={16} />
              </button>
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect}
                accept=".txt,.csv,.json,.md,.ts,.tsx,.js,.jsx,.py,.html,.css,.xml,.yaml,.yml,.log,.sql,.sh,.env,.config,.tsv,.pdf,.png,.jpg,.jpeg,.gif,.webp,.doc,.docx" />
              <textarea ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                placeholder={`Message ${currentModel?.name || 'Plurix'}...`}
                className="flex-1 bg-transparent resize-none outline-none text-[13px] text-white/80 placeholder:text-white/18 py-2 px-1 max-h-36 min-h-[32px]"
                rows={1}
                onInput={(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = 'auto'; t.style.height = Math.min(t.scrollHeight, 144) + 'px' }} />
              <button className="p-2 rounded-xl hover:bg-white/[0.05] text-white/20 hover:text-white/40 transition-colors shrink-0" title="AudioCapture">
                <Mic size={16} />
              </button>

              {/* Send button (when idle) OR Stop button (when loading) */}
              {loading ? (
                <button onClick={handleStop}
                  className="p-2 rounded-xl bg-red-500/80 text-white hover:bg-red-500 transition-all shrink-0"
                  title="Stop generating">
                  <StopCircle size={15} />
                </button>
              ) : (
                <button onClick={handleSend} disabled={!input.trim() && attachments.length === 0}
                  className="p-2 rounded-xl bg-violet-600 text-white disabled:opacity-20 disabled:cursor-not-allowed hover:bg-violet-500 transition-all shrink-0">
                  <Send size={15} />
                </button>
              )}
            </div>
            <div className="flex items-center justify-between mt-2 px-1">
              <div className="relative">
                <button onClick={() => setModelDropdown(!modelDropdown)} className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-white/[0.04] text-[11px] text-white/25 hover:text-white/40 transition-colors">
                  <span className="text-violet-400/50">{currentModel?.icon}</span>
                  <span>{currentModel?.name || 'Model'}</span>
                  <ChevronDown size={10} className={`transition-transform ${modelDropdown ? 'rotate-180' : ''}`} />
                </button>
                {modelDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setModelDropdown(false)} />
                    <div className="absolute bottom-full left-0 mb-2 w-[280px] glass-elevated p-1.5 z-50 max-h-[320px] overflow-y-auto">
                      <div className="px-2.5 py-1 text-[10px] text-white/20 uppercase tracking-wider font-semibold">Models</div>
                      {AI_MODELS.map(model => (
                        <button key={model.id} onClick={() => { setSelectedModel(model.id as AIModel); setModelDropdown(false) }}
                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${selectedModel === model.id ? 'bg-violet-500/10 text-white' : 'hover:bg-white/[0.04] text-white/45'}`}>
                          <span className="text-[12px] shrink-0">{model.icon}</span>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-[12px]">{model.name}</div>
                            <div className="text-[10px] text-white/18">{model.provider}</div>
                          </div>
                          {model.free && <span className="text-[8px] px-1 py-0.5 rounded bg-violet-500/10 text-violet-400/60 font-medium uppercase shrink-0">Free</span>}
                          {model.id === 'gpt-oss-120b' && <span className="text-[8px] px-1 py-0.5 rounded bg-emerald-500/10 text-emerald-400/60 font-medium uppercase shrink-0">Rec</span>}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="text-[10px] text-white/12">Plurix can make mistakes</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
