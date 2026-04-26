import { CalendarDays, Plane, PlaneTakeoff, Search, UsersRound } from 'lucide-react'
import { useState } from 'react'
import type { SearchCriteria } from '../../context/booking-flow-context'
import type { Airport } from '../../services/api'
import { AirportAutocomplete } from './airport-autocomplete'
import { Button } from './button'

const MAX_PASSENGERS = 10

interface SearchFormProps {
  initialValue?: SearchCriteria | null
  loading?: boolean
  onSubmit: (search: SearchCriteria) => void
  onFromChange?: (airport: Airport | null) => void
  onToChange?: (airport: Airport | null) => void
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function SearchForm({ initialValue, loading = false, onSubmit, onFromChange, onToChange }: SearchFormProps) {
  const [tripType, setTripType] = useState<'roundtrip' | 'oneway'>(
    initialValue?.tripType ?? 'roundtrip',
  )
  const [fromAirport, setFromAirport] = useState<Airport | null>(initialValue?.fromAirport ?? null)
  const [toAirport, setToAirport] = useState<Airport | null>(initialValue?.toAirport ?? null)

  function handleFromChange(airport: Airport | null) {
    setFromAirport(airport)
    onFromChange?.(airport)
  }

  function handleToChange(airport: Airport | null) {
    setToAirport(airport)
    onToChange?.(airport)
  }
  const [departureDate, setDepartureDate] = useState(initialValue?.departureDate ?? '')
  const [returnDate, setReturnDate] = useState(initialValue?.returnDate ?? '')
  const [passengers, setPassengers] = useState(String(Math.min(initialValue?.passengers ?? 1, MAX_PASSENGERS)))
  const [directOnly, setDirectOnly] = useState(initialValue?.directOnly ?? true)
  const [error, setError] = useState('')
  const [passengerLimitError, setPassengerLimitError] = useState('')

  function handlePassengersChange(value: string) {
    if (value === '') {
      setPassengers('')
      setPassengerLimitError('')
      return
    }

    const digitsOnly = value.replace(/\D/g, '')
    if (!digitsOnly) {
      setPassengers('1')
      setPassengerLimitError('')
      return
    }

    const nextValue = Number(digitsOnly)
    if (nextValue > MAX_PASSENGERS) {
      setPassengers(String(MAX_PASSENGERS))
      setPassengerLimitError('Maximum 10 passengers allowed')
      return
    }

    setPassengers(String(Math.max(1, nextValue)))
    setPassengerLimitError('')
  }

  function validate() {
    if (!fromAirport || !toAirport) return 'Please choose both origin and destination airports.'
    if (fromAirport.id === toAirport.id) return 'Origin and destination must be different.'
    if (!departureDate) return 'Please choose a departure date.'
    if (departureDate < today()) return 'Departure date cannot be earlier than today.'
    if (tripType === 'roundtrip') {
      if (!returnDate) return 'Please choose a return date.'
      if (returnDate <= departureDate) return 'Return date must be after the departure date.'
    }
    return ''
  }

  function handleSubmit() {
    const validationMessage = validate()
    if (validationMessage) {
      setError(validationMessage)
      return
    }

    setError('')
    onSubmit({
      tripType,
      fromAirport,
      toAirport,
      departureDate,
      returnDate,
      passengers: Number(passengers) || 1,
      directOnly,
    })
  }

  return (
    <div className="landing-search">
      <div className="landing-filter-row">
        <div className="trip-tabs landing-tabs">
          <button className={tripType === 'roundtrip' ? 'selected' : ''} onClick={() => setTripType('roundtrip')} type="button">
            Round Trip
          </button>
          <button className={tripType === 'oneway' ? 'selected' : ''} onClick={() => setTripType('oneway')} type="button">
            One Way
          </button>
        </div>
        <label className="direct-check">
          <input checked={directOnly} onChange={(event) => setDirectOnly(event.target.checked)} type="checkbox" />
          Direct flights
        </label>
      </div>

      {error ? <div className="search-error">{error}</div> : null}
      {!error && passengerLimitError ? <div className="search-error">{passengerLimitError}</div> : null}

      <div className="landing-search-grid">
        <AirportAutocomplete
          icon={<PlaneTakeoff size={18} />}
          onSelect={handleFromChange}
          placeholder="From where?"
          selectedAirport={fromAirport}
        />
        <AirportAutocomplete
          icon={<Plane size={18} />}
          onSelect={handleToChange}
          placeholder="To where?"
          selectedAirport={toAirport}
        />
        <SearchInput
          icon={<CalendarDays size={18} />}
          min={today()}
          onChange={setDepartureDate}
          placeholder="Departure"
          type="date"
          value={departureDate}
        />
        {tripType === 'roundtrip' ? (
          <SearchInput
            icon={<CalendarDays size={18} />}
            min={departureDate || today()}
            onChange={setReturnDate}
            placeholder="Return"
            type="date"
            value={returnDate}
          />
        ) : (
          <div className="landing-input disabled-field">
            <CalendarDays size={18} />
            <span className="oneway-label">One-way trip</span>
          </div>
        )}
        <SearchInput
          icon={<UsersRound size={18} />}
          min="1"
          max={String(MAX_PASSENGERS)}
          onChange={handlePassengersChange}
          placeholder="Passengers"
          type="number"
          value={passengers}
        />
        <Button disabled={loading} size="lg" variant="success" onClick={handleSubmit}>
          {loading ? 'Searching...' : 'Find Tickets'} <Search size={18} />
        </Button>
      </div>
    </div>
  )
}

function SearchInput({
  icon,
  placeholder,
  value,
  onChange,
  type = 'text',
  min,
  max,
}: {
  icon: React.ReactNode
  placeholder: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'date' | 'number'
  min?: string
  max?: string
}) {
  return (
    <div className="landing-input">
      {icon}
      <input max={max} min={min} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} type={type} value={value} />
    </div>
  )
}
