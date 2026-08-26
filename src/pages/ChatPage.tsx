import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Plus, Settings, Menu, ChevronDown, Sparkles,
  Copy, Check, RotateCcw, Globe, Paperclip, Loader2,
  PanelLeftClose, PanelLeft, Brain, Code, Image as ImageIcon, Search
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
  const navigate = useNavigate()
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
    <div className="flex h-screen bg-[#0a0a0f] overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="h-14 border-b border-white/5 flex items-center px-4 gap-3 shrink-0">
          <button onClick={toggleSidebar} className="p-2 rounded-xl hover:bg-white/5 text-white/50 hover:text-white transition-colors">
            {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeft size={18} />}
          </button>
          
          {/* Model Selector */}
          <div className="relative">
            <button
              onClick={() => setModelDropdown(!modelDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/5 text-sm transition-colors"
            >
              <span className="text-lg">{currentModel?.icon}</span>
              <span className="font-medium">{currentModel?.name || 'Select Model'}</span>
              <ChevronDown size={14} className={`text-white/40 transition-transform ${modelDropdown ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {modelDropdown && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setModelDropdown(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    className="absolute top-full left-0 mt-2 w-80 glass-card p-2 z-50 max-h-[400px] overflow-y-auto"
                  >
                    <div className="px-3 py-2 text-xs font-medium text-white/30 uppercase tracking-wider">
                      Select a model
                    </div>
                    {AI_MODELS.map(model => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model.id as AIModel)
                          setModelDropdown(false)
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                          selectedModel === model.id 
                            ? 'bg-white/10 text-white' 
                            : 'hover:bg-white/5 text-white/70'
                        }`}
                      >
                        <span className="text-xl shrink-0">{model.icon}</span>
                        <div className="min-w-0">
                          <div className="font-medium text-sm">{model.name}</div>
                          <div className="text-xs text-white/40 truncate">{model.provider} · {model.speed}</div>
                        </div>
                        <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 shrink-0">
                          FREE
                        </span>
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setWebSearch(!webSearch)}
              className={`p-2 rounded-xl transition-colors ${webSearch ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-white/5 text-white/40'}`}
              title="Web Search"
            >
              <Globe size={18} />
            </button>
            <Link to="/tools" className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-colors" title="Tools">
              <Code size={18} />
            </Link>
            <Link to="/settings" className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-white transition-colors" title="Settings">
              <Settings size={18} />
            </Link>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-lg"
              >
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mx-auto mb-6">
                  <Brain size={36} className="text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold mb-2">What can I help with?</h2>
                <p className="text-white/40 mb-8">
                  I'm powered by <span className="text-white/70 font-medium">{currentModel?.name}</span>. 
                  Ask me anything — code, research, writing, analysis, and more.
                </p>
                <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                  {[
                    { icon: Code, text: 'Write Python code' },
                    { icon: Search, text: 'Research a topic' },
                    { icon: ImageIcon, text: 'Explain a concept' },
                    { icon: Sparkles, text: 'Creative writing' },
                  ].map(s => (
                    <button
                      key={s.text}
                      onClick={() => { setInput(s.text); inputRef.current?.focus() }}
                      className="glass-card p-4 text-left text-sm text-white/60 hover:text-white transition-colors"
                    >
                      <s.icon size={16} className="mb-2 text-blue-400" />
                      <div>{s.text}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto py-6 px-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 ${msg.role === 'user' ? 'flex justify-end' : ''}`}
                >
                  <div className={`max-w-[85%] ${msg.role === 'user' ? 'bg-blue-500/10 border border-blue-500/20 rounded-2xl rounded-br-md px-5 py-3' : ''}`}>
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2 text-xs text-white/40">
                        <span className="text-sm">{currentModel?.icon}</span>
                        <span>{currentModel?.name}</span>
                      </div>
                    )}
                    <div className={`text-sm leading-relaxed ${msg.role === 'user' ? 'text-white/90' : 'text-white/80'}`}>
                      {msg.role === 'assistant' ? (
                        <ReactMarkdown
                          components={{
                            code({ node, className, children, ...props }) {
                              const match = /language-(\w+)/.exec(className || '')
                              return match ? (
                                <div className="relative my-3 rounded-xl overflow-hidden">
                                  <div className="flex items-center justify-between px-4 py-2 bg-white/5 text-xs text-white/40">
                                    <span>{match[1]}</span>
                                    <button 
                                      onClick={() => { navigator.clipboard.writeText(String(children)); toast.success('Copied!') }}
                                      className="hover:text-white/80"
                                    >
                                      <Copy size={12} />
                                    </button>
                                  </div>
                                  <SyntaxHighlighter
                                    style={oneDark}
                                    language={match[1]}
                                    PreTag="div"
                                    customStyle={{ margin: 0, borderRadius: 0, fontSize: '13px' }}
                                  >
                                    {String(children).replace(/\n$/, '')}
                                  </SyntaxHighlighter>
                                </div>
                              ) : (
                                <code className="px-1.5 py-0.5 rounded bg-white/10 text-pink-300 text-xs" {...props}>
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
                  </div>
                </motion.div>
              ))}
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-sm text-white/40"
                >
                  <Loader2 size={14} className="animate-spin" />
                  <span>{currentModel?.name} is thinking...</span>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-white/5 p-4">
          <div className="max-w-3xl mx-auto">
            <div className="glass rounded-2xl flex items-end gap-2 p-2">
              <button className="p-2 rounded-xl hover:bg-white/5 text-white/30 hover:text-white/60 transition-colors shrink-0">
                <Paperclip size={18} />
              </button>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${currentModel?.name || 'Plurix'}...`}
                className="flex-1 bg-transparent resize-none outline-none text-sm text-white/90 placeholder:text-white/30 py-2 px-1 max-h-32 min-h-[36px]"
                rows={1}
                onInput={(e) => {
                  const t = e.target as HTMLTextAreaElement
                  t.style.height = 'auto'
                  t.style.height = Math.min(t.scrollHeight, 128) + 'px'
                }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="p-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-blue-500/20 transition-all shrink-0"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
            <p className="text-center text-[11px] text-white/20 mt-2">
              Plurix can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
