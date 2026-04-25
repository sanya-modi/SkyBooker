// export { default } from '../../app/auth/forgot-password/page'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

import { Icon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function ForgotPasswordPage() {
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
              Explore the Ethereal Horizon
            </h2>
            <p className="text-base opacity-90 leading-relaxed max-w-md">
              {"Don't let a forgotten password stop your journey."}
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
              <Icon name="flight_takeoff" filled className="text-primary text-3xl" />
              <span className="text-2xl font-extrabold tracking-tighter text-primary">SkyBooker</span>
            </Link>
            <h1 className="text-4xl font-extrabold tracking-tighter text-foreground mb-2">Reset Password</h1>
            <p className="text-muted-foreground">
              {"Enter your email address and we'll send you a link to reset your password."}
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-5"
          >
            <div className="space-y-1.5">
              <label className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-muted-foreground ml-4">
                Email Address
              </label>
              <div className="relative group">
                <Icon name="alternate_email" className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground text-xl transition-colors group-focus-within:text-primary" />
                <Input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full pl-14 pr-6 py-6 bg-surface-container-low rounded-xl border-none focus:ring-2 focus:ring-primary/10 text-foreground placeholder:text-muted-foreground/40"
                />
              </div>
            </div>

            <div className="pt-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  className="w-full bg-tertiary-container text-tertiary-container-foreground font-bold py-6 rounded-xl shadow-lg shadow-tertiary-container/20 hover:brightness-110 flex items-center justify-center gap-3"
                >
                  Send Reset Link
                  <Icon name="arrow_forward" />
                </Button>
              </motion.div>
            </div>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <Link
              to="/auth/signin"
              className="text-primary font-bold hover:underline flex items-center justify-center gap-2 text-sm"
            >
              <Icon name="arrow_back" className="text-sm" />
              Back to Login
            </Link>
          </motion.div>
        </div>
      </motion.main>

      {/* Footer Links */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-8">
        <Link to="/help" className="text-muted-foreground hover:text-primary text-xs font-medium transition-colors">
          Help Center
        </Link>
        <Link to="/security" className="text-muted-foreground hover:text-primary text-xs font-medium transition-colors">
          Security
        </Link>
        <Link to="/accessibility" className="text-muted-foreground hover:text-primary text-xs font-medium transition-colors">
          Accessibility
        </Link>
      </div>
    </div>
  )
}

