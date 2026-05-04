/**
 * EXAMPLE: How to add real-time seat counts to flight cards
 * 
 * This shows how to integrate the useSeatRealtime hook into any component
 * that displays flight information.
 */

import { useSeatRealtime } from '../hooks/use-seat-realtime'
import type { EnrichedFlightResult } from '../services/api'

interface FlightCardWithRealtimeSeatsProps {
  flight: EnrichedFlightResult
}

export function FlightCardWithRealtimeSeats({ flight }: FlightCardWithRealtimeSeatsProps) {
  // Connect to real-time seat updates for this flight
  const { seatCount, loading } = useSeatRealtime(flight.id)

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      {/* Flight Info */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg">{flight.flightNumber}</h3>
          <p className="text-sm text-slate-500">
            {flight.departureAirport?.city} → {flight.arrivalAirport?.city}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-[#00236f]">
            ₹{flight.baseFare.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500">per person</p>
        </div>
      </div>

      {/* Real-time Seat Availability */}
      <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
        {loading ? (
          <div className="flex gap-2">
            <div className="h-8 w-20 bg-slate-200 rounded animate-pulse" />
            <div className="h-8 w-20 bg-slate-200 rounded animate-pulse" />
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-semibold text-slate-700">
                {seatCount?.availableSeats ?? flight.availableSeats} seats available
              </span>
            </div>
            
            {seatCount && seatCount.availableSeats < 10 && (
              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                Only {seatCount.availableSeats} left!
              </span>
            )}
          </>
        )}
      </div>

      {/* Booking Button */}
      <button className="w-full mt-4 bg-[#00236f] text-white font-bold py-3 rounded-lg hover:bg-[#1e3a8a] transition-colors">
        Book Now
      </button>
    </div>
  )
}

/**
 * USAGE IN FLIGHT RESULTS PAGE:
 * 
 * import { FlightCardWithRealtimeSeats } from '@/components/flights/flight-card-realtime'
 * 
 * function FlightResultsPage() {
 *   const [flights, setFlights] = useState<EnrichedFlightResult[]>([])
 *   
 *   return (
 *     <div className="grid gap-4">
 *       {flights.map(flight => (
 *         <FlightCardWithRealtimeSeats key={flight.id} flight={flight} />
 *       ))}
 *     </div>
 *   )
 * }
 * 
 * WHAT HAPPENS:
 * - Each flight card connects to its own SSE stream
 * - When ANY user books a seat on that flight, ALL cards update instantly
 * - Available seat count decreases in real-time
 * - "Only X left!" warning appears automatically when seats are low
 * - No manual refresh needed
 */

/**
 * PERFORMANCE NOTE:
 * 
 * If you have many flights on one page (e.g., 20+ flights), consider:
 * 
 * 1. Only connecting to SSE for visible flights (use Intersection Observer)
 * 2. Lazy loading the real-time updates
 * 3. Using a single WebSocket connection instead of multiple SSE streams
 * 
 * For most use cases (< 10 flights per page), the current SSE approach works perfectly.
 */
