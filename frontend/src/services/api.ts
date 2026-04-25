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
      const parsed = JSON.parse(errorBody) as { message?: string; error?: string }
      message = parsed.message || parsed.error || message
    } catch {
      // ignore invalid json
    }

    throw new Error(message)
  }

  const text = await response.text()
  return (text ? JSON.parse(text) : null) as T
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

export const authApi = {
  register: (body: {
    firstName: string
    lastName: string
    email: string
    password: string
    phoneNumber: string
    passportNumber?: string
    nationality?: string
  }) => request<AuthResponseData>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request<AuthResponseData>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  loginWithGoogle: (body: { idToken: string }) =>
    request<AuthResponseData>('/auth/login/google', { method: 'POST', body: JSON.stringify(body) }),
  getUserById: (userId: number) => request<UserResponse>(`/auth/users/${userId}`),
  getUserByEmail: (email: string) => request<UserResponse>(`/auth/users/email/${email}`),
  updateUser: (userId: number, body: Partial<UserResponse>) =>
    request<UserResponse>(`/auth/users/${userId}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteUser: (userId: number) =>
    request<void>(`/auth/users/${userId}`, { method: 'DELETE' }),
}

export interface UserResponse {
  id: number
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  passportNumber: string
  nationality: string
  authProvider: string
  role: string
  isActive: boolean
}

export const airportApi = {
  getAll: () => request<Airport[]>('/airports'),
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
  getAll: () => request<Airline[]>('/airlines'),
  getById: (id: number) => request<Airline>(`/airlines/${id}`),
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
  release: (seatId: number) =>
    request<void>(`/seats/${seatId}/release`, { method: 'DELETE' }),
}

export const bookingApi = {
  create: (body: {
    userId: number
    flightId: number
    numberOfPassengers: number
    selectedSeats: string[]
    specialRequests?: string
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

export async function getAllAirportsCached() {
  if (cachedAirports) return cachedAirports
  cachedAirports = await airportApi.getAll()
  return cachedAirports
}

export async function getAllAirlinesCached() {
  if (cachedAirlines) return cachedAirlines
  cachedAirlines = await airlineApi.getAll()
  return cachedAirlines
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
  passportNumber: string
  nationality: string
  seatNumber: string
  mealPreference: string | null
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
      body: JSON.stringify({ 
        orderId: body.razorpayOrderId, 
        paymentId: body.razorpayPaymentId, 
        signature: body.razorpaySignature 
      }) 
    }),
  getByBooking: (bookingId: number) => request<PaymentResult[]>(`/payments/booking/${bookingId}`),
  getByUser: (userId: number) => request<PaymentResult[]>(`/payments/user/${userId}`),
}

export const passengerApi = {
  getByBooking: (bookingId: number) => request<PassengerResult[]>(`/passengers/booking/${bookingId}`),
}
