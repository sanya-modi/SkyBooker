import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PaymentSummary } from '../src/components/booking/payment-summary'
import { FlightResultCard } from '../src/components/booking/flight-result-card'

vi.mock('gsap', () => ({
  gsap: {
    to: vi.fn(),
    fromTo: vi.fn(),
  },
}))

describe('PaymentSummary', () => {
  const mockFlight = {
    id: 1,
    flightNumber: 'DL123',
    aircraftType: 'Boeing 737',
    baseFare: 5000,
    departureTime: '2024-01-01T10:00:00',
    arrivalTime: '2024-01-01T12:00:00',
    airline: { id: 1, name: 'Delta', iataCode: 'DL' },
    departureAirport: { id: 1, name: 'JFK', iataCode: 'JFK', city: 'New York' },
    arrivalAirport: { id: 2, name: 'LAX', iataCode: 'LAX', city: 'Los Angeles' },
  } as any

  const mockOnAction = vi.fn()

  it('renders payment summary', () => {
    render(
      <PaymentSummary
        baggageCharge={0}
        buttonLabel="Continue"
        flight={mockFlight}
        mealCharge={0}
        onAction={mockOnAction}
        seatCharge={500}
        seatLabel="1A"
        taxes={600}
        total={6100}
      />
    )

    expect(screen.getByText('Your Flight')).toBeInTheDocument()
    expect(screen.getByText('Delta')).toBeInTheDocument()
  })

  it('displays fare breakdown', () => {
    render(
      <PaymentSummary
        baggageCharge={200}
        buttonLabel="Continue"
        flight={mockFlight}
        mealCharge={300}
        onAction={mockOnAction}
        seatCharge={500}
        seatLabel="1A"
        taxes={600}
        total={6600}
      />
    )

    expect(screen.getByText('Fare Breakdown')).toBeInTheDocument()
    expect(screen.getByText('Base Fare')).toBeInTheDocument()
    expect(screen.getByText('Taxes & Fees (12%)')).toBeInTheDocument()
    expect(screen.getByText(/Seat 1A/)).toBeInTheDocument()
    expect(screen.getByText('Meal')).toBeInTheDocument()
    expect(screen.getByText('Extra Baggage')).toBeInTheDocument()
  })

  it('shows total amount', () => {
    render(
      <PaymentSummary
        baggageCharge={0}
        buttonLabel="Continue"
        flight={mockFlight}
        mealCharge={0}
        onAction={mockOnAction}
        seatCharge={500}
        seatLabel="1A"
        taxes={600}
        total={6100}
      />
    )

    expect(screen.getByText('Total Amount')).toBeInTheDocument()
  })

  it('shows seat hold warning', () => {
    render(
      <PaymentSummary
        baggageCharge={0}
        buttonLabel="Continue"
        flight={mockFlight}
        mealCharge={0}
        onAction={mockOnAction}
        seatCharge={500}
        seatLabel="1A"
        taxes={600}
        total={6100}
      />
    )

    expect(screen.getByText(/Seat 1A held for 15 minutes/)).toBeInTheDocument()
  })

  it('calls onAction when button clicked', () => {
    render(
      <PaymentSummary
        baggageCharge={0}
        buttonLabel="Continue"
        flight={mockFlight}
        mealCharge={0}
        onAction={mockOnAction}
        seatCharge={500}
        seatLabel="1A"
        taxes={600}
        total={6100}
      />
    )

    const button = screen.getByText('Continue')
    fireEvent.click(button)
    expect(mockOnAction).toHaveBeenCalled()
  })

  it('shows loading state', () => {
    render(
      <PaymentSummary
        baggageCharge={0}
        buttonLabel="Continue"
        flight={mockFlight}
        loading
        mealCharge={0}
        onAction={mockOnAction}
        seatCharge={500}
        seatLabel="1A"
        taxes={600}
        total={6100}
      />
    )

    expect(screen.getByText('Processing…')).toBeInTheDocument()
  })

  it('disables button when loading', () => {
    render(
      <PaymentSummary
        baggageCharge={0}
        buttonLabel="Continue"
        flight={mockFlight}
        loading
        mealCharge={0}
        onAction={mockOnAction}
        seatCharge={500}
        seatLabel="1A"
        taxes={600}
        total={6100}
      />
    )

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('handles null flight', () => {
    render(
      <PaymentSummary
        baggageCharge={0}
        buttonLabel="Continue"
        flight={null}
        mealCharge={0}
        onAction={mockOnAction}
        seatCharge={0}
        seatLabel=""
        taxes={0}
        total={0}
      />
    )

    expect(screen.getByText('No flight selected')).toBeInTheDocument()
  })

  it('includes seat class in label', () => {
    render(
      <PaymentSummary
        baggageCharge={0}
        buttonLabel="Continue"
        flight={mockFlight}
        mealCharge={0}
        onAction={mockOnAction}
        seatCharge={500}
        seatClass="BUSINESS"
        seatLabel="1A"
        taxes={600}
        total={6100}
      />
    )

    expect(screen.getByText(/Seat 1A \(BUSINESS\)/)).toBeInTheDocument()
  })
})

describe('FlightResultCard', () => {
  const mockFlight = {
    id: 1,
    flightNumber: 'DL123',
    aircraftType: 'Boeing 737',
    baseFare: 5000,
    departureTime: '2024-01-01T10:00:00',
    arrivalTime: '2024-01-01T12:00:00',
    availableSeats: 50,
    status: 'ON_TIME',
    stopsLabel: 'Direct',
    airline: { id: 1, name: 'Delta', iataCode: 'DL' },
    departureAirport: { id: 1, name: 'JFK', iataCode: 'JFK', city: 'New York' },
    arrivalAirport: { id: 2, name: 'LAX', iataCode: 'LAX', city: 'Los Angeles' },
  } as any

  const mockOnSelect = vi.fn()

  it('renders flight card', () => {
    render(<FlightResultCard flight={mockFlight} onSelect={mockOnSelect} />)

    expect(screen.getByText('Delta')).toBeInTheDocument()
    expect(screen.getByText(/DL123/)).toBeInTheDocument()
  })

  it('displays route information', () => {
    render(<FlightResultCard flight={mockFlight} onSelect={mockOnSelect} />)

    expect(screen.getByText('JFK')).toBeInTheDocument()
    expect(screen.getByText('LAX')).toBeInTheDocument()
    expect(screen.getByText('New York')).toBeInTheDocument()
    expect(screen.getByText('Los Angeles')).toBeInTheDocument()
  })

  it('shows available seats', () => {
    render(<FlightResultCard flight={mockFlight} onSelect={mockOnSelect} />)

    expect(screen.getByText('50 seats available')).toBeInTheDocument()
  })

  it('shows low seats warning', () => {
    const lowSeatsFlight = { ...mockFlight, availableSeats: 5 }
    render(<FlightResultCard flight={lowSeatsFlight} onSelect={mockOnSelect} />)

    expect(screen.getByText(/Only 5 left!/)).toBeInTheDocument()
  })

  it('displays flight status', () => {
    render(<FlightResultCard flight={mockFlight} onSelect={mockOnSelect} />)

    expect(screen.getByText('ON TIME')).toBeInTheDocument()
  })

  it('shows delayed status', () => {
    const delayedFlight = { ...mockFlight, status: 'DELAYED' }
    render(<FlightResultCard flight={delayedFlight} onSelect={mockOnSelect} />)

    expect(screen.getByText('DELAYED')).toBeInTheDocument()
  })

  it('displays fare tiers', () => {
    render(<FlightResultCard flight={mockFlight} onSelect={mockOnSelect} />)

    expect(screen.getByText('Economy')).toBeInTheDocument()
    expect(screen.getByText('First Class')).toBeInTheDocument()
    expect(screen.getByText('Business')).toBeInTheDocument()
  })

  it('shows tier badges', () => {
    render(<FlightResultCard flight={mockFlight} onSelect={mockOnSelect} />)

    expect(screen.getByText('Popular')).toBeInTheDocument()
    expect(screen.getByText('Premium')).toBeInTheDocument()
  })

  it('calls onSelect when tier button clicked', () => {
    render(<FlightResultCard flight={mockFlight} onSelect={mockOnSelect} />)

    const selectButtons = screen.getAllByText('Select')
    fireEvent.click(selectButtons[0])
    expect(mockOnSelect).toHaveBeenCalledWith(mockFlight)
  })

  it('displays perks for each tier', () => {
    render(<FlightResultCard flight={mockFlight} onSelect={mockOnSelect} />)

    expect(screen.getByText('7 kg cabin bag')).toBeInTheDocument()
    expect(screen.getByText('Snacks included')).toBeInTheDocument()
    expect(screen.getByText('15 kg check-in')).toBeInTheDocument()
    expect(screen.getByText('Free date change')).toBeInTheDocument()
    expect(screen.getByText('Lounge access')).toBeInTheDocument()
    expect(screen.getByText('30 kg baggage')).toBeInTheDocument()
  })

  it('shows direct flight label', () => {
    render(<FlightResultCard flight={mockFlight} onSelect={mockOnSelect} />)

    expect(screen.getByText('Direct')).toBeInTheDocument()
  })
})
