// export { default } from '../../app/admin/analytics/page'
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AdminHeader } from "@/components/admin/admin-header"
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  Plane,
  MapPin,
  ShoppingBag,
  RefreshCw,
  Users,
} from "lucide-react"
import { useAuth } from "@/context/auth-context"
import {
  bookingApi,
  flightApi,
  airportApi,
  airlineApi,
  type Airport,
  type Airline,
  type PlatformBookingsSummaryResponse,
} from "@/services/api"

export default function AnalyticsPage() {
  const navigate = useNavigate()
  const { isLoggedIn, isAuthReady } = useAuth()

  const [airports, setAirports] = useState<Airport[]>([])
  const [airlines, setAirlines] = useState<Airline[]>([])
  const [summary, setSummary] = useState<PlatformBookingsSummaryResponse | null>(null)
  const [totalFlights, setTotalFlights] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthReady) return
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    void loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, isAuthReady, navigate])

  const loadData = async () => {
    try {
      setLoading(true)

      // 4 lightweight calls — no per-flight fan-out
      const [airportsData, airlinesData, summaryData, pagedFlights] = await Promise.all([
        airportApi.getAll(true).catch(() => [] as Airport[]),
        airlineApi.getAll(true).catch(() => [] as Airline[]),
        bookingApi.getPlatformSummary().catch(err => {
          console.error('[AdminAnalytics] Error loading summary:', err)
          return null
        }),
        // Fetch page 0 with size 1 just to read totalElements — no heavy data transfer
        flightApi.getAdminPaginated(0, 1).catch(() => ({ content: [], totalElements: 0, totalPages: 1, currentPage: 0, pageSize: 1 })),
      ])

      setAirports(airportsData)
      setAirlines(airlinesData)
      setSummary(summaryData)
      setTotalFlights(pagedFlights.totalElements)
    } catch (err) {
      console.error('[AdminAnalytics] Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const totalRevenue = summary?.totalRevenue ?? 0
  const totalBookings = summary?.totalBookings ?? 0
  const totalPassengers = summary?.totalPassengers ?? 0
  const avgRevenuePerFlight = totalFlights > 0 ? totalRevenue / totalFlights : 0

  const stats = [
    {
      label: 'Total Revenue',
      value: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalRevenue),
      icon: DollarSign,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      label: 'Avg Revenue / Flight',
      value: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(avgRevenuePerFlight),
      icon: BarChart3,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      label: 'Confirmed Bookings',
      value: totalBookings.toLocaleString(),
      icon: ShoppingBag,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      label: 'Total Passengers',
      value: totalPassengers.toLocaleString(),
      icon: Users,
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
    },
  ]

  const topAirlines = airlines.slice(0, 5)
  const topAirports = airports.slice(0, 5)

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 pt-24">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-sky-600 mb-2">Analytics Dashboard</h1>
            <p className="text-slate-600">Comprehensive platform analytics and insights</p>
          </div>
          <button
            type="button"
            onClick={() => void loadData()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-600 mt-4">Loading analytics...</p>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${stat.textColor}`} />
                      </div>
                      <span className="text-sm font-bold text-slate-500">All time</span>
                    </div>
                    <p className="text-3xl font-black text-slate-800 mb-1">{stat.value}</p>
                    <p className="text-sm text-slate-500 font-bold">{stat.label}</p>
                  </div>
                )
              })}
            </div>

            {/* Top Airlines & Airports */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Plane className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800">Top Airlines</h2>
                    <p className="text-sm text-slate-500">By registration order</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {topAirlines.map((airline, index) => (
                    <div key={airline.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${
                          index === 0 ? 'bg-yellow-100 text-yellow-700' :
                          index === 1 ? 'bg-slate-200 text-slate-700' :
                          index === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{airline.name}</p>
                          <p className="text-sm text-slate-500">{airline.iataCode}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        airline.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {airline.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800">Top Airports</h2>
                    <p className="text-sm text-slate-500">Most active airports</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {topAirports.map((airport, index) => (
                    <div key={airport.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${
                          index === 0 ? 'bg-yellow-100 text-yellow-700' :
                          index === 1 ? 'bg-slate-200 text-slate-700' :
                          index === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{airport.city}</p>
                          <p className="text-sm text-slate-500">{airport.iataCode} - {airport.name}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        airport.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {airport.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Platform Overview */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800">Platform Overview</h2>
                  <p className="text-sm text-slate-500">Key metrics at a glance</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-xl p-6 text-center">
                  <Plane className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <p className="text-3xl font-black text-blue-700 mb-1">{totalFlights.toLocaleString()}</p>
                  <p className="text-sm text-blue-600 font-bold">Total Flights</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-6 text-center">
                  <MapPin className="w-8 h-8 text-orange-600 mx-auto mb-3" />
                  <p className="text-3xl font-black text-orange-700 mb-1">{airports.length}</p>
                  <p className="text-sm text-orange-600 font-bold">Total Airports</p>
                </div>
                <div className="bg-green-50 rounded-xl p-6 text-center">
                  <Plane className="w-8 h-8 text-green-600 mx-auto mb-3" />
                  <p className="text-3xl font-black text-green-700 mb-1">{airlines.length}</p>
                  <p className="text-sm text-green-600 font-bold">Total Airlines</p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
