// @vitest-environment jsdom
import { describe, it, expect, vi, afterAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import ErrorBoundary from '@/components/ErrorBoundary'

// Component that throws on render
function ThrowingComponent(): React.ReactElement {
  throw new Error('Test crash')
}

// Component that renders normally
function GoodComponent() {
  return <div>Child rendered</div>
}

describe('ErrorBoundary', () => {
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

  afterAll(() => spy.mockRestore())

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <GoodComponent />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Child rendered')).toBeInTheDocument()
  })

  it('shows error UI when a child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Test crash')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reload app/i })).toBeInTheDocument()
  })

  it('renders custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowingComponent />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Custom fallback')).toBeInTheDocument()
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument()
  })
})
