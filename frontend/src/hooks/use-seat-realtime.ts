import { useEffect, useState, useRef } from 'react'
import { seatApi, type SeatResult, type SeatCountUpdateEvent, type FlightAnalyticsEvent } from '../services/api'

export function useSeatRealtime(flightId: number | undefined) {
  const [seats, setSeats] = useState<SeatResult[]>([])
  const [seatCount, setSeatCount] = useState<SeatCountUpdateEvent | null>(null)
  const [analytics, setAnalytics] = useState<FlightAnalyticsEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!flightId) return

    let cancelled = false
    const eventSource = seatApi.createSeatStream(flightId)
    eventSourceRef.current = eventSource

    eventSource.addEventListener('seat-map', (event) => {
      if (cancelled) return
      try {
        const data = JSON.parse((event as MessageEvent).data)
        if (data?.seats) {
          setSeats(data.seats)
          setLoading(false)
        }
      } catch (err) {
        console.error('Failed to parse seat-map event:', err)
      }
    })

    eventSource.addEventListener('seat-count', (event) => {
      if (cancelled) return
      try {
        const data = JSON.parse((event as MessageEvent).data) as SeatCountUpdateEvent
        setSeatCount(data)
      } catch (err) {
        console.error('Failed to parse seat-count event:', err)
      }
    })

    eventSource.addEventListener('flight-analytics', (event) => {
      if (cancelled) return
      try {
        const data = JSON.parse((event as MessageEvent).data) as FlightAnalyticsEvent
        setAnalytics(data)
      } catch (err) {
        console.error('Failed to parse flight-analytics event:', err)
      }
    })

    eventSource.onerror = () => {
      if (!cancelled) {
        setLoading(false)
      }
      eventSource.close()
    }

    return () => {
      cancelled = true
      eventSource.close()
    }
  }, [flightId])

  return { seats, seatCount, analytics, loading }
}
