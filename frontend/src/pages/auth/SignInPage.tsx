import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { GoogleLogin } from '@react-oauth/google'
import { useState } from 'react'

export default function SignInPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleGoogleSuccess = (credentialResponse: any) => {
    console.log('Google Sign In Success:', credentialResponse)
    // TODO: Send credential to your backend
    // For now, just navigate to home
    navigate('/')
  }

  const handleGoogleError = () => {
    console.error('Google Sign In Failed')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Email Sign In:', { email, password })
    // TODO: Implement email/password authentication
    navigate('/')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50">
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl flex flex-col md:flex-row bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <section className="hidden md:flex w-1/2 relative bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-600 p-12 flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Icon name="flight_takeoff" className="text-white text-2xl" />
              </div>
              <span className="text-3xl font-bold text-white">SkyBooker</span>
            </div>
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              Welcome Back to Your Journey
            </h1>
            <p className="text-xl text-white/90 leading-relaxed">
              Sign in to access your bookings, explore new destinations, and manage your travel plans seamlessly.
            </p>
          </div>
          <div className="flex gap-8 text-white/80">
            <div>
              <div className="text-3xl font-bold">500K+</div>
              <div className="text-sm">Happy Travelers</div>
            </div>
            <div>
              <div className="text-3xl font-bold">1000+</div>
              <div className="text-sm">Destinations</div>
            </div>
            <div>
              <div className="text-3xl font-bold">4.9★</div>
              <div className="text-sm">User Rating</div>
            </div>
          </div>
        </section>

        <section className="flex-1 p-8 md:p-12 flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto space-y-8">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
              <p className="text-gray-600">Continue your journey with us</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                  theme="outline"
                  size="large"
                  text="signin_with"
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
                <span className="px-4 bg-white text-gray-500 font-medium">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Icon name="mail" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <Link to="/auth/forgot-password" className="text-sm font-medium text-sky-600 hover:text-sky-700">
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Icon name="lock" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Sign In
              </Button>
            </form>

            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/auth/signup" className="font-semibold text-sky-600 hover:text-sky-700">
                Sign Up
              </Link>
            </p>
          </div>
        </section>
      </motion.main>
    </div>
  )
}
