import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import SignInPage from '../../src/pages/auth/SignInPage'

vi.mock('@react-oauth/google', () => ({
  GoogleLogin: () => <div>Google Login</div>
}))

vi.mock('framer-motion', () => ({
  motion: {
    main: ({ children, ...props }: any) => <main {...props}>{children}</main>
  }
}))

const renderPage = () => render(<BrowserRouter><SignInPage /></BrowserRouter>)

describe('SignInPage', () => {
  it('renders page', () => {
    renderPage()
    expect(screen.getByText('Sign In')).toBeInTheDocument()
  })

  it('renders email input', () => {
    renderPage()
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
  })

  it('renders password input', () => {
    renderPage()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
  })

  it('renders Google login', () => {
    renderPage()
    expect(screen.getByText('Google Login')).toBeInTheDocument()
  })

  it('renders forgot password link', () => {
    renderPage()
    expect(screen.getByText('Forgot?')).toBeInTheDocument()
  })

  it('renders sign up link', () => {
    renderPage()
    expect(screen.getByText('Sign Up')).toBeInTheDocument()
  })

  it('renders branding', () => {
    renderPage()
    expect(screen.getByText('SkyBooker')).toBeInTheDocument()
  })
})
