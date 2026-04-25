import {
  ClipboardCheck,
  Clock3,
  Plane,
  Search,
  TrendingUp,
  UserCheck,
} from 'lucide-react'

const staffStats = [
  { label: "Today's departures", value: '42', note: '+5 from yesterday', icon: Plane },
  { label: "Today's arrivals", value: '38', note: '+3 from yesterday', icon: TrendingUp },
  { label: 'Passengers handled', value: '12,450', note: '85% checked in', icon: UserCheck },
  { label: 'Delayed flights', value: '3', note: '2 fewer than yesterday', icon: Clock3 },
]

const queue = [
  { flight: 'SK 401', route: 'LHR to JFK', time: '14:30', gate: 'A12', status: 'Boarding' },
  { flight: 'SK 205', route: 'LHR to CDG', time: '15:00', gate: 'B08', status: 'On time' },
  { flight: 'SK 712', route: 'LHR to DXB', time: '15:45', gate: 'C15', status: 'Delayed' },
]

const staffActions = [
  { title: 'Check-in passenger', detail: 'Verify documents and issue boarding pass.', icon: ClipboardCheck },
  { title: 'Search booking', detail: 'Look up reservation code or traveler record.', icon: Search },
  { title: 'Update gate', detail: 'Push operational changes to the flight board.', icon: Plane },
]

export function StaffPage() {
  return (
    <>
      <section className="page-heading">
        <span className="section-label">Airline staff dashboard</span>
        <h1>Frontline operations for airport and airline teams</h1>
        <p>
          Staff can monitor departures, handle check-ins, and keep the day-of-travel
          operation moving smoothly.
        </p>
      </section>

      <section className="metrics-strip">
        {staffStats.map(({ label, value, note, icon: Icon }) => (
          <article className="surface-card metric-card" key={label}>
            <Icon size={22} />
            <strong>{value}</strong>
            <div>{label}</div>
            <span className="subdued">{note}</span>
          </article>
        ))}
      </section>

      <section className="page-section section-grid">
        <article className="surface-card">
          <span className="section-label">Upcoming flights</span>
          <h2 className="section-title">Gate and turnaround focus</h2>
          <div className="booking-stack">
            {queue.map((item) => (
              <article className="flight-card" key={item.flight}>
                <div className="booking-row">
                  <div>
                    <h3>{item.flight}</h3>
                    <p className="muted-copy">{item.route}</p>
                  </div>
                  <div className="tag">{item.status}</div>
                </div>
                <ul className="detail-list">
                  <li>
                    <span>Departure</span>
                    <span>{item.time}</span>
                  </li>
                  <li>
                    <span>Gate</span>
                    <span>{item.gate}</span>
                  </li>
                </ul>
              </article>
            ))}
          </div>
        </article>

        <article className="surface-card">
          <span className="section-label">Quick actions</span>
          <h2 className="section-title">Common airline-staff tasks</h2>
          <div className="booking-stack">
            {staffActions.map(({ title, detail, icon: Icon }) => (
              <article className="deal-card" key={title}>
                <Icon size={20} />
                <h3>{title}</h3>
                <p className="muted-copy">{detail}</p>
              </article>
            ))}
          </div>
        </article>
      </section>
    </>
  )
}
