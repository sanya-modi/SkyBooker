import { Award, Mail, Phone, Shield, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useBookingContext } from '../context/booking-context'

export function PassengerPage() {
  const { bookings } = useBookingContext()
  const latestBooking = bookings[0]

  return (
    <>
      <section className="page-heading">
        <span className="section-label">Passenger profile</span>
        <h1>Your traveler account and trip preferences</h1>
        <p>
          Passenger-facing space for loyalty, contact details, passport reminders, and
          quick access to booked trips.
        </p>
      </section>

      <section className="page-section section-grid">
        <article className="surface-card passenger-card passenger-card--hero">
          <div className="booking-row">
            <div>
              <span className="section-label">SkyBooker Elite</span>
              <h2 className="section-title">Aarav Sharma</h2>
              <p className="muted-copy">Member since 2023 · Gold traveler tier</p>
            </div>
            <Award size={34} />
          </div>
          <div className="metrics-strip passenger-metrics">
            <article className="deal-card">
              <div className="subdued">Miles balance</div>
              <div className="price-text">128,450</div>
            </article>
            <article className="deal-card">
              <div className="subdued">Upcoming trips</div>
              <div className="price-text">{bookings.length}</div>
            </article>
          </div>
        </article>

        <article className="surface-card">
          <span className="section-label">Personal details</span>
          <h2 className="section-title">Traveler identity</h2>
          <ul className="support-list">
            <li>
              <span>
                <UserRound size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Full name
              </span>
              <span>Aarav Sharma</span>
            </li>
            <li>
              <span>
                <Mail size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Email
              </span>
              <span>aarav@example.com</span>
            </li>
            <li>
              <span>
                <Phone size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Phone
              </span>
              <span>+91 98765 43210</span>
            </li>
            <li>
              <span>
                <Shield size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                Passport
              </span>
              <span>Valid through Nov 2030</span>
            </li>
          </ul>
        </article>
      </section>

      <section className="page-section section-grid">
        <article className="surface-card">
          <span className="section-label">Latest booking</span>
          <h2 className="section-title">Quick trip snapshot</h2>
          {latestBooking ? (
            <ul className="support-list">
              <li>
                <span>Reservation</span>
                <span>{latestBooking.reservationCode}</span>
              </li>
              <li>
                <span>Travel date</span>
                <span>{latestBooking.departDate}</span>
              </li>
              <li>
                <span>Status</span>
                <span>{latestBooking.status}</span>
              </li>
              <li>
                <span>Total</span>
                <span>${latestBooking.totalPrice}</span>
              </li>
            </ul>
          ) : (
            <div className="bookings-empty" style={{ padding: '12px 0 0', textAlign: 'left' }}>
              <p className="muted-copy">No trip booked yet. Your next reservation will appear here.</p>
            </div>
          )}
        </article>

        <article className="surface-card">
          <span className="section-label">Passenger actions</span>
          <h2 className="section-title">Useful next steps</h2>
          <div className="booking-stack">
            <Link className="primary-button" to="/bookings">
              View all bookings
            </Link>
            <Link className="ghost-button" to="/">
              Search another flight
            </Link>
            <Link className="ghost-button" to="/support">
              Contact support
            </Link>
          </div>
        </article>
      </section>
    </>
  )
}
