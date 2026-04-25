import { gsap } from 'gsap'
import { CheckCircle2, Download, Mail, MessageSquare, Plane, MapPin, Calendar, Clock, User, CreditCard, Luggage, UtensilsCrossed, Home, Share2, Printer } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import QRCode from 'qrcode'
import { TopNav } from '../../components/booking/top-nav'
import { MobileDock } from '../../components/booking/mobile-dock'
import { useBookingFlow } from '../../context/booking-flow-context'
import { useAuth } from '../../context/auth-context'
import { MEALS, BAGGAGE } from '../../components/addons/addons-section'

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

function fmtDate(v: string) {
  return new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtTime(v: string) {
  return new Date(v).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function ConfirmationPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { confirmedBooking, selectedFlight, selectedSeatId, selectedMealId, selectedBaggageId, passenger, resetFlow } = useBookingFlow()
  const [qrCode, setQrCode] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [smsSent, setSmsSent] = useState(false)
  
  const successRef = useRef<HTMLDivElement>(null)
  const ticketRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    gsap.fromTo(successRef.current, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' })
    gsap.fromTo(ticketRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.3, ease: 'power3.out' })
  }, [])

  useEffect(() => {
    if (confirmedBooking?.pnr) {
      QRCode.toDataURL(`SKYBOOKER-${confirmedBooking.pnr}`, { width: 200, margin: 1 })
        .then(setQrCode)
        .catch(console.error)
    }
  }, [confirmedBooking])

  useEffect(() => {
    // Simulate sending email and SMS
    const timer1 = setTimeout(() => setEmailSent(true), 1500)
    const timer2 = setTimeout(() => setSmsSent(true), 2000)
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  if (!confirmedBooking || !selectedFlight) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">No booking found</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-[#00236f] text-white rounded-xl font-semibold hover:bg-[#1e3a8a] transition-all"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  const meal = MEALS.find(m => m.id === selectedMealId)
  const baggage = BAGGAGE.find(b => b.id === selectedBaggageId)

  const handleDownloadTicket = () => {
    window.print()
  }

  const handleShareTicket = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SkyBooker E-Ticket',
          text: `My flight booking - PNR: ${confirmedBooking.pnr}`,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <TopNav />

      <div className="max-w-[1000px] mx-auto px-6 py-8 pt-[80px]">
        {/* Success Animation */}
        <div ref={successRef} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-lg shadow-green-500/30 mb-4">
            <CheckCircle2 size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 mb-2">Booking Confirmed! 🎉</h1>
          <p className="text-slate-600 text-lg">Your journey is all set. Have a great flight!</p>
        </div>

        {/* Notification Status */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
            emailSent ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-white'
          }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              emailSent ? 'bg-green-500' : 'bg-slate-200'
            }`}>
              <Mail size={18} className={emailSent ? 'text-white' : 'text-slate-400'} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Email Sent</p>
              <p className="text-xs text-slate-500">{emailSent ? user?.email : 'Sending...'}</p>
            </div>
          </div>
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
            smsSent ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-white'
          }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              smsSent ? 'bg-green-500' : 'bg-slate-200'
            }`}>
              <MessageSquare size={18} className={smsSent ? 'text-white' : 'text-slate-400'} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">SMS Sent</p>
              <p className="text-xs text-slate-500">{smsSent ? passenger.phoneNumber : 'Sending...'}</p>
            </div>
          </div>
        </div>

        {/* Modern E-Ticket */}
        <div ref={ticketRef} className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-6">
          {/* Ticket Header */}
          <div className="bg-gradient-to-r from-[#00236f] via-[#1e3a8a] to-[#1d4ed8] px-8 py-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />
            
            <div className="relative flex justify-between items-start">
              <div>
                <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-2">E-Ticket</p>
                <h2 className="text-white text-2xl font-black mb-1">SkyBooker Airlines</h2>
                <p className="text-blue-200 text-sm">Booking Reference: <span className="text-white font-bold">{confirmedBooking.pnr}</span></p>
              </div>
              <div className="text-right">
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl">
                  <p className="text-blue-200 text-xs mb-1">Status</p>
                  <p className="text-white font-black text-lg">CONFIRMED</p>
                </div>
              </div>
            </div>
          </div>

          {/* Flight Route */}
          <div className="px-8 py-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-slate-500 text-xs font-semibold mb-1">FROM</p>
                <p className="text-3xl font-black text-[#00236f] mb-1">{selectedFlight.departureAirport?.iataCode}</p>
                <p className="text-sm font-semibold text-slate-700">{selectedFlight.departureAirport?.city}</p>
                <p className="text-xs text-slate-500">{selectedFlight.departureAirport?.name}</p>
              </div>

              <div className="flex flex-col items-center px-6">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-2">
                  <Plane size={28} className="text-[#00236f]" />
                </div>
                <div className="w-32 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
                <p className="text-xs font-bold text-slate-500 mt-2">{selectedFlight.flightNumber}</p>
              </div>

              <div className="flex-1 text-right">
                <p className="text-slate-500 text-xs font-semibold mb-1">TO</p>
                <p className="text-3xl font-black text-[#00236f] mb-1">{selectedFlight.arrivalAirport?.iataCode}</p>
                <p className="text-sm font-semibold text-slate-700">{selectedFlight.arrivalAirport?.city}</p>
                <p className="text-xs text-slate-500">{selectedFlight.arrivalAirport?.name}</p>
              </div>
            </div>
          </div>

          {/* Flight Details */}
          <div className="px-8 py-6 bg-slate-50 border-b border-slate-100">
            <div className="grid grid-cols-4 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar size={16} className="text-[#00236f]" />
                  <p className="text-xs font-bold text-slate-500 uppercase">Date</p>
                </div>
                <p className="text-sm font-black text-slate-800">{fmtDate(selectedFlight.departureTime)}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={16} className="text-[#00236f]" />
                  <p className="text-xs font-bold text-slate-500 uppercase">Departure</p>
                </div>
                <p className="text-sm font-black text-slate-800">{fmtTime(selectedFlight.departureTime)}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={16} className="text-[#00236f]" />
                  <p className="text-xs font-bold text-slate-500 uppercase">Arrival</p>
                </div>
                <p className="text-sm font-black text-slate-800">{fmtTime(selectedFlight.arrivalTime)}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin size={16} className="text-[#00236f]" />
                  <p className="text-xs font-bold text-slate-500 uppercase">Seat</p>
                </div>
                <p className="text-sm font-black text-slate-800">{selectedSeatId}</p>
              </div>
            </div>
          </div>

          {/* Passenger & Add-ons */}
          <div className="px-8 py-6 border-b border-slate-100">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <User size={18} className="text-[#00236f]" />
                  <p className="text-sm font-bold text-slate-700 uppercase">Passenger Details</p>
                </div>
                <p className="text-lg font-black text-slate-800 mb-1">
                  {passenger.firstName} {passenger.lastName}
                </p>
                <p className="text-sm text-slate-600">{passenger.email}</p>
                <p className="text-sm text-slate-600">{passenger.phoneNumber}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard size={18} className="text-[#00236f]" />
                  <p className="text-sm font-bold text-slate-700 uppercase">Add-ons</p>
                </div>
                {meal && (
                  <div className="flex items-center gap-2 mb-2">
                    <UtensilsCrossed size={14} className="text-slate-500" />
                    <p className="text-sm text-slate-700">{meal.name} - {fmt(meal.price)}</p>
                  </div>
                )}
                {baggage && (
                  <div className="flex items-center gap-2">
                    <Luggage size={14} className="text-slate-500" />
                    <p className="text-sm text-slate-700">Extra Baggage {baggage.weight} - {fmt(baggage.price)}</p>
                  </div>
                )}
                {!meal && !baggage && (
                  <p className="text-sm text-slate-500">No add-ons selected</p>
                )}
              </div>
            </div>
          </div>

          {/* QR Code & Fare */}
          <div className="px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-6">
              {qrCode && (
                <div className="bg-white p-3 rounded-xl border-2 border-slate-200">
                  <img src={qrCode} alt="QR Code" className="w-24 h-24" />
                  <p className="text-xs text-center text-slate-500 mt-2 font-semibold">Scan at Airport</p>
                </div>
              )}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Booking ID</p>
                <p className="text-lg font-black text-slate-800 mb-3">{confirmedBooking.id}</p>
                <p className="text-xs text-slate-500">Keep this QR code handy for</p>
                <p className="text-xs text-slate-500">quick check-in at the airport</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-500 uppercase mb-2">Total Fare</p>
              <p className="text-3xl font-black text-[#00236f] mb-1">{fmt(confirmedBooking.totalFare)}</p>
              <p className="text-xs text-slate-500">Inclusive of all taxes</p>
            </div>
          </div>

          {/* Ticket Footer */}
          <div className="bg-gradient-to-r from-slate-100 to-slate-50 px-8 py-4 border-t border-slate-200">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <p>© 2024 SkyBooker Airlines. All rights reserved.</p>
              <p>For support: support@skybooker.com | +91-1800-123-4567</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <button
            onClick={handleDownloadTicket}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-700 hover:border-[#00236f] hover:bg-blue-50 hover:text-[#00236f] transition-all"
          >
            <Download size={20} />
            Download PDF
          </button>
          <button
            onClick={handleDownloadTicket}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-700 hover:border-[#00236f] hover:bg-blue-50 hover:text-[#00236f] transition-all"
          >
            <Printer size={20} />
            Print Ticket
          </button>
          <button
            onClick={handleShareTicket}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-slate-200 rounded-xl font-bold text-slate-700 hover:border-[#00236f] hover:bg-blue-50 hover:text-[#00236f] transition-all"
          >
            <Share2 size={20} />
            Share
          </button>
        </div>

        {/* Back to Home */}
        <button
          onClick={() => {
            resetFlow()
            navigate('/')
          }}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#00236f] to-[#1e3a8a] text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/30 transition-all"
        >
          <Home size={20} />
          Back to Home
        </button>
      </div>
    </div>
  )
}
