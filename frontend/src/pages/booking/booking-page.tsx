import { gsap } from 'gsap'
import { ArrowLeft, Plane } from 'lucide-react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AddOnsSection, MEALS, BAGGAGE } from '../../components/addons/addons-section'
import { MobileDock } from '../../components/booking/mobile-dock'
import { PassengerForm } from '../../components/booking/passenger-form'
import { PaymentSummary } from '../../components/booking/payment-summary'
import { getSeatPrice, SeatPicker } from '../../components/booking/seat-picker'
import { TopNav } from '../../components/booking/top-nav'
import { useAuth } from '../../context/auth-context'
import { useBookingFlow } from '../../context/booking-flow-context'
import { flightApi, seatApi, type EnrichedFlightResult, type SeatResult } from '../../services/api'

function enrichFlight(f: Awaited<ReturnType<typeof flightApi.getById>>): EnrichedFlightResult {
  return { ...f, stopCount: 0, stopsLabel: 'Direct' }
}

function fmtTime(v: string) {
  return new Date(v).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
}

/* skeleton for the seat map area */
function SeatMapSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* header skeleton */}
      <div className="bg-gradient-to-r from-[#00236f] to-[#1e3a8a] px-6 py-5">
        <div className="h-5 w-40 bg-white/20 rounded-lg animate-pulse mb-2" />
        <div className="h-3 w-56 bg-white/10 rounded animate-pulse mb-4" />
        <div className="flex gap-4">
          {[80, 60, 60, 60].map((w, i) => (
            <div key={i} className="h-3 bg-white/10 rounded animate-pulse" style={{ width: w }} />
          ))}
        </div>
      </div>
      {/* tabs skeleton */}
      <div className="flex gap-2 px-5 py-3 bg-slate-50 border-b border-slate-100">
        {[90, 80, 80, 60].map((w, i) => (
          <div key={i} className="h-9 bg-slate-200 rounded-xl animate-pulse" style={{ width: w }} />
        ))}
      </div>
      {/* map skeleton */}
      <div className="px-5 py-5 flex flex-col items-center gap-1.5">
        <div className="w-16 h-10 bg-slate-100 rounded-t-full animate-pulse mb-3" />
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-5 h-3 bg-slate-200 rounded animate-pulse" />
            <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(7, 34px)' }}>
              {[0, 1, 2, 'a', 3, 4, 5].map((c, ci) =>
                c === 'a'
                  ? <div key="a" className="w-[34px]" />
                  : <div key={ci} className="w-[34px] h-[34px] rounded-lg bg-slate-100 animate-pulse" style={{ animationDelay: `${(i * 6 + Number(c)) * 30}ms` }} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function BookingPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { isLoggedIn, user } = useAuth()
  const { passenger, selectedFlight, selectedSeatId, selectedMealId, selectedBaggageId, setSelectedFlight, setSelectedSeatId, setSelectedMealId, setSelectedBaggageId, updatePassenger } = useBookingFlow()

  const [flight, setFlight] = useState<EnrichedFlightResult | null>(selectedFlight)
  const [seats, setSeats] = useState<SeatResult[]>([])
  const [seatsLoading, setSeatsLoading] = useState(true)
  const [flightLoading, setFlightLoading] = useState(true)
  const [error, setError] = useState('')
  const flightId = Number(params.get('flightId'))

  const headerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    gsap.fromTo(headerRef.current, { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' })
    gsap.fromTo(contentRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.55, delay: 0.12, ease: 'power3.out' })
  }, [])

  useEffect(() => {
    if (!isLoggedIn) navigate(`/login?redirect=${encodeURIComponent(`/booking?flightId=${flightId}`)}`)
  }, [flightId, isLoggedIn, navigate])

  /* load flight */
  useEffect(() => {
    if (!flightId) return
    async function loadFlight() {
      setFlightLoading(true)
      try {
        const f: EnrichedFlightResult = selectedFlight?.id === flightId
          ? selectedFlight
          : enrichFlight(await flightApi.getById(flightId))
        setFlight(f)
        setSelectedFlight(f)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load flight.')
      } finally {
        setFlightLoading(false)
      }
    }
    void loadFlight()
  }, [flightId]) // eslint-disable-line

  /* load seats — initialize if empty, use available endpoint */
  useEffect(() => {
    if (!flightId) return
    async function loadSeats() {
      setSeatsLoading(true)
      try {
        let available = await seatApi.getAvailable(flightId)

        if (available.length === 0) {
          // initialize seats for this flight
          const totalSeats = flight?.totalSeats ?? 180
          await seatApi.initialize(flightId, totalSeats)
          available = await seatApi.getAvailable(flightId)
        }

        setSeats(available)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load seats.')
      } finally {
        setSeatsLoading(false)
      }
    }
    void loadSeats()
  }, [flightId, flight?.totalSeats]) // eslint-disable-line

  const selectedSeat = seats.find((s) => s.seatNumber === selectedSeatId)
  const taxes = useMemo(() => Math.round(Number(flight?.baseFare ?? 0) * 0.12), [flight])
  const seatCharge = useMemo(() => getSeatPrice(seats, selectedSeatId), [seats, selectedSeatId])
  const mealCharge = useMemo(() => MEALS.find(m => m.id === selectedMealId)?.price ?? 0, [selectedMealId])
  const baggageCharge = useMemo(() => BAGGAGE.find(b => b.id === selectedBaggageId)?.price ?? 0, [selectedBaggageId])
  const total = Number(flight?.baseFare ?? 0) + taxes + seatCharge + mealCharge + baggageCharge

  function continueToPayment() {
    if (!passenger.firstName.trim() || !passenger.lastName.trim() || !passenger.email.trim() || !passenger.phoneNumber.trim()) {
      setError('Please complete all passenger details.')
      return
    }
    if (!selectedSeatId) {
      setError('Please select a seat to continue.')
      return
    }
    setError('')
    navigate(`/payment?flightId=${flightId}`)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav />

      {/* ── hero ── */}
      <div ref={headerRef} className="bg-gradient-to-br from-[#00236f] via-[#1e3a8a] to-[#1d4ed8] pt-[60px]">
        <div className="max-w-[1280px] mx-auto px-6 py-6">
          <button
            className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-semibold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-all mb-4"
            onClick={() => navigate(-1)}
            type="button"
          >
            <ArrowLeft size={15} /> Back to Results
          </button>

          <div className="flex flex-wrap items-center gap-5">
            {flightLoading ? (
              <div className="h-8 w-64 bg-white/20 rounded-xl animate-pulse" />
            ) : flight ? (
              <>
                <div className="flex items-center gap-4">
                  <div className="bg-white/15 px-3 py-2 rounded-xl">
                    <span className="text-white font-black text-base">{flight.airline?.iataCode ?? 'SB'}</span>
                  </div>
                  <div>
                    <h1 className="text-white font-black text-2xl leading-none tracking-tight">
                      {flight.departureAirport?.city ?? '—'} → {flight.arrivalAirport?.city ?? '—'}
                    </h1>
                    <p className="text-blue-200 text-sm mt-1">
                      {flight.flightNumber} · {fmtTime(flight.departureTime)} – {fmtTime(flight.arrivalTime)} · Direct
                    </p>
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-2 bg-white/10 px-4 py-2 rounded-xl">
                  <Plane size={15} className="text-blue-300" />
                  <span className="text-white font-semibold text-sm">Step 1 of 3</span>
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* progress */}
        <div className="max-w-[1280px] mx-auto px-6">
          <div className="flex">
            {['Seat & Passenger', 'Payment', 'Confirmation'].map((step, i) => (
              <div
                key={step}
                className={`flex-1 py-2.5 text-center text-xs font-bold border-b-2 transition-all ${
                  i === 0 ? 'border-white text-white' : 'border-white/20 text-white/40'
                }`}
              >
                {i + 1}. {step}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── content ── */}
      <div ref={contentRef} className="max-w-[1280px] mx-auto px-6 py-7">
        {error && (
          <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 text-sm font-semibold flex items-center gap-2">
            <span>⚠</span> {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
          {/* left col */}
          <div className="flex flex-col gap-5">
            {seatsLoading
              ? <SeatMapSkeleton />
              : (
                <SeatPicker
                  loading={false}
                  seats={seats}
                  selectedSeatNumber={selectedSeatId}
                  onSelect={setSelectedSeatId}
                />
              )
            }
            <AddOnsSection
              selectedMealId={selectedMealId}
              selectedBaggageId={selectedBaggageId}
              onMealSelect={setSelectedMealId}
              onBaggageSelect={setSelectedBaggageId}
            />
            <PassengerForm
              onChange={(next) => updatePassenger({ ...next, email: next.email || user?.email || '' })}
              value={{ ...passenger, email: passenger.email || user?.email || '' }}
            />
          </div>

          {/* right col */}
          <PaymentSummary
            buttonLabel="Continue to Payment"
            flight={flight}
            loading={false}
            onAction={continueToPayment}
            seatCharge={seatCharge}
            mealCharge={mealCharge}
            baggageCharge={baggageCharge}
            seatClass={selectedSeat?.seatClass}
            seatLabel={selectedSeatId}
            taxes={taxes}
            total={total}
          />
        </div>
      </div>

      <MobileDock active="booking" />
    </div>
  )
}
