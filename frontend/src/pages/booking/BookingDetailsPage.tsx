// export { default } from '../../app/booking/details/page'
import { motion } from 'framer-motion'

import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/icon'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Footer } from '@/components/layout/footer'

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

export default function BookingDetailsPage() {
  return (
    <div className="bg-surface text-foreground min-h-screen">
      {/* Top Nav */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl shadow-[0_40px_60px_-15px_rgba(0,35,111,0.05)]"
      >
        <div className="flex justify-between items-center h-20 px-8 max-w-screen-2xl mx-auto">
          <Link to="/" className="text-2xl font-bold tracking-tight text-primary">SkyBooker</Link>
          <div className="hidden md:flex items-center gap-10">
            <Link to="/" className="text-muted-foreground font-medium hover:text-primary transition-colors">Explore</Link>
            <Link to="/deals" className="text-muted-foreground font-medium hover:text-primary transition-colors">Deals</Link>
            <Link to="/trips" className="text-primary font-semibold border-b-2 border-primary/40 pb-1">My Trips</Link>
            <Link to="/support" className="text-muted-foreground font-medium hover:text-primary transition-colors">Support</Link>
          </div>
          <div className="flex items-center gap-6">
            <Icon name="language" className="text-muted-foreground cursor-pointer" />
            <Icon name="payments" className="text-muted-foreground cursor-pointer" />
            <Button className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold">
              Sign In
            </Button>
          </div>
        </div>
      </motion.nav>

      <main className="pt-32 pb-20 px-8 max-w-screen-2xl mx-auto">
        {/* Header */}
        <motion.header
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="mb-12"
        >
          <div className="flex items-center gap-2 text-primary mb-4">
            <Icon name="arrow_back" className="text-sm" />
            <span className="text-sm font-bold tracking-widest uppercase">Flight London to Paris • EK204</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tighter text-primary mb-2">
            Personalize Your Journey
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
            Select your preferred seat and provide passenger information to complete your booking.
          </p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            {/* Seat Map Section */}
            <motion.section
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.1 }}
              className="bg-surface-container-lowest rounded-[2rem] p-8 lg:p-10 shadow-[0_40px_60px_-15px_rgba(0,35,111,0.03)]"
            >
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h2 className="text-2xl font-bold text-primary mb-1">Interactive Seat Map</h2>
                  <p className="text-muted-foreground text-sm">Select a seat for Passenger 1 (Adult)</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-surface-container-high" />
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-primary shadow-lg shadow-primary/20" />
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-slate-200" />
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Occupied</span>
                  </div>
                </div>
              </div>

              {/* Simplified Seat Grid Display */}
              <div className="bg-surface-container-low rounded-[2rem] p-8 lg:p-12">
                <div className="mx-auto max-w-md">
                  <div className="flex justify-between px-6 mb-8 text-muted-foreground font-black text-xs tracking-[0.4em]">
                    <span className="w-10 text-center">A</span>
                    <span className="w-10 text-center">B</span>
                    <span className="w-10 text-center" />
                    <span className="w-10 text-center">C</span>
                    <span className="w-10 text-center">D</span>
                  </div>
                  
                  {[1, 2, 3].map(row => (
                    <div key={row} className="flex justify-between items-center px-6 mb-4">
                      <div className="flex gap-3">
                        <div className={`w-10 h-10 rounded-md ${row === 1 ? 'bg-slate-200 cursor-not-allowed' : row === 2 && 'bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30'} ${row !== 1 && row !== 2 ? 'bg-surface-container-high hover:bg-primary-container hover:text-white transition-colors cursor-pointer' : ''}`}>
                          {row === 2 && <Icon name="check" className="text-sm" />}
                        </div>
                        <div className="w-10 h-10 rounded-md bg-surface-container-high hover:bg-primary-container hover:text-white transition-colors cursor-pointer" />
                      </div>
                      <div className="text-xs font-bold text-muted-foreground">{row.toString().padStart(2, '0')}</div>
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-md bg-surface-container-high hover:bg-primary-container hover:text-white transition-colors cursor-pointer" />
                        <div className={`w-10 h-10 rounded-md ${row === 1 ? 'bg-slate-200 cursor-not-allowed' : 'bg-surface-container-high hover:bg-primary-container hover:text-white transition-colors cursor-pointer'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.section>

            {/* Passenger Details Section */}
            <motion.section
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.2 }}
              className="bg-surface-container-lowest rounded-[2rem] p-8 lg:p-10 shadow-[0_40px_60px_-15px_rgba(0,35,111,0.03)]"
            >
              <h2 className="text-2xl font-bold text-primary mb-8">Passenger Details</h2>
              <form className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">First Name</label>
                    <Input
                      placeholder="e.g. Julian"
                      className="w-full h-14 px-6 bg-surface-container-low border-none rounded-[1rem] focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Last Name</label>
                    <Input
                      placeholder="e.g. Ashford"
                      className="w-full h-14 px-6 bg-surface-container-low border-none rounded-[1rem] focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Date of Birth</label>
                    <Input
                      type="date"
                      className="w-full h-14 px-6 bg-surface-container-low border-none rounded-[1rem] focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Passport Number</label>
                    <Input
                      placeholder="Enter passport ID"
                      className="w-full h-14 px-6 bg-surface-container-low border-none rounded-[1rem] focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
              </form>
            </motion.section>

            {/* Travel Add-ons Section */}
            <motion.section
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.3 }}
              className="bg-surface-container-lowest rounded-[2rem] p-8 lg:p-10 shadow-[0_40px_60px_-15px_rgba(0,35,111,0.03)]"
            >
              <h2 className="text-2xl font-bold text-primary mb-8">Travel Add-ons</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Meal Preference */}
                <div className="p-6 bg-surface-container-low rounded-[1.5rem] group hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 rounded-full bg-tertiary-container/10 flex items-center justify-center text-tertiary-container-foreground">
                      <Icon name="restaurant" />
                    </div>
                    <span className="text-xs font-bold text-tertiary-container">+ Included</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">Meal Preference</h3>
                  <Select defaultValue="standard">
                    <SelectTrigger className="w-full bg-transparent border-none p-0 text-muted-foreground font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard Meal (Non-Veg)</SelectItem>
                      <SelectItem value="vegetarian">Vegetarian Hindu Meal</SelectItem>
                      <SelectItem value="vegan">Vegan / Plant-Based</SelectItem>
                      <SelectItem value="gluten-free">Gluten-Free</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Extra Baggage */}
                <div className="p-6 bg-surface-container-low rounded-[1.5rem] group hover:bg-white hover:shadow-xl hover:shadow-primary/5 transition-all">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-12 h-12 rounded-full bg-primary-container/10 flex items-center justify-center text-primary">
                      <Icon name="luggage" />
                    </div>
                    <span className="text-xs font-bold text-primary">+ From $35</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">Extra Baggage</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full bg-white shadow-sm">
                      —
                    </Button>
                    <span className="font-bold text-primary">0 kg</span>
                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full bg-white shadow-sm">
                      +
                    </Button>
                  </div>
                </div>
              </div>
            </motion.section>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-32 space-y-6">
              {/* Fare Summary */}
              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.4 }}
                className="bg-white rounded-[2rem] p-8 shadow-[0_40px_60px_-15px_rgba(0,35,111,0.08)]"
              >
                <h3 className="text-xl font-bold text-primary mb-6">Fare Summary</h3>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Base Fare (1 Adult)</span>
                    <span className="font-bold text-primary">$420.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Selected Seat (02C)</span>
                    <span className="font-bold text-primary">$25.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground font-medium">Taxes & Fees</span>
                    <span className="font-bold text-primary">$48.50</span>
                  </div>
                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-primary font-bold">Total Amount</span>
                    <span className="text-3xl font-black text-primary tracking-tighter">$493.50</span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-5 bg-tertiary-container text-tertiary-container-foreground rounded-full font-bold text-lg hover:brightness-105 transition-all shadow-lg shadow-tertiary-container/20 flex items-center justify-center gap-3"
                >
                  Proceed to Payment
                  <Icon name="arrow_forward" />
                </motion.button>
                <p className="text-center text-[10px] text-muted-foreground mt-6 font-bold uppercase tracking-widest">
                  Secured by SkyBooker Pay
                </p>
              </motion.div>

              {/* Upgrade Banner */}
              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.5 }}
                className="relative rounded-[2rem] overflow-hidden h-48 group"
              >
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJlD1X1bUbOVcClVPIlJa-ANrIXUKGNuH6sDhYZZeYHrNJf8koj5JbwE9Yw2JDVxA-_c9Pc-qW6qR3hf2M0k6h664HTX0tQldYwLWJUmdAwmemY7qfD02QXeXxTxhazLxfoNmCDJMzcKu039DNm3zf25OOf_JxAkV3Zx5lKZuG0QUJFpr0jduD9FUVrj8enygaxbB9c5b_iV6lYlSK5wTUbORxppV3n4A9o6-ZCuQYgIbYsoElGTiL-GrNyjoxO9E-tCt9pP9sOJw"
                  alt="Luxury cabin interior"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex items-end p-6">
                  <div>
                    <h4 className="text-white font-bold">Upgrade to Business?</h4>
                    <p className="text-blue-100/80 text-sm">Experience true luxury from $199</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  )
}


