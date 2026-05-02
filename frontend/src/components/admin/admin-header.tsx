"use client"

import { Link, useLocation, useNavigate } from "react-router-dom"
import { Shield, LayoutDashboard, Users, Plane, MapPin, ShoppingBag, CreditCard, BarChart3, Bell, LogOut } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { useState } from "react"
import { AdminProfileModal } from "./AdminProfileModal"

export function AdminHeader() {
  const location = useLocation()
  const pathname = location.pathname
  const navigate = useNavigate()
  const { user, profile, logout } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/airlines', label: 'Airlines', icon: Plane },
    { href: '/admin/airports', label: 'Airports', icon: MapPin },
    { href: '/admin/bookings', label: 'Bookings', icon: ShoppingBag },
    // { href: '/admin/payments', label: 'Payments', icon: CreditCard },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/notifications', label: 'Notifications', icon: Bell },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="w-full px-0">
        <div className="flex items-center justify-between h-16">
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-sky-600">SkyBooker</h1>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg font-bold text-xs transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-4 relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-xl transition-colors"
            >
              <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-slate-800">
                  {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.email}
                </p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-sky-500 bg-slate-100 flex items-center justify-center">
                {profile?.profilePhotoUrl ? (
                  <img src={profile.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-black text-sky-600">
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
        </div>
      </div>
      <AdminProfileModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </header>
  )
}
