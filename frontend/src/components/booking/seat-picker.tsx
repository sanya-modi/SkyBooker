import { gsap } from 'gsap'
import { Check, ChevronDown, ChevronUp, Clock, Info } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { SeatResult } from '../../services/api'

/* ─── pricing ─────────────────────────────────────────── */
export const SEAT_PRICES: Record<string, number> = {
  ECONOMY: 0,
  BUSINESS: 2500,
  FIRST: 5000,
}

export function getSeatPrice(seats: SeatResult[], seatNumber: string): number {
  const seat = seats.find((s) => s.seatNumber === seatNumber)
  return seat ? (SEAT_PRICES[seat.seatClass] ?? 0) : 0
}

/* ─── class styling ────────────────────────────────────── */
const CLS = {
  ECONOMY: {
    label: 'Economy',
    badge: 'bg-slate-100 text-slate-600',
    seat: 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700',
    selected: 'bg-[#1e3a8a] border-[#1e3a8a] text-white shadow-lg shadow-blue-900/30',
    held: 'bg-amber-50 border-amber-300 text-amber-500 cursor-not-allowed',
    booked: 'bg-red-50 border-red-200 text-red-300 cursor-not-allowed opacity-50',
    price: 'Included',
  },
  BUSINESS: {
    label: 'Business',
    badge: 'bg-amber-50 text-amber-700',
    seat: 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100 hover:border-amber-500 hover:text-amber-800',
    selected: 'bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/30',
    held: 'bg-amber-50 border-amber-300 text-amber-400 cursor-not-allowed',
    booked: 'bg-red-50 border-red-200 text-red-300 cursor-not-allowed opacity-50',
    price: '+₹2,500',
  },
  FIRST: {
    label: 'First',
    badge: 'bg-violet-50 text-violet-700',
    seat: 'bg-violet-50 border-violet-200 text-violet-600 hover:bg-violet-100 hover:border-violet-500 hover:text-violet-800',
    selected: 'bg-violet-600 border-violet-600 text-white shadow-lg shadow-violet-500/30',
    held: 'bg-violet-50 border-violet-200 text-violet-300 cursor-not-allowed',
    booked: 'bg-red-50 border-red-200 text-red-300 cursor-not-allowed opacity-50',
    price: '+₹5,000',
  },
} as const

const COLS = ['A', 'B', 'C', 'D', 'E', 'F'] as const
const AISLE_AFTER = 2 // aisle between C and D

/* ─── skeleton row ─────────────────────────────────────── */
function SkeletonRow() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-5 h-3 rounded bg-slate-200 animate-pulse" />
      <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(7, 34px)' }}>
        {[0, 1, 2, 'aisle', 3, 4, 5].map((c, i) =>
          c === 'aisle'
            ? <div key="a" className="w-[34px]" />
            : <div key={i} className="w-[34px] h-[34px] rounded-lg bg-slate-200 animate-pulse" />
        )}
      </div>
    </div>
  )
}

/* ─── main component ───────────────────────────────────── */
interface SeatPickerProps {
  seats: SeatResult[]          // all seats for this flight
  loading: boolean
  selectedSeatNumber: string
  onSelect: (seatNumber: string) => void
}

export function SeatPicker({ seats, loading, selectedSeatNumber, onSelect }: SeatPickerProps) {
  const [activeClass, setActiveClass] = useState<'ALL' | 'ECONOMY' | 'BUSINESS' | 'FIRST'>('ALL')
  const [showAll, setShowAll] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)

  /* animate seats in when loaded */
  useEffect(() => {
    if (loading || !mapRef.current) return
    const btns = mapRef.current.querySelectorAll('.seat-btn')
    if (!btns.length) return
    gsap.fromTo(btns,
      { opacity: 0, scale: 0.6 },
      { opacity: 1, scale: 1, duration: 0.25, stagger: { amount: 0.5, from: 'start' }, ease: 'back.out(1.5)', clearProps: 'transform' }
    )
  }, [loading, activeClass])

  /* animate class tab switch */
  function switchClass(cls: typeof activeClass) {
    setActiveClass(cls)
    setShowAll(false)
    if (mapRef.current) {
      gsap.fromTo(mapRef.current, { opacity: 0.4 }, { opacity: 1, duration: 0.2 })
    }
  }

  /* seat click */
  function handleClick(seat: SeatResult) {
    if (seat.status !== 'AVAILABLE') return
    const next = seat.seatNumber === selectedSeatNumber ? '' : seat.seatNumber
    onSelect(next)

    // bounce animation
    if (mapRef.current) {
      const btn = mapRef.current.querySelector(`[data-seat="${seat.seatNumber}"]`)
      if (btn) gsap.fromTo(btn, { scale: 0.75 }, { scale: 1, duration: 0.3, ease: 'back.out(2.5)' })
    }
  }

  /* build rows */
  const allRows = Array.from(new Set(seats.map((s) => parseInt(s.seatNumber, 10)))).sort((a, b) => a - b)
  const visibleSeats = activeClass === 'ALL' ? seats : seats.filter((s) => s.seatClass === activeClass)
  const visibleRows = Array.from(new Set(visibleSeats.map((s) => parseInt(s.seatNumber, 10)))).sort((a, b) => a - b)
  const displayRows = showAll ? visibleRows : visibleRows.slice(0, 15)

  /* stats */
  const stats = {
    available: seats.filter((s) => s.status === 'AVAILABLE').length,
    held: seats.filter((s) => s.status === 'HELD').length,
    booked: seats.filter((s) => s.status === 'BOOKED').length,
  }

  const selectedSeat = seats.find((s) => s.seatNumber === selectedSeatNumber)

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

      {/* ── header ── */}
      <div className="bg-gradient-to-r from-[#00236f] to-[#1e3a8a] px-6 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-white font-bold text-lg leading-tight">Select Your Seat</h2>
            <p className="text-blue-200 text-xs mt-1">Click any available seat to select it</p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl flex-shrink-0">
            <Clock size={13} className="text-blue-300" />
            <span className="text-white text-xs font-semibold">15 min hold on checkout</span>
          </div>
        </div>

        {/* legend */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4">
          {[
            { dot: 'bg-slate-300', label: `${stats.available} Available` },
            { dot: 'bg-amber-400', label: `${stats.held} Held` },
            { dot: 'bg-red-400', label: `${stats.booked} Booked` },
            { dot: 'bg-[#1e3a8a] ring-2 ring-white ring-offset-1 ring-offset-transparent', label: 'Selected' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded-sm flex-shrink-0 ${item.dot}`} />
              <span className="text-blue-100 text-[11px] font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── class tabs ── */}
      <div className="flex gap-2 px-5 py-3 bg-slate-50 border-b border-slate-100 overflow-x-auto no-scrollbar">
        {(['ALL', 'ECONOMY', 'BUSINESS', 'FIRST'] as const).map((cls) => {
          const cnt = cls === 'ALL'
            ? seats.filter((s) => s.status === 'AVAILABLE').length
            : seats.filter((s) => s.seatClass === cls && s.status === 'AVAILABLE').length
          const active = activeClass === cls
          return (
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap border transition-all flex-shrink-0 ${
                active
                  ? 'bg-[#1e3a8a] text-white border-[#1e3a8a] shadow-md shadow-blue-900/20'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-[#1e3a8a]'
              }`}
              key={cls}
              onClick={() => switchClass(cls)}
              type="button"
            >
              {cls === 'ALL' ? 'All Classes' : CLS[cls].label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>{cnt}</span>
            </button>
          )
        })}
      </div>

      {/* ── seat map ── */}
      <div className="px-5 py-5 overflow-x-auto">

        {/* nose */}
        <div className="flex justify-center mb-5">
          <div className="flex flex-col items-center gap-0">
            <div className="w-16 h-8 bg-slate-100 rounded-t-full" />
            <div className="bg-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-widest px-6 py-1.5 rounded-b-full">
              ✈ Front
            </div>
          </div>
        </div>

        {/* col headers */}
        <div className="flex justify-center mb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-5" /> {/* row label spacer */}
            <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(7, 34px)' }}>
              {['A', 'B', 'C', '', 'D', 'E', 'F'].map((col, i) => (
                <div key={i} className="w-[34px] h-6 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  {col}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* rows */}
        <div ref={mapRef} className="flex flex-col gap-1.5 items-center">
          {loading
            ? Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)
            : displayRows.map((rowNum) => {
                const isExit = rowNum === 10 || rowNum === 20
                const rowClass = visibleSeats.find((s) => parseInt(s.seatNumber, 10) === rowNum)?.seatClass ?? 'ECONOMY'

                return (
                  <div key={rowNum} className="w-full flex flex-col items-center">
                    {isExit && (
                      <div className="flex items-center gap-2 w-full max-w-[310px] my-1.5">
                        <div className="flex-1 border-t border-dashed border-emerald-300" />
                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest px-1">Exit</span>
                        <div className="flex-1 border-t border-dashed border-emerald-300" />
                      </div>
                    )}

                    <div className="flex items-center gap-1.5">
                      {/* row number */}
                      <span className="w-5 text-right text-[10px] font-bold text-slate-300 flex-shrink-0">{rowNum}</span>

                      {/* seats */}
                      <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(7, 34px)' }}>
                        {(['A', 'B', 'C', null, 'D', 'E', 'F'] as (string | null)[]).map((col, ci) => {
                          if (col === null) {
                            return (
                              <div key="aisle" className="w-[34px] flex items-center justify-center">
                                <div className="w-px h-5 bg-slate-200" />
                              </div>
                            )
                          }

                          const seat = seats.find(
                            (s) => s.seatNumber === `${rowNum}${col}` &&
                              (activeClass === 'ALL' || s.seatClass === activeClass)
                          )

                          if (!seat) return <div key={ci} className="w-[34px] h-[34px]" />

                          const isSelected = seat.seatNumber === selectedSeatNumber
                          const isAvail = seat.status === 'AVAILABLE'
                          const isHeld = seat.status === 'HELD'
                          const cfg = CLS[seat.seatClass] ?? CLS.ECONOMY

                          let cls = `seat-btn w-[34px] h-[34px] rounded-lg border-2 text-[10px] font-bold flex items-center justify-center transition-all duration-150 relative `
                          if (isSelected) cls += cfg.selected
                          else if (isAvail) cls += cfg.seat + ' cursor-pointer'
                          else if (isHeld) cls += cfg.held
                          else cls += cfg.booked

                          return (
                            <button
                              className={cls}
                              data-seat={seat.seatNumber}
                              disabled={!isAvail}
                              key={seat.seatNumber}
                              onClick={() => handleClick(seat)}
                              title={`${seat.seatNumber} · ${cfg.label} · ${isAvail ? 'Available' : isHeld ? 'Held' : 'Booked'}`}
                              type="button"
                            >
                              {isSelected
                                ? <Check size={13} strokeWidth={3} />
                                : isHeld
                                ? <Clock size={10} />
                                : !isAvail
                                ? <span className="text-[11px]">×</span>
                                : <span className="text-[9px] opacity-60">{col}</span>
                              }
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })
          }
        </div>

        {/* show more / less */}
        {!loading && visibleRows.length > 15 && (
          <div className="flex justify-center mt-4">
            <button
              className="flex items-center gap-1.5 text-sm font-semibold text-[#1e3a8a] hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-5 py-2 rounded-full transition-all"
              onClick={() => setShowAll((v) => !v)}
              type="button"
            >
              {showAll ? <><ChevronUp size={15} /> Show less</> : <><ChevronDown size={15} /> Show all {visibleRows.length} rows</>}
            </button>
          </div>
        )}

        {/* tail */}
        <div className="flex justify-center mt-5">
          <div className="flex flex-col items-center gap-0">
            <div className="bg-slate-100 text-slate-400 text-[10px] font-bold uppercase tracking-widest px-6 py-1.5 rounded-t-full">
              Rear
            </div>
            <div className="w-16 h-6 bg-slate-100 rounded-b-full" />
          </div>
        </div>
      </div>

      {/* ── class price guide ── */}
      <div className="px-5 pb-4 grid grid-cols-3 gap-2">
        {(['ECONOMY', 'BUSINESS', 'FIRST'] as const).map((cls) => {
          const cnt = seats.filter((s) => s.seatClass === cls && s.status === 'AVAILABLE').length
          const cfg = CLS[cls]
          return (
            <div key={cls} className={`rounded-xl border px-3 py-2.5 ${cfg.badge} border-current/20`}>
              <p className="text-[10px] font-black uppercase tracking-wider opacity-70">{cfg.label}</p>
              <p className="text-sm font-bold mt-0.5">{cfg.price}</p>
              <p className="text-[10px] opacity-60 mt-0.5">{cnt} seats left</p>
            </div>
          )
        })}
      </div>

      {/* ── selected seat banner ── */}
      {selectedSeat && (
        <div className="mx-5 mb-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1e3a8a] flex items-center justify-center flex-shrink-0">
              <Check size={18} className="text-white" strokeWidth={3} />
            </div>
            <div>
              <p className="font-bold text-[#1e3a8a] text-sm">Seat {selectedSeat.seatNumber} selected</p>
              <p className="text-blue-500 text-xs mt-0.5">
                {CLS[selectedSeat.seatClass]?.label} · {CLS[selectedSeat.seatClass]?.price}
              </p>
            </div>
          </div>
          <button
            className="text-xs text-slate-400 hover:text-red-500 font-semibold transition-colors flex-shrink-0"
            onClick={() => onSelect('')}
            type="button"
          >
            Change
          </button>
        </div>
      )}

      {/* ── no seat warning ── */}
      {!loading && !selectedSeat && (
        <div className="mx-5 mb-5 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <Info size={14} className="text-amber-500 flex-shrink-0" />
          <p className="text-amber-700 text-xs font-medium">Please select a seat to continue to payment</p>
        </div>
      )}
    </div>
  )
}
