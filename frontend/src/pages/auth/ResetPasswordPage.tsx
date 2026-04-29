import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { authApi } from '@/services/api'
import { PlaneTakeoff, Lock, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token.')
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    setIsSubmitting(true)
    setError('')
    try {
      await authApi.resetPassword({ token, newPassword: password })
      setSuccess(true)
      setTimeout(() => {
        navigate('/login')
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to reset password')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white min-h-screen flex items-center justify-center p-6">
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-6xl flex flex-col md:flex-row items-stretch ethereal-shadow-lg rounded-[2.5rem] overflow-hidden border border-outline-variant/30"
      >
        {/* Left Visual Anchor */}
        <div className="hidden md:block w-1/2 relative overflow-hidden">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2a-5R4AwaJPTUcbehVpXNQDkKUizDqIELtOaBHJY1bqIKx_Gk7IWxEC6Ioyq3paiK5GdC46gH8WUQGqeaTkNZMv1_m81aKULR1Ve8b4ITWDvg_9Q_uye7X7yABbyXr8746eX04x34j1S9aeLB8Fos3vVbk2CHjhCKOqQHoCG2NEaAa9qpmy28WoLaZTwI39niNJS8LRNpSyBc0ot3W5vvMHfW7f0OrkXCQbCp8tDkvMXwtyO6N5ea8xmhaXqYr1CNn9HTSPkJDIk"
            alt="Clouds aerial view"
            className="object-cover scale-110 hover:scale-100 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-16 left-16 right-16 text-white"
          >
            <span className="text-xs font-bold tracking-[0.2em] uppercase opacity-70 mb-4 block">
              SkyBooker Exclusive
            </span>
            <h2 className="text-4xl font-bold tracking-tighter leading-tight mb-6">
              Create a New Password
            </h2>
            <p className="text-base opacity-90 leading-relaxed max-w-md">
              Secure your account with a strong, unique password.
            </p>
          </motion.div>
        </div>

        {/* Right Content Canvas (Reset Form) */}
        <div className="flex-1 p-8 md:p-16 lg:px-20 bg-white flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Link to="/" className="flex items-center gap-2 mb-8">
              <PlaneTakeoff className="text-primary w-8 h-8" />
              <span className="text-2xl font-extrabold tracking-tighter text-primary">SkyBooker</span>
            </Link>
            <h1 className="text-4xl font-extrabold tracking-tighter text-foreground mb-2">New Password</h1>
            <p className="text-muted-foreground">
              Please enter your new password below.
            </p>
          </motion.div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-green-50 text-green-700 p-6 rounded-xl border border-green-200 text-center"
            >
              <CheckCircle2 className="w-10 h-10 mb-2 mx-auto" />
              <p className="font-bold">Password Reset Successful!</p>
              <p className="text-sm mt-1">You will be redirected to the login page momentarily.</p>
              <Button
                className="mt-4"
                onClick={() => navigate('/login')}
              >
                Go to Login
              </Button>
            </motion.div>
          ) : (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-5"
              onSubmit={handleSubmit}
            >
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 text-sm flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" /> {error}
                </div>
              )}
              
              <div className="space-y-1.5">
                <label className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-muted-foreground ml-4">
                  New Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 transition-colors group-focus-within:text-primary" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-14 pr-6 py-6 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-primary/10 text-foreground placeholder:text-muted-foreground/40"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-muted-foreground ml-4">
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 transition-colors group-focus-within:text-primary" />
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-14 pr-6 py-6 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-primary/10 text-foreground placeholder:text-muted-foreground/40"
                  />
                </div>
              </div>

              <div className="pt-4">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !token}
                    className="w-full bg-tertiary-container text-tertiary-container-foreground font-bold py-6 rounded-xl shadow-lg shadow-tertiary-container/20 hover:brightness-110 flex items-center justify-center gap-3 disabled:opacity-70"
                  >
                    {isSubmitting ? 'Resetting...' : 'Reset Password'}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </motion.div>
              </div>
            </motion.form>
          )}
        </div>
      </motion.main>
    </div>
  )
}
