import { useSeatRealtime } from '../../hooks/use-seat-realtime'

interface FlightSeatStatsProps {
  flightId: number
}

export function FlightSeatStats({ flightId }: FlightSeatStatsProps) {
  const { seatCount, analytics, loading } = useSeatRealtime(flightId)

  if (loading) {
    return (
      <div className="flex gap-4">
        <div className="h-16 w-24 bg-slate-200 rounded-lg animate-pulse" />
        <div className="h-16 w-24 bg-slate-200 rounded-lg animate-pulse" />
        <div className="h-16 w-24 bg-slate-200 rounded-lg animate-pulse" />
      </div>
    )
  }

  return (
    <div className="flex gap-4">
      <div className="bg-white rounded-lg border border-slate-200 px-4 py-3">
        <p className="text-xs text-slate-500 font-semibold uppercase">Total Seats</p>
        <p className="text-2xl font-bold text-slate-800">{seatCount?.totalSeats ?? 0}</p>
      </div>
      
      <div className="bg-green-50 rounded-lg border border-green-200 px-4 py-3">
        <p className="text-xs text-green-600 font-semibold uppercase">Available</p>
        <p className="text-2xl font-bold text-green-700">{seatCount?.availableSeats ?? 0}</p>
      </div>
      
      <div className="bg-red-50 rounded-lg border border-red-200 px-4 py-3">
        <p className="text-xs text-red-600 font-semibold uppercase">Booked</p>
        <p className="text-2xl font-bold text-red-700">{seatCount?.bookedSeats ?? 0}</p>
      </div>

      {analytics && (
        <>
          <div className="bg-blue-50 rounded-lg border border-blue-200 px-4 py-3">
            <p className="text-xs text-blue-600 font-semibold uppercase">Revenue</p>
            <p className="text-2xl font-bold text-blue-700">₹{analytics.revenue.toLocaleString()}</p>
          </div>
          
          <div className="bg-purple-50 rounded-lg border border-purple-200 px-4 py-3">
            <p className="text-xs text-purple-600 font-semibold uppercase">Bookings</p>
            <p className="text-2xl font-bold text-purple-700">{analytics.bookingsCount}</p>
          </div>
        </>
      )}
    </div>
  )
}
