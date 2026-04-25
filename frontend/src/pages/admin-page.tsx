import {
  ArrowUpRight,
  BarChart3,
  CreditCard,
  Database,
  PlaneTakeoff,
  Settings,
  ShieldCheck,
  Ticket,
  Users,
} from 'lucide-react'

const metrics = [
  { label: 'Gross booking value', value: '$4.2M', note: '+12.5% vs last month', icon: CreditCard },
  { label: 'Active passengers', value: '85,240', note: '8.2% monthly growth', icon: Users },
  { label: 'Live routes', value: '214', note: '19 routes added this quarter', icon: PlaneTakeoff },
  { label: 'Resolution SLA', value: '96.4%', note: 'Support cases within target', icon: ShieldCheck },
]

const routeLeaders = [
  { route: 'LHR to JFK', load: '92%', weekly: '2.4k bookings' },
  { route: 'DEL to DXB', load: '89%', weekly: '1.9k bookings' },
  { route: 'BOM to SIN', load: '84%', weekly: '1.3k bookings' },
]

const adminActions = [
  { title: 'User management', detail: 'Review role access, activity spikes, and account health.', icon: Users },
  { title: 'Bookings ledger', detail: 'Track fare mix, booking funnel completion, and refund pressure.', icon: Ticket },
  { title: 'Master data', detail: 'Control airport, airline, and route configuration sources.', icon: Database },
  { title: 'System tools', detail: 'Audit settings, feature flags, and platform incidents.', icon: Settings },
]

export function AdminPage() {
  return (
    <>
      <section className="page-heading">
        <span className="section-label">Admin dashboard</span>
        <h1>Platform analytics and operational control</h1>
        <p>
          A dedicated admin surface for revenue, user growth, route performance, and
          system-level actions.
        </p>
      </section>

      <section className="metrics-strip">
        {metrics.map(({ label, value, note, icon: Icon }) => (
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
          <span className="section-label">
            <BarChart3 size={14} />
            Route leaders
          </span>
          <h2 className="section-title">Busiest corridors on the network</h2>
          <ul className="detail-list">
            {routeLeaders.map((item) => (
              <li key={item.route}>
                <span>
                  <strong>{item.route}</strong>
                  <div className="subdued">{item.weekly}</div>
                </span>
                <span className="accent-text">{item.load} load factor</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="surface-card">
          <span className="section-label">Admin role</span>
          <h2 className="section-title">What this route is for</h2>
          <ul className="support-list">
            <li>
              <span>Who uses it</span>
              <span>Platform admins and operations leads</span>
            </li>
            <li>
              <span>Main goals</span>
              <span>Monitor performance and manage system-wide data</span>
            </li>
            <li>
              <span>Best on</span>
              <span>Desktop first, still readable on tablet/mobile</span>
            </li>
          </ul>
        </article>
      </section>

      <section className="page-section">
        <article className="surface-card">
          <span className="section-label">Quick actions</span>
          <h2 className="section-title">Admin workflows that should be easy to scan</h2>
          <div className="deals-grid">
            {adminActions.map(({ title, detail, icon: Icon }) => (
              <article className="deal-card" key={title}>
                <Icon size={22} />
                <h3>{title}</h3>
                <p className="muted-copy">{detail}</p>
                <div className="tag" style={{ marginTop: 14 }}>
                  Open module <ArrowUpRight size={14} />
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>
    </>
  )
}
