import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from './components/ErrorBoundary'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: 'rgba(18, 18, 22, 0.95)',
              backdropFilter: 'blur(40px)',
              border: '0.5px solid rgba(255,255,255,0.08)',
              color: '#f5f5f5',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: '500',
              padding: '10px 16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            },
            success: {
              iconTheme: { primary: '#d9a02a', secondary: '#000' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#000' },
            },
          }}
        />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)
