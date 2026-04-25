"use client"

import Link from "next/link"
import { 
  Plane, 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  Download, 
  Ban, 
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Loader2
} from "lucide-react"

interface BookingCardProps {
  booking: {
    id: number
    pnr: string
    status: string
    totalFare: number
    numberOfPassengers: number
    selectedSeats?: string[]
    bookingDate: string
    flight?: {
      flightNumber: string
      departureTime: string
      arrivalTime: string
    }
    departureAirport?: {
      iataCode: string
      city: string
    }
    arrivalAirport?: {
      iataCode: string
      city: string
    }
    airline?: {
      name: string
    }
  }
  onCancel?: (id: number) => void
  onDownload?: (id: number, pnr: string) => void
  isCancelling?: boolean
  isDownloading?: boolean
}

export function EnhancedBookingCard({ 
  booking, 
  onCancel, 
  onDownload,
  isCancelling = false,
  isDownloading = false
}: BookingCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return {
          icon: CheckCircle2,
          bg: 'bg-green-50',
          text: 'text-green-700',
          border: 'border-green-200',
          label: 'Confirmed'
        }
      case 'PENDING':
        return {
          icon: Clock,
          bg: 'bg-yellow-50',
          text: 'text-yellow-700',
          border: 'border-yellow-200',
          label: 'Pending'
        }
      case 'CANCELLED':
        return {
          icon: XCircle,
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-200',
          label: 'Cancelled'
        }
      case 'COMPLETED':
        return {
          icon: CheckCircle2,
          bg: 'bg-slate-50',
          text: 'text-slate-700',
          border: 'border-slate-200',
          label: 'Completed'
        }
      default:
        return {
          icon: AlertCircle,
          bg: 'bg-slate-50',
          text: 'text-slate-700',
          border: 'border-slate-200',
          label: status
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

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const statusBadge = getStatusBadge(booking.status)
  const StatusIcon = statusBadge.icon
  const isUpcoming = booking.status.toUpperCase() === 'CONFIRMED' || booking.status.toUpperCase() === 'PENDING'

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden group">
      {/* Colored Top Border */}
      <div className={`h-1 ${booking.status.toUpperCase() === 'CONFIRMED' ? 'bg-green-500' : booking.status.toUpperCase() === 'CANCELLED' ? 'bg-red-500' : 'bg-yellow-500'}`} />
      
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
              <StatusIcon className="w-4 h-4" />
              <span className="text-sm font-bold">{statusBadge.label}</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg">
              <span className="text-xs text-slate-500">PNR:</span>
              <span className="text-sm font-mono font-bold text-slate-800">{booking.pnr}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-500 mb-1">Total Fare</p>
            <p className="text-2xl font-black text-[#00236f]">₹{booking.totalFare.toLocaleString()}</p>
          </div>
        </div>

        {/* Flight Route */}
        <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-5 mb-5">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">From</p>
              <p className="text-3xl font-black text-[#00236f] mb-1">
                {booking.departureAirport?.iataCode || 'N/A'}
              </p>
              <p className="text-sm font-semibold text-slate-700">
                {booking.departureAirport?.city || 'Unknown'}
              </p>
              {booking.flight && (
                <p className="text-xs text-slate-500 mt-2">
                  {formatTime(booking.flight.departureTime)}
                </p>
              )}
            </div>

            <div className="flex flex-col items-center px-4">
              <Plane className="w-7 h-7 text-[#00236f] mb-2 rotate-90" />
              <div className="w-20 h-0.5 bg-slate-300" />
              <p className="text-xs font-bold text-slate-500 mt-2">
                {booking.flight?.flightNumber || 'N/A'}
              </p>
            </div>

            <div className="flex-1 text-right">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">To</p>
              <p className="text-3xl font-black text-[#00236f] mb-1">
                {booking.arrivalAirport?.iataCode || 'N/A'}
              </p>
              <p className="text-sm font-semibold text-slate-700">
                {booking.arrivalAirport?.city || 'Unknown'}
              </p>
              {booking.flight && (
                <p className="text-xs text-slate-500 mt-2">
                  {formatTime(booking.flight.arrivalTime)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="flex items-start gap-2">
            <Calendar className="w-4 h-4 text-[#00236f] mt-0.5" />
            <div>
              <p className="text-xs text-slate-500">Travel Date</p>
              <p className="text-sm font-bold text-slate-800">
                {booking.flight && formatDate(booking.flight.departureTime)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Users className="w-4 h-4 text-[#00236f] mt-0.5" />
            <div>
              <p className="text-xs text-slate-500">Passengers</p>
              <p className="text-sm font-bold text-slate-800">{booking.numberOfPassengers}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-[#00236f] mt-0.5" />
            <div>
              <p className="text-xs text-slate-500">Seats</p>
              <p className="text-sm font-bold text-slate-800">
                {booking.selectedSeats?.join(', ') || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
          <Link
            href={`/bookings/${booking.id}`}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all text-sm"
          >
            View Details
            <ArrowRight className="w-4 h-4" />
          </Link>
          
          {isUpcoming && onDownload && (
            <button
              onClick={() => onDownload(booking.id, booking.pnr)}
              disabled={isDownloading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#00236f] to-[#1e3a8a] text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 text-sm"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download
                </>
              )}
            </button>
          )}
          
          {isUpcoming && onCancel && (
            <button
              onClick={() => onCancel(booking.id)}
              disabled={isCancelling}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-all disabled:opacity-50 text-sm"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <Ban className="w-4 h-4" />
                  Cancel
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
