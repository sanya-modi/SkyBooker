import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import { defaultSearchState } from '../data/flights'
import type { Booking, SearchState } from '../types'

interface CreateBookingInput {
  travelerName: string
  email: string
  flightId: string
  fareId: string
  totalPrice: number
  departDate: string
}

interface BookingContextValue {
  bookings: Booking[]
  searchDraft: SearchState
  updateSearchDraft: (next: SearchState) => void
  createBooking: (input: CreateBookingInput) => Booking
}

const BOOKINGS_KEY = 'skybooker.bookings'
const SEARCH_KEY = 'skybooker.search'

const BookingContext = createContext<BookingContextValue | null>(null)

export function BookingProvider({ children }: PropsWithChildren) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [searchDraft, setSearchDraft] = useState<SearchState>(defaultSearchState)

  useEffect(() => {
    const storedBookings = localStorage.getItem(BOOKINGS_KEY)
    const storedSearch = localStorage.getItem(SEARCH_KEY)

    if (storedBookings) {
      setBookings(JSON.parse(storedBookings) as Booking[])
    }

    if (storedSearch) {
      setSearchDraft(JSON.parse(storedSearch) as SearchState)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings))
  }, [bookings])

  useEffect(() => {
    localStorage.setItem(SEARCH_KEY, JSON.stringify(searchDraft))
  }, [searchDraft])

  const value = useMemo<BookingContextValue>(
    () => ({
      bookings,
      searchDraft,
      updateSearchDraft: (next) => setSearchDraft(next),
      createBooking: (input) => {
        const booking: Booking = {
          id: crypto.randomUUID(),
          reservationCode: `SB${Math.floor(100000 + Math.random() * 900000)}`,
          travelerName: input.travelerName,
          email: input.email,
          flightId: input.flightId,
          fareId: input.fareId,
          totalPrice: input.totalPrice,
          departDate: input.departDate,
          bookedAt: new Date().toISOString(),
          status: 'Confirmed',
        }

        setBookings((current) => [booking, ...current])
        return booking
      },
    }),
    [bookings, searchDraft],
  )

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
}

export function useBookingContext() {
  const context = useContext(BookingContext)

  if (!context) {
    throw new Error('useBookingContext must be used inside BookingProvider')
  }

  return context
}
