import {
  createContext,
  type Dispatch,
  type SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import type { Airport, BookingResult, EnrichedFlightResult } from '../services/api'

export type SeatClassPreference = 'ECONOMY' | 'BUSINESS' | 'FIRST'

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
  category: string
  gender: string
  passportNumber: string
  email: string
  phoneNumber: string
  mealPreference?: string
  mealPrice?: number
  baggagePreference?: string
  baggagePrice?: number
}

interface BookingFlowContextValue {
  searchCriteria: SearchCriteria | null
  selectedFlight: EnrichedFlightResult | null
  preferredSeatClass: SeatClassPreference | null
  selectedSeatIds: string[]
  selectedSeatId: string
  passengers: PassengerFormData[]
  passenger: PassengerFormData
  confirmedBooking: BookingResult | null
  setSearchCriteria: (value: SearchCriteria | null) => void
  setSelectedFlight: (value: EnrichedFlightResult | null) => void
  setPreferredSeatClass: (value: SeatClassPreference | null) => void
  setSelectedSeatIds: Dispatch<SetStateAction<string[]>>
  setSelectedSeatId: (value: string) => void
  updatePassenger: (value: PassengerFormData) => void
  updatePassengerAt: (index: number, value: PassengerFormData) => void
  setConfirmedBooking: (value: BookingResult | null) => void
  resetFlow: () => void
}

const STORAGE_KEY = 'skybooker.booking-flow'

const defaultPassenger: PassengerFormData = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  category: '',
  gender: '',
  passportNumber: '',
  email: '',
  phoneNumber: '',
}

const BookingFlowContext = createContext<BookingFlowContextValue | null>(null)

export function BookingFlowProvider({ children }: PropsWithChildren) {
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria | null>(null)
  const [selectedFlight, setSelectedFlight] = useState<EnrichedFlightResult | null>(null)
  const [preferredSeatClass, setPreferredSeatClass] = useState<SeatClassPreference | null>(null)
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([])
  const [passengers, setPassengers] = useState<PassengerFormData[]>([defaultPassenger])
  const [confirmedBooking, setConfirmedBooking] = useState<BookingResult | null>(null)
  
  const selectedSeatId = selectedSeatIds[0] ?? ''
  const passenger = passengers[0] ?? defaultPassenger

  function updatePassenger(value: PassengerFormData) {
    setPassengers((prev) => {
      const next = prev.length > 0 ? [...prev] : [{ ...defaultPassenger }]
      next[0] = value
      return next
    })
  }

  function updatePassengerAt(index: number, value: PassengerFormData) {
    setPassengers((prev) => {
      const next = [...prev]
      while (next.length <= index) next.push({ ...defaultPassenger })
      next[index] = value
      return next
    })
  }

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY)
    if (!saved) return

    try {
      const parsed = JSON.parse(saved) as {
        searchCriteria: SearchCriteria | null
        selectedFlight: EnrichedFlightResult | null
        preferredSeatClass?: SeatClassPreference | null
        selectedSeatIds?: string[]
        selectedSeatId?: string
        passengers?: PassengerFormData[]
        passenger?: PassengerFormData
        confirmedBooking: BookingResult | null
      }

      setSearchCriteria(parsed.searchCriteria)
      setSelectedFlight(parsed.selectedFlight)
      setPreferredSeatClass(parsed.preferredSeatClass ?? null)
      setSelectedSeatIds(parsed.selectedSeatIds ?? (parsed.selectedSeatId ? [parsed.selectedSeatId] : []))
      setPassengers(
        parsed.passengers?.length
          ? parsed.passengers.map((entry) => ({ ...defaultPassenger, ...entry }))
          : [parsed.passenger ? { ...defaultPassenger, ...parsed.passenger } : { ...defaultPassenger }],
      )
      setConfirmedBooking(parsed.confirmedBooking)
    } catch {
      sessionStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    setPassengers((prev) => {
      const required = Math.max(selectedSeatIds.length, 1)
      const next = prev.slice(0, required)
      while (next.length < required) next.push({ ...defaultPassenger })
      return next
    })
  }, [selectedSeatIds])

  useEffect(() => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        searchCriteria,
        selectedFlight,
        preferredSeatClass,
        selectedSeatIds,
        selectedSeatId,
        passengers,
        passenger,
        confirmedBooking,
      }),
    )
  }, [confirmedBooking, passenger, passengers, preferredSeatClass, searchCriteria, selectedFlight, selectedSeatId, selectedSeatIds])

  const value = useMemo<BookingFlowContextValue>(
    () => ({
      searchCriteria,
      selectedFlight,
      preferredSeatClass,
      selectedSeatIds,
      selectedSeatId,
      passengers,
      passenger,
      confirmedBooking,
      setSearchCriteria,
      setSelectedFlight,
      setPreferredSeatClass,
      setSelectedSeatIds,
      setSelectedSeatId: (value: string) => setSelectedSeatIds(value ? [value] : []),
      updatePassenger,
      updatePassengerAt,
      setConfirmedBooking,
      resetFlow: () => {
        setSearchCriteria(null)
        setSelectedFlight(null)
        setPreferredSeatClass(null)
        setSelectedSeatIds([])
        setPassengers([{ ...defaultPassenger }])
        setConfirmedBooking(null)
      },
    }),
    [confirmedBooking, passenger, passengers, preferredSeatClass, searchCriteria, selectedFlight, selectedSeatId, selectedSeatIds],
  )

  return <BookingFlowContext.Provider value={value}>{children}</BookingFlowContext.Provider>
}

export function useBookingFlow() {
  const context = useContext(BookingFlowContext)
  if (!context) throw new Error('useBookingFlow must be used within BookingFlowProvider')
  return context
}
