import { renderHook, act } from '@testing-library/react'
import { BookingFlowProvider, useBookingFlow } from '../../src/context/booking-flow-context'

const mockAirport = { id: 1, name: 'JFK', iataCode: 'JFK', city: 'NY', country: 'USA', description: '', phoneNumber: '', email: '', isActive: true, createdAt: '', updatedAt: '' }
const mockFlight = { id: 1, flightNumber: 'AA100', aircraftType: '737', airlineId: 1, departureAirportId: 1, arrivalAirportId: 2, departureTime: '', arrivalTime: '', totalSeats: 180, availableSeats: 150, baseFare: 200, status: 'SCHEDULED', stopCount: 0, stopsLabel: 'Direct' }

describe('BookingFlowContext', () => {
  beforeEach(() => sessionStorage.clear())

  it('provides initial state', () => {
    const { result } = renderHook(() => useBookingFlow(), { wrapper: BookingFlowProvider })
    expect(result.current.searchCriteria).toBeNull()
    expect(result.current.selectedFlight).toBeNull()
  })

  it('sets search criteria', () => {
    const { result } = renderHook(() => useBookingFlow(), { wrapper: BookingFlowProvider })
    
    act(() => {
      result.current.setSearchCriteria({ tripType: 'oneway', fromAirport: mockAirport, toAirport: mockAirport, departureDate: '2024-01-01', returnDate: '', passengers: 1, directOnly: true })
    })

    expect(result.current.searchCriteria?.tripType).toBe('oneway')
  })

  it('sets selected flight', () => {
    const { result } = renderHook(() => useBookingFlow(), { wrapper: BookingFlowProvider })
    
    act(() => {
      result.current.setSelectedFlight(mockFlight)
    })

    expect(result.current.selectedFlight?.flightNumber).toBe('AA100')
  })

  it('sets seat class', () => {
    const { result } = renderHook(() => useBookingFlow(), { wrapper: BookingFlowProvider })
    
    act(() => {
      result.current.setPreferredSeatClass('BUSINESS')
    })

    expect(result.current.preferredSeatClass).toBe('BUSINESS')
  })

  it('sets selected seats', () => {
    const { result } = renderHook(() => useBookingFlow(), { wrapper: BookingFlowProvider })
    
    act(() => {
      result.current.setSelectedSeatIds(['1A', '1B'])
    })

    expect(result.current.selectedSeatIds).toEqual(['1A', '1B'])
  })

  it('updates passenger', () => {
    const { result } = renderHook(() => useBookingFlow(), { wrapper: BookingFlowProvider })
    
    act(() => {
      result.current.updatePassenger({ firstName: 'John', lastName: 'Doe', dateOfBirth: '1990-01-01', category: 'ADULT', gender: 'MALE', passportNumber: 'ABC', email: 'test@test.com', phoneNumber: '123' })
    })

    expect(result.current.passenger.firstName).toBe('John')
  })

  it('resets flow', () => {
    const { result } = renderHook(() => useBookingFlow(), { wrapper: BookingFlowProvider })
    
    act(() => {
      result.current.setSearchCriteria({ tripType: 'oneway', fromAirport: mockAirport, toAirport: mockAirport, departureDate: '2024-01-01', returnDate: '', passengers: 1, directOnly: true })
      result.current.resetFlow()
    })

    expect(result.current.searchCriteria).toBeNull()
  })

  it('persists to sessionStorage', () => {
    const { result } = renderHook(() => useBookingFlow(), { wrapper: BookingFlowProvider })
    
    act(() => {
      result.current.setSearchCriteria({ tripType: 'oneway', fromAirport: mockAirport, toAirport: mockAirport, departureDate: '2024-01-01', returnDate: '', passengers: 1, directOnly: true })
    })

    const stored = sessionStorage.getItem('skybooker.booking-flow')
    expect(stored).toBeTruthy()
  })

  it('restores from sessionStorage', () => {
    sessionStorage.setItem('skybooker.booking-flow', JSON.stringify({ searchCriteria: { tripType: 'oneway' }, selectedFlight: null, preferredSeatClass: null, selectedSeatIds: [], passengers: [], confirmedBooking: null }))
    
    const { result } = renderHook(() => useBookingFlow(), { wrapper: BookingFlowProvider })
    expect(result.current.searchCriteria?.tripType).toBe('oneway')
  })

  it('throws error outside provider', () => {
    expect(() => renderHook(() => useBookingFlow())).toThrow()
  })
})
