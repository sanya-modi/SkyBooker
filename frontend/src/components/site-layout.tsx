import { Headphones, PlaneTakeoff, Search, Ticket } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Search', icon: Search },
  { to: '/flights', label: 'Flights', icon: PlaneTakeoff },
  { to: '/bookings', label: 'Bookings', icon: Ticket },
  { to: '/support', label: 'Support', icon: Headphones },
]

const roleItems = [
  { to: '/passenger', label: 'Passenger' },
  { to: '/staff', label: 'Airline staff' },
  { to: '/admin', label: 'Admin' },
]

export function SiteLayout() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="site-header__inner">
          <NavLink className="brand" to="/">
            <span className="brand__mark">
              <PlaneTakeoff size={20} />
            </span>
            <span>
              <span className="brand__eyebrow">Flight booking system</span>
              SkyBooker
            </span>
          </NavLink>

          <nav className="nav-links" aria-label="Primary">
            {navItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => (isActive ? 'active' : '')}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="header-actions">
            {roleItems.map(({ to, label }) => (
              <NavLink key={to} className="ghost-button" to={to}>
                {label}
              </NavLink>
            ))}
            <NavLink className="ghost-button" to="/bookings">
              Manage trips
            </NavLink>
            <NavLink className="primary-button" to="/">
              Search flights
            </NavLink>
          </div>
        </div>
      </header>

      <main className="page-main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="footer-inner">
          <p>SkyBooker demo UI inspired by modern metasearch booking flows.</p>
          <p>Responsive React app built for search, compare, and checkout.</p>
        </div>
      </footer>

      <nav className="mobile-nav" aria-label="Mobile">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
