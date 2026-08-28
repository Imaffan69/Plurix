import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, Play, RotateCcw, Copy, Download, Maximize2, Minimize2, Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import { useStore } from '@/store'

type Language = 'html' | 'javascript' | 'python' | 'css'

const LANGUAGE_TEMPLATES: Record<Language, string> = {
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Page</title>
  <style>
    body { font-family: Inter, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #0a0a0a; color: #ececec; }
    .card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 2rem; text-align: center; }
    h1 { background: linear-gradient(135deg, #8b5cf6, #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    button { background: #7c3aed; color: white; border: none; padding: 0.5rem 1.5rem; border-radius: 8px; cursor: pointer; font-size: 14px; margin-top: 1rem; }
    button:hover { background: #8b5cf6; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Hello, Plurix!</h1>
    <p style="color: rgba(255,255,255,0.4);">Start editing to see changes.</p>
    <button onclick="alert('It works!')">Click Me</button>
  </div>
</body>
</html>`,
  javascript: `// JavaScript Playground
// Edit and click Run to execute

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Generate first 10 Fibonacci numbers
const results = [];
for (let i = 0; i < 10; i++) {
  results.push(fibonacci(i));
}

console.log("Fibonacci:", results.join(", "));
console.log("Sum:", results.reduce((a, b) => a + b, 0));`,
  python: `# Python Playground
# Note: Browser JS only — Python runs in sandboxed Pyodide (coming soon)

# For now, here's equivalent JavaScript:
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

# Generate first 10 Fibonacci numbers
results = [fibonacci(i) for i in range(10)]
print("Fibonacci:", results)
print("Sum:", sum(results))`,
  css: `/* CSS Playground */
/* Edit styles and click Run to preview */

:root {
  --primary: #7c3aed;
  --bg: #0a0a0a;
  --surface: #121212;
}

body {
  font-family: 'Inter', sans-serif;
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
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  padding: 3rem;
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(124,58,237,0.15);
}

h1 {
  background: linear-gradient(135deg, #8b5cf6, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

p {
  color: rgba(255,255,255,0.4);
  margin-bottom: 1.5rem;
}

.btn {
  background: var(--primary);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:hover {
  background: #8b5cf6;
  transform: scale(1.02);
}`,
}

export default function ToolsPage() {
  const { selectedModel } = useStore()
  const [language, setLanguage] = useState<Language>('html')
  const [code, setCode] = useState(LANGUAGE_TEMPLATES.html)
  const [output, setOutput] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)
  const previewRef = useRef<HTMLIFrameElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const runCode = () => {
    setIsRunning(true)

    if (language === 'html') {
      // HTML — render in iframe
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
      // CSS — combine with HTML template
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
    } else if (language === 'javascript') {
      // JavaScript — execute and capture console.log
      setShowPreview(false)
      const logs: string[] = []
      const fakeConsole = {
        log: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
        error: (...args: any[]) => logs.push('Error: ' + args.join(' ')),
        warn: (...args: any[]) => logs.push('Warning: ' + args.join(' ')),
        info: (...args: any[]) => logs.push('Info: ' + args.join(' ')),
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

  const resetCode = () => {
    setCode(LANGUAGE_TEMPLATES[language])
    setOutput('')
  }

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    toast.success('Code copied!')
  }

  const downloadCode = () => {
    const ext = language === 'html' ? 'html' : language === 'css' ? 'css' : language === 'python' ? 'py' : 'js'
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `plurix-playground.${ext}`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Update code when language changes
  useEffect(() => {
    if (!code.trim() || code === LANGUAGE_TEMPLATES[language as Language]) {
      setCode(LANGUAGE_TEMPLATES[language])
    }
  }, [language])

  const languages: { id: Language; label: string }[] = [
    { id: 'html', label: 'HTML' },
    { id: 'javascript', label: 'JavaScript' },
    { id: 'python', label: 'Python' },
    { id: 'css', label: 'CSS' },
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
        <div className="flex items-center gap-1 ml-4">
          {languages.map(lang => (
            <button key={lang.id} onClick={() => setLanguage(lang.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${language === lang.id ? 'bg-violet-500/15 text-violet-400' : 'text-white/30 hover:text-white/50 hover:bg-white/[0.03]'}`}>
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
            <span className="text-[10px] text-white/20 ml-2">editor.{language === 'python' ? 'py' : language}</span>
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
        Code Playground — Powered by GPT-OSS 120B (recommended) — Ask AI to write code for you
      </div>
    </div>
  )
}
