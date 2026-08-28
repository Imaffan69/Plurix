import React, { useState, useRef, useEffect, useCallback, memo } from 'react'
import { Link } from 'react-router-dom'
import {
  Send, ChevronDown, Copy, Paperclip, Loader2,
  PanelLeftClose, PanelLeft, Brain, Code, Search,
  Check, X, Image as ImageIcon, FileText, Trash2
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import toast from 'react-hot-toast'
import { useStore } from '@/store'
import { AI_MODELS, getModelById } from '@/lib/models'
import { AIModel, Message } from '@/types'
import Sidebar from '@/components/layout/Sidebar'

const LazySyntaxHighlighter = React.lazy(() =>
  import('react-syntax-highlighter').then(mod => ({ default: mod.Prism }))
)

const MessageContent = memo(function MessageContent({ content, role }: { content: string; role: string }) {
  if (role !== 'assistant') {
    return <p className="whitespace-pre-wrap">{content}</p>
  }
  return (
    <ReactMarkdown
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          return match ? (
            <div className="relative my-2 rounded-lg overflow-hidden border border-white/[0.06]">
              <div className="flex items-center justify-between px-3 py-1 bg-white/[0.03] text-[10px] text-white/30">
                <span>{match[1]}</span>
                <button
                  onClick={() => { navigator.clipboard.writeText(String(children)); toast.success('Copied!') }}
                  className="hover:text-white/60 transition-colors"
                >
                  <Copy size={11} />
                </button>
              </div>
              <React.Suspense fallback={
                <pre className="p-3 bg-black/30 text-[12px] font-mono text-white/50 overflow-x-auto">{String(children).replace(/\n$/, '')}</pre>
              }>
                <LazySyntaxHighlighter
                  language={match[1]}
                  PreTag="div"
                  customStyle={{ margin: 0, borderRadius: 0, fontSize: '12px', background: 'rgba(0,0,0,0.3)' }}
                >
                  {String(children).replace(/\n$/, '')}
                </LazySyntaxHighlighter>
              </React.Suspense>
            </div>
          ) : (
            <code className="px-1 py-0.5 rounded bg-white/[0.08] text-indigo-400/80 text-[12px] font-mono" {...props}>
              {children}
            </code>
          )
        },
      }}
    >
      {content}
    </ReactMarkdown>
  )
})

export default function ChatPage() {
  const { selectedModel, setSelectedModel, sidebarOpen, toggleSidebar } = useStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [modelDropdown, setModelDropdown] = useState(false)
  const [attachments, setAttachments] = useState<Array<{ name: string; type: string; size: number; preview?: string }>>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentModel = getModelById(selectedModel)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newAttachments = files.map(f => ({
      name: f.name,
      type: f.type,
      size: f.size,
    }))

    // Preview images
    files.forEach((f, i) => {
      if (f.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (ev) => {
          setAttachments(prev => {
            const updated = [...prev]
            if (updated[i]) updated[i] = { ...updated[i], preview: ev.target?.result as string }
            return updated
          })
        }
        reader.readAsDataURL(f)
      }
    })

    setAttachments(prev => [...prev, ...newAttachments])
    e.target.value = ''
  }, [])

  const removeAttachment = useCallback((index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }, [])

  const handleSend = useCallback(async () => {
    if ((!input.trim() && attachments.length === 0) || loading) return

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      model: selectedModel,
      created_at: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setAttachments([])
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({
            role: m.role,
            content: m.content,
          })),
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
        content: data.text || 'No response received.',
        model: selectedModel,
        created_at: new Date().toISOString(),
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (err: any) {
      toast.error(err.message || 'Failed to get response')
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '⚠️ Something went wrong. Please try again.',
        created_at: new Date().toISOString(),
      }])
    } finally {
      setLoading(false)
    }
  }, [input, loading, messages, selectedModel, attachments])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-screen bg-[#09090b] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar - minimal */}
        <div className="h-[44px] border-b border-white/[0.06] flex items-center px-3 gap-2 shrink-0">
          <button onClick={toggleSidebar} className="p-1 rounded hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition-colors">
            {sidebarOpen ? <PanelLeftClose size={15} /> : <PanelLeft size={15} />}
          </button>
          <div className="text-[12px] text-white/40 font-medium">
            {currentModel?.name || 'Select Model'}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-5 text-center">
              <div className="max-w-md">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
                  <Brain size={20} className="text-white/20" />
                </div>
                <h2 className="text-lg font-semibold mb-1">What can I help with?</h2>
                <p className="text-white/30 text-[13px] mb-5">
                  Using <span className="text-white/50">{currentModel?.name}</span>
                </p>
                <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
                  {[
                    { icon: Code, text: 'Write code' },
                    { icon: Search, text: 'Research' },
                    { icon: FileText, text: 'Analyze data' },
                    { icon: ImageIcon, text: 'Generate image' },
                  ].map(s => (
                    <button
                      key={s.text}
                      onClick={() => { setInput(s.text); inputRef.current?.focus() }}
                      className="glass-card p-2.5 text-left text-[12px] text-white/40 hover:text-white/60 transition-colors"
                    >
                      <s.icon size={13} className="mb-1 text-white/20" />
                      <div>{s.text}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto py-4 px-4">
              {messages.map((msg) => (
                <div key={msg.id} className="mb-4">
                  <div className={`text-[13px] leading-relaxed ${msg.role === 'user' ? 'text-white/80' : 'text-white/70'}`}>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-1.5 mb-1 text-[11px] text-white/20">
                        <span>{currentModel?.name}</span>
                      </div>
                    )}
                    <MessageContent content={msg.content} role={msg.role} />
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-1.5 text-[12px] text-white/25">
                  <Loader2 size={11} className="animate-spin" />
                  <span>{currentModel?.name} is thinking...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area - compact, model selector near input */}
        <div className="border-t border-white/[0.06] p-3">
          <div className="max-w-3xl mx-auto">
            {/* Attachments preview */}
            {attachments.length > 0 && (
              <div className="flex gap-2 mb-2 flex-wrap">
                {attachments.map((a, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[11px] text-white/40">
                    <FileText size={11} />
                    <span className="truncate max-w-[120px]">{a.name}</span>
                    <button onClick={() => removeAttachment(i)} className="text-white/20 hover:text-white/50">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input box */}
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl flex items-end gap-1 p-1">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/25 hover:text-white/50 transition-colors shrink-0"
                title="Attach file"
              >
                <Paperclip size={15} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                accept=".txt,.csv,.json,.pdf,.md,.ts,.tsx,.js,.jsx,.py,.html,.css,.xml,.yaml,.yml,.log,.png,.jpg,.jpeg,.gif,.webp"
              />
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${currentModel?.name || 'Plurix'}...`}
                className="flex-1 bg-transparent resize-none outline-none text-[13px] text-white/80 placeholder:text-white/20 py-1.5 px-1 max-h-32 min-h-[28px]"
                rows={1}
                onInput={(e) => {
                  const t = e.target as HTMLTextAreaElement
                  t.style.height = 'auto'
                  t.style.height = Math.min(t.scrollHeight, 128) + 'px'
                }}
              />
              <button
                onClick={handleSend}
                disabled={(!input.trim() && attachments.length === 0) || loading}
                className="p-1.5 rounded-lg bg-white text-[#09090b] disabled:opacity-20 disabled:cursor-not-allowed hover:bg-white/90 transition-all shrink-0"
              >
                {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>

            {/* Model selector - compact, below input */}
            <div className="flex items-center justify-between mt-1.5 px-1">
              <div className="relative">
                <button
                  onClick={() => setModelDropdown(!modelDropdown)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-white/[0.04] text-[11px] text-white/30 hover:text-white/50 transition-colors"
                >
                  <span>{currentModel?.icon}</span>
                  <span>{currentModel?.name || 'Model'}</span>
                  <ChevronDown size={10} className={`transition-transform ${modelDropdown ? 'rotate-180' : ''}`} />
                </button>

                {modelDropdown && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setModelDropdown(false)} />
                    <div className="absolute bottom-full left-0 mb-2 w-[280px] glass-elevated p-1.5 z-50 max-h-[320px] overflow-y-auto">
                      <div className="px-2.5 py-1 text-[10px] text-white/20 uppercase tracking-wider font-semibold">
                        Models
                      </div>
                      {AI_MODELS.map(model => (
                        <button
                          key={model.id}
                          onClick={() => {
                            setSelectedModel(model.id as AIModel)
                            setModelDropdown(false)
                          }}
                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                            selectedModel === model.id
                              ? 'bg-white/[0.06] text-white'
                              : 'hover:bg-white/[0.04] text-white/50'
                          }`}
                        >
                          <span className="text-[12px] shrink-0">{model.icon}</span>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-[12px]">{model.name}</div>
                            <div className="text-[10px] text-white/20">{model.provider}</div>
                          </div>
                          {model.free && (
                            <span className="text-[8px] px-1 py-0.5 rounded bg-white/[0.06] text-white/30 font-medium uppercase shrink-0">
                              Free
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div className="text-[10px] text-white/15">
                Plurix can make mistakes
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
