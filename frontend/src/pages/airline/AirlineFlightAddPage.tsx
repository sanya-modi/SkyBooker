// export { default } from '../../app/airline/flights/add/page'
import { useState, useEffect } from "react"
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Plane, Loader2, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { flightApi, airportApi, airlineApi, seatApi, type Airport, type Airline } from "@/services/api"

export default function AddFlightPage() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const [airports, setAirports] = useState<Airport[]>([])
  const [airlines, setAirlines] = useState<Airline[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    flightNumber: '',
    aircraftType: '',
    airlineId: '',
    departureAirportId: '',
    arrivalAirportId: '',
    departureTime: '',
    arrivalTime: '',
    totalSeats: '',
    baseFare: ''
  })

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    loadData()
  }, [isLoggedIn, navigate])

  const loadData = async () => {
    try {
      const [airportsData, airlinesData] = await Promise.all([
        airportApi.getAll(),
        airlineApi.getAll()
      ])
      setAirports(airportsData)
      setAirlines(airlinesData)
    } catch (err) {
      console.error('Error loading data:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setLoading(true)
      
      const flightData = {
        flightNumber: formData.flightNumber,
        aircraftType: formData.aircraftType,
        airlineId: parseInt(formData.airlineId),
        departureAirportId: parseInt(formData.departureAirportId),
        arrivalAirportId: parseInt(formData.arrivalAirportId),
        departureTime: formData.departureTime,
        arrivalTime: formData.arrivalTime,
        totalSeats: parseInt(formData.totalSeats),
        baseFare: parseFloat(formData.baseFare)
      }

      const createdFlight = await flightApi.create(flightData)
      
      // Initialize seats for the flight
      await seatApi.initialize(createdFlight.id, parseInt(formData.totalSeats))
      
      setSuccess(true)
      setTimeout(() => {
        navigate('/airline/flights')
      }, 2000)
    } catch (err) {
      console.error('Error creating flight:', err)
      alert(err instanceof Error ? err.message : 'Failed to create flight')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
          <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-2">Flight Created Successfully!</h2>
            <p className="text-slate-600 mb-6">Redirecting to flights list...</p>
          </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
        <Link
          to="/airline/flights"
          className="inline-flex items-center gap-2 text-[#00236f] font-bold mb-6 hover:underline"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Flights
        </Link>

        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#00236f] to-[#1e3a8a] rounded-2xl flex items-center justify-center">
              <Plane className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#00236f]">Add New Flight</h1>
              <p className="text-slate-600">Create a new flight schedule</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Flight Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.flightNumber}
                  onChange={(e) => setFormData({ ...formData, flightNumber: e.target.value })}
                  placeholder="e.g., AI101"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00236f] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Aircraft Type *
                </label>
                <input
                  type="text"
                  required
                  value={formData.aircraftType}
                  onChange={(e) => setFormData({ ...formData, aircraftType: e.target.value })}
                  placeholder="e.g., Boeing 737"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00236f] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Airline *
                </label>
                <select
                  required
                  value={formData.airlineId}
                  onChange={(e) => setFormData({ ...formData, airlineId: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00236f] focus:border-transparent"
                >
                  <option value="">Select Airline</option>
                  {airlines.map((airline) => (
                    <option key={airline.id} value={airline.id}>
                      {airline.name} ({airline.iataCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Total Seats *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.totalSeats}
                  onChange={(e) => setFormData({ ...formData, totalSeats: e.target.value })}
                  placeholder="e.g., 180"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00236f] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Departure Airport *
                </label>
                <select
                  required
                  value={formData.departureAirportId}
                  onChange={(e) => setFormData({ ...formData, departureAirportId: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00236f] focus:border-transparent"
                >
                  <option value="">Select Airport</option>
                  {airports.map((airport) => (
                    <option key={airport.id} value={airport.id}>
                      {airport.city} - {airport.name} ({airport.iataCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Arrival Airport *
                </label>
                <select
                  required
                  value={formData.arrivalAirportId}
                  onChange={(e) => setFormData({ ...formData, arrivalAirportId: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00236f] focus:border-transparent"
                >
                  <option value="">Select Airport</option>
                  {airports.map((airport) => (
                    <option key={airport.id} value={airport.id}>
                      {airport.city} - {airport.name} ({airport.iataCode})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Departure Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.departureTime}
                  onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00236f] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Arrival Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={formData.arrivalTime}
                  onChange={(e) => setFormData({ ...formData, arrivalTime: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00236f] focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Base Fare (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.baseFare}
                  onChange={(e) => setFormData({ ...formData, baseFare: e.target.value })}
                  placeholder="e.g., 5000"
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00236f] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-4 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-[#00236f] to-[#1e3a8a] text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Flight...
                  </>
                ) : (
                  <>
                    <Plane className="w-5 h-5" />
                    Create Flight
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
    </div>
  )
}
