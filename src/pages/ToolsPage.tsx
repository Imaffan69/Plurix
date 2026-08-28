import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, Play, RotateCcw, Copy, Download, Maximize2, Minimize2, Wand2, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useStore } from '@/store'

type Language = 'html' | 'javascript' | 'python' | 'css' | 'typescript' | 'jsx'

const LANGUAGE_TEMPLATES: Record<Language, string> = {
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Page</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', system-ui, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #0a0a0a; color: #ececec; }
    .card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 2.5rem; text-align: center; max-width: 400px; }
    h1 { background: linear-gradient(135deg, #8b5cf6, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 2rem; margin-bottom: 0.5rem; }
    p { color: rgba(255,255,255,0.4); margin-bottom: 1.5rem; }
    button { background: #7c3aed; color: white; border: none; padding: 0.6rem 1.8rem; border-radius: 10px; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.2s; }
    button:hover { background: #8b5cf6; transform: scale(1.03); }
  </style>
</head>
<body>
  <div class="card">
    <h1>Hello, Plurix!</h1>
    <p>Start editing to see your changes live.</p>
    <button onclick="alert('It works!')">Click Me</button>
  </div>
</body>
</html>`,

  javascript: `// JavaScript Playground — Run to execute
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const results = [];
for (let i = 0; i < 15; i++) {
  results.push(fibonacci(i));
}

console.log("Fibonacci:", results.join(", "));
console.log("Sum:", results.reduce((a, b) => a + b, 0));
console.log("Even numbers:", results.filter(n => n % 2 === 0).join(", "));

// Object manipulation
const users = [
  { name: "Alice", age: 30, role: "admin" },
  { name: "Bob", age: 25, role: "user" },
  { name: "Charlie", age: 35, role: "user" },
];

const admins = users.filter(u => u.role === "admin");
console.log("Admins:", admins.map(u => u.name).join(", "));

// Array methods
const doubled = results.slice(0, 5).map(n => n * 2);
console.log("Doubled first 5:", doubled);`,

  python: `# Python Playground
# Runs as pseudocode — use for reference/learning

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

# Generate first 15 Fibonacci numbers
results = [fibonacci(i) for i in range(15)]
print("Fibonacci:", results)
print("Sum:", sum(results))
print("Even:", [n for n in results if n % 2 == 0])

# Dictionary operations
users = [
    {"name": "Alice", "age": 30, "role": "admin"},
    {"name": "Bob", "age": 25, "role": "user"},
    {"name": "Charlie", "age": 35, "role": "user"},
]

admins = [u["name"] for u in users if u["role"] == "admin"]
print("Admins:", admins)`,

  css: `/* CSS Playground — Preview styles live */
:root {
  --primary: #7c3aed;
  --bg: #0a0a0a;
  --surface: #121212;
  --border: rgba(255,255,255,0.06);
}

body {
  font-family: 'Inter', system-ui, sans-serif;
  background: var(--bg);
  color: #ececec;
  margin: 0;
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 3rem;
  text-align: center;
  transition: transform 0.3s, box-shadow 0.3s;
  max-width: 420px;
}

.card:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: 0 16px 48px rgba(124,58,237,0.2);
}

h1 {
  background: linear-gradient(135deg, #8b5cf6, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

p { color: rgba(255,255,255,0.4); margin-bottom: 1.5rem; }

.btn {
  background: var(--primary);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:hover {
  background: #8b5cf6;
  transform: scale(1.04);
  box-shadow: 0 4px 20px rgba(124,58,237,0.3);
}`,

  typescript: `// TypeScript Playground — Type-safe JavaScript
interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  joinedAt: Date;
}

const users: User[] = [
  { id: 1, name: 'Alice', email: 'alice@test.com', role: 'admin', joinedAt: new Date('2024-01-15') },
  { id: 2, name: 'Bob', email: 'bob@test.com', role: 'user', joinedAt: new Date('2024-03-20') },
  { id: 3, name: 'Charlie', email: 'charlie@test.com', role: 'moderator', joinedAt: new Date('2024-06-01') },
];

function getRoleCounts(users: User[]): Record<string, number> {
  return users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

function filterByRole(users: User[], role: User['role']): User[] {
  return users.filter(u => u.role === role);
}

console.log('Total users:', users.length);
console.log('Role counts:', JSON.stringify(getRoleCounts(users)));
console.log('Admins:', filterByRole(users, 'admin').map(u => u.name));
console.log('Moderators:', filterByRole(users, 'moderator').map(u => u.name));`,

  jsx: `// React JSX Playground — Component examples
// (Won't render here, but shows correct JSX syntax)

function Card({ title, description, color = '#7c3aed' }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 16,
      padding: '2rem',
      textAlign: 'center'
    }}>
      <h2 style={{ color, marginBottom: '0.5rem' }}>{title}</h2>
      <p style={{ color: 'rgba(255,255,255,0.4)' }}>{description}</p>
      <button style={{
        background: color,
        color: 'white',
        border: 'none',
        padding: '0.5rem 1.5rem',
        borderRadius: 8,
        cursor: 'pointer',
        marginTop: '1rem'
      }}>
        Click Me
      </button>
    </div>
  );
}

function App() {
  const cards = [
    { title: 'HTML', description: 'Build web pages', color: '#e44d26' },
    { title: 'CSS', description: 'Style your UI', color: '#264de4' },
    { title: 'JavaScript', description: 'Add interactivity', color: '#f7df1e' },
    { title: 'React', description: 'Component-driven UI', color: '#61dafb' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: 32 }}>
      {cards.map(c => <Card key={c.title} {...c} />)}
    </div>
  );
}

console.log('React component code — write JSX here for reference!');`,
}

export default function ToolsPage() {
  const { selectedModel } = useStore()
  const [language, setLanguage] = useState<Language>('html')
  const [code, setCode] = useState(LANGUAGE_TEMPLATES.html)
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const previewRef = useRef<HTMLIFrameElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const runCode = () => {
    setIsRunning(true)

    if (language === 'html') {
      setShowPreview(true)
      setTimeout(() => {
        const iframe = previewRef.current
        if (iframe) {
          const doc = iframe.contentDocument || iframe.contentWindow?.document
          if (doc) {
            doc.open()
            doc.write(code)
            doc.close()
          }
        }
        setIsRunning(false)
      }, 100)
    } else if (language === 'css') {
      setShowPreview(true)
      setTimeout(() => {
        const iframe = previewRef.current
        if (iframe) {
          const doc = iframe.contentDocument || iframe.contentWindow?.document
          if (doc) {
            doc.open()
            doc.write(`<!DOCTYPE html>
<html><head><style>${code}</style></head>
<body>
  <div class="card">
    <h1>Hello, Plurix!</h1>
    <p>See your CSS styles in action.</p>
    <button class="btn">Click Me</button>
  </div>
</body></html>`)
            doc.close()
          }
        }
        setIsRunning(false)
      }, 100)
    } else if (language === 'javascript' || language === 'typescript') {
      setShowPreview(false)
      const logs: string[] = []
      const fakeConsole = {
        log: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
        error: (...args: any[]) => logs.push('❌ Error: ' + args.join(' ')),
        warn: (...args: any[]) => logs.push('⚠️ Warning: ' + args.join(' ')),
        info: (...args: any[]) => logs.push('ℹ️ Info: ' + args.join(' ')),
      }
      try {
        const fn = new Function('console', code)
        fn(fakeConsole)
        setOutput(logs.join('\n') || '(no output)')
      } catch (err: any) {
        setOutput(`Error: ${err.message}\n\n${logs.join('\n')}`)
      }
      setIsRunning(false)
    } else {
      setOutput(`Language "${language}" runs in browser sandbox.\nEdit the code and click Run.`)
      setIsRunning(false)
    }
  }

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) return
    setAiLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: `You are a code generator. Output ONLY the code, no explanations. Generate ${language.toUpperCase()} code.` },
            { role: 'user', content: aiPrompt },
          ],
          model: 'gpt-oss-120b',
          temperature: 0.3,
        }),
      })
      const data = await res.json()
      if (data.text) {
        // Extract code from markdown code blocks if present
        const codeMatch = data.text.match(/```(?:\w+)?\n([\s\S]*?)```/)
        setCode(codeMatch ? codeMatch[1].trim() : data.text.trim())
        setAiPrompt('')
        toast.success('Code generated!')
      }
    } catch {
      toast.error('AI generation failed')
    } finally {
      setAiLoading(false)
    }
  }

  const resetCode = () => {
    setCode(LANGUAGE_TEMPLATES[language])
    setOutput('')
  }

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    toast.success('Code copied!')
  }

  const downloadCode = () => {
    const extensions: Record<Language, string> = { html: 'html', css: 'css', javascript: 'js', python: 'py', typescript: 'ts', jsx: 'jsx' }
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `plurix-playground.${extensions[language]}`
    a.click()
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    if (!code.trim() || code === LANGUAGE_TEMPLATES[language as Language]) {
      setCode(LANGUAGE_TEMPLATES[language])
    }
  }, [language])

  const languages: { id: Language; label: string }[] = [
    { id: 'html', label: 'HTML' },
    { id: 'css', label: 'CSS' },
    { id: 'javascript', label: 'JavaScript' },
    { id: 'typescript', label: 'TypeScript' },
    { id: 'python', label: 'Python' },
    { id: 'jsx', label: 'React JSX' },
  ]

  return (
    <div className={`flex flex-col bg-[#0A0A0A] ${fullscreen ? 'fixed inset-0 z-50' : 'min-h-screen'}`}>
      {/* Header */}
      <div className="h-[48px] border-b border-white/[0.05] flex items-center px-3 gap-2 shrink-0 bg-[#0A0A0A]/80 backdrop-blur-md">
        <Link to="/chat" className="p-1.5 rounded-lg hover:bg-white/[0.05] text-white/30 hover:text-white/60 transition-colors">
          <ChevronLeft size={15} />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-violet-500/15 flex items-center justify-center">
            <span className="text-[11px] font-bold text-violet-400">&lt;/&gt;</span>
          </div>
          <span className="text-[13px] font-semibold">Code Playground</span>
          <span className="text-[10px] text-white/20">by PlurixSense</span>
        </div>

        {/* Language tabs */}
        <div className="flex items-center gap-1 ml-4 overflow-x-auto">
          {languages.map(lang => (
            <button key={lang.id} onClick={() => setLanguage(lang.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${language === lang.id ? 'bg-violet-500/15 text-violet-400' : 'text-white/30 hover:text-white/50 hover:bg-white/[0.03]'}`}>
              {lang.label}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1">
          <button onClick={resetCode} className="p-1.5 rounded-lg hover:bg-white/[0.05] text-white/25 hover:text-white/50 transition-colors" title="Reset">
            <RotateCcw size={13} />
          </button>
          <button onClick={copyCode} className="p-1.5 rounded-lg hover:bg-white/[0.05] text-white/25 hover:text-white/50 transition-colors" title="Copy">
            <Copy size={13} />
          </button>
          <button onClick={downloadCode} className="p-1.5 rounded-lg hover:bg-white/[0.05] text-white/25 hover:text-white/50 transition-colors" title="Download">
            <Download size={13} />
          </button>
          <button onClick={() => setFullscreen(!fullscreen)} className="p-1.5 rounded-lg hover:bg-white/[0.05] text-white/25 hover:text-white/50 transition-colors">
            {fullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
          <button onClick={runCode} disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-[12px] font-medium hover:bg-violet-500 transition-colors disabled:opacity-50">
            {isRunning ? <RotateCcw size={12} className="animate-spin" /> : <Play size={12} />}
            Run
          </button>
        </div>
      </div>

      {/* AI Prompt bar */}
      <div className="border-b border-white/[0.05] px-3 py-2 flex items-center gap-2">
        <Wand2 size={13} className="text-violet-400/50 shrink-0" />
        <input
          value={aiPrompt}
          onChange={e => setAiPrompt(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && generateWithAI()}
          placeholder="Describe what to build, e.g. 'a dark-themed login form with glassmorphism'..."
          className="flex-1 bg-white/[0.03] rounded-lg px-3 py-1.5 text-[12px] text-white/60 placeholder:text-white/20 outline-none border border-white/[0.04] focus:border-violet-500/20"
        />
        <button onClick={generateWithAI} disabled={aiLoading || !aiPrompt.trim()}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-violet-500/15 text-violet-400 text-[11px] font-medium hover:bg-violet-500/25 transition-colors disabled:opacity-30">
          {aiLoading ? <Loader2 size={11} className="animate-spin" /> : <Wand2 size={11} />}
          Generate
        </button>
      </div>

      {/* Editor + Preview split */}
      <div className="flex-1 flex min-h-0">
        {/* Code editor */}
        <div className={`${showPreview || language === 'html' || language === 'css' ? 'w-1/2' : 'w-full'} border-r border-white/[0.05] flex flex-col`}>
          <div className="px-3 py-1.5 border-b border-white/[0.04] flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
            </div>
            <span className="text-[10px] text-white/20 ml-2">editor.{language === 'python' ? 'py' : language === 'typescript' ? 'ts' : language === 'jsx' ? 'jsx' : language}</span>
          </div>
          <textarea ref={textareaRef} value={code} onChange={(e) => setCode(e.target.value)}
            className="flex-1 bg-transparent p-4 text-[13px] font-mono text-emerald-400/70 outline-none resize-none leading-relaxed"
            spellCheck={false} />
        </div>

        {/* Output / Preview */}
        <div className={`${showPreview || language === 'html' || language === 'css' ? 'w-1/2' : 'w-full'} flex flex-col`}>
          <div className="px-3 py-1.5 border-b border-white/[0.04] flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
            </div>
            <span className="text-[10px] text-white/20 ml-2">
              {showPreview && (language === 'html' || language === 'css') ? 'preview' : 'output'}
            </span>
          </div>
          {showPreview && (language === 'html' || language === 'css') ? (
            <iframe ref={previewRef} className="flex-1 bg-white" sandbox="allow-scripts" title="Preview" />
          ) : (
            <div className="flex-1 p-4 bg-black/30 overflow-auto">
              <pre className="text-[12px] font-mono text-white/50 whitespace-pre-wrap leading-relaxed">
                {output || 'Click Run to see output...'}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Footer tip */}
      <div className="h-[32px] border-t border-white/[0.05] flex items-center justify-center px-3 text-[10px] text-white/15">
        Code Playground — 6 languages — Use AI to generate code or write it yourself
      </div>
    </div>
  )
}
