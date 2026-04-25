import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { buildSearchParams, defaultSearchState } from '../data/flights'
import { useBookingContext } from '../context/booking-context'
import type { SearchState, TripType } from '../types'

interface FlightSearchFormProps {
  compact?: boolean
  initialValue?: SearchState
}

const tripTypes: { value: TripType; label: string }[] = [
  { value: 'round-trip', label: 'Round trip' },
  { value: 'one-way', label: 'One way' },
  { value: 'multi-city', label: 'Multi-city' },
]

export function FlightSearchForm({
  compact = false,
  initialValue,
}: FlightSearchFormProps) {
  const navigate = useNavigate()
  const { searchDraft, updateSearchDraft } = useBookingContext()
  const [form, setForm] = useState<SearchState>(initialValue ?? searchDraft ?? defaultSearchState)

  function updateField<K extends keyof SearchState>(field: K, value: SearchState[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    updateSearchDraft(form)
    navigate(`/flights?${buildSearchParams(form)}`)
  }

  return (
    <form className="search-card" onSubmit={handleSubmit}>
      <div className="inline-toggle" role="tablist" aria-label="Trip type">
        {tripTypes.map((item) => (
          <button
            key={item.value}
            type="button"
            className={`pill ${form.tripType === item.value ? 'pill--active' : ''}`}
            onClick={() => updateField('tripType', item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className={compact ? 'search-form__row--compact' : 'search-form__row'}>
        <div className="field">
          <label htmlFor="from">From</label>
          <input
            id="from"
            value={form.from}
            onChange={(event) => updateField('from', event.target.value)}
            placeholder="City or airport"
          />
        </div>

        <div className="field">
          <label htmlFor="to">To</label>
          <input
            id="to"
            value={form.to}
            onChange={(event) => updateField('to', event.target.value)}
            placeholder="City or airport"
          />
        </div>

        <div className="field">
          <label htmlFor="departDate">Depart</label>
          <input
            id="departDate"
            type="date"
            value={form.departDate}
            onChange={(event) => updateField('departDate', event.target.value)}
          />
        </div>

        {!compact && form.tripType !== 'one-way' ? (
          <div className="field">
            <label htmlFor="returnDate">Return</label>
            <input
              id="returnDate"
              type="date"
              value={form.returnDate}
              onChange={(event) => updateField('returnDate', event.target.value)}
            />
          </div>
        ) : null}

        <div className="field">
          <label htmlFor="passengers">Passengers</label>
          <select
            id="passengers"
            value={form.passengers}
            onChange={(event) => updateField('passengers', Number(event.target.value))}
          >
            {[1, 2, 3, 4, 5, 6].map((value) => (
              <option key={value} value={value}>
                {value} traveler{value > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="cabinClass">Cabin</label>
          <select
            id="cabinClass"
            value={form.cabinClass}
            onChange={(event) => updateField('cabinClass', event.target.value as SearchState['cabinClass'])}
          >
            <option>Economy</option>
            <option>Premium Economy</option>
            <option>Business</option>
          </select>
        </div>

        <button className="primary-button" type="submit">
          Search flights
        </button>
      </div>
    </form>
  )
}
