import { motion } from 'framer-motion'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/auth-context'
import { Logo } from '../booking/logo'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { ProfileMenu } from '@/components/layout/profile-menu'

export function AdminTopNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const adminNavLinks = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/bookings', label: 'Bookings' },
    { href: '/admin/payments', label: 'Payments' },
    { href: '/admin/analytics', label: 'Analytics' },
    { href: '/admin/notifications', label: 'Notifications' },
    { href: '/admin/airports', label: 'Airports' },
    { href: '/admin/airlines', label: 'Airlines' },
    { href: '/admin/users', label: 'Users' },
  ]

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100"
    >
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Logo />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
              SkyBooker
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            {adminNavLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => navigate(link.href)}
                type="button"
                className={cn(
                  'font-medium transition-all relative py-2 text-sm',
                  location.pathname === link.href
                    ? 'text-sky-600'
                    : 'text-gray-600 hover:text-sky-600'
                )}
              >
                {link.label}
                {location.pathname === link.href && (
                  <motion.div
                    layoutId="admin-navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-600"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <ProfileMenu />
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
            {adminNavLinks.map((link) => (
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
            <div className="pt-3 border-t">
              <div className="px-4 py-2">
                <ProfileMenu />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}
