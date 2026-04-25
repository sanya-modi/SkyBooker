import { ArrowRight, LockKeyhole, Mail, ShieldCheck, User, UsersRound } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../context/auth-context'
import { Button } from './button'
import { Logo } from './logo'

type AuthMode = 'signup' | 'signin'
type SignupRole = 'PASSENGER' | 'ADMIN' | 'AIRLINE_STAFF'

const signupRoleOptions: Array<{ value: SignupRole; label: string }> = [
  { value: 'PASSENGER', label: 'Passenger' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'AIRLINE_STAFF', label: 'Airline Staff' },
]

const validationPatterns = {
  email: '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$',
  password: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,15}$',
  phoneNumber: '^(?:[0-9]{10}|\\+?[1-9]\\d{1,14})$',
} as const

export function AuthForm({ mode }: { mode: AuthMode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { login, register } = useAuth()
  const [fullName, setFullName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [role, setRole] = useState<SignupRole>('PASSENGER')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const isSignUp = mode === 'signup'

  const redirectFromState =
    typeof location.state === 'object' &&
    location.state !== null &&
    'from' in location.state &&
    typeof (location.state as { from?: string }).from === 'string'
      ? (location.state as { from: string }).from
      : null

  const redirectTarget = redirectFromState || searchParams.get('redirect') || '/'

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
        await register({ firstName, lastName, email, password, phoneNumber, role })
      } else {
        await login(email, password)
      }

      navigate(redirectTarget, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.')
    } finally {
      setSubmitting(false)
    }
  }

  function getFieldErrorMessage(field: string, value: string, validity: ValidityState) {
    const trimmedValue = value.trim()

    if (validity.valueMissing) {
      switch (field) {
        case 'fullName':
          return 'Please enter your full name.'
        case 'phoneNumber':
          return 'Please enter your phone number.'
        case 'email':
          return 'Please enter your email address.'
        case 'password':
          return 'Please enter your password.'
        case 'confirmPassword':
          return 'Please confirm your password.'
        default:
          return 'Please fill out this field.'
      }
    }

    if (field === 'email' && validity.patternMismatch) {
      return 'Please enter a valid email format (e.g., example@gmail.com).'
    }

    if (field === 'phoneNumber' && validity.patternMismatch) {
      return 'Phone number must be 10 digits (e.g., 9876543210).'
    }

    if (field === 'password' && validity.patternMismatch) {
      return 'Password must be 8-15 characters and include uppercase, lowercase, a number, and a special character.'
    }

    if (field === 'confirmPassword' && trimmedValue !== password.trim()) {
      return 'Passwords do not match. Please enter the same password again.'
    }

    return ''
  }

  function applyValidationMessage(
    event: React.FormEvent<HTMLInputElement>,
    field: 'fullName' | 'phoneNumber' | 'email' | 'password' | 'confirmPassword',
  ) {
    const input = event.currentTarget
    input.setCustomValidity(getFieldErrorMessage(field, input.value, input.validity))
  }

  function clearValidationMessage(event: React.FormEvent<HTMLInputElement>) {
    event.currentTarget.setCustomValidity('')
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
                    <AuthField
                      icon={<User size={20} />}
                      label="Full Name"
                      onChange={setFullName}
                      onInvalid={(event) => applyValidationMessage(event, 'fullName')}
                      onInput={clearValidationMessage}
                      value={fullName}
                    />
                    <AuthField
                      icon={<UsersRound size={20} />}
                      inputMode="numeric"
                      label="Phone Number"
                      onChange={setPhoneNumber}
                      onInvalid={(event) => applyValidationMessage(event, 'phoneNumber')}
                      onInput={clearValidationMessage}
                      pattern={validationPatterns.phoneNumber}
                      type="tel"
                      value={phoneNumber}
                    />
                    <AuthSelectField label="Role" onChange={setRole} options={signupRoleOptions} value={role} />
                  </>
                ) : null}
                <AuthField
                  icon={<Mail size={20} />}
                  label="Email Address"
                  onChange={setEmail}
                  onInvalid={(event) => applyValidationMessage(event, 'email')}
                  onInput={clearValidationMessage}
                  pattern={validationPatterns.email}
                  type="email"
                  value={email}
                />
                <AuthField
                  icon={<LockKeyhole size={20} />}
                  label="Password"
                  onChange={setPassword}
                  onInvalid={(event) => applyValidationMessage(event, 'password')}
                  onInput={clearValidationMessage}
                  pattern={validationPatterns.password}
                  type="password"
                  value={password}
                />
                {isSignUp ? (
                  <AuthField
                    icon={<ShieldCheck size={20} />}
                    label="Confirm Password"
                    onChange={setConfirm}
                    onInvalid={(event) => applyValidationMessage(event, 'confirmPassword')}
                    onInput={clearValidationMessage}
                    type="password"
                    value={confirm}
                  />
                ) : null}

                <Button className="auth-primary" disabled={submitting} size="lg" type="submit" variant="success">
                  {submitting ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
                  {!submitting ? <ArrowRight size={18} /> : null}
                </Button>
              </form>

              <p className="auth-redirect">
                {isSignUp ? (
                  <>
                    Already a member? <button onClick={() => navigate('/login', { state: redirectTarget !== '/' ? { from: redirectTarget } : undefined })} type="button">Sign In</button>
                  </>
                ) : (
                  <>
                    New to SkyBooker? <button onClick={() => navigate('/signup', { state: redirectTarget !== '/' ? { from: redirectTarget } : undefined })} type="button">Create an account</button>
                  </>
                )}
              </p>
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
  pattern,
  inputMode,
  onInvalid,
  onInput,
}: {
  label: string
  icon: React.ReactNode
  type?: string
  value: string
  onChange: (value: string) => void
  pattern?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  onInvalid?: (event: React.FormEvent<HTMLInputElement>) => void
  onInput?: (event: React.FormEvent<HTMLInputElement>) => void
}) {
  return (
    <label className="auth-field">
      <span>{label}</span>
      <div>
        {icon}
        <input
          inputMode={inputMode}
          onChange={(event) => onChange(event.target.value)}
          onInput={onInput}
          onInvalid={onInvalid}
          pattern={pattern}
          required
          type={type}
          value={value}
        />
      </div>
    </label>
  )
}

function AuthSelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: SignupRole) => void
  options: Array<{ value: SignupRole; label: string }>
}) {
  return (
    <label className="auth-field">
      <span>{label}</span>
      <div>
        <UsersRound size={20} />
        <select onChange={(event) => onChange(event.target.value as SignupRole)} required value={value}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </label>
  )
}
