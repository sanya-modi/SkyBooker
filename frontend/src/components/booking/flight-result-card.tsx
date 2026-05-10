import { gsap } from 'gsap'
import { ArrowRight, Briefcase, Clock, ShoppingBag, Utensils, Wifi } from 'lucide-react'
import { useRef } from 'react'
import type { EnrichedFlightResult } from '../../services/api'

/* ── helpers ── */
function fmt(amount: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}
function fmtTime(v: string) {
  return new Date(v).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
}
function fmtDuration(dep: string, arr: string) {
  const ms = new Date(arr).getTime() - new Date(dep).getTime()
  return `${Math.floor(ms / 3600000)}h ${Math.floor((ms % 3600000) / 60000)}m`
}

/* ── airline brand colours ── */
const BRAND: Record<string, { bg: string; text: string; border: string }> = {
  '6E': { bg: '#eef2ff', text: '#4338ca', border: '#c7d2fe' },
  AI:  { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
  QP:  { bg: '#fdf2f8', text: '#9d174d', border: '#fbcfe8' },
  SG:  { bg: '#f0fdf4', text: '#166534', border: '#bbf7d0' },
  UK:  { bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe' },
}
function brand(iata?: string) {
  return BRAND[iata ?? ''] ?? { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' }
}

/* ── fare tiers ── */
const TIERS = [
  {
    key: 'economy',
    label: 'Economy',
    mult: 1,
    badge: null,
    perks: [
      { icon: ShoppingBag, text: '7 kg cabin bag' },
      { icon: Utensils, text: 'Snacks included' },
    ],
    primary: true,
  },
  {
    key: 'flexi',
    label: 'First Class',
    mult: 1.35,
    badge: 'Popular',
    perks: [
      { icon: ShoppingBag, text: '15 kg check-in' },
      { icon: ArrowRight, text: 'Free date change' },
      { icon: Utensils, text: 'Meal included' },
    ],
    primary: false,
  },
  {
    key: 'business',
    label: 'Business',
    mult: 2.6,
    badge: 'Premium',
    perks: [
      { icon: Briefcase, text: 'Lounge access' },
      { icon: ShoppingBag, text: '30 kg baggage' },
      { icon: Wifi, text: 'In-flight Wi-Fi' },
      { icon: Utensils, text: 'Gourmet meal' },
    ],
    primary: false,
  },
]

export function FlightResultCard({
  flight,
  onSelect,
}: {
  flight: EnrichedFlightResult
  onSelect: (flight: EnrichedFlightResult) => void
}) {
  const cardRef = useRef<HTMLElement>(null)
  const iata = flight.airline?.iataCode
  const b = brand(iata)
  const dur = fmtDuration(flight.departureTime, flight.arrivalTime)
  const base = Number(flight.baseFare)
  const isLowSeats = flight.availableSeats < 10

  function onMouseEnter() {
    if (!cardRef.current) return
    gsap.to(cardRef.current, { y: -3, boxShadow: '0 16px 48px rgba(0,35,111,0.13)', duration: 0.25, ease: 'power2.out' })
  }
  function onMouseLeave() {
    if (!cardRef.current) return
    gsap.to(cardRef.current, { y: 0, boxShadow: '0 2px 12px rgba(0,35,111,0.06)', duration: 0.25, ease: 'power2.out' })
  }

  return (
    <article
      ref={cardRef}
      className="frc-card bg-white rounded-xl border border-slate-100 overflow-hidden"
      style={{ boxShadow: '0 2px 10px rgba(0,35,111,0.05)' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* ── Top strip: airline + route ── */}
      <div className="px-4 py-3.5 grid grid-cols-1 lg:grid-cols-[170px_minmax(0,1fr)_130px] items-center gap-3 border-b border-slate-100">

        {/* Airline badge */}
        <div
          className="flex items-center gap-2 px-2 py-1.5 rounded-lg border flex-shrink-0"
          style={{ background: b.bg, borderColor: b.border }}
        >
          <span className="text-xs font-black tracking-wide" style={{ color: b.text }}>{iata ?? 'SB'}</span>
          <div className="w-px h-3.5 bg-current opacity-20" style={{ color: b.text }} />
          <div>
            <p className="text-[10px] font-bold leading-none" style={{ color: b.text }}>
              {flight.airline?.name ?? 'Airline'}
            </p>
            <p className="text-[9px] opacity-60 font-medium mt-0.5" style={{ color: b.text }}>
              {flight.flightNumber} · {flight.aircraftType}
            </p>
          </div>
        </div>

        {/* Route */}
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          {/* Departure */}
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-black text-slate-900 leading-none tracking-tight">
              {fmtTime(flight.departureTime)}
            </p>
            <p className="text-[11px] font-bold text-[#1e3a8a] tracking-widest mt-0.5">
              {flight.departureAirport?.iataCode ?? '—'}
            </p>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium">{flight.departureAirport?.city}</p>
          </div>

          {/* Line */}
          <div className="flex-1 flex flex-col items-center gap-1 min-w-[70px]">
            <div className="flex items-center gap-1 text-slate-400 text-[10px] font-semibold">
              <Clock size={10} /> {dur}
            </div>
            <div className="w-full flex items-center gap-0">
              <div className="w-2 h-2 rounded-full border-2 border-[#1e3a8a] bg-white flex-shrink-0" />
              <div className="flex-1 h-px bg-gradient-to-r from-[#1e3a8a] to-blue-300" />
              <span className="text-base px-1">✈</span>
              <div className="flex-1 h-px bg-gradient-to-r from-blue-300 to-[#1e3a8a]" />
              <div className="w-2 h-2 rounded-full border-2 border-[#1e3a8a] bg-white flex-shrink-0" />
            </div>
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
              {flight.stopsLabel}
            </span>
          </div>

          {/* Arrival */}
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-black text-slate-900 leading-none tracking-tight">
              {fmtTime(flight.arrivalTime)}
            </p>
            <p className="text-[11px] font-bold text-[#1e3a8a] tracking-widest mt-0.5">
              {flight.arrivalAirport?.iataCode ?? '—'}
            </p>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium">{flight.arrivalAirport?.city}</p>
          </div>
        </div>

        {/* Right: seats + status */}
        <div className="flex flex-row lg:flex-col items-start lg:items-end justify-between gap-2 lg:gap-1.5 flex-shrink-0">
          {isLowSeats ? (
            <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-1 rounded-full">
              🔥 Only {flight.availableSeats} left!
            </span>
          ) : (
            <span className="text-[10px] font-medium text-slate-500">
              {flight.availableSeats} seats available
            </span>
          )}
          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
            flight.status === 'ON_TIME'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : flight.status === 'DELAYED'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {flight.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* ── Fare tiers ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
        {TIERS.map((tier) => {
          const price = Math.round(base * tier.mult)
          return (
            <div key={tier.key} className={`px-3.5 py-3 flex flex-col gap-2 ${tier.key === 'flexi' ? 'bg-blue-50/40' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {tier.label}
                    </span>
                    {tier.badge && (
                      <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                        tier.badge === 'Popular'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-violet-100 text-violet-700'
                      }`}>
                        {tier.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-base sm:text-lg font-black text-[#1e3a8a] leading-tight mt-0.5">
                    {fmt(price)}
                  </p>
                  <p className="text-[9px] text-slate-400 font-medium">per person</p>
                </div>
              </div>

              <ul className="flex flex-col gap-1 flex-1">
                {tier.perks.map((perk) => (
                  <li key={perk.text} className="flex items-center gap-1.5 text-[10px] text-slate-600 font-medium">
                    <perk.icon size={11} className="text-[#1e3a8a] flex-shrink-0" />
                    {perk.text}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                  tier.primary
                    ? 'bg-[#1e3a8a] text-white hover:bg-[#162d5a] shadow-md shadow-blue-900/20'
                    : tier.key === 'flexi'
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20'
                    : 'bg-white text-[#1e3a8a] border-2 border-[#1e3a8a] hover:bg-blue-50'
                }`}
                onClick={() => onSelect(flight)}
                type="button"
              >
                Select <ArrowRight size={13} />
              </button>
            </div>
          )
        })}
      </div>
    </article>
  )
}
