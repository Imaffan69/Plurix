import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Home } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-5">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="text-7xl font-black text-gold-gradient mb-3 tracking-tight">404</div>
        <h1 className="text-xl font-bold mb-1.5 tracking-tight">Page not found</h1>
        <p className="text-white/30 text-[13px] mb-7">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/" className="btn-primary">
            <Home size={14} /> Go Home
          </Link>
          <button onClick={() => window.history.back()} className="btn-secondary">
            <ArrowLeft size={14} /> Go Back
          </button>
        </div>
      </motion.div>
    </div>
  )
}
