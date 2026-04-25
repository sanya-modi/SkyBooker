// "use client"

import { Link, useLocation } from "react-router-dom"
import { 
  BarChart3, 
  Users, 
  Plane, 
  Ticket, 
  CreditCard, 
  Settings, 
  LogOut,
  HeadphonesIcon
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/admin", label: "Analytics", icon: BarChart3 },
  { href: "/admin/users", label: "User Management", icon: Users },
  { href: "/admin/data", label: "Master Data", icon: Plane },
  { href: "/admin/bookings", label: "Bookings", icon: Ticket },
  { href: "/admin/financials", label: "Financials", icon: CreditCard },
  { href: "/admin/settings", label: "System Tools", icon: Settings },
]

export function AdminSidebar() {
  const location = useLocation()
  const pathname = location.pathname

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  return (
    <aside className="hidden lg:flex h-screen w-64 fixed left-0 top-0 bg-slate-50 dark:bg-slate-950 flex-col gap-2 p-4 z-50 shadow-2xl shadow-blue-900/5">
      <div className="flex items-center gap-3 px-4 py-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00236f] to-[#1e3a8a] flex items-center justify-center text-white shadow-lg">
          <Plane className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-black bg-gradient-to-br from-[#00236f] to-[#1e3a8a] bg-clip-text text-transparent">
            SkyBooker
          </h1>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Platform Admin
          </p>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-1 mt-4">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 font-semibold text-sm uppercase tracking-widest transition-all duration-300",
                isActive(item.href)
                  ? "text-[#00236f] bg-white rounded-xl shadow-sm"
                  : "text-slate-500 hover:translate-x-1 hover:text-[#00236f] hover:bg-blue-50/50"
              )}
            >
              <Icon className={cn(
                "w-5 h-5",
                isActive(item.href) ? "text-blue-700" : ""
              )} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto border-t border-slate-100 pt-4 flex flex-col gap-2">
        <button className="bg-[#1e3a8a] text-white rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95 transition-transform">
          <HeadphonesIcon className="w-4 h-4" />
          <span>Support Portal</span>
        </button>
        <Link
          to="/"
          className="flex items-center gap-3 text-slate-500 px-4 py-3 text-sm font-semibold uppercase tracking-widest hover:text-red-500 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </Link>
      </div>
    </aside>
  )
}
