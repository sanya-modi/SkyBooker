import { useState, useEffect } from "react"
import { Link } from 'react-router-dom'
import { Plane, Calendar, Users, TrendingUp, Clock, CheckCircle2, Plus, ArrowRight } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { flightApi, getAllAirportsCached, getAllAirlinesCached, seatApi, type FlightResult, type Airport, type Airline, type SeatCountUpdateEvent } from "@/services/api"

export default function AirlineDashboard() {
  const { profile } = useAuth()
  const [flights, setFlights] = useState<FlightResult[]>([])
  const [allFlights, setAllFlights] = useState<FlightResult[]>([])
  const [airports, setAirports] = useState<Airport[]>([])
  const [airlines, setAirlines] = useState<Airline[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.airlineId) return

    Promise.all([flightApi.getByAirline(profile.airlineId), getAllAirportsCached(), getAllAirlinesCached()])
      .then(([f, a, al]) => {
        // Store all flights for stats calculation
        setAllFlights(f)
        // Filter to show only ON_TIME flights in the table
        const onTimeFlights = f.filter(flight => flight.status === 'ON_TIME')
        setFlights(onTimeFlights)
        setAirports(a)
        setAirlines(al)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [profile?.airlineId])

  // Subscribe to real-time seat count updates
  useEffect(() => {
    if (flights.length === 0) return

    const streams: EventSource[] = []
    for (const flight of flights) {
      try {
        const stream = seatApi.createSeatStream(flight.id)
        stream.addEventListener('seat-count', (event) => {
          try {
            const payload = JSON.parse((event as MessageEvent).data) as SeatCountUpdateEvent
            setFlights(prev => prev.map(f => 
              f.id === payload.flightId ? { ...f, availableSeats: payload.availableSeats } : f
            ))
          } catch {
            // ignore
          }
        })
        streams.push(stream)
      } catch {
        // ignore
      }
    }

    return () => streams.forEach(s => s.close())
  }, [flights.map(f => f.id).join(',')]) // eslint-disable-line

  const getAirport = (id: number) => airports.find(a => a.id === id)
  const myAirline = airlines.find(a => a.id === profile?.airlineId)

  const stats = [
    { label: 'On-Time Flights', value: flights.length, icon: Plane, bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
    { label: 'Booked Seats', value: allFlights.reduce((s, f) => s + (f.totalSeats - f.availableSeats), 0), icon: CheckCircle2, bgColor: 'bg-green-50', textColor: 'text-green-600' },
    { label: 'Total Seats', value: allFlights.reduce((s, f) => s + f.totalSeats, 0), icon: Users, bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
    { label: 'Available Seats', value: allFlights.reduce((s, f) => s + f.availableSeats, 0), icon: CheckCircle2, bgColor: 'bg-orange-50', textColor: 'text-orange-600' },
  ]

  const quickActions = [
    { label: 'Add New Flight', href: '/airline/flights/add', icon: Plus, color: 'from-[#00236f] to-[#1e3a8a]' },
    { label: 'Manage Flights', href: '/airline/flights', icon: Calendar, color: 'from-blue-500 to-blue-600' },
    { label: 'Configure Seats', href: '/airline/seats', icon: Users, color: 'from-purple-500 to-purple-600' },
    { label: 'Update Status', href: '/airline/operations', icon: Clock, color: 'from-green-500 to-green-600' },
  ]

  return (
    <div>
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-[#00236f] mb-1">Airline Dashboard</h1>
          {myAirline && <p className="text-lg font-bold text-slate-700">{myAirline.name} ({myAirline.iataCode})</p>}
          <p className="text-slate-500 text-sm mt-1">Manage your flights, seats, and operations</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-black text-slate-800 mb-1">{stat.value}</p>
                <p className="text-sm text-slate-500 font-bold">{stat.label}</p>
              </div>
            )
          })}
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-black text-slate-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link key={action.href} to={action.href} className={`bg-gradient-to-r ${action.color} text-white rounded-xl p-6 hover:shadow-lg transition-all group`}>
                  <Icon className="w-8 h-8 mb-3" />
                  <p className="font-bold text-lg mb-1">{action.label}</p>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              )
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-slate-800">On-Time Flights</h2>
            <Link to="/airline/flights" className="text-[#00236f] font-bold hover:underline flex items-center gap-2">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-[#00236f] border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-600 mt-4">Loading flights...</p>
            </div>
          ) : flights.length === 0 ? (
            <div className="text-center py-12">
              <Plane className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 font-bold mb-2">No on-time flights</p>
              <p className="text-slate-500 text-sm">All flights are currently on schedule</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-bold text-slate-600">Flight</th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-slate-600">Route</th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-slate-600">Departure</th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-slate-600">Seats</th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-slate-600">Fare</th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-slate-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {flights.slice(0, 5).map((flight) => {
                    const dep = getAirport(flight.departureAirportId)
                    const arr = getAirport(flight.arrivalAirportId)
                    return (
                      <tr key={flight.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-4 px-4">
                          <p className="font-bold text-slate-800">{flight.flightNumber}</p>
                          <p className="text-xs text-slate-500">{flight.aircraftType}</p>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-slate-800">{dep?.iataCode ?? '—'}</span>
                            <Plane className="w-3 h-3 text-slate-400 rotate-90" />
                            <span className="font-bold text-slate-800">{arr?.iataCode ?? '—'}</span>
                          </div>
                          <p className="text-xs text-slate-500">{dep?.city} → {arr?.city}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-slate-600">{new Date(flight.departureTime).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          <p className="text-xs text-slate-500">{new Date(flight.departureTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-slate-600">{flight.availableSeats} / {flight.totalSeats}</p>
                          <p className="text-xs text-slate-500">{Math.round((flight.availableSeats / flight.totalSeats) * 100)}% free</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-bold text-slate-800">₹{flight.baseFare.toLocaleString()}</p>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-bold ${
                            flight.status === 'SCHEDULED' ? 'bg-green-50 text-green-700' :
                            flight.status === 'DELAYED' ? 'bg-yellow-50 text-yellow-700' :
                            flight.status === 'CANCELLED' ? 'bg-red-50 text-red-700' :
                            'bg-blue-50 text-blue-700'
                          }`}>{flight.status}</span>
                        </td>
                        <td className="py-4 px-4">
                          <Link to={`/airline/flights/edit/${flight.id}`} className="text-[#00236f] font-bold hover:underline text-sm">Edit</Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
