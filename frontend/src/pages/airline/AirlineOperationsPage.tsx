import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { CheckCircle2, Clock, Plane, Search, ShieldBan, Trash2, Users, XCircle } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import {
  flightApi,
  passengerApi,
  getAllAirportsCached,
  getAllAirlinesCached,
  type Airline,
  type Airport,
  type FlightPassengerManifestItem,
  type FlightResult,
} from "@/services/api"

const STATUS_OPTIONS = [
  { status: 'ON_TIME', label: 'On Time', icon: CheckCircle2, cls: 'bg-green-50 text-green-700 hover:bg-green-100' },
  { status: 'DELAYED', label: 'Delayed', icon: Clock, cls: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' },
  { status: 'CANCELLED', label: 'Cancelled', icon: XCircle, cls: 'bg-red-50 text-red-700 hover:bg-red-100' },
  { status: 'ARRIVED', label: 'Completed', icon: CheckCircle2, cls: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
]

export default function OperationsPage() {
  const navigate = useNavigate()
  const { isLoggedIn, isAuthReady, profile } = useAuth()
  const [flights, setFlights] = useState<FlightResult[]>([])
  const [airports, setAirports] = useState<Airport[]>([])
  const [airlines, setAirlines] = useState<Airline[]>([])
  const [selectedFlight, setSelectedFlight] = useState<FlightResult | null>(null)
  const [manifest, setManifest] = useState<FlightPassengerManifestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [manifestLoading, setManifestLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [actingPassengerId, setActingPassengerId] = useState<number | null>(null)

  useEffect(() => {
    if (!isAuthReady) return
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    void loadFlights(selectedDate)
  }, [isAuthReady, isLoggedIn, navigate, profile?.airlineId, selectedDate])

  useEffect(() => {
    if (!selectedFlight) {
      setManifest([])
      return
    }
    void loadManifest(selectedFlight.id)
  }, [selectedFlight?.id])

  const loadFlights = async (date: string) => {
    try {
      setLoading(true)
      const [flightResults, airportResults, airlineResults] = await Promise.all([
        flightApi.getByDate(date),
        getAllAirportsCached(),
        getAllAirlinesCached(),
      ])

      const myAirlineId = profile?.airlineId
      const filteredFlights = myAirlineId
        ? flightResults.filter((flight) => flight.airlineId === myAirlineId)
        : flightResults

      setFlights(filteredFlights)
      setAirports(airportResults)
      setAirlines(airlineResults)
      setSelectedFlight((current) => {
        if (!current) return filteredFlights[0] ?? null
        return filteredFlights.find((flight) => flight.id === current.id) ?? filteredFlights[0] ?? null
      })
    } catch (error) {
      console.error('Error loading flights:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadManifest = async (flightId: number) => {
    try {
      setManifestLoading(true)
      setManifest(await flightApi.getPassengers(flightId))
    } catch (error) {
      console.error('Error loading manifest:', error)
    } finally {
      setManifestLoading(false)
    }
  }

  const handleStatusUpdate = async (status: string) => {
    if (!selectedFlight || !confirm(`Mark this flight as ${status}?`)) return

    try {
      setUpdatingStatus(true)
      const updatedFlight = await flightApi.updateStatus(selectedFlight.id, status)
      setFlights((current) => current.map((flight) => flight.id === updatedFlight.id ? updatedFlight : flight))
      setSelectedFlight(updatedFlight)
    } catch (error) {
      console.error('Error updating flight status:', error)
      alert('Failed to update flight status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleDeletePassenger = async (passengerId: number) => {
    if (!confirm('Delete this passenger from the manifest?')) return

    try {
      setActingPassengerId(passengerId)
      await passengerApi.delete(passengerId)
      setManifest((current) => current.filter((passenger) => passenger.id !== passengerId))
    } catch (error) {
      console.error('Error deleting passenger:', error)
      alert('Failed to delete passenger')
    } finally {
      setActingPassengerId(null)
    }
  }

  const handleBlockPassenger = async (passengerId: number) => {
    if (!confirm('Block this passenger account?')) return

    try {
      setActingPassengerId(passengerId)
      await passengerApi.block(passengerId)
      setManifest((current) => current.map((passenger) =>
        passenger.id === passengerId ? { ...passenger, blocked: true } : passenger
      ))
    } catch (error) {
      console.error('Error blocking passenger:', error)
      alert('Failed to block passenger')
    } finally {
      setActingPassengerId(null)
    }
  }

  const getAirport = (id: number) => airports.find((airport) => airport.id === id)
  const getAirline = (id: number) => airlines.find((airline) => airline.id === id)

  const filteredFlights = flights.filter((flight) => {
    const dep = getAirport(flight.departureAirportId)
    const arr = getAirport(flight.arrivalAirportId)
    const search = searchTerm.toLowerCase()

    return [
      flight.flightNumber,
      dep?.iataCode,
      dep?.city,
      arr?.iataCode,
      arr?.city,
    ].some((value) => value?.toLowerCase().includes(search))
  })

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-[#00236f] mb-2">Flight Operations</h1>
        <p className="text-slate-600">Update flight status and view passenger manifest</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-black text-slate-800 mb-4">Flights By Date</h2>
            <div className="mb-4">
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00236f] focus:border-transparent"
              />
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search flights..."
                className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00236f] focus:border-transparent"
              />
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block w-6 h-6 border-4 border-[#00236f] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredFlights.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No flights are there on this date</p>
            ) : (
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredFlights.map((flight) => {
                  const dep = getAirport(flight.departureAirportId)
                  const arr = getAirport(flight.arrivalAirportId)

                  return (
                    <button
                      key={flight.id}
                      onClick={() => setSelectedFlight(flight)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selectedFlight?.id === flight.id ? 'border-[#00236f] bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-bold text-slate-800">{flight.flightNumber}</p>
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                          flight.status === 'ON_TIME' ? 'bg-green-50 text-green-700' :
                          flight.status === 'DELAYED' ? 'bg-yellow-50 text-yellow-700' :
                          flight.status === 'ARRIVED' ? 'bg-blue-50 text-blue-700' :
                          'bg-red-50 text-red-700'
                        }`}>
                          {flight.status === 'ARRIVED' ? 'COMPLETED' : flight.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mb-1">{dep?.iataCode} → {arr?.iataCode}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(flight.departureTime).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}{' '}
                        {new Date(flight.departureTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          {!selectedFlight ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
              <Plane className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 font-bold">Select a flight to view details</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-start justify-between mb-6 gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 mb-1">{selectedFlight.flightNumber}</h2>
                    <p className="text-slate-600">{selectedFlight.aircraftType}</p>
                    <p className="text-sm text-slate-500">{getAirline(selectedFlight.airlineId)?.name}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-xl text-sm font-bold ${
                    selectedFlight.status === 'ON_TIME' ? 'bg-green-50 text-green-700' :
                    selectedFlight.status === 'DELAYED' ? 'bg-yellow-50 text-yellow-700' :
                    selectedFlight.status === 'ARRIVED' ? 'bg-blue-50 text-blue-700' :
                    'bg-red-50 text-red-700'
                  }`}>
                    {selectedFlight.status === 'ARRIVED' ? 'COMPLETED' : selectedFlight.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: 'Departure', airportId: selectedFlight.departureAirportId, time: selectedFlight.departureTime },
                    { label: 'Arrival', airportId: selectedFlight.arrivalAirportId, time: selectedFlight.arrivalTime },
                  ].map(({ label, airportId, time }) => {
                    const airport = getAirport(airportId)
                    return (
                      <div key={label}>
                        <p className="text-xs text-slate-500 mb-1">{label}</p>
                        <p className="font-bold text-slate-800">{airport?.city} ({airport?.iataCode})</p>
                        <p className="text-sm text-slate-600">
                          {new Date(time).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    )
                  })}
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <p className="text-sm font-bold text-slate-700 mb-3">Update Flight Status</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_OPTIONS.map(({ status, label, icon: Icon, cls }) => (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(status)}
                        disabled={updatingStatus || selectedFlight.status === status}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all disabled:opacity-50 ${cls}`}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-slate-800">Passenger Manifest</h3>
                  <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-blue-700">{manifest.length} Passengers</span>
                  </div>
                </div>

                {manifestLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block w-6 h-6 border-4 border-[#00236f] border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-600 mt-4">Loading manifest...</p>
                  </div>
                ) : manifest.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-600">No passengers for this flight</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border-2 border-slate-200 rounded-xl">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr className="text-left text-slate-600">
                          <th className="px-4 py-3 font-bold">Passenger</th>
                          <th className="px-4 py-3 font-bold">Passenger Contact</th>
                          <th className="px-4 py-3 font-bold">Seat</th>
                          <th className="px-4 py-3 font-bold">Passport</th>
                          <th className="px-4 py-3 font-bold">Booked By</th>
                          <th className="px-4 py-3 font-bold">Booker Contact</th>
                          <th className="px-4 py-3 font-bold">Status</th>
                          <th className="px-4 py-3 font-bold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {manifest.map((passenger) => {
                          const isActing = actingPassengerId === passenger.id

                          return (
                            <tr key={passenger.id} className="border-t border-slate-200 align-top">
                              <td className="px-4 py-4 font-bold text-slate-800">{passenger.name || 'N/A'}</td>
                              <td className="px-4 py-4 text-slate-600">
                                <div>{passenger.email || 'N/A'}</div>
                                <div>{passenger.phone || 'N/A'}</div>
                              </td>
                              <td className="px-4 py-4 font-bold text-[#00236f]">{passenger.seat || 'N/A'}</td>
                              <td className="px-4 py-4 text-slate-600">{passenger.passport || 'N/A'}</td>
                              <td className="px-4 py-4 text-slate-600">
                                <div className="font-bold text-slate-800">{passenger.bookedByName || 'N/A'}</div>
                              </td>
                              <td className="px-4 py-4 text-slate-600">
                                <div>{passenger.bookedByEmail || 'N/A'}</div>
                                <div>{passenger.bookedByPhone || 'N/A'}</div>
                              </td>
                              <td className="px-4 py-4">
                                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                                  passenger.blocked ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
                                }`}>
                                  {passenger.blocked ? 'Blocked' : 'Active'}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex flex-col gap-2">
                                  <button
                                    onClick={() => handleBlockPassenger(passenger.id)}
                                    disabled={isActing || passenger.blocked}
                                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-bold bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition-all disabled:opacity-50"
                                  >
                                    <ShieldBan className="w-4 h-4" />
                                    Block
                                  </button>
                                  <button
                                    onClick={() => handleDeletePassenger(passenger.id)}
                                    disabled={isActing}
                                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-bold bg-red-50 text-red-700 hover:bg-red-100 transition-all disabled:opacity-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
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
          )}
        </div>
      </div>
    </div>
  )
}
