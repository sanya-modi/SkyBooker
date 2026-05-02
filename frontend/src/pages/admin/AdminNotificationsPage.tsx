// export { default } from '../../app/admin/notifications/page'
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AdminHeader } from "@/components/admin/admin-header"
import {
  Bell,
  Send,
  Users,
  Mail,
  MessageSquare,
  Smartphone,
  CheckCircle2,
  Loader2
} from "lucide-react"
import { useAuth } from "@/context/auth-context"

export default function NotificationsPage() {
  const navigate = useNavigate()
  const { isLoggedIn, isAuthReady } = useAuth()
  const [sending, setSending] = useState(false)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    type: 'ANNOUNCEMENT',
    channel: 'EMAIL',
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setFormData({
          type: 'ANNOUNCEMENT',
          channel: 'EMAIL',
          subject: '',
          message: '',
          targetAudience: 'ALL'
        })
      }, 3000)
    } catch (err) {
      console.error('Error sending notification:', err)
      alert('Failed to send notification')
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
            <p className="text-slate-600">Your broadcast notification has been sent to all users</p>
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
                  <option value="ANNOUNCEMENT">Announcement</option>
                  <option value="PROMOTION">Promotion</option>
                  <option value="SYSTEM_UPDATE">System Update</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Channel *
                </label>
                <select
                  required
                  value={formData.channel}
                  onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value="EMAIL">Email</option>
                  <option value="SMS">SMS</option>
                  <option value="PUSH">Push Notification</option>
                  <option value="IN_APP">In-App</option>
                </select>
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
                  <option value="CUSTOMERS">Customers Only</option>
                  <option value="AIRLINE_STAFF">Airline Staff Only</option>
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

          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <Mail className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-blue-700">Email</p>
              <p className="text-xs text-blue-600">Detailed messages</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <MessageSquare className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-green-700">SMS</p>
              <p className="text-xs text-green-600">Quick alerts</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <Smartphone className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-purple-700">Push</p>
              <p className="text-xs text-purple-600">Mobile alerts</p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 text-center">
              <Bell className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-orange-700">In-App</p>
              <p className="text-xs text-orange-600">Real-time</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

