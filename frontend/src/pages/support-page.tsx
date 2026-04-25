import { CircleHelp, MessageSquareMore, PhoneCall, ShieldQuestion } from 'lucide-react'

const supportItems = [
  {
    title: 'Trip changes',
    detail: 'Need to change dates or upgrade cabin? Use the reservation code from Bookings.',
    icon: CircleHelp,
  },
  {
    title: 'Live assistance',
    detail: '24/7 support channels for schedule changes, baggage issues, and payment questions.',
    icon: PhoneCall,
  },
  {
    title: 'Travel alerts',
    detail: 'Service notifications, airport rules, and documentation reminders before departure.',
    icon: ShieldQuestion,
  },
]

export function SupportPage() {
  return (
    <>
      <section className="page-heading">
        <span className="section-label">Support center</span>
        <h1>Help for changes, refunds, and travel questions</h1>
        <p>Set up like a real booking service support page with concise self-serve options.</p>
      </section>

      <section className="page-section support-grid">
        {supportItems.map(({ title, detail, icon: Icon }) => (
          <article className="support-card" key={title}>
            <Icon size={24} />
            <h3>{title}</h3>
            <p className="muted-copy">{detail}</p>
          </article>
        ))}
      </section>

      <section className="page-section section-grid">
        <article className="surface-card">
          <span className="section-label">
            <MessageSquareMore size={14} />
            Contact channels
          </span>
          <h2 className="section-title">How travelers can reach your team</h2>
          <ul className="support-list">
            <li>
              <span>Phone</span>
              <span>+1 800 555 SKYB</span>
            </li>
            <li>
              <span>Email</span>
              <span>help@skybooker-demo.com</span>
            </li>
            <li>
              <span>Chat</span>
              <span>Average response under 4 minutes</span>
            </li>
          </ul>
        </article>

        <article className="surface-card">
          <span className="section-label">Common questions</span>
          <h2 className="section-title">What this demo currently supports</h2>
          <ul className="support-list">
            <li>
              <span>Search and compare</span>
              <span>Yes</span>
            </li>
            <li>
              <span>Mock booking confirmation</span>
              <span>Yes</span>
            </li>
            <li>
              <span>Real payments or APIs</span>
              <span>No, this is UI/demo data</span>
            </li>
          </ul>
        </article>
      </section>
    </>
  )
}
