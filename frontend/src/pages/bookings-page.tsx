import { Clock3, TicketCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useBookingContext } from '../context/booking-context'
import { findFlightById } from '../data/flights'

export function BookingsPage() {
  const { bookings } = useBookingContext()

  return (
    <>
      <section className="page-heading">
        <span className="section-label">Manage bookings</span>
        <h1>Your saved trips</h1>
        <p>All confirmed reservations live here with fare, route, and traveler context.</p>
      </section>

      <section className="page-section bookings-layout">
        <div className="detail-section">
          {bookings.length > 0 ? (
            <div className="booking-stack">
              {bookings.map((booking) => {
                const flight = findFlightById(booking.flightId)
                const fare = flight?.fareOptions.find((item) => item.id === booking.fareId)

                return (
                  <article className="flight-card" key={booking.id}>
                    <div className="booking-row">
                      <div>
                        <span className="status-chip">
                          <TicketCheck size={16} />
                          {booking.status}
                        </span>
                        <h3>
                          {flight?.originCode} to {flight?.destinationCode}
                        </h3>
                        <p className="muted-copy">
                          {booking.travelerName} · {booking.email}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="price-text">${booking.totalPrice}</div>
                        <div className="subdued">{fare?.name}</div>
                      </div>
                    </div>

                    <ul className="detail-list">
                      <li>
                        <span>Reservation code</span>
                        <span>{booking.reservationCode}</span>
                      </li>
                      <li>
                        <span>Flight</span>
                        <span>
                          {flight?.airline} {flight?.id}
                        </span>
                      </li>
                      <li>
                        <span>Departure date</span>
                        <span>{booking.departDate}</span>
                      </li>
                      <li>
                        <span>Booked</span>
                        <span>{new Date(booking.bookedAt).toLocaleString()}</span>
                      </li>
                    </ul>
                  </article>
                )
              })}
            </div>
          ) : (
            <div className="bookings-empty">
              <h2>No bookings yet</h2>
              <p className="muted-copy">
                Search for a route, choose a fare, and your confirmed trip will appear here.
              </p>
              <Link className="primary-button" to="/">
                Start a search
              </Link>
            </div>
          )}
        </div>

        <aside className="booking-summary">
          <div className="summary-stack">
            <div>
              <span className="booking-summary__label">Booking tips</span>
              <div className="booking-summary__value">Travel ready</div>
            </div>
            <div className="summary-row">
              <span>
                <Clock3 size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Check-in
              </span>
              <span>24 hours before departure</span>
            </div>
            <div className="summary-row">
              <span>Support</span>
              <Link className="accent-text" to="/support">
                Contact service
              </Link>
            </div>
            <div className="callout">
              Bookings persist in local storage, so the demo still feels like a working app after refresh.
            </div>
          </div>
        </aside>
      </section>
    </>
  )
}
