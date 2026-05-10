import { render, screen } from '@testing-library/react'
import App from '../../src/App'

vi.mock('../../src/context/auth-context', () => ({
  AuthProvider: ({ children }: any) => <div data-testid="auth-provider">{children}</div>,
  useAuth: () => ({ user: null, isLoggedIn: false, isAuthReady: true })
}))

vi.mock('../../src/context/booking-flow-context', () => ({
  BookingFlowProvider: ({ children }: any) => <div data-testid="booking-provider">{children}</div>
}))

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument()
  })

  it('renders providers', () => {
    render(<App />)
    expect(screen.getByTestId('auth-provider')).toBeInTheDocument()
    expect(screen.getByTestId('booking-provider')).toBeInTheDocument()
  })
})
