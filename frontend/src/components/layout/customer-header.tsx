"use client"

import { Link } from "react-router-dom"
import { ArrowLeft, Bell, Globe, CreditCard, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { ProfileMenu } from "@/components/layout/profile-menu"
import { useAuth } from "@/context/auth-context"

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
  const { isLoggedIn } = useAuth()

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
          <Link to="/" className="text-xl md:text-2xl font-bold tracking-tighter text-[#00236f]">
            {title}
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
          <Link to="/support" className="text-slate-600 font-medium hover:text-[#00236f] transition-colors">
            Support
          </Link>
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
            <ProfileMenu />
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
    </header>
  )
}
