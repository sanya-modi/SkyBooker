import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <section className="page-heading">
      <span className="section-label">404</span>
      <h1>That route did not take off.</h1>
      <p>Use the main search flow to get back to active booking pages.</p>
      <Link className="primary-button" to="/">
        Return home
      </Link>
    </section>
  )
}
