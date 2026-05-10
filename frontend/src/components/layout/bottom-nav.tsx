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
  return null
}
