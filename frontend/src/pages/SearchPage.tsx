// export { default } from '../app/search/page'
import { motion } from 'framer-motion'

import { Link } from 'react-router-dom'
import { Icon } from '@/components/ui/icon'
import { Button } from '@/components/ui/button'
import { BottomNav } from '@/components/layout/bottom-nav'

const flights = [
  {
    id: 1,
    airline: 'Indigo Airways',
    code: '6E-2104',
    departure: '06:15',
    arrival: '13:30',
    origin: 'BOM',
    destination: 'LHR',
    duration: '9h 45m',
    stops: '1 Stop (DXB)',
    price: '₹42,850',
    featured: true,
    badge: 'Best Value',
  },
  {
    id: 2,
    airline: 'Air India',
    code: 'AI-129',
    departure: '14:00',
    arrival: '19:45',
    origin: 'BOM',
    destination: 'LHR',
    duration: '8h 15m',
    stops: 'Non-stop',
    price: '₹58,200',
    featured: false,
    nonStop: true,
  },
  {
    id: 3,
    airline: 'Emirates',
    code: 'EK-501',
    departure: '22:30',
    arrival: '06:30',
    origin: 'BOM',
    destination: 'LHR',
    duration: '10h 30m',
    stops: '1 Stop (DXB)',
    price: '₹64,900',
    featured: false,
  },
]

const filters = [
  { label: 'Filter', icon: 'tune', active: true },
  { label: 'Cheapest', active: false },
  { label: 'Non-stop', active: true, variant: 'tertiary' },
  { label: 'Airlines', active: false },
]

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

export default function SearchPage() {
  return (
    <div className="bg-surface text-foreground min-h-screen pb-32">
      {/* Top App Bar */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-50 glass-panel shadow-[0_4px_30px_rgba(0,0,0,0.04)]"
      >
        <div className="flex justify-between items-center w-full px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <Icon name="cloud" className="text-primary" />
            <span className="text-2xl font-black italic tracking-tighter text-primary">SkyBooker</span>
          </Link>
          <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-high ring-2 ring-primary/10">
            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvB_wtTvP8dAfZT8VDpmK-F-BwIaLug2IKDjv3MwUyUMGtet1d5c0I_7kXuLCxaPavVKSq6ACb5qAgt_DYFXDMko8ubnLg2Z-CnLkZLyy6QleSZVKa6LVn6NGPRj0Pt_n4-4YOcuok6leJS7bIRChNkqM4mY3joFmURfV1iSX0qF0Xze1xijI4OvWlXdWRcGKigEN59AKwK_o1dlFjOIbc95TlZp2Qhhy7J4YqKx8BLQyKmzu74c-Jr5oYQBuK5qDyJuNrd8bN4FY"
              alt="User profile"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="mt-24 px-6">
        {/* Route Summary Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-primary">
                Mumbai <span className="text-muted-foreground mx-2">→</span> London
              </h1>
              <p className="text-muted-foreground font-medium mt-1">
                15 Oct • 1 Adult • Economy
              </p>
            </div>
            <Button variant="ghost" size="icon" className="bg-surface-container-high rounded-full">
              <Icon name="edit" />
            </Button>
          </div>
        </motion.div>

        {/* Filter Chips */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-3 overflow-x-auto pb-4 -mx-6 px-6 hide-scrollbar"
        >
          {filters.map((filter, index) => (
            <Button
              key={index}
              variant={filter.active ? 'default' : 'outline'}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold shrink-0 ${
                filter.variant === 'tertiary'
                  ? 'bg-tertiary-container text-tertiary-container-foreground'
                  : filter.active
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'bg-surface-container-high text-muted-foreground hover:bg-surface-container-highest'
              }`}
            >
              {filter.icon && <Icon name={filter.icon} size="lg" />}
              <span className="text-sm">{filter.label}</span>
            </Button>
          ))}
        </motion.div>

        {/* Flight Cards List */}
        <div className="space-y-4 mt-4">
          {flights.map((flight, index) => (
            <motion.div
              key={flight.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-surface-container-lowest rounded-[2rem] p-6 shadow-[0_10px_40px_rgba(0,35,111,0.04)] relative overflow-hidden group"
            >
              {flight.badge && (
                <div className="absolute top-0 right-0 bg-primary-container text-primary-foreground px-4 py-1 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest">
                  {flight.badge}
                </div>
              )}

              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center">
                    <Icon name="flight_takeoff" className="text-primary text-3xl" />
                  </div>
                  <div>
                    <h3 className="font-bold text-primary">{flight.airline}</h3>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                      {flight.code}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-primary">{flight.price}</div>
                  <div className="text-[10px] text-muted-foreground font-medium">Per person</div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-foreground">{flight.departure}</span>
                  <span className="text-xs font-bold text-muted-foreground">{flight.origin}</span>
                </div>
                <div className="flex-1 flex flex-col items-center gap-1 relative">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {flight.duration}
                  </span>
                  <div className={`w-full h-[2px] relative ${flight.nonStop ? 'bg-tertiary/20' : 'bg-surface-container-highest'}`}>
                    <div className={`absolute -top-[3px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${flight.nonStop ? 'bg-tertiary' : 'bg-primary'} ring-4 ring-white`} />
                    {flight.nonStop && (
                      <>
                        <div className="absolute -top-[3px] left-0 w-2 h-2 rounded-full bg-tertiary" />
                        <div className="absolute -top-[3px] right-0 w-2 h-2 rounded-full bg-tertiary" />
                      </>
                    )}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${flight.nonStop ? 'text-tertiary-container-foreground' : 'text-primary'}`}>
                    {flight.stops}
                  </span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-xl font-bold text-foreground">{flight.arrival}</span>
                  <span className="text-xs font-bold text-muted-foreground">{flight.destination}</span>
                </div>
              </div>

              <Link to="/booking/seats">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-4 rounded-xl font-bold text-sm transition-all ${
                    flight.featured
                      ? 'bg-primary text-primary-foreground hover:opacity-90'
                      : 'bg-surface-container-high text-primary hover:bg-surface-container-highest'
                  }`}
                >
                  Select Flight
                </motion.button>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Promotional Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 rounded-[2rem] overflow-hidden relative aspect-[16/9] shadow-xl group"
        >
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6e44T5TrFGM_EODJlehI33HyyCQm1SZY27Ne-H2akmsp90Eq3w9FOJU9aO0P06Y_U1pkpy4sIUu9BB8f0KGAhpfYIlmsn0FRCRl2ZVtPLceh5G7YviDvfwtVIwfglzRkGD3LslWgE_kZBIUodTvbmhXZXEqXiCbEMG2Qetgv7ju8_Qlm_Fm0IX2rISbZU4BqHlRCYTaHF3Ewz7w3mweLzj7RiZZwWMvq1hbaMwzQNpfbtamLJ_FwbmWxFuXQdStkLtFirMsstPIo"
            alt="London skyline"
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 to-transparent flex flex-col justify-end p-6">
            <span className="bg-tertiary text-tertiary-foreground px-3 py-1 rounded-full text-[10px] font-black w-fit mb-2 uppercase tracking-widest">
              SkyMiles Exclusive
            </span>
            <h4 className="text-white text-xl font-bold">Earn 1,200 Bonus Miles</h4>
            <p className="text-white/80 text-xs mt-1">
              Book this route by Oct 12 to unlock premium lounge access in London.
            </p>
          </div>
        </motion.div>
      </main>

      <BottomNav />
    </div>
  )
}


