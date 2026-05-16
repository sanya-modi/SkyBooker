// export { default } from '../../app/admin/bookings/page'
import { useState, useEffect, useCallback } from "react"
import { useNavigate } from 'react-router-dom'
import { AdminHeader } from "@/components/admin/admin-header"
import {
  ShoppingBag,
  Search,
  Filter,
  Calendar,
  Plane,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useAuth } from "@/context/auth-context"
import {
  bookingApi,
  flightApi,
  airportApi,
  airlineApi,
  type FlightResult,
  type Airport,
  type Airline,
  type PlatformBookingsSummaryResponse,
} from "@/services/api"

const PAGE_SIZE = 20

export default function BookingsPage() {
  const navigate = useNavigate()
  const { isLoggedIn, isAuthReady } = useAuth()

  const [flights, setFlights] = useState<FlightResult[]>([])
  const [airports, setAirports] = useState<Airport[]>([])
  const [airlines, setAirlines] = useState<Airline[]>([])
  const [summary, setSummary] = useState<PlatformBookingsSummaryResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [totalElements, setTotalElements] = useState(0)

  useEffect(() => {
    if (!isAuthReady) return
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    void loadData(0, statusFilter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, isAuthReady, navigate])

  const loadData = useCallback(async (page: number, status: string) => {
    try {
      setLoading(true)

      const [pagedFlights, airportsData, airlinesData, summaryData] = await Promise.all([
        flightApi.getAdminPaginated(page, PAGE_SIZE, status).catch(err => {
          console.error('[AdminBookings] Error loading paginated flights:', err)
          return { content: [], totalElements: 0, totalPages: 1, currentPage: 0, pageSize: PAGE_SIZE }
        }),
        airports.length === 0
          ? airportApi.getAll(true).catch(() => [] as Airport[])
          : Promise.resolve(airports),
        airlines.length === 0
          ? airlineApi.getAll(true).catch(() => [] as Airline[])
          : Promise.resolve(airlines),
        bookingApi.getPlatformSummary().catch(err => {
          console.error('[AdminBookings] Error loading summary:', err)
          return null
        }),
      ])

      setFlights(pagedFlights.content)
      setTotalPages(pagedFlights.totalPages || 1)
      setTotalElements(pagedFlights.totalElements)
      setCurrentPage(pagedFlights.currentPage)
      if (airports.length === 0) setAirports(airportsData as Airport[])
      if (airlines.length === 0) setAirlines(airlinesData as Airline[])
      setSummary(summaryData)
    } catch (err) {
      console.error('[AdminBookings] Error loading data:', err)
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRefresh = () => {
    void loadData(currentPage, statusFilter)
  }

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus)
    setCurrentPage(0)
    void loadData(0, newStatus)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    void loadData(newPage, statusFilter)
  }

  const getAirport = (id: number) => airports.find(a => a.id === id)
  const getAirline = (id: number) => airlines.find(a => a.id === id)

  // Client-side search filter (within current page only)
  const filteredFlights = searchTerm.trim()
    ? flights.filter(f => f.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    : flights

  const totalBookings = summary?.totalBookings ?? 0
  const totalRevenue = summary?.totalRevenue ?? 0

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 pt-24">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-sky-600 mb-2">Booking Monitoring</h1>
            <p className="text-slate-600">Monitor all bookings across the platform</p>
          </div>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <ShoppingBag className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-800 mb-1">{totalBookings.toLocaleString()}</p>
            <p className="text-sm text-slate-500 font-bold">Confirmed Bookings</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <Plane className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-800 mb-1">{totalElements.toLocaleString()}</p>
            <p className="text-sm text-slate-500 font-bold">Total Flights</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-800 mb-1">₹{Number(totalRevenue).toLocaleString()}</p>
            <p className="text-sm text-slate-500 font-bold">Total Revenue</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by flight number (current page)..."
                className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value)}
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

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-600 mt-4">Loading bookings...</p>
            </div>
          ) : filteredFlights.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 font-bold mb-2">No flights found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">Flight</th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">Route</th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">Date</th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">Booked Seats</th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFlights.map((flight) => {
                    const depAirport = getAirport(flight.departureAirportId)
                    const arrAirport = getAirport(flight.arrivalAirportId)
                    const airline = getAirline(flight.airlineId)
                    const bookedSeats = flight.totalSeats - flight.availableSeats

                    return (
                      <tr key={flight.id} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="py-4 px-6">
                          <p className="font-bold text-slate-800">{flight.flightNumber}</p>
                          <p className="text-sm text-slate-500">{airline?.name}</p>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="font-bold text-slate-800">{depAirport?.iataCode ?? '—'}</p>
                              <p className="text-xs text-slate-500">{depAirport?.city}</p>
                            </div>
                            <Plane className="w-4 h-4 text-slate-400 rotate-90" />
                            <div>
                              <p className="font-bold text-slate-800">{arrAirport?.iataCode ?? '—'}</p>
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
                          <p className="font-bold text-slate-800">{bookedSeats} / {flight.totalSeats}</p>
                          <p className="text-xs text-slate-500">{flight.availableSeats} available</p>
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

          {/* Pagination controls */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
              <p className="text-sm text-slate-500">
                Showing page <span className="font-bold text-slate-700">{currentPage + 1}</span> of{' '}
                <span className="font-bold text-slate-700">{totalPages}</span>
                {' '}({totalElements.toLocaleString()} flights total)
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 0 || loading}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages - 1 || loading}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
