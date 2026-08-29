import { useRef, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Home } from 'lucide-react'
import { useStore } from '@/store'

export default function NotFoundPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; vx: number; vy: number; size: number; opacity: number }>>([])
  const particleId = useRef(0)
  const theme = useStore(s => s.theme)
  const isDark = theme === 'dark'

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      setMousePos({ x: ((e.clientX - rect.left) / rect.width) * 2 - 1, y: ((e.clientY - rect.top) / rect.height) * 2 - 1 })
      if (Math.random() > 0.6) {
        const id = particleId.current++
        setParticles(prev => [...prev.slice(-25), {
          id, x: e.clientX - rect.left, y: e.clientY - rect.top,
          vx: (Math.random() - 0.5) * 2, vy: (Math.random() - 0.5) * 2 - 1,
          size: Math.random() * 3 + 1, opacity: 1,
        }])
      }
    }
    container.addEventListener('mousemove', handleMouseMove)
    return () => container.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    if (particles.length === 0) return
    const interval = setInterval(() => {
      setParticles(prev => prev.map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, vy: p.vy + 0.05, opacity: p.opacity - 0.025 })).filter(p => p.opacity > 0))
    }, 30)
    return () => clearInterval(interval)
  }, [particles.length > 0])

  const tiltX = mousePos.y * 6
  const tiltY = mousePos.x * -6
  const glowX = mousePos.x * 25
  const glowY = mousePos.y * 25

  return (
    <div ref={containerRef} className="min-h-screen flex items-center justify-center px-5 relative overflow-hidden cursor-crosshair select-none"
      style={{ background: 'var(--bg-primary)' }}>
      {particles.map(p => (
        <div key={p.id} className="absolute rounded-full pointer-events-none"
          style={{ left: p.x, top: p.y, width: p.size, height: p.size, opacity: p.opacity * 0.4, background: 'var(--accent-violet)' }} />
      ))}
      <div className="absolute w-[400px] h-[400px] rounded-full pointer-events-none transition-all duration-700 ease-out" style={{
        background: `radial-gradient(circle, rgba(139,92,246,${isDark ? 0.04 : 0.06}) 0%, transparent 70%)`,
        left: `calc(50% + ${glowX}px)`, top: `calc(50% + ${glowY}px)`, transform: 'translate(-50%, -50%)',
      }} />
      <div className="text-center z-10" style={{ transform: `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`, transition: 'transform 0.15s ease-out' }}>
        <div className="text-[80px] font-black leading-none mb-4 tracking-tighter text-gold-gradient">404</div>
        <h1 className="text-xl font-bold mb-2">Page not found</h1>
        <p className="text-[13px] mb-8" style={{ color: 'var(--text-muted)' }}>This page doesn't exist or was moved.</p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/" className="btn-primary px-5 py-2 text-[13px]"><Home size={13} /> Go Home</Link>
          <Link to="/chat" className="btn-secondary px-5 py-2 text-[13px]"><ArrowLeft size={13} /> Back to Chat</Link>
        </div>
      </div>
    </div>
  )
}
