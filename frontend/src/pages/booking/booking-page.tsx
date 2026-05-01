import { gsap } from 'gsap'
import { ArrowLeft, Plane } from 'lucide-react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AddOnsSection, MEALS, BAGGAGE } from '../../components/addons/addons-section'
import { MobileDock } from '../../components/booking/mobile-dock'
import { PassengerForm } from '../../components/booking/passenger-form'
import { PaymentSummary } from '../../components/booking/payment-summary'
import { getEffectiveSeatClass, getSeatPrice, SeatPicker } from '../../components/booking/seat-picker'
import { TopNav } from '../../components/booking/top-nav'
import { useAuth } from '../../context/auth-context'
import { useBookingFlow } from '../../context/booking-flow-context'
import { flightApi, seatApi, type EnrichedFlightResult, type SeatResult } from '../../services/api'

type PassengerErrors = {
  firstName?: string
  lastName?: string
  dateOfBirth?: string
  category?: string
  gender?: string
  passportNumber?: string
  email?: string
  phoneNumber?: string
}

const validationPatterns = {
  name: /^[A-Za-z][A-Za-z\s'-]{1,49}$/,
  passport: /^[A-Z0-9]{6,20}$/,
  email: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
  phoneNumber: /^\d{10}$/,
} as const

function calculateAge(dateOfBirth: string) {
  const today = new Date()
  const dob = new Date(dateOfBirth)
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1
  }
  return age
}

function getCategoryAgeError(category: string, dateOfBirth: string) {
  if (!category || !dateOfBirth) return undefined

  const age = calculateAge(dateOfBirth)
  if (Number.isNaN(age) || age < 0) {
    return 'Date of birth cannot be in the future'
  }

  if (category === 'ADULT' && age <= 12) {
    return 'Passenger must be older than 12 years'
  }
  if (category === 'CHILD' && (age < 2 || age > 12)) {
    return 'Passenger age must be between 2 and 12 years'
  }
  if (category === 'INFANT' && age >= 2) {
    return 'Passenger must be below 2 years'
  }

  return undefined
}

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
  const { passengers, searchCriteria, selectedFlight, selectedSeatIds, selectedMealId, selectedBaggageId, setSelectedFlight, setSelectedSeatIds, setSelectedMealId, setSelectedBaggageId, updatePassengerAt } = useBookingFlow()

  const [flight, setFlight] = useState<EnrichedFlightResult | null>(selectedFlight)
  const [seats, setSeats] = useState<SeatResult[]>([])
  const [seatsLoading, setSeatsLoading] = useState(true)
  const [flightLoading, setFlightLoading] = useState(true)
  const [error, setError] = useState('')
  const [showPassengerErrors, setShowPassengerErrors] = useState(false)
  const flightId = Number(params.get('flightId'))
  const requestedPassengers = Number(params.get('passengers') ?? '1')
  const passengerCount = searchCriteria?.passengers ?? (Number.isFinite(requestedPassengers) && requestedPassengers > 0 ? requestedPassengers : 1)
  const maxSelectableSeats = Math.min(Math.max(passengerCount, 1), 10)

  const headerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    gsap.fromTo(headerRef.current, { opacity: 0, y: -16 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' })
    gsap.fromTo(contentRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.55, delay: 0.12, ease: 'power3.out' })
  }, [])

  useEffect(() => {
    if (!isLoggedIn) navigate(`/login?redirect=${encodeURIComponent(`/booking?flightId=${flightId}`)}`)
  }, [flightId, isLoggedIn, navigate])

  useEffect(() => {
    if (selectedSeatIds.length > maxSelectableSeats) {
      setSelectedSeatIds(selectedSeatIds.slice(0, maxSelectableSeats))
    }
  }, [maxSelectableSeats, selectedSeatIds, setSelectedSeatIds])

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
    if (!flightId || !flight) return
    async function loadSeats() {
      setSeatsLoading(true)
      try {
        let available = await seatApi.getAllByFlight(flightId)
        console.log('Loaded seats:', available)

        if (available.length === 0 && flight.totalSeats) {
          await seatApi.initialize(flightId, flight.totalSeats)
          available = await seatApi.getAllByFlight(flightId)
          console.log('Initialized seats:', available)
        }

        setSeats(available)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load seats.')
      } finally {
        setSeatsLoading(false)
      }
    }
    void loadSeats()
  }, [flightId, flight])

  useEffect(() => {
    if (!flightId) return

    let cancelled = false
    let pollingId: number | undefined

    const applySeats = (nextSeats: SeatResult[]) => {
      if (!cancelled) {
        console.log('Applying seats update:', nextSeats)
        setSeats(nextSeats)
        setSeatsLoading(false)
      }
    }

    const startPolling = () => {
      pollingId = window.setInterval(async () => {
        try {
          applySeats(await seatApi.getAllByFlight(flightId))
        } catch {
          // keep last known state on polling errors
        }
      }, 5000)
    }

    if (typeof EventSource === 'undefined') {
      startPolling()
      return () => {
        cancelled = true
        if (pollingId) window.clearInterval(pollingId)
      }
    }

    const stream = seatApi.createSeatStream(flightId)
    stream.addEventListener('seat-map', (event) => {
      try {
        const payload = JSON.parse((event as MessageEvent).data)
        if (payload && payload.seats && Array.isArray(payload.seats)) {
          applySeats(payload.seats)
        }
      } catch {
        // ignore malformed events
      }
    })
    stream.onerror = () => {
      stream.close()
      startPolling()
    }

    return () => {
      cancelled = true
      stream.close()
      if (pollingId) window.clearInterval(pollingId)
    }
  }, [flightId])

  const selectedSeat = selectedSeatIds.length === 1 ? seats.find((s) => s.seatNumber === selectedSeatIds[0]) : undefined
  const selectedSeatClass = selectedSeat ? getEffectiveSeatClass(selectedSeat) : undefined
  const selectedPassengers = passengers.slice(0, selectedSeatIds.length)
  const taxes = useMemo(() => Math.round(Number(flight?.baseFare ?? 0) * 0.12), [flight])
  const seatCharge = useMemo(() => selectedSeatIds.reduce((sum, seatNumber) => sum + getSeatPrice(seats, seatNumber), 0), [seats, selectedSeatIds])
  const mealCharge = useMemo(() => MEALS.find(m => m.id === selectedMealId)?.price ?? 0, [selectedMealId])
  const baggageCharge = useMemo(() => BAGGAGE.find(b => b.id === selectedBaggageId)?.price ?? 0, [selectedBaggageId])
  const total = Number(flight?.baseFare ?? 0) + taxes + seatCharge + mealCharge + baggageCharge

  const passengerErrors = useMemo(() => {
    const passportCounts = selectedPassengers.reduce<Record<string, number>>((acc, passenger) => {
      const passport = passenger.passportNumber.trim().toUpperCase()
      if (passport) {
        acc[passport] = (acc[passport] ?? 0) + 1
      }
      return acc
    }, {})

    return selectedPassengers.map<PassengerErrors>((passenger) => {
      const errors: PassengerErrors = {}
      const dob = passenger.dateOfBirth ? new Date(passenger.dateOfBirth) : null
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const firstName = passenger.firstName.trim()
      const lastName = passenger.lastName.trim()
      const passport = passenger.passportNumber.trim().toUpperCase()
      const email = passenger.email.trim()
      const phoneNumber = passenger.phoneNumber.trim()

      if (!firstName) errors.firstName = 'First name is required'
      else if (!validationPatterns.name.test(firstName)) errors.firstName = 'First name must be 2-50 letters only'

      if (!lastName) errors.lastName = 'Last name is required'
      else if (!validationPatterns.name.test(lastName)) errors.lastName = 'Last name must be 2-50 letters only'

      if (!passenger.dateOfBirth) errors.dateOfBirth = 'Date of birth is required'
      else if (dob && dob.getTime() > today.getTime()) errors.dateOfBirth = 'Date of birth cannot be in the future'
      if (!passenger.category.trim()) errors.category = 'Category is required'
      if (!passenger.gender.trim()) errors.gender = 'Gender is required'
      if (!phoneNumber) errors.phoneNumber = 'Mobile number is required'
      else if (!validationPatterns.phoneNumber.test(phoneNumber)) errors.phoneNumber = 'Mobile number must be exactly 10 digits'
      if (!passport) errors.passportNumber = 'Passport number is required'
      else if (!validationPatterns.passport.test(passport)) errors.passportNumber = 'Passport number must be 6-20 uppercase letters or digits'
      else if ((passportCounts[passport] ?? 0) > 1) errors.passportNumber = 'Passport number must be unique'
      if (!email) errors.email = 'Email address is required'
      else if (!validationPatterns.email.test(email)) errors.email = 'Please enter a valid email address'

      const categoryAgeError = getCategoryAgeError(passenger.category, passenger.dateOfBirth)
      if (categoryAgeError) errors.dateOfBirth = categoryAgeError

      return errors
    })
  }, [selectedPassengers])

  const hasPassengerErrors = passengerErrors.some((entry) => Object.keys(entry).length > 0)

  function continueToPayment() {
    if (selectedSeatIds.length === 0) {
      setError('Please select a seat to continue.')
      return
    }
    if (hasPassengerErrors) {
      setShowPassengerErrors(true)
      setError('Please correct the highlighted passenger details.')
      return
    }
    setShowPassengerErrors(false)
    setError('')
    navigate(`/payment?flightId=${flightId}`)
  }

  async function handleSeatSelection(nextSeatIds: string[]) {
    if (!flightId || !user) {
      setError('Please log in to select seats.')
      return
    }

    const seatsToHold = nextSeatIds.filter((seatNumber) => !selectedSeatIds.includes(seatNumber))
    const seatsToRelease = selectedSeatIds.filter((seatNumber) => !nextSeatIds.includes(seatNumber))

    try {
      setError('')

      for (const seatNumber of seatsToRelease) {
        await seatApi.releaseByFlightSeat(flightId, seatNumber)
      }

      for (const seatNumber of seatsToHold) {
        await seatApi.hold(flightId, seatNumber, user.userId)
      }

      setShowPassengerErrors(false)
      setSelectedSeatIds(nextSeatIds)
      setSeats(await seatApi.getAllByFlight(flightId))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update seat selection.')
      setSeats(await seatApi.getAllByFlight(flightId))
    }
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
                  currentPassengerId={user?.userId}
                  maxSelectableSeats={maxSelectableSeats}
                  onSelectionLimitReached={setError}
                  seats={seats}
                  selectedSeatNumbers={selectedSeatIds}
                  onSelect={handleSeatSelection}
                />
              )
            }
            <AddOnsSection
              selectedMealId={selectedMealId}
              selectedBaggageId={selectedBaggageId}
              onMealSelect={setSelectedMealId}
              onBaggageSelect={setSelectedBaggageId}
            />
            {selectedSeatIds.map((seatNumber, index) => {
              const passenger = selectedPassengers[index] ?? {
                firstName: '',
                lastName: '',
                dateOfBirth: '',
                category: '',
                gender: '',
                passportNumber: '',
                email: user?.email || '',
                phoneNumber: '',
              }

              return (
                <PassengerForm
                  errors={showPassengerErrors ? passengerErrors[index] : undefined}
                  key={seatNumber}
                  onChange={(next) => {
                    setError('')
                    updatePassengerAt(index, { ...next, email: next.email || user?.email || '' })
                  }}
                  seatLabel={seatNumber}
                  title={`Passenger ${index + 1}`}
                  value={{ ...passenger, email: passenger.email || user?.email || '' }}
                />
              )
            })}
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
            seatClass={selectedSeatClass}
            seatLabel={selectedSeatIds.join(', ')}
            taxes={taxes}
            total={total}
          />
        </div>
      </div>

      <MobileDock active="booking" />
    </div>
  )
}
