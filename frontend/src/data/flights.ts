import type { Flight, SearchState } from '../types'

export const defaultSearchState: SearchState = {
  tripType: 'round-trip',
  departureAirport: null,
  arrivalAirport: null,
  departDate: '2026-05-18',
  returnDate: '2026-05-24',
  passengers: 1,
  cabinClass: 'Economy',
}



export function buildSearchParams(search: SearchState) {
  const params = new URLSearchParams()
  params.set('tripType', search.tripType)
  if (search.departureAirport) params.set('fromId', String(search.departureAirport.id))
  if (search.arrivalAirport) params.set('toId', String(search.arrivalAirport.id))
  params.set('departDate', search.departDate)
  params.set('returnDate', search.returnDate)
  params.set('passengers', String(search.passengers))
  params.set('cabinClass', search.cabinClass)

  return params.toString()
}
