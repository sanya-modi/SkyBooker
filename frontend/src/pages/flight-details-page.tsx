import { Check, MoveRight } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { findFlightById } from '../data/flights'

export function FlightDetailsPage() {
  const { flightId = '' } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const flight = findFlightById(flightId)
  const departDate = searchParams.get('departDate') ?? '2026-05-18'
  const passengers = Number(searchParams.get('passengers') ?? '1')
  const requestedCabin = searchParams.get('cabinClass') ?? 'Economy'

  const matchingFare = useMemo(() => {
    if (!flight) {
      return undefined
    }

    return (
      flight.fareOptions.find((fare) => fare.cabinClass === requestedCabin) ??
      flight.fareOptions[0]
    )
  }, [flight, requestedCabin])

  const [selectedFareId, setSelectedFareId] = useState(matchingFare?.id ?? '')

  if (!flight) {
    return (
      <section className="page-heading">
        <h1>Flight not found</h1>
        <p>The deal may have expired or the route link is incomplete.</p>
        <Link className="primary-button" to="/flights">
          Back to results
        </Link>
      </section>
    )
  }

  const selectedFare =
    flight.fareOptions.find((fare) => fare.id === selectedFareId) ?? flight.fareOptions[0]
  const total = selectedFare.price * passengers

  function continueToCheckout() {
    const params = new URLSearchParams({
      flightId: flight.id,
      fareId: selectedFare.id,
      departDate,
      passengers: String(passengers),
    })

    navigate(`/checkout?${params.toString()}`)
  }

  return (
    <>
      <section className="page-heading">
        <span className="section-label">Flight detail</span>
        <h1>
          {flight.originCode} to {flight.destinationCode} with {flight.airline}
        </h1>
        <p>
          {departDate} · {flight.duration} · {flight.stops}
        </p>
      </section>

      <section className="page-section details-layout">
        <div className="fare-stack">
          <article className="detail-section">
            <div className="detail-section__header">
              <div>
                <h2 className="section-title" style={{ marginTop: 0 }}>
                  Outbound flight
                </h2>
                <p className="muted-copy">Clear trip timing, baggage expectations, and fare families.</p>
              </div>
              <div className="tag">{flight.badge}</div>
            </div>

            <div className="flight-times" style={{ marginTop: 24 }}>
              <div>
                <strong>{flight.departureTime}</strong>
                <div>{flight.origin}</div>
                <div className="subdued">{flight.originCode}</div>
              </div>
              <div>
                <div className="flight-line" />
                <div className="subdued" style={{ marginTop: 8 }}>
                  {flight.duration} · {flight.stops}
                </div>
              </div>
              <div>
                <strong>{flight.arrivalTime}</strong>
                <div>{flight.destination}</div>
                <div className="subdued">{flight.destinationCode}</div>
              </div>
            </div>

            <ul className="detail-list">
              {flight.amenities.map((item) => (
                <li key={item}>
                  <span>{item}</span>
                  <span className="accent-text">Included</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="detail-section">
            <h2 className="section-title" style={{ marginTop: 0 }}>
              Choose a fare
            </h2>
            <div className="fare-stack">
              {flight.fareOptions.map((fare) => (
                <button
                  key={fare.id}
                  type="button"
                  className={`fare-card ${selectedFare.id === fare.id ? 'fare-card--selected' : ''}`}
                  onClick={() => setSelectedFareId(fare.id)}
                >
                  <div className="fare-card__header">
                    <div>
                      <h3 style={{ marginTop: 0 }}>{fare.name}</h3>
                      <p className="muted-copy">{fare.cabinClass}</p>
                    </div>
                    <div className="price-text">${fare.price}</div>
                  </div>
                  <ul className="detail-list">
                    <li>
                      <span>Carry-on</span>
                      <span>{fare.carryOn}</span>
                    </li>
                    <li>
                      <span>Checked bag</span>
                      <span>{fare.checkedBag}</span>
                    </li>
                    <li>
                      <span>Changes</span>
                      <span>{fare.changePolicy}</span>
                    </li>
                    <li>
                      <span>Refundable</span>
                      <span>{fare.refundable ? 'Yes' : 'No'}</span>
                    </li>
                  </ul>
                </button>
              ))}
            </div>
          </article>
        </div>

        <aside className="booking-summary">
          <div className="summary-stack">
            <div>
              <span className="booking-summary__label">Selected fare</span>
              <div className="booking-summary__value">{selectedFare.name}</div>
              <div className="muted-copy">{selectedFare.cabinClass}</div>
            </div>
            <div className="summary-row">
              <span>Flight</span>
              <span>
                {flight.originCode} <MoveRight size={16} style={{ verticalAlign: 'middle' }} />{' '}
                {flight.destinationCode}
              </span>
            </div>
            <div className="summary-row">
              <span>Date</span>
              <span>{departDate}</span>
            </div>
            <div className="summary-row">
              <span>Travelers</span>
              <span>{passengers}</span>
            </div>
            <div className="summary-row">
              <span>Total</span>
              <span className="price-text">${total}</span>
            </div>

            <div className="callout">
              <Check size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Good value compared with other fares on this route.
            </div>

            <button className="primary-button" type="button" onClick={continueToCheckout}>
              Continue to checkout
            </button>
          </div>
        </aside>
      </section>
    </>
  )
}
