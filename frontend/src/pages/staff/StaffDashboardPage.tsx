import { motion } from "framer-motion"
import { Icon } from "@/components/ui/icon"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/AuthContext"
import { useEffect, useState } from "react"
import { flightApi, airportApi, type FlightResult, type Airport } from "@/services/api"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 }
}

const staggerChildren = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

interface FlightDisplay {
  flight: string
  route: string
  time: string
  status: string
  statusColor: string
}

export default function StaffDashboard() {
  const { profile } = useAuth()
  const [onTimeFlights, setOnTimeFlights] = useState<FlightDisplay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOnTimeFlights = async () => {
      if (!profile?.airlineId) {
        setLoading(false)
        return
      }

      try {
        const allFlights = await flightApi.getByAirline(profile.airlineId)
        // Filter only ON_TIME flights
        const onTimeOnly = allFlights.filter((f: FlightResult) => f.status === 'ON_TIME')
        const airports = await airportApi.getAll()
        const airportMap = new Map(airports.map(a => [a.id, a]))

        const flightDisplays: FlightDisplay[] = onTimeOnly.map((flight: FlightResult) => {
          const depAirport = airportMap.get(flight.departureAirportId)
          const arrAirport = airportMap.get(flight.arrivalAirportId)
          const route = `${depAirport?.iataCode || 'N/A'} → ${arrAirport?.iataCode || 'N/A'}`
          const time = new Date(flight.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })

          return {
            flight: flight.flightNumber,
            route,
            time,
            status: 'On Time',
            statusColor: 'bg-sky-100 text-sky-700'
          }
        })

        setOnTimeFlights(flightDisplays)
      } catch (error) {
        console.error('Failed to fetch on-time flights:', error)
      } finally {
        setLoading(false)
      }
    }

    void fetchOnTimeFlights()
  }, [profile?.airlineId])

  const stats = [
    { icon: "flight_takeoff", label: "On-Time Flights", value: String(onTimeFlights.length), change: "Currently on schedule", color: "text-sky-primary" },
    { icon: "check_circle", label: "Flight Status", value: "100%", change: "All flights on time", color: "text-emerald-500" },
    { icon: "schedule", label: "Punctuality", value: "Excellent", change: "No delays reported", color: "text-amber-500" },
    { icon: "flight", label: "Active Flights", value: String(onTimeFlights.length), change: "Operating normally", color: "text-blue-500" },
  ]
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerChildren}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-sky-text">Staff Dashboard</h1>
          <p className="text-sky-text-light">Welcome back, Sarah. Here&apos;s your overview for today.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="border-sky-border">
            <Icon name="download" className="mr-2" />
            Export
          </Button>
          <Button className="bg-sky-primary hover:bg-sky-primary/90">
            <Icon name="add" className="mr-2" />
            New Booking
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color} bg-opacity-10`}>
                    <Icon name={stat.icon} className={`text-2xl ${stat.color}`} />
                  </div>
                  <Icon name="trending_up" className="text-emerald-500" />
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-bold text-sky-text">{stat.value}</p>
                  <p className="text-sm text-sky-text-light">{stat.label}</p>
                  <p className="text-xs text-sky-text-light mt-1">{stat.change}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* On-Time Flights */}
        <motion.div variants={fadeInUp} className="lg:col-span-2">
          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Icon name="schedule" className="text-sky-primary" />
                On-Time Flights
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-sky-text-light">Loading flights...</div>
              ) : onTimeFlights.length === 0 ? (
                <div className="text-center py-8 text-sky-text-light">No on-time flights available</div>
              ) : (
                <div className="space-y-4">
                  {onTimeFlights.map((flight, index) => (
                    <motion.div
                      key={flight.flight}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-sky-bg rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-sky-primary/10 rounded-lg flex items-center justify-center">
                          <Icon name="flight" className="text-sky-primary text-2xl" />
                        </div>
                        <div>
                          <p className="font-semibold text-sky-text">{flight.flight}</p>
                          <p className="text-sm text-sky-text-light">{flight.route}</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-sky-text">{flight.time}</p>
                      </div>
                      <Badge className={flight.statusColor}>{flight.status}</Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions & Stats */}
        <motion.div variants={fadeInUp} className="space-y-6">
          {/* Quick Actions */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="bolt" className="text-sky-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-sky-primary hover:bg-sky-primary/90">
                <Icon name="how_to_reg" className="mr-2" />
                Check-In Passenger
              </Button>
              <Button variant="outline" className="w-full justify-start border-sky-border">
                <Icon name="search" className="mr-2" />
                Search Booking
              </Button>
              <Button variant="outline" className="w-full justify-start border-sky-border">
                <Icon name="edit_calendar" className="mr-2" />
                Modify Flight
              </Button>
              <Button variant="outline" className="w-full justify-start border-sky-border">
                <Icon name="support_agent" className="mr-2" />
                Contact Support
              </Button>
            </CardContent>
          </Card>

          {/* Check-In Progress */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="donut_large" className="text-sky-primary" />
                Flight Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="text-center py-4 text-sky-text-light">Loading...</div>
              ) : onTimeFlights.length === 0 ? (
                <div className="text-center py-4 text-sky-text-light">No flights available</div>
              ) : (
                onTimeFlights.slice(0, 3).map((flight, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-sky-text-light">{flight.flight} - {flight.route}</span>
                      <span className="font-medium text-sky-text">On Time</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>


    </motion.div>
  )
}

