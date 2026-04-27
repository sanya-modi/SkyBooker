// export { default } from '../../app/flights/page'
import { useState } from "react"
import { Link, useNavigate } from 'react-router-dom'
import { CustomerHeader } from "@/components/layout/customer-header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { FlightCard } from "@/components/flights/flight-card"
import { Slider } from "@/components/ui/slider"
import type { Flight } from "@/lib/types"
import {
  Calendar,
  Check,
  X
} from "lucide-react"


const mockFlights: Flight[] = [
  {
    id: '1',
    flightNumber: 'BA005',
    airline: 'British Airways',
    aircraft: 'Boeing 787',
    departure: { airport: 'London Heathrow', code: 'LHR', time: '11:40' },
    arrival: { airport: 'Tokyo Haneda', code: 'HND', time: '09:30' },
    duration: '13h 50m',
    stops: 0,
    status: 'on-time',
    prices: { economy: 840, business: 2450, first: 5210 }
  },
  {
    id: '2',
    flightNumber: 'LH714',
    airline: 'Lufthansa',
    aircraft: 'Airbus A350',
    departure: { airport: 'London Heathrow', code: 'LHR', time: '06:15' },
    arrival: { airport: 'Tokyo Haneda', code: 'HND', time: '08:40' },
    duration: '16h 25m',
    stops: 1,
    stopInfo: 'FRA',
    status: 'on-time',
    prices: { economy: 620, business: 1850 }
  }
]

export default function FlightsPage() {
  const navigate = useNavigate()
  const [sortBy, setSortBy] = useState<'value' | 'cheapest' | 'fastest'>('value')
  const [priceRange, setPriceRange] = useState([400, 5000])
  const [selectedStops, setSelectedStops] = useState<number[]>([0, 1])
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>(['British Airways', 'Lufthansa'])

  const handleFlightSelect = (flight: Flight, fareClass: string) => {
    navigate(`/flights/${flight.id}/book?class=${fareClass}`)
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] pb-32 md:pb-20">
      <CustomerHeader />

      <main className="pt-24 md:pt-32 pb-20 px-4 md:px-8 max-w-screen-2xl mx-auto">
        {/* Search Info Summary */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#00236f] mb-2">
              London (LHR) to Tokyo (HND)
            </h1>
            <p className="text-slate-400 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Oct 24 - Oct 31 - 1 Passenger - Economy
            </p>
          </div>
          
          {/* Sorting Chips */}
          <div className="bg-[#f2f4f6] p-1.5 rounded-full flex gap-1 w-fit">
            {['value', 'cheapest', 'fastest'].map((sort) => (
              <button
                key={sort}
                onClick={() => setSortBy(sort as typeof sortBy)}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all capitalize ${
                  sortBy === sort 
                    ? 'bg-[#004b1e] text-white' 
                    : 'text-slate-500 hover:bg-[#e6e8ea]'
                }`}
              >
                {sort === 'value' ? 'Best Value' : sort}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:col-span-3 space-y-6">
            {/* Price Range */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm">
              <h2 className="text-xs font-bold tracking-[0.05em] uppercase text-slate-400 mb-6">
                Price Range
              </h2>
              <Slider
                min={400}
                max={5000}
                step={50}
                value={priceRange}
                onValueChange={setPriceRange}
                className="mb-4"
              />
              <div className="flex justify-between text-sm font-medium text-slate-600">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}+</span>
              </div>
            </div>

            {/* Stops */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm">
              <h2 className="text-xs font-bold tracking-[0.05em] uppercase text-slate-400 mb-6">
                Stops
              </h2>
              <div className="space-y-4">
                {[
                  { stops: 0, label: 'Non-stop', price: '$840' },
                  { stops: 1, label: '1 Stop', price: '$620' },
                  { stops: 2, label: '2+ Stops', price: '$510' }
                ].map(({ stops, label, price }) => (
                  <label key={stops} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox"
                      checked={selectedStops.includes(stops)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStops([...selectedStops, stops])
                        } else {
                          setSelectedStops(selectedStops.filter(s => s !== stops))
                        }
                      }}
                      className="w-5 h-5 rounded border-slate-200 text-[#00236f] focus:ring-[#00236f]/20"
                    />
                    <span className="text-sm font-medium group-hover:text-[#00236f] transition-colors">
                      {label}
                    </span>
                    <span className="ml-auto text-xs text-slate-400">{price}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Airlines */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm">
              <h2 className="text-xs font-bold tracking-[0.05em] uppercase text-slate-400 mb-6">
                Airlines
              </h2>
              <div className="space-y-3">
                {['British Airways', 'Japan Airlines', 'Lufthansa', 'Emirates'].map((airline) => (
                  <label key={airline} className="flex items-center gap-3 cursor-pointer group p-2 rounded-md hover:bg-[#f7f9fb] transition-colors">
                    <input 
                      type="checkbox"
                      checked={selectedAirlines.includes(airline)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedAirlines([...selectedAirlines, airline])
                        } else {
                          setSelectedAirlines(selectedAirlines.filter(a => a !== airline))
                        }
                      }}
                      className="w-4 h-4 rounded border-slate-200 text-[#00236f] focus:ring-[#00236f]/20"
                    />
                    <span className="text-sm font-medium text-slate-600 group-hover:text-[#00236f] transition-colors">
                      {airline}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Promo Card */}
            <div className="relative overflow-hidden rounded-2xl aspect-[4/5] flex flex-col justify-end p-6 hidden lg:flex">
              <div className="absolute inset-0 bg-gradient-to-br from-[#00236f] to-[#1e3a8a]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#00236f]/90 via-[#00236f]/20 to-transparent" />
              <div className="relative z-10">
                <span className="bg-[#004b1e] text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded mb-2 inline-block">
                  Member Deal
                </span>
                <h3 className="text-white text-xl font-bold mb-1">Save 15% on Tokyo Stays</h3>
                <p className="text-blue-100 text-sm mb-4">Book a flight+hotel package to unlock exclusive rates.</p>
                <button className="w-full bg-white text-[#00236f] font-bold py-3 rounded-xl text-sm">
                  Explore Bundles
                </button>
              </div>
            </div>
          </aside>

          {/* Flight List */}
          <div className="lg:col-span-9 space-y-6">
            {mockFlights.map((flight) => (
              <FlightCard 
                key={flight.id} 
                flight={flight} 
                onSelect={handleFlightSelect}
              />
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}


