import { gsap } from 'gsap'
import { RotateCcw, SlidersHorizontal } from 'lucide-react'
import { useRef } from 'react'
import type { Airline, EnrichedFlightResult } from '../../services/api'
import type { FiltersState } from '../../pages/booking/results-page'

const DEPARTURE_SLOTS = [
  { label: 'Early Morning', sub: '00–06', icon: '🌙', idx: 0 },
  { label: 'Morning', sub: '06–12', icon: '🌅', idx: 1 },
  { label: 'Afternoon', sub: '12–18', icon: '☀️', idx: 2 },
  { label: 'Evening', sub: '18–24', icon: '🌆', idx: 3 },
]

const AIRLINE_COLORS: Record<string, string> = {
  '6E': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  AI:  'bg-amber-50 text-amber-700 border-amber-200',
  QP:  'bg-pink-50 text-pink-700 border-pink-200',
  SG:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  UK:  'bg-violet-50 text-violet-700 border-violet-200',
}

export function FilterSidebar({
  flights,
  airlines,
  filters,
  onChange,
}: {
  flights: EnrichedFlightResult[]
  airlines: Airline[]
  filters: FiltersState
  onChange: (next: FiltersState) => void
}) {
  const sidebarRef = useRef<HTMLElement>(null)

  const allPrices = flights.map((f) => Number(f.baseFare))
  const globalMin = allPrices.length ? Math.min(...allPrices) : 0
  const globalMax = allPrices.length ? Math.max(...allPrices) : 100000

  function animatePulse() {
    if (!sidebarRef.current) return
    gsap.fromTo(sidebarRef.current,
      { scale: 1 },
      { scale: 1.005, duration: 0.1, yoyo: true, repeat: 1, ease: 'power1.inOut' }
    )
  }

  function update(next: Partial<FiltersState>) {
    onChange({ ...filters, ...next })
    animatePulse()
  }

  function toggleTimeSlot(idx: number) {
    const current = filters.timeSlots
    const next = current.includes(idx)
      ? current.length > 1 ? current.filter((s) => s !== idx) : [0, 1, 2, 3]
      : [...current, idx]
    update({ timeSlots: next })
  }

  function toggleAirline(id: number) {
    const current = filters.airlineIds
    // empty = all; toggling one = exclude others
    if (current.length === 0) {
      // currently all shown → deselect this one
      update({ airlineIds: airlines.filter((a) => a.id !== id).map((a) => a.id) })
    } else {
      const next = current.includes(id)
        ? current.filter((a) => a !== id)
        : [...current, id]
      // if all selected, reset to empty (= all)
      update({ airlineIds: next.length === airlines.length ? [] : next })
    }
  }

  function isAirlineChecked(id: number) {
    return filters.airlineIds.length === 0 || filters.airlineIds.includes(id)
  }

  function resetAll() {
    onChange({
      minPrice: globalMin,
      maxPrice: globalMax,
      directOnly: false,
      airlineIds: [],
      timeSlots: [0, 1, 2, 3],
    })
    if (sidebarRef.current) {
      gsap.fromTo(sidebarRef.current,
        { opacity: 0.6 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      )
    }
  }

  const activeFilterCount = [
    filters.maxPrice < globalMax,
    filters.directOnly,
    filters.airlineIds.length > 0,
    filters.timeSlots.length < 4,
  ].filter(Boolean).length

  return (
    <aside
      ref={sidebarRef}
      className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden self-start xl:sticky xl:top-[76px]"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#00236f] to-[#1e3a8a] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-white font-bold text-xs sm:text-sm">
          <SlidersHorizontal size={14} />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-white/20 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            className="flex items-center gap-1 text-white/70 hover:text-white text-[11px] font-semibold transition-colors"
            onClick={resetAll}
            type="button"
          >
            <RotateCcw size={11} /> Reset
          </button>
        )}
      </div>

      {/* Price Range */}
      <div className="px-4 py-3.5 border-b border-slate-100">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2.5">Price Range</p>
        <input
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#1e3a8a]"
          max={globalMax}
          min={globalMin}
          onChange={(e) => update({ maxPrice: Number(e.target.value) })}
          style={{
            background: `linear-gradient(to right, #1e3a8a ${((filters.maxPrice - globalMin) / (globalMax - globalMin)) * 100}%, #e2e8f0 0%)`,
          }}
          type="range"
          value={filters.maxPrice}
        />
        <div className="flex justify-between mt-2">
          <span className="text-xs text-slate-400 font-medium">₹{globalMin.toLocaleString('en-IN')}</span>
          <span className="text-xs font-bold text-[#1e3a8a]">₹{filters.maxPrice.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Stops */}
      <div className="px-4 py-3.5 border-b border-slate-100">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2.5">Stops</p>
        <div className="flex flex-col gap-2">
          {[
            { label: 'Any', value: false, count: flights.length },
            { label: 'Non-stop only', value: true, count: flights.filter((f) => f.stopCount === 0).length },
          ].map((opt) => (
            <label
              key={opt.label}
              className={`flex items-center justify-between px-2.5 py-2 rounded-lg border cursor-pointer transition-all ${
                filters.directOnly === opt.value
                  ? 'border-[#1e3a8a] bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                  filters.directOnly === opt.value ? 'border-[#1e3a8a]' : 'border-slate-300'
                }`}>
                  {filters.directOnly === opt.value && (
                    <div className="w-2 h-2 rounded-full bg-[#1e3a8a]" />
                  )}
                </div>
                <span className={`text-xs font-semibold ${filters.directOnly === opt.value ? 'text-[#1e3a8a]' : 'text-slate-600'}`}>
                  {opt.label}
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">{opt.count}</span>
              <input
                checked={filters.directOnly === opt.value}
                className="sr-only"
                onChange={() => update({ directOnly: opt.value })}
                type="radio"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Departure Time */}
      <div className="px-4 py-3.5 border-b border-slate-100">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2.5">Departure Time</p>
        <div className="grid grid-cols-2 gap-2">
          {DEPARTURE_SLOTS.map((slot) => {
            const active = filters.timeSlots.includes(slot.idx)
            return (
              <button
                className={`flex flex-col items-center gap-0.5 py-2 px-1.5 rounded-lg border text-center transition-all ${
                  active
                    ? 'border-[#1e3a8a] bg-blue-50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
                key={slot.idx}
                onClick={() => toggleTimeSlot(slot.idx)}
                type="button"
              >
                <span className="text-base leading-none">{slot.icon}</span>
                <span className={`text-[10px] font-bold leading-tight ${active ? 'text-[#1e3a8a]' : 'text-slate-600'}`}>
                  {slot.label}
                </span>
                <span className="text-[9px] text-slate-400">{slot.sub}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Airlines */}
      <div className="px-4 py-3.5">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2.5">Airlines</p>
        <div className="flex flex-col gap-1.5">
          {airlines.map((airline) => {
            const checked = isAirlineChecked(airline.id)
            const flightCount = flights.filter((f) => f.airlineId === airline.id).length
            const minFare = flightCount
              ? Math.min(...flights.filter((f) => f.airlineId === airline.id).map((f) => Number(f.baseFare)))
              : null
            const colorClass = AIRLINE_COLORS[airline.iataCode] ?? 'bg-slate-50 text-slate-700 border-slate-200'

            return (
              <label
                className={`flex min-h-[50px] items-center gap-2 px-2 py-1.5 rounded-lg border cursor-pointer transition-all ${
                  checked ? 'border-[#1e3a8a] bg-blue-50' : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
                key={airline.id}
              >
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  checked ? 'bg-[#1e3a8a] border-[#1e3a8a]' : 'border-slate-300'
                }`}>
                  {checked && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border leading-none ${colorClass}`}>
                  {airline.iataCode}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-[10px] font-semibold leading-tight truncate ${checked ? 'text-[#1e3a8a]' : 'text-slate-700'}`}>
                    {airline.name}
                  </p>
                  {minFare && (
                    <p className="text-[9px] leading-tight text-slate-400">from ₹{minFare.toLocaleString('en-IN')}</p>
                  )}
                </div>
                <span className="text-[9px] text-slate-400 font-medium flex-shrink-0">{flightCount}</span>
                <input
                  checked={checked}
                  className="sr-only"
                  onChange={() => toggleAirline(airline.id)}
                  type="checkbox"
                />
              </label>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
