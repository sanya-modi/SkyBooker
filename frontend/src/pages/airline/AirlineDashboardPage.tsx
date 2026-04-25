// export { default } from '../../app/airline/dashboard/page'
import { useState, useEffect } from "react"
import { Link, useNavigate } from 'react-router-dom'
import {
  Plane,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  Plus,
  ArrowRight
} from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { flightApi, bookingApi, type FlightResult, type BookingResult } from "@/services/api"

export default function AirlineDashboard() {
  const navigate = useNavigate()
  const { user, isLoggedIn } = useAuth()
  const [flights, setFlights] = useState<FlightResult[]>([])
  const [bookings, setBookings] = useState<BookingResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [flightsData] = await Promise.all([
        flightApi.getAll()
      ])
      setFlights(flightsData)
    } catch (err) {
      console.error('Error loading dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    {
      label: 'Total Flights',
      value: flights.length,
      icon: Plane,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      label: 'Active Flights',
      value: flights.filter(f => f.status === 'SCHEDULED').length,
      icon: Calendar,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      label: 'Total Seats',
      value: flights.reduce((sum, f) => sum + f.totalSeats, 0),
      icon: Users,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      label: 'Available Seats',
      value: flights.reduce((sum, f) => sum + f.availableSeats, 0),
      icon: CheckCircle2,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    }
  ]

  const quickActions = [
    { label: 'Add New Flight', href: '/airline/flights/add', icon: Plus, color: 'from-[#00236f] to-[#1e3a8a]' },
    { label: 'Manage Flights', href: '/airline/flights', icon: Calendar, color: 'from-blue-500 to-blue-600' },
    { label: 'Configure Seats', href: '/airline/seats', icon: Users, color: 'from-purple-500 to-purple-600' },
    { label: 'Update Status', href: '/airline/operations', icon: Clock, color: 'from-green-500 to-green-600' }
  ]

  const recentFlights = flights.slice(0, 5)

  return (
    <div>
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-[#00236f] mb-2">Airline Dashboard</h1>
          <p className="text-slate-600">Manage your flights, seats, and operations</p>
        </div>

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
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-black text-slate-800 mb-1">{stat.value}</p>
                <p className="text-sm text-slate-500 font-bold">{stat.label}</p>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-black text-slate-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.href}
                  to={action.href}
                  className={`bg-gradient-to-r ${action.color} text-white rounded-xl p-6 hover:shadow-lg transition-all group`}
                >
                  <Icon className="w-8 h-8 mb-3" />
                  <p className="font-bold text-lg mb-1">{action.label}</p>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent Flights */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black text-slate-800">Recent Flights</h2>
            <Link
              to="/airline/flights"
              className="text-[#00236f] font-bold hover:underline flex items-center gap-2"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-[#00236f] border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-600 mt-4">Loading flights...</p>
            </div>
          ) : recentFlights.length === 0 ? (
            <div className="text-center py-12">
              <Plane className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 font-bold mb-2">No flights yet</p>
              <p className="text-sm text-slate-500 mb-4">Create your first flight to get started</p>
              <Link
                to="/airline/flights/add"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00236f] to-[#1e3a8a] text-white rounded-xl font-bold hover:shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                Add Flight
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-bold text-slate-600">Flight Number</th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-slate-600">Aircraft</th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-slate-600">Departure</th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-slate-600">Seats</th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-slate-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-bold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentFlights.map((flight) => (
                    <tr key={flight.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4 px-4">
                        <p className="font-bold text-slate-800">{flight.flightNumber}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-slate-600">{flight.aircraftType}</p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-slate-600">
                          {new Date(flight.departureTime).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-slate-600">{flight.availableSeats} / {flight.totalSeats}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold ${
                          flight.status === 'SCHEDULED' ? 'bg-green-50 text-green-700' :
                          flight.status === 'DELAYED' ? 'bg-yellow-50 text-yellow-700' :
                          flight.status === 'CANCELLED' ? 'bg-red-50 text-red-700' :
                          'bg-blue-50 text-blue-700'
                        }`}>
                          {flight.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Link
                          to={`/airline/flights/edit/${flight.id}`}
                          className="text-[#00236f] font-bold hover:underline"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}


