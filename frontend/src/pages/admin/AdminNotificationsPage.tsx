// export { default } from '../../app/admin/notifications/page'
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AdminHeader } from "@/components/admin/admin-header"
import {
  Bell,
  Send,
  Mail,
  CheckCircle2,
  Loader2
} from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { adminApi } from "@/services/api"

export default function NotificationsPage() {
  const navigate = useNavigate()
  const { isLoggedIn, isAuthReady } = useAuth()
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const [formData, setFormData] = useState({
    type: 'FLIGHT_UPDATE',
    subject: '',
    message: '',
    targetAudience: 'ALL'
  })

  useEffect(() => {
    if (!isAuthReady) return
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
  }, [isLoggedIn, isAuthReady, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSending(true)
      setErrorMessage('')
      await adminApi.sendNotification(formData)
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setFormData({
          type: 'FLIGHT_UPDATE',
          subject: '',
          message: '',
          targetAudience: 'ALL'
        })
      }, 3000)
    } catch (err) {
      console.error('Error sending notification:', err)
      setErrorMessage(err instanceof Error ? err.message : 'Failed to send notification')
    } finally {
      setSending(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#f7f9fb]">
        <AdminHeader />
        <main className="max-w-4xl mx-auto px-4 md:px-6 py-8 pt-24">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-2">Notification Sent Successfully!</h2>
            <p className="text-slate-600">Your email notification has been sent to the selected users</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <AdminHeader />

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-sky-600 mb-2">Broadcast Notifications</h1>
          <p className="text-slate-600">Send notifications to users across the platform</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-sky-500 to-blue-600 rounded-2xl flex items-center justify-center">
              <Bell className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800">Create Broadcast</h2>
              <p className="text-slate-600">Compose and send notifications to users</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Notification Type *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value="FLIGHT_UPDATE">Flight Update</option>
                  <option value="BOOKING_CONFIRMATION">Booking Confirmation</option>
                  <option value="CHECK_IN_REMINDER">Check-in Reminder</option>
                  <option value="PAYMENT_SUCCESS">Payment Success</option>
                  <option value="CANCELLATION">Cancellation</option>
                  <option value="REFUND">Refund</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Channel
                </label>
                <div className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 text-slate-700 font-semibold flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600" />
                  Email
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Target Audience *
                </label>
                <select
                  required
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value="ALL">All Users</option>
                  <option value="PASSENGER">Passengers Only</option>
                  <option value="AIRLINE_STAFF">Airline Staff Only</option>
                  <option value="ADMIN">Administrators Only</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Enter notification subject..."
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Message *
                </label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Enter your message..."
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="font-bold text-blue-900 mb-2">Preview</h3>
              <div className="bg-white rounded-lg p-4">
                <p className="font-bold text-slate-800 mb-2">{formData.subject || 'Subject will appear here'}</p>
                <p className="text-slate-600 text-sm">{formData.message || 'Message content will appear here'}</p>
              </div>
            </div>

            {errorMessage && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-4 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Broadcast
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 grid grid-cols-1 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <Mail className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-blue-700">Email</p>
              <p className="text-xs text-blue-600">Broadcast messages are sent by email only</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
