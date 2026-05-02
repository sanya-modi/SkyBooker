import { motion } from 'framer-motion'
import { LogOut } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/auth-context'
import { Logo } from './logo'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { PassengerProfileModal } from '@/components/layout/PassengerProfileModal'
import { SupportModal } from '@/components/layout/SupportModal'

export function TopNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isLoggedIn, user, profile, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [supportModalOpen, setSupportModalOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const normalizedRole = user?.role?.replace(/^ROLE_/, '').toUpperCase()
  const canAccessAdmin = normalizedRole === 'ADMIN'
  const canAccessAirline = normalizedRole === 'AIRLINE_STAFF'
  const isGuestAuthHiddenRoute = location.pathname === '/' || location.pathname === '/results'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navLinks = [
    { href: '/', label: 'Explore' },
    { href: '/results', label: 'Flights' },
    { href: '/bookings', label: 'My Trips' },
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
            <button
              onClick={() => setSupportModalOpen(true)}
              type="button"
              className="font-medium transition-all relative py-2 text-gray-600 hover:text-sky-600"
            >
              Support
            </button>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <>
                {(canAccessAdmin || canAccessAirline) && (
                  <div className="flex items-center gap-2 border-l border-gray-200 pl-4">
                    {canAccessAdmin ? (
                      <button
                        onClick={() => navigate('/admin')}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <span className="material-icons text-sm">admin_panel_settings</span>
                        Admin
                      </button>
                    ) : null}
                    {canAccessAirline ? (
                      <button
                        onClick={() => navigate('/airline')}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <span className="material-icons text-sm">flight</span>
                        Airline
                      </button>
                    ) : null}
                  </div>
                )}
                <div className="relative">
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-xl transition-colors"
                  >
                    <div className="hidden md:block text-right">
                      <p className="text-sm font-bold text-slate-800">
                        {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email}
                      </p>
                      <p className="text-xs text-slate-500">Passenger</p>
                    </div>
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#00236f] bg-slate-100 flex items-center justify-center">
                      {profile?.profilePhotoUrl ? (
                        <img src={profile.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-sm font-black text-[#00236f]">
                          {user?.firstName?.[0]}{user?.lastName?.[0]}
                        </span>
                      )}
                    </div>
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
                      <button
                        onClick={() => { setIsModalOpen(true); setIsDropdownOpen(false) }}
                        className="w-full text-left px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        Edit Profile
                      </button>
                      <div className="h-px bg-slate-100 my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {!isGuestAuthHiddenRoute ? (
                  <button
                    onClick={() => navigate('/auth/signin')}
                    className="px-4 py-2 text-sm font-semibold text-sky-600 hover:text-sky-700 transition-colors"
                  >
                    Sign In
                  </button>
                ) : null}
                <button
                  onClick={() => navigate('/signup')}
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
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                setSupportModalOpen(true)
              }}
              className="block px-4 py-2 w-full text-left rounded-lg font-medium text-gray-600 hover:bg-sky-50"
            >
              Support
            </button>
            <div className="pt-3 border-t space-y-2">
              {isLoggedIn ? (
                <>
                  {canAccessAdmin ? (
                    <button
                      onClick={() => {
                        navigate('/admin')
                        setMobileMenuOpen(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700"
                    >
                      Admin
                    </button>
                  ) : null}
                  {canAccessAirline ? (
                    <button
                      onClick={() => {
                        navigate('/airline')
                        setMobileMenuOpen(false)
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700"
                    >
                      Airline
                    </button>
                  ) : null}
                  <div className="px-4 py-2">
                    <button
                      onClick={() => { setIsModalOpen(true); setMobileMenuOpen(false) }}
                      className="w-full text-left px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={() => { handleLogout(); setMobileMenuOpen(false) }}
                      className="w-full text-left px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 mt-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {!isGuestAuthHiddenRoute ? (
                    <button
                      onClick={() => {
                        navigate('/auth/signin')
                        setMobileMenuOpen(false)
                      }}
                      className="block w-full px-4 py-2 border border-gray-300 rounded-lg text-center font-medium text-gray-700"
                    >
                      Sign In
                    </button>
                  ) : null}
                  <button
                    onClick={() => {
                      navigate('/signup')
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
      <SupportModal isOpen={supportModalOpen} onClose={() => setSupportModalOpen(false)} />
      <PassengerProfileModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </motion.header>
  )
}
