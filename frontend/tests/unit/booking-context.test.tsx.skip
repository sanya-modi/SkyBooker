import { renderHook, act } from '@testing-library/react'
import { BookingProvider, useBookingContext } from '../../src/context/booking-context'

describe('BookingContext', () => {
  beforeEach(() => localStorage.clear())

  it('provides initial state', () => {
    const { result } = renderHook(() => useBookingContext(), { wrapper: BookingProvider })
    expect(result.current.bookings).toEqual([])
  })

  it('creates booking', () => {
    const { result } = renderHook(() => useBookingContext(), { wrapper: BookingProvider })
    
    act(() => {
      result.current.createBooking({ travelerName: 'John', email: 'test@test.com', flightId: '1', fareId: '1', totalPrice: 100, departDate: '2024-01-01' })
    })

    expect(result.current.bookings).toHaveLength(1)
    expect(result.current.bookings[0].travelerName).toBe('John')
  })

  it('creates multiple bookings', () => {
    const { result } = renderHook(() => useBookingContext(), { wrapper: BookingProvider })
    
    act(() => {
      result.current.createBooking({ travelerName: 'John', email: 'john@test.com', flightId: '1', fareId: '1', totalPrice: 100, departDate: '2024-01-01' })
      result.current.createBooking({ travelerName: 'Jane', email: 'jane@test.com', flightId: '2', fareId: '2', totalPrice: 200, departDate: '2024-01-02' })
    })

    expect(result.current.bookings).toHaveLength(2)
  })

  it('updates search draft', () => {
    const { result } = renderHook(() => useBookingContext(), { wrapper: BookingProvider })
    
    act(() => {
      result.current.updateSearchDraft({ from: 'JFK', to: 'LAX' } as any)
    })

    expect(result.current.searchDraft.from).toBe('JFK')
  })

  it('persists to localStorage', () => {
    const { result } = renderHook(() => useBookingContext(), { wrapper: BookingProvider })
    
    act(() => {
      result.current.createBooking({ travelerName: 'John', email: 'test@test.com', flightId: '1', fareId: '1', totalPrice: 100, departDate: '2024-01-01' })
    })

    const stored = localStorage.getItem('skybooker.bookings')
    expect(stored).toBeTruthy()
  })

  it('restores from localStorage', () => {
    localStorage.setItem('skybooker.bookings', JSON.stringify([{ id: '1', travelerName: 'John' }]))
    
    const { result } = renderHook(() => useBookingContext(), { wrapper: BookingProvider })
    expect(result.current.bookings).toHaveLength(1)
  })

  it('generates unique IDs', () => {
    const { result } = renderHook(() => useBookingContext(), { wrapper: BookingProvider })
    
    let booking1: any, booking2: any
    act(() => {
      booking1 = result.current.createBooking({ travelerName: 'John', email: 'test@test.com', flightId: '1', fareId: '1', totalPrice: 100, departDate: '2024-01-01' })
      booking2 = result.current.createBooking({ travelerName: 'Jane', email: 'test@test.com', flightId: '2', fareId: '2', totalPrice: 200, departDate: '2024-01-02' })
    })

    expect(booking1.id).not.toBe(booking2.id)
  })

  it('generates reservation codes', () => {
    const { result } = renderHook(() => useBookingContext(), { wrapper: BookingProvider })
    
    let booking: any
    act(() => {
      booking = result.current.createBooking({ travelerName: 'John', email: 'test@test.com', flightId: '1', fareId: '1', totalPrice: 100, departDate: '2024-01-01' })
    })

    expect(booking.reservationCode).toMatch(/^SB\d{6}$/)
  })

  it('throws error outside provider', () => {
    expect(() => renderHook(() => useBookingContext())).toThrow()
  })
})
