// export { default } from '../app/checkin/page'
import { useState, useEffect } from "react"
import { Link, useNavigate } from 'react-router-dom'
import { CustomerHeader } from "@/components/layout/customer-header"
import {
  ArrowLeft,
  Plane,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Download,
  Loader2,
  AlertCircle,
  Search,
  FileText
} from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { bookingApi, seatApi, type BookingResult, type SeatResult } from "@/services/api"

export default function CheckInPage() {
  const navigate = useNavigate()
  const { user, isLoggedIn } = useAuth()
  const [step, setStep] = useState<'search' | 'select-seat' | 'success'>('search')
  const [pnr, setPnr] = useState('')
  const [booking, setBooking] = useState<BookingResult | null>(null)
  const [seats, setSeats] = useState<SeatResult[]>([])
  const [selectedSeat, setSelectedSeat] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [checkingIn, setCheckingIn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login')
    }
  }, [isLoggedIn, navigate])

  const searchBooking = async () => {
    if (!pnr.trim()) {
      setError('Please enter a valid PNR')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const bookingData = await bookingApi.getByPnr(pnr.toUpperCase())

      // Check if booking is eligible for check-in
      if (bookingData.status.toUpperCase() !== 'CONFIRMED') {
        setError('Only confirmed bookings can be checked in')
        return
      }

      if (bookingData.checkedIn) {
        setError('You have already checked in for this flight')
        return
      }

      // Check if check-in window is open (24 hours before flight)
      // For demo purposes, we'll allow check-in anytime
      
      setBooking(bookingData)
      
      // Load available seats
      const availableSeats = await seatApi.getAvailable(bookingData.flightId)
      setSeats(availableSeats)
      
      // Pre-select current seat if exists
      if (bookingData.selectedSeats && bookingData.selectedSeats.length > 0) {
        setSelectedSeat(bookingData.selectedSeats[0])
      }
      
      setStep('select-seat')
    } catch (err) {
      console.error('Error searching booking:', err)
      setError(err instanceof Error ? err.message : 'Booking not found. Please check your PNR.')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckIn = async () => {
    if (!booking || !selectedSeat) return

    try {
      setCheckingIn(true)
      setError(null)

      // Perform check-in with selected seat
      await bookingApi.checkIn(booking.id, selectedSeat)

      setStep('success')
    } catch (err) {
      console.error('Error checking in:', err)
      setError(err instanceof Error ? err.message : 'Failed to check in. Please try again.')
    } finally {
      setCheckingIn(false)
    }
  }

  const downloadBoardingPass = async () => {
    if (!booking) return

    try {
      const token = localStorage.getItem('skybooker_token')
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/bookings/${booking.id}/boarding-pass`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      })
      if (!response.ok) throw new Error('Failed to download boarding pass')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `BoardingPass-${booking.pnr}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error downloading boarding pass:', err)
      alert('Failed to download boarding pass. Please try again.')
    }
  }

  const getSeatClass = (seat: SeatResult) => {
    if (seat.seatNumber === selectedSeat) {
      return 'bg-[#00236f] text-white border-[#00236f]'
    }
    if (seat.status === 'BOOKED') {
      return 'bg-slate-200 text-slate-400 cursor-not-allowed'
    }
    return 'bg-white text-slate-700 hover:bg-blue-50 hover:border-[#00236f] cursor-pointer'
  }

  const renderSeatMap = () => {
    if (seats.length === 0) return null

    // Group seats by row
    const seatsByRow: { [key: string]: SeatResult[] } = {}
    seats.forEach(seat => {
      const row = seat.seatNumber.replace(/[A-Z]/g, '')
      if (!seatsByRow[row]) {
        seatsByRow[row] = []
      }
      seatsByRow[row].push(seat)
    })

    return (
      <div className="space-y-2">
        {Object.entries(seatsByRow).map(([row, rowSeats]) => (
          <div key={row} className="flex items-center gap-2">
            <span className="w-8 text-sm font-bold text-slate-600">{row}</span>
            <div className="flex gap-2">
              {rowSeats.sort((a, b) => a.seatNumber.localeCompare(b.seatNumber)).map(seat => (
                <button
                  key={seat.id}
                  onClick={() => seat.status === 'AVAILABLE' && setSelectedSeat(seat.seatNumber)}
                  disabled={seat.status === 'BOOKED'}
                  className={`w-12 h-12 rounded-lg border-2 font-bold text-sm transition-all ${getSeatClass(seat)}`}
                >
                  {seat.seatNumber.replace(/[0-9]/g, '')}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <CustomerHeader />

      <main className="max-w-4xl mx-auto px-4 md:px-6 py-8 pt-24">
        {/* Back Button */}
        <Link
          to="/bookings"
          className="inline-flex items-center gap-2 text-[#00236f] font-bold mb-6 hover:underline"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Bookings
        </Link>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-[#00236f] to-[#1e3a8a] rounded-full flex items-center justify-center mx-auto mb-4">
            <Plane className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-[#00236f] mb-2">Web Check-in</h1>
          <p className="text-slate-600">Check in online and choose your preferred seat</p>
        </div>

        {/* Step 1: Search Booking */}
        {step === 'search' && (
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Enter Your Booking Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  PNR / Booking Reference
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={pnr}
                    onChange={(e) => setPnr(e.target.value.toUpperCase())}
                    placeholder="Enter 6-digit PNR (e.g., ABC123)"
                    maxLength={6}
                    className="w-full pl-10 pr-4 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00236f] focus:border-transparent font-mono text-lg"
                    onKeyPress={(e) => e.key === 'Enter' && searchBooking()}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              )}

              <button
                onClick={searchBooking}
                disabled={loading || !pnr.trim()}
                className="w-full px-6 py-4 bg-gradient-to-r from-[#00236f] to-[#1e3a8a] text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    Find Booking
                  </>
                )}
              </button>
            </div>

            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-bold text-blue-900 mb-2">Check-in Information</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Web check-in opens 24 hours before departure</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Check-in closes 1 hour before departure</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>You can select or change your seat during check-in</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Download your boarding pass after check-in</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Step 2: Select Seat */}
        {step === 'select-seat' && booking && (
          <div className="space-y-6">
            {/* Booking Info */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800">Booking Details</h2>
                <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-bold text-green-700">Confirmed</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">PNR</p>
                  <p className="font-mono font-bold text-slate-800">{booking.pnr}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Passengers</p>
                  <p className="font-bold text-slate-800">{booking.numberOfPassengers}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Flight</p>
                  <p className="font-bold text-slate-800">Flight #{booking.flightId}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Current Seat</p>
                  <p className="font-bold text-slate-800">
                    {booking.selectedSeats?.join(', ') || 'Not assigned'}
                  </p>
                </div>
              </div>
            </div>

            {/* Seat Selection */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Select Your Seat</h2>
              
              {/* Legend */}
              <div className="flex flex-wrap gap-6 mb-6 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white border-2 border-slate-300 rounded-lg" />
                  <span className="text-sm text-slate-600">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-[#00236f] border-2 border-[#00236f] rounded-lg" />
                  <span className="text-sm text-slate-600">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-200 border-2 border-slate-200 rounded-lg" />
                  <span className="text-sm text-slate-600">Occupied</span>
                </div>
              </div>

              {/* Seat Map */}
              <div className="bg-slate-50 rounded-xl p-6 overflow-x-auto">
                <div className="mb-4 text-center">
                  <div className="inline-flex items-center gap-2 bg-slate-200 px-4 py-2 rounded-lg">
                    <Plane className="w-5 h-5 text-slate-600" />
                    <span className="text-sm font-bold text-slate-700">Front of Aircraft</span>
                  </div>
                </div>
                {renderSeatMap()}
              </div>

              {selectedSeat && (
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-800 mb-1">Selected Seat</p>
                      <p className="text-2xl font-black text-[#00236f]">{selectedSeat}</p>
                    </div>
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setStep('search')
                    setBooking(null)
                    setSelectedSeat(null)
                    setPnr('')
                  }}
                  className="flex-1 px-6 py-4 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCheckIn}
                  disabled={checkingIn || !selectedSeat}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-[#00236f] to-[#1e3a8a] text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {checkingIn ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Checking In...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Complete Check-in
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 'success' && booking && (
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-300">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>

            <h2 className="text-3xl font-black text-slate-800 mb-2">Check-in Successful!</h2>
            <p className="text-slate-600 mb-8">
              You're all set for your flight. Download your boarding pass below.
            </p>

            <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-6 mb-8">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-slate-500 mb-1">PNR</p>
                  <p className="text-lg font-mono font-bold text-slate-800">{booking.pnr}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Seat</p>
                  <p className="text-lg font-bold text-[#00236f]">{selectedSeat}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={downloadBoardingPass}
                className="w-full px-6 py-4 bg-gradient-to-r from-[#00236f] to-[#1e3a8a] text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download Boarding Pass
              </button>
              
              <Link
                to="/bookings"
                className="block w-full px-6 py-4 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
              >
                View My Bookings
              </Link>
            </div>

            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <h3 className="font-bold text-blue-900 mb-2">Important Information</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Please arrive at the airport at least 2 hours before departure</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Keep your boarding pass and ID ready for security check</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Check your email for boarding pass and flight updates</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}


