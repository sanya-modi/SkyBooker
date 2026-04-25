import { useEffect, useState } from 'react'
import { airportApi, type Airport } from '../services/api'

export function useAirportSearch(searchTerm: string) {
  const [results, setResults] = useState<Airport[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const query = searchTerm.trim()
    if (query.length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    const timeoutId = window.setTimeout(async () => {
      setLoading(true)
      try {
        console.log('Searching airports for:', query)
        const airports = await airportApi.searchByCity(query)
        console.log('Found airports:', airports)
        setResults(airports)
      } catch (error) {
        console.error('Airport search error:', error)
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 250)

    return () => window.clearTimeout(timeoutId)
  }, [searchTerm])

  return { results, loading }
}
