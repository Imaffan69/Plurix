import React, { useState, useRef, useEffect, useCallback, memo } from 'react'
import { Link } from 'react-router-dom'
import {
  Send, ChevronDown, Copy, Paperclip, Loader2,
  PanelLeftClose, PanelLeft, Brain, Code, Search,
  Check, X, FileText, Mic, Image as ImageIcon, Zap
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

const MessageContent = memo(function MessageContent({ content, role, isStreaming }: { content: string; role: string; isStreaming?: boolean }) {
  if (role !== 'assistant') {
    return <p className="whitespace-pre-wrap">{content}</p>
  }
  return (
    <ReactMarkdown
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '')
          return match ? (
            <div className="relative my-2 rounded-lg overflow-hidden border border-white/[0.05]">
              <div className="flex items-center justify-between px-3 py-1 bg-white/[0.03] text-[10px] text-white/25">
                <span>{match[1]}</span>
                <button
                  onClick={() => { navigator.clipboard.writeText(String(children)); toast.success('Copied!') }}
                  className="hover:text-white/50 transition-colors"
                >
                  <Copy size={11} />
                </button>
              </div>
              <React.Suspense fallback={
                <pre className="p-3 bg-black/30 text-[12px] font-mono text-white/40 overflow-x-auto">{String(children).replace(/\n$/, '')}</pre>
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
            <code className="px-1 py-0.5 rounded bg-white/[0.06] text-violet-400/80 text-[12px] font-mono" {...props}>
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
  const [attachments, setAttachments] = useState<Array<{ name: string; type: string; size: number }>>([])
  const [streamSpeed, setStreamSpeed] = useState<number | null>(null)
  const [contextUsed, setContextUsed] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentModel = getModelById(selectedModel)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Simulate stream speed during loading
  useEffect(() => {
    if (!loading) { setStreamSpeed(null); return }
    const interval = setInterval(() => {
      setStreamSpeed(Math.floor(Math.random() * 40) + 55)
    }, 800)
    return () => clearInterval(interval)
  }, [loading])

  // Update context usage based on message count
  useEffect(() => {
    const totalChars = messages.reduce((sum, m) => sum + m.content.length, 0)
    const maxContext = currentModel?.maxTokens ? currentModel.maxTokens * 4 : 32000
    setContextUsed(Math.min(100, Math.round((totalChars / maxContext) * 100)))
  }, [messages, currentModel])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachments(prev => [...prev, ...files.map(f => ({ name: f.name, type: f.type, size: f.size }))])
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
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
          model: selectedModel,
          temperature: 0.7,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || `HTTP ${res.status}`)
      }

      const data = await res.json()
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.text || 'No response.',
        model: selectedModel,
        created_at: new Date().toISOString(),
      }])
    } catch (err: any) {
      toast.error(err.message || 'Failed')
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
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div className="flex h-screen bg-[#0A0A0A] overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <div className="h-[48px] border-b border-white/[0.05] flex items-center px-3 gap-2 shrink-0 bg-[#0A0A0A]/80 backdrop-blur-md">
          {/* Mobile hamburger */}
          <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-white/[0.05] text-white/30 hover:text-white/60 transition-colors md:hidden">
            <PanelLeft size={16} />
          </button>
          {/* Desktop sidebar toggle */}
          <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-white/[0.05] text-white/30 hover:text-white/60 transition-colors hidden md:block">
            {sidebarOpen ? <PanelLeftClose size={15} /> : <PanelLeft size={15} />}
          </button>

          {/* PlurixSense badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/15">
            <Zap size={11} className="text-violet-400" />
            <span className="text-[11px] font-semibold text-violet-400/80">PlurixSense</span>
            <span className="text-[10px] text-white/25">•</span>
            <span className="text-[10px] text-white/35">{currentModel?.name || 'Select'}</span>
          </div>

          {/* ContextLock bar */}
          <div className="hidden sm:flex items-center gap-2 ml-2">
            <div className="w-24 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${contextUsed}%`,
                  background: contextUsed > 80 ? 'linear-gradient(90deg, #ef4444, #f59e0b)' : 'linear-gradient(90deg, #7c3aed, #3b82f6)',
                }}
              />
            </div>
            <span className="text-[9px] text-white/20">ContextLock {contextUsed}%</span>
          </div>

          {/* StreamRender speed */}
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
                <p className="text-white/25 text-[13px] mb-6">
                  Powered by <span className="text-violet-400/70">{currentModel?.name}</span>
                </p>
                <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
                  {[
                    { icon: Code, text: 'Write code', color: 'violet' },
                    { icon: Search, text: 'Research', color: 'blue' },
                    { icon: FileText, text: 'Analyze data', color: 'violet' },
                    { icon: ImageIcon, text: 'Generate image', color: 'blue' },
                  ].map(s => (
                    <button
                      key={s.text}
                      onClick={() => { setInput(s.text); inputRef.current?.focus() }}
                      className="glass-card p-3 text-left text-[12px] text-white/35 hover:text-white/60 transition-colors group"
                    >
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
                <div key={msg.id} className="mb-5">
                  <div className={`text-[13px] leading-relaxed ${msg.role === 'user' ? 'text-white/80' : 'text-white/70'}`}>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-1.5 mb-1 text-[11px] text-white/20">
                        <span className="text-violet-400/50">✦</span>
                        <span>{currentModel?.name}</span>
                      </div>
                    )}
                    <MessageContent content={msg.content} role={msg.role} />
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-[12px] text-white/25 streaming-cursor">
                  <span>{currentModel?.name} is thinking</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area — pill-shaped, centered, bottom-anchored */}
        <div className="border-t border-white/[0.05] p-3 md:p-4">
          <div className="max-w-3xl mx-auto">
            {/* Attachments */}
            {attachments.length > 0 && (
              <div className="flex gap-2 mb-2 flex-wrap">
                {attachments.map((a, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-[11px] text-white/35">
                    <FileText size={11} />
                    <span className="truncate max-w-[100px]">{a.name}</span>
                    <button onClick={() => removeAttachment(i)} className="text-white/15 hover:text-white/40">
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Pill-shaped input container */}
            <div className="bg-[#121212] border border-white/[0.06] rounded-2xl flex items-end gap-1 p-1.5 shadow-lg shadow-black/20">
              {/* VisionScan - file upload */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-xl hover:bg-white/[0.05] text-white/20 hover:text-white/40 transition-colors shrink-0"
                title="VisionScan — Upload files"
              >
                <Paperclip size={16} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                accept=".txt,.csv,.json,.pdf,.md,.ts,.tsx,.js,.jsx,.py,.html,.css,.xml,.yaml,.yml,.log,.png,.jpg,.jpeg,.gif,.webp"
              />

              {/* Text input */}
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${currentModel?.name || 'Plurix'}...`}
                className="flex-1 bg-transparent resize-none outline-none text-[13px] text-white/80 placeholder:text-white/18 py-2 px-1 max-h-36 min-h-[32px]"
                rows={1}
                onInput={(e) => {
                  const t = e.target as HTMLTextAreaElement
                  t.style.height = 'auto'
                  t.style.height = Math.min(t.scrollHeight, 144) + 'px'
                }}
              />

              {/* AudioCapture — mic */}
              <button
                className="p-2 rounded-xl hover:bg-white/[0.05] text-white/20 hover:text-white/40 transition-colors shrink-0"
                title="AudioCapture — Voice input"
              >
                <Mic size={16} />
              </button>

              {/* Send button */}
              <button
                onClick={handleSend}
                disabled={(!input.trim() && attachments.length === 0) || loading}
                className="p-2 rounded-xl bg-violet-600 text-white disabled:opacity-20 disabled:cursor-not-allowed hover:bg-violet-500 transition-all shrink-0"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              </button>
            </div>

            {/* Model selector + disclaimer */}
            <div className="flex items-center justify-between mt-2 px-1">
              <div className="relative">
                <button
                  onClick={() => setModelDropdown(!modelDropdown)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-white/[0.04] text-[11px] text-white/25 hover:text-white/40 transition-colors"
                >
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
                        <button
                          key={model.id}
                          onClick={() => { setSelectedModel(model.id as AIModel); setModelDropdown(false) }}
                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                            selectedModel === model.id
                              ? 'bg-violet-500/10 text-white'
                              : 'hover:bg-white/[0.04] text-white/45'
                          }`}
                        >
                          <span className="text-[12px] shrink-0">{model.icon}</span>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-[12px]">{model.name}</div>
                            <div className="text-[10px] text-white/18">{model.provider}</div>
                          </div>
                          {model.free && (
                            <span className="text-[8px] px-1 py-0.5 rounded bg-violet-500/10 text-violet-400/60 font-medium uppercase shrink-0">Free</span>
                          )}
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
