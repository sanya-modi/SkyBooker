// export { default } from '../../app/settings/notifications/page'
import { useState, useEffect } from "react"
import { useNavigate, Link } from 'react-router-dom'
import { CustomerHeader } from "@/components/layout/customer-header"
import {
  ArrowLeft,
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  CheckCircle2,
  Save,
  Loader2
} from "lucide-react"
import { useAuth } from "@/context/auth-context"

interface NotificationPreferences {
  bookingConfirmation: {
    email: boolean
    sms: boolean
    push: boolean
  }
  checkInReminder: {
    email: boolean
    sms: boolean
    push: boolean
  }
  flightUpdates: {
    email: boolean
    sms: boolean
    push: boolean
  }
  promotions: {
    email: boolean
    sms: boolean
    push: boolean
  }
}

export default function NotificationSettingsPage() {
  const navigate = useNavigate()
  const { user, isLoggedIn } = useAuth()
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    bookingConfirmation: { email: true, sms: true, push: true },
    checkInReminder: { email: true, sms: true, push: true },
    flightUpdates: { email: true, sms: true, push: true },
    promotions: { email: false, sms: false, push: false }
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    loadPreferences()
  }, [isLoggedIn, navigate])

  const loadPreferences = () => {
    // Load from localStorage or API
    const stored = localStorage.getItem('notification_preferences')
    if (stored) {
      setPreferences(JSON.parse(stored))
    }
  }

  const handleToggle = (category: keyof NotificationPreferences, channel: 'email' | 'sms' | 'push') => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [channel]: !prev[category][channel]
      }
    }))
    setSaved(false)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Save to localStorage (in production, save to backend)
      localStorage.setItem('notification_preferences', JSON.stringify(preferences))
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Error saving preferences:', err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <CustomerHeader />

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-8 pt-24">
        {/* Back Button */}
        <Link
          to="/notifications"
          className="inline-flex items-center gap-2 text-[#00236f] font-bold mb-6 hover:underline"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Notifications
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-[#00236f] mb-2">
            Notification Preferences
          </h1>
          <p className="text-slate-600">
            Choose how you want to receive updates about your bookings and flights
          </p>
        </div>

        {/* Preferences Card */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#00236f] to-[#1e3a8a] p-6 text-white">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold">Manage Notifications</h2>
                <p className="text-sm text-blue-200">Control what notifications you receive and how</p>
              </div>
            </div>
          </div>

          {/* Channel Legend */}
          <div className="p-6 border-b border-slate-200 bg-slate-50">
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-semibold text-slate-700">Email</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-600" />
                <span className="text-sm font-semibold text-slate-700">SMS</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-semibold text-slate-700">Push Notification</span>
              </div>
            </div>
          </div>

          {/* Preferences List */}
          <div className="divide-y divide-slate-200">
            {/* Booking Confirmation */}
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-800 mb-1">Booking Confirmation</h3>
                <p className="text-sm text-slate-600">
                  Receive confirmation when your booking is successful
                </p>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.bookingConfirmation.email}
                    onChange={() => handleToggle('bookingConfirmation', 'email')}
                    className="w-5 h-5 rounded border-slate-300 text-[#00236f] focus:ring-[#00236f]"
                  />
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-semibold text-slate-700">Email</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.bookingConfirmation.sms}
                    onChange={() => handleToggle('bookingConfirmation', 'sms')}
                    className="w-5 h-5 rounded border-slate-300 text-[#00236f] focus:ring-[#00236f]"
                  />
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-semibold text-slate-700">SMS</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.bookingConfirmation.push}
                    onChange={() => handleToggle('bookingConfirmation', 'push')}
                    className="w-5 h-5 rounded border-slate-300 text-[#00236f] focus:ring-[#00236f]"
                  />
                  <Smartphone className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-semibold text-slate-700">Push</span>
                </label>
              </div>
            </div>

            {/* Check-in Reminder */}
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-800 mb-1">Check-in Reminder</h3>
                <p className="text-sm text-slate-600">
                  Get reminded when web check-in opens (24 hours before flight)
                </p>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.checkInReminder.email}
                    onChange={() => handleToggle('checkInReminder', 'email')}
                    className="w-5 h-5 rounded border-slate-300 text-[#00236f] focus:ring-[#00236f]"
                  />
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-semibold text-slate-700">Email</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.checkInReminder.sms}
                    onChange={() => handleToggle('checkInReminder', 'sms')}
                    className="w-5 h-5 rounded border-slate-300 text-[#00236f] focus:ring-[#00236f]"
                  />
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-semibold text-slate-700">SMS</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.checkInReminder.push}
                    onChange={() => handleToggle('checkInReminder', 'push')}
                    className="w-5 h-5 rounded border-slate-300 text-[#00236f] focus:ring-[#00236f]"
                  />
                  <Smartphone className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-semibold text-slate-700">Push</span>
                </label>
              </div>
            </div>

            {/* Flight Updates */}
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-800 mb-1">Flight Updates</h3>
                <p className="text-sm text-slate-600">
                  Important alerts about delays, gate changes, and cancellations
                </p>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.flightUpdates.email}
                    onChange={() => handleToggle('flightUpdates', 'email')}
                    className="w-5 h-5 rounded border-slate-300 text-[#00236f] focus:ring-[#00236f]"
                  />
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-semibold text-slate-700">Email</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.flightUpdates.sms}
                    onChange={() => handleToggle('flightUpdates', 'sms')}
                    className="w-5 h-5 rounded border-slate-300 text-[#00236f] focus:ring-[#00236f]"
                  />
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-semibold text-slate-700">SMS</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.flightUpdates.push}
                    onChange={() => handleToggle('flightUpdates', 'push')}
                    className="w-5 h-5 rounded border-slate-300 text-[#00236f] focus:ring-[#00236f]"
                  />
                  <Smartphone className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-semibold text-slate-700">Push</span>
                </label>
              </div>
            </div>

            {/* Promotions */}
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-slate-800 mb-1">Promotions & Offers</h3>
                <p className="text-sm text-slate-600">
                  Special deals, discounts, and promotional offers
                </p>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.promotions.email}
                    onChange={() => handleToggle('promotions', 'email')}
                    className="w-5 h-5 rounded border-slate-300 text-[#00236f] focus:ring-[#00236f]"
                  />
                  <Mail className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-semibold text-slate-700">Email</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.promotions.sms}
                    onChange={() => handleToggle('promotions', 'sms')}
                    className="w-5 h-5 rounded border-slate-300 text-[#00236f] focus:ring-[#00236f]"
                  />
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-semibold text-slate-700">SMS</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.promotions.push}
                    onChange={() => handleToggle('promotions', 'push')}
                    className="w-5 h-5 rounded border-slate-300 text-[#00236f] focus:ring-[#00236f]"
                  />
                  <Smartphone className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-semibold text-slate-700">Push</span>
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="p-6 bg-slate-50 border-t border-slate-200">
            <button
              onClick={handleSave}
              disabled={saving || saved}
              className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-[#00236f] to-[#1e3a8a] text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : saved ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Saved Successfully!
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Preferences
                </>
              )}
            </button>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 mb-2">About Notifications</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>
                <strong>Email:</strong> Detailed information sent to your registered email address
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>
                <strong>SMS:</strong> Quick alerts sent to your mobile number
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>
                <strong>Push:</strong> Real-time notifications on your device (requires app)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>
                Critical flight updates will always be sent regardless of your preferences
              </span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  )
}

