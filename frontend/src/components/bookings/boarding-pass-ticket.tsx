import { Plane } from 'lucide-react'
import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

interface PassengerInfo {
  firstName: string
  lastName: string
}

interface AirportInfo {
  iataCode: string
  name?: string
}

interface FlightInfo {
  flightNumber: string
  departureTime: string
  departureAirport?: AirportInfo
  arrivalAirport?: AirportInfo
}

interface BoardingPassTicketProps {
  passenger: PassengerInfo
  flight: FlightInfo
  seatNumber?: string | null
  pnr?: string
  className?: string
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

/* Generate a gate from PNR or flight number */
function deriveGate(pnr?: string, flightNumber?: string): string {
  if (!pnr && !flightNumber) return 'A1'
  const source = pnr || flightNumber || ''
  const num = (source.charCodeAt(0) % 9) + 1
  return `${source.charAt(0)}${num}`
}

export function BoardingPassTicket({ passenger, flight, seatNumber, pnr, className = '' }: BoardingPassTicketProps) {
  const [qrCode, setQrCode] = useState('')
  const gate = deriveGate(pnr, flight.flightNumber)

  useEffect(() => {
    if (passenger && pnr) {
      const qrData = `Name: ${passenger.firstName} ${passenger.lastName}\nPNR: ${pnr}\nFlight: ${flight.flightNumber}\nRoute: ${flight.departureAirport?.iataCode} to ${flight.arrivalAirport?.iataCode}`
      
      QRCode.toDataURL(qrData, { width: 220, margin: 1, color: { dark: '#0f172a', light: '#ffffff' } })
        .then(setQrCode)
        .catch(console.error)
    }
  }, [passenger, pnr, flight])

  return (
    <div 
      className={`rounded-xl shadow-xl overflow-hidden mb-6 flex flex-col md:flex-row border border-slate-200 ${className}`}
      style={{ backgroundImage: `url('/BlankMap-World_gray.svg')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundBlendMode: 'multiply', backgroundColor: 'rgba(255,255,255,0.95)' }}
    >
      {/* ── LEFT / MAIN SECTION ── */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Main Header */}
        <div className="bg-[#3b82f6] px-8 py-4 flex items-center">
          <Plane size={24} className="text-white rotate-45 fill-white mr-3" />
          <span className="text-white font-bold tracking-widest text-lg sm:text-xl uppercase">
            Boarding Pass
          </span>
        </div>

        {/* Main Body */}
        <div className="flex-1 flex relative bg-white" style={{ backgroundImage: `url('/BlankMap-World_gray.svg')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundBlendMode: 'multiply', backgroundColor: 'rgba(255,255,255,0.95)' }}>
          <div className="flex-1 p-8 sm:p-10 flex flex-col justify-between">
            {/* Info Row 1 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              <Field label="Passenger" value={`${passenger.firstName} ${passenger.lastName}`} valueClass="text-sm truncate" />
              <Field label="Flight"    value={flight.flightNumber}                   valueClass="text-sm" />
              <Field label="Date"      value={fmtDate(flight.departureTime)}         valueClass="text-sm" />
              <Field label="Seat No."  value={seatNumber ?? '—'}                     valueClass="text-sm" />
            </div>

            {/* PNR Row */}
            {pnr && (
              <div className="mt-4">
                <Field label="PNR" value={pnr} valueClass="text-base tracking-wider" />
              </div>
            )}

            {/* Info Row 2 (Large Source & Destination) */}
            <div className="flex items-center justify-center gap-6 sm:gap-12 py-12">
              <p className="text-6xl sm:text-7xl font-black text-slate-800 tracking-widest">
                {flight.departureAirport?.iataCode}
              </p>
              <Plane size={48} className="text-slate-800 rotate-45 fill-slate-800 shrink-0" />
              <p className="text-6xl sm:text-7xl font-black text-slate-800 tracking-widest">
                {flight.arrivalAirport?.iataCode}
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
                <p className="text-3xl font-black text-slate-800">{fmtTime(flight.departureTime)}</p>
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
                {flight.departureAirport?.iataCode} <span className="text-slate-400 mx-1">→</span> {flight.arrivalAirport?.iataCode}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Field label="Seat No." value={seatNumber ?? '—'} valueClass="text-sm" />
              <Field label="Boarding Time" value={fmtTime(flight.departureTime)} valueClass="text-sm" />
            </div>

            {pnr && (
              <div className="mt-4">
                <Field label="PNR" value={pnr} valueClass="text-sm tracking-wider" />
              </div>
            )}
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
  )
}