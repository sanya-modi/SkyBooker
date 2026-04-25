import { motion } from 'framer-motion'
import { LogOut } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/auth-context'
import { Button } from './button'
import { Logo } from './logo'
import { cn } from '@/lib/utils'
import { useState } from 'react'

export function TopNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isLoggedIn, user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navLinks = [
    { href: '/', label: 'Explore' },
    { href: '/results', label: 'Flights' },
    { href: '/bookings', label: 'My Trips' },
    { href: '/support', label: 'Support' },
  ]

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button
            className="flex items-center gap-2 group"
            onClick={() => navigate('/')}
            type="button"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <Logo />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
              SkyBooker
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => navigate(link.href)}
                type="button"
                className={cn(
                  'font-medium transition-all relative py-2',
                  location.pathname === link.href
                    ? 'text-sky-600'
                    : 'text-gray-600 hover:text-sky-600'
                )}
              >
                {link.label}
                {location.pathname === link.href && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <>
                <button
                  className="text-sm font-medium text-gray-700 hover:text-sky-600 transition-colors"
                  onClick={() => navigate('/passenger')}
                  type="button"
                >
                  {user?.email}
                </button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={logout}
                  className="flex items-center gap-2"
                >
                  <LogOut size={14} /> Logout
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                  <button
                    onClick={() => navigate('/admin')}
                    className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <span className="material-icons text-sm">admin_panel_settings</span>
                    Admin
                  </button>
                  <button
                    onClick={() => navigate('/airline')}
                    className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <span className="material-icons text-sm">flight</span>
                    Airline
                  </button>
                </div>
                <button
                  onClick={() => navigate('/auth/signin')}
                  className="px-4 py-2 text-sm font-semibold text-sky-600 hover:text-sky-700 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/auth/signup')}
                  className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t bg-white"
        >
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => {
                  navigate(link.href)
                  setMobileMenuOpen(false)
                }}
                className={cn(
                  'block w-full text-left px-4 py-2 rounded-lg font-medium',
                  location.pathname === link.href
                    ? 'bg-sky-50 text-sky-600'
                    : 'text-gray-600'
                )}
              >
                {link.label}
              </button>
            ))}
            <div className="pt-3 border-t space-y-2">
              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => {
                      navigate('/passenger')
                      setMobileMenuOpen(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700"
                  >
                    {user?.email}
                  </button>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => {
                      logout()
                      setMobileMenuOpen(false)
                    }}
                  >
                    <LogOut size={14} /> Logout
                  </Button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      navigate('/auth/signin')
                      setMobileMenuOpen(false)
                    }}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-lg text-center font-medium text-gray-700"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      navigate('/auth/signup')
                      setMobileMenuOpen(false)
                    }}
                    className="block w-full px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-lg text-center font-semibold"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}
