import { gsap } from 'gsap'
import { CheckCircle2, Download, Mail, MessageSquare, Plane, Home, Share2, Printer } from 'lucide-react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
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
  return new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

function fmtTime(v: string) {
  return new Date(v).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
}

/* ── Field label + value pair ── */
function Field({ label, value, valueClass = '' }: { label: string; value: string; valueClass?: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className={`font-black text-slate-800 leading-tight ${valueClass}`}>{value}</p>
    </div>
  )
}

export function ConfirmationPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    confirmedBooking,
    selectedFlight,
    selectedSeatId,
    selectedMealId,
    selectedBaggageId,
    passenger,
    resetFlow,
  } = useBookingFlow()

  const [qrCode, setQrCode] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [smsSent, setSmsSent] = useState(false)

  const successRef = useRef<HTMLDivElement>(null)
  const ticketRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    gsap.fromTo(successRef.current, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' })
    gsap.fromTo(ticketRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.3, ease: 'power3.out' })
  }, [])

  /* Generate QR Code with Passenger and Flight Details */
  useEffect(() => {
    if (confirmedBooking?.pnr && selectedFlight && passenger) {
      const qrData = `Name: ${passenger.firstName} ${passenger.lastName}\nPNR: ${confirmedBooking.pnr}\nFlight: ${selectedFlight.flightNumber}\nRoute: ${selectedFlight.departureAirport?.iataCode} to ${selectedFlight.arrivalAirport?.iataCode}`;
      
      QRCode.toDataURL(qrData, { width: 220, margin: 1, color: { dark: '#0f172a', light: '#ffffff' } })
        .then(setQrCode)
        .catch(console.error)
    }
  }, [confirmedBooking, selectedFlight, passenger])

  useEffect(() => {
    const t1 = setTimeout(() => setEmailSent(true), 1500)
    const t2 = setTimeout(() => setSmsSent(true), 2000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  /* derive a stable gate from PNR */
  const gate = useMemo(() => {
    if (!confirmedBooking?.pnr || !selectedFlight?.flightNumber) return 'A1'
    const num = (confirmedBooking.pnr.charCodeAt(0) % 9) + 1
    return `${selectedFlight.flightNumber.charAt(0)}${num}`
  }, [confirmedBooking, selectedFlight])

  if (!confirmedBooking || !selectedFlight) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600 mb-4">No booking found</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-[#3b82f6] text-white rounded-xl font-semibold hover:bg-[#2563eb] transition-all"
          >
            Go to Home
          </button>
        </div>
      </div>
    )
  }

  const handleDownloadTicket = () => window.print()
  const handleShareTicket = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SkyBooker E-Ticket',
          text: `My flight booking - PNR: ${confirmedBooking.pnr}`,
          url: window.location.href,
        })
      } catch {}
    }
  }

  /* ─────────────────────────────────── */
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <TopNav />

      <div className="flex-1 max-w-[1100px] w-full mx-auto px-4 sm:px-6 py-8 pt-[80px]">

        {/* ── Success Badge ── */}
        <div ref={successRef} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500 shadow-lg shadow-green-500/30 mb-4">
            <CheckCircle2 size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 mb-2">Booking Confirmed! 🎉</h1>
          <p className="text-slate-600 text-lg">Your journey is all set. Have a great flight!</p>
        </div>

        {/* ══════════════════════════════════════
             BOARDING PASS TICKET UI
        ══════════════════════════════════════ */}
        <div ref={ticketRef} className="rounded-xl shadow-xl overflow-hidden mb-6 flex flex-col md:flex-row border z-10 border-slate-200" >
          
          {/* ── LEFT / MAIN SECTION ── */}
          <div className="flex-1 flex flex-col min-w-0">
            
            {/* Main Header */}
            <div className="bg-[#3b82f6] px-8 py-4 flex items-center">
              <Plane size={24} className="text-white rotate-45 fill-white mr-3" />
              <span className="text-white font-bold tracking-widest text-lg sm:text-xl uppercase">
                Boarding Pass
              </span>
            </div>

            {/* Main Body (Plain White) */}
            <div className="flex-1 flex relative bg-white" style={{ backgroundImage: `url('/BlankMap-World_gray.svg')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundBlendMode: 'multiply', backgroundColor: 'rgba(255,255,255,0.95)' }}>
              
              {/* Ticket Details */}
              <div className="flex-1 p-8 sm:p-10 flex flex-col justify-between">

                {/* Info Row 1 */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                  <Field label="Passenger" value={`${passenger.firstName} ${passenger.lastName}`} valueClass="text-sm truncate" />
                  <Field label="Flight"    value={selectedFlight.flightNumber}                   valueClass="text-sm" />
                  <Field label="Date"      value={fmtDate(selectedFlight.departureTime)}         valueClass="text-sm" />
                  <Field label="Seat No."  value={selectedSeatId ?? '—'}                         valueClass="text-sm" />
                </div>

                {/* Info Row 2 (Large Source & Destination) */}
                <div className="flex items-center justify-center gap-6 sm:gap-12 py-12">
                  <p className="text-6xl sm:text-7xl font-black text-slate-800 tracking-widest">
                    {selectedFlight.departureAirport?.iataCode}
                  </p>
                  <Plane size={48} className="text-slate-800 rotate-45 fill-slate-800 shrink-0" />
                  <p className="text-6xl sm:text-7xl font-black text-slate-800 tracking-widest">
                    {selectedFlight.arrivalAirport?.iataCode}
                  </p>
                </div>

                {/* Info Row 3 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] font-bold text-[#3b82f6] uppercase tracking-widest mb-1">Gate</p>
                    <p className="text-3xl font-black text-slate-800">{gate}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#3b82f6] uppercase tracking-widest mb-1">Boarding Time</p>
                    <p className="text-3xl font-black text-slate-800">{fmtTime(selectedFlight.departureTime)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── PERFORATED DIVIDER ── */}
          <div className="hidden md:flex flex-col w-0 border-r-2 border-dashed border-slate-300 relative z-10 bg-white" />

          {/* ── RIGHT / STUB SECTION ── */}
          <div className="w-full md:w-80 flex flex-col shrink-0 border-t-2 border-dashed border-slate-300 md:border-t-0">
            
            {/* Stub Header */}
            <div className="bg-[#3b82f6] px-6 py-4 flex items-center">
              <span className="text-white font-bold tracking-widest text-lg sm:text-xl uppercase">
                Boarding Pass
              </span>
            </div>

            {/* Stub Body */}
            <div className="flex-1 bg-white p-6 sm:p-8 flex flex-col justify-between">
              <div className="space-y-5">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Passenger Name</p>
                  <p className="text-sm font-black text-slate-800 leading-tight uppercase">{passenger.firstName}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3 mb-0.5">Passenger Surname</p>
                  <p className="text-sm font-black text-slate-800 leading-tight uppercase">{passenger.lastName}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Route</p>
                  <p className="text-sm font-black text-slate-800">
                    {selectedFlight.departureAirport?.iataCode} <span className="text-slate-400 mx-1">→</span> {selectedFlight.arrivalAirport?.iataCode}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Field label="Seat No." value={selectedSeatId ?? '—'} valueClass="text-sm" />
                  <Field label="Boarding Time" value={fmtTime(selectedFlight.departureTime)} valueClass="text-sm" />
                </div>
              </div>

              {/* Functional QR Code */}
              <div className="mt-8 flex justify-center w-full">
                {qrCode ? (
                  <img src={qrCode} alt="Scan for details" className="w-32 h-32 rounded-lg border border-slate-200" />
                ) : (
                  <div className="w-32 h-32 rounded-lg bg-slate-100 animate-pulse border border-slate-200" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Action Buttons ── */}
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <button
            onClick={handleDownloadTicket}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-300 shadow-sm rounded-lg font-bold text-slate-700 hover:bg-slate-50 transition-all text-sm"
          >
            <Download size={18} />
            Download PDF
          </button>
          <button
            onClick={handleDownloadTicket}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-300 shadow-sm rounded-lg font-bold text-slate-700 hover:bg-slate-50 transition-all text-sm"
          >
            <Printer size={18} />
            Print Ticket
          </button>
          <button
            onClick={handleShareTicket}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-300 shadow-sm rounded-lg font-bold text-slate-700 hover:bg-slate-50 transition-all text-sm"
          >
            <Share2 size={18} />
            Share
          </button>
          <button
            onClick={() => { resetFlow(); navigate('/') }}
            className="flex items-center gap-2 px-6 py-3 bg-[#3b82f6] text-white rounded-lg font-bold hover:bg-[#2563eb] transition-all text-sm ml-auto"
          >
            <Home size={18} />
            Back to Home
          </button>
        </div>

      </div>
    </div>
  )
}