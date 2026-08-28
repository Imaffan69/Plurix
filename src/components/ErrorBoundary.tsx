import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[Plurix ErrorBoundary]', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="min-h-screen bg-black flex items-center justify-center px-5">
          <div className="text-center max-w-sm">
            <div className="w-14 h-14 rounded-2xl bg-red-500/[0.08] flex items-center justify-center mx-auto mb-5">
              <AlertTriangle size={26} className="text-red-400/70" />
            </div>
            <h1 className="text-xl font-bold mb-1.5">Something went wrong</h1>
            <p className="text-white/30 text-[13px] mb-1">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <p className="text-white/15 text-[11px] mb-7">
              If this keeps happening, try clearing your browser cache.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-white to-zinc-200 text-[#09090b] font-semibold text-[13px] hover:shadow-lg hover:shadow-white/10 transition-all"
            >
              <RefreshCw size={14} />
              Reload App
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
