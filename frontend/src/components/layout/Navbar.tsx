import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { Icon } from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { SupportModal } from '@/components/layout/SupportModal'

export function Navbar() {
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [supportModalOpen, setSupportModalOpen] = useState(false)

    { href: '/', label: 'Explore' },
    { href: '/flights', label: 'Flights' },
    { href: '/bookings', label: 'My Trips' },
  ]

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <Icon name="flight_takeoff" className="text-white text-xl" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
              SkyBooker
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
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
              </Link>
            ))}
            <button
              onClick={() => setSupportModalOpen(true)}
              className="font-medium transition-all relative py-2 text-gray-600 hover:text-sky-600"
            >
              Support
            </button>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="icon" className="text-gray-600">
              <Icon name="language" />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-600 relative">
              <Icon name="notifications" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </Button>
            
            {/* Portal Links */}
            <div className="flex items-center gap-2 border-l pl-4">
              <Link to="/admin">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600">
                  <Icon name="admin_panel_settings" className="mr-1" />
                  Admin
                </Button>
              </Link>
              <Link to="/airline">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-indigo-600">
                  <Icon name="flight" className="mr-1" />
                  Airline
                </Button>
              </Link>
            </div>
            
            <Link to="/auth/signin">
              <Button variant="ghost" className="text-sky-600 font-semibold">
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl">
                Sign Up
              </Button>
            </Link>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Icon name={mobileMenuOpen ? 'close' : 'menu'} />
          </Button>
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
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'block px-4 py-2 rounded-lg font-medium',
                  location.pathname === link.href
                    ? 'bg-sky-50 text-sky-600'
                    : 'text-gray-600'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <button
              className="block px-4 py-2 w-full text-left rounded-lg font-medium text-gray-600 hover:bg-sky-50"
              onClick={() => {
                setMobileMenuOpen(false)
                setSupportModalOpen(true)
              }}
            >
              Support
            </button>
            <div className="pt-3 border-t space-y-2">
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <Icon name="admin_panel_settings" className="mr-2" />
                  Admin Portal
                </Button>
              </Link>
              <Link to="/airline" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  <Icon name="flight" className="mr-2" />
                  Airline Portal
                </Button>
              </Link>
            </div>
            <div className="pt-3 border-t space-y-2">
              <Link to="/auth/signin" className="block">
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup" className="block">
                <Button className="w-full bg-gradient-to-r from-sky-500 to-blue-600">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      <SupportModal isOpen={supportModalOpen} onClose={() => setSupportModalOpen(false)} />
    </motion.nav>
  )
}
