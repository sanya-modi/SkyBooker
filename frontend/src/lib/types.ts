// Flight Types
export interface Flight {
  id: string
  flightNumber: string
  airline: string
  aircraft: string
  departure: {
    airport: string
    code: string
    time: string
    terminal?: string
    gate?: string
  }
  arrival: {
    airport: string
    code: string
    time: string
    terminal?: string
  }
  duration: string
  stops: number
  stopInfo?: string
  status: 'on-time' | 'delayed' | 'cancelled' | 'en-route' | 'completed'
  prices: {
    economy: number
    business: number
    first?: number
  }
}

export interface Passenger {
  id: string
  title: 'Mr' | 'Ms' | 'Mrs' | 'Dr'
  firstName: string
  lastName: string
  dateOfBirth: string
  passportNumber: string
  nationality: string
  type: 'adult' | 'child' | 'infant'
}

export interface Booking {
  id: string
  pnr: string
  flight: Flight
  passengers: Passenger[]
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  totalAmount: number
  createdAt: string
  seatAssignments?: string[]
  mealPreference?: string
  extraBaggage?: number
}

// Admin Types
export interface User {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  role: 'passenger' | 'staff' | 'admin'
  status: 'active' | 'suspended' | 'pending'
  memberSince: string
  loyaltyTier?: 'standard' | 'silver' | 'gold' | 'elite'
  milesBalance?: number
}

export interface Transaction {
  id: string
  type: 'payment' | 'refund'
  amount: number
  status: 'success' | 'pending' | 'failed' | 'refunded'
  method: string
  description: string
  date: string
}

export interface Reservation {
  id: string
  pnr: string
  passengerName: string
  email: string
  route: string
  flightCode: string
  amount: number
  status: 'confirmed' | 'pending' | 'cancelled'
  date: string
}

export interface AirlineEntity {
  id: string
  name: string
  code: string
  alliance?: string
  activeFleet: number
  dailyFlights: number
  isActive: boolean
}

export interface RouteMetric {
  route: string
  cities: string
  growth: number
  image?: string
}

export interface AuditLog {
  id: string
  action: string
  description: string
  timestamp: string
  icon: string
  severity: 'info' | 'warning' | 'error'
}
