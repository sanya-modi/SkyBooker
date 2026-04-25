"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Bell, X, Check, Settings } from "lucide-react"
import { useAuth } from "@/context/auth-context"

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

interface Notification {
  id: number
  type: string
  subject: string
  message: string
  isRead: boolean
  createdAt: string
  bookingId: number | null
}

export function NotificationBell() {
  const { user, isLoggedIn } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isLoggedIn || !user) return

    loadNotifications()
    
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [isLoggedIn, user])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadNotifications = async () => {
    if (!user) return

    try {
      setLoading(true)
      const token = localStorage.getItem('skybooker_token')
      const response = await fetch(`${API_BASE_URL}/notifications/user/${user.userId}/unread`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })

      if (!response.ok) throw new Error('Failed to load notifications')

      const data = await response.json()
      setNotifications(data.slice(0, 5))
      setUnreadCount(data.length)
    } catch (err) {
      console.error('Error loading notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: number) => {
    try {
      const token = localStorage.getItem('skybooker_token')
      await fetch(`${API_BASE_URL}/notifications/${notificationId}/mark-read`, {
        method: 'PUT',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })

      setNotifications(prev => prev.filter(n => n.id !== notificationId))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  if (!isLoggedIn) return null

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-slate-100 rounded-lg transition-all"
      >
        <Bell className="w-6 h-6 text-slate-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800">Notifications</h3>
              <p className="text-xs text-slate-500">{unreadCount} unread</p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/settings/notifications"
                className="p-2 hover:bg-slate-100 rounded-lg transition-all"
                title="Settings"
              >
                <Settings className="w-4 h-4 text-slate-600" />
              </Link>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-4 border-[#00236f] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-slate-500">Loading...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-600 font-medium">No new notifications</p>
                <p className="text-xs text-slate-500 mt-1">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className="p-4 hover:bg-slate-50 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="text-sm font-bold text-slate-800 line-clamp-1">
                            {notification.subject}
                          </h4>
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-green-100 rounded transition-all flex-shrink-0"
                            title="Mark as read"
                          >
                            <Check className="w-3.5 h-3.5 text-green-600" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400">
                            {formatTime(notification.createdAt)}
                          </span>
                          {notification.bookingId && (
                            <Link
                              href={`/bookings/${notification.bookingId}`}
                              className="text-xs font-bold text-[#00236f] hover:underline"
                              onClick={() => setIsOpen(false)}
                            >
                              View →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-200 bg-slate-50">
              <Link
                href="/notifications"
                className="block text-center text-sm font-bold text-[#00236f] hover:underline"
                onClick={() => setIsOpen(false)}
              >
                View All Notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
