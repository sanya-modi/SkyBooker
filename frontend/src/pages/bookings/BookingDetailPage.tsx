// export { default } from '../../app/bookings/[id]/page'
// "use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { CustomerHeader } from "@/components/layout/customer-header"
import { 
  ArrowLeft,
  Plane,
  Calendar,
  Clock,
  MapPin,
  Users,
  CreditCard,
  Download,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  Phone,
  FileText,
  QrCode
} from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { bookingApi, flightApi, airportApi, airlineApi, passengerApi, paymentApi, type BookingResult, type FlightResult, type Airport, type Airline, type PassengerResult, type PaymentResult } from "@/services/api"

interface EnrichedBooking extends BookingResult {
  flight?: FlightResult
  departureAirport?: Airport
  arrivalAirport?: Airport
  airline?: Airline
  passengers?: PassengerResult[]
  payment?: PaymentResult
}

export default function BookingDetailPage() {
  const params = useParams()
  const navigate = useNavigate()
  const { user, isLoggedIn } = useAuth()
  const [booking, setBooking] = useState<EnrichedBooking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadingTicket, setDownloadingTicket] = useState(false)

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    loadBookingDetails()
  }, [isLoggedIn, params.id])

  const loadBookingDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      const bookingId = Number(params.id)
      const bookingData = await bookingApi.getById(bookingId)

      // Enrich with additional data
      const [flight, airports, airlines, passengers, payments] = await Promise.all([
        flightApi.getById(bookingData.flightId),
        airportApi.getAll(),
        airlineApi.getAll(),
        passengerApi.getByBooking(bookingId).catch(() => []),
        paymentApi.getByBooking(bookingId).catch(() => [])
      ])

      const departureAirport = airports.find(a => a.id === flight.departureAirportId)
      const arrivalAirport = airports.find(a => a.id === flight.arrivalAirportId)
      const airline = airlines.find(a => a.id === flight.airlineId)
      const payment = payments.length > 0 ? payments[0] : undefined

      setBooking({
        ...bookingData,
        selectedSeats: bookingData.selectedSeats?.length
          ? bookingData.selectedSeats
          : passengers.map((passenger) => passenger.seatNumber).filter(Boolean),
        flight,
        departureAirport,
        arrivalAirport,
        airline,
        passengers,
        payment
      })
    } catch (err) {
      console.error('Error loading booking details:', err)
      setError(err instanceof Error ? err.message : 'Failed to load booking details')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadTicket = async () => {
    if (!booking) return

    try {
      setDownloadingTicket(true)
      
      const blob = await bookingApi.downloadTicket(booking.id)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `E-Ticket-${booking.pnr}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error downloading ticket:', err)
      alert('Failed to download ticket. Please try again.')
    } finally {
      setDownloadingTicket(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
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

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', label: 'Confirmed' }
      case 'PENDING':
        return { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Pending' }
      case 'CANCELLED':
        return { icon: Ban, color: 'text-red-600', bg: 'bg-red-50', label: 'Cancelled' }
      case 'COMPLETED':
        return { icon: CheckCircle2, color: 'text-slate-600', bg: 'bg-slate-50', label: 'Completed' }
      default:
        return { icon: AlertCircle, color: 'text-slate-600', bg: 'bg-slate-50', label: status }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#00236f] animate-spin mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading booking details...</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[#f7f9fb]">
        <CustomerHeader />
        <main className="max-w-4xl mx-auto px-4 py-24">
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Booking Not Found</h2>
            <p className="text-slate-600 mb-6">{error || 'The booking you are looking for does not exist.'}</p>
            <Link
              to="/bookings"
              className="inline-flex items-center gap-2 bg-[#00236f] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#1e3a8a] transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Bookings
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const statusBadge = getStatusBadge(booking.status)
  const StatusIcon = statusBadge.icon
  const isUpcoming = booking.status.toUpperCase() === 'CONFIRMED' || booking.status.toUpperCase() === 'PENDING'
  const seatLabels = booking.selectedSeats?.length
    ? booking.selectedSeats.join(', ')
    : booking.passengers?.map((passenger) => passenger.seatNumber).filter(Boolean).join(', ') || 'Not assigned'

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <CustomerHeader />

      <main className="max-w-5xl mx-auto px-4 py-8 pt-24">
        {/* Back Button */}
        <Link
          to="/bookings"
          className="inline-flex items-center gap-2 text-[#00236f] font-bold mb-6 hover:underline"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to My Bookings
        </Link>

        {/* Header Card */}
        <div className="bg-gradient-to-r from-[#00236f] to-[#1e3a8a] rounded-2xl p-8 mb-6 text-white shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${statusBadge.bg} ${statusBadge.color} mb-4`}>
                <StatusIcon className="w-4 h-4" />
                <span className="text-sm font-bold">{statusBadge.label}</span>
              </div>
              <h1 className="text-3xl font-black mb-2">Booking Details</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 opacity-80" />
                  <span className="text-lg font-mono font-bold">PNR: {booking.pnr}</span>
                </div>
                <div className="h-6 w-px bg-white/30" />
                <div className="flex items-center gap-2">
                  <Plane className="w-5 h-5 opacity-80" />
                  <span className="font-semibold">{booking.flight?.flightNumber}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80 mb-1">Total Fare</p>
              <p className="text-4xl font-black">₹{booking.totalFare.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Flight Details */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#00236f] mb-6 flex items-center gap-2">
                <Plane className="w-6 h-6" />
                Flight Information
              </h2>

              <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Departure</p>
                    <p className="text-4xl font-black text-[#00236f] mb-2">
                      {booking.departureAirport?.iataCode}
                    </p>
                    <p className="text-lg font-bold text-slate-700 mb-1">
                      {booking.departureAirport?.city}
                    </p>
                    <p className="text-sm text-slate-600 mb-3">
                      {booking.departureAirport?.name}
                    </p>
                    <div className="flex items-center gap-2 text-[#00236f]">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-bold">
                        {booking.flight && formatDate(booking.flight.departureTime)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[#00236f] mt-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-lg font-bold">
                        {booking.flight && formatTime(booking.flight.departureTime)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center px-6">
                    <Plane className="w-10 h-10 text-[#00236f] mb-3 rotate-90" />
                    <div className="w-32 h-0.5 bg-slate-300 mb-3" />
                    <p className="text-sm font-bold text-slate-600">
                      {booking.airline?.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {booking.flight?.aircraftType}
                    </p>
                  </div>

                  <div className="flex-1 text-right">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Arrival</p>
                    <p className="text-4xl font-black text-[#00236f] mb-2">
                      {booking.arrivalAirport?.iataCode}
                    </p>
                    <p className="text-lg font-bold text-slate-700 mb-1">
                      {booking.arrivalAirport?.city}
                    </p>
                    <p className="text-sm text-slate-600 mb-3">
                      {booking.arrivalAirport?.name}
                    </p>
                    <div className="flex items-center justify-end gap-2 text-[#00236f]">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-bold">
                        {booking.flight && formatDate(booking.flight.arrivalTime)}
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-2 text-[#00236f] mt-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-lg font-bold">
                        {booking.flight && formatTime(booking.flight.arrivalTime)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-slate-600 mb-2">
                    <Users className="w-5 h-5" />
                    <span className="text-sm font-bold">Passengers</span>
                  </div>
                  <p className="text-2xl font-black text-[#00236f]">{booking.numberOfPassengers}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-slate-600 mb-2">
                    <MapPin className="w-5 h-5" />
                    <span className="text-sm font-bold">Seats</span>
                  </div>
                  <p className="text-lg font-black text-[#00236f]">
                    {seatLabels}
                  </p>
                </div>
              </div>
            </div>

            {/* Passenger Details */}
            {booking.passengers && booking.passengers.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-[#00236f] mb-4 flex items-center gap-2">
                  <Users className="w-6 h-6" />
                  Passenger Details
                </h2>
                <div className="space-y-4">
                  {booking.passengers.map((passenger, index) => (
                    <div key={passenger.id} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-slate-800">Passenger {index + 1}</h3>
                        <span className="text-sm font-bold text-[#00236f] bg-blue-50 px-3 py-1 rounded-full">
                          Seat {passenger.seatNumber}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500 mb-1">Name</p>
                          <p className="font-bold text-slate-800">
                            {passenger.firstName} {passenger.lastName}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-1">Passport</p>
                          <p className="font-bold text-slate-800">{passenger.passportNumber}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-1">Nationality</p>
                          <p className="font-bold text-slate-800">{passenger.nationality}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-1">Date of Birth</p>
                          <p className="font-bold text-slate-800">
                            {new Date(passenger.dateOfBirth).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Fare Breakdown */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#00236f] mb-4 flex items-center gap-2">
                <CreditCard className="w-6 h-6" />
                Fare Breakdown
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-600">Base Fare</span>
                  <span className="font-bold text-slate-800">₹{booking.baseFare.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-600">Taxes & Fees</span>
                  <span className="font-bold text-slate-800">₹{booking.taxes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-600">Ancillary Charges</span>
                  <span className="font-bold text-slate-800">₹{booking.ancillaryCharges.toLocaleString()}</span>
                </div>
                <div className="border-t-2 border-slate-200 pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-[#00236f]">Total Amount</span>
                    <span className="text-2xl font-black text-[#00236f]">₹{booking.totalFare.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {isUpcoming && (
                  <button
                    onClick={handleDownloadTicket}
                    disabled={downloadingTicket}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#00236f] to-[#1e3a8a] text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {downloadingTicket ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        Download E-Ticket
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Booking Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4">Booking Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-slate-500 mb-1">Booking ID</p>
                  <p className="font-bold text-slate-800">#{booking.id}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Booked On</p>
                  <p className="font-bold text-slate-800">{formatDate(booking.bookingDate)}</p>
                </div>
                {booking.checkedIn && booking.checkedInAt && (
                  <div>
                    <p className="text-slate-500 mb-1">Checked In</p>
                    <p className="font-bold text-green-600">
                      {formatDate(booking.checkedInAt)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Support Card */}
            <div className="bg-gradient-to-br from-blue-50 to-slate-50 rounded-2xl p-6 border border-blue-100">
              <h3 className="font-bold text-slate-800 mb-3">Need Help?</h3>
              <p className="text-sm text-slate-600 mb-4">
                Our support team is available 24/7 to assist you with your booking.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-4 h-4 text-[#00236f]" />
                  <span>support@skybooker.com</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-4 h-4 text-[#00236f]" />
                  <span>+91-1800-123-4567</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
