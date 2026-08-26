import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Home } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="text-8xl font-black gradient-text mb-4">404</div>
        <h1 className="text-2xl font-bold mb-2">Page not found</h1>
        <p className="text-white/40 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/" className="btn-primary">
            <Home size={16} /> Go Home
          </Link>
          <button onClick={() => window.history.back()} className="btn-ghost">
            <ArrowLeft size={16} /> Go Back
          </button>
        </div>
      </motion.div>
    </div>
  )
}
