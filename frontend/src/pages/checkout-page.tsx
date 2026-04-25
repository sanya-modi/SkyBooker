import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useBookingContext } from '../context/booking-context'
import { findFlightById } from '../data/flights'

export function CheckoutPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { createBooking } = useBookingContext()
  const flightId = searchParams.get('flightId') ?? ''
  const fareId = searchParams.get('fareId') ?? ''
  const passengers = Number(searchParams.get('passengers') ?? '1')
  const departDate = searchParams.get('departDate') ?? '2026-05-18'

  const flight = findFlightById(flightId)
  const fare = flight?.fareOptions.find((item) => item.id === fareId) ?? flight?.fareOptions[0]
  const total = useMemo(() => (fare ? fare.price * passengers : 0), [fare, passengers])

  const [travelerName, setTravelerName] = useState('Aarav Sharma')
  const [email, setEmail] = useState('aarav@example.com')
  const [phone, setPhone] = useState('+91 98765 43210')

  if (!flight || !fare) {
    return (
      <section className="page-heading">
        <h1>Checkout unavailable</h1>
        <p>Pick a flight and fare first so we can build the booking summary.</p>
      </section>
    )
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    createBooking({
      travelerName,
      email,
      flightId: flight.id,
      fareId: fare.id,
      totalPrice: total,
      departDate,
    })
    navigate('/bookings')
  }

  return (
    <>
      <section className="page-heading">
        <span className="section-label">Checkout</span>
        <h1>Complete your trip</h1>
        <p>Traveler details, contact info, and fare summary all in one place.</p>
      </section>

      <section className="page-section checkout-grid">
        <form className="detail-section" onSubmit={handleSubmit}>
          <h2 className="section-title" style={{ marginTop: 0 }}>
            Traveler information
          </h2>
          <div className="search-form__row" style={{ marginTop: 18 }}>
            <div className="field">
              <label htmlFor="travelerName">Full name</label>
              <input
                id="travelerName"
                value={travelerName}
                onChange={(event) => setTravelerName(event.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="phone">Phone</label>
              <input id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="passport">Passport no.</label>
              <input id="passport" placeholder="A1234567" />
            </div>
          </div>

          <div className="detail-section" style={{ marginTop: 22, padding: 20 }}>
            <h3 style={{ marginTop: 0 }}>Billing snapshot</h3>
            <ul className="detail-list">
              <li>
                <span>Base fare</span>
                <span>${fare.price * passengers}</span>
              </li>
              <li>
                <span>Service fee</span>
                <span>$0</span>
              </li>
              <li>
                <span>Payment type</span>
                <span>Pay now</span>
              </li>
            </ul>
          </div>

          <button className="primary-button" style={{ marginTop: 22 }} type="submit">
            Confirm booking
          </button>
        </form>

        <aside className="booking-summary">
          <div className="summary-stack">
            <div>
              <span className="booking-summary__label">Itinerary</span>
              <div className="booking-summary__value">
                {flight.originCode} to {flight.destinationCode}
              </div>
              <div className="muted-copy">
                {flight.airline} · {departDate}
              </div>
            </div>
            <div className="summary-row">
              <span>Fare</span>
              <span>{fare.name}</span>
            </div>
            <div className="summary-row">
              <span>Cabin</span>
              <span>{fare.cabinClass}</span>
            </div>
            <div className="summary-row">
              <span>Travelers</span>
              <span>{passengers}</span>
            </div>
            <div className="summary-row">
              <span>Baggage</span>
              <span>{fare.checkedBag}</span>
            </div>
            <div className="summary-row">
              <span>Total</span>
              <span className="price-text">${total}</span>
            </div>
          </div>
        </aside>
      </section>
    </>
  )
}
