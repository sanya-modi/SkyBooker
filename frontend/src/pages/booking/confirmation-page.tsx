import { gsap } from 'gsap'
import { CheckCircle2, Download, Home, Printer, Share2 } from 'lucide-react'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BoardingPassTicket } from '../../components/bookings/boarding-pass-ticket'
import { MobileDock } from '../../components/booking/mobile-dock'
import { TopNav } from '../../components/booking/top-nav'
import { useBookingFlow } from '../../context/booking-flow-context'
import { downloadBoardingPassSection, openBoardingPassWindow, printBoardingPassSection } from '../../lib/boarding-pass-download'

export function ConfirmationPage() {
  const navigate = useNavigate()
  const {
    confirmedBooking,
    passengers,
    selectedFlight,
    selectedSeatIds,
    resetFlow,
  } = useBookingFlow()

  const [emailSent, setEmailSent] = useState(false)

  const successRef = useRef<HTMLDivElement>(null)
  const ticketGroupRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    gsap.fromTo(successRef.current, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' })
    gsap.fromTo(ticketGroupRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, delay: 0.3, ease: 'power3.out' })
  }, [])

  useEffect(() => {
    const t1 = setTimeout(() => setEmailSent(true), 1500)
    return () => {
      clearTimeout(t1)
    }
  }, [])

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

  const travelerSeats = confirmedBooking.selectedSeats?.length ? confirmedBooking.selectedSeats : selectedSeatIds
  const ticketPassengers = passengers.slice(0, Math.max(travelerSeats.length, confirmedBooking.numberOfPassengers, 1))

  const handleDownloadTicket = async () => {
    const elements = Array.from(ticketGroupRef.current?.querySelectorAll('[data-boarding-pass-card="true"]') ?? []) as HTMLElement[]

    try {
      const previewWindow = openBoardingPassWindow()
      await downloadBoardingPassSection(`Boarding Pass ${confirmedBooking.pnr}`, elements, previewWindow)
    } catch (error) {
      console.error('Error downloading boarding pass:', error)
      window.alert(error instanceof Error ? error.message : 'Failed to download boarding pass. Please try again.')
    }
  }

  const handlePrintTicket = async () => {
    const elements = Array.from(ticketGroupRef.current?.querySelectorAll('[data-boarding-pass-card="true"]') ?? []) as HTMLElement[]

    try {
      const previewWindow = openBoardingPassWindow()
      await printBoardingPassSection(`Boarding Pass ${confirmedBooking.pnr}`, elements, previewWindow)
    } catch (error) {
      console.error('Error printing boarding pass:', error)
      window.alert(error instanceof Error ? error.message : 'Failed to print boarding pass. Please try again.')
    }
  }

  const handleShareTicket = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'SkyBooker E-Ticket',
          text: `My flight booking - PNR: ${confirmedBooking.pnr}`,
          url: window.location.href,
        })
      } catch {
        // ignore share cancellation
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <TopNav />

      <div className="flex-1 max-w-[1100px] w-full mx-auto px-4 sm:px-6 py-8 pt-[80px]">
        <div ref={successRef} className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500 shadow-lg shadow-green-500/30 mb-4">
            <CheckCircle2 size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 mb-2">Booking Confirmed!</h1>
          <p className="text-slate-600 text-lg">Your journey is all set. Have a great flight!</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm font-medium text-slate-500">
            <span className={emailSent ? 'text-green-600' : ''}>Email confirmation sent</span>
          </div>
        </div>

        <div ref={ticketGroupRef} className="mb-6">
          {ticketPassengers.map((entry, index) => (
            <div data-boarding-pass-card="true" key={`${entry.passportNumber || entry.firstName}-${index}`}>
              <BoardingPassTicket
                flight={selectedFlight}
                passenger={{ firstName: entry.firstName, lastName: entry.lastName }}
                pnr={confirmedBooking.pnr}
                seatNumber={travelerSeats[index] ?? '—'}
              />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <button
            onClick={handleDownloadTicket}
            className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-300 shadow-sm rounded-lg font-bold text-slate-700 hover:bg-slate-50 transition-all text-sm"
          >
            <Download size={18} />
            Download PDF
          </button>
          <button
            onClick={handlePrintTicket}
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
            onClick={() => {
              resetFlow()
              navigate('/')
            }}
            className="flex items-center gap-2 px-6 py-3 bg-[#3b82f6] text-white rounded-lg font-bold hover:bg-[#2563eb] transition-all text-sm"
          >
            <Home size={18} />
            Back to Home
          </button>
        </div>
      </div>

      <MobileDock active="confirmation" />
    </div>
  )
}
