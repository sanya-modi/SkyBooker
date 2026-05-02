const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('skybooker_token')
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`
  const response = await fetch(fullUrl, { ...options, headers })

  if (!response.ok) {
    const errorBody = await response.text()
    let message = `Request failed: ${response.status}`

    try {
      const parsed = JSON.parse(errorBody) as { message?: string; error?: string; errors?: Record<string, string> }
      const validationErrors = parsed.errors ? Object.values(parsed.errors).filter(Boolean) : []
      message = validationErrors.length > 0
        ? validationErrors.join(' | ')
        : parsed.message || parsed.error || message
    } catch {
      // ignore invalid json
    }

    throw new Error(message)
  }

  const text = await response.text()
  if (!text) return null as T
  try {
    return JSON.parse(text) as T
  } catch {
    // If response is plain text and not valid JSON
    return text as unknown as T
  }
}

export interface Airport {
  id: number
  name: string
  iataCode: string
  city: string
  country: string
  description: string
  phoneNumber: string
  email: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Airline {
  id: number
  name: string
  iataCode: string
  description: string
  phoneNumber: string
  email: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface FlightResult {
  id: number
  flightNumber: string
  aircraftType: string
  airlineId: number
  departureAirportId: number
  arrivalAirportId: number
  departureTime: string
  arrivalTime: string
  totalSeats: number
  availableSeats: number
  baseFare: number
  status: string
}

export interface FlightPassengerManifestItem {
  id: number
  bookingId: number
  userId: number
  name: string
  email: string | null
  phone: string | null
  seat: string | null
  passport: string | null
  blocked: boolean
  bookedByName: string | null
  bookedByEmail: string | null
  bookedByPhone: string | null
}

export interface EnrichedFlightResult extends FlightResult {
  airline?: Airline
  departureAirport?: Airport
  arrivalAirport?: Airport
  stopCount: number
  stopsLabel: string
}

export interface SeatResult {
  id: number
  flightId: number
  seatNumber: string
  seatClass: 'ECONOMY' | 'BUSINESS' | 'FIRST'
  status: 'AVAILABLE' | 'HELD' | 'BOOKED'
  passengerId: number | null
  bookingId: number | null
  holdExpiresAt: string | null
  createdAt: string
  updatedAt: string
}

export interface SeatClassConfigRange {
  id?: number
  flightId?: number
  startRow: number
  endRow: number
  seatClass: 'ECONOMY' | 'BUSINESS' | 'FIRST'
}

export interface SeatMapUpdateEvent {
  flightId: number
  eventType: string
  timestamp: string
  seats: SeatResult[]
  configs: SeatClassConfigRange[]
}

export interface AuthResponseData {
  userId: number
  email: string
  token: string
  role: string
}

export interface BookingResult {
  id: number
  pnr: string
  userId: number
  flightId: number
  numberOfPassengers: number
  baseFare: number
  taxes: number
  ancillaryCharges: number
  totalFare: number
  status: string
  bookingDate: string
  checkedIn: boolean
  checkedInAt: string | null
  selectedSeats: string[]
}

export interface BookingPassengerValidationPayload {
  dateOfBirth: string
  category: 'ADULT' | 'CHILD' | 'INFANT'
}

export const authApi = {
  register: (body: {
    firstName: string
    lastName: string
    email: string
    password: string
    phoneNumber: string
    role: string
    passportNumber?: string
    nationality?: string
    airlineId?: number
  }) => request<AuthResponseData>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request<AuthResponseData>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  loginWithGoogle: (body: { idToken: string }) =>
    request<AuthResponseData>('/auth/login/google', { method: 'POST', body: JSON.stringify(body) }),
  forgotPassword: (body: { email: string }) =>
    request<void>('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),
  resetPassword: (body: { token: string; newPassword: string }) =>
    request<void>('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),
  getUserById: (userId: number, fresh = false) =>
    request<UserResponse>(`/auth/users/${userId}`, fresh ? { cache: 'no-store' } : undefined),
  getUserByEmail: (email: string) => request<UserResponse>(`/auth/users/email/${email}`),
  updateUser: (userId: number, body: Partial<UserResponse>) =>
    request<UserResponse>(`/auth/users/${userId}`, { method: 'PUT', body: JSON.stringify(body) }),
    deleteUser: (userId: number) =>
    request<void>(`/auth/users/${userId}`, { method: 'DELETE' }),
}

export const supportApi = {
  submitSupportRequest: (body: { title: string; description: string; userEmail: string; fullName: string }) =>
    request<void>('/notifications/support', { method: 'POST', body: JSON.stringify(body) }),
}

export interface UserResponse {
  id: number
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  passportNumber: string
  nationality: string
  profilePhotoUrl?: string
  airlineId: number | null
  authProvider: string
  role: string
  isActive: boolean
}

export const airportApi = {
  getAll: (includeInactive = false) => 
    request<Airport[]>(`/airports${includeInactive ? '?includeInactive=true' : ''}`),
  getById: (id: number) => request<Airport>(`/airports/${id}`),
  getByIata: (code: string) => request<Airport>(`/airports/iata/${code}`),
  searchByCity: (searchTerm: string) =>
    request<Airport[]>(
      `/airports/search/by-city?searchTerm=${encodeURIComponent(searchTerm)}`,
    ),
  create: (body: {
    name: string
    iataCode: string
    city: string
    country: string
    description: string
    phoneNumber: string
    email: string
  }) => request<Airport>('/airports', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: number, body: Partial<Airport>) =>
    request<Airport>(`/airports/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: number) => request<void>(`/airports/${id}`, { method: 'DELETE' }),
}

export const airlineApi = {
  getAll: (includeInactive = false) => 
    request<Airline[]>(`/airlines${includeInactive ? '?includeInactive=true' : ''}`),
  getById: (id: number, fresh = false) =>
    request<Airline>(`/airlines/${id}`, fresh ? { cache: 'no-store' } : undefined),
  create: (body: {
    name: string
    iataCode: string
    description: string
    phoneNumber: string
    email: string
  }) => request<Airline>('/airlines', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: number, body: Partial<Airline>) =>
    request<Airline>(`/airlines/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (id: number) => request<void>(`/airlines/${id}`, { method: 'DELETE' }),
}

export const flightApi = {
  search: (departureAirportId: number, arrivalAirportId: number, departureDate: string) =>
    request<FlightResult[]>(
      `/flights/search?departureAirportId=${departureAirportId}&arrivalAirportId=${arrivalAirportId}&departureDate=${departureDate}T00:00:00`,
    ),
  getById: (id: number) => request<FlightResult>(`/flights/${id}`),
  getAll: () => request<FlightResult[]>('/flights'),
  getByAirline: (airlineId: number) =>
    request<FlightResult[]>(`/flights?airline=${encodeURIComponent(String(airlineId))}`, { cache: 'no-store' }),
  getByDate: (date: string) => request<FlightResult[]>(`/flights?date=${encodeURIComponent(date)}`),
  getSeatConfig: (id: number) => request<SeatClassConfigRange[]>(`/flights/${id}/seat-config`),
  getPassengers: (id: number) => request<FlightPassengerManifestItem[]>(`/flights/${id}/passengers`),
  create: (body: {
    flightNumber: string
    aircraftType: string
    airlineId: number
    departureAirportId: number
    arrivalAirportId: number
    departureTime: string
    arrivalTime: string
    totalSeats: number
    baseFare: number
  }) => request<FlightResult>('/flights', { method: 'POST', body: JSON.stringify(body) }),
  update: (id: number, body: {
    flightNumber: string
    aircraftType: string
    airlineId: number
    departureAirportId: number
    arrivalAirportId: number
    departureTime: string
    arrivalTime: string
    totalSeats: number
    baseFare: number
  }) => request<FlightResult>(`/flights/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  updateStatus: (id: number, status: string) =>
    request<FlightResult>(`/flights/${id}/status?status=${status}`, { method: 'PUT' }),
  saveSeatConfig: (id: number, ranges: SeatClassConfigRange[]) =>
    request<SeatClassConfigRange[]>(`/flights/${id}/seat-config`, {
      method: 'POST',
      body: JSON.stringify({ ranges }),
    }),
  delete: (id: number) => request<void>(`/flights/${id}`, { method: 'DELETE' }),
}

export const seatApi = {
  getAllByFlight: (flightId: number) => request<SeatResult[]>(`/seats/flight/${flightId}`),
  getAvailable: (flightId: number) => request<SeatResult[]>(`/seats/available/${flightId}`),
  getByClass: (flightId: number, seatClass: string) =>
    request<SeatResult[]>(`/seats/available/${flightId}/${seatClass}`),
  getByBooking: (bookingId: number) => request<SeatResult[]>(`/seats/booking/${bookingId}`),
  initialize: (flightId: number, totalSeats: number) =>
    request<void>('/seats/initialize', { method: 'POST', body: JSON.stringify({ flightId, totalSeats }) }),
  hold: (flightId: number, seatNumber: string, passengerId: number) =>
    request<SeatResult>('/seats/hold', { method: 'POST', body: JSON.stringify({ flightId, seatNumber, passengerId }) }),
  book: (flightId: number, seatNumber: string, bookingId: number, passengerId: number) =>
    request<SeatResult>('/seats/book', { method: 'POST', body: JSON.stringify({ flightId, seatNumber, bookingId, passengerId }) }),
  release: (seatId: number) =>
    request<void>(`/seats/${seatId}/release`, { method: 'DELETE' }),
  releaseByFlightSeat: (flightId: number, seatNumber: string) =>
    request<void>(`/seats/release/${flightId}/${encodeURIComponent(seatNumber)}`, { method: 'DELETE' }),
  getConfig: (flightId: number) => request<SeatClassConfigRange[]>(`/seats/flight/${flightId}/config`),
  saveConfig: (flightId: number, ranges: SeatClassConfigRange[]) =>
    request<SeatClassConfigRange[]>(`/seats/flight/${flightId}/config`, {
      method: 'POST',
      body: JSON.stringify({ ranges }),
    }),
  createSeatStream: (flightId: number) => {
    const token = localStorage.getItem('skybooker_token')
    const url = new URL(`${API_BASE_URL}/seats/flight/${flightId}/stream`)
    if (token) {
      url.searchParams.set('token', token)
    }
    return new EventSource(url.toString())
  },
}

export const bookingApi = {
  create: (body: {
    userId: number
    flightId: number
    numberOfPassengers: number
    selectedSeats: string[]
    specialRequests?: string
    passengers?: BookingPassengerValidationPayload[]
  }) => request<BookingResult>('/bookings', { method: 'POST', body: JSON.stringify(body) }),
  getByPnr: (pnr: string) => request<BookingResult>(`/bookings/pnr/${pnr}`),
  getByUser: (userId: number) => request<BookingResult[]>(`/bookings/user/${userId}`),
  getById: (id: number) => request<BookingResult>(`/bookings/${id}`),
  getByFlight: (flightId: number) => request<BookingResult[]>(`/bookings/flight/${flightId}/confirmed`),
  cancel: (id: number) => request<void>(`/bookings/${id}`, { method: 'DELETE' }),
  checkIn: (id: number, seatNumber?: string) => {
    const url = seatNumber 
      ? `/bookings/${id}/check-in?seatNumber=${encodeURIComponent(seatNumber)}`
      : `/bookings/${id}/check-in`
    return request<BookingResult>(url, { method: 'PUT' })
  },
  downloadTicket: async (id: number): Promise<Blob> => {
    const token = localStorage.getItem('skybooker_token')
    const response = await fetch(`${API_BASE_URL}/bookings/${id}/eticket`, {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
    if (!response.ok) throw new Error('Failed to download ticket')
    return response.blob()
  },
}

let cachedAirports: Airport[] | null = null
let cachedAirlines: Airline[] | null = null
let cacheTimestamp = 0
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

function isCacheValid() {
  return Date.now() - cacheTimestamp < CACHE_TTL_MS
}

export async function getAllAirportsCached() {
  if (cachedAirports && isCacheValid()) return cachedAirports
  cachedAirports = await airportApi.getAll()
  cacheTimestamp = Date.now()
  return cachedAirports
}

export async function getAllAirlinesCached() {
  if (cachedAirlines && isCacheValid()) return cachedAirlines
  cachedAirlines = await airlineApi.getAll()
  cacheTimestamp = Date.now()
  return cachedAirlines
}

export function clearCache() {
  cachedAirports = null
  cachedAirlines = null
  cacheTimestamp = 0
}

export async function searchFlights(
  departureAirportId: number,
  arrivalAirportId: number,
  departureDate: string,
) {
  const [flightResults, airports, airlines] = await Promise.all([
    flightApi.search(departureAirportId, arrivalAirportId, departureDate),
    getAllAirportsCached(),
    getAllAirlinesCached(),
  ])

  return flightResults.map<EnrichedFlightResult>((flight) => ({
    ...flight,
    airline: airlines.find((airline) => airline.id === flight.airlineId),
    departureAirport: airports.find((airport) => airport.id === flight.departureAirportId),
    arrivalAirport: airports.find((airport) => airport.id === flight.arrivalAirportId),
    stopCount: 0,
    stopsLabel: 'Direct',
  }))
}

export interface PaymentResult {
  id: number
  transactionId: string
  bookingId: number
  userId: number
  amount: number
  paymentMethod: string
  status: string
  gatewayTransactionId: string | null
  razorpayOrderId: string | null
  razorpayPaymentId: string | null
  failureReason: string | null
  transactionDate: string
  refundAmount: number | null
  createdAt: string
  updatedAt: string
}

export interface PassengerResult {
  id: number
  bookingId: number
  firstName: string
  lastName: string
  dateOfBirth: string
  category: 'ADULT' | 'CHILD' | 'INFANT'
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  passportNumber: string
  nationality: string
  seatNumber?: string
  mealPreference?: string | null
}

export interface PassengerCreateRequest {
  bookingId: number
  firstName: string
  lastName: string
  email?: string
  phoneNumber?: string
  passportNumber: string
  dateOfBirth: string
  category: 'ADULT' | 'CHILD' | 'INFANT'
  gender: 'MALE' | 'FEMALE' | 'OTHER'
  nationality: string
  specialRequests?: string
}

export const paymentApi = {
  createOrder: (body: { bookingId: number; userId: number; amount: number; currency?: string; paymentMethod: string }, userEmail: string, userName: string) =>
    request<{ orderId: string; amount: number; currency: string; keyId: string }>('/payments/razorpay/create-order', {
      method: 'POST',
      body: JSON.stringify({ ...body, currency: body.currency ?? 'INR' }),
      headers: { 'X-User-Email': userEmail, 'X-User-Name': userName },
    }),
  verify: (body: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }) =>
    request<PaymentResult>('/payments/razorpay/verify', { 
      method: 'POST', 
      body: JSON.stringify(body)
    }),
  getByBooking: (bookingId: number) => request<PaymentResult[]>(`/payments/booking/${bookingId}`),
  getByUser: (userId: number) => request<PaymentResult[]>(`/payments/user/${userId}`),
}

export const passengerApi = {
  create: (body: PassengerCreateRequest) =>
    request<PassengerResult>('/passengers', { method: 'POST', body: JSON.stringify(body) }),
  getByBooking: (bookingId: number) => request<PassengerResult[]>(`/passengers/booking/${bookingId}`),
  delete: (id: number) => request<void>(`/passengers/${id}`, { method: 'DELETE' }),
  block: (id: number) => request<void>(`/passengers/${id}/block`, { method: 'PUT' }),
}

