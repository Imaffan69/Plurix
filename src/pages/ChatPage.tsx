import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Plus, Settings, ChevronDown,
  Copy, Globe, Paperclip, Loader2,
  PanelLeftClose, PanelLeft, Brain, Code, Image as ImageIcon, Search,
  Sparkles, Check, RotateCcw
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import toast from 'react-hot-toast'
import { useStore } from '@/store'
import { AI_MODELS, getModelById } from '@/lib/models'
import { AIModel, Message } from '@/types'
import Sidebar from '@/components/layout/Sidebar'

export default function ChatPage() {
  const { selectedModel, setSelectedModel, sidebarOpen, toggleSidebar } = useStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [modelDropdown, setModelDropdown] = useState(false)
  const [webSearch, setWebSearch] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const currentModel = getModelById(selectedModel)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || loading) return

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      model: selectedModel,
      created_at: new Date().toISOString(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
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
          webSearch,
        }),
      })

      if (!res.ok) throw new Error('Failed to get response')

      const data = await res.json()
      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.text || 'No response received.',
        model: selectedModel,
        created_at: new Date().toISOString(),
        sources: data.sources,
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (err: any) {
      toast.error(err.message || 'Failed to get response')
      const errMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '⚠️ Sorry, I encountered an error. Please try again.',
        created_at: new Date().toISOString(),
      }
      setMessages(prev => [...prev, errMsg])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex h-screen bg-black overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="h-[52px] border-b border-white/[0.04] flex items-center px-3 gap-2 shrink-0">
          <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-white/[0.05] text-white/30 hover:text-white/60 transition-colors">
            {sidebarOpen ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
          </button>

          {/* Model Selector */}
          <div className="relative">
            <button
              onClick={() => setModelDropdown(!modelDropdown)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/[0.05] text-[13px] transition-colors"
            >
              <span className="text-white/60">{currentModel?.icon}</span>
              <span className="font-medium text-white/70">{currentModel?.name || 'Select Model'}</span>
              <ChevronDown size={12} className={`text-white/30 transition-transform ${modelDropdown ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {modelDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setModelDropdown(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-1.5 w-[300px] glass-elevated p-1.5 z-50 max-h-[360px] overflow-y-auto"
                  >
                    <div className="px-2.5 py-1.5 text-[10px] font-semibold text-white/20 uppercase tracking-wider">
                      Select a model
                    </div>
                    {AI_MODELS.map(model => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model.id as AIModel)
                          setModelDropdown(false)
                        }}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors ${
                          selectedModel === model.id
                            ? 'bg-white/[0.06] text-white'
                            : 'hover:bg-white/[0.04] text-white/60'
                        }`}
                      >
                        <span className="text-sm shrink-0">{model.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-[12px]">{model.name}</div>
                          <div className="text-[11px] text-white/25">{model.provider} · {model.speed}</div>
                        </div>
                        {model.free && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-gold-400/10 text-gold-400 font-semibold uppercase shrink-0">
                            Free
                          </span>
                        )}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="ml-auto flex items-center gap-1">
            <button
              onClick={() => setWebSearch(!webSearch)}
              className={`p-1.5 rounded-lg transition-colors ${webSearch ? 'bg-gold-400/10 text-gold-400' : 'hover:bg-white/[0.05] text-white/30'}`}
              title="Web Search"
            >
              <Globe size={16} />
            </button>
            <Link to="/tools" className="p-1.5 rounded-lg hover:bg-white/[0.05] text-white/30 hover:text-white/60 transition-colors" title="Tools">
              <Code size={16} />
            </Link>
            <Link to="/settings" className="p-1.5 rounded-lg hover:bg-white/[0.05] text-white/30 hover:text-white/60 transition-colors" title="Settings">
              <Settings size={16} />
            </Link>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-5 text-center">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md"
              >
                <div className="w-16 h-16 rounded-2xl bg-gold-400/[0.06] flex items-center justify-center mx-auto mb-5">
                  <Brain size={28} className="text-gold-400/50" />
                </div>
                <h2 className="text-xl font-bold mb-1.5 tracking-tight">What can I help with?</h2>
                <p className="text-white/30 text-[13px] mb-6">
                  Powered by <span className="text-white/50 font-medium">{currentModel?.name}</span>.
                  Ask me anything — code, research, writing, analysis.
                </p>
                <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
                  {[
                    { icon: Code, text: 'Write Python code' },
                    { icon: Search, text: 'Research a topic' },
                    { icon: ImageIcon, text: 'Explain a concept' },
                    { icon: Sparkles, text: 'Creative writing' },
                  ].map(s => (
                    <button
                      key={s.text}
                      onClick={() => { setInput(s.text); inputRef.current?.focus() }}
                      className="glass-card p-3 text-left text-[12px] text-white/40 hover:text-white/70 transition-colors"
                    >
                      <s.icon size={14} className="mb-1.5 text-gold-400/50" />
                      <div>{s.text}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto py-5 px-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-5 ${msg.role === 'user' ? 'flex justify-end' : ''}`}
                >
                  <div className={`max-w-[85%] ${msg.role === 'user' ? 'bg-gold-400/[0.06] border border-gold-400/10 rounded-2xl rounded-br-md px-4 py-2.5' : ''}`}>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-1.5 mb-1.5 text-[11px] text-white/25">
                        <span className="text-[12px]">{currentModel?.icon}</span>
                        <span>{currentModel?.name}</span>
                      </div>
                    )}
                    <div className={`text-[13px] leading-relaxed ${msg.role === 'user' ? 'text-white/80' : 'text-white/70'}`}>
                      {msg.role === 'assistant' ? (
                        <ReactMarkdown
                          components={{
                            code({ className, children, ...props }) {
                              const match = /language-(\w+)/.exec(className || '')
                              return match ? (
                                <div className="relative my-2.5 rounded-xl overflow-hidden border border-white/[0.04]">
                                  <div className="flex items-center justify-between px-3 py-1.5 bg-white/[0.03] text-[10px] text-white/30">
                                    <span>{match[1]}</span>
                                    <button
                                      onClick={() => { navigator.clipboard.writeText(String(children)); toast.success('Copied!') }}
                                      className="hover:text-white/60 transition-colors"
                                    >
                                      <Copy size={11} />
                                    </button>
                                  </div>
                                  <SyntaxHighlighter
                                    style={oneDark}
                                    language={match[1]}
                                    PreTag="div"
                                    customStyle={{ margin: 0, borderRadius: 0, fontSize: '12px', background: 'rgba(0,0,0,0.3)' }}
                                  >
                                    {String(children).replace(/\n$/, '')}
                                  </SyntaxHighlighter>
                                </div>
                              ) : (
                                <code className="px-1 py-0.5 rounded bg-white/[0.08] text-gold-400/80 text-[12px] font-mono" {...props}>
                                  {children}
                                </code>
                              )
                            },
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      ) : (
                        <p>{msg.content}</p>
                      )}
                    </div>
                    {/* Sources */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 pt-2 border-t border-white/[0.04]">
                        <div className="text-[10px] text-white/20 uppercase tracking-wider mb-1.5 font-semibold">Sources</div>
                        {msg.sources.map((src, i) => (
                          <a key={i} href={src.url} target="_blank" rel="noopener noreferrer" className="block text-[11px] text-gold-400/60 hover:text-gold-400/80 truncate py-0.5">
                            {src.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-1.5 text-[12px] text-white/30"
                >
                  <Loader2 size={12} className="animate-spin" />
                  <span>{currentModel?.name} is thinking...</span>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-white/[0.04] p-3">
          <div className="max-w-3xl mx-auto">
            <div className="glass rounded-2xl flex items-end gap-1.5 p-1.5">
              <button className="p-1.5 rounded-lg hover:bg-white/[0.05] text-white/25 hover:text-white/50 transition-colors shrink-0">
                <Paperclip size={16} />
              </button>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${currentModel?.name || 'Plurix'}...`}
                className="flex-1 bg-transparent resize-none outline-none text-[13px] text-white/80 placeholder:text-white/20 py-1.5 px-1 max-h-28 min-h-[32px]"
                rows={1}
                onInput={(e) => {
                  const t = e.target as HTMLTextAreaElement
                  t.style.height = 'auto'
                  t.style.height = Math.min(t.scrollHeight, 112) + 'px'
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="p-2 rounded-xl bg-gold-400 text-black disabled:opacity-20 disabled:cursor-not-allowed hover:bg-gold-300 transition-all shrink-0"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
              </button>
            </div>
            <p className="text-center text-[10px] text-white/15 mt-1.5">
              Plurix can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
