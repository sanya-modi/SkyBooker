import { SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FlightCard } from '../components/flight-card'
import { FlightSearchForm } from '../components/flight-search-form'
import { defaultSearchState, flights } from '../data/flights'
import type { SearchState } from '../types'

function readSearchState(searchParams: URLSearchParams): SearchState {
  return {
    tripType: (searchParams.get('tripType') as SearchState['tripType']) ?? defaultSearchState.tripType,
    from: searchParams.get('from') ?? defaultSearchState.from,
    to: searchParams.get('to') ?? defaultSearchState.to,
    departDate: searchParams.get('departDate') ?? defaultSearchState.departDate,
    returnDate: searchParams.get('returnDate') ?? defaultSearchState.returnDate,
    passengers: Number(searchParams.get('passengers') ?? defaultSearchState.passengers),
    cabinClass: (searchParams.get('cabinClass') as SearchState['cabinClass']) ?? defaultSearchState.cabinClass,
  }
}

export function SearchResultsPage() {
  const [searchParams] = useSearchParams()
  const search = readSearchState(searchParams)
  const [maxPrice, setMaxPrice] = useState(900)
  const [maxStops, setMaxStops] = useState(1)

  const results = useMemo(() => {
    return flights.filter((flight) => {
      const matchesRoute =
        flight.origin.toLowerCase().includes(search.from.toLowerCase()) &&
        flight.destination.toLowerCase().includes(search.to.toLowerCase())
      const matchesDate = flight.dates.includes(search.departDate)
      const matchesCabin = flight.fareOptions.some((fare) => fare.cabinClass === search.cabinClass)
      const matchesPrice = flight.price <= maxPrice
      const matchesStops = flight.stopCount <= maxStops

      return matchesRoute && matchesDate && matchesCabin && matchesPrice && matchesStops
    })
  }, [maxPrice, maxStops, search])

  return (
    <>
      <section className="page-heading">
        <span className="section-label">Search results</span>
        <h1>
          {search.from} to {search.to}
        </h1>
        <p>
          {search.departDate} · {search.passengers} traveler{search.passengers > 1 ? 's' : ''} ·{' '}
          {search.cabinClass}
        </p>
      </section>

      <section className="page-section">
        <FlightSearchForm compact initialValue={search} />
      </section>

      <section className="page-section results-layout">
        <aside className="results-layout__sidebar">
          <div className="detail-section__header">
            <div>
              <span className="section-label">
                <SlidersHorizontal size={14} />
                Filters
              </span>
              <h2 className="section-title">Tune your results</h2>
            </div>
          </div>

          <div className="filters-grid">
            <div className="filter-group">
              <div className="filter-group__title">Max price</div>
              <input
                type="range"
                min="150"
                max="1200"
                step="10"
                value={maxPrice}
                onChange={(event) => setMaxPrice(Number(event.target.value))}
              />
              <div className="range-output">Up to ${maxPrice}</div>
            </div>

            <div className="filter-group">
              <div className="filter-group__title">Stops</div>
              <select
                value={maxStops}
                onChange={(event) => setMaxStops(Number(event.target.value))}
                style={{ marginTop: 12 }}
              >
                <option value={0}>Non-stop only</option>
                <option value={1}>Up to 1 stop</option>
              </select>
            </div>

            <div className="callout">
              Prices and availability are mocked, but the route flow and responsiveness are real.
            </div>
          </div>
        </aside>

        <div className="results-layout__content">
          <div className="summary-row">
            <div>
              <h2 className="section-title" style={{ margin: 0 }}>
                {results.length} matching flights
              </h2>
              <p className="muted-copy">Sorted by best mix of price, timing, and comfort.</p>
            </div>
            <div className="tag">From ${Math.min(...results.map((flight) => flight.price), 0)}</div>
          </div>

          <div className="result-stack" style={{ marginTop: 18 }}>
            {results.length > 0 ? (
              results.map((flight) => (
                <FlightCard key={flight.id} flight={flight} search={search} />
              ))
            ) : (
              <div className="bookings-empty">
                <h3>No matching flights</h3>
                <p className="muted-copy">
                  Try widening the price cap or choosing a route/date from the featured examples.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
