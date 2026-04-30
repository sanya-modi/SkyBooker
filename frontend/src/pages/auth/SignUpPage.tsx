import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { GoogleLogin } from '@react-oauth/google'
import { useState, useEffect } from 'react'
import { airlineApi, type Airline } from '@/services/api'
import { useAuth } from '@/context/auth-context'

export default function SignUpPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [airlines, setAirlines] = useState<Airline[]>([])
  const [airlinesLoading, setAirlinesLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: 'PASSENGER',
    airlineId: '',
  })

  useEffect(() => {
    airlineApi.getAll()
      .then(setAirlines)
      .catch(() => setAirlines([]))
      .finally(() => setAirlinesLoading(false))
  }, [])

  const handleGoogleSuccess = (credentialResponse: any) => {
    console.log('Google Sign Up Success:', credentialResponse)
    navigate('/')
  }

  const handleGoogleError = () => {
    setError('Google sign up failed. Please try again.')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        role: formData.role,
      }

      if (formData.role === 'AIRLINE_STAFF' && formData.airlineId) {
        payload.airlineId = parseInt(formData.airlineId)
      }

      await register(payload)
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl flex flex-col md:flex-row-reverse bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <section className="hidden md:flex w-1/2 relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-12 flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Icon name="flight_takeoff" className="text-white text-2xl" />
              </div>
              <span className="text-3xl font-bold text-white">SkyBooker</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              Start Your Adventure Today
            </h1>
            <p className="text-xl text-white/90 leading-relaxed mb-8">
              Join thousands of travelers who trust SkyBooker for seamless flight bookings and unforgettable journeys.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Icon name="check_circle" className="text-xl" />
                </div>
                <span>Best price guarantee</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Icon name="check_circle" className="text-xl" />
                </div>
                <span>24/7 customer support</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Icon name="check_circle" className="text-xl" />
                </div>
                <span>Instant booking confirmation</span>
              </div>
            </div>
          </div>
        </section>

        <section className="flex-1 p-8 md:p-12 flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto space-y-8">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
              <p className="text-gray-600">Start your journey with us</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="outline"
                  size="large"
                  text="signup_with"
                  shape="rectangular"
                  width="100%"
                />
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">Or sign up with email</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <Input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    placeholder="John"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <Input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    placeholder="Doe"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Icon name="mail" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Icon name="phone" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="1234567890"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Icon name="lock" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Type
                </label>
                <div className="relative">
                  <Icon name="badge" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" />
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value, airlineId: '' })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent appearance-none bg-white cursor-pointer"
                    required
                  >
                    <option value="PASSENGER">Passenger</option>
                    <option value="AIRLINE_STAFF">Airline Staff</option>
                  </select>
                  <Icon name="expand_more" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {formData.role === 'AIRLINE_STAFF' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Airline <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Icon name="flight" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10 pointer-events-none" />
                    <select
                      value={formData.airlineId}
                      onChange={(e) => setFormData({ ...formData, airlineId: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 border-2 border-sky-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-500 appearance-none bg-white cursor-pointer"
                      required
                      disabled={airlinesLoading}
                    >
                      <option value="">
                        {airlinesLoading ? 'Loading airlines...' : 'Choose an airline...'}
                      </option>
                      {airlines.map((airline) => (
                        <option key={airline.id} value={airline.id}>
                          {airline.name} ({airline.iataCode})
                        </option>
                      ))}
                    </select>
                    <Icon name="expand_more" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                  {!airlinesLoading && airlines.length === 0 && (
                    <p className="text-sm text-red-500 mt-2">Could not load airlines. Please refresh the page.</p>
                  )}
                  {!airlinesLoading && airlines.length > 0 && (
                    <p className="text-sm text-green-600 mt-2">{airlines.length} airlines available</p>
                  )}
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>

            <p className="text-center text-xs text-gray-500">
              By signing up, you agree to our{' '}
              <Link to="/terms" className="text-sky-600 hover:underline">Terms</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-sky-600 hover:underline">Privacy Policy</Link>
            </p>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/auth/signin" className="font-semibold text-sky-600 hover:text-sky-700">
                Sign In
              </Link>
            </p>
          </div>
        </section>
      </motion.main>
    </div>
  )
}
