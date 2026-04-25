import { ArrowLeft, ArrowRight, LockKeyhole, Mail, ShieldCheck, User, UsersRound } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/auth-context'
import { Button } from './button'
import { Logo } from './logo'

type AuthMode = 'signup' | 'signin'

export function AuthForm({ mode }: { mode: AuthMode }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login, register } = useAuth()
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const isSignUp = mode === 'signup'

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      if (isSignUp) {
        if (password !== confirm) {
          throw new Error('Passwords do not match.')
        }

        const [firstName = 'Sky', ...rest] = fullName.trim().split(/\s+/)
        const lastName = rest.join(' ') || 'Traveler'
        await register({ firstName, lastName, email, password, phoneNumber })
      } else {
        await login(email, password)
      }

      navigate(searchParams.get('redirect') || '/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <section className="auth-visual">
          <img
            alt=""
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2a-5R4AwaJPTUcbehVpXNQDkKUizDqIELtOaBHJY1bqIKx_Gk7IWxEC6Ioyq3paiK5GdC46gH8WUQGqeaTkNZMv1_m81aKULR1Ve8b4ITWDvg_9Q_uye7X7yABbyXr8746eX04x34j1S9aeLB8Fos3vVbk2CHjhCKOqQHoCG2NEaAa9qpmy28WoLaZTwI39niNJS8LRNpSyBc0ot3W5vvMHfW7f0OrkXCQbCp8tDkvMXwtyO6N5ea8xmhaXqYr1CNn9HTSPkJDIk"
          />
          <div className="auth-visual-overlay" />
          <div className="auth-visual-copy">
            <span>SkyBooker Access</span>
            <h1>Continue your booking journey.</h1>
            <p>Sign in to move from flight selection to booking, payment, and confirmation.</p>
          </div>
        </section>
        <section className="auth-form-pane">
          <div className={isSignUp ? 'auth-form-wrap signup-auth' : 'auth-form-wrap'}>
            <Logo />
            <div className="auth-middle">
              <div className="auth-heading">
                <h1>{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
                <p>{isSignUp ? 'Join our travel community.' : 'Sign in to continue your booking.'}</p>
              </div>

              {error ? <div className="search-error">{error}</div> : null}

              <form className="auth-form" onSubmit={handleSubmit}>
                {isSignUp ? (
                  <>
                    <AuthField icon={<User size={20} />} label="Full Name" onChange={setFullName} value={fullName} />
                    <AuthField icon={<UsersRound size={20} />} label="Phone Number" onChange={setPhoneNumber} type="tel" value={phoneNumber} />
                  </>
                ) : null}
                <AuthField icon={<Mail size={20} />} label="Email Address" onChange={setEmail} type="email" value={email} />
                <AuthField icon={<LockKeyhole size={20} />} label="Password" onChange={setPassword} type="password" value={password} />
                {isSignUp ? (
                  <AuthField icon={<ShieldCheck size={20} />} label="Confirm Password" onChange={setConfirm} type="password" value={confirm} />
                ) : null}

                <Button className="auth-primary" disabled={submitting} size="lg" type="submit" variant="success">
                  {submitting ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
                  {!submitting ? <ArrowRight size={18} /> : null}
                </Button>
              </form>

              <p className="auth-redirect">
                {isSignUp ? (
                  <>
                    Already a member? <button onClick={() => navigate('/login')} type="button">Sign In</button>
                  </>
                ) : (
                  <>
                    New to SkyBooker? <button onClick={() => navigate('/signup')} type="button">Create an account</button>
                  </>
                )}
              </p>

              <button className="auth-guest" onClick={() => navigate('/')} type="button">
                <ArrowLeft size={15} /> Back to search
              </button>
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}

function AuthField({
  label,
  icon,
  type = 'text',
  value,
  onChange,
}: {
  label: string
  icon: React.ReactNode
  type?: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="auth-field">
      <span>{label}</span>
      <div>
        {icon}
        <input onChange={(event) => onChange(event.target.value)} required type={type} value={value} />
      </div>
    </label>
  )
}
