import { useState, useEffect } from "react"
import { Link, useNavigate } from 'react-router-dom'
import { AdminHeader } from "@/components/admin/admin-header"
import {
  Users,
  Plane,
  MapPin,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowRight
} from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { authApi, flightApi, airportApi, airlineApi, bookingApi } from "@/services/api"

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user, isLoggedIn } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFlights: 0,
    totalAirports: 0,
    totalAirlines: 0,
    totalBookings: 0,
    activeBookings: 0,
    totalRevenue: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [flights, airports, airlines] = await Promise.all([
        flightApi.getAll(),
        airportApi.getAll(true),
        airlineApi.getAll(true)
      ])

      setStats({
        totalUsers: 0,
        totalFlights: flights.length,
        totalAirports: airports.length,
        totalAirlines: airlines.length,
        totalBookings: 0,
        activeBookings: 0,
        totalRevenue: 0
      })
    } catch (err) {
      console.error('Error loading dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      label: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      href: '/admin/users'
    },
    {
      label: 'Total Flights',
      value: stats.totalFlights,
      icon: Plane,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      href: '/admin/bookings'
    },
    {
      label: 'Airlines',
      value: stats.totalAirlines,
      icon: Plane,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
      href: '/admin/airlines'
    },
    {
      label: 'Airports',
      value: stats.totalAirports,
      icon: MapPin,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      href: '/admin/airports'
    },
    {
      label: 'Total Bookings',
      value: stats.totalBookings,
      icon: ShoppingBag,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
      href: '/admin/bookings'
    },
    {
      label: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      href: '/admin/payments'
    }
  ]

  const quickActions = [
    { label: 'Manage Users', href: '/admin/users', icon: Users, color: 'from-blue-500 to-blue-600' },
    { label: 'Add Airline', href: '/admin/airlines', icon: Plane, color: 'from-green-500 to-green-600' },
    { label: 'Add Airport', href: '/admin/airports', icon: MapPin, color: 'from-orange-500 to-orange-600' },
    { label: 'View Bookings', href: '/admin/bookings', icon: ShoppingBag, color: 'from-purple-500 to-purple-600' },
    { label: 'View Users', href: '/admin/users', icon: Users, color: 'from-emerald-500 to-emerald-600' },
    { label: 'Send Notification', href: '/admin/notifications', icon: AlertCircle, color: 'from-red-600 to-red-700' }
  ]

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-sky-600 mb-2">Admin Dashboard</h1>
          <p className="text-slate-600">Manage the entire SkyBooker ecosystem</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-600 mt-4">Loading dashboard...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {statCards.map((stat) => {
                const Icon = stat.icon
                return (
                  <Link
                    key={stat.label}
                    to={stat.href}
                    className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                        <Icon className={`w-6 h-6 ${stat.textColor}`} />
                      </div>
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="text-3xl font-black text-slate-800 mb-1">{stat.value}</p>
                    <p className="text-sm text-slate-500 font-bold">{stat.label}</p>
                  </Link>
                )
              })}
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
              <h2 className="text-xl font-black text-slate-800 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-black text-slate-800 mb-4">System Health</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-bold text-slate-800">All Services Running</p>
                        <p className="text-sm text-slate-500">System operational</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-green-600">100%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Clock className="w-6 h-6 text-blue-600" />
                      <div>
                        <p className="font-bold text-slate-800">Response Time</p>
                        <p className="text-sm text-slate-500">Average API latency</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-blue-600">45ms</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-black text-slate-800 mb-4">Recent Activity</h2>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800">System initialized</p>
                      <p className="text-xs text-slate-500">All services are running</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}


