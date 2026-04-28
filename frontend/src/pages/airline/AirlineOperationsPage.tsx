// export { default } from '../../app/airline/operations/page'
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Plane,
  Users,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Search,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { flightApi, bookingApi, passengerApi, seatApi, getAllAirportsCached, getAllAirlinesCached, type FlightResult, type BookingResult, type PassengerResult, type SeatResult, type Airport, type Airline } from "@/services/api"

export default function OperationsPage() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const [flights, setFlights] = useState<FlightResult[]>([])
  const [airports, setAirports] = useState<Airport[]>([])
  const [airlines, setAirlines] = useState<Airline[]>([])
  const [selectedFlight, setSelectedFlight] = useState<FlightResult | null>(null)
  const [bookings, setBookings] = useState<BookingResult[]>([])
  const [passengers, setPassengers] = useState<{ [key: number]: PassengerResult[] }>({})
  const [seats, setSeats] = useState<{ [key: number]: string }>({})
  const [loading, setLoading] = useState(true)
  const [manifestLoading, setManifestLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedBooking, setExpandedBooking] = useState<number | null>(null)

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
      setFlights(flightsData.filter(f => f.status === 'SCHEDULED' || f.status === 'DELAYED'))
      setAirports(airportsData)
      setAirlines(airlinesData)
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadPassengerManifest = async (flightId: number) => {
    try {
      setManifestLoading(true)
      const bookingsData = await bookingApi.getByFlight(flightId)
      setBookings(bookingsData)

      // Load passengers and seats for each booking
      const passengersMap: { [key: number]: PassengerResult[] } = {}
      const seatsMap: { [key: number]: string } = {}

      for (const booking of bookingsData) {
        try {
          const [passengersData, seatsData] = await Promise.all([
            passengerApi.getByBooking(booking.id),
            seatApi.getByBooking(booking.id)
          ])
          passengersMap[booking.id] = passengersData
          seatsMap[booking.id] = seatsData.map(s => s.seatNumber).join(', ')
        } catch (err) {
          console.error(`Error loading data for booking ${booking.id}:`, err)
        }
      }

      setPassengers(passengersMap)
      setSeats(seatsMap)
    } catch (err) {
      console.error('Error loading passenger manifest:', err)
    } finally {
      setManifestLoading(false)
    }
  }

  const handleFlightSelect = async (flight: FlightResult) => {
    setSelectedFlight(flight)
    await loadPassengerManifest(flight.id)
  }

  const handleStatusUpdate = async (flightId: number, status: string) => {
    if (!confirm(`Are you sure you want to mark this flight as ${status}?`)) return

    try {
      await flightApi.updateStatus(flightId, status)
      setFlights(flights.map(f => f.id === flightId ? { ...f, status } : f))
      if (selectedFlight?.id === flightId) {
        setSelectedFlight({ ...selectedFlight, status })
      }
      alert(`Flight status updated to ${status}`)
    } catch (err) {
      console.error('Error updating status:', err)
      alert('Failed to update flight status')
    }
  }

  const getAirport = (id: number) => airports.find(a => a.id === id)
  const getAirline = (id: number) => airlines.find(a => a.id === id)

  const filteredFlights = flights.filter(flight =>
    flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-[#00236f] mb-2">Flight Operations</h1>
          <p className="text-slate-600">Update flight status and view passenger manifest</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Flight List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-black text-slate-800 mb-4">Active Flights</h2>
              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search flights..."
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00236f] focus:border-transparent"
                />
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block w-6 h-6 border-4 border-[#00236f] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {filteredFlights.map((flight) => {
                    const depAirport = getAirport(flight.departureAirportId)
                    const arrAirport = getAirport(flight.arrivalAirportId)
                    
                    return (
                      <button
                        key={flight.id}
                        onClick={() => handleFlightSelect(flight)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          selectedFlight?.id === flight.id
                            ? 'border-[#00236f] bg-blue-50'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-bold text-slate-800">{flight.flightNumber}</p>
                          <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                            flight.status === 'SCHEDULED' ? 'bg-green-50 text-green-700' :
                            'bg-yellow-50 text-yellow-700'
                          }`}>
                            {flight.status}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mb-1">
                          {depAirport?.iataCode} → {arrAirport?.iataCode}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(flight.departureTime).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Flight Details & Manifest */}
          <div className="lg:col-span-2">
            {!selectedFlight ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <Plane className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-bold">Select a flight to view details</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Flight Info & Status Update */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-black text-slate-800 mb-2">
                        {selectedFlight.flightNumber}
                      </h2>
                      <p className="text-slate-600">{selectedFlight.aircraftType}</p>
                      <p className="text-sm text-slate-500">
                        {getAirline(selectedFlight.airlineId)?.name}
                      </p>
                    </div>
                    <span className={`px-4 py-2 rounded-xl text-sm font-bold ${
                      selectedFlight.status === 'SCHEDULED' ? 'bg-green-50 text-green-700' :
                      selectedFlight.status === 'DELAYED' ? 'bg-yellow-50 text-yellow-700' :
                      selectedFlight.status === 'CANCELLED' ? 'bg-red-50 text-red-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      {selectedFlight.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Departure</p>
                      <p className="font-bold text-slate-800">
                        {getAirport(selectedFlight.departureAirportId)?.city}
                      </p>
                      <p className="text-sm text-slate-600">
                        {new Date(selectedFlight.departureTime).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Arrival</p>
                      <p className="font-bold text-slate-800">
                        {getAirport(selectedFlight.arrivalAirportId)?.city}
                      </p>
                      <p className="text-sm text-slate-600">
                        {new Date(selectedFlight.arrivalTime).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-slate-200 pt-4">
                    <p className="text-sm font-bold text-slate-700 mb-3">Update Flight Status</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleStatusUpdate(selectedFlight.id, 'SCHEDULED')}
                        className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg font-bold hover:bg-green-100 transition-all"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        On Time
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(selectedFlight.id, 'DELAYED')}
                        className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg font-bold hover:bg-yellow-100 transition-all"
                      >
                        <Clock className="w-4 h-4" />
                        Delayed
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(selectedFlight.id, 'CANCELLED')}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg font-bold hover:bg-red-100 transition-all"
                      >
                        <XCircle className="w-4 h-4" />
                        Cancelled
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(selectedFlight.id, 'COMPLETED')}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-bold hover:bg-blue-100 transition-all"
                      >
                        <Plane className="w-4 h-4" />
                        Arrived
                      </button>
                    </div>
                  </div>
                </div>

                {/* Passenger Manifest */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-black text-slate-800">Passenger Manifest</h3>
                    <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span className="font-bold text-blue-700">{bookings.length} Bookings</span>
                    </div>
                  </div>

                  {manifestLoading ? (
                    <div className="text-center py-8">
                      <div className="inline-block w-6 h-6 border-4 border-[#00236f] border-t-transparent rounded-full animate-spin" />
                      <p className="text-slate-600 mt-4">Loading manifest...</p>
                    </div>
                  ) : bookings.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-600">No bookings for this flight</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bookings.map((booking) => (
                        <div key={booking.id} className="border-2 border-slate-200 rounded-xl overflow-hidden">
                          <button
                            onClick={() => setExpandedBooking(expandedBooking === booking.id ? null : booking.id)}
                            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-all"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-[#00236f] to-[#1e3a8a] rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold">{booking.numberOfPassengers}</span>
                              </div>
                              <div className="text-left">
                                <p className="font-bold text-slate-800">PNR: {booking.pnr}</p>
                                <p className="text-sm text-slate-500">
                                  Seats: {seats[booking.id] || 'Loading...'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                booking.checkedIn ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {booking.checkedIn ? 'Checked In' : 'Not Checked In'}
                              </span>
                              {expandedBooking === booking.id ? (
                                <ChevronUp className="w-5 h-5 text-slate-400" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                          </button>

                          {expandedBooking === booking.id && passengers[booking.id] && (
                            <div className="border-t border-slate-200 p-4 bg-slate-50">
                              <p className="text-sm font-bold text-slate-700 mb-3">Passengers</p>
                              <div className="space-y-2">
                                {passengers[booking.id].map((passenger, idx) => (
                                  <div key={passenger.id} className="bg-white rounded-lg p-3">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <p className="font-bold text-slate-800">
                                          {passenger.firstName} {passenger.lastName}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                          Passport: {passenger.passportNumber} | {passenger.nationality}
                                        </p>
                                      </div>
                                      <p className="text-sm font-bold text-[#00236f]">
                                        Seat {passenger.seatNumber || 'N/A'}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
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
