// export { default } from '../app/refunds/page'
import { useState, useEffect } from "react"
import { Link, useNavigate } from 'react-router-dom'
import { CustomerHeader } from "@/components/layout/customer-header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { 
  ArrowLeft,
  Clock,
  CheckCircle2,
  CreditCard,
  AlertCircle,
  Loader2,
  Calendar,
  DollarSign,
  FileText,
  TrendingUp
} from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { bookingApi, paymentApi, type BookingResult, type PaymentResult } from "@/services/api"

interface RefundInfo {
  booking: BookingResult
  payment?: PaymentResult
  refundStatus: 'initiated' | 'processing' | 'completed' | 'failed'
  refundAmount: number
  processingFee: number
  estimatedDate: string
}

export default function RefundsPage() {
  const navigate = useNavigate()
  const { user, isLoggedIn } = useAuth()
  const [refunds, setRefunds] = useState<RefundInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    loadRefunds()
  }, [isLoggedIn, navigate, user])

  const loadRefunds = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      // Get all cancelled bookings
      const bookings = await bookingApi.getByUser(user.userId)
      const cancelledBookings = bookings.filter(b => b.status.toUpperCase() === 'CANCELLED')

      // Get payment info for each cancelled booking
      const refundInfos = await Promise.all(
        cancelledBookings.map(async (booking) => {
          try {
            const payments = await paymentApi.getByBooking(booking.id)
            const payment = payments.length > 0 ? payments[0] : undefined

            const processingFee = Math.round(booking.totalFare * 0.05)
            const refundAmount = booking.totalFare - processingFee

            // Calculate estimated refund date (7 days from booking date)
            const bookingDate = new Date(booking.bookingDate)
            const estimatedDate = new Date(bookingDate)
            estimatedDate.setDate(estimatedDate.getDate() + 7)

            // Determine refund status based on payment
            let refundStatus: RefundInfo['refundStatus'] = 'initiated'
            if (payment?.refundAmount && payment.refundAmount > 0) {
              refundStatus = 'completed'
            } else {
              const daysSinceCancellation = Math.floor(
                (Date.now() - bookingDate.getTime()) / (1000 * 60 * 60 * 24)
              )
              if (daysSinceCancellation > 7) {
                refundStatus = 'completed'
              } else if (daysSinceCancellation > 2) {
                refundStatus = 'processing'
              }
            }

            return {
              booking,
              payment,
              refundStatus,
              refundAmount,
              processingFee,
              estimatedDate: estimatedDate.toISOString()
            } as RefundInfo
          } catch (err) {
            console.error('Error loading refund info:', err)
            return null
          }
        })
      )

      setRefunds(refundInfos.filter(r => r !== null) as RefundInfo[])
    } catch (err) {
      console.error('Error loading refunds:', err)
      setError(err instanceof Error ? err.message : 'Failed to load refunds')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: RefundInfo['refundStatus']) => {
    switch (status) {
      case 'initiated':
        return {
          icon: Clock,
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200',
          label: 'Initiated'
        }
      case 'processing':
        return {
          icon: TrendingUp,
          bg: 'bg-yellow-50',
          text: 'text-yellow-700',
          border: 'border-yellow-200',
          label: 'Processing'
        }
      case 'completed':
        return {
          icon: CheckCircle2,
          bg: 'bg-green-50',
          text: 'text-green-700',
          border: 'border-green-200',
          label: 'Completed'
        }
      case 'failed':
        return {
          icon: AlertCircle,
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-200',
          label: 'Failed'
        }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#00236f] animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading refund information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] pb-32 md:pb-0">
      <CustomerHeader />

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-8 pt-24">
        {/* Back Button */}
        <Link
          to="/bookings"
          className="inline-flex items-center gap-2 text-[#00236f] font-bold mb-6 hover:underline"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Bookings
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-[#00236f] mb-2">Refund Status</h1>
          <p className="text-slate-600">Track your refund requests and processing status</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Refunds List */}
        {refunds.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No Refunds Found</h3>
            <p className="text-slate-500 mb-6">
              You don't have any refund requests at the moment.
            </p>
            <Link
              to="/bookings"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00236f] to-[#1e3a8a] text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
            >
              View Bookings
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {refunds.map((refund) => {
              const statusBadge = getStatusBadge(refund.refundStatus)
              const StatusIcon = statusBadge.icon

              return (
                <div
                  key={refund.booking.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                >
                  {/* Header */}
                  <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-6 border-b border-slate-200">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                            <StatusIcon className="w-4 h-4" />
                            <span className="text-sm font-bold">{statusBadge.label}</span>
                          </div>
                          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                            <FileText className="w-4 h-4 text-slate-600" />
                            <span className="text-sm font-mono font-bold text-slate-800">
                              {refund.booking.pnr}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600">
                          Booking ID: #{refund.booking.id}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 mb-1">Refund Amount</p>
                        <p className="text-3xl font-black text-green-600">
                          ₹{refund.refundAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Timeline */}
                    <div className="mb-6">
                      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">
                        Refund Timeline
                      </h3>
                      <div className="relative">
                        {/* Timeline Line */}
                        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />

                        {/* Timeline Steps */}
                        <div className="space-y-6">
                          {/* Step 1: Initiated */}
                          <div className="relative flex items-start gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                              refund.refundStatus === 'initiated' || refund.refundStatus === 'processing' || refund.refundStatus === 'completed'
                                ? 'bg-green-500'
                                : 'bg-slate-200'
                            }`}>
                              <CheckCircle2 className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1 pt-1">
                              <p className="font-bold text-slate-800">Refund Initiated</p>
                              <p className="text-sm text-slate-500">
                                Cancellation processed and refund request created
                              </p>
                              <p className="text-xs text-slate-400 mt-1">
                                {formatDate(refund.booking.bookingDate)}
                              </p>
                            </div>
                          </div>

                          {/* Step 2: Processing */}
                          <div className="relative flex items-start gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                              refund.refundStatus === 'processing' || refund.refundStatus === 'completed'
                                ? 'bg-yellow-500'
                                : refund.refundStatus === 'initiated'
                                ? 'bg-slate-200 animate-pulse'
                                : 'bg-slate-200'
                            }`}>
                              {refund.refundStatus === 'processing' || refund.refundStatus === 'completed' ? (
                                <CheckCircle2 className="w-5 h-5 text-white" />
                              ) : (
                                <TrendingUp className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <div className="flex-1 pt-1">
                              <p className="font-bold text-slate-800">Processing Refund</p>
                              <p className="text-sm text-slate-500">
                                Refund is being processed by payment gateway
                              </p>
                              {refund.refundStatus === 'processing' && (
                                <p className="text-xs text-yellow-600 font-semibold mt-1">
                                  In Progress...
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Step 3: Completed */}
                          <div className="relative flex items-start gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                              refund.refundStatus === 'completed'
                                ? 'bg-green-500'
                                : 'bg-slate-200'
                            }`}>
                              {refund.refundStatus === 'completed' ? (
                                <CheckCircle2 className="w-5 h-5 text-white" />
                              ) : (
                                <CreditCard className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                            <div className="flex-1 pt-1">
                              <p className="font-bold text-slate-800">Refund Completed</p>
                              <p className="text-sm text-slate-500">
                                Amount credited to your original payment method
                              </p>
                              {refund.refundStatus === 'completed' ? (
                                <p className="text-xs text-green-600 font-semibold mt-1">
                                  Completed
                                </p>
                              ) : (
                                <p className="text-xs text-slate-400 mt-1">
                                  Expected by {formatDate(refund.estimatedDate)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Refund Details */}
                    <div className="bg-slate-50 rounded-xl p-6">
                      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-4">
                        Refund Breakdown
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Original Amount</span>
                          <span className="font-bold text-slate-800">
                            ₹{refund.booking.totalFare.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600">Cancellation Fee (5%)</span>
                          <span className="font-bold text-red-600">
                            -₹{refund.processingFee.toLocaleString()}
                          </span>
                        </div>
                        <div className="border-t-2 border-slate-200 pt-3">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-[#00236f]">Refund Amount</span>
                            <span className="text-2xl font-black text-green-600">
                              ₹{refund.refundAmount.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Info Banner */}
                    {refund.refundStatus !== 'completed' && (
                      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-blue-900 mb-1">
                              Refund Processing Time
                            </p>
                            <p className="text-sm text-blue-800">
                              Your refund will be credited within <strong>5-7 business days</strong> from the cancellation date. 
                              The amount will be refunded to your original payment method.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
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

