import { authApi, airportApi, airlineApi, flightApi, seatApi, bookingApi, paymentApi, passengerApi, adminApi, supportApi } from '../../src/services/api'

global.fetch = vi.fn()

const mockResponse = (data: any) => {
  (global.fetch as any).mockResolvedValueOnce({
    ok: true,
    text: async () => JSON.stringify(data),
  })
}

const mockError = (status = 400) => {
  (global.fetch as any).mockResolvedValueOnce({
    ok: false,
    status,
    text: async () => JSON.stringify({ message: 'Error' }),
  })
}

describe('Auth API', () => {
  beforeEach(() => vi.clearAllMocks())

  it('registers user', async () => {
    mockResponse({ userId: 1, token: 'token' })
    const result = await authApi.register({ firstName: 'John', lastName: 'Doe', email: 'test@test.com', password: 'pass', phoneNumber: '123', role: 'PASSENGER' })
    expect(result.userId).toBe(1)
  })

  it('logs in user', async () => {
    mockResponse({ userId: 1, token: 'token' })
    const result = await authApi.login({ email: 'test@test.com', password: 'pass' })
    expect(result.token).toBe('token')
  })

  it('logs in with Google', async () => {
    mockResponse({ userId: 1, token: 'token' })
    const result = await authApi.loginWithGoogle({ idToken: 'google-token' })
    expect(result.token).toBe('token')
  })

  it('handles forgot password', async () => {
    mockResponse(null)
    await authApi.forgotPassword({ email: 'test@test.com' })
    expect(global.fetch).toHaveBeenCalled()
  })

  it('resets password', async () => {
    mockResponse(null)
    await authApi.resetPassword({ token: 'reset', newPassword: 'new' })
    expect(global.fetch).toHaveBeenCalled()
  })

  it('gets all users', async () => {
    mockResponse([{ id: 1 }])
    const result = await authApi.getAllUsers()
    expect(result).toHaveLength(1)
  })

  it('gets user by id', async () => {
    mockResponse({ id: 1, email: 'test@test.com' })
    const result = await authApi.getUserById(1)
    expect(result.id).toBe(1)
  })

  it('updates user', async () => {
    mockResponse({ id: 1, email: 'new@test.com' })
    const result = await authApi.updateUser(1, { email: 'new@test.com' })
    expect(result.email).toBe('new@test.com')
  })

  it('deletes user', async () => {
    mockResponse(null)
    await authApi.deleteUser(1)
    expect(global.fetch).toHaveBeenCalled()
  })

  it('handles auth errors', async () => {
    mockError(401)
    await expect(authApi.login({ email: 'test', password: 'test' })).rejects.toThrow()
  })
})

describe('Airport API', () => {
  beforeEach(() => vi.clearAllMocks())

  it('gets all airports', async () => {
    mockResponse([{ id: 1, name: 'JFK' }])
    const result = await airportApi.getAll()
    expect(result).toHaveLength(1)
  })

  it('gets airport by id', async () => {
    mockResponse({ id: 1, name: 'JFK' })
    const result = await airportApi.getById(1)
    expect(result.name).toBe('JFK')
  })

  it('searches airports by city', async () => {
    mockResponse([{ id: 1, city: 'New York' }])
    const result = await airportApi.searchByCity('New York')
    expect(result[0].city).toBe('New York')
  })

  it('creates airport', async () => {
    mockResponse({ id: 1, name: 'JFK' })
    const result = await airportApi.create({ name: 'JFK', iataCode: 'JFK', city: 'NY', country: 'USA', description: '', phoneNumber: '', email: '' })
    expect(result.id).toBe(1)
  })

  it('updates airport', async () => {
    mockResponse({ id: 1, name: 'Updated' })
    const result = await airportApi.update(1, { name: 'Updated' })
    expect(result.name).toBe('Updated')
  })

  it('deletes airport', async () => {
    mockResponse(null)
    await airportApi.delete(1)
    expect(global.fetch).toHaveBeenCalled()
  })
})

describe('Airline API', () => {
  beforeEach(() => vi.clearAllMocks())

  it('gets all airlines', async () => {
    mockResponse([{ id: 1, name: 'AA' }])
    const result = await airlineApi.getAll()
    expect(result).toHaveLength(1)
  })

  it('gets airline by id', async () => {
    mockResponse({ id: 1, name: 'AA' })
    const result = await airlineApi.getById(1)
    expect(result.name).toBe('AA')
  })

  it('creates airline', async () => {
    mockResponse({ id: 1, name: 'AA' })
    const result = await airlineApi.create({ name: 'AA', iataCode: 'AA', description: '', phoneNumber: '', email: '' })
    expect(result.id).toBe(1)
  })

  it('updates airline', async () => {
    mockResponse({ id: 1, name: 'Updated' })
    const result = await airlineApi.update(1, { name: 'Updated' })
    expect(result.name).toBe('Updated')
  })

  it('deletes airline', async () => {
    mockResponse(null)
    await airlineApi.delete(1)
    expect(global.fetch).toHaveBeenCalled()
  })
})

describe('Flight API', () => {
  beforeEach(() => vi.clearAllMocks())

  it('searches flights', async () => {
    mockResponse([{ id: 1, flightNumber: 'AA100' }])
    const result = await flightApi.search(1, 2, '2024-01-01')
    expect(result[0].flightNumber).toBe('AA100')
  })

  it('gets flight by id', async () => {
    mockResponse({ id: 1, flightNumber: 'AA100' })
    const result = await flightApi.getById(1)
    expect(result.flightNumber).toBe('AA100')
  })

  it('gets all flights', async () => {
    mockResponse([{ id: 1 }])
    const result = await flightApi.getAll()
    expect(result).toHaveLength(1)
  })

  it('creates flight', async () => {
    mockResponse({ id: 1, flightNumber: 'AA100' })
    const result = await flightApi.create({ flightNumber: 'AA100', aircraftType: '737', airlineId: 1, departureAirportId: 1, arrivalAirportId: 2, departureTime: '2024-01-01T10:00', arrivalTime: '2024-01-01T12:00', totalSeats: 180, baseFare: 200 })
    expect(result.id).toBe(1)
  })

  it('updates flight status', async () => {
    mockResponse({ id: 1, status: 'DELAYED' })
    const result = await flightApi.updateStatus(1, 'DELAYED')
    expect(result.status).toBe('DELAYED')
  })

  it('gets popular destinations', async () => {
    mockResponse([{ destinationName: 'Paris' }])
    const result = await flightApi.getPopularDestinations()
    expect(result[0].destinationName).toBe('Paris')
  })

  it('deletes flight', async () => {
    mockResponse(null)
    await flightApi.delete(1)
    expect(global.fetch).toHaveBeenCalled()
  })
})

describe('Booking API', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates booking', async () => {
    mockResponse({ id: 1, pnr: 'ABC123' })
    const result = await bookingApi.create({ userId: 1, flightId: 1, numberOfPassengers: 1, selectedSeats: ['1A'] })
    expect(result.pnr).toBe('ABC123')
  })

  it('gets booking by PNR', async () => {
    mockResponse({ id: 1, pnr: 'ABC123' })
    const result = await bookingApi.getByPnr('ABC123')
    expect(result.pnr).toBe('ABC123')
  })

  it('gets bookings by user', async () => {
    mockResponse([{ id: 1 }])
    const result = await bookingApi.getByUser(1)
    expect(result).toHaveLength(1)
  })

  it('cancels booking', async () => {
    mockResponse(null)
    await bookingApi.cancel(1)
    expect(global.fetch).toHaveBeenCalled()
  })

  it('checks in booking', async () => {
    mockResponse({ id: 1, checkedIn: true })
    const result = await bookingApi.checkIn(1)
    expect(result.checkedIn).toBe(true)
  })
})

describe('Seat API', () => {
  beforeEach(() => vi.clearAllMocks())

  it('gets seats by flight', async () => {
    mockResponse([{ id: 1, seatNumber: '1A' }])
    const result = await seatApi.getAllByFlight(1)
    expect(result[0].seatNumber).toBe('1A')
  })

  it('holds seat', async () => {
    mockResponse({ id: 1, status: 'HELD' })
    const result = await seatApi.hold(1, '1A', 1)
    expect(result.status).toBe('HELD')
  })

  it('books seat', async () => {
    mockResponse({ id: 1, status: 'BOOKED' })
    const result = await seatApi.book(1, '1A', 1, 1)
    expect(result.status).toBe('BOOKED')
  })

  it('releases seat', async () => {
    mockResponse(null)
    await seatApi.release(1)
    expect(global.fetch).toHaveBeenCalled()
  })
})

describe('Payment API', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates order', async () => {
    mockResponse({ orderId: 'order123', amount: 100 })
    const result = await paymentApi.createOrder({ bookingId: 1, userId: 1, amount: 100, paymentMethod: 'RAZORPAY' }, 'test@test.com', 'Test')
    expect(result.orderId).toBe('order123')
  })

  it('verifies payment', async () => {
    mockResponse({ id: 1, status: 'SUCCESS' })
    const result = await paymentApi.verify({ razorpayOrderId: 'order', razorpayPaymentId: 'pay', razorpaySignature: 'sig' })
    expect(result.status).toBe('SUCCESS')
  })

  it('gets payments by booking', async () => {
    mockResponse([{ id: 1 }])
    const result = await paymentApi.getByBooking(1)
    expect(result).toHaveLength(1)
  })
})

describe('Passenger API', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates passenger', async () => {
    mockResponse({ id: 1, firstName: 'John' })
    const result = await passengerApi.create({ bookingId: 1, firstName: 'John', lastName: 'Doe', passportNumber: 'ABC', dateOfBirth: '1990-01-01', category: 'ADULT', gender: 'MALE', nationality: 'US' })
    expect(result.firstName).toBe('John')
  })

  it('gets passengers by booking', async () => {
    mockResponse([{ id: 1 }])
    const result = await passengerApi.getByBooking(1)
    expect(result).toHaveLength(1)
  })

  it('deletes passenger', async () => {
    mockResponse(null)
    await passengerApi.delete(1)
    expect(global.fetch).toHaveBeenCalled()
  })
})

describe('Admin API', () => {
  beforeEach(() => vi.clearAllMocks())

  it('gets all users', async () => {
    mockResponse([{ id: 1 }])
    const result = await adminApi.getAllUsers()
    expect(result).toHaveLength(1)
  })

  it('sends notification', async () => {
    mockResponse(null)
    await adminApi.sendNotification({ subject: 'Test', message: 'Test', targetAudience: 'ALL', type: 'BOOKING_CONFIRMATION' })
    expect(global.fetch).toHaveBeenCalled()
  })
})

describe('Support API', () => {
  beforeEach(() => vi.clearAllMocks())

  it('submits support request', async () => {
    mockResponse(null)
    await supportApi.submitSupportRequest({ title: 'Help', description: 'Need help', userEmail: 'test@test.com', fullName: 'Test' })
    expect(global.fetch).toHaveBeenCalled()
  })
})

describe('Error Handling', () => {
  beforeEach(() => vi.clearAllMocks())

  it('handles 400 errors', async () => {
    mockError(400)
    await expect(authApi.login({ email: 'test', password: 'test' })).rejects.toThrow()
  })

  it('handles 401 errors', async () => {
    mockError(401)
    await expect(authApi.getAllUsers()).rejects.toThrow()
  })

  it('handles 404 errors', async () => {
    mockError(404)
    await expect(airportApi.getById(999)).rejects.toThrow()
  })

  it('handles 500 errors', async () => {
    mockError(500)
    await expect(flightApi.getAll()).rejects.toThrow()
  })
})

describe('Authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    ;(localStorage.getItem as any).mockReturnValue(null)
  })

  it('includes token when available', async () => {
    ;(localStorage.getItem as any).mockReturnValue('test-token')
    mockResponse({})
    await authApi.getAllUsers()
    const calls = (global.fetch as any).mock.calls
    const lastCall = calls[calls.length - 1]
    expect(lastCall[1].headers).toHaveProperty('Authorization', 'Bearer test-token')
  })

  it('works without token', async () => {
    mockResponse({})
    await authApi.login({ email: 'test', password: 'test' })
    expect(global.fetch).toHaveBeenCalled()
  })
})
