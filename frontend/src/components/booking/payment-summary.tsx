import { ArrowRight, Clock, Loader2, MapPin, Plane, ShieldCheck } from 'lucide-react'
import type { EnrichedFlightResult } from '../../services/api'

function fmt(n: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}
function fmtTime(v: string) {
  return new Date(v).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
}

export function PaymentSummary({
  flight,
  seatLabel,
  seatClass,
  taxes,
  seatCharge,
  mealCharge,
  baggageCharge,
  total,
  buttonLabel,
  loading,
  onAction,
}: {
  flight: EnrichedFlightResult | null
  seatLabel: string
  seatClass?: string
  taxes: number
  seatCharge: number
  mealCharge: number
  baggageCharge: number
  total: number
  buttonLabel: string
  loading?: boolean
  onAction: () => void
}) {
  const lines = [
    { label: 'Base Fare', value: Number(flight?.baseFare ?? 0) },
    { label: 'Taxes & Fees (12%)', value: taxes },
    { label: `Seat ${seatLabel || '—'} ${seatClass ? `(${seatClass})` : ''}`, value: seatCharge },
    ...(mealCharge > 0 ? [{ label: 'Meal', value: mealCharge }] : []),
    ...(baggageCharge > 0 ? [{ label: 'Extra Baggage', value: baggageCharge }] : []),
  ]

  return (
    <aside className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden sticky top-[76px]">
      {/* Flight summary */}
      <div className="bg-gradient-to-br from-[#00236f] to-[#1e3a8a] px-5 py-5">
        <p className="text-blue-200 text-[10px] font-bold uppercase tracking-widest mb-3">Your Flight</p>
        {flight ? (
          <>
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-white/15 px-2 py-1 rounded-lg">
                <span className="text-white font-black text-sm">{flight.airline?.iataCode ?? 'SB'}</span>
              </div>
              <div>
                <p className="text-white font-bold text-sm">{flight.airline?.name ?? 'Airline'}</p>
                <p className="text-blue-200 text-xs">{flight.flightNumber} · {flight.aircraftType}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-white font-black text-xl leading-none">{fmtTime(flight.departureTime)}</p>
                <p className="text-blue-300 text-xs font-bold mt-0.5">{flight.departureAirport?.iataCode}</p>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <Plane size={14} className="text-blue-300" />
                <div className="w-full h-px bg-white/20" />
                <p className="text-blue-300 text-[10px] font-medium">Direct</p>
              </div>
              <div className="text-center">
                <p className="text-white font-black text-xl leading-none">{fmtTime(flight.arrivalTime)}</p>
                <p className="text-blue-300 text-xs font-bold mt-0.5">{flight.arrivalAirport?.iataCode}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-3">
              <MapPin size={11} className="text-blue-300" />
              <p className="text-blue-200 text-xs">
                {flight.departureAirport?.city} → {flight.arrivalAirport?.city}
              </p>
            </div>
          </>
        ) : (
          <p className="text-blue-200 text-sm">No flight selected</p>
        )}
      </div>

      {/* Fare breakdown */}
      <div className="px-5 py-4 border-b border-slate-100">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Fare Breakdown</p>
        <div className="flex flex-col gap-2.5">
          {lines.map((line) => (
            <div className="flex justify-between items-center" key={line.label}>
              <span className="text-sm text-slate-500 font-medium">{line.label}</span>
              <span className="text-sm font-bold text-slate-800">{fmt(line.value)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Total */}
      <div className="px-5 py-4 border-b border-slate-100">
        <div className="flex justify-between items-center">
          <span className="font-bold text-slate-700">Total Amount</span>
          <span className="text-2xl font-black text-[#1e3a8a]">{fmt(total)}</span>
        </div>
        <p className="text-slate-400 text-xs mt-1">Inclusive of all taxes</p>
      </div>

      {/* Seat hold warning */}
      {seatLabel && (
        <div className="px-5 py-3 bg-amber-50 border-b border-amber-100 flex items-center gap-2">
          <Clock size={13} className="text-amber-500 flex-shrink-0" />
          <p className="text-amber-700 text-xs font-medium">Seat {seatLabel} held for 15 minutes</p>
        </div>
      )}

      {/* CTA */}
      <div className="px-5 py-4">
        <button
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all ${
            loading
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-[#22c55e] text-white hover:bg-[#16a34a] shadow-lg shadow-green-500/25 active:scale-[0.98]'
          }`}
          disabled={loading}
          onClick={onAction}
          type="button"
        >
          {loading ? (
            <><Loader2 size={16} className="animate-spin" /> Processing…</>
          ) : (
            <>{buttonLabel} <ArrowRight size={16} /></>
          )}
        </button>

        <div className="flex items-center justify-center gap-1.5 mt-3">
          <ShieldCheck size={13} className="text-slate-400" />
          <p className="text-slate-400 text-xs font-medium">Secured by SkyBooker Pay</p>
        </div>
      </div>
    </aside>
  )
}
