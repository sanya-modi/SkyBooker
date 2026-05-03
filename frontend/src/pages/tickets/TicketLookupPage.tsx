import { useMemo, useRef, useState } from 'react'
import { Search, Ticket, AlertCircle, Loader2, Download } from 'lucide-react'
import { TopNav } from '@/components/booking/top-nav'
import { BoardingPassTicket } from '@/components/bookings/boarding-pass-ticket'
import { downloadBoardingPassSection } from '@/lib/boarding-pass-download'
import { getAllAirportsCached, ticketApi, type Airport, type TicketLookupResult } from '@/services/api'

export function TicketLookupPage() {
  const [pnr, setPnr] = useState('')
  const [ticket, setTicket] = useState<TicketLookupResult | null>(null)
  const [airports, setAirports] = useState<Airport[]>([])
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState('')
  const ticketGroupRef = useRef<HTMLDivElement>(null)

  const departureAirport = useMemo(
    () => airports.find((airport) => airport.id === ticket?.flight.departureAirportId),
    [airports, ticket],
  )
  const arrivalAirport = useMemo(
    () => airports.find((airport) => airport.id === ticket?.flight.arrivalAirportId),
    [airports, ticket],
  )

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const normalizedPnr = pnr.trim().toUpperCase()
    if (!normalizedPnr) {
      setError('Invalid PNR')
      setTicket(null)
      return
    }

    try {
      setLoading(true)
      setError('')
      const [ticketResult, airportResults] = await Promise.all([
        ticketApi.getByPnr(normalizedPnr),
        getAllAirportsCached(),
      ])
      setPnr(normalizedPnr)
      setTicket(ticketResult)
      setAirports(airportResults)
    } catch {
      setTicket(null)
      setError('Invalid PNR')
    } finally {
      setLoading(false)
    }
  }

  async function handleDownload() {
    if (!ticket) return

    try {
      setDownloading(true)
      const elements = Array.from(ticketGroupRef.current?.querySelectorAll('[data-boarding-pass-card="true"]') ?? []) as HTMLElement[]
      await downloadBoardingPassSection(`Boarding Pass ${ticket.booking.pnr}`, elements)
    } catch {
      setError('Unable to download ticket right now.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <TopNav />

      <main className="max-w-5xl mx-auto px-4 pt-24 pb-10">
        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 mb-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
              <Ticket className="w-6 h-6 text-[#00236f]" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-[#00236f]">Find Ticket / PNR</h1>
              <p className="text-slate-600 mt-1">Enter your PNR to view your ticket and boarding pass details.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
            <input
              value={pnr}
              onChange={(event) => setPnr(event.target.value.toUpperCase())}
              placeholder="Enter 6-character PNR"
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 font-mono tracking-[0.2em] text-slate-800 outline-none focus:border-[#00236f] focus:ring-2 focus:ring-blue-100"
              maxLength={6}
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00236f] px-5 py-3 text-white font-bold hover:bg-[#1e3a8a] transition-colors disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              Search
            </button>
          </form>

          {error ? (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}
        </section>

        {ticket ? (
          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-500">PNR</p>
                <p className="text-2xl font-mono font-black text-[#00236f]">{ticket.booking.pnr}</p>
              </div>
              <button
                type="button"
                onClick={handleDownload}
                disabled={downloading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-200 px-4 py-3 text-slate-700 font-bold hover:border-[#00236f] hover:text-[#00236f] transition-colors disabled:opacity-60"
              >
                {downloading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                Download Ticket
              </button>
            </div>

            <div ref={ticketGroupRef}>
              {ticket.passengers.map((passenger, index) => (
                <div data-boarding-pass-card="true" key={`${passenger.id}-${index}`}>
                  <BoardingPassTicket
                    passenger={{ firstName: passenger.firstName, lastName: passenger.lastName }}
                    flight={{
                      flightNumber: ticket.flight.flightNumber,
                      departureTime: ticket.flight.departureTime,
                      departureAirport: departureAirport,
                      arrivalAirport: arrivalAirport,
                    }}
                    seatNumber={ticket.booking.selectedSeats[index] ?? '—'}
                    pnr={ticket.booking.pnr}
                  />
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  )
}
