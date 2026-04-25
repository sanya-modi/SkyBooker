import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import type { Airport, BookingResult, EnrichedFlightResult } from '../services/api'

export interface SearchCriteria {
  tripType: 'roundtrip' | 'oneway'
  fromAirport: Airport | null
  toAirport: Airport | null
  departureDate: string
  returnDate: string
  passengers: number
  directOnly: boolean
}

export interface PassengerFormData {
  firstName: string
  lastName: string
  dateOfBirth: string
  passportNumber: string
  email: string
  phoneNumber: string
}

interface BookingFlowContextValue {
  searchCriteria: SearchCriteria | null
  selectedFlight: EnrichedFlightResult | null
  selectedSeatId: string
  passenger: PassengerFormData
  confirmedBooking: BookingResult | null
  selectedMealId: string
  selectedBaggageId: string
  setSearchCriteria: (value: SearchCriteria | null) => void
  setSelectedFlight: (value: EnrichedFlightResult | null) => void
  setSelectedSeatId: (value: string) => void
  updatePassenger: (value: PassengerFormData) => void
  setConfirmedBooking: (value: BookingResult | null) => void
  setSelectedMealId: (value: string) => void
  setSelectedBaggageId: (value: string) => void
  resetFlow: () => void
}

const STORAGE_KEY = 'skybooker.booking-flow'

const defaultPassenger: PassengerFormData = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  passportNumber: '',
  email: '',
  phoneNumber: '',
}

const BookingFlowContext = createContext<BookingFlowContextValue | null>(null)

export function BookingFlowProvider({ children }: PropsWithChildren) {
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria | null>(null)
  const [selectedFlight, setSelectedFlight] = useState<EnrichedFlightResult | null>(null)
  const [selectedSeatId, setSelectedSeatId] = useState('')
  const [passenger, updatePassenger] = useState<PassengerFormData>(defaultPassenger)
  const [confirmedBooking, setConfirmedBooking] = useState<BookingResult | null>(null)
  const [selectedMealId, setSelectedMealId] = useState('')
  const [selectedBaggageId, setSelectedBaggageId] = useState('')

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (!saved) return

    try {
      const parsed = JSON.parse(saved) as {
        searchCriteria: SearchCriteria | null
        selectedFlight: EnrichedFlightResult | null
        selectedSeatId: string
        passenger: PassengerFormData
        confirmedBooking: BookingResult | null
        selectedMealId?: string
        selectedBaggageId?: string
      }

      setSearchCriteria(parsed.searchCriteria)
      setSelectedFlight(parsed.selectedFlight)
      setSelectedSeatId(parsed.selectedSeatId)
      updatePassenger(parsed.passenger ?? defaultPassenger)
      setConfirmedBooking(parsed.confirmedBooking)
      setSelectedMealId(parsed.selectedMealId ?? '')
      setSelectedBaggageId(parsed.selectedBaggageId ?? '')
    } catch {
      sessionStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        searchCriteria,
        selectedFlight,
        selectedSeatId,
        passenger,
        confirmedBooking,
        selectedMealId,
        selectedBaggageId,
      }),
    )
  }, [confirmedBooking, passenger, searchCriteria, selectedFlight, selectedSeatId, selectedMealId, selectedBaggageId])

  const value = useMemo<BookingFlowContextValue>(
    () => ({
      searchCriteria,
      selectedFlight,
      selectedSeatId,
      passenger,
      confirmedBooking,
      selectedMealId,
      selectedBaggageId,
      setSearchCriteria,
      setSelectedFlight,
      setSelectedSeatId,
      updatePassenger,
      setConfirmedBooking,
      setSelectedMealId,
      setSelectedBaggageId,
      resetFlow: () => {
        setSelectedFlight(null)
        setSelectedSeatId('')
        updatePassenger(defaultPassenger)
        setConfirmedBooking(null)
        setSelectedMealId('')
        setSelectedBaggageId('')
      },
    }),
    [confirmedBooking, passenger, searchCriteria, selectedFlight, selectedSeatId, selectedMealId, selectedBaggageId],
  )

  return <BookingFlowContext.Provider value={value}>{children}</BookingFlowContext.Provider>
}

export function useBookingFlow() {
  const context = useContext(BookingFlowContext)
  if (!context) throw new Error('useBookingFlow must be used within BookingFlowProvider')
  return context
}
