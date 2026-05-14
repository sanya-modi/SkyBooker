"use client"

import { Link } from "react-router-dom"
import { ArrowLeft, Bell, Globe, CreditCard, Lock, LogOut, Plane } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"
import { SupportModal } from "@/components/layout/SupportModal"
import { PassengerProfileModal } from "@/components/layout/PassengerProfileModal"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

interface CustomerHeaderProps {
  title?: string
  showBack?: boolean
  showSecure?: boolean
  variant?: 'default' | 'transparent' | 'minimal'
  onBack?: () => void
}

export function CustomerHeader({ 
  title = "SkyBooker", 
  showBack = false,
  showSecure = false,
  variant = 'default',
  onBack
}: CustomerHeaderProps) {
  const { isLoggedIn, user, profile, logout } = useAuth()
  const navigate = useNavigate()
  const normalizedRole = user?.role?.replace(/^ROLE_/, '').toUpperCase()
  const canSearchTicketByPnr = !isLoggedIn || normalizedRole === 'PASSENGER'
  const [supportModalOpen, setSupportModalOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleLogout = () => {
    console.log('[CustomerHeader] Signing out, redirecting to /')
    logout()
    navigate('/', { replace: true })
  }

  return (
    <header className={cn(
      "fixed top-0 w-full z-50 transition-all duration-300",
      variant === 'default' && "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm",
      variant === 'transparent' && "bg-transparent",
      variant === 'minimal' && "bg-white/90 backdrop-blur-md shadow-sm"
    )}>
      <nav className="flex justify-between items-center h-16 px-6 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-4">
          {showBack && (
            <button 
              onClick={onBack}
              className="p-2 -ml-2 transition-all duration-300 ease-in-out active:scale-95 text-[#00236f] hover:bg-blue-50 rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00236f] to-[#1e3a8a] rounded-xl flex items-center justify-center">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#00236f]">SkyBooker</h1>
            </div>
          </Link>
          {showSecure && (
            <>
              <div className="hidden md:flex h-4 w-px bg-slate-200" />
              <div className="hidden md:flex gap-2 items-center text-slate-500 font-medium text-sm">
                <Lock className="w-4 h-4" />
                <span>Secure Checkout</span>
              </div>
            </>
          )}
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/flights" className="text-slate-600 font-medium hover:text-[#00236f] transition-colors">
            Explore
          </Link>
          <Link to="/bookings" className="text-[#00236f] border-b-2 border-[#00236f]/40 pb-1 font-medium">
            Bookings
          </Link>
          {canSearchTicketByPnr ? (
            <Link to="/tickets" className="text-slate-600 font-medium hover:text-[#00236f] transition-colors">
              Find Ticket / PNR
            </Link>
          ) : null}
          <button 
            onClick={() => setSupportModalOpen(true)} 
            className="text-slate-600 font-medium hover:text-[#00236f] transition-colors"
          >
            Support
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-2 mr-4">
            <button className="p-2 hover:bg-blue-50 transition-all rounded-full">
              <Globe className="w-5 h-5 text-slate-500" />
            </button>
            <button className="p-2 hover:bg-blue-50 transition-all rounded-full">
              <CreditCard className="w-5 h-5 text-slate-500" />
            </button>
          </div>
          <button className="p-2 rounded-full hover:bg-slate-50 transition-colors relative">
            <Bell className="w-5 h-5 text-[#00236f]" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full" />
          </button>
          {isLoggedIn ? (
            <div className="flex items-center gap-4 relative">
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
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2">
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
          ) : (
            <Link 
              to="/auth/signin" 
              className="w-10 h-10 rounded-full bg-[#f2f4f6] flex items-center justify-center overflow-hidden border-2 border-[#1e3a8a]/10"
            >
              <Lock className="w-5 h-5 text-[#4f5c8e]" />
            </Link>
          )}
        </div>
      </nav>
      
      <SupportModal isOpen={supportModalOpen} onClose={() => setSupportModalOpen(false)} />
      <PassengerProfileModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </header>
  )
}
