"use client"

import { useState } from "react"
import { 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  CreditCard,
  Info,
  Loader2,
  Ban
} from "lucide-react"

interface CancellationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
  booking: {
    id: number
    pnr: string
    totalFare: number
    departureAirport?: { iataCode: string; city: string }
    arrivalAirport?: { iataCode: string; city: string }
    flight?: { flightNumber: string; departureTime: string }
  }
}

export function CancellationModal({ isOpen, onClose, onConfirm, booking }: CancellationModalProps) {
  const [step, setStep] = useState<'confirm' | 'processing' | 'success'>('confirm')
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleConfirmCancellation = async () => {
    try {
      setCancelling(true)
      setError(null)
      setStep('processing')
      
      await onConfirm()
      
      setStep('success')
      
      // Auto close after 3 seconds on success
      setTimeout(() => {
        onClose()
        setStep('confirm')
      }, 3000)
    } catch (err) {
      console.error('Cancellation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to cancel booking')
      setStep('confirm')
    } finally {
      setCancelling(false)
    }
  }

  const handleClose = () => {
    if (!cancelling) {
      onClose()
      setStep('confirm')
      setError(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const refundAmount = booking.totalFare
  const processingFee = Math.round(booking.totalFare * 0.05) // 5% processing fee
  const refundableAmount = refundAmount - processingFee

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-black text-slate-800">
            {step === 'confirm' && 'Cancel Booking'}
            {step === 'processing' && 'Processing Cancellation'}
            {step === 'success' && 'Booking Cancelled'}
          </h2>
          <button
            onClick={handleClose}
            disabled={cancelling}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'confirm' && (
            <>
              {/* Warning Banner */}
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-red-900 mb-1">Important Notice</h3>
                    <p className="text-sm text-red-800">
                      This action cannot be undone. Your booking will be cancelled immediately and seats will be released.
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-6 mb-6">
                <h3 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-4">
                  Booking Details
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">PNR</span>
                    <span className="font-mono font-bold text-slate-900">{booking.pnr}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Route</span>
                    <span className="font-bold text-slate-900">
                      {booking.departureAirport?.iataCode} → {booking.arrivalAirport?.iataCode}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Flight</span>
                    <span className="font-bold text-slate-900">{booking.flight?.flightNumber}</span>
                  </div>
                  {booking.flight?.departureTime && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Travel Date</span>
                      <span className="font-bold text-slate-900">
                        {formatDate(booking.flight.departureTime)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Refund Information */}
              <div className="bg-white border-2 border-slate-200 rounded-xl p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-[#00236f]" />
                  <h3 className="font-bold text-slate-800">Refund Information</h3>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600">Booking Amount</span>
                    <span className="font-bold text-slate-900">₹{refundAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-600">Cancellation Fee (5%)</span>
                    <span className="font-bold text-red-600">-₹{processingFee.toLocaleString()}</span>
                  </div>
                  <div className="border-t-2 border-slate-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-[#00236f]">Refund Amount</span>
                      <span className="text-2xl font-black text-green-600">
                        ₹{refundableAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-blue-900 mb-1">Refund Timeline</p>
                      <p className="text-sm text-blue-800">
                        Your refund will be processed within <strong>5-7 business days</strong> and credited to your original payment method.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cancellation Policy */}
              <div className="bg-slate-50 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-2 mb-3">
                  <Info className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5" />
                  <h4 className="font-bold text-slate-800">Cancellation Policy</h4>
                </div>
                <ul className="space-y-2 text-sm text-slate-700 ml-7">
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400 mt-1">•</span>
                    <span>Seats will be released immediately upon cancellation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400 mt-1">•</span>
                    <span>A 5% cancellation fee will be deducted from the refund amount</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400 mt-1">•</span>
                    <span>Refund will be processed to your original payment method</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400 mt-1">•</span>
                    <span>You will receive email confirmation once refund is initiated</span>
                  </li>
                </ul>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleClose}
                  disabled={cancelling}
                  className="flex-1 px-6 py-4 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleConfirmCancellation}
                  disabled={cancelling}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {cancelling ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <Ban className="w-5 h-5" />
                      Confirm Cancellation
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {step === 'processing' && (
            <div className="py-12 text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-10 h-10 text-[#00236f] animate-spin" />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Processing Cancellation</h3>
              <p className="text-slate-600 mb-6">
                Please wait while we cancel your booking and initiate the refund...
              </p>
              <div className="max-w-md mx-auto space-y-3">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <span>Updating booking status</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <span>Releasing seats</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 animate-pulse">
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  </div>
                  <span>Initiating refund...</span>
                </div>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="py-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-300">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">Booking Cancelled Successfully</h3>
              <p className="text-slate-600 mb-6">
                Your booking has been cancelled and refund has been initiated.
              </p>
              
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 max-w-md mx-auto mb-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Refund Amount</span>
                    <span className="font-bold text-green-600 text-lg">
                      ₹{refundableAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Processing Time</span>
                    <span className="font-bold text-slate-800">5-7 business days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Status</span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                      <Clock className="w-3 h-3" />
                      Processing
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-sm text-blue-800">
                  <strong>Confirmation email sent!</strong> Check your inbox for cancellation details and refund information.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
