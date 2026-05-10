import { renderHook, waitFor } from '@testing-library/react'
import { useAirportSearch } from '../../src/hooks/use-airport-search'
import * as api from '../../src/services/api'

vi.mock('../../src/services/api', () => ({
  airportApi: { searchByCity: vi.fn() }
}))

const mockAirports = [{ id: 1, name: 'JFK', iataCode: 'JFK', city: 'New York', country: 'USA', description: '', phoneNumber: '', email: '', isActive: true, createdAt: '', updatedAt: '' }]

describe('useAirportSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns empty initially', () => {
    const { result } = renderHook(() => useAirportSearch(''))
    expect(result.current.results).toEqual([])
    expect(result.current.loading).toBe(false)
  })

  it('does not search short queries', () => {
    renderHook(() => useAirportSearch('N'))
    vi.advanceTimersByTime(300)
    expect(api.airportApi.searchByCity).not.toHaveBeenCalled()
  })

  it('searches after debounce', async () => {
    vi.mocked(api.airportApi.searchByCity).mockResolvedValue(mockAirports)
    const { result } = renderHook(() => useAirportSearch('New York'))
    
    vi.advanceTimersByTime(250)
    
    await waitFor(() => {
      expect(result.current.results).toEqual(mockAirports)
    })
  })

  it('handles errors', async () => {
    vi.mocked(api.airportApi.searchByCity).mockRejectedValue(new Error('API Error'))
    const { result } = renderHook(() => useAirportSearch('New York'))
    
    vi.advanceTimersByTime(250)
    
    await waitFor(() => {
      expect(result.current.results).toEqual([])
      expect(result.current.loading).toBe(false)
    })
  })

  it('clears results on short query', async () => {
    vi.mocked(api.airportApi.searchByCity).mockResolvedValue(mockAirports)
    const { result, rerender } = renderHook(({ term }) => useAirportSearch(term), { initialProps: { term: 'New York' } })
    
    vi.advanceTimersByTime(250)
    await waitFor(() => expect(result.current.results).toEqual(mockAirports))
    
    rerender({ term: 'N' })
    expect(result.current.results).toEqual([])
  })

  it('trims search term', async () => {
    vi.mocked(api.airportApi.searchByCity).mockResolvedValue(mockAirports)
    renderHook(() => useAirportSearch('  New York  '))
    
    vi.advanceTimersByTime(250)
    
    await waitFor(() => {
      expect(api.airportApi.searchByCity).toHaveBeenCalledWith('New York')
    })
  })

  it('handles empty results', async () => {
    vi.mocked(api.airportApi.searchByCity).mockResolvedValue([])
    const { result } = renderHook(() => useAirportSearch('Unknown'))
    
    vi.advanceTimersByTime(250)
    
    await waitFor(() => {
      expect(result.current.results).toEqual([])
    })
  })

  it('handles whitespace', () => {
    const { result } = renderHook(() => useAirportSearch('   '))
    vi.advanceTimersByTime(250)
    expect(result.current.results).toEqual([])
  })
})
