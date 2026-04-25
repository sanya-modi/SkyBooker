import { useEffect, useRef, useState } from 'react'
import { useAirportSearch } from '../../hooks/use-airport-search'
import type { Airport } from '../../services/api'

interface AirportAutocompleteProps {
  icon: React.ReactNode
  placeholder: string
  selectedAirport: Airport | null
  onSelect: (airport: Airport | null) => void
}

export function AirportAutocomplete({
  icon,
  placeholder,
  selectedAirport,
  onSelect,
}: AirportAutocompleteProps) {
  const [query, setQuery] = useState(
    selectedAirport ? `${selectedAirport.city} (${selectedAirport.iataCode})` : '',
  )
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const { results, loading } = useAirportSearch(query)

  useEffect(() => {
    if (selectedAirport) {
      setQuery(`${selectedAirport.city} (${selectedAirport.iataCode})`)
    }
  }, [selectedAirport])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="landing-input airport-search-wrapper" ref={wrapRef}>
      {icon}
      <input
        autoComplete="off"
        onChange={(event) => {
          const value = event.target.value
          setQuery(value)
          setOpen(value.trim().length >= 2)
          if (!value.trim()) onSelect(null)
        }}
        onFocus={() => setOpen(query.trim().length >= 2)}
        placeholder={placeholder}
        type="text"
        value={query}
      />
      {open ? (
        <div className="airport-dropdown">
          {loading ? <div className="airport-option"><span>Loading airports...</span></div> : null}
          {!loading && results.length === 0 ? (
            <div className="airport-option"><span>No airports found</span></div>
          ) : null}
          {!loading
            ? results.map((airport) => (
                <button
                  className="airport-option"
                  key={airport.id}
                  onClick={() => {
                    onSelect(airport)
                    setQuery(`${airport.city} (${airport.iataCode})`)
                    setOpen(false)
                  }}
                  type="button"
                >
                  <strong>
                    {airport.city} ({airport.iataCode})
                  </strong>
                  <span>
                    {airport.name}, {airport.country}
                  </span>
                </button>
              ))
            : null}
        </div>
      ) : null}
    </div>
  )
}
