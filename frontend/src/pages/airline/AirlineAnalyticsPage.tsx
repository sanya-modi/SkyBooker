import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { DollarSign, TrendingUp, Plane, Users, BarChart3, PieChart } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { flightApi, getAllAirportsCached, type FlightResult, type Airport } from "@/services/api"

export default function AnalyticsPage() {
  const navigate = useNavigate()
  const { isLoggedIn, profile } = useAuth()
  const [flights, setFlights] = useState<FlightResult[]>([])
  const [airports, setAirports] = useState<Airport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return }
    Promise.all([flightApi.getAll(), getAllAirportsCached()])
      .then(([f, a]) => {
        const myAirlineId = profile?.airlineId
        setFlights(myAirlineId ? f.filter(fl => fl.airlineId === myAirlineId) : f)
        setAirports(a)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [isLoggedIn, profile?.airlineId])

  const getAirport = (id: number) => airports.find(a => a.id === id)

  const totalFlights = flights.length
  const scheduled = flights.filter(f => f.status === 'SCHEDULED').length
  const completed = flights.filter(f => f.status === 'COMPLETED').length
  const cancelled = flights.filter(f => f.status === 'CANCELLED').length
  const delayed = flights.filter(f => f.status === 'DELAYED').length

  const totalSeats = flights.reduce((s, f) => s + f.totalSeats, 0)
  const bookedSeats = flights.reduce((s, f) => s + (f.totalSeats - f.availableSeats), 0)
  const occupancyRate = totalSeats > 0 ? ((bookedSeats / totalSeats) * 100).toFixed(1) : '0'
  const totalRevenue = flights.reduce((s, f) => s + (f.totalSeats - f.availableSeats) * f.baseFare, 0)
  const avgRevenue = totalFlights > 0 ? (totalRevenue / totalFlights) : 0

  const statusDist = [
    { label: 'Scheduled', count: scheduled, color: 'bg-green-500' },
    { label: 'Completed', count: completed, color: 'bg-blue-500' },
    { label: 'Delayed', count: delayed, color: 'bg-yellow-500' },
    { label: 'Cancelled', count: cancelled, color: 'bg-red-500' },
  ]

  const topFlights = [...flights]
    .sort((a, b) => (b.totalSeats - b.availableSeats) * b.baseFare - (a.totalSeats - a.availableSeats) * a.baseFare)
    .slice(0, 5)

  const stats = [
    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: DollarSign, bgColor: 'bg-green-50', textColor: 'text-green-600' },
    { label: 'Avg Revenue / Flight', value: `₹${avgRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: TrendingUp, bgColor: 'bg-blue-50', textColor: 'text-blue-600' },
    { label: 'Occupancy Rate', value: `${occupancyRate}%`, icon: Users, bgColor: 'bg-purple-50', textColor: 'text-purple-600' },
    { label: 'Scheduled Flights', value: scheduled, icon: Plane, bgColor: 'bg-orange-50', textColor: 'text-orange-600' },
  ]

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map(({ label, value, icon: Icon, bgColor, textColor }) => (
              <div key={label} className="bg-white rounded-2xl shadow-sm p-6">
                <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${textColor}`} />
                </div>
                <p className="text-3xl font-black text-slate-800 mb-1">{value}</p>
                <p className="text-sm text-slate-500 font-bold">{label}</p>
              </div>
            ))}
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
                {statusDist.map(({ label, count, color }) => {
                  const pct = totalFlights > 0 ? ((count / totalFlights) * 100).toFixed(1) : '0'
                  return (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-slate-700">{label}</span>
                        <span className="text-sm font-bold text-slate-800">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
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
                    <circle cx="96" cy="96" r="80" stroke="#e2e8f0" strokeWidth="16" fill="none" />
                    <circle cx="96" cy="96" r="80" stroke="url(#grad)" strokeWidth="16" fill="none"
                      strokeDasharray={`${(parseFloat(occupancyRate) / 100) * 502.4} 502.4`} strokeLinecap="round" />
                    <defs>
                      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
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
            {topFlights.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No flight data available</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      {['Rank', 'Flight', 'Route', 'Booked', 'Occupancy', 'Revenue'].map(h => (
                        <th key={h} className="text-left py-3 px-4 text-sm font-bold text-slate-600">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {topFlights.map((flight, i) => {
                      const booked = flight.totalSeats - flight.availableSeats
                      const revenue = booked * flight.baseFare
                      const occ = ((booked / flight.totalSeats) * 100).toFixed(1)
                      const dep = getAirport(flight.departureAirportId)
                      const arr = getAirport(flight.arrivalAirportId)
                      return (
                        <tr key={flight.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-4 px-4">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${
                              i === 0 ? 'bg-yellow-100 text-yellow-700' :
                              i === 1 ? 'bg-slate-200 text-slate-700' :
                              i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600'
                            }`}>{i + 1}</div>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-bold text-slate-800">{flight.flightNumber}</p>
                            <p className="text-xs text-slate-500">{flight.aircraftType}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-bold text-slate-800">{dep?.iataCode ?? '—'} → {arr?.iataCode ?? '—'}</p>
                            <p className="text-xs text-slate-500">{dep?.city} → {arr?.city}</p>
                          </td>
                          <td className="py-4 px-4">
                            <p className="text-slate-600">{booked} / {flight.totalSeats}</p>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full" style={{ width: `${occ}%` }} />
                              </div>
                              <span className="text-sm font-bold text-slate-700">{occ}%</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-bold text-green-600">₹{revenue.toLocaleString('en-IN')}</p>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
