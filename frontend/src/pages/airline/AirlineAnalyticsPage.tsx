// export { default } from '../../app/airline/analytics/page'
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  DollarSign,
  TrendingUp,
  Plane,
  Users,
  Calendar,
  BarChart3,
  PieChart
} from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { flightApi, bookingApi, type FlightResult, type BookingResult } from "@/services/api"

export default function AnalyticsPage() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const [flights, setFlights] = useState<FlightResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    loadData()
  }, [isLoggedIn, navigate])

  const loadData = async () => {
    try {
      setLoading(true)
      const flightsData = await flightApi.getAll()
      setFlights(flightsData)
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Calculate analytics
  const totalFlights = flights.length
  const activeFlights = flights.filter(f => f.status === 'SCHEDULED').length
  const completedFlights = flights.filter(f => f.status === 'COMPLETED').length
  const cancelledFlights = flights.filter(f => f.status === 'CANCELLED').length
  
  const totalSeats = flights.reduce((sum, f) => sum + f.totalSeats, 0)
  const bookedSeats = flights.reduce((sum, f) => sum + (f.totalSeats - f.availableSeats), 0)
  const occupancyRate = totalSeats > 0 ? ((bookedSeats / totalSeats) * 100).toFixed(1) : '0'
  
  const totalRevenue = flights.reduce((sum, f) => {
    const bookedSeatsCount = f.totalSeats - f.availableSeats
    return sum + (bookedSeatsCount * f.baseFare)
  }, 0)

  const avgRevenuePerFlight = totalFlights > 0 ? (totalRevenue / totalFlights).toFixed(2) : '0'

  const stats = [
    {
      label: 'Total Revenue',
      value: `₹${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      change: '+12.5%'
    },
    {
      label: 'Avg Revenue/Flight',
      value: `₹${parseFloat(avgRevenuePerFlight).toLocaleString()}`,
      icon: TrendingUp,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      change: '+8.3%'
    },
    {
      label: 'Occupancy Rate',
      value: `${occupancyRate}%`,
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      change: '+5.2%'
    },
    {
      label: 'Active Flights',
      value: activeFlights,
      icon: Plane,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      change: '+15.0%'
    }
  ]

  const flightsByStatus = [
    { label: 'Scheduled', count: activeFlights, color: 'bg-green-500', percentage: totalFlights > 0 ? ((activeFlights / totalFlights) * 100).toFixed(1) : '0' },
    { label: 'Completed', count: completedFlights, color: 'bg-blue-500', percentage: totalFlights > 0 ? ((completedFlights / totalFlights) * 100).toFixed(1) : '0' },
    { label: 'Cancelled', count: cancelledFlights, color: 'bg-red-500', percentage: totalFlights > 0 ? ((cancelledFlights / totalFlights) * 100).toFixed(1) : '0' },
    { label: 'Delayed', count: flights.filter(f => f.status === 'DELAYED').length, color: 'bg-yellow-500', percentage: totalFlights > 0 ? ((flights.filter(f => f.status === 'DELAYED').length / totalFlights) * 100).toFixed(1) : '0' }
  ]

  const topFlights = [...flights]
    .sort((a, b) => {
      const revenueA = (a.totalSeats - a.availableSeats) * a.baseFare
      const revenueB = (b.totalSeats - b.availableSeats) * b.baseFare
      return revenueB - revenueA
    })
    .slice(0, 5)

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-[#00236f] mb-2">Analytics Dashboard</h1>
          <p className="text-slate-600">Track your flight performance and revenue</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-[#00236f] border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-600 mt-4">Loading analytics...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
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
              {/* Flight Status Distribution */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#00236f] to-[#1e3a8a] rounded-xl flex items-center justify-center">
                    <PieChart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800">Flight Status</h2>
                    <p className="text-sm text-slate-500">Distribution by status</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {flightsByStatus.map((status) => (
                    <div key={status.label}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-slate-700">{status.label}</span>
                        <span className="text-sm font-bold text-slate-800">{status.count} ({status.percentage}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full ${status.color} rounded-full transition-all`}
                          style={{ width: `${status.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Seat Occupancy */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-800">Seat Occupancy</h2>
                    <p className="text-sm text-slate-500">Overall capacity utilization</p>
                  </div>
                </div>

                <div className="text-center mb-6">
                  <div className="relative inline-flex items-center justify-center w-48 h-48">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="80"
                        stroke="#e2e8f0"
                        strokeWidth="16"
                        fill="none"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="80"
                        stroke="url(#gradient)"
                        strokeWidth="16"
                        fill="none"
                        strokeDasharray={`${(parseFloat(occupancyRate) / 100) * 502.4} 502.4`}
                        strokeLinecap="round"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-4xl font-black text-slate-800">{occupancyRate}%</p>
                      <p className="text-sm text-slate-500">Occupied</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-purple-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-purple-700">{bookedSeats}</p>
                    <p className="text-xs text-purple-600">Booked Seats</p>
                  </div>
                  <div className="bg-slate-100 rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-slate-700">{totalSeats - bookedSeats}</p>
                    <p className="text-xs text-slate-600">Available Seats</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Revenue Flights */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-800">Top Revenue Flights</h2>
                  <p className="text-sm text-slate-500">Highest earning flights</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-sm font-bold text-slate-600">Rank</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-slate-600">Flight</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-slate-600">Aircraft</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-slate-600">Booked Seats</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-slate-600">Occupancy</th>
                      <th className="text-left py-3 px-4 text-sm font-bold text-slate-600">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topFlights.map((flight, index) => {
                      const bookedSeatsCount = flight.totalSeats - flight.availableSeats
                      const revenue = bookedSeatsCount * flight.baseFare
                      const occupancy = ((bookedSeatsCount / flight.totalSeats) * 100).toFixed(1)
                      
                      return (
                        <tr key={flight.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-4 px-4">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${
                              index === 0 ? 'bg-yellow-100 text-yellow-700' :
                              index === 1 ? 'bg-slate-200 text-slate-700' :
                              index === 2 ? 'bg-orange-100 text-orange-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {index + 1}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-bold text-slate-800">{flight.flightNumber}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-slate-600">{flight.aircraftType}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-slate-600">{bookedSeatsCount} / {flight.totalSeats}</p>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                                  style={{ width: `${occupancy}%` }}
                                />
                              </div>
                              <span className="text-sm font-bold text-slate-700">{occupancy}%</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-bold text-green-600">₹{revenue.toLocaleString()}</p>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
    </div>
  )
}
