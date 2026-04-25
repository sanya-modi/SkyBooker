import { AuthForm } from '../../components/booking/auth-form'

export function AuthPage({ mode }: { mode: 'signin' | 'signup' }) {
  return <AuthForm mode={mode} />
}
