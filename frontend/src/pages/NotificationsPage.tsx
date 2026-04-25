// export { default } from '../app/notifications/page'
import { useState, useEffect } from "react"
import { Link, useNavigate } from 'react-router-dom'
import { CustomerHeader } from "@/components/layout/customer-header"
import { BottomNav } from "@/components/layout/bottom-nav"
import {
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plane,
  Mail,
  MessageSquare,
  Smartphone,
  Filter,
  Trash2,
  Check,
  X,
  Loader2,
  Settings,
  Volume2,
  VolumeX
} from "lucide-react"
import { useAuth } from "@/context/auth-context"

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

interface Notification {
  id: number
  userId: number
  bookingId: number | null
  type: 'BOOKING_CONFIRMATION' | 'CHECK_IN_REMINDER' | 'FLIGHT_DELAY' | 'GATE_CHANGE' | 'CANCELLATION' | 'REFUND_STATUS'
  channel: 'EMAIL' | 'SMS' | 'PUSH_NOTIFICATION' | 'IN_APP'
  subject: string
  message: string
  status: 'PENDING' | 'DELIVERED' | 'FAILED'
  isRead: boolean
  recipient: string
  createdAt: string
  updatedAt: string
}

export default function NotificationsPage() {
  const navigate = useNavigate()
  const { user, isLoggedIn } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [markingAsRead, setMarkingAsRead] = useState<number[]>([])
  const [deleting, setDeleting] = useState<number[]>([])
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    loadNotifications()
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [isLoggedIn, navigate, user])

  const loadNotifications = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem('skybooker_token')
      const response = await fetch(`${API_BASE_URL}/notifications/user/${user.userId}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })

      if (!response.ok) throw new Error('Failed to load notifications')

      const data = await response.json()
      setNotifications(data)
    } catch (err) {
      console.error('Error loading notifications:', err)
      setError(err instanceof Error ? err.message : 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: number) => {
    try {
      setMarkingAsRead(prev => [...prev, notificationId])

      const token = localStorage.getItem('skybooker_token')
      await fetch(`${API_BASE_URL}/notifications/${notificationId}/mark-read`, {
        method: 'PUT',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      )
    } catch (err) {
      console.error('Error marking notification as read:', err)
    } finally {
      setMarkingAsRead(prev => prev.filter(id => id !== notificationId))
    }
  }

  const markAllAsRead = async () => {
    if (!user) return

    try {
      const token = localStorage.getItem('skybooker_token')
      await fetch(`${API_BASE_URL}/notifications/user/${user.userId}/mark-all-read`, {
        method: 'PUT',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })

      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (err) {
      console.error('Error marking all as read:', err)
    }
  }

  const deleteNotification = async (notificationId: number) => {
    try {
      setDeleting(prev => [...prev, notificationId])
      
      // Note: You'll need to add a delete endpoint in the backend
      // For now, just remove from UI
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    } catch (err) {
      console.error('Error deleting notification:', err)
    } finally {
      setDeleting(prev => prev.filter(id => id !== notificationId))
    }
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'BOOKING_CONFIRMATION':
        return { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' }
      case 'CHECK_IN_REMINDER':
        return { icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' }
      case 'FLIGHT_DELAY':
        return { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' }
      case 'GATE_CHANGE':
        return { icon: Plane, color: 'text-purple-600', bg: 'bg-purple-50' }
      case 'CANCELLATION':
        return { icon: X, color: 'text-red-600', bg: 'bg-red-50' }
      case 'REFUND_STATUS':
        return { icon: CheckCircle2, color: 'text-teal-600', bg: 'bg-teal-50' }
      default:
        return { icon: Bell, color: 'text-slate-600', bg: 'bg-slate-50' }
    }
  }

  const getChannelIcon = (channel: Notification['channel']) => {
    switch (channel) {
      case 'EMAIL':
        return Mail
      case 'SMS':
        return MessageSquare
      case 'PUSH_NOTIFICATION':
        return Smartphone
      case 'IN_APP':
        return Bell
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread' && n.isRead) return false
    if (filter === 'read' && !n.isRead) return false
    if (selectedType !== 'all' && n.type !== selectedType) return false
    return true
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  if (loading && notifications.length === 0) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#00236f] animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading notifications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] pb-32 md:pb-0">
      <CustomerHeader />

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-8 pt-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-[#00236f] mb-2">
              Notifications
            </h1>
            <p className="text-slate-600">
              Stay updated with your flight bookings and travel alerts
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`p-3 rounded-xl transition-all ${
                notificationsEnabled
                  ? 'bg-[#00236f] text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
              title={notificationsEnabled ? 'Notifications enabled' : 'Notifications disabled'}
            >
              {notificationsEnabled ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
            </button>
            <Link
              to="/settings/notifications"
              className="p-3 bg-white rounded-xl hover:bg-slate-50 transition-all border border-slate-200"
              title="Notification settings"
            >
              <Settings className="w-5 h-5 text-slate-600" />
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total</p>
                <p className="text-2xl font-black text-slate-800">{notifications.length}</p>
              </div>
              <Bell className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Unread</p>
                <p className="text-2xl font-black text-slate-800">{unreadCount}</p>
              </div>
              <Mail className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">This Week</p>
                <p className="text-2xl font-black text-slate-800">
                  {notifications.filter(n => {
                    const diffDays = Math.floor((Date.now() - new Date(n.createdAt).getTime()) / 86400000)
                    return diffDays < 7
                  }).length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Alerts</p>
                <p className="text-2xl font-black text-slate-800">
                  {notifications.filter(n => 
                    n.type === 'FLIGHT_DELAY' || n.type === 'GATE_CHANGE'
                  ).length}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Read/Unread Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  filter === 'all'
                    ? 'bg-[#00236f] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  filter === 'unread'
                    ? 'bg-[#00236f] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setFilter('read')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  filter === 'read'
                    ? 'bg-[#00236f] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Read
              </button>
            </div>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#00236f]"
            >
              <option value="all">All Types</option>
              <option value="BOOKING_CONFIRMATION">Booking Confirmation</option>
              <option value="CHECK_IN_REMINDER">Check-in Reminder</option>
              <option value="FLIGHT_DELAY">Flight Delay</option>
              <option value="GATE_CHANGE">Gate Change</option>
              <option value="CANCELLATION">Cancellation</option>
              <option value="REFUND_STATUS">Refund Status</option>
            </select>

            {/* Mark All as Read */}
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="ml-auto px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-bold hover:bg-green-100 transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Mark All Read
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Notifications</h3>
            <p className="text-slate-500">
              {filter === 'unread'
                ? "You're all caught up! No unread notifications."
                : filter === 'read'
                ? "No read notifications yet."
                : "You don't have any notifications at the moment."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const notifIcon = getNotificationIcon(notification.type)
              const NotifIcon = notifIcon.icon
              const ChannelIcon = getChannelIcon(notification.channel)
              const isMarking = markingAsRead.includes(notification.id)
              const isDeleting = deleting.includes(notification.id)

              return (
                <div
                  key={notification.id}
                  className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden ${
                    !notification.isRead ? 'border-l-4 border-[#00236f]' : ''
                  }`}
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-xl ${notifIcon.bg} flex items-center justify-center flex-shrink-0`}>
                        <NotifIcon className={`w-6 h-6 ${notifIcon.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex-1">
                            <h3 className={`font-bold text-slate-800 mb-1 ${!notification.isRead ? 'text-[#00236f]' : ''}`}>
                              {notification.subject}
                            </h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                              {notification.message}
                            </p>
                          </div>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-[#00236f] rounded-full flex-shrink-0 mt-2" />
                          )}
                        </div>

                        {/* Meta Info */}
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <ChannelIcon className="w-3.5 h-3.5" />
                            <span className="font-medium">{notification.channel}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{formatTime(notification.createdAt)}</span>
                          </div>
                          {notification.bookingId && (
                            <Link
                              to={`/bookings/${notification.bookingId}`}
                              className="text-xs font-bold text-[#00236f] hover:underline"
                            >
                              View Booking →
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            disabled={isMarking}
                            className="p-2 hover:bg-green-50 rounded-lg transition-all disabled:opacity-50"
                            title="Mark as read"
                          >
                            {isMarking ? (
                              <Loader2 className="w-4 h-4 text-green-600 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4 text-green-600" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          disabled={isDeleting}
                          className="p-2 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                          title="Delete"
                        >
                          {isDeleting ? (
                            <Loader2 className="w-4 h-4 text-red-600 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 text-red-600" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  )
}

