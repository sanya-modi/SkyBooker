import { Compass, Globe2, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { FlightSearchForm } from '../components/flight-search-form'

const deals = [
  { route: 'Delhi to Dubai', price: '$219', note: 'Best overall this week' },
  { route: 'Mumbai to Singapore', price: '$182', note: 'Budget-friendly red-eye fares' },
  { route: 'Bengaluru to London', price: '$574', note: 'Strong premium cabin value' },
]

const destinations = [
  { city: 'Dubai', detail: 'City breaks, shopping, beach escapes' },
  { city: 'Singapore', detail: 'Family-friendly stopovers and food trails' },
  { city: 'London', detail: 'Flexible business and long-haul itineraries' },
]

const roleCards = [
  {
    title: 'Passenger',
    detail: 'Profile view, loyalty summary, and direct access to confirmed trips.',
    to: '/passenger',
  },
  {
    title: 'Airline staff',
    detail: 'Operational dashboard for check-in, departures, and live gate workflows.',
    to: '/staff',
  },
  {
    title: 'Admin',
    detail: 'Platform analytics, user oversight, and system management entry points.',
    to: '/admin',
  },
]

export function HomePages() {
  return (
    <>
      <section className="hero">
        <div className="hero__panel">
          <div className="hero__eyebrow">
            <Sparkles size={16} />
            Search, compare, and book smarter
          </div>
          <h1>Flight booking built like a modern travel metasearch app.</h1>
          <p>
            SkyBooker gives you a Skyscanner-style journey: fast search, side-by-side fares,
            cleaner checkout, and responsive booking management.
          </p>

          <FlightSearchForm />
        </div>

        <div className="hero__visual">
          <div className="visual-card">
            <div className="section-label">Trending route</div>
            <div className="visual-route" style={{ marginTop: 16 }}>
              <div>
                <strong>DEL</strong>
                <span>New Delhi</span>
              </div>
              <div>
                <strong>DXB</strong>
                <span>Dubai</span>
              </div>
            </div>
            <p style={{ marginTop: 14 }}>
              Live-style fare cards, flexible cabin filters, and a checkout flow that stays
              readable on mobile.
            </p>
          </div>

          <div className="visual-card">
            <div className="summary-row">
              <div>
                <div className="subdued">Average savings</div>
                <strong style={{ fontSize: '2rem' }}>18%</strong>
              </div>
              <div>
                <div className="subdued">Booked this week</div>
                <strong style={{ fontSize: '2rem' }}>1.2k</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="metrics-strip">
        <article className="surface-card metric-card">
          <Compass size={22} />
          <strong>200+ routes</strong>
          <span className="subdued">Mock search coverage for common international travel lanes.</span>
        </article>
        <article className="surface-card metric-card">
          <Globe2 size={22} />
          <strong>Multi-cabin search</strong>
          <span className="subdued">Economy, premium economy, and business fares in one flow.</span>
        </article>
        <article className="surface-card metric-card">
          <ShieldCheck size={22} />
          <strong>Cleaner checkout</strong>
          <span className="subdued">Fare breakdown and traveler details kept visible at every step.</span>
        </article>
        <article className="surface-card metric-card">
          <Sparkles size={22} />
          <strong>Responsive UI</strong>
          <span className="subdued">Purpose-built mobile navigation and stacked booking cards.</span>
        </article>
      </section>

      <section className="page-section section-grid">
        <article className="surface-card">
          <span className="section-label">Popular deals</span>
          <h2 className="section-title">Quick-start routes users actually want to compare.</h2>
          <div className="deals-grid">
            {deals.map((deal) => (
              <article className="deal-card" key={deal.route}>
                <div className="subdued">{deal.note}</div>
                <h3>{deal.route}</h3>
                <div className="price-text">{deal.price}</div>
              </article>
            ))}
          </div>
        </article>

        <article className="surface-card">
          <span className="section-label">Why this redesign works</span>
          <h2 className="section-title">The broken app is now structured around an actual booking funnel.</h2>
          <ul className="detail-list">
            <li>
              <span>Home</span>
              <span className="accent-text">Hero search + featured deals</span>
            </li>
            <li>
              <span>Results</span>
              <span className="accent-text">Filterable cards with route context</span>
            </li>
            <li>
              <span>Flight detail</span>
              <span className="accent-text">Fare families and amenity breakdown</span>
            </li>
            <li>
              <span>Checkout</span>
              <span className="accent-text">Traveler data and booking summary</span>
            </li>
          </ul>
        </article>
      </section>

      <section className="page-section">
        <article className="surface-card">
          <span className="section-label">Explore by destination</span>
          <h2 className="section-title">Designed to feel travel-first instead of looking like a starter template.</h2>
          <div className="destinations-grid">
            {destinations.map((destination) => (
              <article className="destination-card" key={destination.city}>
                <h3>{destination.city}</h3>
                <p>{destination.detail}</p>
              </article>
            ))}
          </div>
        </article>
      </section>

      <section className="page-section">
        <article className="surface-card">
          <span className="section-label">User roles</span>
          <h2 className="section-title">Passenger, airline staff, and admin now have dedicated routes.</h2>
          <div className="deals-grid">
            {roleCards.map((role) => (
              <article className="deal-card" key={role.title}>
                <h3>{role.title}</h3>
                <p className="muted-copy">{role.detail}</p>
                <Link className="chip-button" style={{ marginTop: 14, width: 'fit-content' }} to={role.to}>
                  Open {role.title}
                </Link>
              </article>
            ))}
          </div>
        </article>
      </section>
    </>
  )
}
