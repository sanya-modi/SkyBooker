import { motion } from 'framer-motion'
import { ArrowRight, MapPin } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/booking/button'
import { MobileDock } from '../../components/booking/mobile-dock'
import { SearchForm } from '../../components/booking/search-form'
import { TopNav } from '../../components/booking/top-nav'
import { useBookingFlow, type SearchCriteria } from '../../context/booking-flow-context'
import type { Airport } from '../../services/api'

export function LandingPage() {
  const navigate = useNavigate()
  const { resetFlow, searchCriteria, setSearchCriteria } = useBookingFlow()
  const [liveFrom, setLiveFrom] = useState<Airport | null>(searchCriteria?.fromAirport ?? null)
  const [liveTo, setLiveTo] = useState<Airport | null>(searchCriteria?.toAirport ?? null)

  function handleSearch(criteria: SearchCriteria) {
    resetFlow()
    setSearchCriteria(criteria)
    const params = new URLSearchParams({
      fromId: String(criteria.fromAirport?.id ?? ''),
      toId: String(criteria.toAirport?.id ?? ''),
      departureDate: criteria.departureDate,
      returnDate: criteria.returnDate,
      passengers: String(criteria.passengers),
      tripType: criteria.tripType,
      directOnly: String(criteria.directOnly),
    })
    navigate(`/results?${params.toString()}`)
  }

  const showRoute = liveFrom || liveTo

  return (
    <div className="app-shell">
      <TopNav />
      <motion.section className="landing-page pt-16" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
        <section className="landing-hero">
          <img
            alt=""
            className="landing-hero-image"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPS2xwbKWvOd7rMdBgEwd80nFjhioN5LMtUZZGEoYEHfcfgL9tg1wA388ih-O8a6xmXKrzK4418ydw1F8bj0mrBarDE_gBTgq3edXsXa5KvYW9VcxMcwzx58NQq-k4tGeHTd1E1WuI1fOEja5iJX2N-lcYpIBPCYB5SiYzwszEPWduGCjT3NZbnHODcJNag8rbQDgZ8T89JkE3UpPmCOQey5jEl8SbER92LSwgAHH36yTr_F-xdgLe4dLtsxlV1_qhpUJQKkJUlBs"
          />
          <div className="landing-hero-overlay" />
          <div className="landing-hero-copy">
            {showRoute ? (
              <motion.div
                key={`${liveFrom?.id}-${liveTo?.id}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="landing-route-display"
              >
                <AirportPin airport={liveFrom} placeholder="Origin" />
                <div className="landing-route-arrow">
                  <div className="landing-route-line" />
                  <ArrowRight size={22} strokeWidth={2.5} />
                  <div className="landing-route-line" />
                </div>
                <AirportPin airport={liveTo} placeholder="Destination" />
              </motion.div>
            ) : (
              <>
                <h1>Discover the world from the sky.</h1>
                <p>
                  Your journey starts here. Search live routes from the backend, compare fares,
                  and move through a cleaner booking flow.
                </p>
              </>
            )}
          </div>
          <SearchForm
            initialValue={searchCriteria}
            onSubmit={handleSearch}
            onFromChange={setLiveFrom}
            onToChange={setLiveTo}
          />
        </section>

        <section className="landing-promos" id="deals">
          <div className="landing-section-head">
            <div>
              <span className="section-kicker">Booking Flow</span>
              <h2>Search, compare, book, pay, confirm</h2>
            </div>
          </div>
          <div className="passenger-pillars">
            <div className="passenger-card">
              <h3>Validated search</h3>
              <p>Origin and destination checks, valid travel dates, and tighter form alignment.</p>
            </div>
            <div className="passenger-card">
              <h3>Live results</h3>
              <p>Flight cards now load from the backend and can be filtered by price, stops, and airline.</p>
            </div>
            <div className="passenger-card">
              <h3>Professional checkout</h3>
              <p>Passenger details, seat selection, payment summary, and confirmation are split into clear steps.</p>
              <Button onClick={() => navigate('/support')} variant="secondary">Need Help?</Button>
            </div>
          </div>
        </section>
      </motion.section>
      <MobileDock active="explore" />
    </div>
  )
}

function AirportPin({ airport, placeholder }: { airport: Airport | null; placeholder: string }) {
  return (
    <div className="landing-airport-pin">
      <div className="landing-airport-iata">
        {airport ? airport.iataCode : '---'}
      </div>
      <div className="landing-airport-info">
        <strong>{airport ? airport.city : placeholder}</strong>
        {airport && <span>{airport.name}</span>}
      </div>
      {airport && (
        <div className="landing-airport-country">
          <MapPin size={12} />
          {airport.country}
        </div>
      )}
    </div>
  )
}
