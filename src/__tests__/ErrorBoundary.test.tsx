import { describe, it, expect, vi, afterAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import ErrorBoundary from '@/components/ErrorBoundary'

function ThrowingComponent(): React.JSX.Element {
  throw new Error('Test crash')
}

describe('ErrorBoundary', () => {
  // Suppress console.error from componentDidCatch
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

  afterAll(() => {
    consoleSpy.mockRestore()
  })

  it('renders children when no error', () => {
    render(
      <ErrorBoundary>
        <div>All good</div>
      </ErrorBoundary>
    )
    expect(screen.getByText('All good')).toBeDefined()
  })

  it('catches errors and renders default error UI', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    )
    expect(screen.getByText('Something went wrong')).toBeDefined()
    expect(screen.getByText('Test crash')).toBeDefined()
  })

  it('renders custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowingComponent />
      </ErrorBoundary>
    )
    expect(screen.getByText('Custom fallback')).toBeDefined()
  })

  it('does not render children after error', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    )
    expect(screen.queryByText('Test crash')).toBeDefined()
    expect(screen.queryByText('All good')).toBeNull()
  })
})
