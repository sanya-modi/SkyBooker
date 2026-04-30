// export { default } from '../../app/airline/seats/page'
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Plane,
  MapPin,
  Search,
  CheckCircle2,
  XCircle,
  Loader2
} from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { flightApi, seatApi, getAllAirportsCached, type FlightResult, type SeatResult, type Airport } from "@/services/api"

export default function SeatsPage() {
  const navigate = useNavigate()
  const { isLoggedIn, isAuthReady } = useAuth()
  const [flights, setFlights] = useState<FlightResult[]>([])
  const [airports, setAirports] = useState<Airport[]>([])
  const [selectedFlight, setSelectedFlight] = useState<FlightResult | null>(null)
  const [seats, setSeats] = useState<SeatResult[]>([])
  const [loading, setLoading] = useState(true)
  const [seatsLoading, setSeatsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!isAuthReady) return
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    loadData()
  }, [isAuthReady, isLoggedIn, navigate])

  const loadData = async () => {
    try {
      setLoading(true)
      const [flightsData, airportsData] = await Promise.all([
        flightApi.getAll(),
        getAllAirportsCached()
      ])
      setFlights(flightsData)
      setAirports(airportsData)
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadSeats = async (flightId: number) => {
    try {
      setSeatsLoading(true)
      const seatsData = await seatApi.getAllByFlight(flightId)
      setSeats(seatsData)
    } catch (err) {
      console.error('Error loading seats:', err)
    } finally {
      setSeatsLoading(false)
    }
  }

  const handleFlightSelect = async (flight: FlightResult) => {
    setSelectedFlight(flight)
    await loadSeats(flight.id)
  }

  const handleInitializeSeats = async () => {
    if (!selectedFlight) return
    if (!confirm(`Initialize ${selectedFlight.totalSeats} seats for this flight?`)) return

    try {
      await seatApi.initialize(selectedFlight.id, selectedFlight.totalSeats)
      await loadSeats(selectedFlight.id)
      alert('Seats initialized successfully!')
    } catch (err) {
      console.error('Error initializing seats:', err)
      alert('Failed to initialize seats')
    }
  }

  const getAirport = (id: number) => airports.find(a => a.id === id)

  const filteredFlights = flights.filter(flight =>
    flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const seatsByRow = seats.reduce((acc, seat) => {
    const row = seat.seatNumber.replace(/[A-Z]/g, '')
    if (!acc[row]) acc[row] = []
    acc[row].push(seat)
    return acc
  }, {} as { [key: string]: SeatResult[] })

  const getSeatClass = (seat: SeatResult) => {
    if (seat.status === 'BOOKED') {
      return 'bg-red-100 text-red-700 border-red-300'
    }
    if (seat.status === 'HELD') {
      return 'bg-yellow-100 text-yellow-700 border-yellow-300'
    }
    return 'bg-green-100 text-green-700 border-green-300'
  }

  const stats = {
    total: seats.length,
    available: seats.filter(s => s.status === 'AVAILABLE').length,
    booked: seats.filter(s => s.status === 'BOOKED').length,
    held: seats.filter(s => s.status === 'HELD').length
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-[#00236f] mb-2">Seat Management</h1>
          <p className="text-slate-600">Configure and view seat maps for your flights</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Flight List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-black text-slate-800 mb-4">Select Flight</h2>
              
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
                        <p className="font-bold text-slate-800 mb-1">{flight.flightNumber}</p>
                        <p className="text-sm text-slate-600 mb-1">
                          {depAirport?.iataCode} → {arrAirport?.iataCode}
                        </p>
                        <p className="text-xs text-slate-500">
                          {flight.totalSeats} seats
                        </p>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Seat Map */}
          <div className="lg:col-span-2">
            {!selectedFlight ? (
              <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600 font-bold">Select a flight to view seat map</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Flight Info */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-black text-slate-800">{selectedFlight.flightNumber}</h2>
                      <p className="text-slate-600">{selectedFlight.aircraftType}</p>
                    </div>
                    {seats.length === 0 && (
                      <button
                        onClick={handleInitializeSeats}
                        className="px-4 py-2 bg-gradient-to-r from-[#00236f] to-[#1e3a8a] text-white rounded-xl font-bold hover:shadow-lg transition-all"
                      >
                        Initialize Seats
                      </button>
                    )}
                  </div>

                  {seats.length > 0 && (
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-green-50 rounded-xl p-4">
                        <p className="text-2xl font-black text-green-700">{stats.available}</p>
                        <p className="text-sm text-green-600">Available</p>
                      </div>
                      <div className="bg-red-50 rounded-xl p-4">
                        <p className="text-2xl font-black text-red-700">{stats.booked}</p>
                        <p className="text-sm text-red-600">Booked</p>
                      </div>
                      <div className="bg-yellow-50 rounded-xl p-4">
                        <p className="text-2xl font-black text-yellow-700">{stats.held}</p>
                        <p className="text-sm text-yellow-600">On Hold</p>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-4">
                        <p className="text-2xl font-black text-blue-700">{stats.total}</p>
                        <p className="text-sm text-blue-600">Total</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Seat Map */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="text-xl font-black text-slate-800 mb-4">Seat Map</h3>

                  {seatsLoading ? (
                    <div className="text-center py-12">
                      <Loader2 className="w-8 h-8 text-[#00236f] animate-spin mx-auto mb-4" />
                      <p className="text-slate-600">Loading seats...</p>
                    </div>
                  ) : seats.length === 0 ? (
                    <div className="text-center py-12">
                      <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-600 font-bold mb-2">No seats configured</p>
                      <p className="text-sm text-slate-500">Click "Initialize Seats" to create seat map</p>
                    </div>
                  ) : (
                    <>
                      {/* Legend */}
                      <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-green-100 border-2 border-green-300 rounded-lg" />
                          <span className="text-sm text-slate-600">Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-red-100 border-2 border-red-300 rounded-lg" />
                          <span className="text-sm text-slate-600">Booked</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-yellow-100 border-2 border-yellow-300 rounded-lg" />
                          <span className="text-sm text-slate-600">On Hold</span>
                        </div>
                      </div>

                      {/* Seat Grid */}
                      <div className="bg-slate-50 rounded-xl p-6 overflow-x-auto">
                        <div className="mb-4 text-center">
                          <div className="inline-flex items-center gap-2 bg-slate-200 px-4 py-2 rounded-lg">
                            <Plane className="w-5 h-5 text-slate-600" />
                            <span className="text-sm font-bold text-slate-700">Front of Aircraft</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {Object.entries(seatsByRow).map(([row, rowSeats]) => (
                            <div key={row} className="flex items-center gap-2">
                              <span className="w-8 text-sm font-bold text-slate-600">{row}</span>
                              <div className="flex gap-2">
                                {rowSeats.sort((a, b) => a.seatNumber.localeCompare(b.seatNumber)).map(seat => (
                                  <div
                                    key={seat.id}
                                    className={`w-12 h-12 rounded-lg border-2 font-bold text-sm flex items-center justify-center ${getSeatClass(seat)}`}
                                    title={`${seat.seatNumber} - ${seat.status}`}
                                  >
                                    {seat.seatNumber.replace(/[0-9]/g, '')}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
    </div>
  )
}

