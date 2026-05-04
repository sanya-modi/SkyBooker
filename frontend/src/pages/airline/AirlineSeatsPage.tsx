import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  Loader2,
  MapPin,
  Plane,
  Save,
  Search,
  User,
} from "lucide-react"
import { useAuth } from "@/context/auth-context"
import {
  flightApi,
  seatApi,
  getAllAirportsCached,
  type Airport,
  type FlightResult,
  type SeatClassConfigRange,
  type SeatResult,
  type FlightPassengerManifestItem,
  type SeatCountUpdateEvent,
} from "@/services/api"

const SEAT_LETTERS = ["A", "B", "C", "D", "E", "F"] as const

type RangeDraft = {
  startRow: string
  endRow: string
  seatClass: "ECONOMY" | "BUSINESS" | "FIRST"
}

const EMPTY_RANGE: RangeDraft = {
  startRow: "",
  endRow: "",
  seatClass: "ECONOMY",
}

function mapConfigRangesToDrafts(configs: SeatClassConfigRange[]): RangeDraft[] {
  return configs.length > 0
    ? configs.map((entry) => ({
        startRow: String(entry.startRow),
        endRow: String(entry.endRow),
        seatClass: entry.seatClass,
      }))
    : [{ ...EMPTY_RANGE }]
}

function resolveSeatClassFromDrafts(seatNumber: string, ranges: RangeDraft[]): "ECONOMY" | "BUSINESS" | "FIRST" {
  const rowNumber = Number.parseInt(seatNumber, 10)
  for (const range of ranges) {
    const startRow = Number(range.startRow)
    const endRow = Number(range.endRow)
    if (!Number.isFinite(startRow) || !Number.isFinite(endRow)) continue
    if (rowNumber >= startRow && rowNumber <= endRow) {
      return range.seatClass
    }
  }
  return "ECONOMY"
}

export default function AirlineSeatsPage() {
  const navigate = useNavigate()
  const { isLoggedIn, isAuthReady, profile } = useAuth()
  const [flights, setFlights] = useState<FlightResult[]>([])
  const [airports, setAirports] = useState<Airport[]>([])
  const [selectedFlight, setSelectedFlight] = useState<FlightResult | null>(null)
  const [seats, setSeats] = useState<SeatResult[]>([])
  const [passengers, setPassengers] = useState<FlightPassengerManifestItem[]>([])
  const [ranges, setRanges] = useState<RangeDraft[]>([{ ...EMPTY_RANGE }])
  const [loading, setLoading] = useState(true)
  const [seatsLoading, setSeatsLoading] = useState(false)
  const [savingConfig, setSavingConfig] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!isAuthReady) return
    if (!isLoggedIn) {
      navigate("/login")
      return
    }
    if (!profile?.airlineId) return

    void loadData()
  }, [isAuthReady, isLoggedIn, navigate, profile?.airlineId])

  useEffect(() => {
    if (!selectedFlight) return

    let cancelled = false
    let pollingId: number | undefined

    const applySeats = (nextSeats: SeatResult[]) => {
      if (!cancelled) {
        setSeats(nextSeats)
        setSeatsLoading(false)
      }
    }

    const startPolling = () => {
      pollingId = window.setInterval(async () => {
        try {
          applySeats(await seatApi.getAllByFlight(selectedFlight.id))
        } catch {
          // keep current state if polling misses
        }
      }, 5000)
    }

    if (typeof EventSource === "undefined") {
      startPolling()
      return () => {
        cancelled = true
        if (pollingId) window.clearInterval(pollingId)
      }
    }

    const stream = seatApi.createSeatStream(selectedFlight.id)
    stream.addEventListener("seat-map", (event) => {
      try {
        const payload = JSON.parse((event as MessageEvent).data) as { seats: SeatResult[]; configs?: SeatClassConfigRange[] }
        applySeats(payload.seats)
        if (payload.configs) {
          setRanges(mapConfigRangesToDrafts(payload.configs))
        }
      } catch {
        // ignore malformed events
      }
    })
    stream.addEventListener("seat-count", (event) => {
      try {
        const payload = JSON.parse((event as MessageEvent).data) as SeatCountUpdateEvent
        setSelectedFlight(prev => prev ? { ...prev, availableSeats: payload.availableSeats } : null)
      } catch {
        // ignore malformed events
      }
    })
    stream.onerror = () => {
      stream.close()
      startPolling()
    }

    return () => {
      cancelled = true
      stream.close()
      if (pollingId) window.clearInterval(pollingId)
    }
  }, [selectedFlight])

  async function loadData() {
    if (!profile?.airlineId) return

    try {
      setLoading(true)
      const [flightsData, airportsData] = await Promise.all([
        flightApi.getByAirline(profile.airlineId),
        getAllAirportsCached(),
      ])
      setFlights(flightsData)
      setAirports(airportsData)
    } catch (err) {
      console.error("Error loading data:", err)
      setMessage(err instanceof Error ? err.message : "Failed to load flights.")
    } finally {
      setLoading(false)
    }
  }

  async function loadFlightDetails(flight: FlightResult) {
    try {
      setMessage("")
      setSelectedFlight(flight)
      setSeatsLoading(true)

      let nextSeats = await seatApi.getAllByFlight(flight.id)
      if (nextSeats.length !== flight.totalSeats) {
        await seatApi.initialize(flight.id, flight.totalSeats)
        nextSeats = await seatApi.getAllByFlight(flight.id)
      }

      const [config, manifest] = await Promise.all([
        flightApi.getSeatConfig(flight.id),
        flightApi.getPassengers(flight.id),
      ])

      setSeats(nextSeats)
      setPassengers(manifest)
      setRanges(mapConfigRangesToDrafts(config))
    } catch (err) {
      console.error("Error loading seats:", err)
      setMessage(err instanceof Error ? err.message : "Failed to load seat map.")
    } finally {
      setSeatsLoading(false)
    }
  }

  async function handleSaveConfig() {
    if (!selectedFlight) return

    const payload = ranges
      .map((range) => ({
        startRow: Number(range.startRow),
        endRow: Number(range.endRow),
        seatClass: range.seatClass,
      }))
      .filter((range) => Number.isFinite(range.startRow) && Number.isFinite(range.endRow))

    if (payload.length === 0) {
      setMessage("Add at least one valid row range before saving.")
      return
    }

    try {
      setSavingConfig(true)
      setMessage("")
      await flightApi.saveSeatConfig(selectedFlight.id, payload)
      setSeats(await seatApi.getAllByFlight(selectedFlight.id))
      setMessage("Seat class configuration saved.")
    } catch (err) {
      console.error("Error saving config:", err)
      setMessage(err instanceof Error ? err.message : "Failed to save seat classes.")
    } finally {
      setSavingConfig(false)
    }
  }

  const filteredFlights = useMemo(
    () =>
      flights.filter((flight) =>
        flight.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [flights, searchTerm],
  )

  const seatsByRow = useMemo(() => {
    const rows = new Map<number, Map<string, SeatResult>>()
    for (const seat of seats) {
      const rowNumber = Number.parseInt(seat.seatNumber, 10)
      const seatLetter = seat.seatNumber.replace(/[0-9]/g, "")
      if (!rows.has(rowNumber)) {
        rows.set(rowNumber, new Map())
      }
      rows.get(rowNumber)?.set(seatLetter, seat)
    }
    return Array.from(rows.entries()).sort((a, b) => a[0] - b[0])
  }, [seats])

  const stats = useMemo(
    () => ({
      total: seats.length,
      available: seats.filter((seat) => seat.status === "AVAILABLE").length,
      held: seats.filter((seat) => seat.status === "HELD").length,
      booked: seats.filter((seat) => seat.status === "BOOKED").length,
    }),
    [seats],
  )

  function getAirport(id: number) {
    return airports.find((airport) => airport.id === id)
  }

  function getSeatClasses(seat: SeatResult) {
    const classStyles = {
      ECONOMY: "bg-slate-100 border-slate-200 text-slate-600",
      BUSINESS: "bg-amber-50 border-amber-200 text-amber-700",
      FIRST: "bg-violet-50 border-violet-200 text-violet-700",
    } as const

    const previewSeatClass = resolveSeatClassFromDrafts(seat.seatNumber, ranges)

    if (seat.status === "BOOKED") return "bg-red-100 border-red-300 text-red-700"
    if (seat.status === "HELD") return "bg-yellow-100 border-yellow-300 text-yellow-700"
    return classStyles[previewSeatClass] ?? classStyles.ECONOMY
  }

  function getPassengerBySeat(seatNumber: string) {
    return passengers.find((p) => p.seat === seatNumber)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-[#00236f] mb-2">Seat Management</h1>
        <p className="text-slate-600">View your airline flights and assign cabin classes by row.</p>
      </div>

      {message && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-slate-700">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                      onClick={() => void loadFlightDetails(flight)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        selectedFlight?.id === flight.id
                          ? "border-[#00236f] bg-blue-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <p className="font-bold text-slate-800 mb-1">{flight.flightNumber}</p>
                      <p className="text-sm text-slate-600 mb-1">
                        {depAirport?.iataCode} → {arrAirport?.iataCode}
                      </p>
                      <p className="text-xs text-slate-500">{flight.totalSeats} seats</p>
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
              <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 font-bold">Select a flight to view seat map</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800">{selectedFlight.flightNumber}</h2>
                    <p className="text-slate-600">{selectedFlight.aircraftType}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 min-w-[260px]">
                    <div className="bg-green-50 rounded-xl p-3">
                      <p className="text-2xl font-black text-green-700">{stats.available}</p>
                      <p className="text-xs text-green-600">Available</p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-3">
                      <p className="text-2xl font-black text-red-700">{stats.booked}</p>
                      <p className="text-xs text-red-600">Booked</p>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-3">
                      <p className="text-2xl font-black text-yellow-700">{stats.held}</p>
                      <p className="text-xs text-yellow-600">Held</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-3">
                      <p className="text-2xl font-black text-blue-700">{stats.total}</p>
                      <p className="text-xs text-blue-600">Total</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-800">Seat Class Configuration</h3>
                      <p className="text-sm text-slate-500">Assign whole row ranges to First, Business, or Economy.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRanges((current) => [...current, { ...EMPTY_RANGE }])}
                      className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-all"
                    >
                      Add Range
                    </button>
                  </div>

                  <div className="space-y-3">
                    {ranges.map((range, index) => (
                      <div key={`${index}-${range.startRow}-${range.endRow}-${range.seatClass}`} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1.2fr_auto] gap-3">
                        <input
                          type="number"
                          min="1"
                          value={range.startRow}
                          onChange={(e) =>
                            setRanges((current) =>
                              current.map((entry, entryIndex) =>
                                entryIndex === index ? { ...entry, startRow: e.target.value } : entry,
                              ),
                            )
                          }
                          placeholder="Start row"
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00236f] focus:border-transparent"
                        />
                        <input
                          type="number"
                          min="1"
                          value={range.endRow}
                          onChange={(e) =>
                            setRanges((current) =>
                              current.map((entry, entryIndex) =>
                                entryIndex === index ? { ...entry, endRow: e.target.value } : entry,
                              ),
                            )
                          }
                          placeholder="End row"
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00236f] focus:border-transparent"
                        />
                        <select
                          value={range.seatClass}
                          onChange={(e) =>
                            setRanges((current) =>
                              current.map((entry, entryIndex) =>
                                entryIndex === index
                                  ? { ...entry, seatClass: e.target.value as RangeDraft["seatClass"] }
                                  : entry,
                              ),
                            )
                          }
                          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00236f] focus:border-transparent"
                        >
                          <option value="FIRST">First Class</option>
                          <option value="BUSINESS">Business</option>
                          <option value="ECONOMY">Economy</option>
                        </select>
                        <button
                          type="button"
                          onClick={() =>
                            setRanges((current) =>
                              current.length === 1 ? [{ ...EMPTY_RANGE }] : current.filter((_, entryIndex) => entryIndex !== index),
                            )
                          }
                          className="px-4 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => void handleSaveConfig()}
                      disabled={savingConfig}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#00236f] to-[#1e3a8a] text-white font-bold hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {savingConfig ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Seat Classes
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-black text-slate-800">Seat Map</h3>
                  <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                    <User className="w-5 h-5 text-blue-600" />
                    <span className="font-bold text-blue-700">{passengers.length} Passengers</span>
                  </div>
                </div>

                {seatsLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 text-[#00236f] animate-spin mx-auto mb-4" />
                    <p className="text-slate-600">Loading seats...</p>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-4 mb-6 pb-4 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-slate-100 border-2 border-slate-200 rounded-lg" />
                        <span className="text-sm text-slate-600">Economy</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-amber-50 border-2 border-amber-200 rounded-lg" />
                        <span className="text-sm text-slate-600">Business</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-violet-50 border-2 border-violet-200 rounded-lg" />
                        <span className="text-sm text-slate-600">First</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-yellow-100 border-2 border-yellow-300 rounded-lg" />
                        <span className="text-sm text-slate-600">Held</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-red-100 border-2 border-red-300 rounded-lg" />
                        <span className="text-sm text-slate-600">Booked</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-6 overflow-x-auto">
                      <div className="mb-4 text-center">
                        <div className="inline-flex items-center gap-2 bg-slate-200 px-4 py-2 rounded-lg">
                          <Plane className="w-5 h-5 text-slate-600" />
                          <span className="text-sm font-bold text-slate-700">Front of Aircraft</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {seatsByRow.map(([rowNumber, rowSeats]) => (
                          <div key={rowNumber} className="flex items-center gap-2">
                            <span className="w-8 text-sm font-bold text-slate-600">{rowNumber}</span>
                            <div className="flex gap-2">
                              {SEAT_LETTERS.map((seatLetter) => {
                                const seat = rowSeats.get(seatLetter)
                                if (!seat) {
                                  return <div key={`${rowNumber}-${seatLetter}`} className="w-12 h-12" />
                                }

                                const passenger = getPassengerBySeat(seat.seatNumber)
                                const tooltipText = passenger
                                  ? `${seat.seatNumber} - ${resolveSeatClassFromDrafts(seat.seatNumber, ranges)} - ${seat.status}\n${passenger.name}\n${passenger.email || 'N/A'}`
                                  : `${seat.seatNumber} - ${resolveSeatClassFromDrafts(seat.seatNumber, ranges)} - ${seat.status}`

                                return (
                                  <div
                                    key={seat.id}
                                    className={`w-12 h-12 rounded-lg border-2 font-bold text-sm flex flex-col items-center justify-center relative group ${getSeatClasses(seat)}`}
                                    title={tooltipText}
                                  >
                                    <span>{seatLetter}</span>
                                    <span className="text-[10px]">{resolveSeatClassFromDrafts(seat.seatNumber, ranges)[0]}</span>
                                    {passenger && (
                                      <User className="absolute top-0 right-0 w-3 h-3 text-red-600" />
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* {passengers.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="text-xl font-black text-slate-800 mb-4">Booked Passengers</h3>
                  <div className="overflow-x-auto border-2 border-slate-200 rounded-xl">
                    <table className="min-w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr className="text-left text-slate-600">
                          <th className="px-4 py-3 font-bold">Seat</th>
                          <th className="px-4 py-3 font-bold">Passenger</th>
                          <th className="px-4 py-3 font-bold">Contact</th>
                          <th className="px-4 py-3 font-bold">Passport</th>
                          <th className="px-4 py-3 font-bold">Booked By</th>
                        </tr>
                      </thead>
                      <tbody>
                        {passengers.map((passenger) => (
                          <tr key={passenger.id} className="border-t border-slate-200">
                            <td className="px-4 py-3 font-bold text-[#00236f]">{passenger.seat || 'N/A'}</td>
                            <td className="px-4 py-3 font-bold text-slate-800">{passenger.name}</td>
                            <td className="px-4 py-3 text-slate-600">
                              <div>{passenger.email || 'N/A'}</div>
                              <div className="text-xs">{passenger.phone || 'N/A'}</div>
                            </td>
                            <td className="px-4 py-3 text-slate-600">{passenger.passport || 'N/A'}</td>
                            <td className="px-4 py-3 text-slate-600">
                              <div className="font-bold text-slate-800">{passenger.bookedByName || 'N/A'}</div>
                              <div className="text-xs">{passenger.bookedByEmail || 'N/A'}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )} */}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
