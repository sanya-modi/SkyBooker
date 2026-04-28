// export { default } from '../../app/airline/flights/page'
import { useState, useEffect } from "react"
import { Link, useNavigate } from 'react-router-dom'
import {
  Plane,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Users,
  DollarSign
} from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { flightApi, airportApi, airlineApi, getAllAirportsCached, getAllAirlinesCached, type FlightResult, type Airport, type Airline } from "@/services/api"

export default function ViewFlightsPage() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const [flights, setFlights] = useState<FlightResult[]>([])
  const [airports, setAirports] = useState<Airport[]>([])
  const [airlines, setAirlines] = useState<Airline[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ALL')

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
      const [flightsData, airportsData, airlinesData] = await Promise.all([
        flightApi.getAll(),
        getAllAirportsCached(),
        getAllAirlinesCached()
      ])
      setFlights(flightsData)
      setAirports(airportsData)
      setAirlines(airlinesData)
    } catch (err) {
      console.error('Error loading flights:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this flight?')) return
    
    try {
      await flightApi.delete(id)
      setFlights(flights.filter(f => f.id !== id))
    } catch (err) {
      console.error('Error deleting flight:', err)
      alert('Failed to delete flight')
    }
  }

  const getAirport = (id: number) => airports.find(a => a.id === id)
  const getAirline = (id: number) => airlines.find(a => a.id === id)

  const filteredFlights = flights.filter(flight => {
    const matchesSearch = flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         flight.aircraftType.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || flight.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-[#00236f] mb-2">Flight Management</h1>
            <p className="text-slate-600">Manage all your flight schedules</p>
          </div>
          <Link
            to="/airline/flights/add"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#00236f] to-[#1e3a8a] text-white rounded-xl font-bold hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Add Flight
          </Link>
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
                placeholder="Search by flight number or aircraft..."
                className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00236f] focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00236f] focus:border-transparent appearance-none"
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

        {/* Flights List */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-[#00236f] border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-600 mt-4">Loading flights...</p>
            </div>
          ) : filteredFlights.length === 0 ? (
            <div className="text-center py-12">
              <Plane className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 font-bold mb-2">No flights found</p>
              <p className="text-sm text-slate-500">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">Flight</th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">Route</th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">Schedule</th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">Seats</th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">Fare</th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFlights.map((flight) => {
                    const depAirport = getAirport(flight.departureAirportId)
                    const arrAirport = getAirport(flight.arrivalAirportId)
                    const airline = getAirline(flight.airlineId)
                    
                    return (
                      <tr key={flight.id} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="py-4 px-6">
                          <p className="font-bold text-slate-800">{flight.flightNumber}</p>
                          <p className="text-sm text-slate-500">{flight.aircraftType}</p>
                          <p className="text-xs text-slate-400">{airline?.name}</p>
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
                          <p className="text-sm text-slate-500">
                            {new Date(flight.departureTime).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-bold text-slate-800">{flight.availableSeats} / {flight.totalSeats}</p>
                          <p className="text-xs text-slate-500">
                            {Math.round((flight.availableSeats / flight.totalSeats) * 100)}% available
                          </p>
                        </td>
                        <td className="py-4 px-6">
                          <p className="font-bold text-slate-800">₹{flight.baseFare}</p>
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
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/airline/flights/edit/${flight.id}`}
                              className="p-2 text-[#00236f] hover:bg-blue-50 rounded-lg transition-all"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(flight.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
    </div>
  )
}
