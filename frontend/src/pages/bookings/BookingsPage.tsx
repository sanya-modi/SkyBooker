// export { default } from '../../app/bookings/page'
import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BottomNav } from "@/components/layout/bottom-nav"
import { TopNav } from "@/components/booking/top-nav"
import { 
  Plane, 
  Download, 
  Calendar,
  Clock,
  MapPin,
  Users,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  Filter,
  Search,
  FileText,
  Ban
} from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { bookingApi, flightApi, airportApi, airlineApi, passengerApi, type BookingResult, type FlightResult, type Airport, type Airline, type PassengerResult } from "@/services/api"

import { CancellationModal } from "@/components/bookings/cancellation-modal"

interface EnrichedBooking extends BookingResult {
  flight?: FlightResult
  departureAirport?: Airport
  arrivalAirport?: Airport
  airline?: Airline
  passengers?: PassengerResult[]
}

export default function MyBookingsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isLoggedIn, isAuthReady } = useAuth()
  const [bookings, setBookings] = useState<EnrichedBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming')
  const [searchQuery, setSearchQuery] = useState('')
  const [cancellingId, setCancellingId] = useState<number | null>(null)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [bookingToCancel, setBookingToCancel] = useState<EnrichedBooking | null>(null)
  const [cancelRestrictionMessageId, setCancelRestrictionMessageId] = useState<number | null>(null)

  useEffect(() => {
    if (!isAuthReady) {
      return
    }

    if (!isLoggedIn) {
      navigate('/login', {
        replace: true,
        state: { from: `${location.pathname}${location.search}${location.hash}` },
      })
      return
    }
    void loadBookings()
  }, [isAuthReady, isLoggedIn, location.hash, location.pathname, location.search, navigate, user])

  const loadBookings = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      setError(null)
      
      const bookingsData = await bookingApi.getByUser(user.userId)
      
      // Enrich bookings with flight and airport data
      const enrichedBookings = await Promise.all(
        bookingsData.map(async (booking) => {
          try {
            const [flight, airports, airlines, passengers] = await Promise.all([
              flightApi.getById(booking.flightId),
              airportApi.getAll(),
              airlineApi.getAll(),
              passengerApi.getByBooking(booking.id).catch(() => [])
            ])
            
            const departureAirport = airports.find(a => a.id === flight.departureAirportId)
            const arrivalAirport = airports.find(a => a.id === flight.arrivalAirportId)
            const airline = airlines.find(a => a.id === flight.airlineId)
            const selectedSeats = booking.selectedSeats?.length
              ? booking.selectedSeats
              : passengers.map((passenger) => passenger.seatNumber).filter(Boolean)
            
            return {
              ...booking,
              selectedSeats,
              flight,
              departureAirport,
              arrivalAirport,
              airline,
              passengers,
            }
          } catch (err) {
            console.error('Error enriching booking:', err)
            return booking
          }
        })
      )
      
      setBookings(enrichedBookings)
    } catch (err) {
      console.error('Error loading bookings:', err)
      setError('Unable to load trips')
    } finally {
      setLoading(false)
    }
  }

  const isPastBooking = (booking: EnrichedBooking) => {
    if (!booking.flight?.departureTime) {
      return booking.status.toUpperCase() === 'COMPLETED'
    }

    return new Date(booking.flight.departureTime).getTime() < Date.now()
  }

  const isCancellationRestricted = (booking: EnrichedBooking) => {
    if (!booking.flight?.departureTime) return false

    const departureTime = new Date(booking.flight.departureTime).getTime()
    return departureTime - Date.now() <= 24 * 60 * 60 * 1000
  }

  const handleCancelBooking = async (bookingId: number) => {
    const booking = bookings.find(b => b.id === bookingId)
    if (!booking) return

    if (isCancellationRestricted(booking)) {
      setCancelRestrictionMessageId(bookingId)
      return
    }
    
    setCancelRestrictionMessageId(null)
    setBookingToCancel(booking)
    setShowCancelModal(true)
  }

  const confirmCancellation = async () => {
    if (!bookingToCancel) return

    try {
      setCancellingId(bookingToCancel.id)
      await bookingApi.cancel(bookingToCancel.id)
      await loadBookings() // Reload bookings
      setShowCancelModal(false)
      setBookingToCancel(null)
    } catch (err) {
      console.error('Error cancelling booking:', err)
      throw err // Let modal handle the error
    } finally {
      setCancellingId(null)
    }
  }

  const handleDownloadTicket = async (bookingId: number, pnr: string) => {
    try {
      setDownloadingId(bookingId)
      
      const blob = await bookingApi.downloadTicket(bookingId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `E-Ticket-${pnr}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error downloading ticket:', err)
      alert('Failed to download ticket. Please try again.')
    } finally {
      setDownloadingId(null)
    }
  }

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

  const filterBookings = () => {
    let filtered = bookings

    // Filter by tab
    if (activeTab === 'upcoming') {
      filtered = filtered.filter((booking) =>
        booking.status.toUpperCase() !== 'CANCELLED' && !isPastBooking(booking)
      )
    } else if (activeTab === 'past') {
      filtered = filtered.filter((booking) =>
        booking.status.toUpperCase() !== 'CANCELLED' && isPastBooking(booking)
      )
    } else if (activeTab === 'cancelled') {
      filtered = filtered.filter(b => b.status.toUpperCase() === 'CANCELLED')
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(b =>
        b.pnr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.departureAirport?.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.arrivalAirport?.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.flight?.flightNumber.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return filtered
  }

  const filteredBookings = filterBookings()

  if (!isAuthReady || (isLoggedIn && !user)) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#00236f] animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading your trips...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#00236f] animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading your bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] pb-32 md:pb-0">
      <TopNav />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 pt-24">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-[#00236f] mb-2">My Bookings</h1>
          <p className="text-slate-600">Manage your flight reservations and download tickets</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by PNR, city, or flight number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00236f] focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
                  activeTab === 'upcoming'
                    ? 'bg-[#00236f] text-white shadow-lg'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
                  activeTab === 'past'
                    ? 'bg-[#00236f] text-white shadow-lg'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Past
              </button>
              <button
                onClick={() => setActiveTab('cancelled')}
                className={`px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
                  activeTab === 'cancelled'
                    ? 'bg-[#00236f] text-white shadow-lg'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Cancelled
              </button>
            </div>
          </div>
          
          {/* Quick Link to Refunds */}
          <Link
            to="/refunds"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#00236f] hover:underline"
          >
            <CreditCard className="w-4 h-4" />
            Track Refund Status
            <ArrowRight className="w-4 h-4" />
          </Link>
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

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plane className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No bookings found</h3>
            <p className="text-slate-500 mb-6">
              {searchQuery
                ? 'Try adjusting your search criteria'
                : activeTab === 'upcoming'
                ? "You don't have any upcoming trips"
                : activeTab === 'past'
                ? "You don't have any past trips"
                : "You don't have any cancelled bookings"}
            </p>
            {!searchQuery && activeTab === 'upcoming' && (
              <Link
                to="/flights"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#00236f] to-[#1e3a8a] text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all"
              >
                <Plane className="w-5 h-5" />
                Book a Flight
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const statusBadge = getStatusBadge(booking.status)
              const StatusIcon = statusBadge.icon
              const isUpcoming = booking.status.toUpperCase() !== 'CANCELLED' && !isPastBooking(booking)
              const isCancelling = cancellingId === booking.id
              const isDownloading = downloadingId === booking.id
              const cancellationRestricted = isCancellationRestricted(booking)
              const seatLabels = booking.selectedSeats?.length
                ? booking.selectedSeats.join(', ')
                : booking.passengers?.map((passenger) => passenger.seatNumber).filter(Boolean).join(', ') || 'Not assigned'

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  <div className="p-6">
                    {/* Header Row */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                          <StatusIcon className="w-4 h-4" />
                          <span className="text-sm font-bold">{statusBadge.label}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg">
                          <FileText className="w-4 h-4 text-slate-600" />
                          <span className="text-sm font-mono font-bold text-slate-800">{booking.pnr}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500 mb-1">Total Fare</p>
                        <p className="text-2xl font-black text-[#00236f]">₹{booking.totalFare.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Flight Route */}
                    <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-6 mb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">From</p>
                          <p className="text-3xl font-black text-[#00236f] mb-1">
                            {booking.departureAirport?.iataCode || 'N/A'}
                          </p>
                          <p className="text-sm font-semibold text-slate-700">
                            {booking.departureAirport?.city || 'Unknown'}
                          </p>
                          <p className="text-xs text-slate-500 mt-2">
                            {booking.flight && formatTime(booking.flight.departureTime)}
                          </p>
                        </div>

                        <div className="flex flex-col items-center px-6">
                          <Plane className="w-8 h-8 text-[#00236f] mb-2" />
                          <div className="w-24 h-0.5 bg-slate-300" />
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
                          <p className="text-xs text-slate-500 mt-2">
                            {booking.flight && formatTime(booking.flight.arrivalTime)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Booking Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-[#00236f] mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Travel Date</p>
                          <p className="text-sm font-bold text-slate-800">
                            {booking.flight && formatDate(booking.flight.departureTime)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-[#00236f] mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Passengers</p>
                          <p className="text-sm font-bold text-slate-800">{booking.numberOfPassengers}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-[#00236f] mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Seats</p>
                          <p className="text-sm font-bold text-slate-800">
                            {seatLabels}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-[#00236f] mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Booked On</p>
                          <p className="text-sm font-bold text-slate-800">
                            {formatDate(booking.bookingDate)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
                      <Link
                        to={`/bookings/${booking.id}`}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
                      >
                        <FileText className="w-5 h-5" />
                        View Details
                      </Link>
                      
                      {isUpcoming && (
                        <>
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={isCancelling}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all ${
                              cancellationRestricted
                                ? 'bg-red-50 text-red-300 cursor-not-allowed'
                                : 'bg-red-50 text-red-600 hover:bg-red-100'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {isCancelling ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Cancelling...
                              </>
                            ) : (
                              <>
                                <Ban className="w-5 h-5" />
                                Cancel Booking
                              </>
                            )}
                          </button>
                        </>
                      )}
                    </div>
                    {cancelRestrictionMessageId === booking.id || cancellationRestricted ? (
                      <p className="mt-3 text-sm font-medium text-red-600">
                        Cancellation is not allowed within 24 hours of departure
                      </p>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <BottomNav />
      
      {/* Cancellation Modal */}
      {bookingToCancel && (
        <CancellationModal
          isOpen={showCancelModal}
          onClose={() => {
            setShowCancelModal(false)
            setBookingToCancel(null)
          }}
          onConfirm={confirmCancellation}
          booking={bookingToCancel}
        />
      )}
    </div>
  )
}
