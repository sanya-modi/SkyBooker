// export { default } from '../../app/admin/bookings/page'
import { useState, useEffect } from "react"
import { Link, useNavigate } from 'react-router-dom'
import { AdminHeader } from "@/components/admin/admin-header"
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  Download,
  Calendar,
  Users,
  Plane
} from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { bookingApi, flightApi, airportApi, airlineApi, seatApi, type FlightResult, type Airport, type Airline, type FlightAnalyticsEvent } from "@/services/api"

export default function BookingsPage() {
  const navigate = useNavigate()
  const { isLoggedIn, isAuthReady } = useAuth()
  const [flights, setFlights] = useState<FlightResult[]>([])
  const [airports, setAirports] = useState<Airport[]>([])
  const [airlines, setAirlines] = useState<Airline[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [analyticsData, setAnalyticsData] = useState<Map<number, FlightAnalyticsEvent>>(new Map())

  useEffect(() => {
    if (!isAuthReady) return
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    loadData()
  }, [isLoggedIn, isAuthReady, navigate])

  // Subscribe to real-time analytics updates
  useEffect(() => {
    if (flights.length === 0) return

    const streams: EventSource[] = []
    const flightIds = flights.map(f => f.id)

    for (const flightId of flightIds) {
      try {
        const stream = seatApi.createSeatStream(flightId)
        stream.addEventListener('flight-analytics', (event) => {
          try {
            const payload = JSON.parse((event as MessageEvent).data) as FlightAnalyticsEvent
            setAnalyticsData(prev => new Map(prev).set(payload.flightId, payload))
            setFlights(prev => prev.map(f => 
              f.id === payload.flightId ? { ...f, availableSeats: payload.availableSeats } : f
            ))
          } catch {
            // ignore malformed events
          }
        })
        streams.push(stream)
      } catch {
        // ignore stream creation errors
      }
    }

    return () => {
      streams.forEach(stream => stream.close())
    }
  }, [flights.map(f => f.id).join(',')]) // eslint-disable-line

  const loadData = async () => {
    try {
      setLoading(true)
      const [flightsData, airportsData, airlinesData] = await Promise.all([
        flightApi.getAll(),
        airportApi.getAll(true),
        airlineApi.getAll(true)
      ])

      const bookingAnalytics = await Promise.all(
        flightsData.map(async (flight) => {
          try {
            return await bookingApi.getFlightAnalytics(flight.id)
          } catch {
            return null
          }
        }),
      )

      const initialAnalytics = new Map<number, FlightAnalyticsEvent>()
      flightsData.forEach((flight, index) => {
        const analytics = bookingAnalytics[index]
        initialAnalytics.set(flight.id, {
          flightId: flight.id,
          totalSeats: flight.totalSeats,
          bookedSeats: flight.totalSeats - flight.availableSeats,
          availableSeats: flight.availableSeats,
          revenue: Number(analytics?.revenue ?? 0),
          bookingsCount: Number(analytics?.bookingsCount ?? 0),
        })
      })

      setFlights(flightsData)
      setAirports(airportsData)
      setAirlines(airlinesData)
      setAnalyticsData(initialAnalytics)
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const getAirport = (id: number) => airports.find(a => a.id === id)
  const getAirline = (id: number) => airlines.find(a => a.id === id)

  const filteredFlights = flights.filter(flight => {
    const matchesSearch = flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || flight.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalBookings = Array.from(analyticsData.values()).reduce((sum, a) => sum + a.bookingsCount, 0)
  const totalRevenue = Array.from(analyticsData.values()).reduce((sum, a) => sum + Number(a.revenue), 0)

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-sky-600 mb-2">Booking Monitoring</h1>
          <p className="text-slate-600">Monitor all bookings across the platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-800 mb-1">{totalBookings}</p>
            <p className="text-sm text-slate-500 font-bold">Total Bookings</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <Plane className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-800 mb-1">{flights.length}</p>
            <p className="text-sm text-slate-500 font-bold">Total Flights</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-800 mb-1">₹{totalRevenue.toLocaleString()}</p>
            <p className="text-sm text-slate-500 font-bold">Total Revenue</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by flight number..."
                className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent appearance-none"
              >
                <option value="ALL">All Status</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="DELAYED">Delayed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-600 mt-4">Loading bookings...</p>
            </div>
          ) : filteredFlights.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 font-bold mb-2">No bookings found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">Flight</th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">Route</th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">Date</th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">Bookings</th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">Revenue</th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFlights.map((flight) => {
                    const depAirport = getAirport(flight.departureAirportId)
                    const arrAirport = getAirport(flight.arrivalAirportId)
                    const airline = getAirline(flight.airlineId)
                    const analytics = analyticsData.get(flight.id)
                    const bookedSeats = analytics?.bookedSeats ?? (flight.totalSeats - flight.availableSeats)
                    const bookingCount = analytics?.bookingsCount ?? 0
                    const revenue = analytics?.revenue ?? 0
                    
                    return (
                      <tr key={flight.id} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="py-4 px-6">
                          <p className="font-bold text-slate-800">{flight.flightNumber}</p>
                          <p className="text-sm text-slate-500">{airline?.name}</p>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="font-bold text-slate-800">{depAirport?.iataCode}</p>
                              <p className="text-xs text-slate-500">{depAirport?.city}</p>
                            </div>
                            <Plane className="w-4 h-4 text-slate-400 rotate-90" />
                            <div>
                              <p className="font-bold text-slate-800">{arrAirport?.iataCode}</p>
                              <p className="text-xs text-slate-500">{arrAirport?.city}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <p className="text-slate-600">
                            {new Date(flight.departureTime).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-bold text-slate-800">{bookingCount}</p>
                          <p className="text-xs text-slate-500">
                            {bookedSeats} / {flight.totalSeats} seats occupied
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-bold text-green-600">₹{Number(revenue).toLocaleString()}</p>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold ${
                            flight.status === 'SCHEDULED' ? 'bg-green-50 text-green-700' :
                            flight.status === 'DELAYED' ? 'bg-yellow-50 text-yellow-700' :
                            flight.status === 'CANCELLED' ? 'bg-red-50 text-red-700' :
                            'bg-blue-50 text-blue-700'
                          }`}>
                            {flight.status}
                          </span>
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
