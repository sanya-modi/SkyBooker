import { Leaf, MoveRight, Star } from 'lucide-react'
import { Link, createSearchParams } from 'react-router-dom'
import type { Flight, SearchState } from '../types'

interface FlightCardProps {
  flight: Flight
  search: SearchState
}

export function FlightCard({ flight, search }: FlightCardProps) {
  const query = createSearchParams({
    departDate: search.departDate,
    passengers: String(search.passengers),
    cabinClass: search.cabinClass,
  })

  return (
    <article className="flight-card">
      <div className="flight-card__top">
        <div>
          <span className="airline-chip">
            {flight.airline}
            <span className="subdued">{flight.airlineCode}</span>
          </span>
          <h3>{flight.badge}</h3>
          <p className="muted-copy">
            Rated {flight.rating}/5 with strong reliability and baggage clarity.
          </p>
        </div>
        <div>
          <div className="tag">
            <Leaf size={16} />
            {flight.sustainabilityScore}% lower emissions estimate
          </div>
        </div>
      </div>

      <div className="flight-card__bottom">
        <div className="flight-times">
          <div>
            <strong>{flight.departureTime}</strong>
            <div>{flight.originCode}</div>
            <div className="subdued">{flight.origin}</div>
          </div>

          <div>
            <div className="flight-line" />
            <div className="subdued" style={{ marginTop: 8 }}>
              {flight.duration} · {flight.stops}
            </div>
          </div>

          <div>
            <strong>{flight.arrivalTime}</strong>
            <div>{flight.destinationCode}</div>
            <div className="subdued">{flight.destination}</div>
          </div>
        </div>

        <div>
          <div className="tag">
            <Star size={16} />
            {flight.rating}
          </div>
        </div>
      </div>

      <div className="summary-row" style={{ marginTop: 20 }}>
        <div className="muted-copy">
          Includes {flight.amenities.slice(0, 2).join(' and ')}.
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="price-text">${flight.price}</div>
          <div className="subdued">per traveler</div>
        </div>
      </div>

      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
        <div className="muted-copy">Next available on {search.departDate}</div>
        <Link
          className="primary-button"
          to={`/flights/${flight.id}?${query.toString()}`}
        >
          View deal <MoveRight size={16} style={{ marginLeft: 8, verticalAlign: 'middle' }} />
        </Link>
      </div>
    </article>
  )
}
