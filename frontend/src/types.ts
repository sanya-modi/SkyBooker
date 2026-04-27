export type TripType = 'round-trip' | 'one-way' | 'multi-city'
export type CabinClass = 'Economy' | 'Premium Economy' | 'Business'

export interface SearchState {
  tripType: TripType
  from: string
  to: string
  departDate: string
  returnDate: string
  passengers: number
  cabinClass: CabinClass
}

export interface FareOption {
  id: string
  name: string
  cabinClass: CabinClass
  price: number
  carryOn: string
  checkedBag: string
  changePolicy: string
  refundable: boolean
}

export interface Flight {
  id: string
  airline: string
  airlineCode: string
  rating: number
  origin: string
  originCode: string
  destination: string
  destinationCode: string
  departureTime: string
  arrivalTime: string
  duration: string
  stops: string
  stopCount: number
  badge: string
  sustainabilityScore: number
  amenities: string[]
  price: number
  dates: string[]
  fareOptions: FareOption[]
}

export interface Booking {
  id: string
  reservationCode: string
  travelerName: string
  email: string
  flightId: string
  fareId: string
  bookedAt: string
  totalPrice: number
  departDate: string
  status: 'Confirmed'
  seatNumber?: string
}
