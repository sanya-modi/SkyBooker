"use client"

import { Link, useLocation } from "react-router-dom"
import { Home, Ticket, Bell, User, Rocket, BarChart3, Users, Database, MoreHorizontal, Plane } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  activeIcon?: React.ReactNode
}

interface BottomNavProps {
  variant?: 'customer' | 'admin' | 'staff'
}

const customerNavItems: NavItem[] = [
  { href: "/", label: "Home", icon: <Rocket className="w-5 h-5" /> },
  { href: "/bookings", label: "Bookings", icon: <Ticket className="w-5 h-5" /> },
  { href: "/alerts", label: "Alerts", icon: <Bell className="w-5 h-5" /> },
  { href: "/profile", label: "Profile", icon: <User className="w-5 h-5" /> },
]

const adminNavItems: NavItem[] = [
  { href: "/admin", label: "Analytics", icon: <BarChart3 className="w-5 h-5" /> },
  { href: "/admin/users", label: "Users", icon: <Users className="w-5 h-5" /> },
  { href: "/admin/data", label: "Data", icon: <Database className="w-5 h-5" /> },
  { href: "/admin/bookings", label: "Bookings", icon: <Ticket className="w-5 h-5" /> },
  { href: "/admin/more", label: "More", icon: <MoreHorizontal className="w-5 h-5" /> },
]

const staffNavItems: NavItem[] = [
  { href: "/staff", label: "Dashboard", icon: <Home className="w-5 h-5" /> },
  { href: "/staff/flights", label: "Flights", icon: <Plane className="w-5 h-5" /> },
  { href: "/staff/seats", label: "Seats", icon: <BarChart3 className="w-5 h-5" /> },
  { href: "/staff/manifests", label: "Manifests", icon: <Users className="w-5 h-5" /> },
]

export function BottomNav({ variant = 'customer' }: BottomNavProps) {
  const location = useLocation()
  const pathname = location.pathname
  
  if (variant === 'customer') {
    return null
  }

  const navItems = variant === 'admin' 
    ? adminNavItems 
    : variant === 'staff' 
    ? staffNavItems 
    : customerNavItems

  const isActive = (href: string) => {
    if (href === '/' || href === '/admin' || href === '/staff') {
      return pathname === href
    }
    return pathname.startsWith(href)
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl shadow-[0_-10px_40px_rgba(30,58,138,0.06)] rounded-t-[3rem]">
      {navItems.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className={cn(
            "flex flex-col items-center justify-center px-4 py-2 rounded-full tap-highlight-none transition-all duration-200 ease-out active:scale-95",
            isActive(item.href)
              ? "bg-blue-100 dark:bg-blue-900/40 text-[#00236f] dark:text-blue-100"
              : "text-slate-400 dark:text-slate-500 hover:text-[#00236f]"
          )}
        >
          {item.icon}
          <span className="text-[10px] font-bold uppercase tracking-[0.05em] mt-1">
            {item.label}
          </span>
        </Link>
      ))}
    </nav>
  )
}
