import { gsap } from 'gsap'
import { ArrowLeft, ArrowUpDown, Plane, RefreshCw } from 'lucide-react'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FilterSidebar } from '../../components/booking/filter-sidebar'
import { FlightResultCard } from '../../components/booking/flight-result-card'
import { MobileDock } from '../../components/booking/mobile-dock'
import { TopNav } from '../../components/booking/top-nav'
import { useAuth } from '../../context/auth-context'
import { useBookingFlow } from '../../context/booking-flow-context'
import {
  getAllAirlinesCached,
  getAllAirportsCached,
  searchFlights,
  type Airline,
  type Airport,
  type EnrichedFlightResult,
} from '../../services/api'

export type SortKey = 'price' | 'departure' | 'duration' | 'arrival'

export interface FiltersState {
  minPrice: number
  maxPrice: number
  directOnly: boolean
  airlineIds: number[]
  timeSlots: number[] // 0=00-06, 1=06-12, 2=12-18, 3=18-24
}

const TIME_SLOTS = [
  { start: 0, end: 6 },
  { start: 6, end: 12 },
  { start: 12, end: 18 },
  { start: 18, end: 24 },
]

const SORT_OPTIONS: { key: SortKey; label: string; icon: string }[] = [
  { key: 'price', label: 'Cheapest', icon: '₹' },
  { key: 'departure', label: 'Earliest', icon: '🕐' },
  { key: 'duration', label: 'Fastest', icon: '⚡' },
  { key: 'arrival', label: 'Latest', icon: '🌙' },
]

function flightDuration(f: EnrichedFlightResult) {
  return new Date(f.arrivalTime).getTime() - new Date(f.departureTime).getTime()
}

function depHour(f: EnrichedFlightResult) {
  return new Date(f.departureTime).getHours()
}

export function ResultsPage() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const { isLoggedIn } = useAuth()
  const { setSearchCriteria, setSelectedFlight } = useBookingFlow()

  const [allFlights, setAllFlights] = useState<EnrichedFlightResult[]>([])
  const [airports, setAirports] = useState<Airport[]>([])
  const [airlines, setAirlines] = useState<Airline[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('price')
  const [filters, setFilters] = useState<FiltersState>({
    minPrice: 0,
    maxPrice: Number.MAX_SAFE_INTEGER,
    directOnly: false,
    airlineIds: [],   // empty = all selected
    timeSlots: [0, 1, 2, 3], // all slots selected
  })

  const heroRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const fromId = Number(params.get('fromId'))
  const toId = Number(params.get('toId'))
  const departureDate = params.get('departureDate') ?? ''
  const returnDate = params.get('returnDate') ?? ''
  const passengers = Number(params.get('passengers') ?? '1')
  const tripType = (params.get('tripType') as 'roundtrip' | 'oneway') || 'roundtrip'

  // Hero entrance animation
  useLayoutEffect(() => {
    if (!heroRef.current) return
    gsap.fromTo(heroRef.current,
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
    )
  }, [])

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const [airportList, airlineList, flightList] = await Promise.all([
          getAllAirportsCached(),
          getAllAirlinesCached(),
          searchFlights(fromId, toId, departureDate),
        ])
        setAirports(airportList)
        setAirlines(airlineList)
        setAllFlights(flightList)

        const prices = flightList.map((f) => Number(f.baseFare))
        const minP = prices.length ? Math.min(...prices) : 0
        const maxP = prices.length ? Math.max(...prices) : 100000

        // Initialize filters — airlineIds empty means ALL shown
        setFilters({
          minPrice: minP,
          maxPrice: maxP,
          directOnly: false,
          airlineIds: [],
          timeSlots: [0, 1, 2, 3],
        })

        const fromAirport = airportList.find((a) => a.id === fromId) ?? null
        const toAirport = airportList.find((a) => a.id === toId) ?? null
        setSearchCriteria({
          fromAirport, toAirport, departureDate, returnDate,
          passengers, tripType, directOnly: false,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load flights.')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [fromId, toId, departureDate]) // eslint-disable-line

  // Animate list when flights change
  useEffect(() => {
    if (loading || !listRef.current) return
    const cards = listRef.current.querySelectorAll('.frc-card')
    if (!cards.length) return
    gsap.fromTo(cards,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.07, ease: 'power2.out' }
    )
  }, [loading, sortKey])

  const filteredAndSorted = useMemo(() => {
    const allPrices = allFlights.map((f) => Number(f.baseFare))
    const globalMax = allPrices.length ? Math.max(...allPrices) : 100000

    let list = allFlights.filter((f) => {
      const fare = Number(f.baseFare)
      // Price filter — only apply if maxPrice is less than global max
      if (filters.maxPrice < globalMax && fare > filters.maxPrice) return false
      // Stops
      if (filters.directOnly && f.stopCount > 0) return false
      // Airlines — empty array = show all
      if (filters.airlineIds.length > 0 && !filters.airlineIds.includes(f.airlineId)) return false
      // Time slots — if all 4 selected, show all
      if (filters.timeSlots.length < 4) {
        const h = depHour(f)
        const inSlot = filters.timeSlots.some((idx) => {
          const slot = TIME_SLOTS[idx]
          return slot && h >= slot.start && h < slot.end
        })
        if (!inSlot) return false
      }
      return true
    })

    return [...list].sort((a, b) => {
      switch (sortKey) {
        case 'price': return Number(a.baseFare) - Number(b.baseFare)
        case 'departure': return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime()
        case 'duration': return flightDuration(a) - flightDuration(b)
        case 'arrival': return new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime()
        default: return 0
      }
    })
  }, [allFlights, filters, sortKey])

  const origin = airports.find((a) => a.id === fromId)
  const destination = airports.find((a) => a.id === toId)
  const cheapestFare = filteredAndSorted[0] ? Number(filteredAndSorted[0].baseFare) : null

  function handleSelect(flight: EnrichedFlightResult) {
    setSelectedFlight(flight)
    if (!isLoggedIn) {
      navigate(`/login?redirect=${encodeURIComponent(`/booking?flightId=${flight.id}`)}`)
      return
    }
    navigate(`/booking?flightId=${flight.id}`)
  }

  function handleSortChange(key: SortKey) {
    setSortKey(key)
    if (listRef.current) {
      const cards = listRef.current.querySelectorAll('.frc-card')
      gsap.fromTo(cards,
        { opacity: 0, x: -12 },
        { opacity: 1, x: 0, duration: 0.3, stagger: 0.05, ease: 'power2.out' }
      )
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <TopNav />

      {/* ── Hero ── */}
      <div ref={heroRef} className="bg-gradient-to-br from-[#00236f] via-[#1e3a8a] to-[#1d4ed8] pt-[60px]">
        <div className="max-w-[1280px] mx-auto px-6 py-7">
          <button
            className="inline-flex items-center gap-2 text-white/80 hover:text-white text-sm font-semibold bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-all mb-5"
            onClick={() => navigate('/')}
            type="button"
          >
            <ArrowLeft size={15} /> Modify search
          </button>

          <div className="flex items-center gap-6 mb-4">
            <div>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-0.5">From</p>
              <h1 className="text-4xl md:text-5xl font-black text-white leading-none tracking-tight">
                {origin?.city ?? '—'}
              </h1>
              <span className="text-blue-300 font-bold text-sm tracking-widest">{origin?.iataCode}</span>
            </div>
            <div className="flex flex-col items-center gap-1 px-4">
              <Plane size={24} className="text-white/60 rotate-0" />
              <div className="w-16 h-px bg-white/30" />
            </div>
            <div>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-0.5">To</p>
              <h1 className="text-4xl md:text-5xl font-black text-white leading-none tracking-tight">
                {destination?.city ?? '—'}
              </h1>
              <span className="text-blue-300 font-bold text-sm tracking-widest">{destination?.iataCode}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-white/75 text-sm font-medium bg-white/10 px-3 py-1.5 rounded-full">
              📅 {departureDate}
            </span>
            {tripType === 'roundtrip' && returnDate && (
              <span className="text-white/75 text-sm font-medium bg-white/10 px-3 py-1.5 rounded-full">
                ↩ Return {returnDate}
              </span>
            )}
            <span className="text-white/75 text-sm font-medium bg-white/10 px-3 py-1.5 rounded-full">
              👤 {passengers} passenger{passengers > 1 ? 's' : ''}
            </span>
            {cheapestFare && (
              <span className="text-emerald-300 text-sm font-bold bg-emerald-500/20 border border-emerald-400/30 px-3 py-1.5 rounded-full">
                ✦ From ₹{cheapestFare.toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-[1280px] mx-auto px-6 py-7 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">

        {/* Sidebar */}
        <FilterSidebar
          airlines={airlines}
          filters={filters}
          flights={allFlights}
          onChange={setFilters}
        />

        {/* Results */}
        <section className="flex flex-col gap-4 min-w-0">

          {/* Sort bar */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-5 py-3.5 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold uppercase tracking-wider">
              <ArrowUpDown size={13} /> Sort
            </div>
            <div className="flex gap-2 flex-wrap flex-1">
              {SORT_OPTIONS.map((opt) => (
                <button
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${
                    sortKey === opt.key
                      ? 'bg-[#1e3a8a] text-white border-[#1e3a8a] shadow-md shadow-blue-900/20'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-[#1e3a8a] hover:text-[#1e3a8a]'
                  }`}
                  key={opt.key}
                  onClick={() => handleSortChange(opt.key)}
                  type="button"
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
            <span className="text-slate-400 text-xs font-semibold ml-auto whitespace-nowrap">
              {loading ? (
                <span className="flex items-center gap-1.5"><RefreshCw size={12} className="animate-spin" /> Loading…</span>
              ) : (
                `${filteredAndSorted.length} flight${filteredAndSorted.length !== 1 ? 's' : ''}`
              )}
            </span>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl px-5 py-4 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Skeletons */}
          {loading && (
            <div className="flex flex-col gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-100 h-44 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 animate-pulse" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && filteredAndSorted.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center gap-4 py-20 px-8 text-center">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                <Plane size={28} className="text-[#1e3a8a]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#1e3a8a] mb-1">No flights found</h3>
                <p className="text-slate-500 text-sm">Try adjusting your filters or selecting a different date.</p>
              </div>
              <button
                className="mt-2 bg-[#1e3a8a] text-white px-6 py-2.5 rounded-full font-semibold text-sm hover:bg-[#162d5a] transition-colors"
                onClick={() => navigate('/')}
                type="button"
              >
                Search again
              </button>
            </div>
          )}

          {/* Flight cards */}
          <div ref={listRef} className="flex flex-col gap-4">
            {!loading && filteredAndSorted.map((flight) => (
              <FlightResultCard flight={flight} key={flight.id} onSelect={handleSelect} />
            ))}
          </div>
        </section>
      </div>

      <MobileDock active="results" />
    </div>
  )
}
