// export { default } from '../../app/admin/analytics/page'
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { AdminHeader } from "@/components/admin/admin-header"
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  Users,
  Plane,
  MapPin,
  ShoppingBag,
  PieChart
} from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { flightApi, airportApi, airlineApi, type FlightResult, type Airport, type Airline } from "@/services/api"

export default function AnalyticsPage() {
  const navigate = useNavigate()
  const { isLoggedIn, isAuthReady } = useAuth()
  const [flights, setFlights] = useState<FlightResult[]>([])
  const [airports, setAirports] = useState<Airport[]>([])
  const [airlines, setAirlines] = useState<Airline[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthReady) return
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    loadData()
    const intervalId = window.setInterval(loadData, 30000)

    return () => window.clearInterval(intervalId)
  }, [isLoggedIn, isAuthReady, navigate])

  const loadData = async () => {
    try {
      setLoading(true)
      const [flightsData, airportsData, airlinesData] = await Promise.all([
        flightApi.getAll(),
        airportApi.getAll(true),
        airlineApi.getAll(true)
      ])
      setFlights(flightsData)
      setAirports(airportsData)
      setAirlines(airlinesData)
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const totalRevenue = flights.reduce((sum, f) => {
    const bookedSeats = f.totalSeats - f.availableSeats
    return sum + (bookedSeats * f.baseFare)
  }, 0)

  const totalBookings = flights.reduce((sum, f) => sum + (f.totalSeats - f.availableSeats), 0)
  const totalSeats = flights.reduce((sum, f) => sum + f.totalSeats, 0)
  const occupancyRate = totalSeats > 0 ? ((totalBookings / totalSeats) * 100).toFixed(1) : '0'
  const activeFlights = flights.filter(f => f.status === 'ON_TIME' || f.status === 'DELAYED').length

  const stats = [
    {
      label: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      change: '+15.3%'
    },
    {
      label: 'Total Bookings',
      value: totalBookings,
      icon: ShoppingBag,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      change: '+12.5%'
    },
    {
      label: 'Active Flights',
      value: activeFlights,
      icon: Plane,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      change: '+8.2%'
    },
    {
      label: 'Occupancy Rate',
      value: `${occupancyRate}%`,
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      change: '+5.7%'
    }
  ]

  const topAirlines = airlines.slice(0, 5)
  const topAirports = airports.slice(0, 5)

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-sky-600 mb-2">Analytics Dashboard</h1>
          <p className="text-slate-600">Comprehensive platform analytics and insights</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-600 mt-4">Loading analytics...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat) => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} className="bg-white rounded-2xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${stat.textColor}`} />
                      </div>
                      <span className="text-sm font-bold text-green-600">{stat.change}</span>
                    </div>
                    <p className="text-3xl font-black text-slate-800 mb-1">{stat.value}</p>
                    <p className="text-sm text-slate-500 font-bold">{stat.label}</p>
                  </div>
                )
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Plane className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800">Top Airlines</h2>
                    <p className="text-sm text-slate-500">By number of flights</p>
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
                  <p className="text-3xl font-black text-blue-700 mb-1">{flights.length}</p>
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
