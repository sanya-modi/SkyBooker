"use client"

import { Link, useLocation, useNavigate } from "react-router-dom"
import { Plane, LayoutDashboard, Calendar, MapPin, Settings, BarChart3, LogOut } from "lucide-react"
import { useAuth } from "@/context/auth-context"

export function AirlineHeader() {
  const location = useLocation()
  const pathname = location.pathname
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { href: '/airline/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/airline/flights', label: 'Flights', icon: Calendar },
    { href: '/airline/seats', label: 'Seats', icon: MapPin },
    { href: '/airline/operations', label: 'Operations', icon: Settings },
    { href: '/airline/analytics', label: 'Analytics', icon: BarChart3 },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/airline/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00236f] to-[#1e3a8a] rounded-xl flex items-center justify-center">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-[#00236f]">SkyBooker</h1>
              <p className="text-xs text-slate-500 font-bold">Airline Portal</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-[#00236f] to-[#1e3a8a] text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-bold text-slate-800">
                {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email}
              </p>
              <p className="text-xs text-slate-500">Airline Staff</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
